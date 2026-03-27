/**
 * Sortora Split-Payment Widget v1
 * 
 * Usage:
 * <script src="https://js.sortora.com/v1/widget.js" data-business-id="biz_xxx" data-theme="auto"></script>
 * 
 * The widget renders inside a Shadow DOM to avoid CSS conflicts.
 * It attaches to [data-sortora-mount] or creates a floating element.
 */
(function() {
  'use strict';

  // ═══ CONFIG ═══
  var script = document.currentScript;
  var BUSINESS_ID = script && script.getAttribute('data-business-id');
  var THEME = (script && script.getAttribute('data-theme')) || 'auto';
  var API_BASE = 'https://sortora.com/api';
  var PAY_BASE = 'https://sortora.com/pay.html';

  if (!BUSINESS_ID) {
    console.warn('[Sortora] Missing data-business-id attribute.');
    return;
  }

  // ═══ STYLES ═══
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
    .st-emails{display:flex;flex-direction:column;gap:6px;margin-bottom:12px}\
    .st-email-row{display:flex;align-items:center;gap:8px}\
    .st-email-num{width:24px;height:24px;border-radius:50%;background:#EEF2FF;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:#3B6BFF;flex-shrink:0}\
    .st-email-input{flex:1;padding:9px 12px;border:1px solid #e0e3e8;border-radius:8px;font-size:13px;font-family:inherit;color:#0C1220;outline:none;transition:border .15s}\
    .st-email-input:focus{border-color:#3B6BFF}\
    .st-email-input::placeholder{color:#b0b5bd}\
    .st-remove{width:24px;height:24px;border-radius:50%;border:none;background:#f7f8fa;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#b0b0b0;font-size:14px;transition:all .12s;flex-shrink:0}\
    .st-remove:hover{background:#fee2e2;color:#ef4444}\
    \
    .st-add-btn{display:flex;align-items:center;gap:6px;padding:8px 14px;border:1px dashed #d0d5dd;border-radius:8px;background:none;cursor:pointer;font-size:13px;font-weight:600;color:#6a6a6a;font-family:inherit;width:100%;justify-content:center;transition:all .12s}\
    .st-add-btn:hover{border-color:#3B6BFF;color:#3B6BFF;background:#fafbff}\
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
    \
    .st-footer{text-align:center;margin-top:10px}\
    .st-footer a{display:inline-flex;align-items:center;gap:4px;font-size:11px;color:#b0b0b0;text-decoration:none;font-weight:500;transition:color .12s}\
    .st-footer a:hover{color:#6a6a6a}\
    \
    .st-error{background:#fff5f5;border:1px solid #fed7d7;color:#c53030;padding:8px 12px;border-radius:8px;font-size:12px;margin-top:8px;display:none}\
    .st-success{background:#f0fff4;border:1px solid #c6f6d5;color:#276749;padding:8px 12px;border-radius:8px;font-size:12px;margin-top:8px;display:none;text-align:center}\
  ';

  // ═══ HTML TEMPLATE ═══
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
            <div class="st-field"><div class="st-label">Number of people</div><input class="st-input" type="number" id="st-count" placeholder="4" min="2" max="20"/></div>\
          </div>\
          <div class="st-field"><div class="st-label">Your email (organizer)</div><input class="st-input" type="email" id="st-organizer" placeholder="you@email.com"/></div>\
          <div class="st-label" style="margin-top:12px;margin-bottom:6px">Group emails</div>\
          <div class="st-emails" id="st-emails"></div>\
          <button class="st-add-btn" id="st-add" type="button">+ Add another person</button>\
          <div class="st-summary" id="st-summary" style="display:none">\
            <div class="st-summary-row"><span class="st-summary-label">Booking total</span><span class="st-summary-value" id="st-sum-total">$0</span></div>\
            <div class="st-summary-row"><span class="st-summary-label">Split between</span><span class="st-summary-value" id="st-sum-count">0 people</span></div>\
            <div class="st-summary-row total"><span class="st-summary-label">Each person pays</span><span class="st-summary-value blue" id="st-sum-each">$0</span></div>\
          </div>\
          <button class="st-submit" id="st-submit" type="button">Send payment links</button>\
          <div class="st-error" id="st-error"></div>\
          <div class="st-success" id="st-success">Payment links sent! Each person will receive an email with their share.</div>\
          <div class="st-footer"><a href="https://sortora.com" target="_blank">\
            <svg width="12" height="12" viewBox="0 0 44 44" fill="none"><circle cx="11" cy="32" r="6" stroke="#b0b0b0" stroke-width="1.5" fill="none"/><circle cx="33" cy="32" r="6" stroke="#b0b0b0" stroke-width="1.5" fill="none"/><circle cx="22" cy="10" r="6.5" fill="#b0b0b0"/><path d="M11 26 C11 6, 33 6, 33 26" stroke="#b0b0b0" stroke-width="1.4" fill="none" stroke-linecap="round"/></svg>\
            Powered by Sortora\
          </a></div>\
        </div>\
      </div>\
    </div>\
  ';

  // ═══ MOUNT ═══
  var mount = document.querySelector('[data-sortora-mount]');
  if (!mount) {
    mount = document.createElement('div');
    mount.setAttribute('data-sortora-mount', '');
    // Try to insert near a checkout button or form submit
    var checkoutBtn = document.querySelector('[type="submit"], .checkout-btn, .book-btn, .booking-submit, #checkout, .btn-checkout');
    if (checkoutBtn && checkoutBtn.parentNode) {
      checkoutBtn.parentNode.insertBefore(mount, checkoutBtn);
    } else {
      document.body.appendChild(mount);
    }
  }

  // Shadow DOM
  var shadow = mount.attachShadow({ mode: 'open' });
  var styleEl = document.createElement('style');
  styleEl.textContent = CSS;
  shadow.appendChild(styleEl);

  var wrapper = document.createElement('div');
  wrapper.innerHTML = HTML;
  shadow.appendChild(wrapper);

  // ═══ STATE ═══
  var isOpen = false;
  var emailCount = 1;

  // ═══ ELEMENTS ═══
  var toggle = shadow.getElementById('st-toggle');
  var switchEl = shadow.getElementById('st-switch');
  var panel = shadow.getElementById('st-panel');
  var totalInput = shadow.getElementById('st-total');
  var countInput = shadow.getElementById('st-count');
  var organizerInput = shadow.getElementById('st-organizer');
  var emailsContainer = shadow.getElementById('st-emails');
  var addBtn = shadow.getElementById('st-add');
  var summary = shadow.getElementById('st-summary');
  var submitBtn = shadow.getElementById('st-submit');
  var errorEl = shadow.getElementById('st-error');
  var successEl = shadow.getElementById('st-success');

  // ═══ TOGGLE ═══
  toggle.addEventListener('click', function() {
    isOpen = !isOpen;
    toggle.className = 'st-toggle ' + (isOpen ? 'on' : 'off');
    switchEl.className = 'st-switch ' + (isOpen ? 'on' : 'off');
    panel.className = 'st-panel ' + (isOpen ? 'open' : '');
    if (isOpen && emailsContainer.children.length === 0) {
      addEmailRow();
    }
  });

  // ═══ EMAIL ROWS ═══
  function addEmailRow() {
    emailCount++;
    var row = document.createElement('div');
    row.className = 'st-email-row';
    row.innerHTML = '<div class="st-email-num">' + emailCount + '</div><input class="st-email-input" type="email" placeholder="friend@email.com"/><button class="st-remove" type="button">&times;</button>';
    emailsContainer.appendChild(row);
    row.querySelector('.st-remove').addEventListener('click', function() {
      row.remove();
      renumberEmails();
      updateSummary();
    });
    row.querySelector('.st-email-input').addEventListener('input', updateSummary);
    updateSummary();
  }

  function renumberEmails() {
    var rows = emailsContainer.querySelectorAll('.st-email-row');
    for (var i = 0; i < rows.length; i++) {
      rows[i].querySelector('.st-email-num').textContent = i + 2;
    }
    emailCount = rows.length + 1;
  }

  addBtn.addEventListener('click', function() {
    if (emailsContainer.children.length < 19) addEmailRow();
  });

  // ═══ SUMMARY ═══
  totalInput.addEventListener('input', updateSummary);
  countInput.addEventListener('input', function() {
    // Sync email rows with count
    var target = parseInt(countInput.value) || 0;
    if (target < 2) return;
    var currentRows = emailsContainer.children.length;
    var needed = target - 1; // minus the organizer
    while (currentRows < needed) { addEmailRow(); currentRows++; }
    while (currentRows > needed && currentRows > 1) {
      emailsContainer.removeChild(emailsContainer.lastChild);
      currentRows--;
      renumberEmails();
    }
    updateSummary();
  });

  function updateSummary() {
    var total = parseFloat(totalInput.value) || 0;
    var emails = emailsContainer.querySelectorAll('.st-email-input');
    var count = emails.length + 1; // +1 for organizer
    if (total > 0 && count >= 2) {
      var each = (total / count);
      shadow.getElementById('st-sum-total').textContent = '$' + total.toFixed(2);
      shadow.getElementById('st-sum-count').textContent = count + ' people';
      shadow.getElementById('st-sum-each').textContent = '$' + each.toFixed(2);
      summary.style.display = 'block';
      countInput.value = count;
    } else {
      summary.style.display = 'none';
    }
  }

  // ═══ SUBMIT ═══
  submitBtn.addEventListener('click', async function() {
    errorEl.style.display = 'none';
    successEl.style.display = 'none';

    var total = parseFloat(totalInput.value);
    var organizer = organizerInput.value.trim();
    if (!total || total <= 0) { showError('Please enter the booking total.'); return; }
    if (!organizer || !isValidEmail(organizer)) { showError('Please enter your email address.'); return; }

    var emailInputs = emailsContainer.querySelectorAll('.st-email-input');
    var emails = [organizer];
    for (var i = 0; i < emailInputs.length; i++) {
      var em = emailInputs[i].value.trim();
      if (!em) { showError('Please fill in all email addresses.'); return; }
      if (!isValidEmail(em)) { showError('"' + em + '" is not a valid email.'); return; }
      if (emails.indexOf(em) !== -1) { showError('Duplicate email: ' + em); return; }
      emails.push(em);
    }

    if (emails.length < 2) { showError('You need at least 2 people to split.'); return; }

    var perPerson = total / emails.length;

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending payment links...';

    try {
      var res = await fetch(API_BASE + '/split', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: BUSINESS_ID,
          title: document.title || 'Booking',
          totalAmount: total,
          perPersonAmount: Math.round(perPerson * 100) / 100,
          participants: emails.map(function(e, i) {
            return { email: e, isOrganizer: i === 0 };
          }),
          metadata: {
            pageUrl: window.location.href,
            referrer: document.referrer
          }
        })
      });

      var data = await res.json();
      if (data.success) {
        successEl.style.display = 'block';
        submitBtn.textContent = 'Links sent!';
        submitBtn.style.background = '#10B981';
        // Disable form
        totalInput.disabled = true;
        countInput.disabled = true;
        organizerInput.disabled = true;
        emailsContainer.querySelectorAll('.st-email-input').forEach(function(el) { el.disabled = true; });
        addBtn.style.display = 'none';
      } else {
        showError(data.error || 'Something went wrong. Please try again.');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send payment links';
      }
    } catch (e) {
      showError('Network error. Please check your connection.');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send payment links';
    }
  });

  function showError(msg) {
    errorEl.textContent = msg;
    errorEl.style.display = 'block';
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  // ═══ THEME ═══
  if (THEME === 'dark') {
    var darkCSS = document.createElement('style');
    darkCSS.textContent = '\
      .st-toggle.off{background:#1a1a2e;border-color:#2a2a3e;color:#fff}\
      .st-toggle.off .st-toggle-text{color:#aaa}\
      .st-toggle.on{background:#1a1a3e;border-color:rgba(59,107,255,.3)}\
      .st-input,.st-email-input{background:#1a1a2e;border-color:#2a2a3e;color:#fff}\
      .st-input::placeholder,.st-email-input::placeholder{color:#555}\
      .st-summary{background:#1a1a2e;border-color:#2a2a3e}\
      .st-summary-label{color:#888}\
      .st-summary-value{color:#fff}\
      .st-add-btn{border-color:#2a2a3e;color:#888}\
      .st-add-btn:hover{border-color:#3B6BFF;color:#3B6BFF;background:#1a1a3e}\
      .st-label{color:#888}\
      .st-remove{background:#1a1a2e;color:#555}\
      .st-remove:hover{background:#2a1a1a;color:#ef4444}\
    ';
    shadow.appendChild(darkCSS);
  }

})();
