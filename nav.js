/* ══════════════════════════════════════
   Sortora Unified Nav — nav.js
   Include on any page: <script src="/nav.js"></script>
   Add <div id="nav-root"></div> where you want the nav
   
   Options via data attributes on #nav-root:
   data-style="light"  → force white nav (no dark-to-light transition)
   data-style="dark"   → dark transparent, transitions to white on scroll (default)
   ══════════════════════════════════════ */

(function() {
  var SUPABASE_URL = 'https://gzwyzocfohtnejttkglg.supabase.co';
  var SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6d3l6b2Nmb2h0bmVqdHRrZ2xnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNjkzNDAsImV4cCI6MjA4ODY0NTM0MH0.WTEGzb2zz7UxjpukffbWFLF5Zup2lC65f1H5nQBE_fw';

  // Inject CSS
  var style = document.createElement('style');
  style.textContent = '\
    .srt-nav{position:fixed;top:0;left:0;right:0;z-index:100;padding:0 32px;height:64px;display:flex;align-items:center;justify-content:space-between;transition:background .3s,border-color .3s}\
    .srt-nav.dark{background:rgba(12,18,32,.65);backdrop-filter:blur(24px) saturate(1.6);-webkit-backdrop-filter:blur(24px) saturate(1.6);border-bottom:1px solid rgba(255,255,255,.06)}\
    .srt-nav.dark.scrolled,.srt-nav.light{background:rgba(255,255,255,.92);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-bottom:1px solid #EBEBEB}\
    .srt-nav-left{display:flex;align-items:center;gap:24px}\
    .srt-nav-logo{text-decoration:none;display:flex;align-items:center;gap:7px}\
    .srt-logo-text{font-weight:800;font-size:20px;letter-spacing:-.5px;transition:color .3s}\
    .srt-nav.dark:not(.scrolled) .srt-logo-text{color:#fff}\
    .srt-nav.dark.scrolled .srt-logo-text,.srt-nav.light .srt-logo-text{color:#3B6BFF}\
    .srt-logo-light,.srt-nav.dark.scrolled .srt-logo-dark,.srt-nav.light .srt-logo-dark{display:none}\
    .srt-nav.dark.scrolled .srt-logo-light,.srt-nav.light .srt-logo-light{display:block}\
    .srt-nav.dark:not(.scrolled) .srt-logo-light{display:block}\
    .srt-nav.dark:not(.scrolled) .srt-logo-dark{display:none}\
    .srt-logo-dark{display:block}\
    .srt-nav.light .srt-logo-light{display:none}\
    .srt-nav.light .srt-logo-dark{display:block}\
    .srt-menus{display:flex;align-items:center;gap:4px}\
    .srt-menu{position:relative}\
    .srt-menu-btn{display:flex;align-items:center;gap:5px;padding:7px 14px;border-radius:8px;font-size:14px;font-weight:600;border:none;cursor:pointer;font-family:"Plus Jakarta Sans",sans-serif;transition:all .15s;text-decoration:none}\
    .srt-nav.dark:not(.scrolled) .srt-menu-btn{color:rgba(255,255,255,.8);background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.1)}\
    .srt-nav.dark:not(.scrolled) .srt-menu-btn:hover{background:rgba(255,255,255,.14);color:#fff}\
    .srt-nav.dark.scrolled .srt-menu-btn,.srt-nav.light .srt-menu-btn{color:#222;background:rgba(0,0,0,.03);border:1px solid rgba(0,0,0,.06)}\
    .srt-nav.dark.scrolled .srt-menu-btn:hover,.srt-nav.light .srt-menu-btn:hover{background:rgba(0,0,0,.06)}\
    .srt-menu-btn svg{width:12px;height:12px;transition:transform .2s}\
    .srt-menu.open .srt-menu-btn svg{transform:rotate(180deg)}\
    .srt-dropdown{position:absolute;top:calc(100% + 8px);left:0;min-width:200px;background:#fff;border:1px solid #EBEBEB;border-radius:12px;box-shadow:0 8px 30px rgba(0,0,0,.12);padding:8px;display:none;z-index:10}\
    .srt-menu.open .srt-dropdown{display:block}\
    .srt-drop-item{display:block;padding:10px 14px;border-radius:8px;font-size:14px;font-weight:500;color:#222;text-decoration:none;transition:background .1s}\
    .srt-drop-item:hover{background:#f7f7f7}\
    .srt-drop-item span{display:block;font-size:12px;color:#6a6a6a;margin-top:2px;font-weight:400}\
    .srt-dropdown-wide{position:absolute;top:calc(100% + 8px);left:50%;transform:translateX(-50%);width:520px;background:#fff;border:1px solid #EBEBEB;border-radius:14px;box-shadow:0 12px 40px rgba(0,0,0,.14);padding:20px 24px;display:none;z-index:10}\
    .srt-menu.open .srt-dropdown-wide{display:block}\
    .srt-drop-cols{display:grid;grid-template-columns:1fr 1fr;gap:24px}\
    .srt-drop-col-title{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#3B6BFF;margin-bottom:10px;padding:0 10px}\
    .srt-drop-wide-item{display:flex;align-items:flex-start;gap:10px;padding:8px 10px;border-radius:8px;text-decoration:none;color:#222;transition:background .1s}\
    .srt-drop-wide-item:hover{background:#f7f7f7}\
    .srt-drop-icon{width:32px;height:32px;border-radius:8px;background:#EEF2FF;display:flex;align-items:center;justify-content:center;flex-shrink:0}\
    .srt-drop-icon svg{width:16px;height:16px;stroke:#3B6BFF;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}\
    .srt-drop-wide-name{font-size:14px;font-weight:600;color:#222}\
    .srt-drop-wide-desc{font-size:12px;color:#6a6a6a;margin-top:1px;line-height:1.3}\
    .srt-nav-right{display:flex;align-items:center;gap:8px}\
    .srt-biz{font-size:14px;font-weight:600;text-decoration:none;padding:7px 12px;border-radius:20px;transition:color .15s}\
    .srt-nav.dark:not(.scrolled) .srt-biz{color:rgba(255,255,255,.7)}\
    .srt-nav.dark:not(.scrolled) .srt-biz:hover{color:#fff}\
    .srt-nav.dark.scrolled .srt-biz,.srt-nav.light .srt-biz{color:#6a6a6a}\
    .srt-nav.dark.scrolled .srt-biz:hover,.srt-nav.light .srt-biz:hover{color:#222}\
    .srt-glass{padding:8px 18px;border-radius:20px;font-size:14px;font-weight:600;text-decoration:none;cursor:pointer;font-family:"Plus Jakarta Sans",sans-serif;transition:all .2s;border:none;display:inline-block}\
    .srt-nav.dark:not(.scrolled) .srt-glass-ghost{color:rgba(255,255,255,.85);background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12)}\
    .srt-nav.dark:not(.scrolled) .srt-glass-ghost:hover{background:rgba(255,255,255,.16);color:#fff}\
    .srt-nav.dark.scrolled .srt-glass-ghost,.srt-nav.light .srt-glass-ghost{color:#222;background:rgba(0,0,0,.04);border:1px solid rgba(0,0,0,.08)}\
    .srt-nav.dark.scrolled .srt-glass-ghost:hover,.srt-nav.light .srt-glass-ghost:hover{background:rgba(0,0,0,.07)}\
    .srt-nav.dark:not(.scrolled) .srt-glass-fill{color:#fff;background:rgba(59,107,255,.7);border:1px solid rgba(59,107,255,.5)}\
    .srt-nav.dark:not(.scrolled) .srt-glass-fill:hover{background:rgba(59,107,255,.9)}\
    .srt-nav.dark.scrolled .srt-glass-fill,.srt-nav.light .srt-glass-fill{color:#fff;background:#3B6BFF;border:1px solid #3B6BFF}\
    .srt-nav.dark.scrolled .srt-glass-fill:hover,.srt-nav.light .srt-glass-fill:hover{background:#2d5ae6}\
    .srt-biz:visited,.srt-glass:visited{color:inherit}\
    .srt-nav.dark:not(.scrolled) .srt-biz:visited{color:rgba(255,255,255,.7)}\
    .srt-nav.dark.scrolled .srt-biz:visited,.srt-nav.light .srt-biz:visited{color:#6a6a6a}\
    .srt-nav.dark:not(.scrolled) .srt-glass-ghost:visited{color:rgba(255,255,255,.85)}\
    .srt-nav.dark.scrolled .srt-glass-ghost:visited,.srt-nav.light .srt-glass-ghost:visited{color:#222}\
    .srt-glass-fill:visited{color:#fff}\
    @media(max-width:768px){.srt-nav{padding:0 16px;height:56px}.srt-menus{display:none}.srt-biz{display:none}}\
    .srt-nav a,.srt-nav a:visited,.srt-nav button,.srt-nav a:link{text-decoration:none}\
    .srt-nav .srt-biz,.srt-nav .srt-biz:visited,.srt-nav .srt-biz:link{color:inherit !important}\
    .srt-nav.dark:not(.scrolled) .srt-biz,.srt-nav.dark:not(.scrolled) .srt-biz:visited{color:rgba(255,255,255,.7) !important}\
    .srt-nav.dark.scrolled .srt-biz,.srt-nav.dark.scrolled .srt-biz:visited,.srt-nav.light .srt-biz,.srt-nav.light .srt-biz:visited{color:#6a6a6a !important}\
    .srt-nav .srt-glass-ghost,.srt-nav .srt-glass-ghost:visited,.srt-nav .srt-glass-ghost:link{color:inherit !important}\
    .srt-nav.dark:not(.scrolled) .srt-glass-ghost,.srt-nav.dark:not(.scrolled) .srt-glass-ghost:visited{color:rgba(255,255,255,.85) !important}\
    .srt-nav.dark.scrolled .srt-glass-ghost,.srt-nav.dark.scrolled .srt-glass-ghost:visited,.srt-nav.light .srt-glass-ghost,.srt-nav.light .srt-glass-ghost:visited{color:#222 !important}\
    .srt-nav .srt-glass-fill,.srt-nav .srt-glass-fill:visited,.srt-nav .srt-glass-fill:link{color:#fff !important}\\
  ';
  document.head.appendChild(style);

  var logoSvg = function(color) {
    return '<svg width="28" height="28" viewBox="0 0 44 44" fill="none"><circle cx="11" cy="32" r="6" stroke="'+color+'" stroke-width="1.5" fill="none"/><circle cx="33" cy="32" r="6" stroke="'+color+'" stroke-width="1.5" fill="none"/><circle cx="22" cy="10" r="6.5" fill="'+color+'"/><path d="M11 26 C11 6, 33 6, 33 26" stroke="'+color+'" stroke-width="1.4" fill="none" stroke-linecap="round"/></svg>';
  };

  var chevron = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>';

  function icon(paths) {
    return '<div class="srt-drop-icon"><svg viewBox="0 0 24 24">' + paths + '</svg></div>';
  }

  var featuresDropdown = '\
    <div class="srt-dropdown-wide">\
      <div class="srt-drop-cols">\
        <div>\
          <div class="srt-drop-col-title">Provider Tools</div>\
          <a class="srt-drop-wide-item" href="/features.html#dashboard">'+icon('<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>')+'<div><div class="srt-drop-wide-name">Dashboard</div><div class="srt-drop-wide-desc">Your command center</div></div></a>\
          <a class="srt-drop-wide-item" href="/features.html#sessions">'+icon('<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>')+'<div><div class="srt-drop-wide-name">Sessions</div><div class="srt-drop-wide-desc">Create and manage sessions</div></div></a>\
          <a class="srt-drop-wide-item" href="/features.html#analytics">'+icon('<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>')+'<div><div class="srt-drop-wide-name">Analytics</div><div class="srt-drop-wide-desc">Revenue and booking insights</div></div></a>\
          <a class="srt-drop-wide-item" href="/features.html#payments">'+icon('<rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>')+'<div><div class="srt-drop-wide-name">Payments</div><div class="srt-drop-wide-desc">Stripe-powered, 95% payout</div></div></a>\
          <a class="srt-drop-wide-item" href="/features.html#clients">'+icon('<path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>')+'<div><div class="srt-drop-wide-name">Clients</div><div class="srt-drop-wide-desc">Automatic client roster</div></div></a>\
          <a class="srt-drop-wide-item" href="/features.html#promos">'+icon('<path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>')+'<div><div class="srt-drop-wide-name">Promos</div><div class="srt-drop-wide-desc">Discount codes and campaigns</div></div></a>\
        </div>\
        <div>\
          <div class="srt-drop-col-title">Customer Features</div>\
          <a class="srt-drop-wide-item" href="/features.html#customers">'+icon('<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>')+'<div><div class="srt-drop-wide-name">Browse & Discovery</div><div class="srt-drop-wide-desc">Find sessions near you</div></div></a>\
          <a class="srt-drop-wide-item" href="/features.html#customers">'+icon('<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>')+'<div><div class="srt-drop-wide-name">Group Booking</div><div class="srt-drop-wide-desc">Split costs with your team</div></div></a>\
          <a class="srt-drop-wide-item" href="/features.html#customers">'+icon('<rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>')+'<div><div class="srt-drop-wide-name">Session Pages</div><div class="srt-drop-wide-desc">Detailed listings and booking</div></div></a>\
          <a class="srt-drop-wide-item" href="/features.html#customers">'+icon('<path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>')+'<div><div class="srt-drop-wide-name">Booking Management</div><div class="srt-drop-wide-desc">Track your sessions</div></div></a>\
        </div>\
      </div>\
    </div>';

  var servicesDropdown = '\
    <div class="srt-dropdown">\
      <a class="srt-drop-item" href="/browse.html">Photography<span>Team & event shoots</span></a>\
      <a class="srt-drop-item" href="/browse.html">Fitness<span>Personal trainers & group classes</span></a>\
      <a class="srt-drop-item" href="/browse.html">Yoga & Wellness<span>Instructors & retreats</span></a>\
      <a class="srt-drop-item" href="/browse.html">Coaching<span>Sports, life & career</span></a>\
      <a class="srt-drop-item" href="/browse.html">Workshops<span>Creative classes & skills</span></a>\
      <a class="srt-drop-item" href="/browse.html">DJ & Music<span>Events & private sessions</span></a>\
    </div>';

  var browseDropdown = '\
    <div class="srt-dropdown">\
      <a class="srt-drop-item" href="/browse.html">All Sessions<span>See everything available</span></a>\
      <a class="srt-drop-item" href="/browse.html">Near Me<span>Local providers in your area</span></a>\
      <a class="srt-drop-item" href="/browse.html">Group Funded<span>Split the cost with your team</span></a>\
    </div>';

  var html = '\
    <div class="srt-nav-left">\
      <a class="srt-nav-logo" href="/">\
        <span class="srt-logo-light">'+logoSvg('#fff')+'</span>\
        <span class="srt-logo-dark">'+logoSvg('#3B6BFF')+'</span>\
        <span class="srt-logo-text">Sortora</span>\
      </a>\
      <div class="srt-menus">\
        <div class="srt-menu" id="srt-menu-features">\
          <button class="srt-menu-btn" onclick="srtToggle(\'srt-menu-features\')">Features '+chevron+'</button>\
          '+featuresDropdown+'\
        </div>\
        <div class="srt-menu" id="srt-menu-services">\
          <button class="srt-menu-btn" onclick="srtToggle(\'srt-menu-services\')">Services '+chevron+'</button>\
          '+servicesDropdown+'\
        </div>\
        <div class="srt-menu" id="srt-menu-browse">\
          <button class="srt-menu-btn" onclick="srtToggle(\'srt-menu-browse\')">Browse '+chevron+'</button>\
          '+browseDropdown+'\
        </div>\
      </div>\
    </div>\
    <div class="srt-nav-right" id="srt-nav-right">\
      <a class="srt-biz" href="/signup.html?role=provider">For Business</a>\
      <a class="srt-glass srt-glass-ghost" href="/login.html">Log in</a>\
      <a class="srt-glass srt-glass-fill" href="/signup.html">Sign up</a>\
    </div>';

  function init() {
    var root = document.getElementById('nav-root');
    if (!root) return;

    var navStyle = root.getAttribute('data-style') || 'dark';
    var nav = document.createElement('nav');
    nav.className = 'srt-nav ' + navStyle;
    nav.id = 'srt-nav';
    nav.innerHTML = html;
    root.appendChild(nav);

    // Scroll behavior (dark nav only)
    if (navStyle === 'dark') {
      window.addEventListener('scroll', function() {
        nav.classList.toggle('scrolled', window.scrollY > 60);
      });
    }

    // Click outside closes menus
    document.addEventListener('click', function(e) {
      if (!e.target.closest('.srt-menu')) {
        document.querySelectorAll('.srt-menu').forEach(function(m) { m.classList.remove('open'); });
      }
    });

    // Auth check
    checkAuth();
  }

  // Toggle dropdown
  window.srtToggle = function(id) {
    var menu = document.getElementById(id);
    var wasOpen = menu.classList.contains('open');
    document.querySelectorAll('.srt-menu').forEach(function(m) { m.classList.remove('open'); });
    if (!wasOpen) menu.classList.add('open');
  };

  // Auth-aware nav
  function checkAuth() {
    if (typeof window.supabase === 'undefined') {
      // Try again after supabase loads
      var check = setInterval(function() {
        if (typeof window.supabase !== 'undefined') {
          clearInterval(check);
          doAuthCheck();
        }
      }, 200);
      setTimeout(function() { clearInterval(check); }, 5000);
    } else {
      doAuthCheck();
    }
  }

  function doAuthCheck() {
    var SB = window._sortoraSB || window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY); window._sortoraSB = SB;
    SB.auth.getSession().then(function(r) {
      if (!r.data.session) return;
      SB.from('profiles').select('role,full_name').eq('id', r.data.session.user.id).single().then(function(pr) {
        if (!pr.data) return;
        var right = document.getElementById('srt-nav-right');
        if (pr.data.role === 'provider') {
          right.innerHTML = '<a class="srt-biz" href="/dashboard.html">Dashboard</a><a class="srt-glass srt-glass-ghost" href="/profile.html">Profile</a><a class="srt-glass srt-glass-fill" href="/dashboard.html">Go to Dashboard</a>';
        } else {
          right.innerHTML = '<a class="srt-glass srt-glass-ghost" href="/bookings.html">My Bookings</a><a class="srt-glass srt-glass-fill" href="/browse.html">Browse Sessions</a>';
        }
      });
    });
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
