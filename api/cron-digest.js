const { Resend } = require('resend');
const { createClient } = require('@supabase/supabase-js');
const { setSecurityHeaders, alertError } = require('./_security');
const emails = require('./_emails');

const resend = new Resend(process.env.RESEND_API_KEY);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
var FROM = process.env.EMAIL_FROM || 'Riley from Sortora <riley@sortora.com>';

// Cron: runs every Monday morning. Sends weekly activity digest to all active businesses.
module.exports = async function handler(req, res) {
  setSecurityHeaders(res);
  if (req.method !== 'GET' && req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (process.env.CRON_SECRET && req.headers.authorization !== 'Bearer ' + process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    var now = new Date();
    var weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
    var twoWeeksAgo = new Date(now - 14 * 24 * 60 * 60 * 1000);
    var weekRange = weekAgo.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' \u2013 ' + now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    // Get all active businesses with at least one split
    var { data: businesses } = await supabase
      .from('businesses')
      .select('id, email, owner_name, business_name')
      .not('first_split_at', 'is', null);

    if (!businesses || !businesses.length) {
      return res.status(200).json({ sent: 0, message: 'No active businesses' });
    }

    var sent = 0;
    for (var biz of businesses) {
      // Get this week's bookings
      var { data: thisWeek } = await supabase
        .from('booking_sessions')
        .select('id, total_amount, status, participant_count')
        .eq('business_id', biz.id)
        .gte('created_at', weekAgo.toISOString());

      var { data: lastWeek } = await supabase
        .from('booking_sessions')
        .select('id, total_amount, status')
        .eq('business_id', biz.id)
        .gte('created_at', twoWeeksAgo.toISOString())
        .lt('created_at', weekAgo.toISOString());

      var revenue = (thisWeek || []).filter(function(b) { return b.status === 'confirmed'; }).reduce(function(s, b) { return s + (b.total_amount || 0); }, 0);
      var prevRevenue = (lastWeek || []).filter(function(b) { return b.status === 'confirmed'; }).reduce(function(s, b) { return s + (b.total_amount || 0); }, 0);
      var bookings = (thisWeek || []).length;
      var confirmed = (thisWeek || []).filter(function(b) { return b.status === 'confirmed'; }).length;
      var completionRate = bookings > 0 ? Math.round(confirmed / bookings * 100) : 0;
      var totalParticipants = (thisWeek || []).reduce(function(s, b) { return s + (b.participant_count || 0); }, 0);
      var avgGroup = bookings > 0 ? (totalParticipants / bookings).toFixed(1) : '\u2014';

      // Skip if zero activity both weeks
      if (bookings === 0 && (lastWeek || []).length === 0) continue;

      var name = biz.owner_name || biz.business_name || 'there';
      var html = emails.weeklyDigest({
        name: name,
        weekRange: weekRange,
        revenue: revenue,
        prevRevenue: prevRevenue,
        bookings: bookings,
        confirmedBookings: confirmed,
        completionRate: completionRate,
        avgGroupSize: avgGroup,
        dashUrl: 'https://sortora.com/dashboard.html'
      });

      await resend.emails.send({
        from: FROM, to: biz.email,
        subject: 'Your Sortora week: $' + revenue.toFixed(0) + ' collected',
        html: html,
        tags: [{ name: 'category', value: 'weekly-digest' }]
      });
      sent++;
    }

    return res.status(200).json({ sent: sent });
  } catch (err) {
    alertError('cron-digest', err, req);
    return res.status(500).json({ error: 'Failed' });
  }
};
