import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const SB = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

export default async function handler(req, res) {
  const { code, state: providerId } = req.query;

  if (!code || !providerId) {
    return res.redirect('/profile.html?connect=error');
  }

  try {
    const response = await stripe.oauth.token({
      grant_type: 'authorization_code',
      code,
    });

    const stripeAccountId = response.stripe_user_id;

    await SB.from('providers')
      .update({ stripe_account_id: stripeAccountId })
      .eq('id', providerId);

    res.redirect('/profile.html?connect=success');
  } catch (err) {
    console.error('Stripe Connect error:', err);
    res.redirect('/profile.html?connect=error');
  }
}
