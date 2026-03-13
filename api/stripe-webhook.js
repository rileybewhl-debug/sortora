import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import getRawBody from "raw-body";
export const config = { api: { bodyParser: false } };
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const SB = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
async function sendEmail(to, subject, html) {
  await fetch("https://api.resend.com/emails", { method: "POST", headers: { "Authorization": "Bearer " + process.env.RESEND_API_KEY, "Content-Type": "application/json" }, body: JSON.stringify({ from: "Sortora <notifications@sortora.com>", to: [to], subject, html }) });
}
async function notifyNextWaitlist(sessionId) {
  const { data: next } = await SB.from("session_waitlist").select("id, customer_id").eq("session_id", sessionId).eq("notified", false).order("created_at", { ascending: true }).limit(1).single();
  if (!next) return;
  const { data: sess } = await SB.from("sessions").select("title, session_date, location").eq("id", sessionId).single();
  const { data: ca } = await SB.auth.admin.getUserById(next.customer_id);
  const email = ca && ca.user ? ca.user.email : null;
  if (email && sess) {
    const ds = new Date(sess.session_date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
    await sendEmail(email, "A spot opened in " + sess.title, "<div style=\"font-family:sans-serif;max-width:560px;margin:0 auto;padding:40px 24px\"><div style=\"font-size:22px;font-weight:800;color:#0A2540;margin-bottom:24px\">Sort<span style=\"color:#3D63FF\">ora</span></div><h1 style=\"font-size:24px;font-weight:800;color:#0A2540\">A spot just opened up!</h1><p style=\"color:#8898AA;font-size:15px;margin-bottom:24px\">Someone cancelled. Grab it before it goes.</p><div style=\"background:#F6F9FC;border-radius:16px;padding:24px;margin-bottom:24px\"><div style=\"font-size:18px;font-weight:800;color:#0A2540;margin-bottom:10px\">" + sess.title + "</div><div style=\"font-size:14px;color:#8898AA\">Date: <strong style=\"color:#0A2540\">" + ds + "</strong></div><div style=\"font-size:14px;color:#8898AA\">Location: <strong style=\"color:#0A2540\">" + (sess.location || "TBD") + "</strong></div></div><a href=\"https://sortora.com/browse.html\" style=\"display:inline-block;background:#3D63FF;color:#fff;padding:14px 28px;border-radius:12px;text-decoration:none;font-weight:700\">Book Now</a></div>");
  }
  await SB.from("session_waitlist").update({ notified: true }).eq("id", next.id);
}
export default async function handler(req, res) {
  const rawBody = await getRawBody(req);
  const sig = req.headers["stripe-signature"];
  let event;
  try { event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET); }
  catch (err) { return res.status(400).json({ error: "Webhook error: " + err.message }); }
  if (event.type === "checkout.session.completed") {
    const cs = event.data.object;
    const { bookingId, sessionId, customerId, providerId } = cs.metadata || {};
    if (bookingId) {
      await SB.from("bookings").update({ status: "going", paid: true, stripe_payment_intent: cs.payment_intent }).eq("id", bookingId);
    } else if (customerId && sessionId) {
      await SB.from("bookings").upsert({ session_id: sessionId, customer_id: customerId, status: "going", paid: true, stripe_payment_intent: cs.payment_intent }, { onConflict: "session_id,customer_id" });
    }
    if (customerId && sessionId) {
      const { data: ca } = await SB.auth.admin.getUserById(customerId);
      const em = ca && ca.user ? ca.user.email : null;
      const { data: pr } = await SB.from("profiles").select("full_name").eq("id", customerId).single();
      const name = pr ? pr.full_name : "there";
      const { data: sess } = await SB.from("sessions").select("title, session_date, location, price_per_person").eq("id", sessionId).single();
      if (em && sess) {
        const ds = new Date(sess.session_date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" });
        await sendEmail(em, "Booking confirmed: " + sess.title, "<div style=\"font-family:sans-serif;max-width:560px;margin:0 auto;padding:40px 24px\"><div style=\"font-size:22px;font-weight:800;color:#0A2540;margin-bottom:24px\">Sort<span style=\"color:#3D63FF\">ora</span></div><h1 style=\"font-size:24px;font-weight:800;color:#0A2540\">You are booked!</h1><p style=\"color:#8898AA;font-size:15px;margin-bottom:24px\">Hey " + name + ", your spot is confirmed.</p><div style=\"background:#F6F9FC;border-radius:16px;padding:24px;margin-bottom:24px\"><div style=\"font-size:18px;font-weight:800;color:#0A2540;margin-bottom:10px\">" + sess.title + "</div><div style=\"font-size:14px;color:#8898AA\">Date: <strong style=\"color:#0A2540\">" + ds + "</strong></div><div style=\"font-size:14px;color:#8898AA\">Location: <strong style=\"color:#0A2540\">" + (sess.location || "TBD") + "</strong></div><div style=\"font-size:14px;color:#8898AA\">Amount: <strong style=\"color:#0A2540\">$" + sess.price_per_person + "</strong></div></div><a href=\"https://sortora.com/bookings.html\" style=\"display:inline-block;background:#3D63FF;color:#fff;padding:14px 28px;border-radius:12px;text-decoration:none;font-weight:700\">View Bookings</a></div>");
      }
    }
    if (providerId && sessionId) {
      const { data: pa } = await SB.auth.admin.getUserById(providerId);
      const pem = pa && pa.user ? pa.user.email : null;
      const { data: sess } = await SB.from("sessions").select("title, session_date").eq("id", sessionId).single();
      if (pem && sess) {
        const ds = new Date(sess.session_date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
        await sendEmail(pem, "New booking for " + sess.title, "<div style=\"font-family:sans-serif;max-width:560px;margin:0 auto;padding:40px 24px\"><div style=\"font-size:22px;font-weight:800;color:#0A2540;margin-bottom:24px\">Sort<span style=\"color:#3D63FF\">ora</span></div><h1 style=\"font-size:24px;font-weight:800;color:#0A2540\">New booking!</h1><p style=\"color:#8898AA;font-size:15px;margin-bottom:24px\">Someone just booked your session.</p><div style=\"background:#F6F9FC;border-radius:16px;padding:24px;margin-bottom:24px\"><div style=\"font-size:18px;font-weight:800;color:#0A2540;margin-bottom:10px\">" + sess.title + "</div><div style=\"font-size:14px;color:#8898AA\">Date: <strong style=\"color:#0A2540\">" + ds + "</strong></div></div><a href=\"https://sortora.com/dashboard.html\" style=\"display:inline-block;background:#3D63FF;color:#fff;padding:14px 28px;border-radius:12px;text-decoration:none;font-weight:700\">View Dashboard</a></div>");
      }
    }
  }
  if (event.type === "checkout.session.expired") {
    const cs = event.data.object;
    const { bookingId, sessionId } = cs.metadata || {};
    if (bookingId) { await SB.from("bookings").update({ status: "out" }).eq("id", bookingId); if (sessionId) await notifyNextWaitlist(sessionId); }
  }
  res.status(200).json({ received: true });
}