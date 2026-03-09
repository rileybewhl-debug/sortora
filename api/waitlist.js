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


  const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>You're on the Sortora waitlist</title></head><body style="margin:0;padding:0;background:#060E1C;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;"><table width="100%" cellpadding="0" cellspacing="0" style="background:#060E1C;padding:40px 16px;"><tr><td align="center"><table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;"><tr><td style="padding:0 0 32px;" align="center"><table cellpadding="0" cellspacing="0"><tr><td><svg width="32" height="28" viewBox="-6 -6 50 46" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:inline-block;vertical-align:middle;margin-right:10px;"><circle cx="8" cy="32" r="7" fill="none" stroke="rgba(255,255,255,0.35)" stroke-width="2.2"/><circle cx="30" cy="32" r="7" fill="none" stroke="rgba(255,255,255,0.35)" stroke-width="2.2"/><path d="M8 32 Q19 6 30 32" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="2"/><circle cx="19" cy="5" r="7" fill="#3D63FF"/></svg><span style="font-size:22px;font-weight:900;color:#fff;letter-spacing:-0.05em;vertical-align:middle;">Sortora</span></td></tr></table></td></tr><tr><td style="background:#0D1829;border:1px solid rgba(255,255,255,0.08);border-radius:20px;overflow:hidden;"><table width="100%" cellpadding="0" cellspacing="0"><tr><td style="height:3px;background:linear-gradient(90deg,#3D63FF,#00D4AA);line-height:3px;font-size:3px;">&nbsp;</td></tr><tr><td style="padding:40px 40px 36px;"><table cellpadding="0" cellspacing="0" style="margin-bottom:24px;"><tr><td style="width:48px;height:48px;background:rgba(0,212,170,0.12);border:1px solid rgba(0,212,170,0.25);border-radius:14px;text-align:center;vertical-align:middle;"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" style="display:inline-block;margin-top:13px;"><path d="M4 12l5 6L20 6" stroke="#00D4AA" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg></td></tr></table><p style="margin:0 0 8px;font-size:28px;font-weight:900;c


  const emailRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + resendKey },
    body: JSON.stringify({
      from: 'Sortora <hello@sortora.com>',
      to: email,
      subject: "You're on the list — Sortora",
      html
    })
