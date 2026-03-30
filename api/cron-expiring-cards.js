const Stripe = require('stripe');
const { Resend } = require('resend');
const { createClient } = require('@supabase/supabase-js');
const { setSecurityHeaders, alertError } = require('./_security');
const emails = require('./_emails');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const resend = new Resend(process.env.RESEND_API_KEY);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
var FROM = process.env.EMAIL_FROM || 'Riley from Sortora <riley@sortora.com>';

// Cron: runs monthly. Finds customers whose card expires next month.
module.exports = async function handler(req, res) {
  setSecurityHeaders(res);
  if (req.method !== 'GET' && req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (process.env.CRON_SECRET && req.headers.authorization !== 'Bearer ' + process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    var now = new Date();
    var targetMonth = now.getMonth() + 2; // Next month (0-indexed + 1 for next)
    var targetYear = now.getFullYear();
    if (targetMonth > 12) { targetMonth = 1; targetYear++; }

    // Get all businesses with Stripe customer IDs
    var { data: businesses } = await supabase
      .from('businesses')
      .select('id, email, owner_name, business_name, stripe_customer_id')
      .not('stripe_customer_id', 'is', null);

    if (!businesses || !businesses.length) {
      return res.status(200).json({ sent: 0, message: 'No businesses with Stripe customers' });
    }

    var sent = 0;
    for (var biz of businesses) {
      try {
        var paymentMethods = await stripe.paymentMethods.list({
          customer: biz.stripe_customer_id,
          type: 'card'
        });

        for (var pm of (paymentMethods.data || [])) {
          if (pm.card && pm.card.exp_month === targetMonth && pm.card.exp_year === targetYear) {
            var name = biz.owner_name || biz.business_name || 'there';
            var html = emails.expiringCard({
              name: name,
              expMonth: String(pm.card.exp_month).padStart(2, '0'),
              expYear: pm.card.exp_year,
              last4: pm.card.last4,
              updateUrl: 'https://sortora.com/dashboard.html?billing=update'
            });
            await resend.emails.send({
              from: FROM, to: biz.email,
              subject: 'Your card ending in ' + pm.card.last4 + ' expires soon',
              html: html,
              tags: [{ name: 'category', value: 'pre-dunning' }]
            });
            sent++;
            break; // One email per business
          }
        }
      } catch (cardErr) {
        console.error('Card check error for ' + biz.id + ':', cardErr.message);
      }
    }

    return res.status(200).json({ sent: sent });
  } catch (err) {
    alertError('cron-expiring-cards', err, req);
    return res.status(500).json({ error: 'Failed' });
  }
};
