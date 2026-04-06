const jobs = require('../lib/_cron-jobs');
const { setSecurityHeaders } = require('../lib/_security');

// Routes: /api/cron?job=reset|nudge|digest|expiring|reengage|monthly|reminder
module.exports = async function handler(req, res) {
  setSecurityHeaders(res);
  if (req.method !== 'GET' && req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  var job = (req.query && req.query.job) || (req.body && req.body.job);
  var map = {
    'reset': jobs.Reset,
    'nudge': jobs.Nudge,
    'digest': jobs.Digest,
    'expiring': jobs.ExpiringCards,
    'reengage': jobs.Reengage,
    'monthly': jobs.Monthly,
    'reminder': jobs.PaymentReminder,
    'autocharge': jobs.AutoCharge
  };

  if (!job || !map[job]) {
    return res.status(400).json({ error: 'Invalid job. Use ?job=reset|nudge|digest|expiring|reengage|monthly' });
  }

  if (job === 'all') {
    var results = {};
    try { await jobs.PaymentReminder(req, Object.assign({}, res, {status:function(){return{json:function(d){results.reminder=d}}}})); } catch(e) { results.reminder = {error: e.message}; }
    try { await jobs.AutoCharge(req, Object.assign({}, res, {status:function(){return{json:function(d){results.autocharge=d}}}})); } catch(e) { results.autocharge = {error: e.message}; }
    if (new Date().getUTCDay() === 1) { try { await jobs.Digest(req, Object.assign({}, res, {status:function(){return{json:function(d){results.digest=d}}}})); } catch(e) { results.digest = {error: e.message}; } }
    return res.status(200).json(results);
  }

  return map[job](req, res);
};
