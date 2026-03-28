/**
 * Sortora Email Templates
 * Consistent branded emails for all transactional flows
 */

var BRAND = '#3B6BFF';
var DARK = '#0C1220';
var GRAY = '#6a6a6a';
var LIGHT_BG = '#f7f8fa';
var GREEN = '#10B981';

function wrapper(content) {
  return '<!DOCTYPE html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>'
    + '<body style="margin:0;padding:0;background:' + LIGHT_BG + ';font-family:-apple-system,BlinkMacSystemFont,\'Segoe UI\',Roboto,sans-serif;-webkit-font-smoothing:antialiased">'
    + '<div style="max-width:520px;margin:0 auto;padding:40px 20px">'
    // Logo header
    + '<div style="text-align:center;margin-bottom:24px">'
    + '<a href="https://sortora.com" style="display:inline-flex;align-items:center;gap:6px;text-decoration:none">'
    + '<svg width="22" height="22" viewBox="0 0 44 44" fill="none"><circle cx="11" cy="32" r="6" stroke="' + DARK + '" stroke-width="1.5" fill="none"/><circle cx="33" cy="32" r="6" stroke="' + DARK + '" stroke-width="1.5" fill="none"/><circle cx="22" cy="10" r="6.5" fill="' + DARK + '"/><path d="M11 26 C11 6, 33 6, 33 26" stroke="' + DARK + '" stroke-width="1.4" fill="none" stroke-linecap="round"/></svg>'
    + '<span style="font-size:18px;font-weight:800;color:' + DARK + ';letter-spacing:-.5px">Sortora</span>'
    + '</a></div>'
    // Card
    + '<div style="background:#fff;border-radius:16px;overflow:hidden;border:1px solid #EBEBEB;box-shadow:0 4px 24px rgba(0,0,0,.04)">'
    + content
    + '</div>'
    // Footer
    + '<div style="text-align:center;margin-top:24px;font-size:11px;color:#b0b0b0;line-height:1.5">'
    + '<a href="https://sortora.com" style="color:' + GRAY + ';font-weight:600;text-decoration:none">sortora.com</a>'
    + ' · Split payments for group bookings'
    + '</div>'
    + '</div></body></html>';
}

// ═══ PAYMENT LINK — sent to each participant ═══
function paymentLink(data) {
  var amount = parseFloat(data.amount).toFixed(2);
  var totalFormatted = parseFloat(data.totalAmount).toFixed(0);

  return wrapper(
    // Header
    '<div style="padding:28px 32px;border-bottom:1px solid #f0f0f0">'
    + '<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:' + BRAND + ';margin-bottom:10px">You\'ve been invited to split a booking</div>'
    + '<div style="font-size:22px;font-weight:800;color:' + DARK + ';letter-spacing:-.02em">' + data.bookingTitle + '</div>'
    + '<div style="font-size:14px;color:' + GRAY + ';margin-top:6px">Hosted by ' + data.businessName + '</div>'
    + '</div>'
    // Amount
    + '<div style="padding:28px 32px;background:#fafbff;border-bottom:1px solid #f0f0f0">'
    + '<div style="font-size:12px;font-weight:600;color:' + GRAY + ';margin-bottom:4px">Your share</div>'
    + '<div style="font-size:44px;font-weight:800;color:' + DARK + ';letter-spacing:-.04em;line-height:1">$' + amount + '</div>'
    + '<div style="font-size:14px;color:' + GRAY + ';margin-top:8px">$' + totalFormatted + ' total · split ' + data.totalParticipants + ' ways</div>'
    + '</div>'
    // Button
    + '<div style="padding:32px;text-align:center">'
    + '<a href="' + data.payUrl + '" style="display:inline-block;padding:16px 56px;background:' + BRAND + ';color:#fff;border-radius:12px;font-size:17px;font-weight:700;text-decoration:none;letter-spacing:-.01em">Pay $' + amount + '</a>'
    + '<div style="margin-top:14px;font-size:12px;color:#b0b0b0">'
    + '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#b0b0b0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px;margin-right:3px"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>'
    + 'Secure payment powered by Stripe'
    + '</div>'
    + '</div>'
  );
}

// ═══ BOOKING CONFIRMED — sent to all participants ═══
function bookingConfirmed(data) {
  var totalFormatted = parseFloat(data.totalAmount).toFixed(0);

  return wrapper(
    '<div style="padding:48px 32px;text-align:center">'
    // Checkmark
    + '<div style="width:64px;height:64px;border-radius:50%;background:' + GREEN + ';display:inline-flex;align-items:center;justify-content:center;margin-bottom:20px">'
    + '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>'
    + '</div>'
    + '<div style="font-size:26px;font-weight:800;color:' + DARK + ';letter-spacing:-.03em;margin-bottom:10px">Booking confirmed!</div>'
    + '<div style="font-size:16px;color:' + GRAY + ';line-height:1.6;margin-bottom:24px">All ' + data.participantCount + ' participants have paid for <strong>' + data.bookingTitle + '</strong> with ' + data.businessName + '.</div>'
    // Details bar
    + '<div style="background:' + LIGHT_BG + ';border-radius:10px;padding:14px 20px;display:inline-block">'
    + '<span style="font-size:14px;color:' + GRAY + '">Total: <strong style="color:' + DARK + '">$' + totalFormatted + '</strong> · ' + data.participantCount + ' people</span>'
    + '</div>'
    + '</div>'
  );
}

// ═══ BUSINESS NOTIFICATION — sent to business owner ═══
function businessConfirmed(data) {
  var totalFormatted = parseFloat(data.totalAmount).toFixed(0);

  return wrapper(
    '<div style="padding:32px">'
    + '<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:' + GREEN + ';margin-bottom:12px">New booking confirmed</div>'
    + '<div style="font-size:26px;font-weight:800;color:' + DARK + ';letter-spacing:-.03em;margin-bottom:10px">' + data.bookingTitle + '</div>'
    + '<div style="font-size:16px;color:' + GRAY + ';line-height:1.6;margin-bottom:24px">All ' + data.participantCount + ' participants have paid. <strong style="color:' + DARK + '">$' + totalFormatted + '</strong> will be deposited to your Stripe account.</div>'
    // Stats row
    + '<div style="display:flex;gap:12px;margin-bottom:24px">'
    + '<div style="flex:1;background:' + LIGHT_BG + ';border-radius:10px;padding:14px;text-align:center"><div style="font-size:11px;color:' + GRAY + ';margin-bottom:2px">Total</div><div style="font-size:20px;font-weight:800;color:' + DARK + '">$' + totalFormatted + '</div></div>'
    + '<div style="flex:1;background:' + LIGHT_BG + ';border-radius:10px;padding:14px;text-align:center"><div style="font-size:11px;color:' + GRAY + ';margin-bottom:2px">Participants</div><div style="font-size:20px;font-weight:800;color:' + DARK + '">' + data.participantCount + '</div></div>'
    + '<div style="flex:1;background:' + LIGHT_BG + ';border-radius:10px;padding:14px;text-align:center"><div style="font-size:11px;color:' + GRAY + ';margin-bottom:2px">Status</div><div style="font-size:20px;font-weight:800;color:' + GREEN + '">Paid</div></div>'
    + '</div>'
    // CTA
    + '<a href="https://sortora.com/dashboard.html" style="display:inline-block;padding:14px 32px;background:' + BRAND + ';color:#fff;border-radius:10px;font-size:15px;font-weight:700;text-decoration:none">View in Dashboard</a>'
    + '</div>'
  );
}

module.exports = {
  paymentLink: paymentLink,
  bookingConfirmed: bookingConfirmed,
  businessConfirmed: businessConfirmed
};
