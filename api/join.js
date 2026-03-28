const { createClient } = require('@supabase/supabase-js');
const { corsCheck, applyRateLimit, sanitizeUUID, sanitizeString, sanitizeEmail, setSecurityHeaders, alertError } = require('./_security');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

module.exports = async function handler(req, res) {
  setSecurityHeaders(res);
  if (!corsCheck(req, res)) return;

  if (req.method === 'GET') {
    if (!applyRateLimit(req, res, 30, 60000)) return;

    try {
      var sessionId = sanitizeUUID(req.query.session);
      if (!sessionId) return res.status(400).json({ error: 'Invalid session ID' });

      var sessionResult = await supabase
        .from('booking_sessions')
        .select('id, title, total_amount, per_person_amount, total_participants, paid_count, status, deadline, businesses(business_name)')
        .eq('id', sessionId)
        .single();

      if (!sessionResult.data) return res.status(404).json({ error: 'Split not found' });
      var session = sessionResult.data;

      var partsResult = await supabase
        .from('participants')
        .select('id, name, email, status, paid_at')
        .eq('booking_session_id', sessionId)
        .order('created_at', { ascending: true });

      var participants = (partsResult.data || []).map(function(p) {
        return {
          id: p.id,
          name: p.name || null,
          email: p.email ? p.email.substring(0, 3) + '***@' + p.email.split('@')[1] : null,
          status: p.status,
          paid_at: p.paid_at
        };
      });

      return res.status(200).json({
        session: {
          id: session.id,
          title: session.title,
          totalAmount: session.total_amount,
          perPerson: session.per_person_amount,
          totalSpots: session.total_participants,
          filledSpots: participants.length,
          paidCount: session.paid_count,
          status: session.status,
          deadline: session.deadline,
          businessName: session.businesses && session.businesses.business_name || 'Business'
        },
        participants: participants
      });
    } catch (err) {
      alertError('join', err, req);
    console.error('Join GET error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  if (req.method === 'POST') {
    if (!applyRateLimit(req, res, 10, 60000)) return;

    try {
      var body = req.body;
      var sessionId = sanitizeUUID(body.sessionId);
      var name = sanitizeString(body.name, 100);
      var email = sanitizeEmail(body.email);

      if (!sessionId) return res.status(400).json({ error: 'Invalid session ID' });
      if (!name) return res.status(400).json({ error: 'Name is required' });
      if (!email) return res.status(400).json({ error: 'Valid email is required' });

      var sessionResult = await supabase
        .from('booking_sessions')
        .select('id, total_participants, per_person_amount, status')
        .eq('id', sessionId)
        .single();

      if (!sessionResult.data) return res.status(404).json({ error: 'Split not found' });
      var session = sessionResult.data;

      if (session.status === 'expired') return res.status(400).json({ error: 'This split has expired' });
      if (session.status === 'confirmed') return res.status(400).json({ error: 'This booking is already confirmed' });

      var countResult = await supabase
        .from('participants')
        .select('id, email')
        .eq('booking_session_id', sessionId);

      var existing = countResult.data || [];
      if (existing.length >= session.total_participants) {
        return res.status(400).json({ error: 'All spots are filled' });
      }

      var alreadyJoined = existing.find(function(p) { return p.email === email; });
      if (alreadyJoined) {
        var tokenResult = await supabase
          .from('participants')
          .select('payment_token')
          .eq('id', alreadyJoined.id)
          .single();

        var siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sortora.com';
        return res.status(200).json({
          success: true,
          alreadyJoined: true,
          payUrl: siteUrl + '/pay.html?token=' + tokenResult.data.payment_token
        });
      }

      var insertResult = await supabase
        .from('participants')
        .insert({
          booking_session_id: sessionId,
          email: email,
          name: name,
          amount: session.per_person_amount,
          status: 'pending'
        })
        .select()
        .single();

      if (insertResult.error) {
        alertError('join', err, req);
    console.error('Join insert error:', insertResult.error);
        return res.status(500).json({ error: 'Failed to join split' });
      }

      var siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sortora.com';
      return res.status(200).json({
        success: true,
        payUrl: siteUrl + '/pay.html?token=' + insertResult.data.payment_token,
        spotsLeft: session.total_participants - existing.length - 1
      });
    } catch (err) {
      alertError('join', err, req);
    console.error('Join POST error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
