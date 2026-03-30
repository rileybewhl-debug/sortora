const { Resend } = require('resend');
const { createClient } = require('@supabase/supabase-js');
const { setSecurityHeaders, alertError } = require('./_security');
const emails = require('./_emails');

const resend = new Resend(process.env.RESEND_API_KEY);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
var FROM = process.env.EMAIL_FROM || 'Riley from Sortora <riley@sortora.com>';

// Cron: runs daily. Finds businesses that connected Stripe 48+ hrs ago
// but haven't embedded the widget yet, and sends a nudge email.
module.exports = async function handler(req, res) {
  setSecurityHeaders(res);
  if (req.method !== 'GET' && req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Optional: verify cron secret
  if (process.env.CRON_SECRET && req.headers.authorization !== 'Bearer ' + process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    var cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

    var { data: businesses } = await supabase
      .from('businesses')
      .select('id, email, owner_name, business_name, stripe_connected_at, widget_embedded_at')
      .not('stripe_connected_at', 'is', null)
      .is('widget_embedded_at', null)
      .lt('stripe_connected_at', cutoff);

    if (!businesses || !businesses.length) {
      return res.status(200).json({ sent: 0, message: 'No businesses need nudging' });
    }

    var sent = 0;
    for (var biz of businesses) {
      var name = biz.owner_name || biz.business_name || 'there';
      var html = emails.widgetNudge({ name: name, dashUrl: 'https://sortora.com/dashboard.html' });
      await resend.emails.send({
        from: FROM, to: biz.email,
        subject: 'You\'re one step away from accepting split payments',
        html: html,
        tags: [{ name: 'category', value: 'behavioral-nudge' }]
      });
      sent++;
    }

    return res.status(200).json({ sent: sent });
  } catch (err) {
    alertError('cron-nudge', err, req);
    return res.status(500).json({ error: 'Failed' });
  }
};
