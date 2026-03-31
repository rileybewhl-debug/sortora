/**
 * Sortora Email Templates
 * Brand: #3B6BFF (Sortora Blue), #0C1220 (Dark Navy)
 * Font: Plus Jakarta Sans
 */

var BRAND  = '#3B6BFF';
var DARK   = '#0C1220';
var GRAY   = '#6b7280';
var LIGHT  = '#f5f6f8';
var GREEN  = '#059669';
var WHITE  = '#ffffff';
var BORDER = '#e5e7eb';
var MUTED  = '#9ca3af';
var GLASS  = '#f9fafb';

var LOGO_SVG = '<svg width="26" height="26" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">'
  + '<circle cx="11" cy="32" r="6" stroke="{{LOGO_STROKE}}" stroke-width="1.5" fill="none"/>'
  + '<circle cx="33" cy="32" r="6" stroke="{{LOGO_STROKE}}" stroke-width="1.5" fill="none"/>'
  + '<circle cx="22" cy="10" r="6.5" fill="' + BRAND + '"/>'
  + '<path d="M11 26 C11 6, 33 6, 33 26" stroke="{{LOGO_STROKE}}" stroke-width="1.4" fill="none" stroke-linecap="round"/>'
  + '</svg>';

function logo(strokeColor) {
  return LOGO_SVG.replace(/\{\{LOGO_STROKE\}\}/g, strokeColor || WHITE);
}

var STRIPE_ICON = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">'
  + '<rect width="24" height="24" rx="4" fill="#635BFF"/>'
  + '<path d="M11.2 9.6c0-.66.54-.92 1.44-.92.96 0 2.16.3 3.12.82V6.92A8.3 8.3 0 0012.64 6c-2.52 0-4.2 1.32-4.2 3.52 0 3.44 4.74 2.88 4.74 4.36 0 .78-.68 1.04-1.62 1.04-1.4 0-2.52-.48-3.54-1.12v2.58A8.98 8.98 0 0011.56 18c2.58 0 4.36-1.28 4.36-3.52-.02-3.72-4.72-3.04-4.72-4.48z" fill="white"/>'
  + '</svg>';

function wrapper(content) {
  return '<!DOCTYPE html><html><head><meta charset="utf-8"/>'
    + '<meta name="viewport" content="width=device-width,initial-scale=1.0"/>'
    + '<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>'
    + '</head>'
    + '<body style="margin:0;padding:0;background:' + LIGHT + ';font-family:\'Plus Jakarta Sans\',-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;-webkit-font-smoothing:antialiased">'
    + '<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:' + LIGHT + '">'
    + '<tr><td align="center" style="padding:40px 16px">'

    // Card
    + '<div style="max-width:520px;width:100%;background:' + WHITE + ';border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(12,18,32,.06)">'
    + content
    + '</div>'

    // Powered by Sortora
    + '<div style="margin-top:24px;text-align:center">'
    + '<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0 auto"><tr>'
    + '<td style="vertical-align:middle;padding-right:6px">'
    + logo(MUTED)
    .replace('width="26"', 'width="14"')
    .replace('height="26"', 'height="14"')
    + '</td>'
    + '<td style="vertical-align:middle;font-size:12px;color:' + MUTED + ';font-weight:500">Powered by </td>'
    + '<td style="vertical-align:middle"><a href="https://sortora.com" style="font-size:12px;color:' + DARK + ';font-weight:700;text-decoration:none;letter-spacing:-.2px"> Sortora</a></td>'
    + '</tr></table>'
    + '</div>'

    // Legal footer
    + '<p style="font-size:11px;color:' + MUTED + ';margin-top:16px;text-align:center;font-family:\'Plus Jakarta Sans\',sans-serif">'
    + 'This is a transactional email from Sortora.<br>'
    + '<a href="https://sortora.com/privacy" style="color:' + MUTED + ';text-decoration:underline">Privacy Policy</a>'
    + ' &middot; <a href="https://sortora.com/terms" style="color:' + MUTED + ';text-decoration:underline">Terms</a>'
    + '</p>'

    + '</td></tr></table></body></html>';
}

function header(subtitle) {
  return '<div style="background:' + DARK + ';padding:32px 40px 28px;text-align:left">'
    + '<table role="presentation" cellspacing="0" cellpadding="0" border="0"><tr>'
    + '<td style="vertical-align:middle;padding-right:10px">' + logo(WHITE) + '</td>'
    + '<td style="vertical-align:middle"><span style="font-size:20px;font-weight:800;color:' + WHITE + ';letter-spacing:-.4px">Sortora</span></td>'
    + '</tr></table>'
    + '<div style="font-size:12px;font-weight:600;color:rgba(255,255,255,.45);text-transform:uppercase;letter-spacing:1px;margin-top:6px">'
    + subtitle
    + '</div>'
    + '</div>';
}

function detailsBlock(data) {
  if (!data.date && !data.location) return '';
  var h = '<div style="background:' + GLASS + ';border-radius:12px;padding:16px 20px;margin:20px 0 0;border:1px solid ' + BORDER + '">';
  if (data.date) {
    h += '<table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:' + (data.location ? '8' : '0') + 'px"><tr>'
      + '<td style="font-size:13px;color:' + MUTED + ';font-weight:600;width:70px;vertical-align:top">Date</td>'
      + '<td style="font-size:13px;color:' + DARK + ';font-weight:600">' + data.date + '</td>'
      + '</tr></table>';
  }
  if (data.location) {
    h += '<table cellpadding="0" cellspacing="0" border="0" width="100%"><tr>'
      + '<td style="font-size:13px;color:' + MUTED + ';font-weight:600;width:70px;vertical-align:top">Location</td>'
      + '<td style="font-size:13px;color:' + DARK + ';font-weight:600">' + data.location + '</td>'
      + '</tr></table>';
  }
  h += '</div>';
  return h;
}

function stripeFooter() {
  return '<div style="text-align:center;padding:0 0 4px">'
    + '<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0 auto"><tr>'
    + '<td style="vertical-align:middle;padding-right:5px">' + STRIPE_ICON + '</td>'
    + '<td style="vertical-align:middle;font-size:12px;color:' + MUTED + ';font-weight:500">Processed securely through Stripe</td>'
    + '</tr></table></div>';
}

/* ═══════════════════════════════════════════════════
 *  1. PAYMENT LINK — "Pay your share" invite
 * ═══════════════════════════════════════════════════ */
function paymentLink(data) {
  var amt = parseFloat(data.amount).toFixed(2);
  var tot = parseFloat(data.totalAmount).toFixed(0);

  return wrapper(
    header('Split Payment')

    // Title
    + '<div style="padding:36px 40px 0;text-align:center">'
    + '<div style="font-size:22px;font-weight:800;color:' + DARK + ';letter-spacing:-.4px;line-height:1.25">'
    + data.bookingTitle
    + '</div>'
    + '<div style="font-size:14px;color:' + GRAY + ';margin-top:6px;font-weight:500">with ' + data.businessName + '</div>'
    + '</div>'

    // Amount
    + '<div style="padding:28px 40px;text-align:center">'
    + '<div style="background:rgba(59,107,255,.04);border-radius:12px;padding:24px;display:inline-block;min-width:200px;border:1px solid rgba(59,107,255,.12)">'
    + '<div style="font-size:11px;font-weight:700;color:' + BRAND + ';text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">Your share</div>'
    + '<div style="font-size:44px;font-weight:800;color:' + DARK + ';letter-spacing:-1.5px;line-height:1">$' + amt + '</div>'
    + '<div style="font-size:13px;color:' + GRAY + ';margin-top:8px;font-weight:500">$' + tot + ' total &middot; ' + data.totalParticipants + ' people</div>'
    + '</div>'
    + '</div>'

    // CTA
    + '<div style="padding:0 40px 36px;text-align:center">'
    + '<a href="' + data.payUrl + '" style="display:inline-block;padding:14px 48px;background:' + BRAND + ';color:#fff;border-radius:10px;font-size:16px;font-weight:700;text-decoration:none;letter-spacing:-.01em">Pay your share</a>'
    + '<div style="margin-top:16px">' + stripeFooter() + '</div>'
    + '</div>'
  );
}


/* ═══════════════════════════════════════════════════
 *  2. PAYMENT RECEIPT — sent after each individual payment
 * ═══════════════════════════════════════════════════ */
function paymentReceipt(data) {
  var amt = parseFloat(data.amount).toFixed(2);
  var share = parseFloat(data.shareAmount || data.amount).toFixed(2);
  var fee = parseFloat(data.feeAmount || 0).toFixed(2);
  var now = data.paidAt ? new Date(data.paidAt) : new Date();
  var dateStr = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  return wrapper(
    header('Payment Confirmation')

    // Greeting + Amount
    + '<div style="padding:36px 40px 20px">'
    + '<p style="font-size:15px;color:' + GRAY + ';margin:0 0 4px;font-weight:500">Hi ' + (data.participantName || 'there') + ',</p>'

    + '<div style="margin:20px 0 24px;padding:24px 28px;background:rgba(59,107,255,.04);border-radius:12px;border:1px solid rgba(59,107,255,.12)">'
    + '<p style="font-size:11px;font-weight:700;color:' + BRAND + ';text-transform:uppercase;letter-spacing:1px;margin:0 0 6px">Amount Paid</p>'
    + '<p style="font-size:38px;font-weight:800;color:' + DARK + ';letter-spacing:-1.5px;margin:0;line-height:1.1">$' + amt + '</p>'
    + '<p style="font-size:13px;color:' + GRAY + ';margin:8px 0 0;font-weight:500">Paid ' + dateStr + '</p>'
    + '<span style="display:inline-block;background:#ecfdf5;color:' + GREEN + ';font-size:11px;font-weight:700;padding:5px 14px;border-radius:100px;margin-top:14px;letter-spacing:.3px">&#10003; Payment Successful</span>'
    + '</div>'
    + '</div>'

    // Session card
    + '<div style="margin:0 40px 8px;padding:20px 24px;background:' + GLASS + ';border-radius:12px;border:1px solid ' + BORDER + '">'
    + '<p style="font-size:11px;font-weight:700;color:' + BRAND + ';text-transform:uppercase;letter-spacing:1px;margin:0 0 10px">Session Details</p>'
    + '<p style="font-size:16px;font-weight:700;color:' + DARK + ';margin:0 0 6px">' + data.bookingTitle + '</p>'
    + '<p style="font-size:13px;color:' + GRAY + ';margin:2px 0;font-weight:500">Organized by ' + (data.businessName || 'Business') + '</p>'
    + (data.date ? '<p style="font-size:13px;color:' + GRAY + ';margin:2px 0;font-weight:500">' + data.date + (data.location ? ' &middot; ' + data.location : '') + '</p>' : '')
    + '</div>'

    + '<div style="height:8px"></div>'

    // Receipt table
    + '<div style="padding:24px 40px">'
    + '<p style="font-size:11px;font-weight:700;color:' + MUTED + ';text-transform:uppercase;letter-spacing:1px;margin:0 0 16px">Receipt</p>'
    + '<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">'

    + '<tr><td style="padding:10px 0;border-bottom:1px solid #f3f4f6;font-size:14px;color:' + GRAY + ';font-weight:500">Your share</td>'
    + '<td style="padding:10px 0;border-bottom:1px solid #f3f4f6;font-size:14px;color:' + DARK + ';font-weight:600;text-align:right">$' + share + '</td></tr>'

    + '<tr><td style="padding:10px 0;border-bottom:1px solid #f3f4f6;font-size:14px;color:' + GRAY + ';font-weight:500">Processing fee</td>'
    + '<td style="padding:10px 0;border-bottom:1px solid #f3f4f6;font-size:14px;color:' + DARK + ';font-weight:600;text-align:right">$' + fee + '</td></tr>'

    + (data.receiptId
      ? '<tr><td style="padding:10px 0;border-bottom:1px solid #f3f4f6;font-size:14px;color:' + GRAY + ';font-weight:500">Receipt number</td>'
        + '<td style="padding:10px 0;border-bottom:1px solid #f3f4f6;font-size:12px;color:' + MUTED + ';font-weight:500;text-align:right;font-family:SF Mono,Fira Code,Consolas,monospace">' + data.receiptId + '</td></tr>'
      : '')

    + (data.paymentMethod
      ? '<tr><td style="padding:10px 0;border-bottom:1px solid #f3f4f6;font-size:14px;color:' + GRAY + ';font-weight:500">Payment method</td>'
        + '<td style="padding:10px 0;border-bottom:1px solid #f3f4f6;font-size:14px;color:' + DARK + ';font-weight:600;text-align:right">' + data.paymentMethod + '</td></tr>'
      : '')

    + '<tr><td style="padding:14px 0 10px;border-top:2px solid ' + BORDER + ';font-size:15px;color:' + DARK + ';font-weight:800">Total</td>'
    + '<td style="padding:14px 0 10px;border-top:2px solid ' + BORDER + ';font-size:15px;color:' + DARK + ';font-weight:800;text-align:right">$' + amt + '</td></tr>'

    + '</table>'
    + '</div>'

    // Divider + footer
    + '<div style="margin:0 40px;height:1px;background:' + BORDER + '"></div>'

    + '<div style="padding:20px 40px 8px;text-align:center">'
    + stripeFooter()
    + '</div>'

    + '<div style="padding:8px 40px 32px;text-align:center">'
    + '<p style="font-size:12px;color:' + GRAY + ';margin:0">Questions? <a href="mailto:support@sortora.com" style="color:' + BRAND + ';text-decoration:none;font-weight:600">support@sortora.com</a></p>'
    + '</div>'
  );
}


/* ═══════════════════════════════════════════════════
 *  3. BOOKING CONFIRMED — all participants paid
 * ═══════════════════════════════════════════════════ */
function bookingConfirmed(data) {
  var tot = parseFloat(data.totalAmount).toFixed(0);

  return wrapper(
    header('Booking Confirmed')

    + '<div style="padding:48px 40px;text-align:center">'

    // Checkmark
    + '<div style="width:56px;height:56px;border-radius:50%;background:' + GREEN + ';margin:0 auto 24px;text-align:center;line-height:56px">'
    + '<span style="font-size:28px;color:#fff;font-family:Arial,sans-serif">&#10003;</span>'
    + '</div>'

    + '<div style="font-size:24px;font-weight:800;color:' + DARK + ';letter-spacing:-.5px;margin-bottom:8px">Booking confirmed</div>'
    + '<div style="font-size:15px;color:' + GRAY + ';line-height:1.6;margin-bottom:4px;font-weight:500">All ' + data.participantCount + ' participants have paid for</div>'
    + '<div style="font-size:17px;font-weight:700;color:' + DARK + ';margin-bottom:4px">' + data.bookingTitle + '</div>'
    + '<div style="font-size:15px;color:' + GRAY + ';margin-bottom:20px;font-weight:500">with ' + (data.businessName || 'Business') + '</div>'

    + detailsBlock(data)

    // Summary pills
    + '<div style="background:rgba(59,107,255,.04);border-radius:12px;padding:16px 24px;margin-top:20px;display:inline-block;border:1px solid rgba(59,107,255,.12)">'
    + '<table cellpadding="0" cellspacing="0" border="0"><tr>'
    + '<td style="padding:0 20px;text-align:center"><div style="font-size:11px;color:' + MUTED + ';text-transform:uppercase;letter-spacing:.8px;margin-bottom:2px;font-weight:600">Total</div><div style="font-size:20px;font-weight:800;color:' + DARK + '">$' + tot + '</div></td>'
    + '<td style="width:1px;background:' + BORDER + ';padding:0"></td>'
    + '<td style="padding:0 20px;text-align:center"><div style="font-size:11px;color:' + MUTED + ';text-transform:uppercase;letter-spacing:.8px;margin-bottom:2px;font-weight:600">Split</div><div style="font-size:20px;font-weight:800;color:' + DARK + '">' + data.participantCount + ' people</div></td>'
    + '</tr></table>'
    + '</div>'

    + '</div>'
  );
}


/* ═══════════════════════════════════════════════════
 *  4. BUSINESS CONFIRMED — notification to business
 * ═══════════════════════════════════════════════════ */
function businessConfirmed(data) {
  var tot = parseFloat(data.totalAmount).toFixed(0);
  var perPerson = (parseFloat(data.totalAmount) / parseInt(data.participantCount)).toFixed(0);

  return wrapper(
    header('Booking Confirmed')

    + '<div style="padding:36px 40px">'

    // Green badge
    + '<div style="display:inline-block;background:#ecfdf5;color:' + GREEN + ';font-size:11px;font-weight:700;padding:5px 14px;border-radius:100px;letter-spacing:.3px;margin-bottom:16px">&#10003; All Paid</div>'

    + '<div style="font-size:24px;font-weight:800;color:' + DARK + ';letter-spacing:-.5px;margin-bottom:8px">' + data.bookingTitle + '</div>'
    + '<div style="font-size:15px;color:' + GRAY + ';line-height:1.6;margin-bottom:24px;font-weight:500">All ' + data.participantCount + ' participants have paid.</div>'

    + detailsBlock(data)

    // Stats row
    + '<div style="background:rgba(59,107,255,.04);border-radius:12px;overflow:hidden;margin:24px 0 28px;border:1px solid rgba(59,107,255,.12)">'
    + '<table cellpadding="0" cellspacing="0" border="0" width="100%"><tr>'
    + '<td style="padding:18px;text-align:center;width:33%"><div style="font-size:11px;color:' + MUTED + ';text-transform:uppercase;letter-spacing:.8px;margin-bottom:4px;font-weight:600">Total</div><div style="font-size:22px;font-weight:800;color:' + DARK + '">$' + tot + '</div></td>'
    + '<td style="padding:18px;text-align:center;width:33%;border-left:1px solid ' + BORDER + ';border-right:1px solid ' + BORDER + '"><div style="font-size:11px;color:' + MUTED + ';text-transform:uppercase;letter-spacing:.8px;margin-bottom:4px;font-weight:600">Per person</div><div style="font-size:22px;font-weight:800;color:' + DARK + '">$' + perPerson + '</div></td>'
    + '<td style="padding:18px;text-align:center;width:33%"><div style="font-size:11px;color:' + MUTED + ';text-transform:uppercase;letter-spacing:.8px;margin-bottom:4px;font-weight:600">Status</div><div style="font-size:22px;font-weight:800;color:' + GREEN + '">Paid</div></td>'
    + '</tr></table>'
    + '</div>'

    // CTA
    + '<a href="https://sortora.com/dashboard.html" style="display:inline-block;padding:14px 32px;background:' + BRAND + ';color:#fff;border-radius:10px;font-size:15px;font-weight:700;text-decoration:none">View in Dashboard</a>'

    + '</div>'
  );
}


/* ═══════════════════════════════════════════════════
 *  5. WELCOME — Day 0
 * ═══════════════════════════════════════════════════ */
function welcome(data) {
  return wrapper(header('Welcome to Sortora')
    + '<div style="padding:36px 40px">'
    + '<p style="font-size:20px;font-weight:800;color:' + DARK + ';margin:0 0 12px;letter-spacing:-.3px">Welcome aboard, ' + data.name + '!</p>'
    + '<p style="font-size:15px;color:' + GRAY + ';line-height:1.65;margin:0 0 20px;font-weight:500">You just took the first step toward eliminating the &ldquo;who\u2019s paying?&rdquo; problem. Here\u2019s what happens next:</p>'
    + '<div style="background:' + GLASS + ';border-radius:12px;padding:20px 24px;margin-bottom:24px;border:1px solid ' + BORDER + '">'
    + '<table cellpadding="0" cellspacing="0" border="0" width="100%">'
    + '<tr><td style="padding:8px 0;font-size:14px"><span style="display:inline-block;width:24px;height:24px;border-radius:50%;background:#ecfdf5;color:' + GREEN + ';text-align:center;line-height:24px;font-size:12px;font-weight:800;margin-right:12px">\u2713</span><span style="color:' + DARK + ';font-weight:600">Create your account</span></td></tr>'
    + '<tr><td style="padding:8px 0;font-size:14px"><span style="display:inline-block;width:24px;height:24px;border-radius:50%;background:rgba(59,107,255,.08);color:' + BRAND + ';text-align:center;line-height:24px;font-size:12px;font-weight:800;margin-right:12px">2</span><span style="color:' + DARK + ';font-weight:600">Connect Stripe</span> <span style="color:' + MUTED + ';font-size:12px">&mdash; 3 min</span></td></tr>'
    + '<tr><td style="padding:8px 0;font-size:14px"><span style="display:inline-block;width:24px;height:24px;border-radius:50%;background:rgba(59,107,255,.08);color:' + BRAND + ';text-align:center;line-height:24px;font-size:12px;font-weight:800;margin-right:12px">3</span><span style="color:' + DARK + ';font-weight:600">Embed the widget</span> <span style="color:' + MUTED + ';font-size:12px">&mdash; 5 min</span></td></tr>'
    + '<tr><td style="padding:8px 0;font-size:14px"><span style="display:inline-block;width:24px;height:24px;border-radius:50%;background:rgba(59,107,255,.08);color:' + BRAND + ';text-align:center;line-height:24px;font-size:12px;font-weight:800;margin-right:12px">4</span><span style="color:' + DARK + ';font-weight:600">Get paid</span></td></tr>'
    + '</table></div>'
    + '<a href="' + data.dashUrl + '" style="display:inline-block;padding:14px 36px;background:' + BRAND + ';color:#fff;border-radius:10px;font-size:15px;font-weight:700;text-decoration:none">Connect Stripe &rarr;</a>'
    + '<p style="font-size:13px;color:' + MUTED + ';margin:20px 0 0;font-weight:500">The whole setup takes under 10 minutes.</p>'
    + '</div>');
}

/* ═══════════════════════════════════════════════════
 *  6. QUICK WIN — Day 1
 * ═══════════════════════════════════════════════════ */
function quickWin(data) {
  return wrapper(header('Quick Start Guide')
    + '<div style="padding:36px 40px">'
    + '<p style="font-size:20px;font-weight:800;color:' + DARK + ';margin:0 0 12px;letter-spacing:-.3px">Create your first split in 2 minutes</p>'
    + '<p style="font-size:15px;color:' + GRAY + ';line-height:1.65;margin:0 0 24px;font-weight:500">Here\u2019s the fastest path to your first split payment, ' + data.name + ':</p>'
    + '<div style="background:' + GLASS + ';border-radius:12px;padding:24px;margin-bottom:24px;border:1px solid ' + BORDER + '">'
    + '<div style="margin-bottom:20px"><div style="font-size:11px;font-weight:700;color:' + BRAND + ';text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">Step 1</div><div style="font-size:15px;font-weight:700;color:' + DARK + ';margin-bottom:4px">Open your dashboard</div><div style="font-size:13px;color:' + GRAY + '">Click &ldquo;New Split&rdquo; in the top right corner.</div></div>'
    + '<div style="margin-bottom:20px"><div style="font-size:11px;font-weight:700;color:' + BRAND + ';text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">Step 2</div><div style="font-size:15px;font-weight:700;color:' + DARK + ';margin-bottom:4px">Enter the booking details</div><div style="font-size:13px;color:' + GRAY + '">Title, total amount, and number of people.</div></div>'
    + '<div><div style="font-size:11px;font-weight:700;color:' + BRAND + ';text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">Step 3</div><div style="font-size:15px;font-weight:700;color:' + DARK + ';margin-bottom:4px">Share the payment link</div><div style="font-size:13px;color:' + GRAY + '">Each participant gets a personal link to pay via Stripe.</div></div>'
    + '</div>'
    + '<a href="' + data.dashUrl + '" style="display:inline-block;padding:14px 36px;background:' + BRAND + ';color:#fff;border-radius:10px;font-size:15px;font-weight:700;text-decoration:none">Create my first split &rarr;</a>'
    + '</div>');
}

/* ═══════════════════════════════════════════════════
 *  7. SOCIAL PROOF — Day 3
 * ═══════════════════════════════════════════════════ */
function socialProof(data) {
  return wrapper(header('Customer Spotlight')
    + '<div style="padding:36px 40px">'
    + '<p style="font-size:20px;font-weight:800;color:' + DARK + ';margin:0 0 12px;letter-spacing:-.3px">How experience businesses use Sortora</p>'
    + '<p style="font-size:15px;color:' + GRAY + ';line-height:1.65;margin:0 0 24px;font-weight:500">We built Sortora because group bookings shouldn\u2019t mean chasing payments:</p>'
    + '<div style="background:rgba(59,107,255,.04);border-radius:12px;padding:28px;margin-bottom:24px;border:1px solid rgba(59,107,255,.12)">'
    + '<div style="font-size:15px;color:' + DARK + ';line-height:1.7;font-style:italic;font-weight:500">&ldquo;Groups of 4-6 people would book, one person would pay the full $180, then spend a week chasing everyone on Venmo. Now everyone pays their own share at checkout.&rdquo;</div>'
    + '<div style="font-size:13px;color:' + BRAND + ';font-weight:700;margin-top:12px">&mdash; Escape room operator, Seattle WA</div></div>'
    + '<div style="background:' + GLASS + ';border-radius:12px;overflow:hidden;margin-bottom:24px;border:1px solid ' + BORDER + '"><table cellpadding="0" cellspacing="0" border="0" width="100%"><tr>'
    + '<td style="padding:20px;text-align:center;width:50%"><div style="font-size:28px;font-weight:800;color:' + BRAND + '">47%</div><div style="font-size:12px;color:' + GRAY + ';margin-top:4px;font-weight:500">more completed<br>group bookings</div></td>'
    + '<td style="padding:20px;text-align:center;width:50%;border-left:1px solid ' + BORDER + '"><div style="font-size:28px;font-weight:800;color:' + BRAND + '">8 hrs</div><div style="font-size:12px;color:' + GRAY + ';margin-top:4px;font-weight:500">saved per month on<br>payment management</div></td>'
    + '</tr></table></div>'
    + '<a href="' + data.dashUrl + '" style="display:inline-block;padding:14px 36px;background:' + BRAND + ';color:#fff;border-radius:10px;font-size:15px;font-weight:700;text-decoration:none">Set up my widget &rarr;</a>'
    + '</div>');
}

/* ═══════════════════════════════════════════════════
 *  8. FEATURE SPOTLIGHT — Day 5
 * ═══════════════════════════════════════════════════ */
function featureSpotlight(data) {
  return wrapper(header('Feature Spotlight')
    + '<div style="padding:36px 40px">'
    + '<p style="font-size:20px;font-weight:800;color:' + DARK + ';margin:0 0 12px;letter-spacing:-.3px">Did you know Sortora can do this?</p>'
    + '<p style="font-size:15px;color:' + GRAY + ';line-height:1.65;margin:0 0 24px;font-weight:500">Three features ' + data.businessName + ' might find useful:</p>'
    + '<div style="margin-bottom:16px;padding:20px 24px;background:' + GLASS + ';border-radius:12px;border:1px solid ' + BORDER + '"><div style="font-size:15px;font-weight:700;color:' + DARK + ';margin-bottom:6px">\u26a1 Auto-expiry</div><div style="font-size:13px;color:' + GRAY + ';line-height:1.6">Split payments expire automatically after 7 days. No stale bookings.</div></div>'
    + '<div style="margin-bottom:16px;padding:20px 24px;background:' + GLASS + ';border-radius:12px;border:1px solid ' + BORDER + '"><div style="font-size:15px;font-weight:700;color:' + DARK + ';margin-bottom:6px">\ud83d\udd17 Shareable payment links</div><div style="font-size:13px;color:' + GRAY + ';line-height:1.6">Each participant gets a unique link. Share via text, email, or WhatsApp.</div></div>'
    + '<div style="margin-bottom:24px;padding:20px 24px;background:' + GLASS + ';border-radius:12px;border:1px solid ' + BORDER + '"><div style="font-size:15px;font-weight:700;color:' + DARK + ';margin-bottom:6px">\ud83d\udcc8 Real-time tracking</div><div style="font-size:13px;color:' + GRAY + ';line-height:1.6">See who\u2019s paid and who hasn\u2019t. Booking confirms when everyone pays.</div></div>'
    + '<a href="' + data.dashUrl + '" style="display:inline-block;padding:14px 36px;background:' + BRAND + ';color:#fff;border-radius:10px;font-size:15px;font-weight:700;text-decoration:none">Try it out &rarr;</a>'
    + '</div>');
}

/* ═══════════════════════════════════════════════════
 *  9. CHECK-IN — Day 7: Personal founder email
 * ═══════════════════════════════════════════════════ */
function checkIn(data) {
  return wrapper(
    '<div style="padding:40px 40px 36px">'
    + '<p style="font-size:15px;color:' + DARK + ';line-height:1.75;margin:0 0 16px;font-weight:500">Hey ' + data.name + ',</p>'
    + '<p style="font-size:15px;color:' + GRAY + ';line-height:1.75;margin:0 0 16px;font-weight:500">It\u2019s Riley, the founder of Sortora. I wanted to personally check in &mdash; how\u2019s everything going?</p>'
    + '<p style="font-size:15px;color:' + GRAY + ';line-height:1.75;margin:0 0 16px;font-weight:500">I built Sortora because I saw how much friction group payments cause for experience businesses. Every escape room, pottery studio, and cooking class deals with the same problem.</p>'
    + '<p style="font-size:15px;color:' + GRAY + ';line-height:1.75;margin:0 0 16px;font-weight:500">If you\u2019ve had a chance to try it out, I\u2019d love to hear what you think. If you hit any snags, just reply &mdash; it comes straight to me.</p>'
    + '<p style="font-size:15px;color:' + GRAY + ';line-height:1.75;margin:0 0 8px;font-weight:500">A few things I can help with:</p>'
    + '<div style="padding:0 0 0 12px;margin-bottom:20px">'
    + '<p style="font-size:14px;color:' + GRAY + ';line-height:1.75;margin:4px 0;font-weight:500">\u2022 Getting your widget embedded</p>'
    + '<p style="font-size:14px;color:' + GRAY + ';line-height:1.75;margin:4px 0;font-weight:500">\u2022 Customizing the checkout flow</p>'
    + '<p style="font-size:14px;color:' + GRAY + ';line-height:1.75;margin:4px 0;font-weight:500">\u2022 Running your first test split</p>'
    + '</div>'
    + '<p style="font-size:15px;color:' + GRAY + ';line-height:1.75;margin:0 0 24px;font-weight:500">Just hit reply. I read every email.</p>'
    + '<p style="font-size:15px;color:' + DARK + ';margin:0;font-weight:600">Riley Buell</p>'
    + '<p style="font-size:13px;color:' + MUTED + ';margin:2px 0 0;font-weight:500">Founder, Sortora</p>'
    + '</div>');
}


/* ═══════════════════════════════════════════════════
 *  10. DUNNING DAY 0 — Friendly heads up
 * ═══════════════════════════════════════════════════ */
function dunningDay0(data) {
  return wrapper(header('Payment Update')
    + '<div style="padding:36px 40px">'
    + '<p style="font-size:15px;color:' + GRAY + ';line-height:1.7;margin:0 0 16px;font-weight:500">Hey ' + data.name + ',</p>'
    + '<p style="font-size:15px;color:' + GRAY + ';line-height:1.7;margin:0 0 20px;font-weight:500">Quick heads up \u2014 your payment for Sortora didn\u2019t go through. This usually happens when a card expires or there\u2019s a temporary hold.</p>'
    + '<p style="font-size:15px;color:' + GRAY + ';line-height:1.7;margin:0 0 24px;font-weight:500">No action needed on your account yet \u2014 everything is still active. Just update your card when you get a chance:</p>'
    + '<a href="' + data.updateUrl + '" style="display:inline-block;padding:14px 36px;background:' + BRAND + ';color:#fff;border-radius:10px;font-size:15px;font-weight:700;text-decoration:none">Update payment method</a>'
    + '<p style="font-size:13px;color:' + MUTED + ';margin:20px 0 0;font-weight:500">Takes about 30 seconds.</p>'
    + '</div>');
}

/* ═══════════════════════════════════════════════════
 *  11. DUNNING DAY 3 — Helpful with direct link
 * ═══════════════════════════════════════════════════ */
function dunningDay3(data) {
  return wrapper(header('Payment Update')
    + '<div style="padding:36px 40px">'
    + '<p style="font-size:15px;color:' + GRAY + ';line-height:1.7;margin:0 0 16px;font-weight:500">Hey ' + data.name + ',</p>'
    + '<p style="font-size:15px;color:' + GRAY + ';line-height:1.7;margin:0 0 20px;font-weight:500">Following up \u2014 we tried charging your card again but it didn\u2019t go through. Your Sortora account is still fully active, but we\u2019ll need an updated payment method to keep things running.</p>'
    + '<div style="background:' + GLASS + ';border-radius:12px;padding:20px 24px;margin-bottom:24px;border:1px solid ' + BORDER + '">'
    + '<div style="font-size:13px;font-weight:700;color:' + DARK + ';margin-bottom:8px">Common fixes:</div>'
    + '<div style="font-size:13px;color:' + GRAY + ';line-height:1.7;font-weight:500">\u2022 Check if your card expired recently<br>\u2022 Verify the billing address matches your card<br>\u2022 Try a different card</div>'
    + '</div>'
    + '<a href="' + data.updateUrl + '" style="display:inline-block;padding:14px 36px;background:' + BRAND + ';color:#fff;border-radius:10px;font-size:15px;font-weight:700;text-decoration:none">Update card in 30 seconds</a>'
    + '</div>');
}

/* ═══════════════════════════════════════════════════
 *  12. DUNNING DAY 7 — Slightly urgent
 * ═══════════════════════════════════════════════════ */
function dunningDay7(data) {
  return wrapper(header('Action Required')
    + '<div style="padding:36px 40px">'
    + '<p style="font-size:15px;color:' + GRAY + ';line-height:1.7;margin:0 0 16px;font-weight:500">Hey ' + data.name + ',</p>'
    + '<p style="font-size:15px;color:' + GRAY + ';line-height:1.7;margin:0 0 20px;font-weight:500">Your Sortora account needs attention. We\u2019ve been unable to process your payment for a week now, and we\u2019ll need to pause your account soon if we can\u2019t resolve this.</p>'
    + '<div style="background:#FEF2F2;border-radius:12px;padding:20px 24px;margin-bottom:24px;border:1px solid #FECACA">'
    + '<div style="font-size:14px;font-weight:700;color:#991B1B;margin-bottom:4px">Your account will be paused in 7 days</div>'
    + '<div style="font-size:13px;color:#B91C1C;font-weight:500">Active split payments and your widget will stop working if payment isn\u2019t updated.</div>'
    + '</div>'
    + '<a href="' + data.updateUrl + '" style="display:inline-block;padding:14px 36px;background:' + BRAND + ';color:#fff;border-radius:10px;font-size:15px;font-weight:700;text-decoration:none">Update payment method now</a>'
    + '<p style="font-size:13px;color:' + MUTED + ';margin:20px 0 0;font-weight:500">Questions? Reply to this email \u2014 we\u2019re happy to help.</p>'
    + '</div>');
}

/* ═══════════════════════════════════════════════════
 *  13. DUNNING DAY 14 — Final, empathetic
 * ═══════════════════════════════════════════════════ */
function dunningDay14(data) {
  return wrapper(header('Account Pausing Tomorrow')
    + '<div style="padding:36px 40px">'
    + '<p style="font-size:15px;color:' + GRAY + ';line-height:1.7;margin:0 0 16px;font-weight:500">Hey ' + data.name + ',</p>'
    + '<p style="font-size:15px;color:' + GRAY + ';line-height:1.7;margin:0 0 20px;font-weight:500">I wanted to reach out personally. We\u2019ll need to pause your Sortora account tomorrow because we haven\u2019t been able to process your payment.</p>'
    + '<p style="font-size:15px;color:' + GRAY + ';line-height:1.7;margin:0 0 20px;font-weight:500">When paused, your widget will stop accepting new split payments and your dashboard data will be preserved but inaccessible.</p>'
    + '<p style="font-size:15px;color:' + GRAY + ';line-height:1.7;margin:0 0 24px;font-weight:500">If you\u2019d like to keep using Sortora, just update your payment method \u2014 your account will reactivate instantly:</p>'
    + '<a href="' + data.updateUrl + '" style="display:inline-block;padding:14px 36px;background:' + BRAND + ';color:#fff;border-radius:10px;font-size:15px;font-weight:700;text-decoration:none">Keep my account active</a>'
    + '<p style="font-size:13px;color:' + MUTED + ';margin:24px 0 0;font-weight:500">If Sortora isn\u2019t the right fit right now, no hard feelings. Your data will be saved for 30 days.</p>'
    + '<p style="font-size:15px;color:' + DARK + ';margin:20px 0 0;font-weight:600">Riley Buell</p>'
    + '<p style="font-size:13px;color:' + MUTED + ';margin:2px 0 0;font-weight:500">Founder, Sortora</p>'
    + '</div>');
}


/* ═══════════════════════════════════════════════════
 *  14. PRE-DUNNING — Expiring card reminder
 * ═══════════════════════════════════════════════════ */
function expiringCard(data) {
  return wrapper(header('Card Expiring Soon')
    + '<div style="padding:36px 40px">'
    + '<p style="font-size:15px;color:' + GRAY + ';line-height:1.7;margin:0 0 16px;font-weight:500">Hey ' + data.name + ',</p>'
    + '<p style="font-size:15px;color:' + GRAY + ';line-height:1.7;margin:0 0 20px;font-weight:500">Just a heads up \u2014 the card on file for your Sortora account expires ' + (data.expMonth || '') + '/' + (data.expYear || '') + '. To avoid any interruption to your split payments, update it before it expires:</p>'
    + '<div style="background:' + GLASS + ';border-radius:12px;padding:16px 20px;margin-bottom:24px;border:1px solid ' + BORDER + '">'
    + '<table cellpadding="0" cellspacing="0" border="0" width="100%"><tr>'
    + '<td style="font-size:14px;color:' + DARK + ';font-weight:600">Card ending in ' + (data.last4 || '****') + '</td>'
    + '<td style="font-size:14px;color:' + MUTED + ';font-weight:500;text-align:right">Expires ' + (data.expMonth || '??') + '/' + (data.expYear || '??') + '</td>'
    + '</tr></table></div>'
    + '<a href="' + data.updateUrl + '" style="display:inline-block;padding:14px 36px;background:' + BRAND + ';color:#fff;border-radius:10px;font-size:15px;font-weight:700;text-decoration:none">Update payment method</a>'
    + '<p style="font-size:13px;color:' + MUTED + ';margin:20px 0 0;font-weight:500">Takes 30 seconds. Your service won\u2019t be interrupted.</p>'
    + '</div>');
}

/* ═══════════════════════════════════════════════════
 *  15. BEHAVIORAL NUDGE — Stripe connected, no widget
 * ═══════════════════════════════════════════════════ */
function widgetNudge(data) {
  return wrapper(header('Almost There')
    + '<div style="padding:36px 40px">'
    + '<p style="font-size:20px;font-weight:800;color:' + DARK + ';margin:0 0 12px;letter-spacing:-.3px">You\u2019re one step away, ' + data.name + '</p>'
    + '<p style="font-size:15px;color:' + GRAY + ';line-height:1.7;margin:0 0 20px;font-weight:500">You connected Stripe \u2014 awesome! Now embed the widget on your booking page so customers can split payments at checkout.</p>'
    + '<div style="background:' + GLASS + ';border-radius:12px;padding:24px;margin-bottom:24px;border:1px solid ' + BORDER + '">'
    + '<div style="font-size:13px;font-weight:700;color:' + DARK + ';margin-bottom:12px">It\u2019s just a copy-paste:</div>'
    + '<div style="background:' + DARK + ';border-radius:8px;padding:16px 20px;font-family:SF Mono,Fira Code,Consolas,monospace;font-size:12px;color:#e2e8f0;line-height:1.6;overflow-x:auto">'
    + '&lt;div id="sortora-checkout"&gt;&lt;/div&gt;<br>'
    + '&lt;script src="https://cdn.sortora.com/widget.js"&gt;&lt;/script&gt;'
    + '</div></div>'
    + '<a href="' + data.dashUrl + '?view=embed" style="display:inline-block;padding:14px 36px;background:' + BRAND + ';color:#fff;border-radius:10px;font-size:15px;font-weight:700;text-decoration:none">Get my embed code &rarr;</a>'
    + '<p style="font-size:13px;color:' + MUTED + ';margin:20px 0 0;font-weight:500">Need help? Reply to this email and I\u2019ll walk you through it.</p>'
    + '</div>');
}

/* ═══════════════════════════════════════════════════
 *  16. PAYOUT NOTIFICATION
 * ═══════════════════════════════════════════════════ */
function payoutNotification(data) {
  var amt = parseFloat(data.amount).toFixed(2);
  return wrapper(header('Payout Sent')
    + '<div style="padding:36px 40px;text-align:center">'
    + '<div style="width:56px;height:56px;border-radius:50%;background:' + GREEN + ';margin:0 auto 20px;text-align:center;line-height:56px">'
    + '<span style="font-size:24px;color:#fff;font-family:Arial">$</span></div>'
    + '<div style="font-size:11px;font-weight:700;color:' + BRAND + ';text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">Payout initiated</div>'
    + '<div style="font-size:40px;font-weight:800;color:' + DARK + ';letter-spacing:-1.5px;line-height:1;margin-bottom:8px">;color:' + GRAY + ';margin-bottom:24px;font-weight:500">should arrive in ' + (data.arrivalDays || '2-3') + ' business days</div>'
    + '<div style="background:' + GLASS + ';border-radius:12px;padding:16px 20px;margin-bottom:24px;border:1px solid ' + BORDER + ';text-align:left">'
    + '<table cellpadding="0" cellspacing="0" border="0" width="100%">'
    + '<tr><td style="padding:6px 0;font-size:13px;color:' + MUTED + ';font-weight:500">Bookings included</td><td style="padding:6px 0;font-size:13px;color:' + DARK + ';font-weight:600;text-align:right">' + (data.bookingCount || '—') + '</td></tr>'
    + '<tr><td style="padding:6px 0;font-size:13px;color:' + MUTED + ';font-weight:500">Period</td><td style="padding:6px 0;font-size:13px;color:' + DARK + ';font-weight:600;text-align:right">' + (data.period || '—') + '</td></tr>'
    + '<tr><td style="padding:6px 0;font-size:13px;color:' + MUTED + ';font-weight:500">Destination</td><td style="padding:6px 0;font-size:13px;color:' + DARK + ';font-weight:600;text-align:right">\u2022\u2022\u2022\u2022 ' + (data.last4Bank || '****') + '</td></tr>'
    + '</table></div>'
    + '<a href="' + (data.dashUrl || 'https://sortora.com/dashboard.html') + '" style="display:inline-block;padding:12px 28px;background:' + BRAND + ';color:#fff;border-radius:10px;font-size:14px;font-weight:700;text-decoration:none">View in dashboard</a>'
    + '</div>');
}

/* ═══════════════════════════════════════════════════
 *  17. WEEKLY ACTIVITY DIGEST
 * ═══════════════════════════════════════════════════ */
function weeklyDigest(data) {
  var rev = parseFloat(data.revenue || 0).toFixed(0);
  var prevRev = parseFloat(data.prevRevenue || 0).toFixed(0);
  var pct = data.prevRevenue > 0 ? Math.round((data.revenue - data.prevRevenue) / data.prevRevenue * 100) : 0;
  var arrow = pct >= 0 ? '\u2191' : '\u2193';
  var trendColor = pct >= 0 ? GREEN : '#EF4444';

  return wrapper(header('Weekly Digest')
    + '<div style="padding:36px 40px">'
    + '<p style="font-size:20px;font-weight:800;color:' + DARK + ';margin:0 0 6px;letter-spacing:-.3px">Your week at a glance</p>'
    + '<p style="font-size:13px;color:' + MUTED + ';margin:0 0 24px;font-weight:500">' + (data.weekRange || 'This week') + '</p>'

    + '<div style="background:' + GLASS + ';border-radius:12px;overflow:hidden;margin-bottom:24px;border:1px solid ' + BORDER + '">'
    + '<table cellpadding="0" cellspacing="0" border="0" width="100%">'
    + '<tr>'
    + '<td style="padding:20px;text-align:center;width:50%;border-bottom:1px solid ' + BORDER + '"><div style="font-size:11px;color:' + MUTED + ';text-transform:uppercase;letter-spacing:.8px;margin-bottom:4px;font-weight:600">Revenue</div><div style="font-size:24px;font-weight:800;color:' + DARK + '">
  paymentLink: paymentLink,
  paymentReceipt: paymentReceipt,
  bookingConfirmed: bookingConfirmed,
  businessConfirmed: businessConfirmed,
  welcome: welcome,
  quickWin: quickWin,
  socialProof: socialProof,
  featureSpotlight: featureSpotlight,
  checkIn: checkIn,
  dunningDay0: dunningDay0,
  dunningDay3: dunningDay3,
  dunningDay7: dunningDay7,
  dunningDay14: dunningDay14
};
 + rev + '</div><div style="font-size:12px;color:' + trendColor + ';font-weight:600;margin-top:4px">' + arrow + ' ' + Math.abs(pct) + '% vs last week</div></td>'
    + '<td style="padding:20px;text-align:center;width:50%;border-bottom:1px solid ' + BORDER + ';border-left:1px solid ' + BORDER + '"><div style="font-size:11px;color:' + MUTED + ';text-transform:uppercase;letter-spacing:.8px;margin-bottom:4px;font-weight:600">Bookings</div><div style="font-size:24px;font-weight:800;color:' + DARK + '">' + (data.bookings || 0) + '</div><div style="font-size:12px;color:' + MUTED + ';font-weight:500;margin-top:4px">' + (data.confirmedBookings || 0) + ' confirmed</div></td>'
    + '</tr>'
    + '<tr>'
    + '<td style="padding:20px;text-align:center;width:50%"><div style="font-size:11px;color:' + MUTED + ';text-transform:uppercase;letter-spacing:.8px;margin-bottom:4px;font-weight:600">Completion Rate</div><div style="font-size:24px;font-weight:800;color:' + DARK + '">' + (data.completionRate || 0) + '%</div></td>'
    + '<td style="padding:20px;text-align:center;width:50%;border-left:1px solid ' + BORDER + '"><div style="font-size:11px;color:' + MUTED + ';text-transform:uppercase;letter-spacing:.8px;margin-bottom:4px;font-weight:600">Avg Group Size</div><div style="font-size:24px;font-weight:800;color:' + DARK + '">' + (data.avgGroupSize || '—') + '</div></td>'
    + '</tr></table></div>'

    + (data.topExperience ? '<div style="background:rgba(59,107,255,.04);border-radius:10px;padding:14px 20px;margin-bottom:24px;border:1px solid rgba(59,107,255,.12)"><span style="font-size:12px;color:' + BRAND + ';font-weight:700">TOP EXPERIENCE: </span><span style="font-size:13px;color:' + DARK + ';font-weight:600">' + data.topExperience + '</span></div>' : '')

    + '<a href="' + (data.dashUrl || 'https://sortora.com/dashboard.html') + '" style="display:inline-block;padding:12px 28px;background:' + BRAND + ';color:#fff;border-radius:10px;font-size:14px;font-weight:700;text-decoration:none">View full dashboard</a>'
    + '</div>');
}


/* ═══════════════════════════════════════════════════
 *  18. MILESTONE CELEBRATION
 * ═══════════════════════════════════════════════════ */
function milestone(data) {
  return wrapper(header('Milestone Reached!')
    + '<div style="padding:48px 40px;text-align:center">'
    + '<div style="font-size:48px;margin-bottom:16px">\ud83c\udf89</div>'
    + '<div style="font-size:22px;font-weight:800;color:' + DARK + ';letter-spacing:-.4px;margin-bottom:8px">' + data.title + '</div>'
    + '<div style="font-size:15px;color:' + GRAY + ';line-height:1.6;margin-bottom:24px;font-weight:500">' + data.message + '</div>'
    + '<div style="background:rgba(59,107,255,.04);border-radius:12px;padding:28px;margin-bottom:24px;display:inline-block;min-width:200px;border:1px solid rgba(59,107,255,.12)">'
    + '<div style="font-size:40px;font-weight:800;color:' + BRAND + ';letter-spacing:-1px;line-height:1">' + data.stat + '</div>'
    + '<div style="font-size:13px;color:' + MUTED + ';margin-top:8px;font-weight:500">' + data.statLabel + '</div>'
    + '</div>'
    + '<div><a href="' + (data.dashUrl || 'https://sortora.com/dashboard.html') + '" style="display:inline-block;padding:12px 28px;background:' + BRAND + ';color:#fff;border-radius:10px;font-size:14px;font-weight:700;text-decoration:none">View dashboard</a></div>'
    + '</div>');
}

/* ═══════════════════════════════════════════════════
 *  19. RE-ENGAGEMENT — Day 7 inactive
 * ═══════════════════════════════════════════════════ */
function reengageDay7(data) {
  return wrapper(header('We Miss You')
    + '<div style="padding:36px 40px">'
    + '<p style="font-size:15px;color:' + GRAY + ';line-height:1.7;margin:0 0 16px;font-weight:500">Hey ' + data.name + ',</p>'
    + '<p style="font-size:15px;color:' + GRAY + ';line-height:1.7;margin:0 0 20px;font-weight:500">It\u2019s been about a week since you\u2019ve logged in. Just wanted to make sure everything\u2019s working well with ' + data.businessName + '\u2019s split payments.</p>'
    + '<p style="font-size:15px;color:' + GRAY + ';line-height:1.7;margin:0 0 24px;font-weight:500">Here\u2019s what you might have missed:</p>'
    + '<div style="background:' + GLASS + ';border-radius:12px;padding:20px 24px;margin-bottom:24px;border:1px solid ' + BORDER + '">'
    + '<div style="font-size:14px;color:' + DARK + ';line-height:1.7;font-weight:500">\u2022 Any pending split payments from your customers<br>\u2022 Potential payouts waiting to be reviewed<br>\u2022 Dashboard insights about your booking trends</div></div>'
    + '<a href="' + (data.dashUrl || 'https://sortora.com/dashboard.html') + '" style="display:inline-block;padding:14px 36px;background:' + BRAND + ';color:#fff;border-radius:10px;font-size:15px;font-weight:700;text-decoration:none">Check my dashboard &rarr;</a>'
    + '</div>');
}

/* ═══════════════════════════════════════════════════
 *  20. RE-ENGAGEMENT — Day 14 inactive
 * ═══════════════════════════════════════════════════ */
function reengageDay14(data) {
  return wrapper(header('Quick Check-In')
    + '<div style="padding:36px 40px">'
    + '<p style="font-size:15px;color:' + GRAY + ';line-height:1.7;margin:0 0 16px;font-weight:500">Hey ' + data.name + ',</p>'
    + '<p style="font-size:15px;color:' + GRAY + ';line-height:1.7;margin:0 0 20px;font-weight:500">It\u2019s been a couple weeks. If you\u2019re having any trouble getting set up, I\u2019m here to help.</p>'
    + '<p style="font-size:15px;color:' + GRAY + ';line-height:1.7;margin:0 0 24px;font-weight:500">Some businesses find it helpful to do a quick 10-minute setup call. Want me to walk you through embedding the widget? Just reply to this email.</p>'
    + '<a href="' + (data.dashUrl || 'https://sortora.com/dashboard.html') + '" style="display:inline-block;padding:14px 36px;background:' + BRAND + ';color:#fff;border-radius:10px;font-size:15px;font-weight:700;text-decoration:none">Back to dashboard &rarr;</a>'
    + '<p style="font-size:15px;color:' + DARK + ';margin:24px 0 0;font-weight:600">Riley Buell</p>'
    + '<p style="font-size:13px;color:' + MUTED + ';margin:2px 0 0;font-weight:500">Founder, Sortora</p>'
    + '</div>');
}

/* ═══════════════════════════════════════════════════
 *  21. RE-ENGAGEMENT — Day 30 inactive
 * ═══════════════════════════════════════════════════ */
function reengageDay30(data) {
  return wrapper(
    '<div style="padding:40px 40px 36px">'
    + '<p style="font-size:15px;color:' + DARK + ';line-height:1.75;margin:0 0 16px;font-weight:500">Hey ' + data.name + ',</p>'
    + '<p style="font-size:15px;color:' + GRAY + ';line-height:1.75;margin:0 0 16px;font-weight:500">It\u2019s been a month. I wanted to check in one more time \u2014 is Sortora still a fit for ' + data.businessName + '?</p>'
    + '<p style="font-size:15px;color:' + GRAY + ';line-height:1.75;margin:0 0 16px;font-weight:500">If the timing wasn\u2019t right, no worries at all. Your account and data will be here whenever you\u2019re ready.</p>'
    + '<p style="font-size:15px;color:' + GRAY + ';line-height:1.75;margin:0 0 16px;font-weight:500">If there\u2019s something we could do better, I\u2019d genuinely love to hear it. Just reply.</p>'
    + '<p style="font-size:15px;color:' + DARK + ';margin:24px 0 0;font-weight:600">Riley Buell</p>'
    + '<p style="font-size:13px;color:' + MUTED + ';margin:2px 0 0;font-weight:500">Founder, Sortora</p>'
    + '</div>');
}

/* ═══════════════════════════════════════════════════
 *  22. FEATURE DISCOVERY
 * ═══════════════════════════════════════════════════ */
function featureDiscovery(data) {
  return wrapper(header('Tip for ' + data.businessName)
    + '<div style="padding:36px 40px">'
    + '<p style="font-size:20px;font-weight:800;color:' + DARK + ';margin:0 0 12px;letter-spacing:-.3px">Have you tried ' + data.featureName + '?</p>'
    + '<p style="font-size:15px;color:' + GRAY + ';line-height:1.7;margin:0 0 24px;font-weight:500">' + data.featureDescription + '</p>'
    + '<div style="background:' + GLASS + ';border-radius:12px;padding:24px;margin-bottom:24px;border:1px solid ' + BORDER + '">'
    + '<div style="font-size:14px;font-weight:700;color:' + DARK + ';margin-bottom:8px">How to use it:</div>'
    + '<div style="font-size:13px;color:' + GRAY + ';line-height:1.7;font-weight:500">' + data.howTo + '</div></div>'
    + '<a href="' + (data.actionUrl || data.dashUrl || 'https://sortora.com/dashboard.html') + '" style="display:inline-block;padding:14px 36px;background:' + BRAND + ';color:#fff;border-radius:10px;font-size:15px;font-weight:700;text-decoration:none">' + (data.ctaText || 'Try it now') + ' &rarr;</a>'
    + '</div>');
}

/* ═══════════════════════════════════════════════════
 *  23. MONTHLY REVENUE SUMMARY
 * ═══════════════════════════════════════════════════ */
function monthlySummary(data) {
  var rev = parseFloat(data.revenue || 0).toFixed(0);
  var prevRev = parseFloat(data.prevRevenue || 0).toFixed(0);
  var pct = data.prevRevenue > 0 ? Math.round((data.revenue - data.prevRevenue) / data.prevRevenue * 100) : 0;
  var arrow = pct >= 0 ? '\u2191' : '\u2193';
  var trendColor = pct >= 0 ? GREEN : '#EF4444';

  return wrapper(header('Monthly Summary')
    + '<div style="padding:36px 40px">'
    + '<p style="font-size:20px;font-weight:800;color:' + DARK + ';margin:0 0 6px;letter-spacing:-.3px">' + (data.monthName || 'This month') + ' Summary</p>'
    + '<p style="font-size:13px;color:' + MUTED + ';margin:0 0 24px;font-weight:500">Here\u2019s how ' + data.businessName + ' did this month.</p>'

    + '<div style="background:rgba(59,107,255,.04);border-radius:12px;padding:28px;margin-bottom:24px;text-align:center;border:1px solid rgba(59,107,255,.12)">'
    + '<div style="font-size:11px;color:' + MUTED + ';text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;font-weight:600">Total Revenue</div>'
    + '<div style="font-size:44px;font-weight:800;color:' + DARK + ';letter-spacing:-1.5px;line-height:1">
  paymentLink: paymentLink,
  paymentReceipt: paymentReceipt,
  bookingConfirmed: bookingConfirmed,
  businessConfirmed: businessConfirmed,
  welcome: welcome,
  quickWin: quickWin,
  socialProof: socialProof,
  featureSpotlight: featureSpotlight,
  checkIn: checkIn,
  dunningDay0: dunningDay0,
  dunningDay3: dunningDay3,
  dunningDay7: dunningDay7,
  dunningDay14: dunningDay14
};
 + rev + '</div>'
    + '<div style="font-size:14px;color:' + trendColor + ';font-weight:600;margin-top:8px">' + arrow + ' ' + Math.abs(pct) + '% vs last month (
  paymentLink: paymentLink,
  paymentReceipt: paymentReceipt,
  bookingConfirmed: bookingConfirmed,
  businessConfirmed: businessConfirmed,
  welcome: welcome,
  quickWin: quickWin,
  socialProof: socialProof,
  featureSpotlight: featureSpotlight,
  checkIn: checkIn,
  dunningDay0: dunningDay0,
  dunningDay3: dunningDay3,
  dunningDay7: dunningDay7,
  dunningDay14: dunningDay14
};
 + prevRev + ')</div>'
    + '</div>'

    + '<div style="background:' + GLASS + ';border-radius:12px;overflow:hidden;margin-bottom:24px;border:1px solid ' + BORDER + '">'
    + '<table cellpadding="0" cellspacing="0" border="0" width="100%"><tr>'
    + '<td style="padding:18px;text-align:center;width:33%"><div style="font-size:11px;color:' + MUTED + ';text-transform:uppercase;letter-spacing:.6px;margin-bottom:4px;font-weight:600">Bookings</div><div style="font-size:22px;font-weight:800;color:' + DARK + '">' + (data.bookings || 0) + '</div></td>'
    + '<td style="padding:18px;text-align:center;width:33%;border-left:1px solid ' + BORDER + ';border-right:1px solid ' + BORDER + '"><div style="font-size:11px;color:' + MUTED + ';text-transform:uppercase;letter-spacing:.6px;margin-bottom:4px;font-weight:600">Completion</div><div style="font-size:22px;font-weight:800;color:' + DARK + '">' + (data.completionRate || 0) + '%</div></td>'
    + '<td style="padding:18px;text-align:center;width:33%"><div style="font-size:11px;color:' + MUTED + ';text-transform:uppercase;letter-spacing:.6px;margin-bottom:4px;font-weight:600">Payouts</div><div style="font-size:22px;font-weight:800;color:' + GREEN + '">
  paymentLink: paymentLink,
  paymentReceipt: paymentReceipt,
  bookingConfirmed: bookingConfirmed,
  businessConfirmed: businessConfirmed,
  welcome: welcome,
  quickWin: quickWin,
  socialProof: socialProof,
  featureSpotlight: featureSpotlight,
  checkIn: checkIn,
  dunningDay0: dunningDay0,
  dunningDay3: dunningDay3,
  dunningDay7: dunningDay7,
  dunningDay14: dunningDay14
};
 + parseFloat(data.payouts || 0).toFixed(0) + '</div></td>'
    + '</tr></table></div>'

    + '<a href="' + (data.dashUrl || 'https://sortora.com/dashboard.html') + '" style="display:inline-block;padding:12px 28px;background:' + BRAND + ';color:#fff;border-radius:10px;font-size:14px;font-weight:700;text-decoration:none">View full analytics</a>'
    + '</div>');
}


/* \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
 *  24. PAYMENT REMINDER \u2014 nudge unpaid participants
 * \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 */
function paymentReminder(data) {
  var amt = parseFloat(data.amount).toFixed(2);
  return wrapper(header('Payment Reminder')
    + '<div style="padding:36px 40px">'
    + '<p style="font-size:15px;color:' + GRAY + ';line-height:1.7;margin:0 0 16px;font-weight:500">Hey ' + data.name + ',</p>'
    + '<p style="font-size:15px;color:' + GRAY + ';line-height:1.7;margin:0 0 20px;font-weight:500">Friendly reminder \u2014 you still have an outstanding share to pay for:</p>'
    + '<div style="background:' + GLASS + ';border-radius:12px;padding:20px 24px;margin-bottom:24px;border:1px solid ' + BORDER + '">'
    + '<div style="font-size:16px;font-weight:700;color:' + DARK + ';margin-bottom:6px">' + data.bookingTitle + '</div>'
    + '<div style="font-size:14px;color:' + GRAY + ';font-weight:500">with ' + (data.businessName || 'the organizer') + '</div>'
    + '<div style="margin-top:12px;padding-top:12px;border-top:1px solid ' + BORDER + '">'
    + '<table cellpadding="0" cellspacing="0" border="0" width="100%"><tr>'
    + '<td style="font-size:13px;color:' + MUTED + ';font-weight:500">Your share</td>'
    + '<td style="font-size:18px;font-weight:800;color:' + DARK + ';text-align:right">
  paymentLink: paymentLink,
  paymentReceipt: paymentReceipt,
  bookingConfirmed: bookingConfirmed,
  businessConfirmed: businessConfirmed,
  welcome: welcome,
  quickWin: quickWin,
  socialProof: socialProof,
  featureSpotlight: featureSpotlight,
  checkIn: checkIn,
  dunningDay0: dunningDay0,
  dunningDay3: dunningDay3,
  dunningDay7: dunningDay7,
  dunningDay14: dunningDay14
};
 + amt + '</td>'
    + '</tr></table></div>'
    + '<div style="margin-top:8px;font-size:13px;color:' + MUTED + ';font-weight:500">' + (data.paidCount || 0) + ' of ' + (data.totalCount || 0) + ' people have paid</div>'
    + '</div>'
    + '<a href="' + data.payUrl + '" style="display:inline-block;padding:14px 36px;background:' + BRAND + ';color:#fff;border-radius:10px;font-size:15px;font-weight:700;text-decoration:none">Pay your share &rarr;</a>'
    + (data.expiresIn ? '<p style="font-size:13px;color:#f59e0b;margin:16px 0 0;font-weight:600">\u23f0 This split expires in ' + data.expiresIn + '</p>' : '')
    + '</div>');
}

module.exports = {
  paymentLink: paymentLink,
  paymentReceipt: paymentReceipt,
  bookingConfirmed: bookingConfirmed,
  businessConfirmed: businessConfirmed,
  welcome: welcome,
  quickWin: quickWin,
  socialProof: socialProof,
  featureSpotlight: featureSpotlight,
  checkIn: checkIn,
  dunningDay0: dunningDay0,
  dunningDay3: dunningDay3,
  dunningDay7: dunningDay7,
  dunningDay14: dunningDay14,
  expiringCard: expiringCard,
  widgetNudge: widgetNudge,
  payoutNotification: payoutNotification,
  weeklyDigest: weeklyDigest,
  milestone: milestone,
  reengageDay7: reengageDay7,
  reengageDay14: reengageDay14,
  reengageDay30: reengageDay30,
  featureDiscovery: featureDiscovery,
  monthlySummary: monthlySummary,
  paymentReminder: paymentReminder
};
 + amt + '</div>'
    + '<div style="font-size:14px;color:' + GRAY + ';margin-bottom:24px;font-weight:500">should arrive in ' + (data.arrivalDays || '2-3') + ' business days</div>'
    + '<div style="background:' + GLASS + ';border-radius:12px;padding:16px 20px;margin-bottom:24px;border:1px solid ' + BORDER + ';text-align:left">'
    + '<table cellpadding="0" cellspacing="0" border="0" width="100%">'
    + '<tr><td style="padding:6px 0;font-size:13px;color:' + MUTED + ';font-weight:500">Bookings included</td><td style="padding:6px 0;font-size:13px;color:' + DARK + ';font-weight:600;text-align:right">' + (data.bookingCount || '—') + '</td></tr>'
    + '<tr><td style="padding:6px 0;font-size:13px;color:' + MUTED + ';font-weight:500">Period</td><td style="padding:6px 0;font-size:13px;color:' + DARK + ';font-weight:600;text-align:right">' + (data.period || '—') + '</td></tr>'
    + '<tr><td style="padding:6px 0;font-size:13px;color:' + MUTED + ';font-weight:500">Destination</td><td style="padding:6px 0;font-size:13px;color:' + DARK + ';font-weight:600;text-align:right">\u2022\u2022\u2022\u2022 ' + (data.last4Bank || '****') + '</td></tr>'
    + '</table></div>'
    + '<a href="' + (data.dashUrl || 'https://sortora.com/dashboard.html') + '" style="display:inline-block;padding:12px 28px;background:' + BRAND + ';color:#fff;border-radius:10px;font-size:14px;font-weight:700;text-decoration:none">View in dashboard</a>'
    + '</div>');
}

/* ═══════════════════════════════════════════════════
 *  17. WEEKLY ACTIVITY DIGEST
 * ═══════════════════════════════════════════════════ */
function weeklyDigest(data) {
  var rev = parseFloat(data.revenue || 0).toFixed(0);
  var prevRev = parseFloat(data.prevRevenue || 0).toFixed(0);
  var pct = data.prevRevenue > 0 ? Math.round((data.revenue - data.prevRevenue) / data.prevRevenue * 100) : 0;
  var arrow = pct >= 0 ? '\u2191' : '\u2193';
  var trendColor = pct >= 0 ? GREEN : '#EF4444';

  return wrapper(header('Weekly Digest')
    + '<div style="padding:36px 40px">'
    + '<p style="font-size:20px;font-weight:800;color:' + DARK + ';margin:0 0 6px;letter-spacing:-.3px">Your week at a glance</p>'
    + '<p style="font-size:13px;color:' + MUTED + ';margin:0 0 24px;font-weight:500">' + (data.weekRange || 'This week') + '</p>'

    + '<div style="background:' + GLASS + ';border-radius:12px;overflow:hidden;margin-bottom:24px;border:1px solid ' + BORDER + '">'
    + '<table cellpadding="0" cellspacing="0" border="0" width="100%">'
    + '<tr>'
    + '<td style="padding:20px;text-align:center;width:50%;border-bottom:1px solid ' + BORDER + '"><div style="font-size:11px;color:' + MUTED + ';text-transform:uppercase;letter-spacing:.8px;margin-bottom:4px;font-weight:600">Revenue</div><div style="font-size:24px;font-weight:800;color:' + DARK + '">
  paymentLink: paymentLink,
  paymentReceipt: paymentReceipt,
  bookingConfirmed: bookingConfirmed,
  businessConfirmed: businessConfirmed,
  welcome: welcome,
  quickWin: quickWin,
  socialProof: socialProof,
  featureSpotlight: featureSpotlight,
  checkIn: checkIn,
  dunningDay0: dunningDay0,
  dunningDay3: dunningDay3,
  dunningDay7: dunningDay7,
  dunningDay14: dunningDay14
};
 + rev + '</div><div style="font-size:12px;color:' + trendColor + ';font-weight:600;margin-top:4px">' + arrow + ' ' + Math.abs(pct) + '% vs last week</div></td>'
    + '<td style="padding:20px;text-align:center;width:50%;border-bottom:1px solid ' + BORDER + ';border-left:1px solid ' + BORDER + '"><div style="font-size:11px;color:' + MUTED + ';text-transform:uppercase;letter-spacing:.8px;margin-bottom:4px;font-weight:600">Bookings</div><div style="font-size:24px;font-weight:800;color:' + DARK + '">' + (data.bookings || 0) + '</div><div style="font-size:12px;color:' + MUTED + ';font-weight:500;margin-top:4px">' + (data.confirmedBookings || 0) + ' confirmed</div></td>'
    + '</tr>'
    + '<tr>'
    + '<td style="padding:20px;text-align:center;width:50%"><div style="font-size:11px;color:' + MUTED + ';text-transform:uppercase;letter-spacing:.8px;margin-bottom:4px;font-weight:600">Completion Rate</div><div style="font-size:24px;font-weight:800;color:' + DARK + '">' + (data.completionRate || 0) + '%</div></td>'
    + '<td style="padding:20px;text-align:center;width:50%;border-left:1px solid ' + BORDER + '"><div style="font-size:11px;color:' + MUTED + ';text-transform:uppercase;letter-spacing:.8px;margin-bottom:4px;font-weight:600">Avg Group Size</div><div style="font-size:24px;font-weight:800;color:' + DARK + '">' + (data.avgGroupSize || '—') + '</div></td>'
    + '</tr></table></div>'

    + (data.topExperience ? '<div style="background:rgba(59,107,255,.04);border-radius:10px;padding:14px 20px;margin-bottom:24px;border:1px solid rgba(59,107,255,.12)"><span style="font-size:12px;color:' + BRAND + ';font-weight:700">TOP EXPERIENCE: </span><span style="font-size:13px;color:' + DARK + ';font-weight:600">' + data.topExperience + '</span></div>' : '')

    + '<a href="' + (data.dashUrl || 'https://sortora.com/dashboard.html') + '" style="display:inline-block;padding:12px 28px;background:' + BRAND + ';color:#fff;border-radius:10px;font-size:14px;font-weight:700;text-decoration:none">View full dashboard</a>'
    + '</div>');
}


/* ═══════════════════════════════════════════════════
 *  18. MILESTONE CELEBRATION
 * ═══════════════════════════════════════════════════ */
function milestone(data) {
  return wrapper(header('Milestone Reached!')
    + '<div style="padding:48px 40px;text-align:center">'
    + '<div style="font-size:48px;margin-bottom:16px">\ud83c\udf89</div>'
    + '<div style="font-size:22px;font-weight:800;color:' + DARK + ';letter-spacing:-.4px;margin-bottom:8px">' + data.title + '</div>'
    + '<div style="font-size:15px;color:' + GRAY + ';line-height:1.6;margin-bottom:24px;font-weight:500">' + data.message + '</div>'
    + '<div style="background:rgba(59,107,255,.04);border-radius:12px;padding:28px;margin-bottom:24px;display:inline-block;min-width:200px;border:1px solid rgba(59,107,255,.12)">'
    + '<div style="font-size:40px;font-weight:800;color:' + BRAND + ';letter-spacing:-1px;line-height:1">' + data.stat + '</div>'
    + '<div style="font-size:13px;color:' + MUTED + ';margin-top:8px;font-weight:500">' + data.statLabel + '</div>'
    + '</div>'
    + '<div><a href="' + (data.dashUrl || 'https://sortora.com/dashboard.html') + '" style="display:inline-block;padding:12px 28px;background:' + BRAND + ';color:#fff;border-radius:10px;font-size:14px;font-weight:700;text-decoration:none">View dashboard</a></div>'
    + '</div>');
}

/* ═══════════════════════════════════════════════════
 *  19. RE-ENGAGEMENT — Day 7 inactive
 * ═══════════════════════════════════════════════════ */
function reengageDay7(data) {
  return wrapper(header('We Miss You')
    + '<div style="padding:36px 40px">'
    + '<p style="font-size:15px;color:' + GRAY + ';line-height:1.7;margin:0 0 16px;font-weight:500">Hey ' + data.name + ',</p>'
    + '<p style="font-size:15px;color:' + GRAY + ';line-height:1.7;margin:0 0 20px;font-weight:500">It\u2019s been about a week since you\u2019ve logged in. Just wanted to make sure everything\u2019s working well with ' + data.businessName + '\u2019s split payments.</p>'
    + '<p style="font-size:15px;color:' + GRAY + ';line-height:1.7;margin:0 0 24px;font-weight:500">Here\u2019s what you might have missed:</p>'
    + '<div style="background:' + GLASS + ';border-radius:12px;padding:20px 24px;margin-bottom:24px;border:1px solid ' + BORDER + '">'
    + '<div style="font-size:14px;color:' + DARK + ';line-height:1.7;font-weight:500">\u2022 Any pending split payments from your customers<br>\u2022 Potential payouts waiting to be reviewed<br>\u2022 Dashboard insights about your booking trends</div></div>'
    + '<a href="' + (data.dashUrl || 'https://sortora.com/dashboard.html') + '" style="display:inline-block;padding:14px 36px;background:' + BRAND + ';color:#fff;border-radius:10px;font-size:15px;font-weight:700;text-decoration:none">Check my dashboard &rarr;</a>'
    + '</div>');
}

/* ═══════════════════════════════════════════════════
 *  20. RE-ENGAGEMENT — Day 14 inactive
 * ═══════════════════════════════════════════════════ */
function reengageDay14(data) {
  return wrapper(header('Quick Check-In')
    + '<div style="padding:36px 40px">'
    + '<p style="font-size:15px;color:' + GRAY + ';line-height:1.7;margin:0 0 16px;font-weight:500">Hey ' + data.name + ',</p>'
    + '<p style="font-size:15px;color:' + GRAY + ';line-height:1.7;margin:0 0 20px;font-weight:500">It\u2019s been a couple weeks. If you\u2019re having any trouble getting set up, I\u2019m here to help.</p>'
    + '<p style="font-size:15px;color:' + GRAY + ';line-height:1.7;margin:0 0 24px;font-weight:500">Some businesses find it helpful to do a quick 10-minute setup call. Want me to walk you through embedding the widget? Just reply to this email.</p>'
    + '<a href="' + (data.dashUrl || 'https://sortora.com/dashboard.html') + '" style="display:inline-block;padding:14px 36px;background:' + BRAND + ';color:#fff;border-radius:10px;font-size:15px;font-weight:700;text-decoration:none">Back to dashboard &rarr;</a>'
    + '<p style="font-size:15px;color:' + DARK + ';margin:24px 0 0;font-weight:600">Riley Buell</p>'
    + '<p style="font-size:13px;color:' + MUTED + ';margin:2px 0 0;font-weight:500">Founder, Sortora</p>'
    + '</div>');
}

/* ═══════════════════════════════════════════════════
 *  21. RE-ENGAGEMENT — Day 30 inactive
 * ═══════════════════════════════════════════════════ */
function reengageDay30(data) {
  return wrapper(
    '<div style="padding:40px 40px 36px">'
    + '<p style="font-size:15px;color:' + DARK + ';line-height:1.75;margin:0 0 16px;font-weight:500">Hey ' + data.name + ',</p>'
    + '<p style="font-size:15px;color:' + GRAY + ';line-height:1.75;margin:0 0 16px;font-weight:500">It\u2019s been a month. I wanted to check in one more time \u2014 is Sortora still a fit for ' + data.businessName + '?</p>'
    + '<p style="font-size:15px;color:' + GRAY + ';line-height:1.75;margin:0 0 16px;font-weight:500">If the timing wasn\u2019t right, no worries at all. Your account and data will be here whenever you\u2019re ready.</p>'
    + '<p style="font-size:15px;color:' + GRAY + ';line-height:1.75;margin:0 0 16px;font-weight:500">If there\u2019s something we could do better, I\u2019d genuinely love to hear it. Just reply.</p>'
    + '<p style="font-size:15px;color:' + DARK + ';margin:24px 0 0;font-weight:600">Riley Buell</p>'
    + '<p style="font-size:13px;color:' + MUTED + ';margin:2px 0 0;font-weight:500">Founder, Sortora</p>'
    + '</div>');
}

/* ═══════════════════════════════════════════════════
 *  22. FEATURE DISCOVERY
 * ═══════════════════════════════════════════════════ */
function featureDiscovery(data) {
  return wrapper(header('Tip for ' + data.businessName)
    + '<div style="padding:36px 40px">'
    + '<p style="font-size:20px;font-weight:800;color:' + DARK + ';margin:0 0 12px;letter-spacing:-.3px">Have you tried ' + data.featureName + '?</p>'
    + '<p style="font-size:15px;color:' + GRAY + ';line-height:1.7;margin:0 0 24px;font-weight:500">' + data.featureDescription + '</p>'
    + '<div style="background:' + GLASS + ';border-radius:12px;padding:24px;margin-bottom:24px;border:1px solid ' + BORDER + '">'
    + '<div style="font-size:14px;font-weight:700;color:' + DARK + ';margin-bottom:8px">How to use it:</div>'
    + '<div style="font-size:13px;color:' + GRAY + ';line-height:1.7;font-weight:500">' + data.howTo + '</div></div>'
    + '<a href="' + (data.actionUrl || data.dashUrl || 'https://sortora.com/dashboard.html') + '" style="display:inline-block;padding:14px 36px;background:' + BRAND + ';color:#fff;border-radius:10px;font-size:15px;font-weight:700;text-decoration:none">' + (data.ctaText || 'Try it now') + ' &rarr;</a>'
    + '</div>');
}

/* ═══════════════════════════════════════════════════
 *  23. MONTHLY REVENUE SUMMARY
 * ═══════════════════════════════════════════════════ */
function monthlySummary(data) {
  var rev = parseFloat(data.revenue || 0).toFixed(0);
  var prevRev = parseFloat(data.prevRevenue || 0).toFixed(0);
  var pct = data.prevRevenue > 0 ? Math.round((data.revenue - data.prevRevenue) / data.prevRevenue * 100) : 0;
  var arrow = pct >= 0 ? '\u2191' : '\u2193';
  var trendColor = pct >= 0 ? GREEN : '#EF4444';

  return wrapper(header('Monthly Summary')
    + '<div style="padding:36px 40px">'
    + '<p style="font-size:20px;font-weight:800;color:' + DARK + ';margin:0 0 6px;letter-spacing:-.3px">' + (data.monthName || 'This month') + ' Summary</p>'
    + '<p style="font-size:13px;color:' + MUTED + ';margin:0 0 24px;font-weight:500">Here\u2019s how ' + data.businessName + ' did this month.</p>'

    + '<div style="background:rgba(59,107,255,.04);border-radius:12px;padding:28px;margin-bottom:24px;text-align:center;border:1px solid rgba(59,107,255,.12)">'
    + '<div style="font-size:11px;color:' + MUTED + ';text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;font-weight:600">Total Revenue</div>'
    + '<div style="font-size:44px;font-weight:800;color:' + DARK + ';letter-spacing:-1.5px;line-height:1">
  paymentLink: paymentLink,
  paymentReceipt: paymentReceipt,
  bookingConfirmed: bookingConfirmed,
  businessConfirmed: businessConfirmed,
  welcome: welcome,
  quickWin: quickWin,
  socialProof: socialProof,
  featureSpotlight: featureSpotlight,
  checkIn: checkIn,
  dunningDay0: dunningDay0,
  dunningDay3: dunningDay3,
  dunningDay7: dunningDay7,
  dunningDay14: dunningDay14
};
 + rev + '</div>'
    + '<div style="font-size:14px;color:' + trendColor + ';font-weight:600;margin-top:8px">' + arrow + ' ' + Math.abs(pct) + '% vs last month (
  paymentLink: paymentLink,
  paymentReceipt: paymentReceipt,
  bookingConfirmed: bookingConfirmed,
  businessConfirmed: businessConfirmed,
  welcome: welcome,
  quickWin: quickWin,
  socialProof: socialProof,
  featureSpotlight: featureSpotlight,
  checkIn: checkIn,
  dunningDay0: dunningDay0,
  dunningDay3: dunningDay3,
  dunningDay7: dunningDay7,
  dunningDay14: dunningDay14
};
 + prevRev + ')</div>'
    + '</div>'

    + '<div style="background:' + GLASS + ';border-radius:12px;overflow:hidden;margin-bottom:24px;border:1px solid ' + BORDER + '">'
    + '<table cellpadding="0" cellspacing="0" border="0" width="100%"><tr>'
    + '<td style="padding:18px;text-align:center;width:33%"><div style="font-size:11px;color:' + MUTED + ';text-transform:uppercase;letter-spacing:.6px;margin-bottom:4px;font-weight:600">Bookings</div><div style="font-size:22px;font-weight:800;color:' + DARK + '">' + (data.bookings || 0) + '</div></td>'
    + '<td style="padding:18px;text-align:center;width:33%;border-left:1px solid ' + BORDER + ';border-right:1px solid ' + BORDER + '"><div style="font-size:11px;color:' + MUTED + ';text-transform:uppercase;letter-spacing:.6px;margin-bottom:4px;font-weight:600">Completion</div><div style="font-size:22px;font-weight:800;color:' + DARK + '">' + (data.completionRate || 0) + '%</div></td>'
    + '<td style="padding:18px;text-align:center;width:33%"><div style="font-size:11px;color:' + MUTED + ';text-transform:uppercase;letter-spacing:.6px;margin-bottom:4px;font-weight:600">Payouts</div><div style="font-size:22px;font-weight:800;color:' + GREEN + '">
  paymentLink: paymentLink,
  paymentReceipt: paymentReceipt,
  bookingConfirmed: bookingConfirmed,
  businessConfirmed: businessConfirmed,
  welcome: welcome,
  quickWin: quickWin,
  socialProof: socialProof,
  featureSpotlight: featureSpotlight,
  checkIn: checkIn,
  dunningDay0: dunningDay0,
  dunningDay3: dunningDay3,
  dunningDay7: dunningDay7,
  dunningDay14: dunningDay14
};
 + parseFloat(data.payouts || 0).toFixed(0) + '</div></td>'
    + '</tr></table></div>'

    + '<a href="' + (data.dashUrl || 'https://sortora.com/dashboard.html') + '" style="display:inline-block;padding:12px 28px;background:' + BRAND + ';color:#fff;border-radius:10px;font-size:14px;font-weight:700;text-decoration:none">View full analytics</a>'
    + '</div>');
}


/* \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
 *  24. PAYMENT REMINDER \u2014 nudge unpaid participants
 * \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 */
function paymentReminder(data) {
  var amt = parseFloat(data.amount).toFixed(2);
  return wrapper(header('Payment Reminder')
    + '<div style="padding:36px 40px">'
    + '<p style="font-size:15px;color:' + GRAY + ';line-height:1.7;margin:0 0 16px;font-weight:500">Hey ' + data.name + ',</p>'
    + '<p style="font-size:15px;color:' + GRAY + ';line-height:1.7;margin:0 0 20px;font-weight:500">Friendly reminder \u2014 you still have an outstanding share to pay for:</p>'
    + '<div style="background:' + GLASS + ';border-radius:12px;padding:20px 24px;margin-bottom:24px;border:1px solid ' + BORDER + '">'
    + '<div style="font-size:16px;font-weight:700;color:' + DARK + ';margin-bottom:6px">' + data.bookingTitle + '</div>'
    + '<div style="font-size:14px;color:' + GRAY + ';font-weight:500">with ' + (data.businessName || 'the organizer') + '</div>'
    + '<div style="margin-top:12px;padding-top:12px;border-top:1px solid ' + BORDER + '">'
    + '<table cellpadding="0" cellspacing="0" border="0" width="100%"><tr>'
    + '<td style="font-size:13px;color:' + MUTED + ';font-weight:500">Your share</td>'
    + '<td style="font-size:18px;font-weight:800;color:' + DARK + ';text-align:right">
  paymentLink: paymentLink,
  paymentReceipt: paymentReceipt,
  bookingConfirmed: bookingConfirmed,
  businessConfirmed: businessConfirmed,
  welcome: welcome,
  quickWin: quickWin,
  socialProof: socialProof,
  featureSpotlight: featureSpotlight,
  checkIn: checkIn,
  dunningDay0: dunningDay0,
  dunningDay3: dunningDay3,
  dunningDay7: dunningDay7,
  dunningDay14: dunningDay14
};
 + amt + '</td>'
    + '</tr></table></div>'
    + '<div style="margin-top:8px;font-size:13px;color:' + MUTED + ';font-weight:500">' + (data.paidCount || 0) + ' of ' + (data.totalCount || 0) + ' people have paid</div>'
    + '</div>'
    + '<a href="' + data.payUrl + '" style="display:inline-block;padding:14px 36px;background:' + BRAND + ';color:#fff;border-radius:10px;font-size:15px;font-weight:700;text-decoration:none">Pay your share &rarr;</a>'
    + (data.expiresIn ? '<p style="font-size:13px;color:#f59e0b;margin:16px 0 0;font-weight:600">\u23f0 This split expires in ' + data.expiresIn + '</p>' : '')
    + '</div>');
}

module.exports = {
  paymentLink: paymentLink,
  paymentReceipt: paymentReceipt,
  bookingConfirmed: bookingConfirmed,
  businessConfirmed: businessConfirmed,
  welcome: welcome,
  quickWin: quickWin,
  socialProof: socialProof,
  featureSpotlight: featureSpotlight,
  checkIn: checkIn,
  dunningDay0: dunningDay0,
  dunningDay3: dunningDay3,
  dunningDay7: dunningDay7,
  dunningDay14: dunningDay14,
  expiringCard: expiringCard,
  widgetNudge: widgetNudge,
  payoutNotification: payoutNotification,
  weeklyDigest: weeklyDigest,
  milestone: milestone,
  reengageDay7: reengageDay7,
  reengageDay14: reengageDay14,
  reengageDay30: reengageDay30,
  featureDiscovery: featureDiscovery,
  monthlySummary: monthlySummary,
  paymentReminder: paymentReminder
};
 + amt + '</div>'
    + '<div style="font-size:14px;color:' + GRAY + ';margin-bottom:24px;font-weight:500">should arrive in ' + (data.arrivalDays || '2-3') + ' business days</div>'
    + '<div style="background:' + GLASS + ';border-radius:12px;padding:16px 20px;margin-bottom:24px;border:1px solid ' + BORDER + ';text-align:left">'
    + '<table cellpadding="0" cellspacing="0" border="0" width="100%">'
    + '<tr><td style="padding:6px 0;font-size:13px;color:' + MUTED + ';font-weight:500">Bookings included</td><td style="padding:6px 0;font-size:13px;color:' + DARK + ';font-weight:600;text-align:right">' + (data.bookingCount || '—') + '</td></tr>'
    + '<tr><td style="padding:6px 0;font-size:13px;color:' + MUTED + ';font-weight:500">Period</td><td style="padding:6px 0;font-size:13px;color:' + DARK + ';font-weight:600;text-align:right">' + (data.period || '—') + '</td></tr>'
    + '<tr><td style="padding:6px 0;font-size:13px;color:' + MUTED + ';font-weight:500">Destination</td><td style="padding:6px 0;font-size:13px;color:' + DARK + ';font-weight:600;text-align:right">\u2022\u2022\u2022\u2022 ' + (data.last4Bank || '****') + '</td></tr>'
    + '</table></div>'
    + '<a href="' + (data.dashUrl || 'https://sortora.com/dashboard.html') + '" style="display:inline-block;padding:12px 28px;background:' + BRAND + ';color:#fff;border-radius:10px;font-size:14px;font-weight:700;text-decoration:none">View in dashboard</a>'
    + '</div>');
}

/* ═══════════════════════════════════════════════════
 *  17. WEEKLY ACTIVITY DIGEST
 * ═══════════════════════════════════════════════════ */
function weeklyDigest(data) {
  var rev = parseFloat(data.revenue || 0).toFixed(0);
  var prevRev = parseFloat(data.prevRevenue || 0).toFixed(0);
  var pct = data.prevRevenue > 0 ? Math.round((data.revenue - data.prevRevenue) / data.prevRevenue * 100) : 0;
  var arrow = pct >= 0 ? '\u2191' : '\u2193';
  var trendColor = pct >= 0 ? GREEN : '#EF4444';

  return wrapper(header('Weekly Digest')
    + '<div style="padding:36px 40px">'
    + '<p style="font-size:20px;font-weight:800;color:' + DARK + ';margin:0 0 6px;letter-spacing:-.3px">Your week at a glance</p>'
    + '<p style="font-size:13px;color:' + MUTED + ';margin:0 0 24px;font-weight:500">' + (data.weekRange || 'This week') + '</p>'

    + '<div style="background:' + GLASS + ';border-radius:12px;overflow:hidden;margin-bottom:24px;border:1px solid ' + BORDER + '">'
    + '<table cellpadding="0" cellspacing="0" border="0" width="100%">'
    + '<tr>'
    + '<td style="padding:20px;text-align:center;width:50%;border-bottom:1px solid ' + BORDER + '"><div style="font-size:11px;color:' + MUTED + ';text-transform:uppercase;letter-spacing:.8px;margin-bottom:4px;font-weight:600">Revenue</div><div style="font-size:24px;font-weight:800;color:' + DARK + '">
  paymentLink: paymentLink,
  paymentReceipt: paymentReceipt,
  bookingConfirmed: bookingConfirmed,
  businessConfirmed: businessConfirmed,
  welcome: welcome,
  quickWin: quickWin,
  socialProof: socialProof,
  featureSpotlight: featureSpotlight,
  checkIn: checkIn,
  dunningDay0: dunningDay0,
  dunningDay3: dunningDay3,
  dunningDay7: dunningDay7,
  dunningDay14: dunningDay14
};
 + rev + '</div><div style="font-size:12px;color:' + trendColor + ';font-weight:600;margin-top:4px">' + arrow + ' ' + Math.abs(pct) + '% vs last week</div></td>'
    + '<td style="padding:20px;text-align:center;width:50%;border-bottom:1px solid ' + BORDER + ';border-left:1px solid ' + BORDER + '"><div style="font-size:11px;color:' + MUTED + ';text-transform:uppercase;letter-spacing:.8px;margin-bottom:4px;font-weight:600">Bookings</div><div style="font-size:24px;font-weight:800;color:' + DARK + '">' + (data.bookings || 0) + '</div><div style="font-size:12px;color:' + MUTED + ';font-weight:500;margin-top:4px">' + (data.confirmedBookings || 0) + ' confirmed</div></td>'
    + '</tr>'
    + '<tr>'
    + '<td style="padding:20px;text-align:center;width:50%"><div style="font-size:11px;color:' + MUTED + ';text-transform:uppercase;letter-spacing:.8px;margin-bottom:4px;font-weight:600">Completion Rate</div><div style="font-size:24px;font-weight:800;color:' + DARK + '">' + (data.completionRate || 0) + '%</div></td>'
    + '<td style="padding:20px;text-align:center;width:50%;border-left:1px solid ' + BORDER + '"><div style="font-size:11px;color:' + MUTED + ';text-transform:uppercase;letter-spacing:.8px;margin-bottom:4px;font-weight:600">Avg Group Size</div><div style="font-size:24px;font-weight:800;color:' + DARK + '">' + (data.avgGroupSize || '—') + '</div></td>'
    + '</tr></table></div>'

    + (data.topExperience ? '<div style="background:rgba(59,107,255,.04);border-radius:10px;padding:14px 20px;margin-bottom:24px;border:1px solid rgba(59,107,255,.12)"><span style="font-size:12px;color:' + BRAND + ';font-weight:700">TOP EXPERIENCE: </span><span style="font-size:13px;color:' + DARK + ';font-weight:600">' + data.topExperience + '</span></div>' : '')

    + '<a href="' + (data.dashUrl || 'https://sortora.com/dashboard.html') + '" style="display:inline-block;padding:12px 28px;background:' + BRAND + ';color:#fff;border-radius:10px;font-size:14px;font-weight:700;text-decoration:none">View full dashboard</a>'
    + '</div>');
}


/* ═══════════════════════════════════════════════════
 *  18. MILESTONE CELEBRATION
 * ═══════════════════════════════════════════════════ */
function milestone(data) {
  return wrapper(header('Milestone Reached!')
    + '<div style="padding:48px 40px;text-align:center">'
    + '<div style="font-size:48px;margin-bottom:16px">\ud83c\udf89</div>'
    + '<div style="font-size:22px;font-weight:800;color:' + DARK + ';letter-spacing:-.4px;margin-bottom:8px">' + data.title + '</div>'
    + '<div style="font-size:15px;color:' + GRAY + ';line-height:1.6;margin-bottom:24px;font-weight:500">' + data.message + '</div>'
    + '<div style="background:rgba(59,107,255,.04);border-radius:12px;padding:28px;margin-bottom:24px;display:inline-block;min-width:200px;border:1px solid rgba(59,107,255,.12)">'
    + '<div style="font-size:40px;font-weight:800;color:' + BRAND + ';letter-spacing:-1px;line-height:1">' + data.stat + '</div>'
    + '<div style="font-size:13px;color:' + MUTED + ';margin-top:8px;font-weight:500">' + data.statLabel + '</div>'
    + '</div>'
    + '<div><a href="' + (data.dashUrl || 'https://sortora.com/dashboard.html') + '" style="display:inline-block;padding:12px 28px;background:' + BRAND + ';color:#fff;border-radius:10px;font-size:14px;font-weight:700;text-decoration:none">View dashboard</a></div>'
    + '</div>');
}

/* ═══════════════════════════════════════════════════
 *  19. RE-ENGAGEMENT — Day 7 inactive
 * ═══════════════════════════════════════════════════ */
function reengageDay7(data) {
  return wrapper(header('We Miss You')
    + '<div style="padding:36px 40px">'
    + '<p style="font-size:15px;color:' + GRAY + ';line-height:1.7;margin:0 0 16px;font-weight:500">Hey ' + data.name + ',</p>'
    + '<p style="font-size:15px;color:' + GRAY + ';line-height:1.7;margin:0 0 20px;font-weight:500">It\u2019s been about a week since you\u2019ve logged in. Just wanted to make sure everything\u2019s working well with ' + data.businessName + '\u2019s split payments.</p>'
    + '<p style="font-size:15px;color:' + GRAY + ';line-height:1.7;margin:0 0 24px;font-weight:500">Here\u2019s what you might have missed:</p>'
    + '<div style="background:' + GLASS + ';border-radius:12px;padding:20px 24px;margin-bottom:24px;border:1px solid ' + BORDER + '">'
    + '<div style="font-size:14px;color:' + DARK + ';line-height:1.7;font-weight:500">\u2022 Any pending split payments from your customers<br>\u2022 Potential payouts waiting to be reviewed<br>\u2022 Dashboard insights about your booking trends</div></div>'
    + '<a href="' + (data.dashUrl || 'https://sortora.com/dashboard.html') + '" style="display:inline-block;padding:14px 36px;background:' + BRAND + ';color:#fff;border-radius:10px;font-size:15px;font-weight:700;text-decoration:none">Check my dashboard &rarr;</a>'
    + '</div>');
}

/* ═══════════════════════════════════════════════════
 *  20. RE-ENGAGEMENT — Day 14 inactive
 * ═══════════════════════════════════════════════════ */
function reengageDay14(data) {
  return wrapper(header('Quick Check-In')
    + '<div style="padding:36px 40px">'
    + '<p style="font-size:15px;color:' + GRAY + ';line-height:1.7;margin:0 0 16px;font-weight:500">Hey ' + data.name + ',</p>'
    + '<p style="font-size:15px;color:' + GRAY + ';line-height:1.7;margin:0 0 20px;font-weight:500">It\u2019s been a couple weeks. If you\u2019re having any trouble getting set up, I\u2019m here to help.</p>'
    + '<p style="font-size:15px;color:' + GRAY + ';line-height:1.7;margin:0 0 24px;font-weight:500">Some businesses find it helpful to do a quick 10-minute setup call. Want me to walk you through embedding the widget? Just reply to this email.</p>'
    + '<a href="' + (data.dashUrl || 'https://sortora.com/dashboard.html') + '" style="display:inline-block;padding:14px 36px;background:' + BRAND + ';color:#fff;border-radius:10px;font-size:15px;font-weight:700;text-decoration:none">Back to dashboard &rarr;</a>'
    + '<p style="font-size:15px;color:' + DARK + ';margin:24px 0 0;font-weight:600">Riley Buell</p>'
    + '<p style="font-size:13px;color:' + MUTED + ';margin:2px 0 0;font-weight:500">Founder, Sortora</p>'
    + '</div>');
}

/* ═══════════════════════════════════════════════════
 *  21. RE-ENGAGEMENT — Day 30 inactive
 * ═══════════════════════════════════════════════════ */
function reengageDay30(data) {
  return wrapper(
    '<div style="padding:40px 40px 36px">'
    + '<p style="font-size:15px;color:' + DARK + ';line-height:1.75;margin:0 0 16px;font-weight:500">Hey ' + data.name + ',</p>'
    + '<p style="font-size:15px;color:' + GRAY + ';line-height:1.75;margin:0 0 16px;font-weight:500">It\u2019s been a month. I wanted to check in one more time \u2014 is Sortora still a fit for ' + data.businessName + '?</p>'
    + '<p style="font-size:15px;color:' + GRAY + ';line-height:1.75;margin:0 0 16px;font-weight:500">If the timing wasn\u2019t right, no worries at all. Your account and data will be here whenever you\u2019re ready.</p>'
    + '<p style="font-size:15px;color:' + GRAY + ';line-height:1.75;margin:0 0 16px;font-weight:500">If there\u2019s something we could do better, I\u2019d genuinely love to hear it. Just reply.</p>'
    + '<p style="font-size:15px;color:' + DARK + ';margin:24px 0 0;font-weight:600">Riley Buell</p>'
    + '<p style="font-size:13px;color:' + MUTED + ';margin:2px 0 0;font-weight:500">Founder, Sortora</p>'
    + '</div>');
}

/* ═══════════════════════════════════════════════════
 *  22. FEATURE DISCOVERY
 * ═══════════════════════════════════════════════════ */
function featureDiscovery(data) {
  return wrapper(header('Tip for ' + data.businessName)
    + '<div style="padding:36px 40px">'
    + '<p style="font-size:20px;font-weight:800;color:' + DARK + ';margin:0 0 12px;letter-spacing:-.3px">Have you tried ' + data.featureName + '?</p>'
    + '<p style="font-size:15px;color:' + GRAY + ';line-height:1.7;margin:0 0 24px;font-weight:500">' + data.featureDescription + '</p>'
    + '<div style="background:' + GLASS + ';border-radius:12px;padding:24px;margin-bottom:24px;border:1px solid ' + BORDER + '">'
    + '<div style="font-size:14px;font-weight:700;color:' + DARK + ';margin-bottom:8px">How to use it:</div>'
    + '<div style="font-size:13px;color:' + GRAY + ';line-height:1.7;font-weight:500">' + data.howTo + '</div></div>'
    + '<a href="' + (data.actionUrl || data.dashUrl || 'https://sortora.com/dashboard.html') + '" style="display:inline-block;padding:14px 36px;background:' + BRAND + ';color:#fff;border-radius:10px;font-size:15px;font-weight:700;text-decoration:none">' + (data.ctaText || 'Try it now') + ' &rarr;</a>'
    + '</div>');
}

/* ═══════════════════════════════════════════════════
 *  23. MONTHLY REVENUE SUMMARY
 * ═══════════════════════════════════════════════════ */
function monthlySummary(data) {
  var rev = parseFloat(data.revenue || 0).toFixed(0);
  var prevRev = parseFloat(data.prevRevenue || 0).toFixed(0);
  var pct = data.prevRevenue > 0 ? Math.round((data.revenue - data.prevRevenue) / data.prevRevenue * 100) : 0;
  var arrow = pct >= 0 ? '\u2191' : '\u2193';
  var trendColor = pct >= 0 ? GREEN : '#EF4444';

  return wrapper(header('Monthly Summary')
    + '<div style="padding:36px 40px">'
    + '<p style="font-size:20px;font-weight:800;color:' + DARK + ';margin:0 0 6px;letter-spacing:-.3px">' + (data.monthName || 'This month') + ' Summary</p>'
    + '<p style="font-size:13px;color:' + MUTED + ';margin:0 0 24px;font-weight:500">Here\u2019s how ' + data.businessName + ' did this month.</p>'

    + '<div style="background:rgba(59,107,255,.04);border-radius:12px;padding:28px;margin-bottom:24px;text-align:center;border:1px solid rgba(59,107,255,.12)">'
    + '<div style="font-size:11px;color:' + MUTED + ';text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;font-weight:600">Total Revenue</div>'
    + '<div style="font-size:44px;font-weight:800;color:' + DARK + ';letter-spacing:-1.5px;line-height:1">
  paymentLink: paymentLink,
  paymentReceipt: paymentReceipt,
  bookingConfirmed: bookingConfirmed,
  businessConfirmed: businessConfirmed,
  welcome: welcome,
  quickWin: quickWin,
  socialProof: socialProof,
  featureSpotlight: featureSpotlight,
  checkIn: checkIn,
  dunningDay0: dunningDay0,
  dunningDay3: dunningDay3,
  dunningDay7: dunningDay7,
  dunningDay14: dunningDay14
};
 + rev + '</div>'
    + '<div style="font-size:14px;color:' + trendColor + ';font-weight:600;margin-top:8px">' + arrow + ' ' + Math.abs(pct) + '% vs last month (
  paymentLink: paymentLink,
  paymentReceipt: paymentReceipt,
  bookingConfirmed: bookingConfirmed,
  businessConfirmed: businessConfirmed,
  welcome: welcome,
  quickWin: quickWin,
  socialProof: socialProof,
  featureSpotlight: featureSpotlight,
  checkIn: checkIn,
  dunningDay0: dunningDay0,
  dunningDay3: dunningDay3,
  dunningDay7: dunningDay7,
  dunningDay14: dunningDay14
};
 + prevRev + ')</div>'
    + '</div>'

    + '<div style="background:' + GLASS + ';border-radius:12px;overflow:hidden;margin-bottom:24px;border:1px solid ' + BORDER + '">'
    + '<table cellpadding="0" cellspacing="0" border="0" width="100%"><tr>'
    + '<td style="padding:18px;text-align:center;width:33%"><div style="font-size:11px;color:' + MUTED + ';text-transform:uppercase;letter-spacing:.6px;margin-bottom:4px;font-weight:600">Bookings</div><div style="font-size:22px;font-weight:800;color:' + DARK + '">' + (data.bookings || 0) + '</div></td>'
    + '<td style="padding:18px;text-align:center;width:33%;border-left:1px solid ' + BORDER + ';border-right:1px solid ' + BORDER + '"><div style="font-size:11px;color:' + MUTED + ';text-transform:uppercase;letter-spacing:.6px;margin-bottom:4px;font-weight:600">Completion</div><div style="font-size:22px;font-weight:800;color:' + DARK + '">' + (data.completionRate || 0) + '%</div></td>'
    + '<td style="padding:18px;text-align:center;width:33%"><div style="font-size:11px;color:' + MUTED + ';text-transform:uppercase;letter-spacing:.6px;margin-bottom:4px;font-weight:600">Payouts</div><div style="font-size:22px;font-weight:800;color:' + GREEN + '">
  paymentLink: paymentLink,
  paymentReceipt: paymentReceipt,
  bookingConfirmed: bookingConfirmed,
  businessConfirmed: businessConfirmed,
  welcome: welcome,
  quickWin: quickWin,
  socialProof: socialProof,
  featureSpotlight: featureSpotlight,
  checkIn: checkIn,
  dunningDay0: dunningDay0,
  dunningDay3: dunningDay3,
  dunningDay7: dunningDay7,
  dunningDay14: dunningDay14
};
 + parseFloat(data.payouts || 0).toFixed(0) + '</div></td>'
    + '</tr></table></div>'

    + '<a href="' + (data.dashUrl || 'https://sortora.com/dashboard.html') + '" style="display:inline-block;padding:12px 28px;background:' + BRAND + ';color:#fff;border-radius:10px;font-size:14px;font-weight:700;text-decoration:none">View full analytics</a>'
    + '</div>');
}


/* \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
 *  24. PAYMENT REMINDER \u2014 nudge unpaid participants
 * \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 */
function paymentReminder(data) {
  var amt = parseFloat(data.amount).toFixed(2);
  return wrapper(header('Payment Reminder')
    + '<div style="padding:36px 40px">'
    + '<p style="font-size:15px;color:' + GRAY + ';line-height:1.7;margin:0 0 16px;font-weight:500">Hey ' + data.name + ',</p>'
    + '<p style="font-size:15px;color:' + GRAY + ';line-height:1.7;margin:0 0 20px;font-weight:500">Friendly reminder \u2014 you still have an outstanding share to pay for:</p>'
    + '<div style="background:' + GLASS + ';border-radius:12px;padding:20px 24px;margin-bottom:24px;border:1px solid ' + BORDER + '">'
    + '<div style="font-size:16px;font-weight:700;color:' + DARK + ';margin-bottom:6px">' + data.bookingTitle + '</div>'
    + '<div style="font-size:14px;color:' + GRAY + ';font-weight:500">with ' + (data.businessName || 'the organizer') + '</div>'
    + '<div style="margin-top:12px;padding-top:12px;border-top:1px solid ' + BORDER + '">'
    + '<table cellpadding="0" cellspacing="0" border="0" width="100%"><tr>'
    + '<td style="font-size:13px;color:' + MUTED + ';font-weight:500">Your share</td>'
    + '<td style="font-size:18px;font-weight:800;color:' + DARK + ';text-align:right">
  paymentLink: paymentLink,
  paymentReceipt: paymentReceipt,
  bookingConfirmed: bookingConfirmed,
  businessConfirmed: businessConfirmed,
  welcome: welcome,
  quickWin: quickWin,
  socialProof: socialProof,
  featureSpotlight: featureSpotlight,
  checkIn: checkIn,
  dunningDay0: dunningDay0,
  dunningDay3: dunningDay3,
  dunningDay7: dunningDay7,
  dunningDay14: dunningDay14
};
 + amt + '</td>'
    + '</tr></table></div>'
    + '<div style="margin-top:8px;font-size:13px;color:' + MUTED + ';font-weight:500">' + (data.paidCount || 0) + ' of ' + (data.totalCount || 0) + ' people have paid</div>'
    + '</div>'
    + '<a href="' + data.payUrl + '" style="display:inline-block;padding:14px 36px;background:' + BRAND + ';color:#fff;border-radius:10px;font-size:15px;font-weight:700;text-decoration:none">Pay your share &rarr;</a>'
    + (data.expiresIn ? '<p style="font-size:13px;color:#f59e0b;margin:16px 0 0;font-weight:600">\u23f0 This split expires in ' + data.expiresIn + '</p>' : '')
    + '</div>');
}

module.exports = {
  paymentLink: paymentLink,
  paymentReceipt: paymentReceipt,
  bookingConfirmed: bookingConfirmed,
  businessConfirmed: businessConfirmed,
  welcome: welcome,
  quickWin: quickWin,
  socialProof: socialProof,
  featureSpotlight: featureSpotlight,
  checkIn: checkIn,
  dunningDay0: dunningDay0,
  dunningDay3: dunningDay3,
  dunningDay7: dunningDay7,
  dunningDay14: dunningDay14,
  expiringCard: expiringCard,
  widgetNudge: widgetNudge,
  payoutNotification: payoutNotification,
  weeklyDigest: weeklyDigest,
  milestone: milestone,
  reengageDay7: reengageDay7,
  reengageDay14: reengageDay14,
  reengageDay30: reengageDay30,
  featureDiscovery: featureDiscovery,
  monthlySummary: monthlySummary,
  paymentReminder: paymentReminder
};
 + amt + '</div>'
    + '<div style="font-size:14px;color:' + GRAY + ';margin-bottom:24px;font-weight:500">should arrive in ' + (data.arrivalDays || '2-3') + ' business days</div>'
    + '<div style="background:' + GLASS + ';border-radius:12px;padding:16px 20px;margin-bottom:24px;border:1px solid ' + BORDER + ';text-align:left">'
    + '<table cellpadding="0" cellspacing="0" border="0" width="100%">'
    + '<tr><td style="padding:6px 0;font-size:13px;color:' + MUTED + ';font-weight:500">Bookings included</td><td style="padding:6px 0;font-size:13px;color:' + DARK + ';font-weight:600;text-align:right">' + (data.bookingCount || '—') + '</td></tr>'
    + '<tr><td style="padding:6px 0;font-size:13px;color:' + MUTED + ';font-weight:500">Period</td><td style="padding:6px 0;font-size:13px;color:' + DARK + ';font-weight:600;text-align:right">' + (data.period || '—') + '</td></tr>'
    + '<tr><td style="padding:6px 0;font-size:13px;color:' + MUTED + ';font-weight:500">Destination</td><td style="padding:6px 0;font-size:13px;color:' + DARK + ';font-weight:600;text-align:right">\u2022\u2022\u2022\u2022 ' + (data.last4Bank || '****') + '</td></tr>'
    + '</table></div>'
    + '<a href="' + (data.dashUrl || 'https://sortora.com/dashboard.html') + '" style="display:inline-block;padding:12px 28px;background:' + BRAND + ';color:#fff;border-radius:10px;font-size:14px;font-weight:700;text-decoration:none">View in dashboard</a>'
    + '</div>');
}

/* ═══════════════════════════════════════════════════
 *  17. WEEKLY ACTIVITY DIGEST
 * ═══════════════════════════════════════════════════ */
function weeklyDigest(data) {
  var rev = parseFloat(data.revenue || 0).toFixed(0);
  var prevRev = parseFloat(data.prevRevenue || 0).toFixed(0);
  var pct = data.prevRevenue > 0 ? Math.round((data.revenue - data.prevRevenue) / data.prevRevenue * 100) : 0;
  var arrow = pct >= 0 ? '\u2191' : '\u2193';
  var trendColor = pct >= 0 ? GREEN : '#EF4444';

  return wrapper(header('Weekly Digest')
    + '<div style="padding:36px 40px">'
    + '<p style="font-size:20px;font-weight:800;color:' + DARK + ';margin:0 0 6px;letter-spacing:-.3px">Your week at a glance</p>'
    + '<p style="font-size:13px;color:' + MUTED + ';margin:0 0 24px;font-weight:500">' + (data.weekRange || 'This week') + '</p>'

    + '<div style="background:' + GLASS + ';border-radius:12px;overflow:hidden;margin-bottom:24px;border:1px solid ' + BORDER + '">'
    + '<table cellpadding="0" cellspacing="0" border="0" width="100%">'
    + '<tr>'
    + '<td style="padding:20px;text-align:center;width:50%;border-bottom:1px solid ' + BORDER + '"><div style="font-size:11px;color:' + MUTED + ';text-transform:uppercase;letter-spacing:.8px;margin-bottom:4px;font-weight:600">Revenue</div><div style="font-size:24px;font-weight:800;color:' + DARK + '">
  paymentLink: paymentLink,
  paymentReceipt: paymentReceipt,
  bookingConfirmed: bookingConfirmed,
  businessConfirmed: businessConfirmed,
  welcome: welcome,
  quickWin: quickWin,
  socialProof: socialProof,
  featureSpotlight: featureSpotlight,
  checkIn: checkIn,
  dunningDay0: dunningDay0,
  dunningDay3: dunningDay3,
  dunningDay7: dunningDay7,
  dunningDay14: dunningDay14
};
 + rev + '</div><div style="font-size:12px;color:' + trendColor + ';font-weight:600;margin-top:4px">' + arrow + ' ' + Math.abs(pct) + '% vs last week</div></td>'
    + '<td style="padding:20px;text-align:center;width:50%;border-bottom:1px solid ' + BORDER + ';border-left:1px solid ' + BORDER + '"><div style="font-size:11px;color:' + MUTED + ';text-transform:uppercase;letter-spacing:.8px;margin-bottom:4px;font-weight:600">Bookings</div><div style="font-size:24px;font-weight:800;color:' + DARK + '">' + (data.bookings || 0) + '</div><div style="font-size:12px;color:' + MUTED + ';font-weight:500;margin-top:4px">' + (data.confirmedBookings || 0) + ' confirmed</div></td>'
    + '</tr>'
    + '<tr>'
    + '<td style="padding:20px;text-align:center;width:50%"><div style="font-size:11px;color:' + MUTED + ';text-transform:uppercase;letter-spacing:.8px;margin-bottom:4px;font-weight:600">Completion Rate</div><div style="font-size:24px;font-weight:800;color:' + DARK + '">' + (data.completionRate || 0) + '%</div></td>'
    + '<td style="padding:20px;text-align:center;width:50%;border-left:1px solid ' + BORDER + '"><div style="font-size:11px;color:' + MUTED + ';text-transform:uppercase;letter-spacing:.8px;margin-bottom:4px;font-weight:600">Avg Group Size</div><div style="font-size:24px;font-weight:800;color:' + DARK + '">' + (data.avgGroupSize || '—') + '</div></td>'
    + '</tr></table></div>'

    + (data.topExperience ? '<div style="background:rgba(59,107,255,.04);border-radius:10px;padding:14px 20px;margin-bottom:24px;border:1px solid rgba(59,107,255,.12)"><span style="font-size:12px;color:' + BRAND + ';font-weight:700">TOP EXPERIENCE: </span><span style="font-size:13px;color:' + DARK + ';font-weight:600">' + data.topExperience + '</span></div>' : '')

    + '<a href="' + (data.dashUrl || 'https://sortora.com/dashboard.html') + '" style="display:inline-block;padding:12px 28px;background:' + BRAND + ';color:#fff;border-radius:10px;font-size:14px;font-weight:700;text-decoration:none">View full dashboard</a>'
    + '</div>');
}


/* ═══════════════════════════════════════════════════
 *  18. MILESTONE CELEBRATION
 * ═══════════════════════════════════════════════════ */
function milestone(data) {
  return wrapper(header('Milestone Reached!')
    + '<div style="padding:48px 40px;text-align:center">'
    + '<div style="font-size:48px;margin-bottom:16px">\ud83c\udf89</div>'
    + '<div style="font-size:22px;font-weight:800;color:' + DARK + ';letter-spacing:-.4px;margin-bottom:8px">' + data.title + '</div>'
    + '<div style="font-size:15px;color:' + GRAY + ';line-height:1.6;margin-bottom:24px;font-weight:500">' + data.message + '</div>'
    + '<div style="background:rgba(59,107,255,.04);border-radius:12px;padding:28px;margin-bottom:24px;display:inline-block;min-width:200px;border:1px solid rgba(59,107,255,.12)">'
    + '<div style="font-size:40px;font-weight:800;color:' + BRAND + ';letter-spacing:-1px;line-height:1">' + data.stat + '</div>'
    + '<div style="font-size:13px;color:' + MUTED + ';margin-top:8px;font-weight:500">' + data.statLabel + '</div>'
    + '</div>'
    + '<div><a href="' + (data.dashUrl || 'https://sortora.com/dashboard.html') + '" style="display:inline-block;padding:12px 28px;background:' + BRAND + ';color:#fff;border-radius:10px;font-size:14px;font-weight:700;text-decoration:none">View dashboard</a></div>'
    + '</div>');
}

/* ═══════════════════════════════════════════════════
 *  19. RE-ENGAGEMENT — Day 7 inactive
 * ═══════════════════════════════════════════════════ */
function reengageDay7(data) {
  return wrapper(header('We Miss You')
    + '<div style="padding:36px 40px">'
    + '<p style="font-size:15px;color:' + GRAY + ';line-height:1.7;margin:0 0 16px;font-weight:500">Hey ' + data.name + ',</p>'
    + '<p style="font-size:15px;color:' + GRAY + ';line-height:1.7;margin:0 0 20px;font-weight:500">It\u2019s been about a week since you\u2019ve logged in. Just wanted to make sure everything\u2019s working well with ' + data.businessName + '\u2019s split payments.</p>'
    + '<p style="font-size:15px;color:' + GRAY + ';line-height:1.7;margin:0 0 24px;font-weight:500">Here\u2019s what you might have missed:</p>'
    + '<div style="background:' + GLASS + ';border-radius:12px;padding:20px 24px;margin-bottom:24px;border:1px solid ' + BORDER + '">'
    + '<div style="font-size:14px;color:' + DARK + ';line-height:1.7;font-weight:500">\u2022 Any pending split payments from your customers<br>\u2022 Potential payouts waiting to be reviewed<br>\u2022 Dashboard insights about your booking trends</div></div>'
    + '<a href="' + (data.dashUrl || 'https://sortora.com/dashboard.html') + '" style="display:inline-block;padding:14px 36px;background:' + BRAND + ';color:#fff;border-radius:10px;font-size:15px;font-weight:700;text-decoration:none">Check my dashboard &rarr;</a>'
    + '</div>');
}

/* ═══════════════════════════════════════════════════
 *  20. RE-ENGAGEMENT — Day 14 inactive
 * ═══════════════════════════════════════════════════ */
function reengageDay14(data) {
  return wrapper(header('Quick Check-In')
    + '<div style="padding:36px 40px">'
    + '<p style="font-size:15px;color:' + GRAY + ';line-height:1.7;margin:0 0 16px;font-weight:500">Hey ' + data.name + ',</p>'
    + '<p style="font-size:15px;color:' + GRAY + ';line-height:1.7;margin:0 0 20px;font-weight:500">It\u2019s been a couple weeks. If you\u2019re having any trouble getting set up, I\u2019m here to help.</p>'
    + '<p style="font-size:15px;color:' + GRAY + ';line-height:1.7;margin:0 0 24px;font-weight:500">Some businesses find it helpful to do a quick 10-minute setup call. Want me to walk you through embedding the widget? Just reply to this email.</p>'
    + '<a href="' + (data.dashUrl || 'https://sortora.com/dashboard.html') + '" style="display:inline-block;padding:14px 36px;background:' + BRAND + ';color:#fff;border-radius:10px;font-size:15px;font-weight:700;text-decoration:none">Back to dashboard &rarr;</a>'
    + '<p style="font-size:15px;color:' + DARK + ';margin:24px 0 0;font-weight:600">Riley Buell</p>'
    + '<p style="font-size:13px;color:' + MUTED + ';margin:2px 0 0;font-weight:500">Founder, Sortora</p>'
    + '</div>');
}

/* ═══════════════════════════════════════════════════
 *  21. RE-ENGAGEMENT — Day 30 inactive
 * ═══════════════════════════════════════════════════ */
function reengageDay30(data) {
  return wrapper(
    '<div style="padding:40px 40px 36px">'
    + '<p style="font-size:15px;color:' + DARK + ';line-height:1.75;margin:0 0 16px;font-weight:500">Hey ' + data.name + ',</p>'
    + '<p style="font-size:15px;color:' + GRAY + ';line-height:1.75;margin:0 0 16px;font-weight:500">It\u2019s been a month. I wanted to check in one more time \u2014 is Sortora still a fit for ' + data.businessName + '?</p>'
    + '<p style="font-size:15px;color:' + GRAY + ';line-height:1.75;margin:0 0 16px;font-weight:500">If the timing wasn\u2019t right, no worries at all. Your account and data will be here whenever you\u2019re ready.</p>'
    + '<p style="font-size:15px;color:' + GRAY + ';line-height:1.75;margin:0 0 16px;font-weight:500">If there\u2019s something we could do better, I\u2019d genuinely love to hear it. Just reply.</p>'
    + '<p style="font-size:15px;color:' + DARK + ';margin:24px 0 0;font-weight:600">Riley Buell</p>'
    + '<p style="font-size:13px;color:' + MUTED + ';margin:2px 0 0;font-weight:500">Founder, Sortora</p>'
    + '</div>');
}

/* ═══════════════════════════════════════════════════
 *  22. FEATURE DISCOVERY
 * ═══════════════════════════════════════════════════ */
function featureDiscovery(data) {
  return wrapper(header('Tip for ' + data.businessName)
    + '<div style="padding:36px 40px">'
    + '<p style="font-size:20px;font-weight:800;color:' + DARK + ';margin:0 0 12px;letter-spacing:-.3px">Have you tried ' + data.featureName + '?</p>'
    + '<p style="font-size:15px;color:' + GRAY + ';line-height:1.7;margin:0 0 24px;font-weight:500">' + data.featureDescription + '</p>'
    + '<div style="background:' + GLASS + ';border-radius:12px;padding:24px;margin-bottom:24px;border:1px solid ' + BORDER + '">'
    + '<div style="font-size:14px;font-weight:700;color:' + DARK + ';margin-bottom:8px">How to use it:</div>'
    + '<div style="font-size:13px;color:' + GRAY + ';line-height:1.7;font-weight:500">' + data.howTo + '</div></div>'
    + '<a href="' + (data.actionUrl || data.dashUrl || 'https://sortora.com/dashboard.html') + '" style="display:inline-block;padding:14px 36px;background:' + BRAND + ';color:#fff;border-radius:10px;font-size:15px;font-weight:700;text-decoration:none">' + (data.ctaText || 'Try it now') + ' &rarr;</a>'
    + '</div>');
}

/* ═══════════════════════════════════════════════════
 *  23. MONTHLY REVENUE SUMMARY
 * ═══════════════════════════════════════════════════ */
function monthlySummary(data) {
  var rev = parseFloat(data.revenue || 0).toFixed(0);
  var prevRev = parseFloat(data.prevRevenue || 0).toFixed(0);
  var pct = data.prevRevenue > 0 ? Math.round((data.revenue - data.prevRevenue) / data.prevRevenue * 100) : 0;
  var arrow = pct >= 0 ? '\u2191' : '\u2193';
  var trendColor = pct >= 0 ? GREEN : '#EF4444';

  return wrapper(header('Monthly Summary')
    + '<div style="padding:36px 40px">'
    + '<p style="font-size:20px;font-weight:800;color:' + DARK + ';margin:0 0 6px;letter-spacing:-.3px">' + (data.monthName || 'This month') + ' Summary</p>'
    + '<p style="font-size:13px;color:' + MUTED + ';margin:0 0 24px;font-weight:500">Here\u2019s how ' + data.businessName + ' did this month.</p>'

    + '<div style="background:rgba(59,107,255,.04);border-radius:12px;padding:28px;margin-bottom:24px;text-align:center;border:1px solid rgba(59,107,255,.12)">'
    + '<div style="font-size:11px;color:' + MUTED + ';text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;font-weight:600">Total Revenue</div>'
    + '<div style="font-size:44px;font-weight:800;color:' + DARK + ';letter-spacing:-1.5px;line-height:1">
  paymentLink: paymentLink,
  paymentReceipt: paymentReceipt,
  bookingConfirmed: bookingConfirmed,
  businessConfirmed: businessConfirmed,
  welcome: welcome,
  quickWin: quickWin,
  socialProof: socialProof,
  featureSpotlight: featureSpotlight,
  checkIn: checkIn,
  dunningDay0: dunningDay0,
  dunningDay3: dunningDay3,
  dunningDay7: dunningDay7,
  dunningDay14: dunningDay14
};
 + rev + '</div>'
    + '<div style="font-size:14px;color:' + trendColor + ';font-weight:600;margin-top:8px">' + arrow + ' ' + Math.abs(pct) + '% vs last month (
  paymentLink: paymentLink,
  paymentReceipt: paymentReceipt,
  bookingConfirmed: bookingConfirmed,
  businessConfirmed: businessConfirmed,
  welcome: welcome,
  quickWin: quickWin,
  socialProof: socialProof,
  featureSpotlight: featureSpotlight,
  checkIn: checkIn,
  dunningDay0: dunningDay0,
  dunningDay3: dunningDay3,
  dunningDay7: dunningDay7,
  dunningDay14: dunningDay14
};
 + prevRev + ')</div>'
    + '</div>'

    + '<div style="background:' + GLASS + ';border-radius:12px;overflow:hidden;margin-bottom:24px;border:1px solid ' + BORDER + '">'
    + '<table cellpadding="0" cellspacing="0" border="0" width="100%"><tr>'
    + '<td style="padding:18px;text-align:center;width:33%"><div style="font-size:11px;color:' + MUTED + ';text-transform:uppercase;letter-spacing:.6px;margin-bottom:4px;font-weight:600">Bookings</div><div style="font-size:22px;font-weight:800;color:' + DARK + '">' + (data.bookings || 0) + '</div></td>'
    + '<td style="padding:18px;text-align:center;width:33%;border-left:1px solid ' + BORDER + ';border-right:1px solid ' + BORDER + '"><div style="font-size:11px;color:' + MUTED + ';text-transform:uppercase;letter-spacing:.6px;margin-bottom:4px;font-weight:600">Completion</div><div style="font-size:22px;font-weight:800;color:' + DARK + '">' + (data.completionRate || 0) + '%</div></td>'
    + '<td style="padding:18px;text-align:center;width:33%"><div style="font-size:11px;color:' + MUTED + ';text-transform:uppercase;letter-spacing:.6px;margin-bottom:4px;font-weight:600">Payouts</div><div style="font-size:22px;font-weight:800;color:' + GREEN + '">
  paymentLink: paymentLink,
  paymentReceipt: paymentReceipt,
  bookingConfirmed: bookingConfirmed,
  businessConfirmed: businessConfirmed,
  welcome: welcome,
  quickWin: quickWin,
  socialProof: socialProof,
  featureSpotlight: featureSpotlight,
  checkIn: checkIn,
  dunningDay0: dunningDay0,
  dunningDay3: dunningDay3,
  dunningDay7: dunningDay7,
  dunningDay14: dunningDay14
};
 + parseFloat(data.payouts || 0).toFixed(0) + '</div></td>'
    + '</tr></table></div>'

    + '<a href="' + (data.dashUrl || 'https://sortora.com/dashboard.html') + '" style="display:inline-block;padding:12px 28px;background:' + BRAND + ';color:#fff;border-radius:10px;font-size:14px;font-weight:700;text-decoration:none">View full analytics</a>'
    + '</div>');
}


/* \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
 *  24. PAYMENT REMINDER \u2014 nudge unpaid participants
 * \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 */
function paymentReminder(data) {
  var amt = parseFloat(data.amount).toFixed(2);
  return wrapper(header('Payment Reminder')
    + '<div style="padding:36px 40px">'
    + '<p style="font-size:15px;color:' + GRAY + ';line-height:1.7;margin:0 0 16px;font-weight:500">Hey ' + data.name + ',</p>'
    + '<p style="font-size:15px;color:' + GRAY + ';line-height:1.7;margin:0 0 20px;font-weight:500">Friendly reminder \u2014 you still have an outstanding share to pay for:</p>'
    + '<div style="background:' + GLASS + ';border-radius:12px;padding:20px 24px;margin-bottom:24px;border:1px solid ' + BORDER + '">'
    + '<div style="font-size:16px;font-weight:700;color:' + DARK + ';margin-bottom:6px">' + data.bookingTitle + '</div>'
    + '<div style="font-size:14px;color:' + GRAY + ';font-weight:500">with ' + (data.businessName || 'the organizer') + '</div>'
    + '<div style="margin-top:12px;padding-top:12px;border-top:1px solid ' + BORDER + '">'
    + '<table cellpadding="0" cellspacing="0" border="0" width="100%"><tr>'
    + '<td style="font-size:13px;color:' + MUTED + ';font-weight:500">Your share</td>'
    + '<td style="font-size:18px;font-weight:800;color:' + DARK + ';text-align:right">
  paymentLink: paymentLink,
  paymentReceipt: paymentReceipt,
  bookingConfirmed: bookingConfirmed,
  businessConfirmed: businessConfirmed,
  welcome: welcome,
  quickWin: quickWin,
  socialProof: socialProof,
  featureSpotlight: featureSpotlight,
  checkIn: checkIn,
  dunningDay0: dunningDay0,
  dunningDay3: dunningDay3,
  dunningDay7: dunningDay7,
  dunningDay14: dunningDay14
};
 + amt + '</td>'
    + '</tr></table></div>'
    + '<div style="margin-top:8px;font-size:13px;color:' + MUTED + ';font-weight:500">' + (data.paidCount || 0) + ' of ' + (data.totalCount || 0) + ' people have paid</div>'
    + '</div>'
    + '<a href="' + data.payUrl + '" style="display:inline-block;padding:14px 36px;background:' + BRAND + ';color:#fff;border-radius:10px;font-size:15px;font-weight:700;text-decoration:none">Pay your share &rarr;</a>'
    + (data.expiresIn ? '<p style="font-size:13px;color:#f59e0b;margin:16px 0 0;font-weight:600">\u23f0 This split expires in ' + data.expiresIn + '</p>' : '')
    + '</div>');
}

module.exports = {
  paymentLink: paymentLink,
  paymentReceipt: paymentReceipt,
  bookingConfirmed: bookingConfirmed,
  businessConfirmed: businessConfirmed,
  welcome: welcome,
  quickWin: quickWin,
  socialProof: socialProof,
  featureSpotlight: featureSpotlight,
  checkIn: checkIn,
  dunningDay0: dunningDay0,
  dunningDay3: dunningDay3,
  dunningDay7: dunningDay7,
  dunningDay14: dunningDay14
};
 + amt + '</div>'
    + '<div style="font-size:14px;color:' + GRAY + ';margin-bottom:24px;font-weight:500">should arrive in ' + (data.arrivalDays || '2-3') + ' business days</div>'
    + '<div style="background:' + GLASS + ';border-radius:12px;padding:16px 20px;margin-bottom:24px;border:1px solid ' + BORDER + ';text-align:left">'
    + '<table cellpadding="0" cellspacing="0" border="0" width="100%">'
    + '<tr><td style="padding:6px 0;font-size:13px;color:' + MUTED + ';font-weight:500">Bookings included</td><td style="padding:6px 0;font-size:13px;color:' + DARK + ';font-weight:600;text-align:right">' + (data.bookingCount || '—') + '</td></tr>'
    + '<tr><td style="padding:6px 0;font-size:13px;color:' + MUTED + ';font-weight:500">Period</td><td style="padding:6px 0;font-size:13px;color:' + DARK + ';font-weight:600;text-align:right">' + (data.period || '—') + '</td></tr>'
    + '<tr><td style="padding:6px 0;font-size:13px;color:' + MUTED + ';font-weight:500">Destination</td><td style="padding:6px 0;font-size:13px;color:' + DARK + ';font-weight:600;text-align:right">\u2022\u2022\u2022\u2022 ' + (data.last4Bank || '****') + '</td></tr>'
    + '</table></div>'
    + '<a href="' + (data.dashUrl || 'https://sortora.com/dashboard.html') + '" style="display:inline-block;padding:12px 28px;background:' + BRAND + ';color:#fff;border-radius:10px;font-size:14px;font-weight:700;text-decoration:none">View in dashboard</a>'
    + '</div>');
}

/* ═══════════════════════════════════════════════════
 *  17. WEEKLY ACTIVITY DIGEST
 * ═══════════════════════════════════════════════════ */
function weeklyDigest(data) {
  var rev = parseFloat(data.revenue || 0).toFixed(0);
  var prevRev = parseFloat(data.prevRevenue || 0).toFixed(0);
  var pct = data.prevRevenue > 0 ? Math.round((data.revenue - data.prevRevenue) / data.prevRevenue * 100) : 0;
  var arrow = pct >= 0 ? '\u2191' : '\u2193';
  var trendColor = pct >= 0 ? GREEN : '#EF4444';

  return wrapper(header('Weekly Digest')
    + '<div style="padding:36px 40px">'
    + '<p style="font-size:20px;font-weight:800;color:' + DARK + ';margin:0 0 6px;letter-spacing:-.3px">Your week at a glance</p>'
    + '<p style="font-size:13px;color:' + MUTED + ';margin:0 0 24px;font-weight:500">' + (data.weekRange || 'This week') + '</p>'

    + '<div style="background:' + GLASS + ';border-radius:12px;overflow:hidden;margin-bottom:24px;border:1px solid ' + BORDER + '">'
    + '<table cellpadding="0" cellspacing="0" border="0" width="100%">'
    + '<tr>'
    + '<td style="padding:20px;text-align:center;width:50%;border-bottom:1px solid ' + BORDER + '"><div style="font-size:11px;color:' + MUTED + ';text-transform:uppercase;letter-spacing:.8px;margin-bottom:4px;font-weight:600">Revenue</div><div style="font-size:24px;font-weight:800;color:' + DARK + '">
  paymentLink: paymentLink,
  paymentReceipt: paymentReceipt,
  bookingConfirmed: bookingConfirmed,
  businessConfirmed: businessConfirmed,
  welcome: welcome,
  quickWin: quickWin,
  socialProof: socialProof,
  featureSpotlight: featureSpotlight,
  checkIn: checkIn,
  dunningDay0: dunningDay0,
  dunningDay3: dunningDay3,
  dunningDay7: dunningDay7,
  dunningDay14: dunningDay14
};
 + rev + '</div><div style="font-size:12px;color:' + trendColor + ';font-weight:600;margin-top:4px">' + arrow + ' ' + Math.abs(pct) + '% vs last week</div></td>'
    + '<td style="padding:20px;text-align:center;width:50%;border-bottom:1px solid ' + BORDER + ';border-left:1px solid ' + BORDER + '"><div style="font-size:11px;color:' + MUTED + ';text-transform:uppercase;letter-spacing:.8px;margin-bottom:4px;font-weight:600">Bookings</div><div style="font-size:24px;font-weight:800;color:' + DARK + '">' + (data.bookings || 0) + '</div><div style="font-size:12px;color:' + MUTED + ';font-weight:500;margin-top:4px">' + (data.confirmedBookings || 0) + ' confirmed</div></td>'
    + '</tr>'
    + '<tr>'
    + '<td style="padding:20px;text-align:center;width:50%"><div style="font-size:11px;color:' + MUTED + ';text-transform:uppercase;letter-spacing:.8px;margin-bottom:4px;font-weight:600">Completion Rate</div><div style="font-size:24px;font-weight:800;color:' + DARK + '">' + (data.completionRate || 0) + '%</div></td>'
    + '<td style="padding:20px;text-align:center;width:50%;border-left:1px solid ' + BORDER + '"><div style="font-size:11px;color:' + MUTED + ';text-transform:uppercase;letter-spacing:.8px;margin-bottom:4px;font-weight:600">Avg Group Size</div><div style="font-size:24px;font-weight:800;color:' + DARK + '">' + (data.avgGroupSize || '—') + '</div></td>'
    + '</tr></table></div>'

    + (data.topExperience ? '<div style="background:rgba(59,107,255,.04);border-radius:10px;padding:14px 20px;margin-bottom:24px;border:1px solid rgba(59,107,255,.12)"><span style="font-size:12px;color:' + BRAND + ';font-weight:700">TOP EXPERIENCE: </span><span style="font-size:13px;color:' + DARK + ';font-weight:600">' + data.topExperience + '</span></div>' : '')

    + '<a href="' + (data.dashUrl || 'https://sortora.com/dashboard.html') + '" style="display:inline-block;padding:12px 28px;background:' + BRAND + ';color:#fff;border-radius:10px;font-size:14px;font-weight:700;text-decoration:none">View full dashboard</a>'
    + '</div>');
}


/* ═══════════════════════════════════════════════════
 *  18. MILESTONE CELEBRATION
 * ═══════════════════════════════════════════════════ */
function milestone(data) {
  return wrapper(header('Milestone Reached!')
    + '<div style="padding:48px 40px;text-align:center">'
    + '<div style="font-size:48px;margin-bottom:16px">\ud83c\udf89</div>'
    + '<div style="font-size:22px;font-weight:800;color:' + DARK + ';letter-spacing:-.4px;margin-bottom:8px">' + data.title + '</div>'
    + '<div style="font-size:15px;color:' + GRAY + ';line-height:1.6;margin-bottom:24px;font-weight:500">' + data.message + '</div>'
    + '<div style="background:rgba(59,107,255,.04);border-radius:12px;padding:28px;margin-bottom:24px;display:inline-block;min-width:200px;border:1px solid rgba(59,107,255,.12)">'
    + '<div style="font-size:40px;font-weight:800;color:' + BRAND + ';letter-spacing:-1px;line-height:1">' + data.stat + '</div>'
    + '<div style="font-size:13px;color:' + MUTED + ';margin-top:8px;font-weight:500">' + data.statLabel + '</div>'
    + '</div>'
    + '<div><a href="' + (data.dashUrl || 'https://sortora.com/dashboard.html') + '" style="display:inline-block;padding:12px 28px;background:' + BRAND + ';color:#fff;border-radius:10px;font-size:14px;font-weight:700;text-decoration:none">View dashboard</a></div>'
    + '</div>');
}

/* ═══════════════════════════════════════════════════
 *  19. RE-ENGAGEMENT — Day 7 inactive
 * ═══════════════════════════════════════════════════ */
function reengageDay7(data) {
  return wrapper(header('We Miss You')
    + '<div style="padding:36px 40px">'
    + '<p style="font-size:15px;color:' + GRAY + ';line-height:1.7;margin:0 0 16px;font-weight:500">Hey ' + data.name + ',</p>'
    + '<p style="font-size:15px;color:' + GRAY + ';line-height:1.7;margin:0 0 20px;font-weight:500">It\u2019s been about a week since you\u2019ve logged in. Just wanted to make sure everything\u2019s working well with ' + data.businessName + '\u2019s split payments.</p>'
    + '<p style="font-size:15px;color:' + GRAY + ';line-height:1.7;margin:0 0 24px;font-weight:500">Here\u2019s what you might have missed:</p>'
    + '<div style="background:' + GLASS + ';border-radius:12px;padding:20px 24px;margin-bottom:24px;border:1px solid ' + BORDER + '">'
    + '<div style="font-size:14px;color:' + DARK + ';line-height:1.7;font-weight:500">\u2022 Any pending split payments from your customers<br>\u2022 Potential payouts waiting to be reviewed<br>\u2022 Dashboard insights about your booking trends</div></div>'
    + '<a href="' + (data.dashUrl || 'https://sortora.com/dashboard.html') + '" style="display:inline-block;padding:14px 36px;background:' + BRAND + ';color:#fff;border-radius:10px;font-size:15px;font-weight:700;text-decoration:none">Check my dashboard &rarr;</a>'
    + '</div>');
}

/* ═══════════════════════════════════════════════════
 *  20. RE-ENGAGEMENT — Day 14 inactive
 * ═══════════════════════════════════════════════════ */
function reengageDay14(data) {
  return wrapper(header('Quick Check-In')
    + '<div style="padding:36px 40px">'
    + '<p style="font-size:15px;color:' + GRAY + ';line-height:1.7;margin:0 0 16px;font-weight:500">Hey ' + data.name + ',</p>'
    + '<p style="font-size:15px;color:' + GRAY + ';line-height:1.7;margin:0 0 20px;font-weight:500">It\u2019s been a couple weeks. If you\u2019re having any trouble getting set up, I\u2019m here to help.</p>'
    + '<p style="font-size:15px;color:' + GRAY + ';line-height:1.7;margin:0 0 24px;font-weight:500">Some businesses find it helpful to do a quick 10-minute setup call. Want me to walk you through embedding the widget? Just reply to this email.</p>'
    + '<a href="' + (data.dashUrl || 'https://sortora.com/dashboard.html') + '" style="display:inline-block;padding:14px 36px;background:' + BRAND + ';color:#fff;border-radius:10px;font-size:15px;font-weight:700;text-decoration:none">Back to dashboard &rarr;</a>'
    + '<p style="font-size:15px;color:' + DARK + ';margin:24px 0 0;font-weight:600">Riley Buell</p>'
    + '<p style="font-size:13px;color:' + MUTED + ';margin:2px 0 0;font-weight:500">Founder, Sortora</p>'
    + '</div>');
}

/* ═══════════════════════════════════════════════════
 *  21. RE-ENGAGEMENT — Day 30 inactive
 * ═══════════════════════════════════════════════════ */
function reengageDay30(data) {
  return wrapper(
    '<div style="padding:40px 40px 36px">'
    + '<p style="font-size:15px;color:' + DARK + ';line-height:1.75;margin:0 0 16px;font-weight:500">Hey ' + data.name + ',</p>'
    + '<p style="font-size:15px;color:' + GRAY + ';line-height:1.75;margin:0 0 16px;font-weight:500">It\u2019s been a month. I wanted to check in one more time \u2014 is Sortora still a fit for ' + data.businessName + '?</p>'
    + '<p style="font-size:15px;color:' + GRAY + ';line-height:1.75;margin:0 0 16px;font-weight:500">If the timing wasn\u2019t right, no worries at all. Your account and data will be here whenever you\u2019re ready.</p>'
    + '<p style="font-size:15px;color:' + GRAY + ';line-height:1.75;margin:0 0 16px;font-weight:500">If there\u2019s something we could do better, I\u2019d genuinely love to hear it. Just reply.</p>'
    + '<p style="font-size:15px;color:' + DARK + ';margin:24px 0 0;font-weight:600">Riley Buell</p>'
    + '<p style="font-size:13px;color:' + MUTED + ';margin:2px 0 0;font-weight:500">Founder, Sortora</p>'
    + '</div>');
}

/* ═══════════════════════════════════════════════════
 *  22. FEATURE DISCOVERY
 * ═══════════════════════════════════════════════════ */
function featureDiscovery(data) {
  return wrapper(header('Tip for ' + data.businessName)
    + '<div style="padding:36px 40px">'
    + '<p style="font-size:20px;font-weight:800;color:' + DARK + ';margin:0 0 12px;letter-spacing:-.3px">Have you tried ' + data.featureName + '?</p>'
    + '<p style="font-size:15px;color:' + GRAY + ';line-height:1.7;margin:0 0 24px;font-weight:500">' + data.featureDescription + '</p>'
    + '<div style="background:' + GLASS + ';border-radius:12px;padding:24px;margin-bottom:24px;border:1px solid ' + BORDER + '">'
    + '<div style="font-size:14px;font-weight:700;color:' + DARK + ';margin-bottom:8px">How to use it:</div>'
    + '<div style="font-size:13px;color:' + GRAY + ';line-height:1.7;font-weight:500">' + data.howTo + '</div></div>'
    + '<a href="' + (data.actionUrl || data.dashUrl || 'https://sortora.com/dashboard.html') + '" style="display:inline-block;padding:14px 36px;background:' + BRAND + ';color:#fff;border-radius:10px;font-size:15px;font-weight:700;text-decoration:none">' + (data.ctaText || 'Try it now') + ' &rarr;</a>'
    + '</div>');
}

/* ═══════════════════════════════════════════════════
 *  23. MONTHLY REVENUE SUMMARY
 * ═══════════════════════════════════════════════════ */
function monthlySummary(data) {
  var rev = parseFloat(data.revenue || 0).toFixed(0);
  var prevRev = parseFloat(data.prevRevenue || 0).toFixed(0);
  var pct = data.prevRevenue > 0 ? Math.round((data.revenue - data.prevRevenue) / data.prevRevenue * 100) : 0;
  var arrow = pct >= 0 ? '\u2191' : '\u2193';
  var trendColor = pct >= 0 ? GREEN : '#EF4444';

  return wrapper(header('Monthly Summary')
    + '<div style="padding:36px 40px">'
    + '<p style="font-size:20px;font-weight:800;color:' + DARK + ';margin:0 0 6px;letter-spacing:-.3px">' + (data.monthName || 'This month') + ' Summary</p>'
    + '<p style="font-size:13px;color:' + MUTED + ';margin:0 0 24px;font-weight:500">Here\u2019s how ' + data.businessName + ' did this month.</p>'

    + '<div style="background:rgba(59,107,255,.04);border-radius:12px;padding:28px;margin-bottom:24px;text-align:center;border:1px solid rgba(59,107,255,.12)">'
    + '<div style="font-size:11px;color:' + MUTED + ';text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;font-weight:600">Total Revenue</div>'
    + '<div style="font-size:44px;font-weight:800;color:' + DARK + ';letter-spacing:-1.5px;line-height:1">
  paymentLink: paymentLink,
  paymentReceipt: paymentReceipt,
  bookingConfirmed: bookingConfirmed,
  businessConfirmed: businessConfirmed,
  welcome: welcome,
  quickWin: quickWin,
  socialProof: socialProof,
  featureSpotlight: featureSpotlight,
  checkIn: checkIn,
  dunningDay0: dunningDay0,
  dunningDay3: dunningDay3,
  dunningDay7: dunningDay7,
  dunningDay14: dunningDay14
};
 + rev + '</div>'
    + '<div style="font-size:14px;color:' + trendColor + ';font-weight:600;margin-top:8px">' + arrow + ' ' + Math.abs(pct) + '% vs last month (
  paymentLink: paymentLink,
  paymentReceipt: paymentReceipt,
  bookingConfirmed: bookingConfirmed,
  businessConfirmed: businessConfirmed,
  welcome: welcome,
  quickWin: quickWin,
  socialProof: socialProof,
  featureSpotlight: featureSpotlight,
  checkIn: checkIn,
  dunningDay0: dunningDay0,
  dunningDay3: dunningDay3,
  dunningDay7: dunningDay7,
  dunningDay14: dunningDay14
};
 + prevRev + ')</div>'
    + '</div>'

    + '<div style="background:' + GLASS + ';border-radius:12px;overflow:hidden;margin-bottom:24px;border:1px solid ' + BORDER + '">'
    + '<table cellpadding="0" cellspacing="0" border="0" width="100%"><tr>'
    + '<td style="padding:18px;text-align:center;width:33%"><div style="font-size:11px;color:' + MUTED + ';text-transform:uppercase;letter-spacing:.6px;margin-bottom:4px;font-weight:600">Bookings</div><div style="font-size:22px;font-weight:800;color:' + DARK + '">' + (data.bookings || 0) + '</div></td>'
    + '<td style="padding:18px;text-align:center;width:33%;border-left:1px solid ' + BORDER + ';border-right:1px solid ' + BORDER + '"><div style="font-size:11px;color:' + MUTED + ';text-transform:uppercase;letter-spacing:.6px;margin-bottom:4px;font-weight:600">Completion</div><div style="font-size:22px;font-weight:800;color:' + DARK + '">' + (data.completionRate || 0) + '%</div></td>'
    + '<td style="padding:18px;text-align:center;width:33%"><div style="font-size:11px;color:' + MUTED + ';text-transform:uppercase;letter-spacing:.6px;margin-bottom:4px;font-weight:600">Payouts</div><div style="font-size:22px;font-weight:800;color:' + GREEN + '">
  paymentLink: paymentLink,
  paymentReceipt: paymentReceipt,
  bookingConfirmed: bookingConfirmed,
  businessConfirmed: businessConfirmed,
  welcome: welcome,
  quickWin: quickWin,
  socialProof: socialProof,
  featureSpotlight: featureSpotlight,
  checkIn: checkIn,
  dunningDay0: dunningDay0,
  dunningDay3: dunningDay3,
  dunningDay7: dunningDay7,
  dunningDay14: dunningDay14
};
 + parseFloat(data.payouts || 0).toFixed(0) + '</div></td>'
    + '</tr></table></div>'

    + '<a href="' + (data.dashUrl || 'https://sortora.com/dashboard.html') + '" style="display:inline-block;padding:12px 28px;background:' + BRAND + ';color:#fff;border-radius:10px;font-size:14px;font-weight:700;text-decoration:none">View full analytics</a>'
    + '</div>');
}


/* \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
 *  24. PAYMENT REMINDER \u2014 nudge unpaid participants
 * \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 */
function paymentReminder(data) {
  var amt = parseFloat(data.amount).toFixed(2);
  return wrapper(header('Payment Reminder')
    + '<div style="padding:36px 40px">'
    + '<p style="font-size:15px;color:' + GRAY + ';line-height:1.7;margin:0 0 16px;font-weight:500">Hey ' + data.name + ',</p>'
    + '<p style="font-size:15px;color:' + GRAY + ';line-height:1.7;margin:0 0 20px;font-weight:500">Friendly reminder \u2014 you still have an outstanding share to pay for:</p>'
    + '<div style="background:' + GLASS + ';border-radius:12px;padding:20px 24px;margin-bottom:24px;border:1px solid ' + BORDER + '">'
    + '<div style="font-size:16px;font-weight:700;color:' + DARK + ';margin-bottom:6px">' + data.bookingTitle + '</div>'
    + '<div style="font-size:14px;color:' + GRAY + ';font-weight:500">with ' + (data.businessName || 'the organizer') + '</div>'
    + '<div style="margin-top:12px;padding-top:12px;border-top:1px solid ' + BORDER + '">'
    + '<table cellpadding="0" cellspacing="0" border="0" width="100%"><tr>'
    + '<td style="font-size:13px;color:' + MUTED + ';font-weight:500">Your share</td>'
    + '<td style="font-size:18px;font-weight:800;color:' + DARK + ';text-align:right">
  paymentLink: paymentLink,
  paymentReceipt: paymentReceipt,
  bookingConfirmed: bookingConfirmed,
  businessConfirmed: businessConfirmed,
  welcome: welcome,
  quickWin: quickWin,
  socialProof: socialProof,
  featureSpotlight: featureSpotlight,
  checkIn: checkIn,
  dunningDay0: dunningDay0,
  dunningDay3: dunningDay3,
  dunningDay7: dunningDay7,
  dunningDay14: dunningDay14
};
 + amt + '</td>'
    + '</tr></table></div>'
    + '<div style="margin-top:8px;font-size:13px;color:' + MUTED + ';font-weight:500">' + (data.paidCount || 0) + ' of ' + (data.totalCount || 0) + ' people have paid</div>'
    + '</div>'
    + '<a href="' + data.payUrl + '" style="display:inline-block;padding:14px 36px;background:' + BRAND + ';color:#fff;border-radius:10px;font-size:15px;font-weight:700;text-decoration:none">Pay your share &rarr;</a>'
    + (data.expiresIn ? '<p style="font-size:13px;color:#f59e0b;margin:16px 0 0;font-weight:600">\u23f0 This split expires in ' + data.expiresIn + '</p>' : '')
    + '</div>');
}

module.exports = {
  paymentLink: paymentLink,
  paymentReceipt: paymentReceipt,
  bookingConfirmed: bookingConfirmed,
  businessConfirmed: businessConfirmed,
  welcome: welcome,
  quickWin: quickWin,
  socialProof: socialProof,
  featureSpotlight: featureSpotlight,
  checkIn: checkIn,
  dunningDay0: dunningDay0,
  dunningDay3: dunningDay3,
  dunningDay7: dunningDay7,
  dunningDay14: dunningDay14,
  expiringCard: expiringCard,
  widgetNudge: widgetNudge,
  payoutNotification: payoutNotification,
  weeklyDigest: weeklyDigest,
  milestone: milestone,
  reengageDay7: reengageDay7,
  reengageDay14: reengageDay14,
  reengageDay30: reengageDay30,
  featureDiscovery: featureDiscovery,
  monthlySummary: monthlySummary,
  paymentReminder: paymentReminder
};
 + amt + '</div>'
    + '<div style="font-size:14px;color:' + GRAY + ';margin-bottom:24px;font-weight:500">should arrive in ' + (data.arrivalDays || '2-3') + ' business days</div>'
    + '<div style="background:' + GLASS + ';border-radius:12px;padding:16px 20px;margin-bottom:24px;border:1px solid ' + BORDER + ';text-align:left">'
    + '<table cellpadding="0" cellspacing="0" border="0" width="100%">'
    + '<tr><td style="padding:6px 0;font-size:13px;color:' + MUTED + ';font-weight:500">Bookings included</td><td style="padding:6px 0;font-size:13px;color:' + DARK + ';font-weight:600;text-align:right">' + (data.bookingCount || '—') + '</td></tr>'
    + '<tr><td style="padding:6px 0;font-size:13px;color:' + MUTED + ';font-weight:500">Period</td><td style="padding:6px 0;font-size:13px;color:' + DARK + ';font-weight:600;text-align:right">' + (data.period || '—') + '</td></tr>'
    + '<tr><td style="padding:6px 0;font-size:13px;color:' + MUTED + ';font-weight:500">Destination</td><td style="padding:6px 0;font-size:13px;color:' + DARK + ';font-weight:600;text-align:right">\u2022\u2022\u2022\u2022 ' + (data.last4Bank || '****') + '</td></tr>'
    + '</table></div>'
    + '<a href="' + (data.dashUrl || 'https://sortora.com/dashboard.html') + '" style="display:inline-block;padding:12px 28px;background:' + BRAND + ';color:#fff;border-radius:10px;font-size:14px;font-weight:700;text-decoration:none">View in dashboard</a>'
    + '</div>');
}

/* ═══════════════════════════════════════════════════
 *  17. WEEKLY ACTIVITY DIGEST
 * ═══════════════════════════════════════════════════ */
function weeklyDigest(data) {
  var rev = parseFloat(data.revenue || 0).toFixed(0);
  var prevRev = parseFloat(data.prevRevenue || 0).toFixed(0);
  var pct = data.prevRevenue > 0 ? Math.round((data.revenue - data.prevRevenue) / data.prevRevenue * 100) : 0;
  var arrow = pct >= 0 ? '\u2191' : '\u2193';
  var trendColor = pct >= 0 ? GREEN : '#EF4444';

  return wrapper(header('Weekly Digest')
    + '<div style="padding:36px 40px">'
    + '<p style="font-size:20px;font-weight:800;color:' + DARK + ';margin:0 0 6px;letter-spacing:-.3px">Your week at a glance</p>'
    + '<p style="font-size:13px;color:' + MUTED + ';margin:0 0 24px;font-weight:500">' + (data.weekRange || 'This week') + '</p>'

    + '<div style="background:' + GLASS + ';border-radius:12px;overflow:hidden;margin-bottom:24px;border:1px solid ' + BORDER + '">'
    + '<table cellpadding="0" cellspacing="0" border="0" width="100%">'
    + '<tr>'
    + '<td style="padding:20px;text-align:center;width:50%;border-bottom:1px solid ' + BORDER + '"><div style="font-size:11px;color:' + MUTED + ';text-transform:uppercase;letter-spacing:.8px;margin-bottom:4px;font-weight:600">Revenue</div><div style="font-size:24px;font-weight:800;color:' + DARK + '">
  paymentLink: paymentLink,
  paymentReceipt: paymentReceipt,
  bookingConfirmed: bookingConfirmed,
  businessConfirmed: businessConfirmed,
  welcome: welcome,
  quickWin: quickWin,
  socialProof: socialProof,
  featureSpotlight: featureSpotlight,
  checkIn: checkIn,
  dunningDay0: dunningDay0,
  dunningDay3: dunningDay3,
  dunningDay7: dunningDay7,
  dunningDay14: dunningDay14
};
 + rev + '</div><div style="font-size:12px;color:' + trendColor + ';font-weight:600;margin-top:4px">' + arrow + ' ' + Math.abs(pct) + '% vs last week</div></td>'
    + '<td style="padding:20px;text-align:center;width:50%;border-bottom:1px solid ' + BORDER + ';border-left:1px solid ' + BORDER + '"><div style="font-size:11px;color:' + MUTED + ';text-transform:uppercase;letter-spacing:.8px;margin-bottom:4px;font-weight:600">Bookings</div><div style="font-size:24px;font-weight:800;color:' + DARK + '">' + (data.bookings || 0) + '</div><div style="font-size:12px;color:' + MUTED + ';font-weight:500;margin-top:4px">' + (data.confirmedBookings || 0) + ' confirmed</div></td>'
    + '</tr>'
    + '<tr>'
    + '<td style="padding:20px;text-align:center;width:50%"><div style="font-size:11px;color:' + MUTED + ';text-transform:uppercase;letter-spacing:.8px;margin-bottom:4px;font-weight:600">Completion Rate</div><div style="font-size:24px;font-weight:800;color:' + DARK + '">' + (data.completionRate || 0) + '%</div></td>'
    + '<td style="padding:20px;text-align:center;width:50%;border-left:1px solid ' + BORDER + '"><div style="font-size:11px;color:' + MUTED + ';text-transform:uppercase;letter-spacing:.8px;margin-bottom:4px;font-weight:600">Avg Group Size</div><div style="font-size:24px;font-weight:800;color:' + DARK + '">' + (data.avgGroupSize || '—') + '</div></td>'
    + '</tr></table></div>'

    + (data.topExperience ? '<div style="background:rgba(59,107,255,.04);border-radius:10px;padding:14px 20px;margin-bottom:24px;border:1px solid rgba(59,107,255,.12)"><span style="font-size:12px;color:' + BRAND + ';font-weight:700">TOP EXPERIENCE: </span><span style="font-size:13px;color:' + DARK + ';font-weight:600">' + data.topExperience + '</span></div>' : '')

    + '<a href="' + (data.dashUrl || 'https://sortora.com/dashboard.html') + '" style="display:inline-block;padding:12px 28px;background:' + BRAND + ';color:#fff;border-radius:10px;font-size:14px;font-weight:700;text-decoration:none">View full dashboard</a>'
    + '</div>');
}


/* ═══════════════════════════════════════════════════
 *  18. MILESTONE CELEBRATION
 * ═══════════════════════════════════════════════════ */
function milestone(data) {
  return wrapper(header('Milestone Reached!')
    + '<div style="padding:48px 40px;text-align:center">'
    + '<div style="font-size:48px;margin-bottom:16px">\ud83c\udf89</div>'
    + '<div style="font-size:22px;font-weight:800;color:' + DARK + ';letter-spacing:-.4px;margin-bottom:8px">' + data.title + '</div>'
    + '<div style="font-size:15px;color:' + GRAY + ';line-height:1.6;margin-bottom:24px;font-weight:500">' + data.message + '</div>'
    + '<div style="background:rgba(59,107,255,.04);border-radius:12px;padding:28px;margin-bottom:24px;display:inline-block;min-width:200px;border:1px solid rgba(59,107,255,.12)">'
    + '<div style="font-size:40px;font-weight:800;color:' + BRAND + ';letter-spacing:-1px;line-height:1">' + data.stat + '</div>'
    + '<div style="font-size:13px;color:' + MUTED + ';margin-top:8px;font-weight:500">' + data.statLabel + '</div>'
    + '</div>'
    + '<div><a href="' + (data.dashUrl || 'https://sortora.com/dashboard.html') + '" style="display:inline-block;padding:12px 28px;background:' + BRAND + ';color:#fff;border-radius:10px;font-size:14px;font-weight:700;text-decoration:none">View dashboard</a></div>'
    + '</div>');
}

/* ═══════════════════════════════════════════════════
 *  19. RE-ENGAGEMENT — Day 7 inactive
 * ═══════════════════════════════════════════════════ */
function reengageDay7(data) {
  return wrapper(header('We Miss You')
    + '<div style="padding:36px 40px">'
    + '<p style="font-size:15px;color:' + GRAY + ';line-height:1.7;margin:0 0 16px;font-weight:500">Hey ' + data.name + ',</p>'
    + '<p style="font-size:15px;color:' + GRAY + ';line-height:1.7;margin:0 0 20px;font-weight:500">It\u2019s been about a week since you\u2019ve logged in. Just wanted to make sure everything\u2019s working well with ' + data.businessName + '\u2019s split payments.</p>'
    + '<p style="font-size:15px;color:' + GRAY + ';line-height:1.7;margin:0 0 24px;font-weight:500">Here\u2019s what you might have missed:</p>'
    + '<div style="background:' + GLASS + ';border-radius:12px;padding:20px 24px;margin-bottom:24px;border:1px solid ' + BORDER + '">'
    + '<div style="font-size:14px;color:' + DARK + ';line-height:1.7;font-weight:500">\u2022 Any pending split payments from your customers<br>\u2022 Potential payouts waiting to be reviewed<br>\u2022 Dashboard insights about your booking trends</div></div>'
    + '<a href="' + (data.dashUrl || 'https://sortora.com/dashboard.html') + '" style="display:inline-block;padding:14px 36px;background:' + BRAND + ';color:#fff;border-radius:10px;font-size:15px;font-weight:700;text-decoration:none">Check my dashboard &rarr;</a>'
    + '</div>');
}

/* ═══════════════════════════════════════════════════
 *  20. RE-ENGAGEMENT — Day 14 inactive
 * ═══════════════════════════════════════════════════ */
function reengageDay14(data) {
  return wrapper(header('Quick Check-In')
    + '<div style="padding:36px 40px">'
    + '<p style="font-size:15px;color:' + GRAY + ';line-height:1.7;margin:0 0 16px;font-weight:500">Hey ' + data.name + ',</p>'
    + '<p style="font-size:15px;color:' + GRAY + ';line-height:1.7;margin:0 0 20px;font-weight:500">It\u2019s been a couple weeks. If you\u2019re having any trouble getting set up, I\u2019m here to help.</p>'
    + '<p style="font-size:15px;color:' + GRAY + ';line-height:1.7;margin:0 0 24px;font-weight:500">Some businesses find it helpful to do a quick 10-minute setup call. Want me to walk you through embedding the widget? Just reply to this email.</p>'
    + '<a href="' + (data.dashUrl || 'https://sortora.com/dashboard.html') + '" style="display:inline-block;padding:14px 36px;background:' + BRAND + ';color:#fff;border-radius:10px;font-size:15px;font-weight:700;text-decoration:none">Back to dashboard &rarr;</a>'
    + '<p style="font-size:15px;color:' + DARK + ';margin:24px 0 0;font-weight:600">Riley Buell</p>'
    + '<p style="font-size:13px;color:' + MUTED + ';margin:2px 0 0;font-weight:500">Founder, Sortora</p>'
    + '</div>');
}

/* ═══════════════════════════════════════════════════
 *  21. RE-ENGAGEMENT — Day 30 inactive
 * ═══════════════════════════════════════════════════ */
function reengageDay30(data) {
  return wrapper(
    '<div style="padding:40px 40px 36px">'
    + '<p style="font-size:15px;color:' + DARK + ';line-height:1.75;margin:0 0 16px;font-weight:500">Hey ' + data.name + ',</p>'
    + '<p style="font-size:15px;color:' + GRAY + ';line-height:1.75;margin:0 0 16px;font-weight:500">It\u2019s been a month. I wanted to check in one more time \u2014 is Sortora still a fit for ' + data.businessName + '?</p>'
    + '<p style="font-size:15px;color:' + GRAY + ';line-height:1.75;margin:0 0 16px;font-weight:500">If the timing wasn\u2019t right, no worries at all. Your account and data will be here whenever you\u2019re ready.</p>'
    + '<p style="font-size:15px;color:' + GRAY + ';line-height:1.75;margin:0 0 16px;font-weight:500">If there\u2019s something we could do better, I\u2019d genuinely love to hear it. Just reply.</p>'
    + '<p style="font-size:15px;color:' + DARK + ';margin:24px 0 0;font-weight:600">Riley Buell</p>'
    + '<p style="font-size:13px;color:' + MUTED + ';margin:2px 0 0;font-weight:500">Founder, Sortora</p>'
    + '</div>');
}

/* ═══════════════════════════════════════════════════
 *  22. FEATURE DISCOVERY
 * ═══════════════════════════════════════════════════ */
function featureDiscovery(data) {
  return wrapper(header('Tip for ' + data.businessName)
    + '<div style="padding:36px 40px">'
    + '<p style="font-size:20px;font-weight:800;color:' + DARK + ';margin:0 0 12px;letter-spacing:-.3px">Have you tried ' + data.featureName + '?</p>'
    + '<p style="font-size:15px;color:' + GRAY + ';line-height:1.7;margin:0 0 24px;font-weight:500">' + data.featureDescription + '</p>'
    + '<div style="background:' + GLASS + ';border-radius:12px;padding:24px;margin-bottom:24px;border:1px solid ' + BORDER + '">'
    + '<div style="font-size:14px;font-weight:700;color:' + DARK + ';margin-bottom:8px">How to use it:</div>'
    + '<div style="font-size:13px;color:' + GRAY + ';line-height:1.7;font-weight:500">' + data.howTo + '</div></div>'
    + '<a href="' + (data.actionUrl || data.dashUrl || 'https://sortora.com/dashboard.html') + '" style="display:inline-block;padding:14px 36px;background:' + BRAND + ';color:#fff;border-radius:10px;font-size:15px;font-weight:700;text-decoration:none">' + (data.ctaText || 'Try it now') + ' &rarr;</a>'
    + '</div>');
}

/* ═══════════════════════════════════════════════════
 *  23. MONTHLY REVENUE SUMMARY
 * ═══════════════════════════════════════════════════ */
function monthlySummary(data) {
  var rev = parseFloat(data.revenue || 0).toFixed(0);
  var prevRev = parseFloat(data.prevRevenue || 0).toFixed(0);
  var pct = data.prevRevenue > 0 ? Math.round((data.revenue - data.prevRevenue) / data.prevRevenue * 100) : 0;
  var arrow = pct >= 0 ? '\u2191' : '\u2193';
  var trendColor = pct >= 0 ? GREEN : '#EF4444';

  return wrapper(header('Monthly Summary')
    + '<div style="padding:36px 40px">'
    + '<p style="font-size:20px;font-weight:800;color:' + DARK + ';margin:0 0 6px;letter-spacing:-.3px">' + (data.monthName || 'This month') + ' Summary</p>'
    + '<p style="font-size:13px;color:' + MUTED + ';margin:0 0 24px;font-weight:500">Here\u2019s how ' + data.businessName + ' did this month.</p>'

    + '<div style="background:rgba(59,107,255,.04);border-radius:12px;padding:28px;margin-bottom:24px;text-align:center;border:1px solid rgba(59,107,255,.12)">'
    + '<div style="font-size:11px;color:' + MUTED + ';text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;font-weight:600">Total Revenue</div>'
    + '<div style="font-size:44px;font-weight:800;color:' + DARK + ';letter-spacing:-1.5px;line-height:1">
  paymentLink: paymentLink,
  paymentReceipt: paymentReceipt,
  bookingConfirmed: bookingConfirmed,
  businessConfirmed: businessConfirmed,
  welcome: welcome,
  quickWin: quickWin,
  socialProof: socialProof,
  featureSpotlight: featureSpotlight,
  checkIn: checkIn,
  dunningDay0: dunningDay0,
  dunningDay3: dunningDay3,
  dunningDay7: dunningDay7,
  dunningDay14: dunningDay14
};
 + rev + '</div>'
    + '<div style="font-size:14px;color:' + trendColor + ';font-weight:600;margin-top:8px">' + arrow + ' ' + Math.abs(pct) + '% vs last month (
  paymentLink: paymentLink,
  paymentReceipt: paymentReceipt,
  bookingConfirmed: bookingConfirmed,
  businessConfirmed: businessConfirmed,
  welcome: welcome,
  quickWin: quickWin,
  socialProof: socialProof,
  featureSpotlight: featureSpotlight,
  checkIn: checkIn,
  dunningDay0: dunningDay0,
  dunningDay3: dunningDay3,
  dunningDay7: dunningDay7,
  dunningDay14: dunningDay14
};
 + prevRev + ')</div>'
    + '</div>'

    + '<div style="background:' + GLASS + ';border-radius:12px;overflow:hidden;margin-bottom:24px;border:1px solid ' + BORDER + '">'
    + '<table cellpadding="0" cellspacing="0" border="0" width="100%"><tr>'
    + '<td style="padding:18px;text-align:center;width:33%"><div style="font-size:11px;color:' + MUTED + ';text-transform:uppercase;letter-spacing:.6px;margin-bottom:4px;font-weight:600">Bookings</div><div style="font-size:22px;font-weight:800;color:' + DARK + '">' + (data.bookings || 0) + '</div></td>'
    + '<td style="padding:18px;text-align:center;width:33%;border-left:1px solid ' + BORDER + ';border-right:1px solid ' + BORDER + '"><div style="font-size:11px;color:' + MUTED + ';text-transform:uppercase;letter-spacing:.6px;margin-bottom:4px;font-weight:600">Completion</div><div style="font-size:22px;font-weight:800;color:' + DARK + '">' + (data.completionRate || 0) + '%</div></td>'
    + '<td style="padding:18px;text-align:center;width:33%"><div style="font-size:11px;color:' + MUTED + ';text-transform:uppercase;letter-spacing:.6px;margin-bottom:4px;font-weight:600">Payouts</div><div style="font-size:22px;font-weight:800;color:' + GREEN + '">
  paymentLink: paymentLink,
  paymentReceipt: paymentReceipt,
  bookingConfirmed: bookingConfirmed,
  businessConfirmed: businessConfirmed,
  welcome: welcome,
  quickWin: quickWin,
  socialProof: socialProof,
  featureSpotlight: featureSpotlight,
  checkIn: checkIn,
  dunningDay0: dunningDay0,
  dunningDay3: dunningDay3,
  dunningDay7: dunningDay7,
  dunningDay14: dunningDay14
};
 + parseFloat(data.payouts || 0).toFixed(0) + '</div></td>'
    + '</tr></table></div>'

    + '<a href="' + (data.dashUrl || 'https://sortora.com/dashboard.html') + '" style="display:inline-block;padding:12px 28px;background:' + BRAND + ';color:#fff;border-radius:10px;font-size:14px;font-weight:700;text-decoration:none">View full analytics</a>'
    + '</div>');
}


/* \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
 *  24. PAYMENT REMINDER \u2014 nudge unpaid participants
 * \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 */
function paymentReminder(data) {
  var amt = parseFloat(data.amount).toFixed(2);
  return wrapper(header('Payment Reminder')
    + '<div style="padding:36px 40px">'
    + '<p style="font-size:15px;color:' + GRAY + ';line-height:1.7;margin:0 0 16px;font-weight:500">Hey ' + data.name + ',</p>'
    + '<p style="font-size:15px;color:' + GRAY + ';line-height:1.7;margin:0 0 20px;font-weight:500">Friendly reminder \u2014 you still have an outstanding share to pay for:</p>'
    + '<div style="background:' + GLASS + ';border-radius:12px;padding:20px 24px;margin-bottom:24px;border:1px solid ' + BORDER + '">'
    + '<div style="font-size:16px;font-weight:700;color:' + DARK + ';margin-bottom:6px">' + data.bookingTitle + '</div>'
    + '<div style="font-size:14px;color:' + GRAY + ';font-weight:500">with ' + (data.businessName || 'the organizer') + '</div>'
    + '<div style="margin-top:12px;padding-top:12px;border-top:1px solid ' + BORDER + '">'
    + '<table cellpadding="0" cellspacing="0" border="0" width="100%"><tr>'
    + '<td style="font-size:13px;color:' + MUTED + ';font-weight:500">Your share</td>'
    + '<td style="font-size:18px;font-weight:800;color:' + DARK + ';text-align:right">
  paymentLink: paymentLink,
  paymentReceipt: paymentReceipt,
  bookingConfirmed: bookingConfirmed,
  businessConfirmed: businessConfirmed,
  welcome: welcome,
  quickWin: quickWin,
  socialProof: socialProof,
  featureSpotlight: featureSpotlight,
  checkIn: checkIn,
  dunningDay0: dunningDay0,
  dunningDay3: dunningDay3,
  dunningDay7: dunningDay7,
  dunningDay14: dunningDay14
};
 + amt + '</td>'
    + '</tr></table></div>'
    + '<div style="margin-top:8px;font-size:13px;color:' + MUTED + ';font-weight:500">' + (data.paidCount || 0) + ' of ' + (data.totalCount || 0) + ' people have paid</div>'
    + '</div>'
    + '<a href="' + data.payUrl + '" style="display:inline-block;padding:14px 36px;background:' + BRAND + ';color:#fff;border-radius:10px;font-size:15px;font-weight:700;text-decoration:none">Pay your share &rarr;</a>'
    + (data.expiresIn ? '<p style="font-size:13px;color:#f59e0b;margin:16px 0 0;font-weight:600">\u23f0 This split expires in ' + data.expiresIn + '</p>' : '')
    + '</div>');
}

module.exports = {
  paymentLink: paymentLink,
  paymentReceipt: paymentReceipt,
  bookingConfirmed: bookingConfirmed,
  businessConfirmed: businessConfirmed,
  welcome: welcome,
  quickWin: quickWin,
  socialProof: socialProof,
  featureSpotlight: featureSpotlight,
  checkIn: checkIn,
  dunningDay0: dunningDay0,
  dunningDay3: dunningDay3,
  dunningDay7: dunningDay7,
  dunningDay14: dunningDay14,
  expiringCard: expiringCard,
  widgetNudge: widgetNudge,
  payoutNotification: payoutNotification,
  weeklyDigest: weeklyDigest,
  milestone: milestone,
  reengageDay7: reengageDay7,
  reengageDay14: reengageDay14,
  reengageDay30: reengageDay30,
  featureDiscovery: featureDiscovery,
  monthlySummary: monthlySummary,
  paymentReminder: paymentReminder
};
 + amt + '</div>'
    + '<div style="font-size:14px;color:' + GRAY + ';margin-bottom:24px;font-weight:500">should arrive in ' + (data.arrivalDays || '2-3') + ' business days</div>'
    + '<div style="background:' + GLASS + ';border-radius:12px;padding:16px 20px;margin-bottom:24px;border:1px solid ' + BORDER + ';text-align:left">'
    + '<table cellpadding="0" cellspacing="0" border="0" width="100%">'
    + '<tr><td style="padding:6px 0;font-size:13px;color:' + MUTED + ';font-weight:500">Bookings included</td><td style="padding:6px 0;font-size:13px;color:' + DARK + ';font-weight:600;text-align:right">' + (data.bookingCount || '—') + '</td></tr>'
    + '<tr><td style="padding:6px 0;font-size:13px;color:' + MUTED + ';font-weight:500">Period</td><td style="padding:6px 0;font-size:13px;color:' + DARK + ';font-weight:600;text-align:right">' + (data.period || '—') + '</td></tr>'
    + '<tr><td style="padding:6px 0;font-size:13px;color:' + MUTED + ';font-weight:500">Destination</td><td style="padding:6px 0;font-size:13px;color:' + DARK + ';font-weight:600;text-align:right">\u2022\u2022\u2022\u2022 ' + (data.last4Bank || '****') + '</td></tr>'
    + '</table></div>'
    + '<a href="' + (data.dashUrl || 'https://sortora.com/dashboard.html') + '" style="display:inline-block;padding:12px 28px;background:' + BRAND + ';color:#fff;border-radius:10px;font-size:14px;font-weight:700;text-decoration:none">View in dashboard</a>'
    + '</div>');
}

/* ═══════════════════════════════════════════════════
 *  17. WEEKLY ACTIVITY DIGEST
 * ═══════════════════════════════════════════════════ */
function weeklyDigest(data) {
  var rev = parseFloat(data.revenue || 0).toFixed(0);
  var prevRev = parseFloat(data.prevRevenue || 0).toFixed(0);
  var pct = data.prevRevenue > 0 ? Math.round((data.revenue - data.prevRevenue) / data.prevRevenue * 100) : 0;
  var arrow = pct >= 0 ? '\u2191' : '\u2193';
  var trendColor = pct >= 0 ? GREEN : '#EF4444';

  return wrapper(header('Weekly Digest')
    + '<div style="padding:36px 40px">'
    + '<p style="font-size:20px;font-weight:800;color:' + DARK + ';margin:0 0 6px;letter-spacing:-.3px">Your week at a glance</p>'
    + '<p style="font-size:13px;color:' + MUTED + ';margin:0 0 24px;font-weight:500">' + (data.weekRange || 'This week') + '</p>'

    + '<div style="background:' + GLASS + ';border-radius:12px;overflow:hidden;margin-bottom:24px;border:1px solid ' + BORDER + '">'
    + '<table cellpadding="0" cellspacing="0" border="0" width="100%">'
    + '<tr>'
    + '<td style="padding:20px;text-align:center;width:50%;border-bottom:1px solid ' + BORDER + '"><div style="font-size:11px;color:' + MUTED + ';text-transform:uppercase;letter-spacing:.8px;margin-bottom:4px;font-weight:600">Revenue</div><div style="font-size:24px;font-weight:800;color:' + DARK + '">
  paymentLink: paymentLink,
  paymentReceipt: paymentReceipt,
  bookingConfirmed: bookingConfirmed,
  businessConfirmed: businessConfirmed,
  welcome: welcome,
  quickWin: quickWin,
  socialProof: socialProof,
  featureSpotlight: featureSpotlight,
  checkIn: checkIn,
  dunningDay0: dunningDay0,
  dunningDay3: dunningDay3,
  dunningDay7: dunningDay7,
  dunningDay14: dunningDay14
};
 + rev + '</div><div style="font-size:12px;color:' + trendColor + ';font-weight:600;margin-top:4px">' + arrow + ' ' + Math.abs(pct) + '% vs last week</div></td>'
    + '<td style="padding:20px;text-align:center;width:50%;border-bottom:1px solid ' + BORDER + ';border-left:1px solid ' + BORDER + '"><div style="font-size:11px;color:' + MUTED + ';text-transform:uppercase;letter-spacing:.8px;margin-bottom:4px;font-weight:600">Bookings</div><div style="font-size:24px;font-weight:800;color:' + DARK + '">' + (data.bookings || 0) + '</div><div style="font-size:12px;color:' + MUTED + ';font-weight:500;margin-top:4px">' + (data.confirmedBookings || 0) + ' confirmed</div></td>'
    + '</tr>'
    + '<tr>'
    + '<td style="padding:20px;text-align:center;width:50%"><div style="font-size:11px;color:' + MUTED + ';text-transform:uppercase;letter-spacing:.8px;margin-bottom:4px;font-weight:600">Completion Rate</div><div style="font-size:24px;font-weight:800;color:' + DARK + '">' + (data.completionRate || 0) + '%</div></td>'
    + '<td style="padding:20px;text-align:center;width:50%;border-left:1px solid ' + BORDER + '"><div style="font-size:11px;color:' + MUTED + ';text-transform:uppercase;letter-spacing:.8px;margin-bottom:4px;font-weight:600">Avg Group Size</div><div style="font-size:24px;font-weight:800;color:' + DARK + '">' + (data.avgGroupSize || '—') + '</div></td>'
    + '</tr></table></div>'

    + (data.topExperience ? '<div style="background:rgba(59,107,255,.04);border-radius:10px;padding:14px 20px;margin-bottom:24px;border:1px solid rgba(59,107,255,.12)"><span style="font-size:12px;color:' + BRAND + ';font-weight:700">TOP EXPERIENCE: </span><span style="font-size:13px;color:' + DARK + ';font-weight:600">' + data.topExperience + '</span></div>' : '')

    + '<a href="' + (data.dashUrl || 'https://sortora.com/dashboard.html') + '" style="display:inline-block;padding:12px 28px;background:' + BRAND + ';color:#fff;border-radius:10px;font-size:14px;font-weight:700;text-decoration:none">View full dashboard</a>'
    + '</div>');
}


/* ═══════════════════════════════════════════════════
 *  18. MILESTONE CELEBRATION
 * ═══════════════════════════════════════════════════ */
function milestone(data) {
  return wrapper(header('Milestone Reached!')
    + '<div style="padding:48px 40px;text-align:center">'
    + '<div style="font-size:48px;margin-bottom:16px">\ud83c\udf89</div>'
    + '<div style="font-size:22px;font-weight:800;color:' + DARK + ';letter-spacing:-.4px;margin-bottom:8px">' + data.title + '</div>'
    + '<div style="font-size:15px;color:' + GRAY + ';line-height:1.6;margin-bottom:24px;font-weight:500">' + data.message + '</div>'
    + '<div style="background:rgba(59,107,255,.04);border-radius:12px;padding:28px;margin-bottom:24px;display:inline-block;min-width:200px;border:1px solid rgba(59,107,255,.12)">'
    + '<div style="font-size:40px;font-weight:800;color:' + BRAND + ';letter-spacing:-1px;line-height:1">' + data.stat + '</div>'
    + '<div style="font-size:13px;color:' + MUTED + ';margin-top:8px;font-weight:500">' + data.statLabel + '</div>'
    + '</div>'
    + '<div><a href="' + (data.dashUrl || 'https://sortora.com/dashboard.html') + '" style="display:inline-block;padding:12px 28px;background:' + BRAND + ';color:#fff;border-radius:10px;font-size:14px;font-weight:700;text-decoration:none">View dashboard</a></div>'
    + '</div>');
}

/* ═══════════════════════════════════════════════════
 *  19. RE-ENGAGEMENT — Day 7 inactive
 * ═══════════════════════════════════════════════════ */
function reengageDay7(data) {
  return wrapper(header('We Miss You')
    + '<div style="padding:36px 40px">'
    + '<p style="font-size:15px;color:' + GRAY + ';line-height:1.7;margin:0 0 16px;font-weight:500">Hey ' + data.name + ',</p>'
    + '<p style="font-size:15px;color:' + GRAY + ';line-height:1.7;margin:0 0 20px;font-weight:500">It\u2019s been about a week since you\u2019ve logged in. Just wanted to make sure everything\u2019s working well with ' + data.businessName + '\u2019s split payments.</p>'
    + '<p style="font-size:15px;color:' + GRAY + ';line-height:1.7;margin:0 0 24px;font-weight:500">Here\u2019s what you might have missed:</p>'
    + '<div style="background:' + GLASS + ';border-radius:12px;padding:20px 24px;margin-bottom:24px;border:1px solid ' + BORDER + '">'
    + '<div style="font-size:14px;color:' + DARK + ';line-height:1.7;font-weight:500">\u2022 Any pending split payments from your customers<br>\u2022 Potential payouts waiting to be reviewed<br>\u2022 Dashboard insights about your booking trends</div></div>'
    + '<a href="' + (data.dashUrl || 'https://sortora.com/dashboard.html') + '" style="display:inline-block;padding:14px 36px;background:' + BRAND + ';color:#fff;border-radius:10px;font-size:15px;font-weight:700;text-decoration:none">Check my dashboard &rarr;</a>'
    + '</div>');
}

/* ═══════════════════════════════════════════════════
 *  20. RE-ENGAGEMENT — Day 14 inactive
 * ═══════════════════════════════════════════════════ */
function reengageDay14(data) {
  return wrapper(header('Quick Check-In')
    + '<div style="padding:36px 40px">'
    + '<p style="font-size:15px;color:' + GRAY + ';line-height:1.7;margin:0 0 16px;font-weight:500">Hey ' + data.name + ',</p>'
    + '<p style="font-size:15px;color:' + GRAY + ';line-height:1.7;margin:0 0 20px;font-weight:500">It\u2019s been a couple weeks. If you\u2019re having any trouble getting set up, I\u2019m here to help.</p>'
    + '<p style="font-size:15px;color:' + GRAY + ';line-height:1.7;margin:0 0 24px;font-weight:500">Some businesses find it helpful to do a quick 10-minute setup call. Want me to walk you through embedding the widget? Just reply to this email.</p>'
    + '<a href="' + (data.dashUrl || 'https://sortora.com/dashboard.html') + '" style="display:inline-block;padding:14px 36px;background:' + BRAND + ';color:#fff;border-radius:10px;font-size:15px;font-weight:700;text-decoration:none">Back to dashboard &rarr;</a>'
    + '<p style="font-size:15px;color:' + DARK + ';margin:24px 0 0;font-weight:600">Riley Buell</p>'
    + '<p style="font-size:13px;color:' + MUTED + ';margin:2px 0 0;font-weight:500">Founder, Sortora</p>'
    + '</div>');
}

/* ═══════════════════════════════════════════════════
 *  21. RE-ENGAGEMENT — Day 30 inactive
 * ═══════════════════════════════════════════════════ */
function reengageDay30(data) {
  return wrapper(
    '<div style="padding:40px 40px 36px">'
    + '<p style="font-size:15px;color:' + DARK + ';line-height:1.75;margin:0 0 16px;font-weight:500">Hey ' + data.name + ',</p>'
    + '<p style="font-size:15px;color:' + GRAY + ';line-height:1.75;margin:0 0 16px;font-weight:500">It\u2019s been a month. I wanted to check in one more time \u2014 is Sortora still a fit for ' + data.businessName + '?</p>'
    + '<p style="font-size:15px;color:' + GRAY + ';line-height:1.75;margin:0 0 16px;font-weight:500">If the timing wasn\u2019t right, no worries at all. Your account and data will be here whenever you\u2019re ready.</p>'
    + '<p style="font-size:15px;color:' + GRAY + ';line-height:1.75;margin:0 0 16px;font-weight:500">If there\u2019s something we could do better, I\u2019d genuinely love to hear it. Just reply.</p>'
    + '<p style="font-size:15px;color:' + DARK + ';margin:24px 0 0;font-weight:600">Riley Buell</p>'
    + '<p style="font-size:13px;color:' + MUTED + ';margin:2px 0 0;font-weight:500">Founder, Sortora</p>'
    + '</div>');
}

/* ═══════════════════════════════════════════════════
 *  22. FEATURE DISCOVERY
 * ═══════════════════════════════════════════════════ */
function featureDiscovery(data) {
  return wrapper(header('Tip for ' + data.businessName)
    + '<div style="padding:36px 40px">'
    + '<p style="font-size:20px;font-weight:800;color:' + DARK + ';margin:0 0 12px;letter-spacing:-.3px">Have you tried ' + data.featureName + '?</p>'
    + '<p style="font-size:15px;color:' + GRAY + ';line-height:1.7;margin:0 0 24px;font-weight:500">' + data.featureDescription + '</p>'
    + '<div style="background:' + GLASS + ';border-radius:12px;padding:24px;margin-bottom:24px;border:1px solid ' + BORDER + '">'
    + '<div style="font-size:14px;font-weight:700;color:' + DARK + ';margin-bottom:8px">How to use it:</div>'
    + '<div style="font-size:13px;color:' + GRAY + ';line-height:1.7;font-weight:500">' + data.howTo + '</div></div>'
    + '<a href="' + (data.actionUrl || data.dashUrl || 'https://sortora.com/dashboard.html') + '" style="display:inline-block;padding:14px 36px;background:' + BRAND + ';color:#fff;border-radius:10px;font-size:15px;font-weight:700;text-decoration:none">' + (data.ctaText || 'Try it now') + ' &rarr;</a>'
    + '</div>');
}

/* ═══════════════════════════════════════════════════
 *  23. MONTHLY REVENUE SUMMARY
 * ═══════════════════════════════════════════════════ */
function monthlySummary(data) {
  var rev = parseFloat(data.revenue || 0).toFixed(0);
  var prevRev = parseFloat(data.prevRevenue || 0).toFixed(0);
  var pct = data.prevRevenue > 0 ? Math.round((data.revenue - data.prevRevenue) / data.prevRevenue * 100) : 0;
  var arrow = pct >= 0 ? '\u2191' : '\u2193';
  var trendColor = pct >= 0 ? GREEN : '#EF4444';

  return wrapper(header('Monthly Summary')
    + '<div style="padding:36px 40px">'
    + '<p style="font-size:20px;font-weight:800;color:' + DARK + ';margin:0 0 6px;letter-spacing:-.3px">' + (data.monthName || 'This month') + ' Summary</p>'
    + '<p style="font-size:13px;color:' + MUTED + ';margin:0 0 24px;font-weight:500">Here\u2019s how ' + data.businessName + ' did this month.</p>'

    + '<div style="background:rgba(59,107,255,.04);border-radius:12px;padding:28px;margin-bottom:24px;text-align:center;border:1px solid rgba(59,107,255,.12)">'
    + '<div style="font-size:11px;color:' + MUTED + ';text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;font-weight:600">Total Revenue</div>'
    + '<div style="font-size:44px;font-weight:800;color:' + DARK + ';letter-spacing:-1.5px;line-height:1">
  paymentLink: paymentLink,
  paymentReceipt: paymentReceipt,
  bookingConfirmed: bookingConfirmed,
  businessConfirmed: businessConfirmed,
  welcome: welcome,
  quickWin: quickWin,
  socialProof: socialProof,
  featureSpotlight: featureSpotlight,
  checkIn: checkIn,
  dunningDay0: dunningDay0,
  dunningDay3: dunningDay3,
  dunningDay7: dunningDay7,
  dunningDay14: dunningDay14
};
 + rev + '</div>'
    + '<div style="font-size:14px;color:' + trendColor + ';font-weight:600;margin-top:8px">' + arrow + ' ' + Math.abs(pct) + '% vs last month (
  paymentLink: paymentLink,
  paymentReceipt: paymentReceipt,
  bookingConfirmed: bookingConfirmed,
  businessConfirmed: businessConfirmed,
  welcome: welcome,
  quickWin: quickWin,
  socialProof: socialProof,
  featureSpotlight: featureSpotlight,
  checkIn: checkIn,
  dunningDay0: dunningDay0,
  dunningDay3: dunningDay3,
  dunningDay7: dunningDay7,
  dunningDay14: dunningDay14
};
 + prevRev + ')</div>'
    + '</div>'

    + '<div style="background:' + GLASS + ';border-radius:12px;overflow:hidden;margin-bottom:24px;border:1px solid ' + BORDER + '">'
    + '<table cellpadding="0" cellspacing="0" border="0" width="100%"><tr>'
    + '<td style="padding:18px;text-align:center;width:33%"><div style="font-size:11px;color:' + MUTED + ';text-transform:uppercase;letter-spacing:.6px;margin-bottom:4px;font-weight:600">Bookings</div><div style="font-size:22px;font-weight:800;color:' + DARK + '">' + (data.bookings || 0) + '</div></td>'
    + '<td style="padding:18px;text-align:center;width:33%;border-left:1px solid ' + BORDER + ';border-right:1px solid ' + BORDER + '"><div style="font-size:11px;color:' + MUTED + ';text-transform:uppercase;letter-spacing:.6px;margin-bottom:4px;font-weight:600">Completion</div><div style="font-size:22px;font-weight:800;color:' + DARK + '">' + (data.completionRate || 0) + '%</div></td>'
    + '<td style="padding:18px;text-align:center;width:33%"><div style="font-size:11px;color:' + MUTED + ';text-transform:uppercase;letter-spacing:.6px;margin-bottom:4px;font-weight:600">Payouts</div><div style="font-size:22px;font-weight:800;color:' + GREEN + '">
  paymentLink: paymentLink,
  paymentReceipt: paymentReceipt,
  bookingConfirmed: bookingConfirmed,
  businessConfirmed: businessConfirmed,
  welcome: welcome,
  quickWin: quickWin,
  socialProof: socialProof,
  featureSpotlight: featureSpotlight,
  checkIn: checkIn,
  dunningDay0: dunningDay0,
  dunningDay3: dunningDay3,
  dunningDay7: dunningDay7,
  dunningDay14: dunningDay14
};
 + parseFloat(data.payouts || 0).toFixed(0) + '</div></td>'
    + '</tr></table></div>'

    + '<a href="' + (data.dashUrl || 'https://sortora.com/dashboard.html') + '" style="display:inline-block;padding:12px 28px;background:' + BRAND + ';color:#fff;border-radius:10px;font-size:14px;font-weight:700;text-decoration:none">View full analytics</a>'
    + '</div>');
}


/* \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
 *  24. PAYMENT REMINDER \u2014 nudge unpaid participants
 * \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 */
function paymentReminder(data) {
  var amt = parseFloat(data.amount).toFixed(2);
  return wrapper(header('Payment Reminder')
    + '<div style="padding:36px 40px">'
    + '<p style="font-size:15px;color:' + GRAY + ';line-height:1.7;margin:0 0 16px;font-weight:500">Hey ' + data.name + ',</p>'
    + '<p style="font-size:15px;color:' + GRAY + ';line-height:1.7;margin:0 0 20px;font-weight:500">Friendly reminder \u2014 you still have an outstanding share to pay for:</p>'
    + '<div style="background:' + GLASS + ';border-radius:12px;padding:20px 24px;margin-bottom:24px;border:1px solid ' + BORDER + '">'
    + '<div style="font-size:16px;font-weight:700;color:' + DARK + ';margin-bottom:6px">' + data.bookingTitle + '</div>'
    + '<div style="font-size:14px;color:' + GRAY + ';font-weight:500">with ' + (data.businessName || 'the organizer') + '</div>'
    + '<div style="margin-top:12px;padding-top:12px;border-top:1px solid ' + BORDER + '">'
    + '<table cellpadding="0" cellspacing="0" border="0" width="100%"><tr>'
    + '<td style="font-size:13px;color:' + MUTED + ';font-weight:500">Your share</td>'
    + '<td style="font-size:18px;font-weight:800;color:' + DARK + ';text-align:right">
  paymentLink: paymentLink,
  paymentReceipt: paymentReceipt,
  bookingConfirmed: bookingConfirmed,
  businessConfirmed: businessConfirmed,
  welcome: welcome,
  quickWin: quickWin,
  socialProof: socialProof,
  featureSpotlight: featureSpotlight,
  checkIn: checkIn,
  dunningDay0: dunningDay0,
  dunningDay3: dunningDay3,
  dunningDay7: dunningDay7,
  dunningDay14: dunningDay14
};
 + amt + '</td>'
    + '</tr></table></div>'
    + '<div style="margin-top:8px;font-size:13px;color:' + MUTED + ';font-weight:500">' + (data.paidCount || 0) + ' of ' + (data.totalCount || 0) + ' people have paid</div>'
    + '</div>'
    + '<a href="' + data.payUrl + '" style="display:inline-block;padding:14px 36px;background:' + BRAND + ';color:#fff;border-radius:10px;font-size:15px;font-weight:700;text-decoration:none">Pay your share &rarr;</a>'
    + (data.expiresIn ? '<p style="font-size:13px;color:#f59e0b;margin:16px 0 0;font-weight:600">\u23f0 This split expires in ' + data.expiresIn + '</p>' : '')
    + '</div>');
}

module.exports = {
  paymentLink: paymentLink,
  paymentReceipt: paymentReceipt,
  bookingConfirmed: bookingConfirmed,
  businessConfirmed: businessConfirmed,
  welcome: welcome,
  quickWin: quickWin,
  socialProof: socialProof,
  featureSpotlight: featureSpotlight,
  checkIn: checkIn,
  dunningDay0: dunningDay0,
  dunningDay3: dunningDay3,
  dunningDay7: dunningDay7,
  dunningDay14: dunningDay14,
  expiringCard: expiringCard,
  widgetNudge: widgetNudge,
  payoutNotification: payoutNotification,
  weeklyDigest: weeklyDigest,
  milestone: milestone,
  reengageDay7: reengageDay7,
  reengageDay14: reengageDay14,
  reengageDay30: reengageDay30,
  featureDiscovery: featureDiscovery,
  monthlySummary: monthlySummary,
  paymentReminder: paymentReminder
};
 + amt + '</div>'
    + '<div style="font-size:14px;color:' + GRAY + ';margin-bottom:24px;font-weight:500">should arrive in ' + (data.arrivalDays || '2-3') + ' business days</div>'
    + '<div style="background:' + GLASS + ';border-radius:12px;padding:16px 20px;margin-bottom:24px;border:1px solid ' + BORDER + ';text-align:left">'
    + '<table cellpadding="0" cellspacing="0" border="0" width="100%">'
    + '<tr><td style="padding:6px 0;font-size:13px;color:' + MUTED + ';font-weight:500">Bookings included</td><td style="padding:6px 0;font-size:13px;color:' + DARK + ';font-weight:600;text-align:right">' + (data.bookingCount || '—') + '</td></tr>'
    + '<tr><td style="padding:6px 0;font-size:13px;color:' + MUTED + ';font-weight:500">Period</td><td style="padding:6px 0;font-size:13px;color:' + DARK + ';font-weight:600;text-align:right">' + (data.period || '—') + '</td></tr>'
    + '<tr><td style="padding:6px 0;font-size:13px;color:' + MUTED + ';font-weight:500">Destination</td><td style="padding:6px 0;font-size:13px;color:' + DARK + ';font-weight:600;text-align:right">\u2022\u2022\u2022\u2022 ' + (data.last4Bank || '****') + '</td></tr>'
    + '</table></div>'
    + '<a href="' + (data.dashUrl || 'https://sortora.com/dashboard.html') + '" style="display:inline-block;padding:12px 28px;background:' + BRAND + ';color:#fff;border-radius:10px;font-size:14px;font-weight:700;text-decoration:none">View in dashboard</a>'
    + '</div>');
}

/* ═══════════════════════════════════════════════════
 *  17. WEEKLY ACTIVITY DIGEST
 * ═══════════════════════════════════════════════════ */
function weeklyDigest(data) {
  var rev = parseFloat(data.revenue || 0).toFixed(0);
  var prevRev = parseFloat(data.prevRevenue || 0).toFixed(0);
  var pct = data.prevRevenue > 0 ? Math.round((data.revenue - data.prevRevenue) / data.prevRevenue * 100) : 0;
  var arrow = pct >= 0 ? '\u2191' : '\u2193';
  var trendColor = pct >= 0 ? GREEN : '#EF4444';

  return wrapper(header('Weekly Digest')
    + '<div style="padding:36px 40px">'
    + '<p style="font-size:20px;font-weight:800;color:' + DARK + ';margin:0 0 6px;letter-spacing:-.3px">Your week at a glance</p>'
    + '<p style="font-size:13px;color:' + MUTED + ';margin:0 0 24px;font-weight:500">' + (data.weekRange || 'This week') + '</p>'

    + '<div style="background:' + GLASS + ';border-radius:12px;overflow:hidden;margin-bottom:24px;border:1px solid ' + BORDER + '">'
    + '<table cellpadding="0" cellspacing="0" border="0" width="100%">'
    + '<tr>'
    + '<td style="padding:20px;text-align:center;width:50%;border-bottom:1px solid ' + BORDER + '"><div style="font-size:11px;color:' + MUTED + ';text-transform:uppercase;letter-spacing:.8px;margin-bottom:4px;font-weight:600">Revenue</div><div style="font-size:24px;font-weight:800;color:' + DARK + '">
  paymentLink: paymentLink,
  paymentReceipt: paymentReceipt,
  bookingConfirmed: bookingConfirmed,
  businessConfirmed: businessConfirmed,
  welcome: welcome,
  quickWin: quickWin,
  socialProof: socialProof,
  featureSpotlight: featureSpotlight,
  checkIn: checkIn,
  dunningDay0: dunningDay0,
  dunningDay3: dunningDay3,
  dunningDay7: dunningDay7,
  dunningDay14: dunningDay14
};
 + rev + '</div><div style="font-size:12px;color:' + trendColor + ';font-weight:600;margin-top:4px">' + arrow + ' ' + Math.abs(pct) + '% vs last week</div></td>'
    + '<td style="padding:20px;text-align:center;width:50%;border-bottom:1px solid ' + BORDER + ';border-left:1px solid ' + BORDER + '"><div style="font-size:11px;color:' + MUTED + ';text-transform:uppercase;letter-spacing:.8px;margin-bottom:4px;font-weight:600">Bookings</div><div style="font-size:24px;font-weight:800;color:' + DARK + '">' + (data.bookings || 0) + '</div><div style="font-size:12px;color:' + MUTED + ';font-weight:500;margin-top:4px">' + (data.confirmedBookings || 0) + ' confirmed</div></td>'
    + '</tr>'
    + '<tr>'
    + '<td style="padding:20px;text-align:center;width:50%"><div style="font-size:11px;color:' + MUTED + ';text-transform:uppercase;letter-spacing:.8px;margin-bottom:4px;font-weight:600">Completion Rate</div><div style="font-size:24px;font-weight:800;color:' + DARK + '">' + (data.completionRate || 0) + '%</div></td>'
    + '<td style="padding:20px;text-align:center;width:50%;border-left:1px solid ' + BORDER + '"><div style="font-size:11px;color:' + MUTED + ';text-transform:uppercase;letter-spacing:.8px;margin-bottom:4px;font-weight:600">Avg Group Size</div><div style="font-size:24px;font-weight:800;color:' + DARK + '">' + (data.avgGroupSize || '—') + '</div></td>'
    + '</tr></table></div>'

    + (data.topExperience ? '<div style="background:rgba(59,107,255,.04);border-radius:10px;padding:14px 20px;margin-bottom:24px;border:1px solid rgba(59,107,255,.12)"><span style="font-size:12px;color:' + BRAND + ';font-weight:700">TOP EXPERIENCE: </span><span style="font-size:13px;color:' + DARK + ';font-weight:600">' + data.topExperience + '</span></div>' : '')

    + '<a href="' + (data.dashUrl || 'https://sortora.com/dashboard.html') + '" style="display:inline-block;padding:12px 28px;background:' + BRAND + ';color:#fff;border-radius:10px;font-size:14px;font-weight:700;text-decoration:none">View full dashboard</a>'
    + '</div>');
}


/* ═══════════════════════════════════════════════════
 *  18. MILESTONE CELEBRATION
 * ═══════════════════════════════════════════════════ */
function milestone(data) {
  return wrapper(header('Milestone Reached!')
    + '<div style="padding:48px 40px;text-align:center">'
    + '<div style="font-size:48px;margin-bottom:16px">\ud83c\udf89</div>'
    + '<div style="font-size:22px;font-weight:800;color:' + DARK + ';letter-spacing:-.4px;margin-bottom:8px">' + data.title + '</div>'
    + '<div style="font-size:15px;color:' + GRAY + ';line-height:1.6;margin-bottom:24px;font-weight:500">' + data.message + '</div>'
    + '<div style="background:rgba(59,107,255,.04);border-radius:12px;padding:28px;margin-bottom:24px;display:inline-block;min-width:200px;border:1px solid rgba(59,107,255,.12)">'
    + '<div style="font-size:40px;font-weight:800;color:' + BRAND + ';letter-spacing:-1px;line-height:1">' + data.stat + '</div>'
    + '<div style="font-size:13px;color:' + MUTED + ';margin-top:8px;font-weight:500">' + data.statLabel + '</div>'
    + '</div>'
    + '<div><a href="' + (data.dashUrl || 'https://sortora.com/dashboard.html') + '" style="display:inline-block;padding:12px 28px;background:' + BRAND + ';color:#fff;border-radius:10px;font-size:14px;font-weight:700;text-decoration:none">View dashboard</a></div>'
    + '</div>');
}

/* ═══════════════════════════════════════════════════
 *  19. RE-ENGAGEMENT — Day 7 inactive
 * ═══════════════════════════════════════════════════ */
function reengageDay7(data) {
  return wrapper(header('We Miss You')
    + '<div style="padding:36px 40px">'
    + '<p style="font-size:15px;color:' + GRAY + ';line-height:1.7;margin:0 0 16px;font-weight:500">Hey ' + data.name + ',</p>'
    + '<p style="font-size:15px;color:' + GRAY + ';line-height:1.7;margin:0 0 20px;font-weight:500">It\u2019s been about a week since you\u2019ve logged in. Just wanted to make sure everything\u2019s working well with ' + data.businessName + '\u2019s split payments.</p>'
    + '<p style="font-size:15px;color:' + GRAY + ';line-height:1.7;margin:0 0 24px;font-weight:500">Here\u2019s what you might have missed:</p>'
    + '<div style="background:' + GLASS + ';border-radius:12px;padding:20px 24px;margin-bottom:24px;border:1px solid ' + BORDER + '">'
    + '<div style="font-size:14px;color:' + DARK + ';line-height:1.7;font-weight:500">\u2022 Any pending split payments from your customers<br>\u2022 Potential payouts waiting to be reviewed<br>\u2022 Dashboard insights about your booking trends</div></div>'
    + '<a href="' + (data.dashUrl || 'https://sortora.com/dashboard.html') + '" style="display:inline-block;padding:14px 36px;background:' + BRAND + ';color:#fff;border-radius:10px;font-size:15px;font-weight:700;text-decoration:none">Check my dashboard &rarr;</a>'
    + '</div>');
}

/* ═══════════════════════════════════════════════════
 *  20. RE-ENGAGEMENT — Day 14 inactive
 * ═══════════════════════════════════════════════════ */
function reengageDay14(data) {
  return wrapper(header('Quick Check-In')
    + '<div style="padding:36px 40px">'
    + '<p style="font-size:15px;color:' + GRAY + ';line-height:1.7;margin:0 0 16px;font-weight:500">Hey ' + data.name + ',</p>'
    + '<p style="font-size:15px;color:' + GRAY + ';line-height:1.7;margin:0 0 20px;font-weight:500">It\u2019s been a couple weeks. If you\u2019re having any trouble getting set up, I\u2019m here to help.</p>'
    + '<p style="font-size:15px;color:' + GRAY + ';line-height:1.7;margin:0 0 24px;font-weight:500">Some businesses find it helpful to do a quick 10-minute setup call. Want me to walk you through embedding the widget? Just reply to this email.</p>'
    + '<a href="' + (data.dashUrl || 'https://sortora.com/dashboard.html') + '" style="display:inline-block;padding:14px 36px;background:' + BRAND + ';color:#fff;border-radius:10px;font-size:15px;font-weight:700;text-decoration:none">Back to dashboard &rarr;</a>'
    + '<p style="font-size:15px;color:' + DARK + ';margin:24px 0 0;font-weight:600">Riley Buell</p>'
    + '<p style="font-size:13px;color:' + MUTED + ';margin:2px 0 0;font-weight:500">Founder, Sortora</p>'
    + '</div>');
}

/* ═══════════════════════════════════════════════════
 *  21. RE-ENGAGEMENT — Day 30 inactive
 * ═══════════════════════════════════════════════════ */
function reengageDay30(data) {
  return wrapper(
    '<div style="padding:40px 40px 36px">'
    + '<p style="font-size:15px;color:' + DARK + ';line-height:1.75;margin:0 0 16px;font-weight:500">Hey ' + data.name + ',</p>'
    + '<p style="font-size:15px;color:' + GRAY + ';line-height:1.75;margin:0 0 16px;font-weight:500">It\u2019s been a month. I wanted to check in one more time \u2014 is Sortora still a fit for ' + data.businessName + '?</p>'
    + '<p style="font-size:15px;color:' + GRAY + ';line-height:1.75;margin:0 0 16px;font-weight:500">If the timing wasn\u2019t right, no worries at all. Your account and data will be here whenever you\u2019re ready.</p>'
    + '<p style="font-size:15px;color:' + GRAY + ';line-height:1.75;margin:0 0 16px;font-weight:500">If there\u2019s something we could do better, I\u2019d genuinely love to hear it. Just reply.</p>'
    + '<p style="font-size:15px;color:' + DARK + ';margin:24px 0 0;font-weight:600">Riley Buell</p>'
    + '<p style="font-size:13px;color:' + MUTED + ';margin:2px 0 0;font-weight:500">Founder, Sortora</p>'
    + '</div>');
}

/* ═══════════════════════════════════════════════════
 *  22. FEATURE DISCOVERY
 * ═══════════════════════════════════════════════════ */
function featureDiscovery(data) {
  return wrapper(header('Tip for ' + data.businessName)
    + '<div style="padding:36px 40px">'
    + '<p style="font-size:20px;font-weight:800;color:' + DARK + ';margin:0 0 12px;letter-spacing:-.3px">Have you tried ' + data.featureName + '?</p>'
    + '<p style="font-size:15px;color:' + GRAY + ';line-height:1.7;margin:0 0 24px;font-weight:500">' + data.featureDescription + '</p>'
    + '<div style="background:' + GLASS + ';border-radius:12px;padding:24px;margin-bottom:24px;border:1px solid ' + BORDER + '">'
    + '<div style="font-size:14px;font-weight:700;color:' + DARK + ';margin-bottom:8px">How to use it:</div>'
    + '<div style="font-size:13px;color:' + GRAY + ';line-height:1.7;font-weight:500">' + data.howTo + '</div></div>'
    + '<a href="' + (data.actionUrl || data.dashUrl || 'https://sortora.com/dashboard.html') + '" style="display:inline-block;padding:14px 36px;background:' + BRAND + ';color:#fff;border-radius:10px;font-size:15px;font-weight:700;text-decoration:none">' + (data.ctaText || 'Try it now') + ' &rarr;</a>'
    + '</div>');
}

/* ═══════════════════════════════════════════════════
 *  23. MONTHLY REVENUE SUMMARY
 * ═══════════════════════════════════════════════════ */
function monthlySummary(data) {
  var rev = parseFloat(data.revenue || 0).toFixed(0);
  var prevRev = parseFloat(data.prevRevenue || 0).toFixed(0);
  var pct = data.prevRevenue > 0 ? Math.round((data.revenue - data.prevRevenue) / data.prevRevenue * 100) : 0;
  var arrow = pct >= 0 ? '\u2191' : '\u2193';
  var trendColor = pct >= 0 ? GREEN : '#EF4444';

  return wrapper(header('Monthly Summary')
    + '<div style="padding:36px 40px">'
    + '<p style="font-size:20px;font-weight:800;color:' + DARK + ';margin:0 0 6px;letter-spacing:-.3px">' + (data.monthName || 'This month') + ' Summary</p>'
    + '<p style="font-size:13px;color:' + MUTED + ';margin:0 0 24px;font-weight:500">Here\u2019s how ' + data.businessName + ' did this month.</p>'

    + '<div style="background:rgba(59,107,255,.04);border-radius:12px;padding:28px;margin-bottom:24px;text-align:center;border:1px solid rgba(59,107,255,.12)">'
    + '<div style="font-size:11px;color:' + MUTED + ';text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;font-weight:600">Total Revenue</div>'
    + '<div style="font-size:44px;font-weight:800;color:' + DARK + ';letter-spacing:-1.5px;line-height:1">
  paymentLink: paymentLink,
  paymentReceipt: paymentReceipt,
  bookingConfirmed: bookingConfirmed,
  businessConfirmed: businessConfirmed,
  welcome: welcome,
  quickWin: quickWin,
  socialProof: socialProof,
  featureSpotlight: featureSpotlight,
  checkIn: checkIn,
  dunningDay0: dunningDay0,
  dunningDay3: dunningDay3,
  dunningDay7: dunningDay7,
  dunningDay14: dunningDay14
};
 + rev + '</div>'
    + '<div style="font-size:14px;color:' + trendColor + ';font-weight:600;margin-top:8px">' + arrow + ' ' + Math.abs(pct) + '% vs last month (
  paymentLink: paymentLink,
  paymentReceipt: paymentReceipt,
  bookingConfirmed: bookingConfirmed,
  businessConfirmed: businessConfirmed,
  welcome: welcome,
  quickWin: quickWin,
  socialProof: socialProof,
  featureSpotlight: featureSpotlight,
  checkIn: checkIn,
  dunningDay0: dunningDay0,
  dunningDay3: dunningDay3,
  dunningDay7: dunningDay7,
  dunningDay14: dunningDay14
};
 + prevRev + ')</div>'
    + '</div>'

    + '<div style="background:' + GLASS + ';border-radius:12px;overflow:hidden;margin-bottom:24px;border:1px solid ' + BORDER + '">'
    + '<table cellpadding="0" cellspacing="0" border="0" width="100%"><tr>'
    + '<td style="padding:18px;text-align:center;width:33%"><div style="font-size:11px;color:' + MUTED + ';text-transform:uppercase;letter-spacing:.6px;margin-bottom:4px;font-weight:600">Bookings</div><div style="font-size:22px;font-weight:800;color:' + DARK + '">' + (data.bookings || 0) + '</div></td>'
    + '<td style="padding:18px;text-align:center;width:33%;border-left:1px solid ' + BORDER + ';border-right:1px solid ' + BORDER + '"><div style="font-size:11px;color:' + MUTED + ';text-transform:uppercase;letter-spacing:.6px;margin-bottom:4px;font-weight:600">Completion</div><div style="font-size:22px;font-weight:800;color:' + DARK + '">' + (data.completionRate || 0) + '%</div></td>'
    + '<td style="padding:18px;text-align:center;width:33%"><div style="font-size:11px;color:' + MUTED + ';text-transform:uppercase;letter-spacing:.6px;margin-bottom:4px;font-weight:600">Payouts</div><div style="font-size:22px;font-weight:800;color:' + GREEN + '">
  paymentLink: paymentLink,
  paymentReceipt: paymentReceipt,
  bookingConfirmed: bookingConfirmed,
  businessConfirmed: businessConfirmed,
  welcome: welcome,
  quickWin: quickWin,
  socialProof: socialProof,
  featureSpotlight: featureSpotlight,
  checkIn: checkIn,
  dunningDay0: dunningDay0,
  dunningDay3: dunningDay3,
  dunningDay7: dunningDay7,
  dunningDay14: dunningDay14
};
 + parseFloat(data.payouts || 0).toFixed(0) + '</div></td>'
    + '</tr></table></div>'

    + '<a href="' + (data.dashUrl || 'https://sortora.com/dashboard.html') + '" style="display:inline-block;padding:12px 28px;background:' + BRAND + ';color:#fff;border-radius:10px;font-size:14px;font-weight:700;text-decoration:none">View full analytics</a>'
    + '</div>');
}


/* \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
 *  24. PAYMENT REMINDER \u2014 nudge unpaid participants
 * \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 */
function paymentReminder(data) {
  var amt = parseFloat(data.amount).toFixed(2);
  return wrapper(header('Payment Reminder')
    + '<div style="padding:36px 40px">'
    + '<p style="font-size:15px;color:' + GRAY + ';line-height:1.7;margin:0 0 16px;font-weight:500">Hey ' + data.name + ',</p>'
    + '<p style="font-size:15px;color:' + GRAY + ';line-height:1.7;margin:0 0 20px;font-weight:500">Friendly reminder \u2014 you still have an outstanding share to pay for:</p>'
    + '<div style="background:' + GLASS + ';border-radius:12px;padding:20px 24px;margin-bottom:24px;border:1px solid ' + BORDER + '">'
    + '<div style="font-size:16px;font-weight:700;color:' + DARK + ';margin-bottom:6px">' + data.bookingTitle + '</div>'
    + '<div style="font-size:14px;color:' + GRAY + ';font-weight:500">with ' + (data.businessName || 'the organizer') + '</div>'
    + '<div style="margin-top:12px;padding-top:12px;border-top:1px solid ' + BORDER + '">'
    + '<table cellpadding="0" cellspacing="0" border="0" width="100%"><tr>'
    + '<td style="font-size:13px;color:' + MUTED + ';font-weight:500">Your share</td>'
    + '<td style="font-size:18px;font-weight:800;color:' + DARK + ';text-align:right">
  paymentLink: paymentLink,
  paymentReceipt: paymentReceipt,
  bookingConfirmed: bookingConfirmed,
  businessConfirmed: businessConfirmed,
  welcome: welcome,
  quickWin: quickWin,
  socialProof: socialProof,
  featureSpotlight: featureSpotlight,
  checkIn: checkIn,
  dunningDay0: dunningDay0,
  dunningDay3: dunningDay3,
  dunningDay7: dunningDay7,
  dunningDay14: dunningDay14
};
 + amt + '</td>'
    + '</tr></table></div>'
    + '<div style="margin-top:8px;font-size:13px;color:' + MUTED + ';font-weight:500">' + (data.paidCount || 0) + ' of ' + (data.totalCount || 0) + ' people have paid</div>'
    + '</div>'
    + '<a href="' + data.payUrl + '" style="display:inline-block;padding:14px 36px;background:' + BRAND + ';color:#fff;border-radius:10px;font-size:15px;font-weight:700;text-decoration:none">Pay your share &rarr;</a>'
    + (data.expiresIn ? '<p style="font-size:13px;color:#f59e0b;margin:16px 0 0;font-weight:600">\u23f0 This split expires in ' + data.expiresIn + '</p>' : '')
    + '</div>');
}

module.exports = {
  paymentLink: paymentLink,
  paymentReceipt: paymentReceipt,
  bookingConfirmed: bookingConfirmed,
  businessConfirmed: businessConfirmed,
  welcome: welcome,
  quickWin: quickWin,
  socialProof: socialProof,
  featureSpotlight: featureSpotlight,
  checkIn: checkIn,
  dunningDay0: dunningDay0,
  dunningDay3: dunningDay3,
  dunningDay7: dunningDay7,
  dunningDay14: dunningDay14
};
