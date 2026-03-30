const { createClient } = require('@supabase/supabase-js');
const { Resend } = require('resend');
const { corsCheck, applyRateLimit, sanitizeUUID, sanitizeString, sanitizeEmail, sanitizeNumber, setSecurityHeaders, alertError } = require('./_security');
const emails = require('./_emails');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const resend = new Resend(process.env.RESEND_API_KEY);

module.exports = async function handler(req, res) {
  setSecurityHeaders(res);
  if (!corsCheck(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!applyRateLimit(req, res, 10, 60000)) return;

  try {
    var body = req.body;
    var businessId = sanitizeUUID(body.businessId);
    var title = sanitizeString(body.title, 200) || 'Group Booking';
    var totalAmount = sanitizeNumber(body.totalAmount, 1, 100000);
    var totalParticipants = sanitizeNumber(body.totalParticipants, 2, 50);
    var organizerEmail = sanitizeEmail(body.organizerEmail);
    var organizerName = sanitizeString(body.organizerName, 100) || null;

    if (!businessId) return res.status(400).json({ error: 'Invalid businessId' });
    if (!totalAmount) return res.status(400).json({ error: 'Invalid amount (must be $1-$100,000)' });
    if (!totalParticipants) return res.status(400).json({ error: 'Invalid participant count (2-50)' });

    var bizResult = await supabase
      .from('businesses')
      .select('id, business_name, plan, splits_this_month')
      .eq('id', businessId)
      .single();

    if (!bizResult.data) return res.status(404).json({ error: 'Business not found' });
    var biz = bizResult.data;

    var limits = { starter: 10, growth: 50, pro: Infinity };
    var limit = limits[biz.plan || 'starter'] || 10;
    if ((biz.splits_this_month || 0) >= limit) {
      return res.status(403).json({ error: 'Split limit reached. Upgrade your plan.' });
    }

    var perPerson = Math.round(totalAmount / totalParticipants * 100) / 100;

    // Split expires in 7 days — after this, no new payments accepted
    var expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    var sessionResult = await supabase
      .from('booking_sessions')
      .insert({
        business_id: businessId,
        title: title,
        total_amount: totalAmount,
        per_person_amount: perPerson,
        total_participants: totalParticipants,
        paid_count: 0,
        status: 'pending',
        deadline: expiresAt,
        expires_at: expiresAt,
        metadata: {}
      })
      .select()
      .single();

    if (sessionResult.error) {
      alertError('create-split', sessionResult.error, req);
      console.error('Session insert error:', sessionResult.error);
      return res.status(500).json({ error: 'Failed to create session' });
    }

    var session = sessionResult.data;
    var siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sortora.com';
    var joinUrl = siteUrl + '/join.html?session=' + session.id;
    var organizerPayUrl = null;

    if (organizerEmail) {
      var insertResult = await supabase
        .from('participants')
        .insert({
          booking_session_id: session.id,
          email: organizerEmail,
          name: organizerName,
          amount: perPerson,
          status: 'pending'
        })
        .select('payment_token')
        .single();

      if (insertResult.data && insertResult.data.payment_token) {
        organizerPayUrl = siteUrl + '/pay.html?token=' + insertResult.data.payment_token;

        resend.emails.send({
          from: 'Sortora <noreply@sortora.com>',
          to: organizerEmail,
          subject: 'Pay your share \u2014 ' + title,
          html: emails.paymentLink({
            bookingTitle: title,
            businessName: biz.business_name,
            amount: perPerson.toFixed(2),
            totalAmount: totalAmount,
            totalParticipants: totalParticipants,
            payUrl: organizerPayUrl
          })
        }).catch(function(err) {
          console.error('Organizer payment link email failed:', err);
        });
      }
    }

    await supabase
      .from('businesses')
      .update({ splits_this_month: (biz.splits_this_month || 0) + 1 })
      .eq('id', businessId);

    
    // Track first_split_at activation milestone
    try {
      var { data: bizCheck } = await supabase.from('businesses').select('first_split_at').eq('id', businessId).single();
      if (bizCheck && !bizCheck.first_split_at) {
        await supabase.from('businesses').update({ first_split_at: new Date().toISOString() }).eq('id', businessId);
      }
    } catch (metricErr) { console.error('Activation metric error:', metricErr); }

    return res.status(200).json({
      success: true,
      sessionId: session.id,
      joinUrl: joinUrl,
      organizerPayUrl: organizerPayUrl,
      perPerson: perPerson,
      spotsTotal: totalParticipants,
      spotsFilled: organizerEmail ? 1 : 0,
      expiresAt: expiresAt
    });
  } catch (err) {
    alertError('create-split', err, req);
    console.error('Create-split error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
