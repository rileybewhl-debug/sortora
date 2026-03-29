/**
 * Sortora Email Templates — Apple-inspired glass aesthetic
 */

var BRAND = '#3B6BFF';
var DARK = '#1D1D1F';
var GRAY = '#86868B';
var LIGHT = '#F5F5F7';
var GREEN = '#34C759';
var CARD_BG = '#FFFFFF';
var GLASS = '#F2F2F7';
var BORDER = 'rgba(0,0,0,.06)';

function wrapper(content) {
  return '<!DOCTYPE html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>'
    + '<body style="margin:0;padding:0;background:' + LIGHT + ';font-family:-apple-system,BlinkMacSystemFont,SF Pro Display,Segoe UI,Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale">'
    + '<div style="max-width:520px;margin:0 auto;padding:48px 20px">'
    // Logo
    + '<div style="text-align:center;margin-bottom:32px">'
    + '<span style="font-size:17px;font-weight:700;color:' + DARK + ';letter-spacing:-.3px">Sortora</span>'
    + '</div>'
    // Card with glass effect
    + '<div style="background:' + CARD_BG + ';border-radius:20px;overflow:hidden;border:1px solid ' + BORDER + ';box-shadow:0 2px 16px rgba(0,0,0,.04),0 0 1px rgba(0,0,0,.06)">'
    + content
    + '</div>'
    // Footer
    + '<div style="text-align:center;margin-top:32px;font-size:12px;color:' + GRAY + ';letter-spacing:.01em">'
    + '<a href="https://sortora.com" style="color:' + GRAY + ';text-decoration:none">sortora.com</a>'
    + '</div>'
    + '</div></body></html>';
}

function detailsBlock(data) {
  if (!data.date && !data.location) return '';
  var h = '<div style="background:' + GLASS + ';border-radius:14px;padding:16px 20px;margin:20px 0 0">';
  if (data.date) {
    h += '<table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:' + (data.location ? '8' : '0') + 'px"><tr>'
      + '<td style="font-size:13px;color:' + GRAY + ';letter-spacing:.01em;width:70px;vertical-align:top">Date</td>'
      + '<td style="font-size:13px;color:' + DARK + ';font-weight:500">' + data.date + '</td>'
      + '</tr></table>';
  }
  if (data.location) {
    h += '<table cellpadding="0" cellspacing="0" border="0" width="100%"><tr>'
      + '<td style="font-size:13px;color:' + GRAY + ';letter-spacing:.01em;width:70px;vertical-align:top">Location</td>'
      + '<td style="font-size:13px;color:' + DARK + ';font-weight:500">' + data.location + '</td>'
      + '</tr></table>';
  }
  h += '</div>';
  return h;
}

function paymentLink(data) {
  var amt = parseFloat(data.amount).toFixed(2);
  var tot = parseFloat(data.totalAmount).toFixed(0);
  return wrapper(
    // Header
    '<div style="padding:36px 32px 0;text-align:center">'
    + '<div style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.08em;color:' + BRAND + ';margin-bottom:16px">Split Payment</div>'
    + '<div style="font-size:22px;font-weight:700;color:' + DARK + ';letter-spacing:-.02em;line-height:1.25">' + data.bookingTitle + '</div>'
    + '<div style="font-size:14px;color:' + GRAY + ';margin-top:6px">with ' + data.businessName + '</div>'
    + '</div>'
    // Amount pill
    + '<div style="padding:28px 32px;text-align:center">'
    + '<div style="background:' + GLASS + ';border-radius:16px;padding:24px;display:inline-block;min-width:200px">'
    + '<div style="font-size:12px;font-weight:600;color:' + GRAY + ';text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px">Your share</div>'
    + '<div style="font-size:48px;font-weight:700;color:' + DARK + ';letter-spacing:-.04em;line-height:1">$' + amt + '</div>'
    + '<div style="font-size:13px;color:' + GRAY + ';margin-top:8px">$' + tot + ' total &middot; ' + data.totalParticipants + ' people</div>'
    + '</div>'
    + '</div>'
    // Button
    + '<div style="padding:0 32px 36px;text-align:center">'
    + '<a href="' + data.payUrl + '" style="display:inline-block;padding:16px 48px;background:' + BRAND + ';color:#fff;border-radius:14px;font-size:16px;font-weight:600;text-decoration:none;letter-spacing:-.01em">Pay your share</a>'
    + '<div style="margin-top:16px;font-size:12px;color:' + GRAY + '">Secure payment via Stripe</div>'
    + '</div>'
  );
}

function bookingConfirmed(data) {
  var tot = parseFloat(data.totalAmount).toFixed(0);
  return wrapper(
    '<div style="padding:48px 32px;text-align:center">'
    // Checkmark circle
    + '<div style="width:56px;height:56px;border-radius:50%;background:' + GREEN + ';margin:0 auto 24px;text-align:center;line-height:56px"><span style="font-size:28px;color:#ffffff;font-family:Arial,sans-serif">&#10003;</span></div>'
    + '<div style="font-size:24px;font-weight:700;color:' + DARK + ';letter-spacing:-.03em;margin-bottom:8px">Booking confirmed</div>'
    + '<div style="font-size:15px;color:' + GRAY + ';line-height:1.6;margin-bottom:4px">All ' + data.participantCount + ' participants have paid for</div>'
    + '<div style="font-size:17px;font-weight:600;color:' + DARK + ';margin-bottom:4px">' + data.bookingTitle + '</div>'
    + '<div style="font-size:15px;color:' + GRAY + ';margin-bottom:20px">with ' + data.businessName + '</div>'
    + detailsBlock(data)
    // Summary pill
    + '<div style="background:' + GLASS + ';border-radius:14px;padding:16px 24px;margin-top:20px;display:inline-block">'
    + '<table cellpadding="0" cellspacing="0" border="0"><tr>'
    + '<td style="padding:0 16px;text-align:center"><div style="font-size:11px;color:' + GRAY + ';text-transform:uppercase;letter-spacing:.04em;margin-bottom:2px">Total</div><div style="font-size:18px;font-weight:700;color:' + DARK + '">$' + tot + '</div></td>'
    + '<td style="width:1px;background:#D1D1D6;padding:0"></td>'
    + '<td style="padding:0 16px;text-align:center"><div style="font-size:11px;color:' + GRAY + ';text-transform:uppercase;letter-spacing:.04em;margin-bottom:2px">Split</div><div style="font-size:18px;font-weight:700;color:' + DARK + '">' + data.participantCount + ' people</div></td>'
    + '</tr></table>'
    + '</div>'
    + '</div>'
  );
}

function businessConfirmed(data) {
  var tot = parseFloat(data.totalAmount).toFixed(0);
  var perPerson = (parseFloat(data.totalAmount) / parseInt(data.participantCount)).toFixed(0);
  return wrapper(
    '<div style="padding:36px 32px">'
    // Header
    + '<div style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.08em;color:' + GREEN + ';margin-bottom:16px">Booking Confirmed</div>'
    + '<div style="font-size:24px;font-weight:700;color:' + DARK + ';letter-spacing:-.02em;margin-bottom:8px">' + data.bookingTitle + '</div>'
    + '<div style="font-size:15px;color:' + GRAY + ';line-height:1.6;margin-bottom:24px">All ' + data.participantCount + ' participants have paid.</div>'
    + detailsBlock(data)
    // Stats row
    + '<div style="background:' + GLASS + ';border-radius:14px;overflow:hidden;margin-bottom:28px">'
    + '<table cellpadding="0" cellspacing="0" border="0" width="100%"><tr>'
    + '<td style="padding:18px;text-align:center;width:33%"><div style="font-size:11px;color:' + GRAY + ';text-transform:uppercase;letter-spacing:.04em;margin-bottom:4px">Total</div><div style="font-size:22px;font-weight:700;color:' + DARK + '">$' + tot + '</div></td>'
    + '<td style="padding:18px;text-align:center;width:33%;border-left:1px solid #D1D1D6;border-right:1px solid #D1D1D6"><div style="font-size:11px;color:' + GRAY + ';text-transform:uppercase;letter-spacing:.04em;margin-bottom:4px">Per person</div><div style="font-size:22px;font-weight:700;color:' + DARK + '">$' + perPerson + '</div></td>'
    + '<td style="padding:18px;text-align:center;width:33%"><div style="font-size:11px;color:' + GRAY + ';text-transform:uppercase;letter-spacing:.04em;margin-bottom:4px">Status</div><div style="font-size:22px;font-weight:700;color:' + GREEN + '">Paid</div></td>'
    + '</tr></table>'
    + '</div>'
    // CTA
    + '<a href="https://sortora.com/dashboard.html" style="display:inline-block;padding:14px 32px;background:' + BRAND + ';color:#fff;border-radius:14px;font-size:15px;font-weight:600;text-decoration:none">View in Dashboard</a>'
    + '</div>'
  );
}

module.exports = {
  paymentLink: paymentLink,
  bookingConfirmed: bookingConfirmed,
  businessConfirmed: businessConfirmed
};
