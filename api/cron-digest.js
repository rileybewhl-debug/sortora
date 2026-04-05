const jobs = require('./_cron-jobs');
module.exports = async function handler(req, res) {
  return jobs.Digest(req, res);
};
