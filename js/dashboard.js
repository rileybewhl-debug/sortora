var SB = window.supabase.createClient('https://gzwyzocfohtnejttkglg.supabase.co','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6d3l6b2Nmb2h0bmVqdHRrZ2xnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNjkzNDAsImV4cCI6MjA4ODY0NTM0MH0.WTEGzb2zz7UxjpukffbWFLF5Zup2lC65f1H5nQBE_fw');
var currentUser = null, bizData = null, allBookings = [], chartInstance = null, currentFilter = 'all', currentChartType = 'line', currentInterval = 'daily';
var avatarColors = ['#3B6BFF','#8b5cf6','#f59e0b','#1A8917','#ef4444','#ec4899','#6366f1','#14b8a6'];

function showView(id, el) {
  window.scrollTo(0, 0);
  document.querySelectorAll('.view').forEach(function(v) { v.classList.remove('active'); });
  document.getElementById('view-' + id).classList.add('active');
  document.querySelectorAll('.sb-item').forEach(function(s) { s.classList.remove('active'); });
  document.querySelectorAll('.mn-item').forEach(function(m) { m.classList.remove('active'); });
  if (el) el.classList.add('active');
  // Rebuild chart when Analytics view becomes visible (charts fail in hidden divs)
  if (id === 'analytics' && allBookings.length > 0) {
    setTimeout(function() { buildChart(allBookings); updateStats(); updateFunnel(); updateAnalytics(); }, 50);
  }
  // Update Home page data when switching to it
  if (id === 'overview') { updateHomePage(); }
}

async function init() {
  var r = await SB.auth.getSession();
  if (!r.data.session) { window.location.href = '/login.html'; return; }
  currentUser = r.data.session.user;

  var biz = await SB.from('businesses').select('*').eq('id', currentUser.id).single();
  if (!biz.data) { await SB.from('businesses').upsert({ id: currentUser.id, business_name: currentUser.email.split('@')[0], email: currentUser.email }); biz = await SB.from('businesses').select('*').eq('id', currentUser.id).single(); if (!biz.data) { window.location.href = '/signup.html'; return; } }
  bizData = biz.data;

  document.getElementById('welcome-title').textContent = 'Welcome back' + (bizData.owner_name ? ', ' + bizData.owner_name.split(' ')[0] : '');
  document.getElementById('sb-name').textContent = bizData.business_name || 'Business';
  document.getElementById('sb-avatar').textContent = (bizData.business_name || 'B').charAt(0);

  var planLimits = { starter: 50, growth: 500, scale: 2000, enterprise: 99999 };
  var plan = bizData.plan || 'starter';
  var limit = planLimits[plan] || 10;
  var used = bizData.splits_this_month || 0;
  document.getElementById('plan-name').textContent = plan.charAt(0).toUpperCase() + plan.slice(1);
  document.getElementById('plan-usage').textContent = used + ' / ' + (plan === 'pro' ? '∞' : limit) + ' splits this month';
  var pctUsed = plan === 'enterprise' ? 0 : Math.min(used / limit * 100, 100);
  document.getElementById('plan-bar').style.width = pctUsed + '%';
  if (pctUsed >= 80 && pctUsed < 100) document.getElementById('plan-bar').style.background = '#D97706';
  if (pctUsed >= 100) { document.getElementById('plan-bar').style.background = '#D92D20'; document.getElementById('plan-usage').innerHTML = used + ' / ' + limit + ' splits <a href="#" onclick="showView(\'settings\')" style="color:#3B6BFF;font-weight:700;margin-left:8px">Upgrade \u2192</a>'; }
  var ub = document.getElementById('upgrade-banner');
  if (ub && plan !== 'enterprise') {
    if (pctUsed >= 80) { ub.style.display = ''; document.getElementById('upgrade-banner-title').textContent = pctUsed >= 100 ? 'You\u2019ve hit your plan limit' : 'You\u2019ve used ' + used + ' of ' + limit + ' splits'; document.getElementById('upgrade-banner-desc').textContent = pctUsed >= 100 ? 'Upgrade now to keep collecting split payments.' : 'Upgrade to unlock more splits and lower per-transaction fees.'; }
    else { ub.style.display = 'none'; }
  }
  var lf = document.getElementById('locked-forecast');
  if (lf) { lf.style.display = (plan === 'starter') ? '' : 'none'; }

  updateEmbedCode();
  document.getElementById('set-biz').value = bizData.business_name || '';
  document.getElementById('set-name').value = bizData.owner_name || '';
  document.getElementById('set-website').value = bizData.website || '';
  document.getElementById('set-category').value = bizData.category || '';
  highlightPlan(plan);
  renderOnboarding();
  updateBillingDisplay();

  if (bizData.stripe_onboarded) {
    document.getElementById('stripe-prompt').style.display = 'none';
    var btn = document.getElementById('stripe-btn-settings');
    btn.textContent = 'Change account'; btn.className = 'stripe-btn stripe-btn-change'; btn.disabled = false;
    btn.onclick = changeStripeAccount;
    document.getElementById('stripe-title').innerHTML = 'Stripe Connected <span style="display:inline-flex;align-items:center;gap:4px;margin-left:8px;padding:2px 8px;background:#E8F5E8;color:#1A8917;border-radius:6px;font-size:11px;font-weight:700;vertical-align:middle"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>Active</span>';
    document.getElementById('stripe-desc').textContent = 'Your account is connected and ready to receive payouts.';
  } else {
    document.getElementById('stripe-prompt').style.display = 'block';
  }

  var params = new URLSearchParams(window.location.search);
  if (params.get('stripe') === 'success') {
    await SB.from('businesses').update({ stripe_onboarded: true }).eq('id', currentUser.id);
    window.location.href = '/dashboard.html';
  }
  if (params.get('reconnect') === 'true' && params.get('view') === 'settings') {
    setTimeout(function() {
      var settingsItem = document.querySelector('.sb-item:nth-child(7)') || document.querySelector('.sb-item[onclick*="settings"]');
      if (settingsItem) showView('settings', settingsItem);
      setTimeout(function() { connectStripe(); }, 400);
    }, 300);
  }

  await loadBookings();

  if (params.get("billing") === "success") {
    var newPlan = params.get("plan") || "growth";
    await SB.from("businesses").update({ plan: newPlan, subscription_status: "active" }).eq("id", currentUser.id);
    bizData.plan = newPlan;
    highlightPlan(newPlan);
    document.getElementById("plan-name").textContent = newPlan.charAt(0).toUpperCase() + newPlan.slice(1);
    var newLimit = planLimits[newPlan] || 50;
    document.getElementById("plan-usage").textContent = (bizData.splits_this_month || 0) + " / " + newLimit + " splits this month";
    window.history.replaceState({}, "", "/dashboard.html");
          closePlanModal();
    updateBillingDisplay();
  }

  updateHomePage();
}
/* ── Home Page ── */
function updateHomePage() {
  // Today's Revenue
  var todayRev = 0, yesterdayRev = 0;
  var now = new Date();
  var todayStr = now.toDateString();
  var yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
  var yesterdayStr = yesterday.toDateString();
  allBookings.forEach(function(b) {
    (b.participants || []).forEach(function(p) {
      if (p.status === 'paid' && p.paid_at) {
        var pd = new Date(p.paid_at);
        if (pd.toDateString() === todayStr) todayRev += parseFloat(p.amount);
        if (pd.toDateString() === yesterdayStr) yesterdayRev += parseFloat(p.amount);
      }
    });
  });
  var revEl = document.getElementById('home-today-rev');
  if (revEl) revEl.textContent = todayRev > 0 ? '$' + todayRev.toLocaleString('en-US', { minimumFractionDigits: 0 }) : '\u2014';
  var revSub = document.getElementById('home-today-rev-sub');
  if (revSub) {
    if (yesterdayRev > 0 && todayRev > 0) {
      var pctChange = Math.round((todayRev - yesterdayRev) / yesterdayRev * 100);
      var arrow = pctChange >= 0 ? '\u2191' : '\u2193';
      var color = pctChange >= 0 ? '#1A8917' : '#D92D20';
      revSub.innerHTML = '<span style="color:' + color + ';font-weight:700">' + arrow + ' ' + Math.abs(pctChange) + '%</span> vs yesterday';
    } else if (todayRev > 0) {
      revSub.innerHTML = '<span style="color:#1A8917;font-weight:700">\u2191 New</span> today';
    } else {
      revSub.textContent = 'today';
    }
  }

  // Active Splits count
  var activeCount = allBookings.filter(function(b) { return b.status === 'pending'; }).length;
  var activeEl = document.getElementById('home-active-count');
  if (activeEl) activeEl.textContent = activeCount || '\u2014';

  // Streak indicator
  var streakEl = document.getElementById('streak-indicator');
  if (streakEl && allBookings.length > 0) {
    var weekMs = 7 * 86400000;
    var nowTs = now.getTime();
    var streak = 0;
    for (var w = 0; w < 52; w++) {
      var wStart = nowTs - (w + 1) * weekMs;
      var wEnd = nowTs - w * weekMs;
      var hasBooking = allBookings.some(function(b) { var t = new Date(b.created_at).getTime(); return t >= wStart && t < wEnd; });
      if (hasBooking) streak++;
      else break;
    }
    if (streak >= 2) {
      streakEl.style.display = '';
      document.getElementById('streak-text').textContent = streak + ' week streak';
      document.getElementById('streak-sub').textContent = streak >= 5 ? 'you\'re on fire!' : 'consecutive weeks with bookings';
    } else {
      streakEl.style.display = 'none';
    }
  }

  // Next Payout card
  var feeRates = { starter: 0.03, growth: 0.025, scale: 0.02, enterprise: 0.02 };
  var feeRate = feeRates[(bizData && bizData.plan) || 'starter'] || 0.03;
  var pendingPayout = 0;
  allBookings.forEach(function(b) {
    if (b.status === 'confirmed') {
      pendingPayout += parseFloat(b.total_amount || 0) * (1 - feeRate);
    }
  });
  var payoutCard = document.getElementById('next-payout-card');
  if (payoutCard) {
    if (pendingPayout > 0) {
      payoutCard.style.display = '';
      document.getElementById('next-payout-amount').textContent = '$' + pendingPayout.toFixed(0);
    } else {
      payoutCard.style.display = 'none';
    }
  }

  // Pending Actions
  var pendingList = document.getElementById('pending-list');
  if (!pendingList) return;
  var actions = [];
  allBookings.forEach(function(b) {
    if (b.status === 'pending') {
      var unpaid = (b.participants || []).filter(function(p) { return p.status !== 'paid'; });
      if (unpaid.length > 0) {
        actions.push({ type: 'unpaid', booking: b, count: unpaid.length });
      }
    }
  });
  // Recent payments (last 24 hours)
  allBookings.forEach(function(b) {
    (b.participants || []).forEach(function(p) {
      if (p.status === 'paid' && p.paid_at) {
        var paidDate = new Date(p.paid_at);
        if (now - paidDate < 86400000) {
          actions.push({ type: 'payment', booking: b, participant: p });
        }
      }
    });
  });

  if (actions.length === 0) {
    pendingList.innerHTML = '<div style="text-align:center;padding:24px;color:#6B6B6B"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1A8917" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom:8px"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg><div style="font-weight:600;color:#1A1A1A;margin-bottom:4px">You\'re all caught up</div><div style="font-size:13px">No splits need your attention right now.</div></div>';
    return;
  }

  // Show max 5 action items
  var html = actions.slice(0, 5).map(function(a) {
    if (a.type === 'unpaid') {
      return '<div style="display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid #F0F0EE;cursor:pointer" onclick="showView(\'bookings\',document.querySelectorAll(\'.sb-item\')[1])"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D97706" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg><div style="flex:1"><div style="font-weight:600;font-size:14px">' + (a.booking.title || 'Booking') + '</div><div style="font-size:13px;color:#6B6B6B">' + a.count + ' participant' + (a.count > 1 ? 's' : '') + ' haven\'t paid yet</div></div><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9B9B9B" stroke-width="1.5"><polyline points="9 18 15 12 9 6"/></svg></div>';
    }
    if (a.type === 'payment') {
      return '<div style="display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid #F0F0EE"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1A8917" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg><div style="flex:1"><div style="font-weight:600;font-size:14px">$' + parseFloat(a.participant.amount).toFixed(0) + ' received</div><div style="font-size:13px;color:#6B6B6B">' + (a.booking.title || 'Booking') + '</div></div></div>';
    }
    return '';
  }).join('');
  pendingList.innerHTML = html;
}

/* ── Onboarding ── */
function renderOnboarding() {
  var steps = [
    { id: 'account', text: 'Create your account', done: true, action: null },
    { id: 'stripe', text: 'Connect Stripe', done: !!bizData.stripe_onboarded, action: bizData.stripe_onboarded ? null : 'connectStripe()' },
    { id: 'widget', text: 'Embed widget on your site', done: !!localStorage.getItem('sortora_widget_copied'), action: "showView('embed')" },
    { id: 'split', text: 'Start collecting split payments', done: (bizData.splits_this_month || 0) > 0, action: 'openCreateModal()' }
  ];
  var doneCount = steps.filter(function(s) { return s.done; }).length;
  var pct = Math.round((doneCount + 1) / (steps.length + 1) * 100);
var obBar = document.getElementById('ob-bar');
var obCount = document.getElementById('ob-count');
var obPct = document.getElementById('ob-pct');
if (obBar) obBar.style.width = pct + '%';
if (obCount) obCount.textContent = (doneCount + 1) + " of " + (steps.length + 1) + " complete";
if (obPct) obPct.textContent = pct + '%';
  
  // Persistent banner for incomplete onboarding
  var banner = document.getElementById("ob-banner");
  if (banner) banner.style.display = doneCount < steps.length ? "flex" : "none";

if (doneCount === steps.length) { var obEl = document.getElementById('onboarding'); if (localStorage.getItem('sortora_milestones_seen')) { if (obEl) obEl.style.display = 'none'; if (banner) banner.style.display = 'none'; return; } localStorage.setItem('sortora_milestones_seen', Date.now().toString()); var totalRev = 0; allBookings.forEach(function(b) { (b.participants||[]).forEach(function(p) { if (p.status==='paid') totalRev += parseFloat(p.amount); }); }); var mItems = [{i:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1A8917" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/><path d="M12 3v12"/><path d="M5 21h14"/></svg>',l:'First split created',d:allBookings.length>=1},{i:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1A8917" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>',l:'First payout received',d:totalRev>0},{i:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1A8917" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>',l:'$500 in revenue',d:totalRev>=500},{i:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1A8917" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>',l:'50th booking',d:allBookings.length>=50}]; obEl.innerHTML = '<div style="padding:24px"><div style="font-size:16px;font-weight:800;margin-bottom:16px">Milestones</div>' + mItems.map(function(m) { return '<div style="display:flex;align-items:center;gap:12px;padding:8px 0;font-size:14px"><span style="font-size:20px">' + m.i + '</span><span style="font-weight:600;color:' + (m.d ? '#1A8917' : '#757575') + '">' + m.l + (m.d ? ' \u2713' : '') + '</span></div>'; }).join('') + '</div>';  try { var cs = document.createElement("div"); cs.style.cssText = "position:fixed;top:0;left:0;right:0;bottom:0;pointer-events:none;z-index:9999"; cs.innerHTML = Array.from({length:60}, function() { var co = ["#3B6BFF","#93C5FD","#6366F1","#A5B4FC","#BFDBFE"][Math.floor(Math.random()*5)]; return "<div style=\"position:absolute;width:8px;height:8px;background:"+co+";border-radius:50%;top:-10px;left:"+Math.random()*100+"%;animation:confettiFall "+(1+Math.random()*2)+"s ease-out forwards;animation-delay:"+Math.random()*0.5+"s\"></div>"; }).join(""); document.body.appendChild(cs); setTimeout(function(){cs.remove();},4000); } catch(ce) {} ; return; }
  document.getElementById('ob-steps').innerHTML = steps.map(function(s) {
    return '<div class="ob-step' + (s.done ? ' completed' : '') + '">'
      + '<div class="ob-check' + (s.done ? ' done' : '') + '"><svg viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div>'
      + '<div class="ob-step-text">' + s.text + '</div>'
      + (s.action && !s.done ? '<a class="ob-step-action" onclick="' + s.action + '">Set up →</a>' : '')
      + '</div>';
  }).join('');
}

/* ── Chart ── */
function buildChart(bookings) {
  // Empty state for chart
  var hasRevenue = bookings.some(function(b) { return (b.participants||[]).some(function(p) { return p.status === "paid"; }); });
  if (!hasRevenue) { try { document.getElementById("chart-total").textContent = "\u2014"; document.getElementById("chart-total").style.color = "#757575"; } catch(e) {} }

  var labels = [], data = [];
  var now = new Date();
  if (currentInterval === 'daily') {
    for (var i = 29; i >= 0; i--) {
      var d = new Date(now); d.setDate(d.getDate() - i);
      labels.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
      var dayTotal = 0;
      bookings.forEach(function(b) {
        (b.participants || []).forEach(function(p) {
          if (p.status === 'paid' && p.paid_at) {
            var pd = new Date(p.paid_at);
            if (pd.toDateString() === d.toDateString()) dayTotal += parseFloat(p.amount);
          }
        });
      });
      data.push(dayTotal);
    }
  } else if (currentInterval === 'weekly') {
    for (var i = 11; i >= 0; i--) {
      var weekStart = new Date(now); weekStart.setDate(weekStart.getDate() - i * 7);
      var weekEnd = new Date(weekStart); weekEnd.setDate(weekEnd.getDate() + 6);
      labels.push(weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
      var weekTotal = 0;
      bookings.forEach(function(b) {
        (b.participants || []).forEach(function(p) {
          if (p.status === 'paid' && p.paid_at) {
            var pd = new Date(p.paid_at);
            if (pd >= weekStart && pd <= weekEnd) weekTotal += parseFloat(p.amount);
          }
        });
      });
      data.push(weekTotal);
    }
  } else {
    for (var i = 5; i >= 0; i--) {
      var d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      labels.push(d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }));
      var mTotal = 0;
      bookings.forEach(function(b) {
        (b.participants || []).forEach(function(p) {
          if (p.status === 'paid' && p.paid_at) {
            var pd = new Date(p.paid_at);
            if (pd.getMonth() === d.getMonth() && pd.getFullYear() === d.getFullYear()) mTotal += parseFloat(p.amount);
          }
        });
      });
      data.push(mTotal);
    }
  }
  var total = data.reduce(function(a, b) { return a + b; }, 0);
  document.getElementById('chart-total').textContent = '$' + total.toLocaleString('en-US', { minimumFractionDigits: 0 });
  document.getElementById('chart-label').textContent = currentInterval === 'daily' ? 'Last 30 days' : currentInterval === 'weekly' ? 'Last 12 weeks' : 'Last 6 months';

  if (chartInstance) chartInstance.destroy();
  var ctx = document.getElementById('revenue-chart').getContext('2d');
  var gradient = ctx.createLinearGradient(0, 0, 0, 260);
  gradient.addColorStop(0, 'rgba(59,107,255,.15)');
  gradient.addColorStop(1, 'rgba(59,107,255,.01)');

  chartInstance = new Chart(ctx, {
    type: currentChartType,
    data: {
      labels: labels,
      datasets: [{
        data: data,
        borderColor: '#3B6BFF',
        backgroundColor: currentChartType === 'line' ? gradient : 'rgba(59,107,255,.6)',
        borderWidth: 2.5,
        fill: currentChartType === 'line',
        tension: 0.4,
        pointRadius: 0,
        pointHitRadius: 20,
        borderRadius: currentChartType === 'bar' ? 6 : 0
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { backgroundColor: '#1A1A1A', titleFont: { family: 'DM Sans', weight: '700' }, bodyFont: { family: 'DM Sans' }, padding: 10, cornerRadius: 8, callbacks: { label: function(ctx) { return '$' + ctx.raw.toFixed(2); } } } },
      scales: { x: { grid: { display: false }, ticks: { font: { family: 'DM Sans', size: 11, weight: '500' }, color: '#757575', maxTicksLimit: 8 } }, y: { grid: { color: '#f5f5f5' }, ticks: { font: { family: 'DM Sans', size: 11 }, color: '#757575', callback: function(v) { return '$' + v; } }, beginAtZero: true } }
    }
  });
}

function setChartInterval(interval, el) {
  currentInterval = interval;
  el.parentNode.querySelectorAll('button').forEach(function(b) { b.classList.remove('active'); });
  el.classList.add('active');
  buildChart(allBookings);
}

function setChartType(type, el) {
  currentChartType = type;
  el.parentNode.querySelectorAll('button').forEach(function(b) { b.classList.remove('active'); });
  el.classList.add('active');
  buildChart(allBookings);
}

/* ── Activity Feed ── */
function buildActivityFeed(bookings) {
  var events = [];
  bookings.forEach(function(b) {
    events.push({ type: 'created', text: '<b>' + b.title + '</b> split created', time: new Date(b.created_at) });
    if (b.status === 'confirmed') events.push({ type: 'confirmed', text: '<b>' + b.title + '</b> — booking confirmed, all paid', time: new Date(b.updated_at || b.created_at) });
    (b.participants || []).forEach(function(p) {
      if (p.status === 'paid' && p.paid_at) {
        events.push({ type: 'payment', text: '<b>' + (p.email ? p.email.split('@')[0] : 'Someone') + '</b> paid $' + parseFloat(p.amount).toFixed(0) + ' for <b>' + b.title + '</b>', time: new Date(p.paid_at) });
      }
    });
  });
  events.sort(function(a, b) { return b.time - a.time; });
  var el = document.getElementById('feed-list');
  if (!events.length) { el.innerHTML = '<div class="empty-sample"><div class="empty-sample-preview"><div class="empty-sample-card"><strong>Escape Room - 6 people</strong>$180 total · 4 of 6 paid</div><div class="empty-sample-card"><strong>Pottery Class - 4 people</strong>$120 total · Fully paid ✓</div></div><div class="empty-sample-title">Your activity feed will appear here</div><div class="empty-sample-desc">Once you create your first split payment, you\'ll see real-time updates as participants pay their share.</div><button class="empty-sample-btn" onclick="openCreateModal()">Create my first split</button></div>'; return; }
  el.innerHTML = events.slice(0, 5).map(function(e) {
    var ago = timeAgo(e.time);
    return '<div class="feed-item"><div class="feed-dot ' + e.type + '"></div><div class="feed-info"><div class="feed-text">' + e.text + '</div><div class="feed-time">' + ago + '</div></div></div>';
  }).join('') + (events.length > 5 ? '<div style="text-align:center;padding:12px"><a href="#" onclick="showView(\'analytics\',document.querySelectorAll(\'.sb-item\')[3]);return false" style="color:#3B6BFF;font-weight:600;font-size:13px;text-decoration:none">View all activity \u2192</a></div>' : '');
}

function timeAgo(date) {
  var s = Math.floor((new Date() - date) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return Math.floor(s / 60) + 'm ago';
  if (s < 86400) return Math.floor(s / 3600) + 'h ago';
  if (s < 604800) return Math.floor(s / 86400) + 'd ago';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

var currentPeriod = 'all';


function buildSparkline(containerId, data, color) {
  var el = document.getElementById(containerId);
  if (!el || !data.length) { if (el) el.innerHTML = ""; return; }
  var max = Math.max.apply(null, data) || 1;
  var w = 100, h = 24, pts = [];
  for (var i = 0; i < data.length; i++) {
    pts.push((i / (data.length - 1)) * w + "," + (h - (data[i] / max) * (h - 4) - 2));
  }
  el.innerHTML = '<svg viewBox="0 0 100 24" preserveAspectRatio="none"><path d="M' + pts.join(" L") + '" stroke="' + color + '"/></svg>';
}

function updateStats() {
  var filtered = getFilteredBookings();
  var periodLabel = currentPeriod === "all" ? "all time" : currentPeriod === "today" ? "today" : "last " + currentPeriod;
  var totalSplits = 0, totalRevenue = 0, active = 0, confirmed = 0;
  filtered.forEach(function(b) {
    var parts = b.participants || [];
    totalSplits += parts.length;
    parts.forEach(function(p) { if (p.status === "paid") totalRevenue += parseFloat(p.amount); });
    if (b.status === "pending") active++;
    if (b.status === "confirmed") confirmed++;
  });

  // Trend arrows
  var now = new Date();
  var prevFiltered = allBookings.filter(function(b) {
    var dt = new Date(b.created_at);
    if (currentPeriod === "today") { var y = new Date(); y.setDate(y.getDate()-1); return dt >= new Date(y.getFullYear(),y.getMonth(),y.getDate()) && dt < new Date(now.getFullYear(),now.getMonth(),now.getDate()); }
    if (currentPeriod === "7d") { return dt >= new Date(now-14*86400000) && dt < new Date(now-7*86400000); }
    if (currentPeriod === "30d") { return dt >= new Date(now-60*86400000) && dt < new Date(now-30*86400000); }
    if (currentPeriod === "90d") { return dt >= new Date(now-180*86400000) && dt < new Date(now-90*86400000); }
    return false;
  });
  var prevRevenue = 0;
  prevFiltered.forEach(function(b) { (b.participants||[]).forEach(function(p) { if (p.status==="paid") prevRevenue += parseFloat(p.amount); }); });
  var revChange = prevRevenue > 0 ? Math.round((totalRevenue - prevRevenue) / prevRevenue * 100) : 0;
  var revArrow = revChange >= 0 ? "\u2191" : "\u2193";
  var revColor = revChange >= 0 ? "#1A8917" : "#D92D20";

  document.getElementById("ov-splits").textContent = totalSplits || "\u2014";
  document.getElementById("ov-revenue").textContent = totalRevenue > 0 ? "$" + totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 0 }) : "\u2014";
  document.getElementById("ov-active").textContent = active || "\u2014";
  document.getElementById("ov-confirmed").textContent = confirmed || "\u2014";
  document.querySelectorAll("#stats-real .stat-sub").forEach(function(el) { el.textContent = periodLabel; });
  if (currentPeriod !== "all") {
    var subs = document.querySelectorAll("#stats-real .stat-sub");
    if (subs[1]) subs[1].innerHTML = prevRevenue > 0 ? "<span style=\"color:" + revColor + ";font-weight:700\">" + revArrow + " " + Math.abs(revChange) + "%</span> vs prev " + currentPeriod : (totalRevenue > 0 ? "<span style=\"color:#1A8917;font-weight:700\">\u2191 New</span> this " + currentPeriod : periodLabel);
  }

  
  // Sparklines
  var days7 = [];
  for (var si = 6; si >= 0; si--) {
    var sd = new Date(); sd.setDate(sd.getDate() - si);
    var dayRev = 0, daySplits = 0, dayActive = 0, dayConfirmed = 0;
    allBookings.forEach(function(b) {
      if (new Date(b.created_at).toDateString() === sd.toDateString()) {
        daySplits += (b.participants || []).length;
        (b.participants || []).forEach(function(p) { if (p.status === "paid") dayRev += parseFloat(p.amount); });
        if (b.status === "pending") dayActive++;
        if (b.status === "confirmed") dayConfirmed++;
      }
    });
    days7.push({ rev: dayRev, splits: daySplits, active: dayActive, confirmed: dayConfirmed });
  }
  buildSparkline("spark-splits", days7.map(function(d) { return d.splits; }), "#1A1A1A");
  buildSparkline("spark-revenue", days7.map(function(d) { return d.rev; }), "#1A8917");
  buildSparkline("spark-active", days7.map(function(d) { return d.active; }), "#3B6BFF");
  buildSparkline("spark-confirmed", days7.map(function(d) { return d.confirmed; }), "#1A1A1A");
  try { updateFunnel(); updateAnalytics(); } catch(e) {}
}
function setPeriod(period, btn) {
  currentPeriod = period;
  var btns = document.querySelectorAll('.period-btn');
  btns.forEach(function(b) { b.classList.remove('active'); });
  btn.classList.add('active');
  updateStats();
}

function getFilteredBookings() {
  if (currentPeriod === 'all') return allBookings;
  var now = new Date();
  var cutoff;
  if (currentPeriod === 'today') {
    cutoff = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  } else if (currentPeriod === '7d') {
    cutoff = new Date(now - 7 * 86400000);
  } else if (currentPeriod === '30d') {
    cutoff = new Date(now - 30 * 86400000);
  } else if (currentPeriod === '90d') {
    cutoff = new Date(now - 90 * 86400000);
  }
  return allBookings.filter(function(b) { return new Date(b.created_at) >= cutoff; });
}

/* ── Load Bookings ── */
async function loadBookings() {
  var r = await SB.from('booking_sessions')
    .select('*, participants(id, email, name, amount, status, paid_at)')
    .eq('business_id', currentUser.id)
    .order('created_at', { ascending: false });
  allBookings = r.data || [];



  // Update stats
  var totalSplits = 0, totalRevenue = 0, active = 0, confirmed = 0;
  allBookings.forEach(function(b) {
    var parts = b.participants || [];
    totalSplits += parts.length;
    parts.forEach(function(p) { if (p.status === 'paid') totalRevenue += parseFloat(p.amount); });
    if (b.status === 'pending') active++;
    if (b.status === 'confirmed') confirmed++;
  });
  document.getElementById('ov-splits').textContent = totalSplits || '\u2014';
  document.getElementById('ov-revenue').textContent = '$' + totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 0 });
  document.getElementById('ov-active').textContent = active || '\u2014';
  document.getElementById('ov-confirmed').textContent = confirmed || '\u2014';
  try { updateFunnel(); updateAnalytics(); generateNotifications(); checkMilestones(); } catch(e) {}
  try { document.getElementById('ov-count').textContent = allBookings.length + ' total'; } catch(e) {}
  document.getElementById('bk-count').textContent = allBookings.length + ' total';

  // Payout estimates
  var feeRate = { starter: 0.03, growth: 0.025, pro: 0.02 };
  var rate = feeRate[bizData.plan || 'starter'] || 0.03;
  var earned = totalRevenue * (1 - rate);
  document.getElementById('po-earned').textContent = '$' + earned.toFixed(0);
  document.getElementById('po-pending').textContent = '$' + (active > 0 ? '—' : '0');
  document.getElementById('po-paid').textContent = '$' + (confirmed > 0 ? earned.toFixed(0) : '0');

  // Hide skeletons
  document.getElementById('stats-skeleton').classList.add('hidden');
  document.getElementById('stats-real').style.display = '';
  try { document.getElementById('ov-skeleton').classList.add('hidden'); } catch(e) {}
  try { document.getElementById('ov-list').style.display = ''; } catch(e) {}
  document.getElementById('bk-skeleton').classList.add('hidden');
  document.getElementById('bk-list').style.display = '';

  if (document.getElementById('ov-list')) { renderBookingList('ov-list', allBookings.slice(0, 5)); }
  renderBookingList('bk-list', allBookings);
  buildActivityFeed(allBookings);
  renderOnboarding();
}

function renderBookingList(containerId, bookings) {
  var el = document.getElementById(containerId);
  if (!bookings.length) {
    el.innerHTML = '<div class="empty"><div class="empty-icon"><svg viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></div><h3>No bookings yet</h3><p>Create your first split to get started.</p><button onclick="openCreateModal()" style="margin-top:12px;padding:10px 24px;background:#3B6BFF;color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit">Create your first split \u2192</button></div>';
    return;
  }
  el.innerHTML = bookings.map(function(b, idx) {
    var parts = b.participants || [];
    var paid = parts.filter(function(p) { return p.status === 'paid'; }).length;
    var pct = parts.length ? Math.round(paid / parts.length * 100) : 0;
    var statusCls = b.status === 'confirmed' ? 'confirmed' : b.status === 'expired' ? 'expired' : 'pending';
    var unpaid = parts.length - paid;
    var balanceDue = unpaid > 0 && b.status !== 'expired' ? ' <span style="color:#D92D20;font-weight:700;font-size:11px">' + unpaid + ' unpaid</span>' : '';
    var icon = b.status === 'confirmed' ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1A8917" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>' : b.status === 'expired' ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D92D20" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>' : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D97706" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>';
    var date = new Date(b.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return '<div class="booking-row" onclick="openDrawer(' + JSON.stringify(b).replace(/"/g, '&quot;') + ')">'
      + '<div class="booking-icon ' + statusCls + '">' + icon + '</div>'
      + '<div class="booking-info"><div class="booking-title">' + b.title + '</div><div class="booking-meta">' + date + ' · ' + parts.length + ' people · <span class="badge badge-' + statusCls + '">' + b.status + '</span>' + balanceDue + '</div></div>'
      + '<div class="booking-right"><div class="booking-amount">$' + parseFloat(b.total_amount).toFixed(0) + '</div>'
      + '<div class="booking-progress"><div class="booking-prog-track"><div class="booking-prog-fill" style="width:' + pct + '%"></div></div><div class="booking-prog-text">' + paid + '/' + parts.length + '</div></div></div></div>';
  }).join('');
}

/* ── Search & Filter ── */
function filterBookings() {
  var query = document.getElementById('bk-search').value.toLowerCase();
  var filtered = allBookings.filter(function(b) {
    var matchesSearch = !query || b.title.toLowerCase().includes(query) || (b.participants || []).some(function(p) { return (p.email || '').toLowerCase().includes(query) || (p.name || '').toLowerCase().includes(query); });
    var matchesFilter = currentFilter === 'all' || b.status === currentFilter;
    return matchesSearch && matchesFilter;
  });
  document.getElementById('bk-count').textContent = filtered.length + ' of ' + allBookings.length;
  renderBookingList('bk-list', filtered);
}

function toggleFilter(filter, el) {
  currentFilter = filter;
  document.querySelectorAll('.filter-btn').forEach(function(b) { b.style.borderColor = '#E8E8E6'; b.style.color = '#6B6B6B'; });
  el.style.borderColor = '#3B6BFF'; el.style.color = '#3B6BFF';
  filterBookings();
}

/* ── Export CSV ── */
function exportCSV() {
  var rows = [['Title', 'Total', 'Per Person', 'Participants', 'Paid', 'Status', 'Created']];
  allBookings.forEach(function(b) {
    var parts = b.participants || [];
    var paid = parts.filter(function(p) { return p.status === 'paid'; }).length;
    rows.push([b.title, b.total_amount, b.per_person_amount, parts.length, paid, b.status, new Date(b.created_at).toLocaleDateString()]);
  });
  var csv = rows.map(function(r) { return r.map(function(c) { return '"' + String(c).replace(/"/g, '""') + '"'; }).join(','); }).join('\n');
  var blob = new Blob([csv], { type: 'text/csv' });
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'sortora-bookings-' + new Date().toISOString().split('T')[0] + '.csv';
  a.click();
}

/* ── Booking Detail Drawer ── */
function openDrawer(booking) {
  var b = typeof booking === 'string' ? JSON.parse(booking) : booking;
  document.getElementById('drawer-title').textContent = b.title;
  var parts = b.participants || [];
  var paid = parts.filter(function(p) { return p.status === 'paid'; }).length;
  var date = new Date(b.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  var html = '<div class="drawer-section"><div class="drawer-section-title">Details</div>'
    + '<div class="drawer-row"><span class="drawer-row-label">Total</span><span class="drawer-row-value">$' + parseFloat(b.total_amount).toFixed(2) + '</span></div>'
    + '<div class="drawer-row"><span class="drawer-row-label">Per person</span><span class="drawer-row-value">$' + parseFloat(b.per_person_amount).toFixed(2) + '</span></div>'
    + '<div class="drawer-row"><span class="drawer-row-label">Status</span><span class="drawer-row-value"><span class="badge badge-' + b.status + '">' + b.status + '</span></span></div>'
    + '<div class="drawer-row"><span class="drawer-row-label">Created</span><span class="drawer-row-value">' + date + '</span></div>'
    + '<div class="drawer-row"><span class="drawer-row-label">Progress</span><span class="drawer-row-value">' + paid + ' / ' + parts.length + ' paid</span></div>'
    + '</div>';

  html += '<div class="drawer-section"><div class="drawer-section-title">Participants (' + parts.length + ')</div>';
  parts.forEach(function(p, i) {
    var color = avatarColors[i % avatarColors.length];
    var initials = (p.name || p.email || '??').substring(0, 2).toUpperCase();
    var pAmt = parseFloat(p.amount || b.per_person_amount || 0).toFixed(2);
    var statusBadge = p.status === 'paid' ? '<div style="text-align:right"><span class="drawer-p-status" style="background:rgba(26,137,23,.08);color:#1A8917">Paid</span><div style="font-size:13px;font-weight:700;color:#1A8917;margin-top:2px">$' + pAmt + '</div></div>' : '<div style="text-align:right"><span class="drawer-p-status" style="background:rgba(217,45,32,.08);color:#D92D20">Owes</span><div style="font-size:13px;font-weight:700;color:#D92D20;margin-top:2px">$' + pAmt + '</div></div>';
    var paidDate = p.paid_at ? '<br><span style="font-size:10px;color:#757575">' + new Date(p.paid_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) + '</span>' : '';
    html += '<div class="drawer-participant"><div class="drawer-p-avatar" style="background:' + color + '">' + initials + '</div><div class="drawer-p-info"><div class="drawer-p-name">' + (p.name || 'Participant') + '</div><div class="drawer-p-email">' + (p.email || '') + paidDate + '</div></div>' + statusBadge + '</div>';
  });
  html += '</div>';

  // Share link
  html += '<div class="drawer-section"><div class="drawer-section-title">Share Link</div>'
    + '<div style="display:flex;gap:6px"><input style="flex:1;padding:8px 12px;border:1px solid #E8E8E6;border-radius:8px;font-size:12px;font-family:inherit;color:#1A1A1A;background:#f7f8fa" value="' + (window.location.origin + '/join.html?session=' + b.id) + '" readonly onclick="this.select()"/>'
    + '<button style="padding:8px 14px;border:none;background:#1A1A1A;color:#fff;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit" onclick="navigator.clipboard.writeText(\'' + (window.location.origin + '/join.html?session=' + b.id) + '\')">Share</button>'+'<button style="padding:8px 14px;border:none;background:#1A1A1A;color:#fff;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit" onclick="navigator.clipboard.writeText(\'' + (window.location.origin + '/join.html?session=' + b.id) + '\');this.textContent=\'Copied!\';var t=this;setTimeout(function(){t.textContent=\'Copy\'},2000)">Copy</button></div></div>';

  document.getElementById('drawer-body').innerHTML = html;
  document.getElementById('drawer-overlay').classList.add('open');
  document.getElementById('drawer').classList.add('open');
}


// Web Share API for native sharing
function shareSplitLink(url) {
  if (navigator.share) {
    navigator.share({
      title: 'Pay your share',
      text: 'You\'ve been invited to split a booking on Sortora. Pay your share here:',
      url: url
    }).catch(function() {});
  } else {
    navigator.clipboard.writeText(url).then(function() {
      alert('Link copied to clipboard!');
    });
  }
}

function closeDrawer() {
  document.getElementById('drawer-overlay').classList.remove('open');
  document.getElementById('drawer').classList.remove('open');
}

/* ── Create Split Modal ── */
function openCreateModal() { document.getElementById('modal-overlay').classList.add('open'); }
function closeCreateModal() { document.getElementById('modal-overlay').classList.remove('open'); document.getElementById('cs-success').style.display = 'none'; document.getElementById('cs-error').style.display = 'none'; }

async function createSplitManual() {
  var title = document.getElementById('cs-title').value.trim();
  var amount = parseFloat(document.getElementById('cs-amount').value);
  var count = parseInt(document.getElementById('cs-count').value);
  var name = document.getElementById('cs-name').value.trim();
  var email = document.getElementById('cs-email').value.trim();
  var errEl = document.getElementById('cs-error');
  var sucEl = document.getElementById('cs-success');
  errEl.style.display = 'none'; sucEl.style.display = 'none';

  if (!title) { errEl.textContent = 'Please enter a title.'; errEl.style.display = 'block'; return; }
  if (!amount || amount <= 0) { errEl.textContent = 'Please enter a valid amount.'; errEl.style.display = 'block'; return; }
  if (!count || count < 2) { errEl.textContent = 'Need at least 2 people.'; errEl.style.display = 'block'; return; }

  var btn = document.getElementById('cs-btn');
  btn.disabled = true; btn.textContent = 'Creating...';

  try {
    var res = await fetch('/api/create-split', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ businessId: currentUser.id, title: title, totalAmount: amount, totalParticipants: count, organizerEmail: email || null, organizerName: name || null, deadlineDays: parseInt(document.getElementById('cs-deadline').value) || 7, autoCharge: document.getElementById('cs-autocharge').checked })
    });
    var data = await res.json();
    if (data.success) {
      var joinUrl = data.joinUrl;
      sucEl.innerHTML = 'Split created! <a href="' + joinUrl + '" target="_blank" style="color:#3B6BFF">' + joinUrl + '</a> <button style="margin-left:8px;padding:6px 14px;border:none;background:#3B6BFF;color:#fff;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit" onclick="shareSplitLink(\'' + joinUrl + '\')">Share</button>';
      sucEl.style.display = 'block';
      document.getElementById('cs-title').value = '';
      document.getElementById('cs-amount').value = '';
      document.getElementById('cs-count').value = '';
      document.getElementById('cs-name').value = '';
      document.getElementById('cs-email').value = '';
      document.getElementById('cs-deadline').value = '7';
      document.getElementById('cs-autocharge').checked = false;
      try { if (allBookings.length === 0) { var confetti = document.createElement('div'); confetti.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;pointer-events:none;z-index:9999'; confetti.innerHTML = Array.from({length:50}, function() { var c = ['#3B6BFF','#1A8917','#D97706','#D92D20','#8b5cf6'][Math.floor(Math.random()*5)]; return '<div style="position:absolute;width:8px;height:8px;background:'+c+';border-radius:50%;top:-10px;left:'+Math.random()*100+'%;animation:confettiFall '+(1+Math.random()*2)+'s ease-out forwards;animation-delay:'+Math.random()*0.5+'s"></div>'; }).join(''); document.body.appendChild(confetti); setTimeout(function(){confetti.remove()},4000); } } catch(ce) {}
  loadBookings();
    } else {
      errEl.textContent = data.error || 'Something went wrong.';
      errEl.style.display = 'block';
    }
  } catch (e) {
    errEl.textContent = 'Network error.'; errEl.style.display = 'block';
  }
  btn.disabled = false; btn.textContent = 'Create Split & Send Links';
}

/* ── Embed Code ── */
function updateEmbedCode() {
  var title = document.getElementById('embed-title').value.trim();
  var amount = document.getElementById('embed-amount').value.trim();
  var code = '<span class="tag">&lt;script</span>\n  <span class="attr">src</span>=<span class="val">"https://sortora.com/widget.js"</span>\n  <span class="attr">data-business-id</span>=<span class="val">"' + currentUser.id + '"</span>';
  if (amount) code += '\n  <span class="attr">data-amount</span>=<span class="val">"' + amount + '"</span>';
  if (title) code += '\n  <span class="attr">data-title</span>=<span class="val">"' + title + '"</span>';
  code += '\n  <span class="attr">data-theme</span>=<span class="val">"auto"</span>\n<span class="tag">&gt;&lt;/script&gt;</span>';
  document.getElementById('embed-code').innerHTML = code;
}

function copyEmbed() {
  var title = document.getElementById('embed-title').value.trim();
  var amount = document.getElementById('embed-amount').value.trim();
  var text = '<script src="https://sortora.com/widget.js" data-business-id="' + currentUser.id + '"';
  if (amount) text += ' data-amount="' + amount + '"';
  if (title) text += ' data-title="' + title + '"';
  text += ' data-theme="auto"><\/script>';
  localStorage.setItem('sortora_widget_copied','1');
  try{renderOnboarding();}catch(e){}
  navigator.clipboard.writeText(text).then(function() {
    var btn = document.querySelector('.embed-copy');
    btn.textContent = 'Copied!'; setTimeout(function() { btn.textContent = 'Copy'; }, 2000);
  });
}

/* ── Settings ── */
async function saveSettings() {
  var btn = document.getElementById('save-btn');
  btn.disabled = true; btn.textContent = 'Saving...';
  document.getElementById('save-success').style.display = 'none';
  document.getElementById('save-error').style.display = 'none';
  var biz = document.getElementById('set-biz').value.trim();
  var name = document.getElementById('set-name').value.trim();
  var website = document.getElementById('set-website').value.trim();
  var category = document.getElementById('set-category').value;
  if (!biz) { document.getElementById('save-error').textContent = 'Business name is required.'; document.getElementById('save-error').style.display = 'block'; btn.disabled = false; btn.textContent = 'Save Changes'; return; }
  var r = await SB.from('businesses').update({ business_name: biz, owner_name: name, website: website, category: category }).eq('id', currentUser.id);
  if (r.error) { document.getElementById('save-error').textContent = r.error.message; document.getElementById('save-error').style.display = 'block'; }
  else { document.getElementById('save-success').style.display = 'block'; document.getElementById('sb-name').textContent = biz; }
  btn.disabled = false; btn.textContent = 'Save Changes';
}

function highlightPlan(plan) {
  ['starter','growth','scale','enterprise'].forEach(function(p) {
    var el = document.getElementById('plan-' + p);
    if (!el) return;
    if (p === plan) { el.style.borderColor = '#3B6BFF'; el.style.borderWidth = '2px'; }
    else if (p === 'enterprise') { el.style.borderColor = '#1A1A1A'; el.style.borderWidth = '1px'; }
    else { el.style.borderColor = '#E8E8E6'; el.style.borderWidth = '1px'; }
  });
}
function openPlanModal() { var m = document.getElementById("plan-modal"); m.style.opacity = "1"; m.style.pointerEvents = "auto"; highlightPlan(bizData.plan || "starter"); }
function closePlanModal() { var m = document.getElementById("plan-modal"); m.style.opacity = "0"; m.style.pointerEvents = "none"; }
function updateBillingDisplay() {
  var plan = bizData.plan || "starter";
  var info = { starter: { name: "Starter", price: "Free", detail: "$0.50 + 1.5% per split \u00B7 Up to 50 splits/month", limit: 50 }, growth: { name: "Growth", price: "$49/mo", detail: "$0.30 + 1.0% per split \u00B7 Up to 500 splits/month", limit: 500 }, scale: { name: "Scale", price: "$149/mo", detail: "$0.20 + 0.7% per split \u00B7 Up to 2,000 splits/month", limit: 2000 }, enterprise: { name: "Enterprise", price: "Custom", detail: "Volume-based pricing \u00B7 2,000+ splits/month", limit: 99999 } };
  var p = info[plan] || info.starter;
  try {
    document.getElementById("billing-plan-name").textContent = p.name;
    document.getElementById("billing-plan-price").textContent = p.price;
    document.getElementById("billing-plan-detail").textContent = p.detail;
    var used = bizData.splits_this_month || 0;
    document.getElementById("billing-plan-usage").textContent = used + " / " + (plan === "enterprise" ? "\u221E" : p.limit) + " splits";
    var pct = plan === "enterprise" ? 0 : Math.min(used / p.limit * 100, 100);
    document.getElementById("billing-plan-bar").style.width = pct + "%";
  } catch(e) {}
}
async function selectPlan(plan) {
  highlightPlan(plan);
  if (plan === "enterprise") { window.open("mailto:riley@sortora.com?subject=Sortora%20Enterprise%20Inquiry", "_blank"); return; }
  var currentPlan = (bizData.plan || "starter");
  if (plan === currentPlan) return;
  try {
    var res = await fetch("/api/subscribe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ businessId: currentUser.id, plan: plan }) });
    var data = await res.json();
    if (data.free) { bizData.plan = "starter"; highlightPlan("starter"); document.getElementById("plan-name").textContent = "Starter"; document.getElementById("plan-usage").textContent = (bizData.splits_this_month || 0) + " / 50 splits this month"; alert("Starter plan activated!"); return; }
    if (data.url) { window.location.href = data.url; }
    else { alert(data.error || "Something went wrong"); highlightPlan(currentPlan); }
  } catch(err) { alert("Failed to process plan change. Please try again."); highlightPlan(currentPlan); }
}

async function changeStripeAccount() {
  var confirmed = confirm('Change your connected Stripe account?\n\nThis will disconnect your current Stripe account and let you connect a different one. Any in-progress splits will continue to pay out to the current account until they complete.\n\nContinue?');
  if (!confirmed) return;
  var btn = document.getElementById('stripe-btn-settings');
  btn.disabled = true; btn.textContent = 'Disconnecting...';
  try {
    await SB.from('businesses').update({ stripe_onboarded: false, stripe_account_id: null }).eq('id', currentUser.id);
    location.href = '/dashboard.html?view=settings&reconnect=true';
  } catch (err) {
    console.error('Disconnect error:', err);
    btn.disabled = false; btn.textContent = 'Change account';
    alert('Could not disconnect. Please try again or contact support.');
  }
}

async function connectStripe() {
  var btn = document.getElementById('stripe-btn') || document.getElementById('stripe-btn-settings');
  btn.disabled = true; btn.textContent = 'Setting up...';
  try {
    // Step 1: Ensure Stripe account exists
    var r1 = await fetch('/api/connect', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ businessId: currentUser.id }) });
    var connectData = await r1.json();
    if (!connectData.accountId) throw new Error('Account creation failed');

    // Step 2: Load Stripe Connect.js if not loaded
    if (!window.StripeConnect) {
      await new Promise(function(resolve, reject) {
        var s = document.createElement('script');
        s.src = 'https://connect-js.stripe.com/v1.0/connect.js';
        s.onload = resolve;
        s.onerror = function() { reject(new Error('Failed to load Stripe Connect.js')); };
        document.head.appendChild(s);
      });
    }

    // Step 3: Initialize embedded onboarding
    var stripeInstance = StripeConnect.init({
      publishableKey: await (async function() { var r = await fetch('/api/connect?action=session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ businessId: currentUser.id }) }); var d = await r.json(); return d.publishableKey; })(),
      fetchClientSecret: async function() {
        var r2 = await fetch('/api/connect?action=session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ businessId: currentUser.id }) });
        var sessionData = await r2.json();
        if (!sessionData.clientSecret) throw new Error('Session creation failed');
        return sessionData.clientSecret;
      }
    });

    // Step 4: Mount the embedded component
    var container = document.getElementById('stripe-onboarding-container');
    container.innerHTML = '';
    var onboardingEl = stripeInstance.create('account-onboarding');
    onboardingEl.addEventListener('exit', async function() {
      document.getElementById('stripe-onboarding-modal').style.display = 'none';
      await SB.from('businesses').update({ stripe_onboarded: true }).eq('id', currentUser.id);
      location.href = '/dashboard.html?stripe=success';
    });
    container.appendChild(onboardingEl);
    document.getElementById('stripe-onboarding-modal').style.display = 'flex';
    btn.disabled = false; btn.textContent = 'Connect Stripe';
  } catch (err) {
    console.error('Stripe connect error:', err);
    // Fallback: try redirect-based onboarding
    try {
      var r3 = await fetch('/api/connect', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ businessId: currentUser.id }) });
      var fallbackData = await r3.json();
      if (fallbackData.url) { window.location.href = fallbackData.url; return; }
    } catch(e) {}
    alert('Could not connect Stripe. Please try again.');
    btn.disabled = false; btn.textContent = 'Connect Stripe';
  }
}

function closeStripeModal() {
  document.getElementById('stripe-onboarding-modal').style.display = 'none';
}

async function signOut() { await SB.auth.signOut(); window.location.href = '/login.html'; }

// Keyboard: Escape closes all drawers/modals
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') { closeDrawer(); closeCreateModal(); try{closePlanModal();}catch(x){} try{closeKpiCustomize();}catch(x){} }
});

init();

(function() {
  var startY = 0, pulling = false, indicator = null;
  document.addEventListener("touchstart", function(e) {
    if (window.scrollY === 0) { startY = e.touches[0].clientY; pulling = true; }
  }, { passive: true });
  document.addEventListener("touchmove", function(e) {
    if (!pulling) return;
    var dy = e.touches[0].clientY - startY;
    indicator = document.getElementById("pull-indicator");
    if (dy > 60 && window.scrollY === 0) { indicator.classList.add("active"); }
    else { indicator.classList.remove("active"); }
  }, { passive: true });
  document.addEventListener("touchend", function() {
    if (!pulling) return;
    pulling = false;
    indicator = document.getElementById("pull-indicator");
    if (indicator.classList.contains("active")) {
      indicator.classList.add("refreshing");
      loadBookings().then(function() {
        updateHomePage();
        try { if (document.getElementById('view-analytics').classList.contains('active')) { buildChart(allBookings); updateStats(); updateFunnel(); updateAnalytics(); } } catch(e) {}
        indicator.classList.remove("active", "refreshing");
      }).catch(function() {
        indicator.classList.remove("active", "refreshing");
      });
    }
  });
})();


// Notification system
var notifications = [];

function toggleNotifPanel() {
  document.getElementById('notif-panel').classList.toggle('open');
}

// Close panel when clicking outside
document.addEventListener('click', function(e) {
  var container = document.getElementById('notif-container');
  if (container && !container.contains(e.target)) {
    document.getElementById('notif-panel').classList.remove('open');
  }
});

function addNotification(text, priority, id) {
  priority = priority || 'low';
  if (notifications.find(function(n) { return n.id === id; })) return;
  notifications.unshift({ id: id || Date.now(), text: text, priority: priority, time: new Date(), read: false });
  renderNotifications();
}

function markAllRead() {
  notifications.forEach(function(n) { n.read = true; });
  try { localStorage.setItem("sortora_read_notifs", JSON.stringify(notifications.map(function(n) { return n.id; }))); } catch(e) {}
  renderNotifications();
}

function renderNotifications() {
  var list = document.getElementById('notif-list');
  var badge = document.getElementById('notif-badge');
  var unread = notifications.filter(function(n) { return !n.read; }).length;

  if (unread > 0) {
    badge.textContent = unread > 9 ? '9+' : unread;
    badge.classList.remove('hidden');
  } else {
    badge.classList.add('hidden');
  }

  if (!notifications.length) {
    list.innerHTML = '<div class="notif-empty">No notifications yet</div>';
    return;
  }

  list.innerHTML = notifications.slice(0, 20).map(function(n) {
    var ago = getTimeAgo(n.time);
    var dotClass = n.read ? 'read' : n.priority;
    var itemClass = n.read ? '' : ' unread';
    return '<div class="notif-item' + itemClass + '" onclick="this.classList.remove(\'unread\')">'
      + '<div class="notif-dot ' + dotClass + '"></div>'
      + '<div class="notif-content"><div class="notif-text">' + n.text + '</div><div class="notif-time">' + ago + '</div></div></div>';
  }).join('');
}

function getTimeAgo(date) {
  var diff = Date.now() - new Date(date).getTime();
  var mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return mins + 'm ago';
  var hrs = Math.floor(mins / 60);
  if (hrs < 24) return hrs + 'h ago';
  return Math.floor(hrs / 24) + 'd ago';
}

// Auto-generate notifications from data
function generateNotifications() {
  var readIds = []; try { readIds = JSON.parse(localStorage.getItem("sortora_read_notifs") || "[]"); } catch(e) {}
  allBookings.forEach(function(b) {
    if (b.status === 'confirmed') {
      addNotification('Booking "' + b.title + '" is fully paid!', 'high', 'confirmed-' + b.id);
    }
    var parts = b.participants || [];
    parts.forEach(function(p) {
      if (p.status === 'paid') {
        addNotification((p.name || p.email || 'Someone') + ' paid $' + parseFloat(p.amount).toFixed(0) + ' for "' + b.title + '"', 'medium', 'paid-' + p.id);
      }
    });
  });

  notifications.forEach(function(n) { if (readIds.indexOf(n.id) > -1) n.read = true; });
  renderNotifications();
}

// Split Funnel
function updateFunnel() {
  var filtered = getFilteredBookings();
  var created = filtered.length;
  var invites = 0, payments = 0, completed = 0;
  filtered.forEach(function(b) {
    var parts = b.participants || [];
    invites += parts.length;
    parts.forEach(function(p) { if (p.status === 'paid') payments++; });
    if (b.status === 'confirmed') completed++;
  });
  var max = Math.max(created, invites, payments, completed, 1);
  try {
    document.getElementById('fn-created').textContent = created;
    document.getElementById('fn-invites').textContent = invites;
    document.getElementById('fn-payments').textContent = payments;
    document.getElementById('fn-completed').textContent = completed;
    document.getElementById('fn-bar1').style.width = (created / max * 100) + '%';
    document.getElementById('fn-bar2').style.width = (invites / max * 100) + '%';
    document.getElementById('fn-bar3').style.width = (payments / max * 100) + '%';
    document.getElementById('fn-bar4').style.width = (completed / max * 100) + '%';
    document.getElementById('fn-pct1').textContent = '100%';
    document.getElementById('fn-pct2').textContent = created > 0 ? Math.round(invites / created * 100) + '%' : '\u2014';
    document.getElementById('fn-pct3').textContent = invites > 0 ? Math.round(payments / invites * 100) + '%' : '\u2014';
    document.getElementById('fn-pct4').textContent = created > 0 ? Math.round(completed / created * 100) + '%' : '\u2014';
    document.getElementById("funnel-card").style.display = ""; if (created === 0) { document.getElementById("funnel-card").style.opacity = "0.5"; try { var fc = document.getElementById("funnel-card"); if (!fc.querySelector(".funnel-empty-msg")) { var msg = document.createElement("div"); msg.className = "funnel-empty-msg"; msg.style.cssText = "text-align:center;padding:12px;font-size:13px;color:#6B6B6B;font-weight:500"; msg.innerHTML = "Your funnel will fill up as customers use your split payments. <a href=\"#\" onclick=\"openCreateModal();return false\" style=\"color:#3B6BFF;font-weight:700\">Create a split \u2192</a>"; fc.appendChild(msg); } } catch(e) {}; } else { document.getElementById("funnel-card").style.opacity = "1"; try { var em = document.querySelector(".funnel-empty-msg"); if (em) em.remove(); } catch(e) {}; };
  } catch(e) {}
  // Funnel conversion tip
  try {
    var convRate = created > 0 ? Math.round(completed / created * 100) : 100;
    var tipEl = document.getElementById('funnel-tip');
    if (!tipEl) { tipEl = document.createElement('div'); tipEl.id = 'funnel-tip'; tipEl.style.cssText = 'padding:12px 16px;background:rgba(59,107,255,.03);border:1px solid rgba(59,107,255,.1);border-radius:8px;margin-top:16px;font-size:13px;color:#6B6B6B;display:flex;align-items:flex-start;gap:10px'; document.getElementById('funnel-card').appendChild(tipEl); }
    if (convRate < 50 && created >= 3) { tipEl.style.display = ''; tipEl.innerHTML = '<span style="flex:1"><strong style="color:#1A1A1A">Low completion rate.</strong> Try sending payment reminders or shortening your split deadline. <a href="#" onclick="openPlanModal();return false" style="color:#3B6BFF;font-weight:700">Growth plans</a> include auto-reminders.</span>'; }
    else { tipEl.style.display = 'none'; }
  } catch(e) {}
}
function updateAnalytics() {
  var filtered = getFilteredBookings();
  try {
    if (!filtered.length) { document.getElementById('analytics-grid').style.display = 'none'; return; }
    document.getElementById('analytics-grid').style.display = '';
    var days = [0,0,0,0,0,0,0];
    filtered.forEach(function(b) { var d = new Date(b.created_at).getDay(); days[d]++; });
    var maxDay = Math.max.apply(null, days) || 1;
    for (var i = 0; i < 7; i++) { document.getElementById('day-' + i).style.height = Math.max(2, (days[i] / maxDay) * 72) + 'px'; }
    var totalParts = 0;
    filtered.forEach(function(b) { totalParts += (b.participants || []).length; });
    document.getElementById('an-group-size').textContent = filtered.length > 0 ? (totalParts / filtered.length).toFixed(1) : '\u2014';
    var completed = filtered.filter(function(b) { return b.status === 'confirmed'; }).length;
    document.getElementById('an-completion').textContent = (filtered.length > 0 ? Math.round(completed / filtered.length * 100) : 0) + '%';
    var totalRev = 0;
    filtered.forEach(function(b) { (b.participants || []).forEach(function(p) { if (p.status === 'paid') totalRev += parseFloat(p.amount); }); });
    document.getElementById('an-avg-rev').textContent = filtered.length > 0 ? '$' + Math.round(totalRev / filtered.length) : '\u2014';
  } catch(e) {}
}

// Milestones
function checkMilestones() {
  var totalSplits = 0, totalRevenue = 0;
  allBookings.forEach(function(b) {
    (b.participants || []).forEach(function(p) { totalSplits++; if (p.status === 'paid') totalRevenue += parseFloat(p.amount); });
  });
  var milestones = [
    { key: 'first_split', check: allBookings.length >= 1, emoji: '\ud83c\udf89', title: 'First split created!' },
    { key: 'ten_bookings', check: allBookings.length >= 10, emoji: '\ud83d\udcaa', title: '10 bookings reached!' },
    { key: 'rev_1k', check: totalRevenue >= 1000, emoji: '\ud83d\udcb0', title: '$1,000 processed!' },
    { key: 'rev_10k', check: totalRevenue >= 10000, emoji: '\ud83d\ude80', title: '$10,000 milestone!' }
  ];
  var shown = [];
  try { shown = JSON.parse(localStorage.getItem('sortora_milestones') || '[]'); } catch(e) {}
  milestones.forEach(function(m) {
    if (m.check && shown.indexOf(m.key) === -1) {
      showMilestoneCelebration(m.emoji, m.title);
      shown.push(m.key);
      try { localStorage.setItem('sortora_milestones', JSON.stringify(shown)); } catch(e) {}
    }
  });
}

function showMilestoneCelebration(emoji, title) {
  var toast = document.createElement('div');
  toast.style.cssText = 'position:fixed;top:20px;right:20px;background:#fff;border:1px solid #E8E8E6;border-radius:12px;padding:16px 24px;box-shadow:0 8px 32px rgba(0,0,0,.12);z-index:9999;display:flex;align-items:center;gap:12px;animation:slideInRight .4s ease;font-family:inherit';
  toast.innerHTML = '<span style="font-size:28px">' + emoji + '</span><div><div style="font-size:15px;font-weight:800">' + title + '</div><div style="font-size:12px;color:#6B6B6B;margin-top:2px">Keep it up!</div></div>';
  document.body.appendChild(toast);
  setTimeout(function() { toast.style.opacity = '0'; toast.style.transition = 'opacity .3s'; setTimeout(function() { toast.remove(); }, 300); }, 4000);
}

// KPI Customization
function openKpiCustomize() { document.getElementById('kpi-modal').classList.add('open'); loadKpiPrefs(); }
function closeKpiCustomize() { document.getElementById('kpi-modal').classList.remove('open'); }
function saveKpiPrefs() {
  var prefs = { splits: document.getElementById('kc-splits').checked, revenue: document.getElementById('kc-revenue').checked, active: document.getElementById('kc-active').checked, confirmed: document.getElementById('kc-confirmed').checked, funnel: document.getElementById('kc-funnel').checked, analytics: document.getElementById('kc-analytics').checked };
  try { localStorage.setItem('sortora_kpi_prefs', JSON.stringify(prefs)); } catch(e) {}
  applyKpiPrefs(prefs);
  closeKpiCustomize();
}
function loadKpiPrefs() {
  try {
    var p = JSON.parse(localStorage.getItem('sortora_kpi_prefs'));
    if (p) {
      document.getElementById('kc-splits').checked = p.splits !== false;
      document.getElementById('kc-revenue').checked = p.revenue !== false;
      document.getElementById('kc-active').checked = p.active !== false;
      document.getElementById('kc-confirmed').checked = p.confirmed !== false;
      document.getElementById('kc-funnel').checked = p.funnel !== false;
      document.getElementById('kc-analytics').checked = p.analytics !== false;
    }
  } catch(e) {}
}
function applyKpiPrefs(p) {
  if (!p) { try { p = JSON.parse(localStorage.getItem('sortora_kpi_prefs')); } catch(e) {} }
  if (!p) return;
  var cards = document.querySelectorAll('#stats-real .stat-card');
  if (cards[0]) cards[0].style.display = p.splits !== false ? '' : 'none';
  if (cards[1]) cards[1].style.display = p.revenue !== false ? '' : 'none';
  if (cards[2]) cards[2].style.display = p.active !== false ? '' : 'none';
  if (cards[3]) cards[3].style.display = p.confirmed !== false ? '' : 'none';
  var funnel = document.getElementById('funnel-card');
  if (funnel) funnel.style.display = p.funnel !== false ? '' : 'none';
  var analytics = document.getElementById('analytics-grid');
  if (analytics) analytics.style.display = p.analytics !== false ? '' : 'none';
}
try { applyKpiPrefs(); } catch(e) {}

// Notification settings
function toggleNotifSettings() {
  var el = document.getElementById('notif-settings');
  if (el) el.style.display = el.style.display === 'none' ? 'block' : 'none';
}
function saveNotifPrefs() {
  var prefs = {
    payments: document.getElementById('ns-payments').checked,
    confirmed: document.getElementById('ns-confirmed').checked,
    payouts: document.getElementById('ns-payouts').checked,
    digest: document.getElementById('ns-digest').checked
  };
  try { localStorage.setItem('sortora_notif_prefs', JSON.stringify(prefs)); } catch(e) {}
}
try {
  var saved = JSON.parse(localStorage.getItem('sortora_notif_prefs'));
  if (saved) {
    if (saved.payments === false && document.getElementById('ns-payments')) document.getElementById('ns-payments').checked = false;
    if (saved.confirmed === false && document.getElementById('ns-confirmed')) document.getElementById('ns-confirmed').checked = false;
    if (saved.payouts === false && document.getElementById('ns-payouts')) document.getElementById('ns-payouts').checked = false;
    if (saved.digest === false && document.getElementById('ns-digest')) document.getElementById('ns-digest').checked = false;
  }
} catch(e) {}

// Integrations / Webhook settings
function saveWebhookUrl() {
  var url = document.getElementById('wh-url').value.trim();
  if (!url) return;
  SB.from('businesses').update({ webhook_url: url }).eq('id', currentUser.id).then(function() {
    var s = document.getElementById('wh-save-status');
    s.style.display = 'block';
    setTimeout(function() { s.style.display = 'none'; }, 2000);
  });
}
function generateSecret() {
  var chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  var secret = 'whsec_';
  for (var i = 0; i < 32; i++) secret += chars[Math.floor(Math.random() * chars.length)];
  document.getElementById('wh-secret').value = secret;
}
function saveWebhookSecret() {
  var secret = document.getElementById('wh-secret').value.trim();
  SB.from('businesses').update({ webhook_secret: secret }).eq('id', currentUser.id);
}
function toggleEvent(el) { el.classList.toggle('active'); }
function saveWebhookEvents() {
  var events = [];
  document.querySelectorAll('.int-event.active').forEach(function(el) { events.push(el.dataset.event); });
  SB.from('businesses').update({ webhook_events: events }).eq('id', currentUser.id);
}
async function testWebhook() {
  var btn = document.getElementById('wh-test-btn');
  var result = document.getElementById('wh-test-result');
  btn.disabled = true; btn.textContent = 'Sending...'; result.style.display = 'none';
  var url = document.getElementById('wh-url').value.trim();
  if (!url) { result.style.display = 'block'; result.style.color = '#D92D20'; result.textContent = 'Please save a webhook URL first.'; btn.disabled = false; btn.textContent = 'Send Test Event'; return; }
  try {
    var res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Sortora-Event': 'test' }, body: JSON.stringify({ event: 'test', timestamp: new Date().toISOString(), data: { message: 'This is a test webhook from Sortora' } }) });
    result.style.display = 'block'; result.style.color = res.ok ? '#1A8917' : '#D97706'; result.textContent = res.ok ? 'Success! Your webhook received the test event.' : 'Webhook responded with status ' + res.status;
  } catch (err) { result.style.display = 'block'; result.style.color = '#D92D20'; result.textContent = 'Failed to reach webhook URL: ' + err.message; }
  btn.disabled = false; btn.textContent = 'Send Test Event';
}
function loadWebhookSettings() {
  if (!currentUser) return;
  SB.from('businesses').select('webhook_url, webhook_secret, webhook_events').eq('id', currentUser.id).single().then(function(r) {
    if (r.data) {
      if (r.data.webhook_url) document.getElementById('wh-url').value = r.data.webhook_url;
      if (r.data.webhook_secret) document.getElementById('wh-secret').value = r.data.webhook_secret;
      if (r.data.webhook_events && r.data.webhook_events.length) {
        document.querySelectorAll('.int-event').forEach(function(el) { el.classList.toggle('active', r.data.webhook_events.indexOf(el.dataset.event) > -1); });
      }
    }
  });
  SB.from('webhook_deliveries').select('*').eq('business_id', currentUser.id).order('delivered_at', { ascending: false }).limit(10).then(function(r) {
    var log = document.getElementById('wh-log');
    if (!r.data || !r.data.length) return;
    var rows = r.data.map(function(d) {
      var time = new Date(d.delivered_at || d.created_at).toLocaleString();
      var statusClass = d.status === 'delivered' ? 'delivered' : 'failed';
      return '<div class="int-log-row"><div class="int-log-status ' + statusClass + '"></div><span style="flex:1">' + d.event_type + '</span><span style="width:100px;color:' + (d.status === 'delivered' ? '#1A8917' : '#D92D20') + ';font-weight:600">' + d.status + '</span><span style="width:140px;color:#757575;font-size:12px">' + time + '</span></div>';
    }).join('');
    log.innerHTML = '<div class="int-log-header"><span style="flex:1">Event</span><span style="width:100px">Status</span><span style="width:140px">Time</span></div>' + rows;
  });
}




// ── Interactive Walkthrough ──
function startWalkthrough() {
  if (localStorage.getItem('sortora_walkthrough_done')) return;
  var steps = [
    { view: 'overview', target: '#pending-actions', title: 'Home — Pending Actions', desc: 'This card shows bookings that need your attention — unpaid participants, new payments, and recent activity. When everything is handled, it says "You\'re all caught up."' },
    { view: 'overview', target: '#home-today-rev', title: 'Home — Today\'s Snapshot', desc: 'Quick glance at today\'s revenue and active splits. Click "View full analytics" for the deep dive.' },
    { view: 'bookings', target: '#bk-list', title: 'Bookings', desc: 'Every split payment session lives here. Click any booking to see who paid, who hasn\'t, and share the payment link. Red "unpaid" badges flag outstanding balances.' },
    { view: 'analytics', target: '#funnel-card', title: 'Analytics — Split Funnel', desc: 'See your conversion flow: how many splits you create, invites sent, payments made, and fully completed bookings. Low numbers? Try shorter deadlines.' },
    { view: 'analytics', target: '#stats-real', title: 'Analytics — Stats', desc: 'Your key metrics with sparklines. Filter by time period and customize which cards show using the "Customize" button.' },
    { view: 'embed', target: '.embed-box', title: 'Widget — Embed Code', desc: 'Copy this script tag and paste it on your booking page. One line of code — works with WordPress, Squarespace, Wix, or any site.' },
    { view: 'settings', target: '#save-btn', title: 'Settings', desc: 'Update your business info, manage your Stripe connection, and change your plan. You\'re all set up — time to create your first split!' }
  ];
  var current = 0;

  var overlay = document.createElement('div');
  overlay.id = 'wt-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:9000;transition:opacity .3s';
  document.body.appendChild(overlay);

  var tooltip = document.createElement('div');
  tooltip.id = 'wt-tooltip';
  tooltip.style.cssText = 'position:fixed;z-index:9002;background:#fff;border-radius:14px;padding:24px;box-shadow:0 12px 40px rgba(0,0,0,.2);max-width:320px;font-family:DM Sans,sans-serif;transition:all .25s ease';
  document.body.appendChild(tooltip);

  function show(idx) {
    if (idx >= steps.length) { finish(); return; }
    clearHighlight();
    current = idx;
    var step = steps[idx];

    // Navigate to the correct page
    var sbItems = document.querySelectorAll('.sb-item');
    var viewMap = { overview: 0, bookings: 1, payouts: 2, analytics: 3, embed: 5, integrations: 6, settings: 7 };
    var sbIdx = viewMap[step.view];
    if (sbIdx !== undefined && sbItems[sbIdx]) {
      showView(step.view, sbItems[sbIdx]);
    }

    // Wait for page to render
    setTimeout(function() {
      var el = document.querySelector(step.target);
      if (!el) { show(idx + 1); return; }

      // Highlight element
      el.style.position = 'relative';
      el.style.zIndex = '9001';
      el.style.boxShadow = '0 0 0 4px rgba(59,107,255,.35), 0 0 24px rgba(59,107,255,.12)';
      el.style.borderRadius = '12px';
      el.style.transition = 'box-shadow .3s';

      // Scroll element into view
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });

      setTimeout(function() {
        var rect = el.getBoundingClientRect();

        // Build tooltip content
        tooltip.innerHTML = '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">'
          + '<div style="font-size:11px;color:#3B6BFF;font-weight:700;text-transform:uppercase;letter-spacing:.05em">Step ' + (idx + 1) + ' of ' + steps.length + '</div>'
          + '<div style="display:flex;gap:3px">' + steps.map(function(s,i) { return '<div style="width:' + (i === idx ? '16px' : '6px') + ';height:4px;border-radius:2px;background:' + (i <= idx ? '#3B6BFF' : '#E8E8E6') + ';transition:all .2s"></div>'; }).join('') + '</div>'
          + '</div>'
          + '<div style="font-size:17px;font-weight:800;color:#1A1A1A;margin-bottom:8px;letter-spacing:-.01em">' + step.title + '</div>'
          + '<div style="font-size:14px;color:#6B6B6B;line-height:1.65;margin-bottom:18px">' + step.desc + '</div>'
          + '<div style="display:flex;gap:8px;justify-content:space-between;align-items:center">'
          + '<button onclick="skipWalkthrough()" style="padding:8px 16px;border:1px solid #E8E8E6;background:#fff;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;color:#6B6B6B;transition:all .12s">Skip tour</button>'
          + '<div style="display:flex;gap:6px">'
          + (idx > 0 ? '<button onclick="prevWalkthroughStep()" style="padding:8px 14px;border:1px solid #E8E8E6;background:#fff;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;color:#1A1A1A">Back</button>' : '')
          + '<button onclick="nextWalkthroughStep()" style="padding:8px 20px;border:none;background:#3B6BFF;color:#fff;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;transition:all .12s">' + (idx === steps.length - 1 ? 'Get started!' : 'Next \u2192') + '</button>'
          + '</div></div>';

        // Position tooltip below or beside element
        var top = rect.bottom + 16;
        var left = Math.max(16, Math.min(rect.left, window.innerWidth - 340));
        if (top + 250 > window.innerHeight) { top = Math.max(16, rect.top - 260); }

        // Mobile: bottom sheet style
        if (window.innerWidth < 768) {
          tooltip.style.top = 'auto';
          tooltip.style.bottom = '76px';
          tooltip.style.left = '12px';
          tooltip.style.right = '12px';
          tooltip.style.maxWidth = 'none';
        } else {
          tooltip.style.top = top + 'px';
          tooltip.style.left = left + 'px';
          tooltip.style.bottom = 'auto';
          tooltip.style.right = 'auto';
        }
      }, 300);
    }, 200);
  }

  function clearHighlight() {
    steps.forEach(function(s) {
      var el = document.querySelector(s.target);
      if (el) { el.style.zIndex = ''; el.style.boxShadow = ''; el.style.transition = ''; }
    });
  }

  window.nextWalkthroughStep = function() { show(current + 1); };
  window.prevWalkthroughStep = function() { if (current > 0) show(current - 1); };
  window.skipWalkthrough = function() { finish(); };

  function finish() {
    clearHighlight();
    localStorage.setItem('sortora_walkthrough_done', '1');
    var ov = document.getElementById('wt-overlay');
    var tt = document.getElementById('wt-tooltip');
    if (ov) ov.remove();
    if (tt) tt.remove();
    // Return to Home
    var sbItems = document.querySelectorAll('.sb-item');
    if (sbItems[0]) showView('overview', sbItems[0]);
  }

  setTimeout(function() { show(0); }, 1500);
}

// Start walkthrough on first visit
if (!localStorage.getItem('sortora_walkthrough_done')) {
  document.addEventListener('DOMContentLoaded', function() {
    setTimeout(startWalkthrough, 2000);
  });
}


