const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');
const { corsCheck, applyRateLimit, sanitizeUUID, setSecurityHeaders, alertError } = require('./_security');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

module.exports = async function handler(req, res) {
  setSecurityHeaders(res);
  if (!corsCheck(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!applyRateLimit(req, res, 5, 60000)) return;

  // Route: ?action=session returns embedded onboarding client secret
  var action = req.query && req.query.action;
  if (action === 'session') {
    try {
      var sid = sanitizeUUID(req.body.businessId);
      if (!sid) return res.status(400).json({ error: 'Invalid businessId' });
      var { data: sb } = await supabase.from('businesses').select('stripe_account_id').eq('id', sid).single();
      if (!sb || !sb.stripe_account_id) return res.status(400).json({ error: 'No Stripe account found.' });
      var accountSession = await stripe.accountSessions.create({
        account: sb.stripe_account_id,
        components: { account_onboarding: { enabled: true }, account_management: { enabled: true } }
      });
      return res.status(200).json({ clientSecret: accountSession.client_secret, accountId: sb.stripe_account_id, publishableKey: process.env.STRIPE_PUBLISHABLE_KEY });
    } catch (sessionErr) {
      alertError('connect-session', sessionErr, req);
      return res.status(500).json({ error: 'Session creation failed' });
    }
  }

  try {
    var businessId = sanitizeUUID(req.body.businessId);
    if (!businessId) return res.status(400).json({ error: 'Invalid businessId' });

    var { data: biz } = await supabase
      .from('businesses')
      .select('stripe_account_id')
      .eq('id', businessId)
      .single();

    var accountId = biz && biz.stripe_account_id;

    if (!accountId) {
      var account = await stripe.accounts.create({
        type: 'standard',
        metadata: { sortora_business_id: businessId }
      }, {
        idempotencyKey: 'acct_' + businessId
      });
      accountId = account.id;
      await supabase.from('businesses').update({ stripe_account_id: accountId, stripe_connected_at: new Date().toISOString() }).eq('id', businessId);
    }

    var siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sortora.com';

    // Account links expire quickly — use timestamp window so retries within
    // the same minute reuse the same link, but new attempts get a fresh one
    var accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: siteUrl + '/dashboard.html?stripe=refresh',
      return_url: siteUrl + '/dashboard.html?stripe=success',
      type: 'account_onboarding'
    }, {
      idempotencyKey: 'link_' + accountId + '_' + Math.floor(Date.now() / 60000)
    });

    return res.status(200).json({ url: accountLink.url, accountId: accountId });
  } catch (err) {
    alertError('connect', err, req);
    console.error('Connect error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
