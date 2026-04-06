const Stripe = require('stripe');
const { Resend } = require('resend');
const { createClient } = require('@supabase/supabase-js');
const { setSecurityHeaders, alertError } = require('./_security');
const emails = require('./_emails');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const resend = new Resend(process.env.RESEND_API_KEY);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
var FROM = process.env.EMAIL_FROM || 'Riley from Sortora <riley@sortora.com>';

async function Reset(req, res) {
  // Only allow Vercel Cron or manual trigger with secret
  var authHeader = req.headers.authorization;
  if (authHeader !== 'Bearer ' + process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    var { data, error } = await supabase
      .from('businesses')
      .update({ splits_this_month: 0 })
      .gt('splits_this_month', 0)
      .select('id');

    if (error) {
      console.error('Cron reset error:', error);
      return res.status(500).json({ error: 'Reset failed' });
    }

    var count = data ? data.length : 0;
    console.log('Monthly reset: ' + count + ' businesses reset to 0 splits');
    return res.status(200).json({ success: true, resetCount: count });
  } catch (err) {
    console.error('Cron error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};


async function Nudge(req, res) {
  setSecurityHeaders(res);
  if (req.method !== 'GET' && req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Optional: verify cron secret
  if (process.env.CRON_SECRET && req.headers.authorization !== 'Bearer ' + process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    var cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

    var { data: businesses } = await supabase
      .from('businesses')
      .select('id, email, owner_name, business_name, stripe_connected_at, widget_embedded_at')
      .not('stripe_connected_at', 'is', null)
      .is('widget_embedded_at', null)
      .lt('stripe_connected_at', cutoff);

    if (!businesses || !businesses.length) {
      return res.status(200).json({ sent: 0, message: 'No businesses need nudging' });
    }

    var sent = 0;
    for (var biz of businesses) {
      var name = biz.owner_name || biz.business_name || 'there';
      var html = emails.widgetNudge({ name: name, dashUrl: 'https://sortora.com/dashboard.html' });
      await resend.emails.send({
        from: FROM, to: biz.email,
        subject: 'You\'re one step away from accepting split payments',
        html: html,
        tags: [{ name: 'category', value: 'behavioral-nudge' }]
      });
      sent++;
    }

    return res.status(200).json({ sent: sent });
  } catch (err) {
    alertError('cron-nudge', err, req);
    return res.status(500).json({ error: 'Failed' });
  }
};


async function Digest(req, res) {
  setSecurityHeaders(res);
  if (req.method !== 'GET' && req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (process.env.CRON_SECRET && req.headers.authorization !== 'Bearer ' + process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    var now = new Date();
    var weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
    var twoWeeksAgo = new Date(now - 14 * 24 * 60 * 60 * 1000);
    var weekRange = weekAgo.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' \u2013 ' + now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    // Get all active businesses with at least one split
    var { data: businesses } = await supabase
      .from('businesses')
      .select('id, email, owner_name, business_name')
      .not('first_split_at', 'is', null);

    if (!businesses || !businesses.length) {
      return res.status(200).json({ sent: 0, message: 'No active businesses' });
    }

    var sent = 0;
    for (var biz of businesses) {
      // Get this week's bookings
      var { data: thisWeek } = await supabase
        .from('booking_sessions')
        .select('id, total_amount, status, participant_count')
        .eq('business_id', biz.id)
        .gte('created_at', weekAgo.toISOString());

      var { data: lastWeek } = await supabase
        .from('booking_sessions')
        .select('id, total_amount, status')
        .eq('business_id', biz.id)
        .gte('created_at', twoWeeksAgo.toISOString())
        .lt('created_at', weekAgo.toISOString());

      var revenue = (thisWeek || []).filter(function(b) { return b.status === 'confirmed'; }).reduce(function(s, b) { return s + (b.total_amount || 0); }, 0);
      var prevRevenue = (lastWeek || []).filter(function(b) { return b.status === 'confirmed'; }).reduce(function(s, b) { return s + (b.total_amount || 0); }, 0);
      var bookings = (thisWeek || []).length;
      var confirmed = (thisWeek || []).filter(function(b) { return b.status === 'confirmed'; }).length;
      var completionRate = bookings > 0 ? Math.round(confirmed / bookings * 100) : 0;
      var totalParticipants = (thisWeek || []).reduce(function(s, b) { return s + (b.participant_count || 0); }, 0);
      var avgGroup = bookings > 0 ? (totalParticipants / bookings).toFixed(1) : '\u2014';

      // Skip if zero activity both weeks
      if (bookings === 0 && (lastWeek || []).length === 0) continue;

      var name = biz.owner_name || biz.business_name || 'there';
      var html = emails.weeklyDigest({
        name: name,
        weekRange: weekRange,
        revenue: revenue,
        prevRevenue: prevRevenue,
        bookings: bookings,
        confirmedBookings: confirmed,
        completionRate: completionRate,
        avgGroupSize: avgGroup,
        dashUrl: 'https://sortora.com/dashboard.html'
      });

      await resend.emails.send({
        from: FROM, to: biz.email,
        subject: 'Your Sortora week: $' + revenue.toFixed(0) + ' collected',
        html: html,
        tags: [{ name: 'category', value: 'weekly-digest' }]
      });
      sent++;
    }

    return res.status(200).json({ sent: sent });
  } catch (err) {
    alertError('cron-digest', err, req);
    return res.status(500).json({ error: 'Failed' });
  }
};


async function ExpiringCards(req, res) {
  setSecurityHeaders(res);
  if (req.method !== 'GET' && req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (process.env.CRON_SECRET && req.headers.authorization !== 'Bearer ' + process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    var now = new Date();
    var targetMonth = now.getMonth() + 2; // Next month (0-indexed + 1 for next)
    var targetYear = now.getFullYear();
    if (targetMonth > 12) { targetMonth = 1; targetYear++; }

    // Get all businesses with Stripe customer IDs
    var { data: businesses } = await supabase
      .from('businesses')
      .select('id, email, owner_name, business_name, stripe_customer_id')
      .not('stripe_customer_id', 'is', null);

    if (!businesses || !businesses.length) {
      return res.status(200).json({ sent: 0, message: 'No businesses with Stripe customers' });
    }

    var sent = 0;
    for (var biz of businesses) {
      try {
        var paymentMethods = await stripe.paymentMethods.list({
          customer: biz.stripe_customer_id,
          type: 'card'
        });

        for (var pm of (paymentMethods.data || [])) {
          if (pm.card && pm.card.exp_month === targetMonth && pm.card.exp_year === targetYear) {
            var name = biz.owner_name || biz.business_name || 'there';
            var html = emails.expiringCard({
              name: name,
              expMonth: String(pm.card.exp_month).padStart(2, '0'),
              expYear: pm.card.exp_year,
              last4: pm.card.last4,
              updateUrl: 'https://sortora.com/dashboard.html?billing=update'
            });
            await resend.emails.send({
              from: FROM, to: biz.email,
              subject: 'Your card ending in ' + pm.card.last4 + ' expires soon',
              html: html,
              tags: [{ name: 'category', value: 'pre-dunning' }]
            });
            sent++;
            break; // One email per business
          }
        }
      } catch (cardErr) {
        console.error('Card check error for ' + biz.id + ':', cardErr.message);
      }
    }

    return res.status(200).json({ sent: sent });
  } catch (err) {
    alertError('cron-expiring-cards', err, req);
    return res.status(500).json({ error: 'Failed' });
  }
};


async function Reengage(req, res) {
  setSecurityHeaders(res);
  if (req.method !== 'GET' && req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (process.env.CRON_SECRET && req.headers.authorization !== 'Bearer ' + process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    var now = Date.now();
    var day7 = new Date(now - 7 * 86400000).toISOString();
    var day8 = new Date(now - 8 * 86400000).toISOString();
    var day14 = new Date(now - 14 * 86400000).toISOString();
    var day15 = new Date(now - 15 * 86400000).toISOString();
    var day30 = new Date(now - 30 * 86400000).toISOString();
    var day31 = new Date(now - 31 * 86400000).toISOString();

    // Get all businesses with their last activity
    var { data: businesses } = await supabase
      .from('businesses')
      .select('id, email, owner_name, business_name, last_active_at, reengage_sent')
      .not('email', 'is', null);

    if (!businesses || !businesses.length) return res.status(200).json({ sent: 0 });

    var sent = 0;
    for (var biz of businesses) {
      var lastActive = biz.last_active_at || biz.created_at;
      if (!lastActive) continue;

      var sentList = biz.reengage_sent || [];
      var name = biz.owner_name || biz.business_name || 'there';
      var bizName = biz.business_name || 'your business';
      var templateKey = null;
      var subject = '';
      var templateFn = null;

      // 7 days inactive (within 7-8 day window)
      if (lastActive <= day7 && lastActive > day8 && !sentList.includes('day7')) {
        templateKey = 'day7'; subject = 'Everything okay with ' + bizName + '?';
        templateFn = emails.reengageDay7;
      }
      // 14 days inactive
      else if (lastActive <= day14 && lastActive > day15 && !sentList.includes('day14')) {
        templateKey = 'day14'; subject = 'Quick check-in from Riley';
        templateFn = emails.reengageDay14;
      }
      // 30 days inactive
      else if (lastActive <= day30 && lastActive > day31 && !sentList.includes('day30')) {
        templateKey = 'day30'; subject = 'Is Sortora still a fit?';
        templateFn = emails.reengageDay30;
      }

      if (templateKey && templateFn) {
        var html = templateFn({ name: name, businessName: bizName });
        await resend.emails.send({
          from: FROM, to: biz.email, subject: subject, html: html,
          tags: [{ name: 'category', value: 're-engagement' }, { name: 'stage', value: templateKey }]
        });
        sentList.push(templateKey);
        await supabase.from('businesses').update({ reengage_sent: sentList }).eq('id', biz.id);
        sent++;
      }
    }

    return res.status(200).json({ sent: sent });
  } catch (err) {
    alertError('cron-reengage', err, req);
    return res.status(500).json({ error: 'Failed' });
  }
};


async function Monthly(req, res) {
  setSecurityHeaders(res);
  if (req.method !== 'GET' && req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (process.env.CRON_SECRET && req.headers.authorization !== 'Bearer ' + process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    var now = new Date();
    var thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    var lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    var monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    var monthName = monthNames[now.getMonth() === 0 ? 11 : now.getMonth() - 1];

    var { data: businesses } = await supabase
      .from('businesses')
      .select('id, email, owner_name, business_name')
      .not('first_split_at', 'is', null);

    if (!businesses || !businesses.length) return res.status(200).json({ sent: 0 });

    var sent = 0;
    for (var biz of businesses) {
      var { data: thisMonth } = await supabase.from('booking_sessions').select('total_amount, status')
        .eq('business_id', biz.id).gte('created_at', lastMonthStart.toISOString()).lt('created_at', thisMonthStart.toISOString());
      var { data: prevMonth } = await supabase.from('booking_sessions').select('total_amount, status')
        .eq('business_id', biz.id).gte('created_at', new Date(now.getFullYear(), now.getMonth() - 2, 1).toISOString()).lt('created_at', lastMonthStart.toISOString());

      var revenue = (thisMonth || []).filter(function(b){return b.status==='confirmed'}).reduce(function(s,b){return s+(b.total_amount||0)},0);
      var prevRevenue = (prevMonth || []).filter(function(b){return b.status==='confirmed'}).reduce(function(s,b){return s+(b.total_amount||0)},0);
      var bookings = (thisMonth || []).length;
      var confirmed = (thisMonth || []).filter(function(b){return b.status==='confirmed'}).length;
      var completionRate = bookings > 0 ? Math.round(confirmed / bookings * 100) : 0;

      if (bookings === 0 && (prevMonth || []).length === 0) continue;

      var name = biz.owner_name || biz.business_name || 'there';
      var html = emails.monthlySummary({
        name: name, businessName: biz.business_name || 'your business',
        monthName: monthName, revenue: revenue, prevRevenue: prevRevenue,
        bookings: bookings, completionRate: completionRate, payouts: revenue * 0.97
      });

      await resend.emails.send({
        from: FROM, to: biz.email,
        subject: monthName + ' summary: $' + revenue.toFixed(0) + ' collected',
        html: html,
        tags: [{ name: 'category', value: 'monthly-summary' }]
      });
      sent++;
    }

    return res.status(200).json({ sent: sent });
  } catch (err) {
    alertError('cron-monthly', err, req);
    return res.status(500).json({ error: 'Failed' });
  }
};



async function PaymentReminder(req, res) {
  setSecurityHeaders(res);
  if (process.env.CRON_SECRET && req.headers.authorization !== 'Bearer ' + process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Find unpaid participants in active (non-expired) bookings created 2+ days ago
    var cutoff = new Date(Date.now() - 2 * 86400000).toISOString();

    var { data: unpaid } = await supabase
      .from('participants')
      .select('id, name, email, amount, payment_token, payment_status, reminder_sent, booking_session_id, booking_sessions(id, title, status, expires_at, business_id, businesses(business_name))')
      .eq('payment_status', 'pending')
      .lt('created_at', cutoff);

    if (!unpaid || !unpaid.length) return res.status(200).json({ sent: 0 });

    var sent = 0;
    for (var p of unpaid) {
      if (p.reminder_sent) continue;
      if (!p.booking_sessions || p.booking_sessions.status !== 'pending') continue;
      if (p.booking_sessions.expires_at && new Date(p.booking_sessions.expires_at) < new Date()) continue;
      if (!p.email) continue;

      var paidCount = 0;
      var totalCount = 0;
      try {
        var { data: allParts } = await supabase.from('participants').select('payment_status').eq('booking_session_id', p.booking_session_id);
        totalCount = (allParts || []).length;
        paidCount = (allParts || []).filter(function(x){return x.payment_status==='paid'}).length;
      } catch(e) {}

      var expiresIn = '';
      if (p.booking_sessions.expires_at) {
        var diff = new Date(p.booking_sessions.expires_at) - new Date();
        var days = Math.ceil(diff / 86400000);
        if (days > 0) expiresIn = days + ' day' + (days > 1 ? 's' : '');
      }

      var html = emails.paymentReminder({
        name: p.name || 'there',
        bookingTitle: p.booking_sessions.title,
        businessName: p.booking_sessions.businesses ? p.booking_sessions.businesses.business_name : '',
        amount: p.amount,
        payUrl: 'https://sortora.com/pay.html?token=' + p.payment_token,
        paidCount: paidCount,
        totalCount: totalCount,
        expiresIn: expiresIn
      });

      await resend.emails.send({
        from: FROM,
        to: p.email,
        subject: 'Reminder: Pay your  + ' share for ' + p.booking_sessions.title,
        html: html,
        tags: [{ name: 'category', value: 'payment-reminder' }]
      });

      await supabase.from('participants').update({ reminder_sent: true }).eq('id', p.id);
      sent++;
    }

    return res.status(200).json({ sent: sent });
  } catch (err) {
    alertError('cron-payment-reminder', err, req);
    return res.status(500).json({ error: 'Failed' });
  }
}

module.exports = { Reset, Nudge, Digest, ExpiringCards, Reengage, Monthly, PaymentReminder };
 + parseFloat(p.amount).toFixed(0) + ' share for ' + p.booking_sessions.title,
        html: html,
        tags: [{ name: 'category', value: 'payment-reminder' }]
      });

      await supabase.from('participants').update({ reminder_sent: true }).eq('id', p.id);
      sent++;
    }

    return res.status(200).json({ sent: sent });
  } catch (err) {
    alertError('cron-payment-reminder', err, req);
    return res.status(500).json({ error: 'Failed' });
  }
}

module.exports = { Reset, Nudge, Digest, ExpiringCards, Reengage, Monthly };
