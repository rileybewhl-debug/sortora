const { createClient } = require('@supabase/supabase-js');
const { Resend } = require('resend');
const { corsCheck, applyRateLimit, sanitizeUUID, sanitizeString, sanitizeEmail, sanitizeNumber, setSecurityHeaders } = require('./_security');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
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
        html: buildPaymentEmail({
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
    console.error('Split error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

function buildPaymentEmail(data) {
  return '<!DOCTYPE html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head><body style="margin:0;padding:0;background:#f7f8fa;font-family:-apple-system,BlinkMacSystemFont,sans-serif"><div style="max-width:480px;margin:0 auto;padding:40px 20px"><div style="background:#fff;border-radius:16px;overflow:hidden;border:1px solid #EBEBEB;box-shadow:0 4px 24px rgba(0,0,0,.06)"><div style="padding:28px 32px;border-bottom:1px solid #f0f0f0"><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#3B6BFF;margin-bottom:8px">You\'ve been invited to split a booking</div><div style="font-size:20px;font-weight:800;color:#0C1220">' + data.bookingTitle + '</div><div style="font-size:14px;color:#6a6a6a;margin-top:4px">Hosted by ' + data.businessName + '</div></div><div style="padding:28px 32px;background:#fafbff;border-bottom:1px solid #f0f0f0"><div style="font-size:13px;font-weight:600;color:#6a6a6a;margin-bottom:4px">Your share</div><div style="font-size:40px;font-weight:800;color:#0C1220">$' + data.amount + '</div><div style="font-size:14px;color:#6a6a6a;margin-top:4px">$' + parseFloat(data.totalAmount).toFixed(0) + ' total · split ' + data.totalParticipants + ' ways</div></div><div style="padding:28px 32px;text-align:center"><a href="' + data.payUrl + '" style="display:inline-block;padding:16px 48px;background:#3B6BFF;color:#fff;border-radius:12px;font-size:17px;font-weight:700;text-decoration:none">Pay $' + data.amount + '</a><div style="margin-top:12px;font-size:12px;color:#b0b0b0">Secure payment powered by Stripe</div></div></div><div style="text-align:center;margin-top:20px;font-size:12px;color:#b0b0b0">Powered by <a href="https://sortora.com" style="color:#6a6a6a;font-weight:700;text-decoration:none">Sortora</a></div></div></body></html>';
}
