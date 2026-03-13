import { createClient } from "@supabase/supabase-js";
const SB = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const { sessionId, customerId } = req.body;
  if (!sessionId || !customerId) return res.status(400).json({ error: "Missing fields" });
  const { data: session } = await SB.from("sessions").select("id, title, max_spots, payment_mode, session_date, location, funding_deadline").eq("id", sessionId).single();
  if (!session) return res.status(404).json({ error: "Session not found" });
  if (session.payment_mode !== "later") return res.status(400).json({ error: "Session requires upfront payment" });
  const { count } = await SB.from("bookings").select("id", { count: "exact", head: true }).eq("session_id", sessionId).eq("status", "going");
  if (count >= session.max_spots) return res.status(400).json({ error: "Session is full" });
  const { data: existing } = await SB.from("bookings").select("id, status").eq("session_id", sessionId).eq("customer_id", customerId).single();
  if (existing) return res.status(400).json({ error: "Already registered", status: existing.status });
  const { data: booking, error } = await SB.from("bookings").insert({ session_id: sessionId, customer_id: customerId, status: "out", paid: false }).select().single();
  if (error) return res.status(500).json({ error: error.message });
  const { data: ca } = await SB.auth.admin.getUserById(customerId);
  const email = ca && ca.user ? ca.user.email : null;
  if (email) {
    const deadline = session.funding_deadline ? new Date(session.funding_deadline).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "before the session";
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": "Bearer " + process.env.RESEND_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "Sortora <notifications@sortora.com>", to: [email],
        subject: "You are registered for " + session.title + " - payment due soon",
        html: "<div style=\"font-family:sans-serif;max-width:560px;margin:0 auto;padding:40px 24px\">" +
          "<div style=\"font-size:22px;font-weight:800;color:#0A2540;margin-bottom:24px\">Sort<span style=\"color:#3D63FF\">ora</span></div>" +
          "<h1 style=\"font-size:24px;font-weight:800;color:#0A2540\">You are registered!</h1>" +
          "<p style=\"color:#8898AA;font-size:15px;margin-bottom:24px\">Your spot is reserved. Complete your payment by <strong style=\"color:#0A2540\">" + deadline + "</strong> to secure your place.</p>" +
          "<div style=\"background:#FFF7ED;border:1px solid #FED7AA;border-radius:16px;padding:20px;margin-bottom:24px\">" +
          "<div style=\"font-size:14px;font-weight:700;color:#F59E0B;margin-bottom:4px\">Payment due by " + deadline + "</div>" +
          "<div style=\"font-size:13px;color:#8898AA\">If payment is not received by the deadline your spot will be released.</div></div>" +
          "<div style=\"background:#F6F9FC;border-radius:16px;padding:24px;margin-bottom:24px\">" +
          "<div style=\"font-size:18px;font-weight:800;color:#0A2540;margin-bottom:10px\">" + session.title + "</div>" +
          "<div style=\"font-size:14px;color:#8898AA\">Location: <strong style=\"color:#0A2540\">" + (session.location || "TBD") + "</strong></div></div>" +
          "<a href=\"https://sortora.com/bookings.html\" style=\"display:inline-block;background:#3D63FF;color:#fff;padding:14px 28px;border-radius:12px;text-decoration:none;font-weight:700\">Pay Now</a></div>"
      })
    });
  }
  res.status(200).json({ success: true, bookingId: booking.id });
}