const RESEND_API_KEY = process.env.RESEND_API_KEY;

async function sendEmail(to, subject, html) {
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + RESEND_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: 'Sortora <notifications@sortora.com>',
      to: [to],
      subject,
      html
    })
  });
  return r.json();
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { type, customerEmail, customerName, providerEmail, providerName, sessionTitle, sessionDate, sessionLocation, sessionPrice } = req.body;

  const dateStr = sessionDate ? new Date(sessionDate).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
  }) : '';

  if (type === 'booking_confirmation') {
    await sendEmail(
      customerEmail,
      'You\'re booked — ' + sessionTitle,
      `<div style="font-family:'Plus Jakarta Sans',sans-serif;max-width:560px;margin:0 auto;padding:40px 24px">
        <div style="font-size:22px;font-weight:800;color:#0A2540;margin-bottom:24px">Sort<span style="color:#3D63FF">ora</span></div>
        <h1 style="font-size:24px;font-weight:800;color:#0A2540;margin-bottom:8px">You're confirmed! ✅</h1>
        <p style="color:#8898AA;font-size:15px;margin-bottom:32px">Here are your booking details.</p>
        <div style="background:#F6F9FC;border-radius:16px;padding:24px;margin-bottom:24px">
          <div style="font-size:18px;font-weight:800;color:#0A2540;margin-bottom:16px">${sessionTitle}</div>
          <div style="font-size:14px;color:#8898AA;margin-bottom:8px">📅 <strong style="color:#0A2540">${dateStr}</strong></div>
          <div style="font-size:14px;color:#8898AA;margin-bottom:8px">📍 <strong style="color:#0A2540">${sessionLocation || 'TBD'}</strong></div>
          <div style="font-size:14px;color:#8898AA">💰 <strong style="color:#0A2540">$${sessionPrice} per person</strong></div>
        </div>
        <a href="https://sortora.com/bookings.html" style="display:inline-block;background:#3D63FF;color:#fff;padding:14px 28px;border-radius:12px;text-decoration:none;font-weight:700;font-size:15px">View My Bookings</a>
        <p style="color:#8898AA;font-size:13px;margin-top:32px">Questions? Reply to this email and we'll help.</p>
      </div>`
    );
  }

  if (type === 'new_booking_alert') {
    await sendEmail(
      providerEmail,
      'New booking — ' + sessionTitle,
      `<div style="font-family:'Plus Jakarta Sans',sans-serif;max-width:560px;margin:0 auto;padding:40px 24px">
        <div style="font-size:22px;font-weight:800;color:#0A2540;margin-bottom:24px">Sort<span style="color:#3D63FF">ora</span></div>
        <h1 style="font-size:24px;font-weight:800;color:#0A2540;margin-bottom:8px">New booking! 🎉</h1>
        <p style="color:#8898AA;font-size:15px;margin-bottom:32px"><strong style="color:#0A2540">${customerName}</strong> just booked your session.</p>
        <div style="background:#F6F9FC;border-radius:16px;padding:24px;margin-bottom:24px">
          <div style="font-size:18px;font-weight:800;color:#0A2540;margin-bottom:16px">${sessionTitle}</div>
          <div style="font-size:14px;color:#8898AA;margin-bottom:8px">👤 <strong style="color:#0A2540">${customerName}</strong></div>
          <div style="font-size:14px;color:#8898AA;margin-bottom:8px">📅 <strong style="color:#0A2540">${dateStr}</strong></div>
          <div style="font-size:14px;color:#8898AA">📍 <strong style="color:#0A2540">${sessionLocation || 'TBD'}</strong></div>
        </div>
        <a href="https://sortora.com/dashboard.html" style="display:inline-block;background:#3D63FF;color:#fff;padding:14px 28px;border-radius:12px;text-decoration:none;font-weight:700;font-size:15px">View Dashboard</a>
      </div>`
    );
  }

  res.status(200).json({ ok: true });
}
