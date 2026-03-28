const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');
const { corsCheck, applyRateLimit, sanitizeString, setSecurityHeaders, alertError } = require('./_security');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

module.exports = async function handler(req, res) {
  setSecurityHeaders(res);
  if (!corsCheck(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!applyRateLimit(req, res, 10, 60000)) return;

  try {
    var token = sanitizeString(req.body.token, 128);
    if (!token || token.length < 10) return res.status(400).json({ error: 'Invalid payment token' });

    var { data: participant } = await supabase
      .from('participants')
      .select('*')
      .eq('payment_token', token)
      .single();

    if (!participant) return res.status(404).json({ error: 'Payment link not found' });
    if (participant.status === 'paid') return res.status(400).json({ error: 'Already paid' });

    var { data: session } = await supabase
      .from('booking_sessions')
      .select('*, businesses(stripe_account_id, business_name)')
      .eq('id', participant.booking_session_id)
      .single();

    if (!session) return res.status(404).json({ error: 'Booking session not found' });
    if (session.status === 'expired') return res.status(400).json({ error: 'This booking has expired' });

    var stripeAccountId = session.businesses && session.businesses.stripe_account_id;
    if (!stripeAccountId) return res.status(400).json({ error: 'Business has not connected Stripe yet' });

    var siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sortora.com';
    var amountCents = Math.round(parseFloat(participant.amount) * 100);
    var feePercent = 0.025;
    var applicationFee = Math.round(amountCents * feePercent);

    var checkoutSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: session.title,
            description: 'Your share — ' + session.businesses.business_name
          },
          unit_amount: amountCents
        },
        quantity: 1
      }],
      payment_intent_data: {
        application_fee_amount: applicationFee,
        transfer_data: { destination: stripeAccountId },
        metadata: {
          participant_id: participant.id,
          booking_session_id: session.id,
          payment_token: token
        }
      },
      success_url: siteUrl + '/pay.html?token=' + token + '&success=true',
      cancel_url: siteUrl + '/pay.html?token=' + token,
      customer_email: participant.email,
      metadata: {
        participant_id: participant.id,
        booking_session_id: session.id
      }
    });

    return res.status(200).json({ url: checkoutSession.url });
  } catch (err) {
    alertError('pay', err, req);
    console.error('Pay error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
