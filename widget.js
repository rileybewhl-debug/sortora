/**
 * Sortora Split-Payment Widget v2
 * 
 * Usage:
 * <script src="https://js.sortora.com/v1/widget.js" data-business-id="biz_xxx" data-theme="auto"></script>
 * 
 * New flow: Organizer creates a split → shares link via native share sheet → friends self-join
 */
(function() {
  'use strict';

  var script = document.currentScript;
  var BUSINESS_ID = script && script.getAttribute('data-business-id');
  var THEME = (script && script.getAttribute('data-theme')) || 'auto';
  var PRESET_AMOUNT = script && script.getAttribute('data-amount');
  var PRESET_TITLE = script && script.getAttribute('data-title');
  var API_BASE = (script && script.getAttribute('data-api')) || (window.location.origin + '/api');

  if (!BUSINESS_ID) {
    console.warn('[Sortora] Missing data-business-id attribute.');
    return;
  }

  var CSS = '\
    :host{all:initial;display:block;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;line-height:1.5;color:#0C1220}\
    *{margin:0;padding:0;box-sizing:border-box}\
    .sortora-root{border-radius:12px;overflow:hidden;transition:all .2s}\
    \
    .st-toggle{display:flex;align-items:center;gap:10px;padding:14px 18px;border-radius:12px;cursor:pointer;transition:all .15s;user-select:none}\
    .st-toggle.off{background:#f7f8fa;border:1px solid #e0e3e8}\
    .st-toggle.off:hover{border-color:#c0c5cc}\
    .st-toggle.on{background:#EEF2FF;border:1px solid rgba(59,107,255,.2)}\
    .st-switch{width:40px;height:22px;border-radius:11px;position:relative;transition:background .2s;flex-shrink:0}\
    .st-switch.off{background:#d0d5dd}\
    .st-switch.on{background:#3B6BFF}\
    .st-knob{width:18px;height:18px;border-radius:50%;background:#fff;position:absolute;top:2px;transition:left .2s;box-shadow:0 1px 3px rgba(0,0,0,.15)}\
    .st-switch.off .st-knob{left:2px}\
    .st-switch.on .st-knob{left:20px}\
    .st-toggle-text{font-size:14px;font-weight:600}\
    .st-toggle.off .st-toggle-text{color:#6a6a6a}\
    .st-toggle.on .st-toggle-text{color:#3B6BFF}\
    \
    .st-panel{max-height:0;overflow:hidden;transition:max-height .3s ease,opacity .2s;opacity:0}\
    .st-panel.open{max-height:600px;opacity:1}\
    .st-panel-inner{padding:16px 0 0}\
    \
    .st-field{margin-bottom:10px}\
    .st-label{display:block;font-size:12px;font-weight:600;color:#6a6a6a;margin-bottom:4px}\
    .st-input{width:100%;padding:10px 12px;border:1px solid #e0e3e8;border-radius:8px;font-size:14px;font-family:inherit;color:#0C1220;outline:none;transition:border .15s;background:#fff}\
    .st-input:focus{border-color:#3B6BFF;box-shadow:0 0 0 3px rgba(59,107,255,.08)}\
    .st-input::placeholder{color:#b0b5bd}\
    .st-row{display:flex;gap:8px}\
    .st-row>*{flex:1}\
    \
    .st-summary{background:#f7f8fa;border:1px solid #EBEBEB;border-radius:10px;padding:14px 16px;margin-top:14px}\
    .st-summary-row{display:flex;justify-content:space-between;align-items:center;font-size:13px;padding:3px 0}\
    .st-summary-row.total{font-size:15px;font-weight:800;border-top:1px solid #e0e3e8;margin-top:6px;padding-top:8px}\
    .st-summary-label{color:#6a6a6a}\
    .st-summary-value{font-weight:700;color:#0C1220}\
    .st-summary-value.blue{color:#3B6BFF}\
    \
    .st-submit{width:100%;padding:14px;background:#3B6BFF;color:#fff;border:none;border-radius:10px;font-size:15px;font-weight:700;cursor:pointer;font-family:inherit;margin-top:14px;transition:all .15s;display:flex;align-items:center;justify-content:center;gap:8px}\
    .st-submit:hover{background:#2d5ae6;transform:translateY(-1px);box-shadow:0 4px 14px rgba(59,107,255,.25)}\
    .st-submit:disabled{background:#d0d0d0;cursor:not-allowed;transform:none;box-shadow:none}\
    .st-submit svg{width:18px;height:18px}\
    \
    .st-share-result{margin-top:14px;padding:16px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;text-align:center}\
    .st-share-result-title{font-size:14px;font-weight:700;color:#166534;margin-bottom:8px}\
    .st-share-link{display:flex;gap:6px;margin-bottom:10px}\
    .st-share-link input{flex:1;padding:9px 12px;border:1px solid #d0d5dd;border-radius:8px;font-size:13px;font-family:inherit;color:#0C1220;background:#fff;outline:none}\
    .st-share-link button{padding:9px 16px;border:none;background:#0C1220;color:#fff;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;white-space:nowrap;transition:background .12s}\
    .st-share-link button:hover{background:#1a2540}\
    .st-share-btn{width:100%;padding:12px;background:#3B6BFF;color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit;transition:all .15s;display:flex;align-items:center;justify-content:center;gap:8px}\
    .st-share-btn:hover{background:#2d5ae6}\
    .st-share-btn svg{width:16px;height:16px}\
    .st-share-spots{font-size:12px;color:#6a6a6a;margin-top:8px}\
    \
    .st-footer{text-align:center;margin-top:10px}\
    .st-footer a{display:inline-flex;align-items:center;gap:4px;font-size:11px;color:#b0b0b0;text-decoration:none;font-weight:500;transition:color .12s}\
    .st-footer a:hover{color:#6a6a6a}\
    \
    .st-error{background:#fff5f5;border:1px solid #fed7d7;color:#c53030;padding:8px 12px;border-radius:8px;font-size:12px;margin-top:8px;display:none}\
  ';

  var HTML = '\
    <div class="sortora-root">\
      <div class="st-toggle off" id="st-toggle">\
        <div class="st-switch off" id="st-switch"><div class="st-knob"></div></div>\
        <div class="st-toggle-text">Split this booking with your group</div>\
      </div>\
      <div class="st-panel" id="st-panel">\
        <div class="st-panel-inner">\
          <div class="st-row">\
            <div class="st-field"><div class="st-label">Booking total ($)</div><input class="st-input" type="number" id="st-total" placeholder="240" step="0.01"/></div>\
            <div class="st-field"><div class="st-label">Number of people</div><input class="st-input" type="number" id="st-count" placeholder="4" min="2" max="20" value="4"/></div>\
          </div>\
          <div class="st-row">\
            <div class="st-field"><div class="st-label">Your name</div><input class="st-input" type="text" id="st-name" placeholder="Your name"/></div>\
            <div class="st-field"><div class="st-label">Your email</div><input class="st-input" type="email" id="st-email" placeholder="you@email.com"/></div>\
          </div>\
          <div class="st-summary" id="st-summary" style="display:none">\
            <div class="st-summary-row"><span class="st-summary-label">Booking total</span><span class="st-summary-value" id="st-sum-total">$0</span></div>\
            <div class="st-summary-row"><span class="st-summary-label">Split between</span><span class="st-summary-value" id="st-sum-count">0 people</span></div>\
            <div class="st-summary-row total"><span class="st-summary-label">Each person pays</span><span class="st-summary-value blue" id="st-sum-each">$0</span></div>\
          </div>\
          <button class="st-submit" id="st-submit" type="button">\
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>\
            Create & share split link\
          </button>\
          <div class="st-error" id="st-error"></div>\
          <div class="st-share-result" id="st-share-result" style="display:none">\
            <div class="st-share-result-title">Split created! Share this link:</div>\
            <div class="st-share-link"><input type="text" id="st-share-url" readonly/><button id="st-copy-btn" type="button">Copy</button></div>\
            <button class="st-share-btn" id="st-share-native" type="button">\
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>\
              Share with your group\
            </button>\
            <div class="st-share-spots" id="st-share-spots"></div>\
          </div>\
          <div class="st-footer"><a href="https://sortora.com" target="_blank">\
            <svg width="12" height="12" viewBox="0 0 44 44" fill="none"><circle cx="11" cy="32" r="6" stroke="#b0b0b0" stroke-width="1.5" fill="none"/><circle cx="33" cy="32" r="6" stroke="#b0b0b0" stroke-width="1.5" fill="none"/><circle cx="22" cy="10" r="6.5" fill="#b0b0b0"/><path d="M11 26 C11 6, 33 6, 33 26" stroke="#b0b0b0" stroke-width="1.4" fill="none" stroke-linecap="round"/></svg>\
            Powered by Sortora\
          </a></div>\
        </div>\
      </div>\
    </div>\
  ';

  // Mount
  var mount = document.querySelector('[data-sortora-mount]');
  if (!mount) {
    mount = document.createElement('div');
    mount.setAttribute('data-sortora-mount', '');
    var checkoutBtn = document.querySelector('[type="submit"], .checkout-btn, .book-btn, .booking-submit, #checkout, .btn-checkout');
    if (checkoutBtn && checkoutBtn.parentNode) {
      checkoutBtn.parentNode.insertBefore(mount, checkoutBtn);
    } else {
      document.body.appendChild(mount);
    }
  }

  var shadow = mount.attachShadow({ mode: 'open' });
  var styleEl = document.createElement('style');
  styleEl.textContent = CSS;
  shadow.appendChild(styleEl);
  var wrapper = document.createElement('div');
  wrapper.innerHTML = HTML;
  shadow.appendChild(wrapper);

  
  // Check if business subscription is active before rendering
  (async function() {
    try {
      var statusRes = await fetch(API_BASE + '/widget-status?id=' + BUSINESS_ID);
      var status = await statusRes.json();
      if (!status.active) {
        console.warn('[Sortora] Widget disabled: ' + (status.reason || 'inactive'));
        mount.style.display = 'none';
        return;
      }
    } catch (e) {
      // If status check fails, still show widget (fail open)
      console.warn('[Sortora] Status check failed, showing widget anyway');
    }
  })();

  // State
  var isOpen = false;
  var shareUrl = null;

  // Elements
  var toggle = shadow.getElementById('st-toggle');
  var switchEl = shadow.getElementById('st-switch');
  var panel = shadow.getElementById('st-panel');
  var totalInput = shadow.getElementById('st-total');
  var countInput = shadow.getElementById('st-count');
  var nameInput = shadow.getElementById('st-name');
  var emailInput = shadow.getElementById('st-email');
  var summary = shadow.getElementById('st-summary');
  var submitBtn = shadow.getElementById('st-submit');
  var errorEl = shadow.getElementById('st-error');
  var shareResult = shadow.getElementById('st-share-result');
  var shareUrlInput = shadow.getElementById('st-share-url');
  var copyBtn = shadow.getElementById('st-copy-btn');
  var shareNativeBtn = shadow.getElementById('st-share-native');

  // Toggle
  toggle.addEventListener('click', function() {
    isOpen = !isOpen;
    toggle.className = 'st-toggle ' + (isOpen ? 'on' : 'off');
    switchEl.className = 'st-switch ' + (isOpen ? 'on' : 'off');
    panel.className = 'st-panel ' + (isOpen ? 'open' : '');
  });

  // Prefill from data attributes
  if (PRESET_AMOUNT) {
    totalInput.value = PRESET_AMOUNT;
    totalInput.disabled = true;
    totalInput.style.background = '#f7f8fa';
    totalInput.style.color = '#555';
  }

  // Summary
  function updateSummary() {
    var total = parseFloat(totalInput.value) || 0;
    var count = parseInt(countInput.value) || 0;
    if (total > 0 && count >= 2) {
      var each = total / count;
      shadow.getElementById('st-sum-total').textContent = '$' + total.toFixed(2);
      shadow.getElementById('st-sum-count').textContent = count + ' people';
      shadow.getElementById('st-sum-each').textContent = '$' + each.toFixed(2);
      summary.style.display = 'block';
    } else {
      summary.style.display = 'none';
    }
  }
  totalInput.addEventListener('input', updateSummary);
  countInput.addEventListener('input', updateSummary);

  // Submit — create split
  submitBtn.addEventListener('click', async function() {
    errorEl.style.display = 'none';
    var total = parseFloat(totalInput.value);
    var count = parseInt(countInput.value);
    var name = nameInput.value.trim();
    var email = emailInput.value.trim();

    if (!total || total <= 0) { showError('Please enter the booking total.'); return; }
    if (!count || count < 2) { showError('Need at least 2 people.'); return; }
    if (!name) { showError('Please enter your name.'); return; }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showError('Please enter a valid email.'); return; }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating split...';

    try {
      var res = await fetch(API_BASE + '/create-split', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: BUSINESS_ID,
          title: PRESET_TITLE || document.title || 'Group Booking',
          totalAmount: total,
          totalParticipants: count,
          organizerEmail: email,
          organizerName: name,
          metadata: { pageUrl: window.location.href }
        })
      });

      var data = await res.json();
      if (data.success) {
        shareUrl = data.joinUrl;
        shareUrlInput.value = shareUrl;
        shadow.getElementById('st-share-spots').textContent = (data.spotsTotal - data.spotsFilled) + ' spots left for your group to claim';
        shareResult.style.display = 'block';
        submitBtn.style.display = 'none';

        // Disable form fields
        totalInput.disabled = true;
        countInput.disabled = true;
        nameInput.disabled = true;
        emailInput.disabled = true;

        // Auto-trigger native share if available
        if (navigator.share) {
          triggerShare();
        }
      } else {
        showError(data.error || 'Something went wrong.');
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg> Create & share split link';
      }
    } catch (e) {
      showError('Network error. Please try again.');
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg> Create & share split link';
    }
  });

  // Copy
  copyBtn.addEventListener('click', function() {
    shareUrlInput.select();
    navigator.clipboard.writeText(shareUrl).then(function() {
      copyBtn.textContent = 'Copied!';
      setTimeout(function() { copyBtn.textContent = 'Copy'; }, 2000);
    });
  });

  // Native share
  function triggerShare() {
    var total = parseFloat(totalInput.value) || 0;
    var count = parseInt(countInput.value) || 0;
    var each = (total / count).toFixed(2);
    navigator.share({
      title: 'Split this booking — $' + each + ' each',
      text: 'Pay your share of ' + (document.title || 'this booking') + '. Your share is $' + each + '.',
      url: shareUrl
    }).catch(function() {});
  }
  shareNativeBtn.addEventListener('click', function() {
    if (navigator.share) {
      triggerShare();
    } else {
      shareUrlInput.select();
      navigator.clipboard.writeText(shareUrl);
      copyBtn.textContent = 'Copied!';
      setTimeout(function() { copyBtn.textContent = 'Copy'; }, 2000);
    }
  });

  function showError(msg) {
    errorEl.textContent = msg;
    errorEl.style.display = 'block';
  }

  // Dark theme
  if (THEME === 'dark') {
    var darkCSS = document.createElement('style');
    darkCSS.textContent = '\
      .st-toggle.off{background:#1a1a2e;border-color:#2a2a3e;color:#fff}\
      .st-toggle.off .st-toggle-text{color:#aaa}\
      .st-toggle.on{background:#1a1a3e;border-color:rgba(59,107,255,.3)}\
      .st-input{background:#1a1a2e;border-color:#2a2a3e;color:#fff}\
      .st-input::placeholder{color:#555}\
      .st-summary{background:#1a1a2e;border-color:#2a2a3e}\
      .st-summary-label{color:#888}\
      .st-summary-value{color:#fff}\
    ';
    shadow.appendChild(darkCSS);
  }
})();
