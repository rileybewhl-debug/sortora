import { createClient } from "@supabase/supabase-js";

const SB = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
  const { providerId } = req.query;
  if (!providerId) return res.status(400).json({ error: "Missing providerId" });

  // Total sessions
  const { data: sessions } = await SB
    .from("sessions")
    .select("id, status, session_date, price_per_person")
    .eq("provider_id", providerId);

  const totalSessions = sessions ? sessions.length : 0;
  const activeSessions = sessions ? sessions.filter(s => s.status === "open").length : 0;

  // Total bookings and revenue
  const sessionIds = sessions ? sessions.map(s => s.id) : [];
  let totalBookings = 0;
  let totalRevenue = 0;
  let goingCount = 0;
  let maybeCount = 0;

  if (sessionIds.length) {
    const { data: bookings } = await SB
      .from("bookings")
      .select("id, status, paid, session_id")
      .in("session_id", sessionIds);

    totalBookings = bookings ? bookings.length : 0;
    goingCount = bookings ? bookings.filter(b => b.status === "going").length : 0;
    maybeCount = bookings ? bookings.filter(b => b.status === "maybe").length : 0;

    // Revenue = going bookings x session price
    if (bookings && sessions) {
      bookings.filter(b => b.status === "going" && b.paid).forEach(b => {
        const s = sessions.find(s => s.id === b.session_id);
        if (s) totalRevenue += parseFloat(s.price_per_person) * 0.95;
      });
    }
  }

  // Conversion rate: going / total bookings
  const conversionRate = totalBookings > 0 ? Math.round((goingCount / totalBookings) * 100) : 0;

  // Revenue last 30 days
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  let recentRevenue = 0;
  if (sessionIds.length) {
    const { data: recentBookings } = await SB
      .from("bookings")
      .select("status, paid, session_id, created_at")
      .in("session_id", sessionIds)
      .eq("status", "going")
      .eq("paid", true)
      .gte("created_at", thirtyDaysAgo);

    if (recentBookings && sessions) {
      recentBookings.forEach(b => {
        const s = sessions.find(s => s.id === b.session_id);
        if (s) recentRevenue += parseFloat(s.price_per_person) * 0.95;
      });
    }
  }

  res.status(200).json({
    totalSessions,
    activeSessions,
    totalBookings,
    goingCount,
    maybeCount,
    conversionRate,
    totalRevenue: totalRevenue.toFixed(2),
    recentRevenue: recentRevenue.toFixed(2)
  });
}