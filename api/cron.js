const jobs = require('./_cron-jobs');
const { setSecurityHeaders } = require('./_security');

// Routes: /api/cron?job=reset|nudge|digest|expiring|reengage|monthly
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
    'monthly': jobs.Monthly
  };

  if (!job || !map[job]) {
    return res.status(400).json({ error: 'Invalid job. Use ?job=reset|nudge|digest|expiring|reengage|monthly' });
  }

  return map[job](req, res);
};
