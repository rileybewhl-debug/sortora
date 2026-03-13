import { createClient } from "@supabase/supabase-js";

const SB = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const { sessionId, customerId } = req.body;
  if (!sessionId || !customerId) return res.status(400).json({ error: "Missing fields" });

  // Check session is actually full
  const { data: session } = await SB.from("sessions").select("id, max_spots, title, session_date, location, providers(profiles(full_name))").eq("id", sessionId).single();
  if (!session) return res.status(404).json({ error: "Session not found" });

  const { count } = await SB.from("bookings").select("id", { count: "exact", head: true }).eq("session_id", sessionId).eq("status", "going");
  if (count < session.max_spots) return res.status(400).json({ error: "Session is not full" });

  // Already on waitlist?
  const { data: existing } = await SB.from("session_waitlist").select("id").eq("session_id", sessionId).eq("customer_id", customerId).single();
  if (existing) return res.status(400).json({ error: "Already on waitlist" });

  // Already booked?
  const { data: booked } = await SB.from("bookings").select("id").eq("session_id", sessionId).eq("customer_id", customerId).eq("status", "going").single();
  if (booked) return res.status(400).json({ error: "Already booked" });

  const { error } = await SB.from("session_waitlist").insert({ session_id: sessionId, customer_id: customerId });
  if (error) return res.status(500).json({ error: error.message });

  // Get position
  const { count: position } = await SB.from("session_waitlist").select("id", { count: "exact", head: true }).eq("session_id", sessionId).lte("created_at", new Date().toISOString());

  res.status(200).json({ success: true, position });
}