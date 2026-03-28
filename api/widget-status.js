const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    var businessId = req.query.id;
    if (!businessId) return res.status(400).json({ active: false, reason: 'missing_id' });

    var result = await supabase
      .from('businesses')
      .select('id, business_name, plan, splits_this_month, stripe_onboarded, subscription_status')
      .eq('id', businessId)
      .single();

    if (!result.data) {
      return res.status(200).json({ active: false, reason: 'not_found' });
    }

    var biz = result.data;

    // Check subscription status (if field exists)
    if (biz.subscription_status === 'expired' || biz.subscription_status === 'cancelled') {
      return res.status(200).json({ active: false, reason: 'subscription_expired', businessName: biz.business_name });
    }

    // Check if Stripe is connected
    if (!biz.stripe_onboarded) {
      return res.status(200).json({ active: false, reason: 'stripe_not_connected', businessName: biz.business_name });
    }

    // Check plan limits
    var limits = { starter: 10, growth: 50, pro: Infinity };
    var limit = limits[biz.plan || 'starter'] || 10;
    var used = biz.splits_this_month || 0;

    if (used >= limit) {
      return res.status(200).json({ active: false, reason: 'limit_reached', businessName: biz.business_name });
    }

    return res.status(200).json({
      active: true,
      businessName: biz.business_name,
      plan: biz.plan || 'starter',
      splitsUsed: used,
      splitsLimit: limit === Infinity ? 'unlimited' : limit
    });
  } catch (err) {
    console.error('Widget status error:', err);
    return res.status(200).json({ active: false, reason: 'error' });
  }
};
