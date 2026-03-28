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
    const { participantId, bookingSessionId, token } = req.body;

    if (!token) return res.status(400).json({ error: 'Missing payment token' });

    // Get participant
    const { data: participant } = await supabase
      .from('participants')
      .select('*')
      .eq('payment_token', token)
      .single();

    if (!participant) return res.status(404).json({ error: 'Payment link not found' });
    if (participant.status === 'paid') return res.status(400).json({ error: 'Already paid' });

    // Get booking session
    const { data: session } = await supabase
      .from('booking_sessions')
      .select('*, businesses(stripe_account_id, business_name)')
      .eq('id', participant.booking_session_id)
      .single();

    if (!session) return res.status(404).json({ error: 'Booking session not found' });
    if (session.status === 'expired') return res.status(400).json({ error: 'This booking has expired' });

    const stripeAccountId = session.businesses?.stripe_account_id;
    if (!stripeAccountId) return res.status(400).json({ error: 'Business has not connected Stripe yet' });

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sortora.vercel.app';
    const amountCents = Math.round(parseFloat(participant.amount) * 100);

    // Calculate platform fee (based on plan — we take 2-3%)
    const feePercent = 0.025; // Default 2.5%, could vary by plan
    const applicationFee = Math.round(amountCents * feePercent);

    // Create Stripe Checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
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
        transfer_data: {
          destination: stripeAccountId
        },
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
    console.error('Pay error:', err);
    return res.status(500).json({ error: err.message });
  }
};
