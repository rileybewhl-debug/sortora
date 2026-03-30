const { Resend } = require('resend');
const { createClient } = require('@supabase/supabase-js');
const { setSecurityHeaders, alertError } = require('./_security');
const emails = require('./_emails');

const resend = new Resend(process.env.RESEND_API_KEY);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
var FROM = process.env.EMAIL_FROM || 'Riley from Sortora <riley@sortora.com>';

// Called by webhook when invoice.payment_failed fires
// Pass { businessId, attemptCount } in the body
module.exports = async function handler(req, res) {
  setSecurityHeaders(res);
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    var { businessId, attemptCount } = req.body;
    if (!businessId) return res.status(400).json({ error: 'businessId required' });

    var { data: biz } = await supabase
      .from('businesses')
      .select('business_name, email, owner_name, stripe_customer_id')
      .eq('id', businessId)
      .single();

    if (!biz || !biz.email) return res.status(404).json({ error: 'Business not found' });

    var name = biz.owner_name || biz.business_name || 'there';
    var updateUrl = 'https://sortora.com/dashboard.html?billing=update';

    // Map attempt count to dunning email
    var templateMap = {
      1: { template: 'dunningDay0', subject: 'Quick heads up \u2014 your payment didn\u2019t go through', delay: 0 },
      2: { template: 'dunningDay3', subject: 'Update your card in 30 seconds', delay: 0 },
      3: { template: 'dunningDay7', subject: 'Your Sortora account needs attention', delay: 0 },
      4: { template: 'dunningDay14', subject: 'We\u2019ll need to pause your account tomorrow', delay: 0 }
    };

    var attempt = Math.min(attemptCount || 1, 4);
    var config = templateMap[attempt];
    var html = emails[config.template]({ name: name, updateUrl: updateUrl });

    var r = await resend.emails.send({
      from: FROM,
      to: biz.email,
      subject: config.subject,
      html: html,
      tags: [
        { name: 'category', value: 'dunning' },
        { name: 'attempt', value: String(attempt) }
      ]
    });

    // Track dunning state
    await supabase.from('businesses').update({
      dunning_attempt: attempt,
      dunning_last_sent: new Date().toISOString()
    }).eq('id', businessId);

    return res.status(200).json({ sent: true, attempt: attempt, emailId: r.data ? r.data.id : null });
  } catch (err) {
    alertError('dunning', err, req);
    console.error('Dunning error:', err);
    return res.status(500).json({ error: 'Failed to send dunning email' });
  }
};
