const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');
const { corsCheck, applyRateLimit, sanitizeUUID, sanitizeString, setSecurityHeaders, alertError } = require('./_security');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

var PLANS = {
  starter: { name: 'Starter', amount: 2900, splits: 10 },
  growth: { name: 'Growth', amount: 5900, splits: 50 },
  pro: { name: 'Pro', amount: 9900, splits: 'Unlimited' }
};

var priceCache = {};

async function getOrCreatePrice(planKey) {
  if (priceCache[planKey]) return priceCache[planKey];
  var plan = PLANS[planKey];
  if (!plan) return null;

  var products = await stripe.products.list({ limit: 100 });
  var existing = products.data.find(function(p) {
    return p.metadata && p.metadata.sortora_plan === planKey && p.active;
  });

  var productId;
  if (existing) {
    productId = existing.id;
  } else {
    var product = await stripe.products.create({
      name: 'Sortora ' + plan.name,
      description: plan.splits === 'Unlimited' ? 'Unlimited splits per month' : 'Up to ' + plan.splits + ' splits per month',
      metadata: { sortora_plan: planKey }
    });
    productId = product.id;
  }

  var prices = await stripe.prices.list({ product: productId, active: true, limit: 10 });
  var existingPrice = prices.data.find(function(p) {
    return p.unit_amount === plan.amount && p.recurring && p.recurring.interval === 'month';
  });

  if (existingPrice) {
    priceCache[planKey] = existingPrice.id;
    return existingPrice.id;
  }

  var price = await stripe.prices.create({
    product: productId,
    unit_amount: plan.amount,
    currency: 'usd',
    recurring: { interval: 'month' }
  });

  priceCache[planKey] = price.id;
  return price.id;
}

module.exports = async function handler(req, res) {
  setSecurityHeaders(res);
  if (!corsCheck(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!applyRateLimit(req, res, 5, 60000)) return;

  try {
    var body = req.body;
    var businessId = sanitizeUUID(body.businessId);
    var planKey = sanitizeString(body.plan, 20).toLowerCase();

    if (!businessId) return res.status(400).json({ error: 'Invalid businessId' });
    if (!PLANS[planKey]) return res.status(400).json({ error: 'Invalid plan. Choose starter, growth, or pro.' });

    var { data: biz } = await supabase
      .from('businesses')
      .select('id, email, stripe_customer_id')
      .eq('id', businessId)
      .single();

    if (!biz) return res.status(404).json({ error: 'Business not found' });

    var customerId = biz.stripe_customer_id;
    if (!customerId) {
      var customer = await stripe.customers.create({
        email: biz.email,
        metadata: { sortora_business_id: businessId }
      });
      customerId = customer.id;
      await supabase.from('businesses').update({ stripe_customer_id: customerId }).eq('id', businessId);
    }

    var priceId = await getOrCreatePrice(planKey);
    if (!priceId) return res.status(500).json({ error: 'Failed to create plan' });

    var siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sortora.com';

    var session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: siteUrl + '/dashboard.html?billing=success&plan=' + planKey,
      cancel_url: siteUrl + '/dashboard.html?billing=cancelled',
      metadata: { sortora_business_id: businessId, sortora_plan: planKey },
      subscription_data: { metadata: { sortora_business_id: businessId, sortora_plan: planKey } }
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Subscribe error:', err);
    alertError('subscribe', err, req);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
