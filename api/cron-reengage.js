const { Resend } = require('resend');
const { createClient } = require('@supabase/supabase-js');
const { setSecurityHeaders, alertError } = require('./_security');
const emails = require('./_emails');

const resend = new Resend(process.env.RESEND_API_KEY);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
var FROM = process.env.EMAIL_FROM || 'Riley from Sortora <riley@sortora.com>';

// Cron: runs daily. Finds inactive businesses and sends re-engagement emails.
module.exports = async function handler(req, res) {
  setSecurityHeaders(res);
  if (req.method !== 'GET' && req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (process.env.CRON_SECRET && req.headers.authorization !== 'Bearer ' + process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    var now = Date.now();
    var day7 = new Date(now - 7 * 86400000).toISOString();
    var day8 = new Date(now - 8 * 86400000).toISOString();
    var day14 = new Date(now - 14 * 86400000).toISOString();
    var day15 = new Date(now - 15 * 86400000).toISOString();
    var day30 = new Date(now - 30 * 86400000).toISOString();
    var day31 = new Date(now - 31 * 86400000).toISOString();

    // Get all businesses with their last activity
    var { data: businesses } = await supabase
      .from('businesses')
      .select('id, email, owner_name, business_name, last_active_at, reengage_sent')
      .not('email', 'is', null);

    if (!businesses || !businesses.length) return res.status(200).json({ sent: 0 });

    var sent = 0;
    for (var biz of businesses) {
      var lastActive = biz.last_active_at || biz.created_at;
      if (!lastActive) continue;

      var sentList = biz.reengage_sent || [];
      var name = biz.owner_name || biz.business_name || 'there';
      var bizName = biz.business_name || 'your business';
      var templateKey = null;
      var subject = '';
      var templateFn = null;

      // 7 days inactive (within 7-8 day window)
      if (lastActive <= day7 && lastActive > day8 && !sentList.includes('day7')) {
        templateKey = 'day7'; subject = 'Everything okay with ' + bizName + '?';
        templateFn = emails.reengageDay7;
      }
      // 14 days inactive
      else if (lastActive <= day14 && lastActive > day15 && !sentList.includes('day14')) {
        templateKey = 'day14'; subject = 'Quick check-in from Riley';
        templateFn = emails.reengageDay14;
      }
      // 30 days inactive
      else if (lastActive <= day30 && lastActive > day31 && !sentList.includes('day30')) {
        templateKey = 'day30'; subject = 'Is Sortora still a fit?';
        templateFn = emails.reengageDay30;
      }

      if (templateKey && templateFn) {
        var html = templateFn({ name: name, businessName: bizName });
        await resend.emails.send({
          from: FROM, to: biz.email, subject: subject, html: html,
          tags: [{ name: 'category', value: 're-engagement' }, { name: 'stage', value: templateKey }]
        });
        sentList.push(templateKey);
        await supabase.from('businesses').update({ reengage_sent: sentList }).eq('id', biz.id);
        sent++;
      }
    }

    return res.status(200).json({ sent: sent });
  } catch (err) {
    alertError('cron-reengage', err, req);
    return res.status(500).json({ error: 'Failed' });
  }
};
