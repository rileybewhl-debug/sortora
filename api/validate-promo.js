import { createClient } from '@supabase/supabase-js';

const SB = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { code, sessionId } = req.body;
  if (!code) return res.status(400).json({ error: 'Missing code' });

  const { data: promo, error } = await SB
    .from('promo_codes')
    .select('*')
    .eq('code', code.toUpperCase().trim())
    .eq('active', true)
    .single();

  if (error || !promo) return res.status(404).json({ error: 'Invalid promo code' });
  if (promo.expires_at && new Date(promo.expires_at) < new Date()) return res.status(400).json({ error: 'Promo code has expired' });
  if (promo.max_uses && promo.uses >= promo.max_uses) return res.status(400).json({ error: 'Promo code has reached its limit' });

  res.status(200).json({ discount_percent: promo.discount_percent, promo_id: promo.id });
}
