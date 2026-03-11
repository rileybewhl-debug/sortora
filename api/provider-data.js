import { createClient } from '@supabase/supabase-js';

const SB = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

export default async function handler(req, res) {
  const { slug } = req.query;
  if (!slug) return res.status(400).json({ error: 'Missing slug' });

  const { data: provider, error } = await SB
    .from('providers')
    .select('*, profiles(full_name, city)')
    .eq('slug', slug)
    .single();

  if (error || !provider) return res.status(404).json({ error: 'Provider not found' });

  const { data: sessions } = await SB
    .from('sessions')
    .select('*')
    .eq('provider_id', provider.id)
    .eq('status', 'open')
    .gte('session_date', new Date().toISOString())
    .order('session_date', { ascending: true });

  res.status(200).json({ provider, sessions: sessions || [] });
}
