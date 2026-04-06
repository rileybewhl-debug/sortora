const { Resend } = require('resend');
const { createClient } = require('@supabase/supabase-js');
const { setSecurityHeaders, alertError, sanitizeUUID } = require('../lib/_security');
const emails = require('../lib/_emails');

const resend = new Resend(process.env.RESEND_API_KEY);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
var FROM = process.env.EMAIL_FROM || 'Riley from Sortora <riley@sortora.com>';

// Routes: /api/email?type=welcome|dunning|milestone
module.exports = async function handler(req, res) {
  setSecurityHeaders(res);
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  var type = (req.query && req.query.type) || (req.body && req.body.type);
  if (!type) return res.status(400).json({ error: 'type required: welcome|dunning|milestone' });

  try {
    if (type === 'welcome') return await handleWelcome(req, res);
    if (type === 'dunning') return await handleDunning(req, res);
    if (type === 'milestone') return await handleMilestone(req, res);
    return res.status(400).json({ error: 'Invalid type' });
  } catch (err) {
    alertError('email-' + type, err, req);
    return res.status(500).json({ error: 'Failed' });
  }
};

async function handleWelcome(req, res) {
  var { businessId } = req.body;
  if (!businessId) return res.status(400).json({ error: 'businessId required' });

  var { data: biz } = await supabase.from('businesses').select('business_name, email, owner_name').eq('id', businessId).single();
  if (!biz || !biz.email) return res.status(404).json({ error: 'Business not found' });

  var name = biz.owner_name || biz.business_name || 'there';
  var bizName = biz.business_name || 'your business';
  var dashUrl = 'https://sortora.com/dashboard.html';

  var schedule = [
    { delay: 0, subject: 'Welcome to Sortora, ' + name + ' \ud83c\udf89', template: 'welcome' },
    { delay: 86400, subject: 'Set up your first split in 2 minutes', template: 'quickWin' },
    { delay: 259200, subject: 'How escape rooms are filling every seat', template: 'socialProof' },
    { delay: 432000, subject: 'Did you know Sortora can do this?', template: 'featureSpotlight' },
    { delay: 604800, subject: 'Quick check-in from Riley', template: 'checkIn' }
  ];

  var results = [];
  for (var s of schedule) {
    var html = emails[s.template]({ name: name, businessName: bizName, dashUrl: dashUrl });
    var opts = { from: FROM, to: biz.email, subject: s.subject, html: html, tags: [{ name: 'category', value: 'welcome-series' }] };
    if (s.delay > 0) opts.scheduledAt = new Date(Date.now() + s.delay * 1000).toISOString();
    var r = await resend.emails.send(opts);
    results.push({ template: s.template, id: r.data ? r.data.id : null });
  }
  return res.status(200).json({ sent: results.length, emails: results });
}

async function handleDunning(req, res) {
  var { businessId, attemptCount } = req.body;
  if (!businessId) return res.status(400).json({ error: 'businessId required' });

  var { data: biz } = await supabase.from('businesses').select('business_name, email, owner_name').eq('id', businessId).single();
  if (!biz || !biz.email) return res.status(404).json({ error: 'Business not found' });

  var name = biz.owner_name || biz.business_name || 'there';
  var updateUrl = 'https://sortora.com/dashboard.html?billing=update';

  var templateMap = {
    1: { template: 'dunningDay0', subject: 'Quick heads up \u2014 your payment didn\u2019t go through' },
    2: { template: 'dunningDay3', subject: 'Update your card in 30 seconds' },
    3: { template: 'dunningDay7', subject: 'Your Sortora account needs attention' },
    4: { template: 'dunningDay14', subject: 'We\u2019ll need to pause your account tomorrow' }
  };

  var attempt = Math.min(attemptCount || 1, 4);
  var config = templateMap[attempt];
  var html = emails[config.template]({ name: name, updateUrl: updateUrl });

  var r = await resend.emails.send({
    from: FROM, to: biz.email, subject: config.subject, html: html,
    tags: [{ name: 'category', value: 'dunning' }, { name: 'attempt', value: String(attempt) }]
  });

  await supabase.from('businesses').update({ dunning_attempt: attempt, dunning_last_sent: new Date().toISOString() }).eq('id', businessId);
  return res.status(200).json({ sent: true, attempt: attempt, emailId: r.data ? r.data.id : null });
}

async function handleMilestone(req, res) {
  var { businessId, totalSplits, totalRevenue } = req.body;
  if (!businessId) return res.status(400).json({ error: 'businessId required' });

  var { data: biz } = await supabase.from('businesses').select('email, owner_name, business_name, milestones_sent').eq('id', businessId).single();
  if (!biz || !biz.email) return res.status(404).json({ error: 'Not found' });

  var sent = biz.milestones_sent || [];
  var name = biz.owner_name || biz.business_name || 'there';
  var milestones = [
    { key: 'first_split', check: totalSplits >= 1, title: 'Your first split!', message: 'You just completed your first split payment.', stat: '1', statLabel: 'split completed' },
    { key: 'ten_bookings', check: totalSplits >= 10, title: '10 bookings!', message: biz.business_name + ' has hit double digits.', stat: '10', statLabel: 'bookings' },
    { key: 'revenue_1k', check: totalRevenue >= 1000, title: '$1,000 processed!', message: 'Over $1,000 in split payments.', stat: '$1K+', statLabel: 'processed' },
    { key: 'revenue_10k', check: totalRevenue >= 10000, title: '$10,000 milestone!', message: 'Five figures in split payments.', stat: '$10K+', statLabel: 'processed' },
    { key: 'revenue_100k', check: totalRevenue >= 100000, title: '$100,000 processed!', message: 'Six figures. Incredible.', stat: '$100K+', statLabel: 'processed' }
  ];

  var sentCount = 0;
  for (var m of milestones) {
    if (m.check && !sent.includes(m.key)) {
      var html = emails.milestone({ name: name, title: m.title, message: m.message, stat: m.stat, statLabel: m.statLabel });
      await resend.emails.send({ from: FROM, to: biz.email, subject: m.title, html: html, tags: [{ name: 'category', value: 'milestone' }] });
      sent.push(m.key);
      sentCount++;
    }
  }

  if (sentCount > 0) await supabase.from('businesses').update({ milestones_sent: sent }).eq('id', businessId);
  return res.status(200).json({ sent: sentCount, milestones: sent });
}
