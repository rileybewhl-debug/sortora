const { createClient } = require('@supabase/supabase-js');
const { Resend } = require('resend');
const { corsCheck, applyRateLimit, sanitizeUUID, sanitizeString, sanitizeEmail, sanitizeNumber, setSecurityHeaders, alertError } = require('./_security');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const emails = require('./_emails');
const resend = new Resend(process.env.RESEND_API_KEY);

module.exports = async function handler(req, res) {
  setSecurityHeaders(res);
  if (!corsCheck(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!applyRateLimit(req, res, 5, 60000)) return;

  try {
    var body = req.body;
    var businessId = sanitizeUUID(body.businessId);
    var title = sanitizeString(body.title, 200) || 'Group Booking';
    var totalAmount = sanitizeNumber(body.totalAmount, 1, 100000);
    var participants = body.participants;

    if (!businessId) return res.status(400).json({ error: 'Invalid businessId' });
    if (!totalAmount) return res.status(400).json({ error: 'Invalid amount' });
    if (!Array.isArray(participants) || participants.length < 2 || participants.length > 50) {
      return res.status(400).json({ error: 'Need 2-50 participants' });
    }

    // Sanitize each participant
    var cleanParticipants = participants.map(function(p) {
      return { email: sanitizeEmail(p.email), name: sanitizeString(p.name, 100) };
    }).filter(function(p) { return p.email; });

    if (cleanParticipants.length < 2) return res.status(400).json({ error: 'Need at least 2 valid emails' });

    var { data: biz } = await supabase
      .from('businesses')
      .select('id, business_name, plan, splits_this_month')
      .eq('id', businessId)
      .single();

    if (!biz) return res.status(404).json({ error: 'Business not found' });

    var limits = { starter: 10, growth: 50, pro: Infinity };
    var limit = limits[biz.plan || 'starter'] || 10;
    if ((biz.splits_this_month || 0) >= limit) {
      return res.status(403).json({ error: 'Split limit reached. Upgrade your plan.' });
    }

    var perPersonAmount = body.perPersonAmount || (totalAmount / cleanParticipants.length);

    var { data: session, error: sessionErr } = await supabase
      .from('booking_sessions')
      .insert({
        business_id: businessId,
        title: title,
        total_amount: totalAmount,
        per_person_amount: perPersonAmount,
        total_participants: cleanParticipants.length,
        paid_count: 0,
        status: 'pending',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        metadata: {}
      })
      .select()
      .single();

    if (sessionErr) {
      alertError('split', err, req);
    console.error('Session insert error:', sessionErr);
      return res.status(500).json({ error: 'Failed to create session' });
    }

    var participantRows = cleanParticipants.map(function(p) {
      return {
        booking_session_id: session.id,
        email: p.email,
        name: p.name || null,
        amount: perPersonAmount,
        status: 'pending'
      };
    });

    var { data: parts, error: partsErr } = await supabase
      .from('participants')
      .insert(participantRows)
      .select();

    if (partsErr) {
      alertError('split', err, req);
    console.error('Participants insert error:', partsErr);
      return res.status(500).json({ error: 'Failed to create participants' });
    }

    await supabase
      .from('businesses')
      .update({ splits_this_month: (biz.splits_this_month || 0) + 1 })
      .eq('id', businessId);

    var siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sortora.com';
    var amount = perPersonAmount.toFixed(2);

    var emailPromises = parts.map(function(p) {
      return resend.emails.send({
        from: 'Sortora <noreply@sortora.com>',
        to: p.email,
        subject: 'Pay your share — ' + title + ' ($' + amount + ')',
        html: emails.paymentLink({
          businessName: biz.business_name,
          bookingTitle: title,
          amount: amount,
          payUrl: siteUrl + '/pay.html?token=' + p.payment_token,
          totalParticipants: cleanParticipants.length,
          totalAmount: totalAmount
        })
      }).catch(function(err) {
        console.error('Email failed for ' + p.email + ':', err);
        return null;
      });
    });

    await Promise.all(emailPromises);

    return res.status(200).json({
      success: true,
      sessionId: session.id,
      participantCount: parts.length
    });
  } catch (err) {
    alertError('split', err, req);
    console.error('Split error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
