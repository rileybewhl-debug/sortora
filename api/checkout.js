import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const SB = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { sessionId, sessionTitle, price, customerId, promoId, discountPercent, bookingId } = req.body;
  if (!sessionId || !price || !customerId) return res.status(400).json({ error: 'Missing required fields' });

  const { data: session } = await SB
    .from('sessions')
    .select('provider_id, location, session_date, providers(stripe_account_id, profiles(full_name))')
    .eq('id', sessionId)
    .single();

  const { data: customer } = await SB
    .from('profiles').select('full_name').eq('id', customerId).single();

  const stripeAccountId = session?.providers?.stripe_account_id;
  let finalPrice = parseFloat(price);
  if (discountPercent && discountPercent > 0) {
    finalPrice = finalPrice * (1 - discountPercent / 100);
  }

  const amount = Math.round(finalPrice * 100);
  const platformFee = Math.round(amount * 0.05);

  const checkoutParams = {
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'usd',
        product_data: {
          name: sessionTitle + (discountPercent ? ' (' + discountPercent + '% off)' : ''),
        },
        unit_amount: amount,
      },
      quantity: 1,
    }],
    mode: 'payment',
    success_url: 'https://sortora.com/bookings.html?payment=success',
    cancel_url: 'https://sortora.com/browse.html?payment=cancelled',
    metadata: {
      sessionId, customerId, booking_id: bookingId || '',
      customerName: customer?.full_name || '',
      sessionTitle, sessionPrice: finalPrice.toFixed(2),
      sessionDate: session?.session_date || '',
      sessionLocation: session?.location || '',
      promoId: promoId || ''
    }
  };

  if (stripeAccountId) {
    checkoutParams.payment_intent_data = {
      application_fee_amount: platformFee,
      transfer_data: { destination: stripeAccountId },
    };
  }

  const checkout = await stripe.checkout.sessions.create(checkoutParams);

  // Increment promo uses if applied
  if (promoId) {
    await SB.rpc('increment_promo_uses', { promo_id: promoId });
  }

  res.status(200).json({ url: checkout.url });
}
