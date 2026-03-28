const { createClient } = require('@supabase/supabase-js');
const { corsCheck, applyRateLimit, sanitizeUUID, setSecurityHeaders } = require('./_security');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

module.exports = async function handler(req, res) {
  setSecurityHeaders(res);
  if (!corsCheck(req, res)) return;
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  if (!applyRateLimit(req, res, 60, 60000)) return;

  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');

  try {
    var businessId = sanitizeUUID(req.query.id);
    if (!businessId) return res.status(200).json({ active: false, reason: 'missing_id' });

    var result = await supabase
      .from('businesses')
      .select('id, business_name, plan, splits_this_month, stripe_onboarded, subscription_status')
      .eq('id', businessId)
      .single();

    if (!result.data) return res.status(200).json({ active: false, reason: 'not_found' });
    var biz = result.data;

    if (biz.subscription_status === 'expired' || biz.subscription_status === 'cancelled') {
      return res.status(200).json({ active: false, reason: 'subscription_expired', businessName: biz.business_name });
    }

    if (!biz.stripe_onboarded) {
      return res.status(200).json({ active: false, reason: 'stripe_not_connected', businessName: biz.business_name });
    }

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
