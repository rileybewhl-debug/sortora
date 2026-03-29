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


module.exports = {
  paymentLink: paymentLink,
  paymentReceipt: paymentReceipt,
  bookingConfirmed: bookingConfirmed,
  businessConfirmed: businessConfirmed
};
