import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const SB = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send('Webhook error: ' + err.message);
  }

  if (event.type === 'checkout.session.completed') {
    const s = event.data.object;
    const { sessionId, customerId, customerName, sessionTitle, sessionDate, sessionLocation, sessionPrice } = s.metadata;

    // Get customer email
    const { data: customerProfile } = await SB
      .from('profiles')
      .select('full_name')
      .eq('id', customerId)
      .single();

    const { data: customerAuth } = await SB.auth.admin.getUserById(customerId);
    const customerEmail = customerAuth?.user?.email;

    // Get provider email
    const { data: session } = await SB
      .from('sessions')
      .select('provider_id')
      .eq('id', sessionId)
      .single();

    const { data: providerAuth } = await SB.auth.admin.getUserById(session?.provider_id);
    const providerEmail = providerAuth?.user?.email;

    const { data: providerProfile } = await SB
      .from('profiles')
      .select('full_name')
      .eq('id', session?.provider_id)
      .single();

    const baseUrl = 'https://sortora.com';

    // Send confirmation to customer
    if (customerEmail) {
      await fetch(baseUrl + '/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'booking_confirmation',
          customerEmail,
          customerName: customerProfile?.full_name || customerName,
          sessionTitle,
          sessionDate,
          sessionLocation,
          sessionPrice
        })
      });
    }

    // Send alert to provider
    if (providerEmail) {
      await fetch(baseUrl + '/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'new_booking_alert',
          providerEmail,
          providerName: providerProfile?.full_name || '',
          customerName: customerProfile?.full_name || customerName,
          sessionTitle,
          sessionDate,
          sessionLocation,
          sessionPrice
        })
      });
    }
  }

  res.status(200).json({ received: true });
}
