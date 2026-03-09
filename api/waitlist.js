// api/waitlist.js - Vercel Serverless Function
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { email } = req.body;
  if (!email || !email.includes('@') || !email.includes('.')) {
    return res.status(400).json({ error: 'Invalid email address' });
  }
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;
  const resendKey = process.env.RESEND_API_KEY;
  const dbRes = await fetch(supabaseUrl + '/rest/v1/waitlist', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseKey,
      'Authorization': 'Bearer ' + supabaseKey,
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify({ email: email.toLowerCase().trim(), signed_up_at: new Date().toISOString() })
  });
  if (dbRes.status === 409) return res.status(200).json({ message: 'Already on the list' });
  if (!dbRes.ok) { console.error('Supabase error:', await dbRes.text()); return res.status(500).json({ error: 'Failed to save email' }); }
  const emailRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + resendKey },
    body: JSON.stringify({
      from: 'Sortora <onboarding@resend.dev>',
      to: email,
      subject: "You're on the Sortora waitlist!",
      html: '<div style="background:#0A1628;padding:40px;font-family:Arial,sans-serif;"><div style="max-width:560px;margin:0 auto;background:#111C2E;border-radius:16px;padding:40px;border:1px solid rgba(255,255,255,0.08);"><h1 style="color:#fff;font-size:28px;margin:0 0 16px;">You are on the list.</h1><p style="color:rgba(255,255,255,0.5);font-size:16px;line-height:1.7;">We are building Sortora - the platform that lets groups collectively book and fund service providers. We will email you the moment it is ready.</p><p style="color:rgba(255,255,255,0.2);font-size:12px;margin-top:32px;">Sortora &middot; hello@sortora.com</p></div></div>'
    })
  });
  if (!emailRes.ok) console.error('Resend error:', await emailRes.text());
  return res.status(200).json({ message: 'Success' });
}
