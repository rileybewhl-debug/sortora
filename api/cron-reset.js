const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

module.exports = async function handler(req, res) {
  // Only allow Vercel Cron or manual trigger with secret
  var authHeader = req.headers.authorization;
  if (authHeader !== 'Bearer ' + process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    var { data, error } = await supabase
      .from('businesses')
      .update({ splits_this_month: 0 })
      .gt('splits_this_month', 0)
      .select('id');

    if (error) {
      console.error('Cron reset error:', error);
      return res.status(500).json({ error: 'Reset failed' });
    }

    var count = data ? data.length : 0;
    console.log('Monthly reset: ' + count + ' businesses reset to 0 splits');
    return res.status(200).json({ success: true, resetCount: count });
  } catch (err) {
    console.error('Cron error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
