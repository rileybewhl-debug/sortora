import { createClient } from "@supabase/supabase-js";

const SB = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const RESEND_API_KEY = process.env.RESEND_API_KEY;

async function sendEmail(to, subject, html) {
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Authorization": "Bearer " + RESEND_API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ from: "Sortora <notifications@sortora.com>", to: [to], subject, html })
  });
  return r.json();
}

export default async function handler(req, res) {
  const authHeader = req.headers["authorization"];
  if (req.method === "POST" && authHeader !== "Bearer " + process.env.CRON_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const now = new Date();
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const in23h = new Date(now.getTime() + 23 * 60 * 60 * 1000);

  const { data: sessions } = await SB
    .from("sessions")
    .select("id, title, location, session_date, providers(profiles(full_name))")
    .eq("status", "open")
    .gte("session_date", in23h.toISOString())
    .lte("session_date", in24h.toISOString());

  if (!sessions || !sessions.length) {
    return res.status(200).json({ sent: 0, message: "No sessions in window" });
  }

  let totalSent = 0;

  for (const session of sessions) {
    const { data: bookings } = await SB
      .from("bookings")
      .select("id, customer_id")
      .eq("session_id", session.id)
      .eq("status", "going")
      .eq("reminder_sent", false);

    if (!bookings || !bookings.length) continue;

    const d = new Date(session.session_date);
    const dateStr = d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" });

    for (const booking of bookings) {
      const { data: customerAuth } = await SB.auth.admin.getUserById(booking.customer_id);
      const email = customerAuth && customerAuth.user ? customerAuth.user.email : null;
      if (!email) continue;

      const { data: profile } = await SB.from("profiles").select("full_name").eq("id", booking.customer_id).single();
      const name = profile ? profile.full_name : "there";

      await sendEmail(
        email,
        "Reminder: " + session.title + " is tomorrow",
        "<div style=\"font-family:'Plus Jakarta Sans',sans-serif;max-width:560px;margin:0 auto;padding:40px 24px\">" +
        "<div style=\"font-size:22px;font-weight:800;color:#0A2540;margin-bottom:24px\">Sort<span style=\"color:#3D63FF\">ora</span></div>" +
        "<h1 style=\"font-size:24px;font-weight:800;color:#0A2540;margin-bottom:8px\">See you tomorrow!</h1>" +
        "<p style=\"color:#8898AA;font-size:15px;margin-bottom:32px\">Hey " + name + ", just a reminder that your session is coming up.</p>" +
        "<div style=\"background:#F6F9FC;border-radius:16px;padding:24px;margin-bottom:24px\">" +
        "<div style=\"font-size:18px;font-weight:800;color:#0A2540;margin-bottom:16px\">" + session.title + "</div>" +
        "<div style=\"font-size:14px;color:#8898AA;margin-bottom:8px\">Date: <strong style=\"color:#0A2540\">" + dateStr + "</strong></div>" +
        "<div style=\"font-size:14px;color:#8898AA\">Location: <strong style=\"color:#0A2540\">" + (session.location || "TBD") + "</strong></div>" +
        "</div>" +
        "<a href=\"https://sortora.com/bookings.html\" style=\"display:inline-block;background:#3D63FF;color:#fff;padding:14px 28px;border-radius:12px;text-decoration:none;font-weight:700;font-size:15px\">View My Bookings</a>" +
        "<p style=\"color:#8898AA;font-size:13px;margin-top:32px\">If your plans changed, update your status on the bookings page.</p>" +
        "</div>"
      );

      await SB.from("bookings").update({ reminder_sent: true }).eq("id", booking.id);
      totalSent++;
    }
  }

  res.status(200).json({ sent: totalSent });
}