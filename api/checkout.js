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

  const { data: session } = await SB
    .from('sessions')
    .select('provider_id, location, session_date, providers(stripe_account_id, profiles(full_name)), profiles!sessions_provider_id_fkey(full_name)')
    .eq('id', sessionId)
    .single();

  const { data: customer } = await SB
    .from('profiles')
    .select('full_name')
    .eq('id', customerId)
    .single();

  const { data: customerAuth } = await SB
    .from('profiles')
    .select('full_name')
    .eq('id', customerId)
    .single();

  const stripeAccountId = session?.providers?.stripe_account_id;
  const amount = Math.round(price * 100);
  const platformFee = Math.round(amount * 0.05);

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
    metadata: {
      sessionId,
      customerId,
      customerName: customer?.full_name || '',
      providerName: session?.providers?.profiles?.full_name || '',
      sessionTitle,
      sessionDate: session?.session_date || '',
      sessionLocation: session?.location || '',
      sessionPrice: price
    }
  };

  if (stripeAccountId) {
    checkoutParams.payment_intent_data = {
      application_fee_amount: platformFee,
      transfer_data: { destination: stripeAccountId },
    };
  }

  const checkout = await stripe.checkout.sessions.create(checkoutParams);
  res.status(200).json({ url: checkout.url });
}
