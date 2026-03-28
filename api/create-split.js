const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    var body = req.body;
    var businessId = body.businessId;
    var title = body.title || 'Group Booking';
    var totalAmount = parseFloat(body.totalAmount);
    var totalParticipants = parseInt(body.totalParticipants);
    var organizerEmail = body.organizerEmail;
    var organizerName = body.organizerName || null;
    var metadata = body.metadata || {};

    if (!businessId || !totalAmount || !totalParticipants || totalParticipants < 2) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Verify business exists
    var bizResult = await supabase
      .from('businesses')
      .select('id, business_name, plan, splits_this_month')
      .eq('id', businessId)
      .single();

    if (!bizResult.data) return res.status(404).json({ error: 'Business not found' });
    var biz = bizResult.data;

    // Check plan limits
    var limits = { starter: 10, growth: 50, pro: Infinity };
    var limit = limits[biz.plan || 'starter'] || 10;
    if ((biz.splits_this_month || 0) >= limit) {
      return res.status(403).json({ error: 'Split limit reached. Upgrade your plan.' });
    }

    var perPerson = Math.round(totalAmount / totalParticipants * 100) / 100;

    // Create booking session
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
        metadata: metadata
      })
      .select()
      .single();

    if (sessionResult.error) {
      console.error('Session insert error:', sessionResult.error);
      return res.status(500).json({ error: 'Failed to create session' });
    }

    var session = sessionResult.data;

    // Add organizer as first participant if email provided
    if (organizerEmail) {
      await supabase.from('participants').insert({
        booking_session_id: session.id,
        email: organizerEmail,
        name: organizerName,
        amount: perPerson,
        status: 'pending'
      });
    }

    // Increment splits count
    await supabase
      .from('businesses')
      .update({ splits_this_month: (biz.splits_this_month || 0) + 1 })
      .eq('id', businessId);

    // Build shareable link
    var siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sortora.vercel.app';
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
    return res.status(500).json({ error: err.message });
  }
};
