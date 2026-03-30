const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');
const { corsCheck, applyRateLimit, sanitizeUUID, setSecurityHeaders, alertError } = require('./_security');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

module.exports = async function handler(req, res) {
  setSecurityHeaders(res);
  if (!corsCheck(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!applyRateLimit(req, res, 10, 60000)) return;

  try {
    var businessId = sanitizeUUID(req.body.businessId);
    if (!businessId) return res.status(400).json({ error: 'Invalid businessId' });

    var { data: biz } = await supabase
      .from('businesses')
      .select('stripe_account_id')
      .eq('id', businessId)
      .single();

    if (!biz || !biz.stripe_account_id) {
      return res.status(400).json({ error: 'No Stripe account found. Create one first via /api/connect.' });
    }

    var accountSession = await stripe.accountSessions.create({
      account: biz.stripe_account_id,
      components: {
        account_onboarding: { enabled: true },
        account_management: { enabled: true }
      }
    });

    return res.status(200).json({
      clientSecret: accountSession.client_secret,
      accountId: biz.stripe_account_id,
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
    });
  } catch (err) {
    alertError('account-session', err, req);
    console.error('Account session error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
