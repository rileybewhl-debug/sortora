import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { providerId } = req.body;
  if (!providerId) return res.status(400).json({ error: 'Missing providerId' });

  const accountLink = await stripe.oauth.authorizeUrl({
    response_type: 'code',
    client_id: process.env.STRIPE_CLIENT_ID,
    scope: 'read_write',
    redirect_uri: 'https://sortora.com/api/connect-callback',
    state: providerId,
  });

  res.status(200).json({ url: accountLink });
}
