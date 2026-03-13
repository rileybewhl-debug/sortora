import { createClient } from "@supabase/supabase-js";
const SB = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const { sessionId, customerId } = req.body;
  if (!sessionId || !customerId) return res.status(400).json({ error: "Missing fields" });
  const { data: session } = await SB.from("sessions").select("id, title, max_spots, session_date, location").eq("id", sessionId).single();
  if (!session) return res.status(404).json({ error: "Session not found" });
  const { count } = await SB.from("bookings").select("id", { count: "exact", head: true }).eq("session_id", sessionId).eq("status", "going");
  if (count < session.max_spots) return res.status(400).json({ error: "Session not full" });
  const { data: existing } = await SB.from("session_waitlist").select("id").eq("session_id", sessionId).eq("customer_id", customerId).single();
  if (existing) return res.status(400).json({ error: "Already on waitlist" });
  const { error } = await SB.from("session_waitlist").insert({ session_id: sessionId, customer_id: customerId });
  if (error) return res.status(500).json({ error: error.message });
  const { data: customerAuth } = await SB.auth.admin.getUserById(customerId);
  const email = customerAuth && customerAuth.user ? customerAuth.user.email : null;
  if (email) {
    const d = new Date(session.session_date);
    const dateStr = d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": "Bearer " + process.env.RESEND_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "Sortora <notifications@sortora.com>", to: [email],
        subject: "You are on the waitlist for " + session.title,
        html: "<div style=\"font-family:sans-serif;max-width:560px;margin:0 auto;padding:40px 24px\">" +
          "<div style=\"font-size:22px;font-weight:800;color:#0A2540;margin-bottom:24px\">Sort<span style=\"color:#3D63FF\">ora</span></div>" +
          "<h1 style=\"font-size:24px;font-weight:800;color:#0A2540\">You are on the waitlist!</h1>" +
          "<p style=\"color:#8898AA;font-size:15px;margin-bottom:32px\">This session is full. If a spot opens we will email you immediately.</p>" +
          "<div style=\"background:#F6F9FC;border-radius:16px;padding:24px;margin-bottom:24px\">" +
          "<div style=\"font-size:18px;font-weight:800;color:#0A2540;margin-bottom:12px\">" + session.title + "</div>" +
          "<div style=\"font-size:14px;color:#8898AA\">Date: <strong style=\"color:#0A2540\">" + dateStr + "</strong></div>" +
          "<div style=\"font-size:14px;color:#8898AA\">Location: <strong style=\"color:#0A2540\">" + (session.location || "TBD") + "</strong></div></div>" +
          "<a href=\"https://sortora.com/browse.html\" style=\"display:inline-block;background:#3D63FF;color:#fff;padding:14px 28px;border-radius:12px;text-decoration:none;font-weight:700\">Browse Other Sessions</a></div>"
      })
    });
  }
  res.status(200).json({ success: true });
}