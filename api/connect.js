const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { businessId } = req.body;
    if (!businessId) return res.status(400).json({ error: 'Missing businessId' });

    // Check if business already has a Stripe account
    const { data: biz } = await supabase
      .from('businesses')
      .select('stripe_account_id')
      .eq('id', businessId)
      .single();

    let accountId = biz?.stripe_account_id;

    // Create Stripe Connect account if needed
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: 'standard',
        metadata: { sortora_business_id: businessId }
      });
      accountId = account.id;

      await supabase
        .from('businesses')
        .update({ stripe_account_id: accountId })
        .eq('id', businessId);
    }

    // Create onboarding link
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sortora.vercel.app';
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: siteUrl + '/dashboard.html?stripe=refresh',
      return_url: siteUrl + '/dashboard.html?stripe=success',
      type: 'account_onboarding'
    });

    return res.status(200).json({ url: accountLink.url });
  } catch (err) {
    console.error('Connect error:', err);
    return res.status(500).json({ error: err.message });
  }
};
