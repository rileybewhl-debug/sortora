import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const SB = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { sessionId, sessionTitle, price, customerId } = req.body;
  if (!sessionId || !price || !customerId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Get the provider's Stripe account for this session
  const { data: session } = await SB
    .from('sessions')
    .select('provider_id, providers(stripe_account_id)')
    .eq('id', sessionId)
    .single();

  const stripeAccountId = session?.providers?.stripe_account_id;
  const amount = Math.round(price * 100);
  const platformFee = Math.round(amount * 0.05); // 5% platform fee

  const checkoutParams = {
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'usd',
        product_data: { name: sessionTitle || 'Sortora Session' },
        unit_amount: amount,
      },
      quantity: 1,
    }],
    mode: 'payment',
    success_url: 'https://sortora.com/bookings.html?payment=success',
    cancel_url: 'https://sortora.com/browse.html?payment=cancelled',
    metadata: { sessionId, customerId }
  };

  // If provider has connected Stripe, route payment to them
  if (stripeAccountId) {
    checkoutParams.payment_intent_data = {
      application_fee_amount: platformFee,
      transfer_data: { destination: stripeAccountId },
    };
  }

  const checkout = await stripe.checkout.sessions.create(checkoutParams);
  res.status(200).json({ url: checkout.url });
}
