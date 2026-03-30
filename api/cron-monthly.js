const { Resend } = require('resend');
const { createClient } = require('@supabase/supabase-js');
const { setSecurityHeaders, alertError } = require('./_security');
const emails = require('./_emails');

const resend = new Resend(process.env.RESEND_API_KEY);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
var FROM = process.env.EMAIL_FROM || 'Riley from Sortora <riley@sortora.com>';

// Cron: runs on the 1st of each month.
module.exports = async function handler(req, res) {
  setSecurityHeaders(res);
  if (req.method !== 'GET' && req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (process.env.CRON_SECRET && req.headers.authorization !== 'Bearer ' + process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    var now = new Date();
    var thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    var lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    var monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    var monthName = monthNames[now.getMonth() === 0 ? 11 : now.getMonth() - 1];

    var { data: businesses } = await supabase
      .from('businesses')
      .select('id, email, owner_name, business_name')
      .not('first_split_at', 'is', null);

    if (!businesses || !businesses.length) return res.status(200).json({ sent: 0 });

    var sent = 0;
    for (var biz of businesses) {
      var { data: thisMonth } = await supabase.from('booking_sessions').select('total_amount, status')
        .eq('business_id', biz.id).gte('created_at', lastMonthStart.toISOString()).lt('created_at', thisMonthStart.toISOString());
      var { data: prevMonth } = await supabase.from('booking_sessions').select('total_amount, status')
        .eq('business_id', biz.id).gte('created_at', new Date(now.getFullYear(), now.getMonth() - 2, 1).toISOString()).lt('created_at', lastMonthStart.toISOString());

      var revenue = (thisMonth || []).filter(function(b){return b.status==='confirmed'}).reduce(function(s,b){return s+(b.total_amount||0)},0);
      var prevRevenue = (prevMonth || []).filter(function(b){return b.status==='confirmed'}).reduce(function(s,b){return s+(b.total_amount||0)},0);
      var bookings = (thisMonth || []).length;
      var confirmed = (thisMonth || []).filter(function(b){return b.status==='confirmed'}).length;
      var completionRate = bookings > 0 ? Math.round(confirmed / bookings * 100) : 0;

      if (bookings === 0 && (prevMonth || []).length === 0) continue;

      var name = biz.owner_name || biz.business_name || 'there';
      var html = emails.monthlySummary({
        name: name, businessName: biz.business_name || 'your business',
        monthName: monthName, revenue: revenue, prevRevenue: prevRevenue,
        bookings: bookings, completionRate: completionRate, payouts: revenue * 0.97
      });

      await resend.emails.send({
        from: FROM, to: biz.email,
        subject: monthName + ' summary: $' + revenue.toFixed(0) + ' collected',
        html: html,
        tags: [{ name: 'category', value: 'monthly-summary' }]
      });
      sent++;
    }

    return res.status(200).json({ sent: sent });
  } catch (err) {
    alertError('cron-monthly', err, req);
    return res.status(500).json({ error: 'Failed' });
  }
};
