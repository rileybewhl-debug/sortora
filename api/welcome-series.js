const { Resend } = require('resend');
const { createClient } = require('@supabase/supabase-js');
const { setSecurityHeaders, alertError } = require('./_security');
const emails = require('./_emails');

const resend = new Resend(process.env.RESEND_API_KEY);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
var FROM = process.env.EMAIL_FROM || 'Riley from Sortora <riley@sortora.com>';

module.exports = async function handler(req, res) {
  setSecurityHeaders(res);
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    var { businessId } = req.body;
    if (!businessId) return res.status(400).json({ error: 'businessId required' });

    var { data: biz } = await supabase
      .from('businesses')
      .select('business_name, email, owner_name')
      .eq('id', businessId)
      .single();

    if (!biz || !biz.email) return res.status(404).json({ error: 'Business not found' });

    var name = biz.owner_name || biz.business_name || 'there';
    var bizName = biz.business_name || 'your business';
    var dashUrl = 'https://sortora.com/dashboard.html';

    // Schedule 5 emails with delays
    var schedule = [
      { delay: 0,       subject: 'Welcome to Sortora, ' + name + ' 🎉', template: 'welcome' },
      { delay: 86400,   subject: 'Set up your first split in 2 minutes', template: 'quickWin' },
      { delay: 259200,  subject: 'How escape rooms are filling every seat', template: 'socialProof' },
      { delay: 432000,  subject: 'Did you know Sortora can do this?', template: 'featureSpotlight' },
      { delay: 604800,  subject: 'Quick check-in from Riley', template: 'checkIn' }
    ];

    var results = [];
    for (var i = 0; i < schedule.length; i++) {
      var s = schedule[i];
      var html = emails[s.template]({ name: name, businessName: bizName, dashUrl: dashUrl });
      var sendOpts = {
        from: FROM,
        to: biz.email,
        subject: s.subject,
        html: html,
        tags: [{ name: 'category', value: 'welcome-series' }, { name: 'email_number', value: String(i + 1) }]
      };
      if (s.delay > 0) {
        sendOpts.scheduledAt = new Date(Date.now() + s.delay * 1000).toISOString();
      }
      var r = await resend.emails.send(sendOpts);
      results.push({ template: s.template, id: r.data ? r.data.id : null });
    }

    return res.status(200).json({ sent: results.length, emails: results });
  } catch (err) {
    alertError('welcome-series', err, req);
    console.error('Welcome series error:', err);
    return res.status(500).json({ error: 'Failed to send welcome series' });
  }
};
