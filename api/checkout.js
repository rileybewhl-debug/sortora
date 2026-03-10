import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { sessionId, sessionTitle, price, customerId } = req.body;

  if (!sessionId || !price || !customerId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const checkout = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'usd',
        product_data: { name: sessionTitle || 'Sortora Session' },
        unit_amount: Math.round(price * 100),
      },
      quantity: 1,
    }],
    mode: 'payment',
    success_url: 'https://sortora.vercel.app/browse.html?payment=success',
    cancel_url: 'https://sortora.vercel.app/browse.html?payment=cancelled',
    metadata: { sessionId, customerId }
  });

  res.status(200).json({ url: checkout.url });
}
