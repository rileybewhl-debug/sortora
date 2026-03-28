const { createClient } = require('@supabase/supabase-js');
const { corsCheck, applyRateLimit, sanitizeUUID, sanitizeString, sanitizeEmail, sanitizeNumber, setSecurityHeaders } = require('./_security');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

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
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        metadata: {}
      })
      .select()
      .single();

    if (sessionResult.error) {
      console.error('Session insert error:', sessionResult.error);
      return res.status(500).json({ error: 'Failed to create session' });
    }

    var session = sessionResult.data;

    if (organizerEmail) {
      await supabase.from('participants').insert({
        booking_session_id: session.id,
        email: organizerEmail,
        name: organizerName,
        amount: perPerson,
        status: 'pending'
      });
    }

    await supabase
      .from('businesses')
      .update({ splits_this_month: (biz.splits_this_month || 0) + 1 })
      .eq('id', businessId);

    var siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sortora.com';
    var joinUrl = siteUrl + '/join.html?session=' + session.id;

    return res.status(200).json({
      success: true,
      sessionId: session.id,
      joinUrl: joinUrl,
      perPerson: perPerson,
      spotsTotal: totalParticipants,
      spotsFilled: organizerEmail ? 1 : 0
    });
  } catch (err) {
    console.error('Create-split error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
