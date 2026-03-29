/**
 * Sortora Email Templates
 */

var BRAND = '#3B6BFF';
var DARK = '#0C1220';
var GRAY = '#6a6a6a';
var LIGHT_BG = '#f7f8fa';
var GREEN = '#10B981';

function wrapper(content) {
  return '<!DOCTYPE html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>'
    + '<body style="margin:0;padding:0;background:' + LIGHT_BG + ';font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;-webkit-font-smoothing:antialiased">'
    + '<div style="max-width:520px;margin:0 auto;padding:40px 20px">'
    + '<div style="text-align:center;margin-bottom:24px">'
    + '<span style="font-size:18px;font-weight:800;color:' + DARK + ';letter-spacing:-.5px">Sortora</span>'
    + '</div>'
    + '<div style="background:#fff;border-radius:16px;overflow:hidden;border:1px solid #EBEBEB;box-shadow:0 4px 24px rgba(0,0,0,.04)">'
    + content
    + '</div>'
    + '<div style="text-align:center;margin-top:24px;font-size:11px;color:#b0b0b0;line-height:1.5">'
    + '<a href="https://sortora.com" style="color:' + GRAY + ';font-weight:600;text-decoration:none">sortora.com</a>'
    + '</div>'
    + '</div></body></html>';
}

function detailsBlock(data) {
  if (!data.date && !data.location) return '';
  var h = '<div style="background:' + LIGHT_BG + ';border-radius:10px;padding:14px 20px;margin-bottom:24px;text-align:left">';
  if (data.date) h += '<div style="font-size:13px;color:' + GRAY + ';margin-bottom:' + (data.location ? '4' : '0') + 'px"><strong style="color:' + DARK + '">Date:</strong> ' + data.date + '</div>';
  if (data.location) h += '<div style="font-size:13px;color:' + GRAY + '"><strong style="color:' + DARK + '">Location:</strong> ' + data.location + '</div>';
  h += '</div>';
  return h;
}

function paymentLink(data) {
  var amt = parseFloat(data.amount).toFixed(2);
  var tot = parseFloat(data.totalAmount).toFixed(0);
  return wrapper(
    '<div style="padding:28px 32px;border-bottom:1px solid #f0f0f0">'
    + '<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:' + BRAND + ';margin-bottom:10px">You have been invited to split a booking</div>'
    + '<div style="font-size:22px;font-weight:800;color:' + DARK + '">' + data.bookingTitle + '</div>'
    + '<div style="font-size:14px;color:' + GRAY + ';margin-top:6px">Hosted by ' + data.businessName + '</div>'
    + '</div>'
    + '<div style="padding:28px 32px;background:#fafbff;border-bottom:1px solid #f0f0f0">'
    + '<div style="font-size:12px;font-weight:600;color:' + GRAY + ';margin-bottom:4px">Your share</div>'
    + '<div style="font-size:44px;font-weight:800;color:' + DARK + ';line-height:1">$' + amt + '</div>'
    + '<div style="font-size:14px;color:' + GRAY + ';margin-top:8px">$' + tot + ' total split ' + data.totalParticipants + ' ways</div>'
    + '</div>'
    + '<div style="padding:32px;text-align:center">'
    + '<a href="' + data.payUrl + '" style="display:inline-block;padding:16px 56px;background:' + BRAND + ';color:#fff;border-radius:12px;font-size:17px;font-weight:700;text-decoration:none">Pay $' + amt + '</a>'
    + '<div style="margin-top:14px;font-size:12px;color:#b0b0b0">Secure payment powered by Stripe</div>'
    + '</div>'
  );
}

function bookingConfirmed(data) {
  var tot = parseFloat(data.totalAmount).toFixed(0);
  return wrapper(
    '<div style="padding:48px 32px;text-align:center">'
    + '<div style="width:64px;height:64px;border-radius:50%;background:' + GREEN + ';margin:0 auto 20px;text-align:center;line-height:64px"><span style="font-size:30px;color:#ffffff;font-family:Arial,sans-serif">&#10004;</span></div>'
    + '<div style="font-size:26px;font-weight:800;color:' + DARK + ';margin-bottom:10px">Booking confirmed!</div>'
    + '<div style="font-size:16px;color:' + GRAY + ';line-height:1.6;margin-bottom:16px">All ' + data.participantCount + ' participants have paid for <strong>' + data.bookingTitle + '</strong> with ' + data.businessName + '.</div>'
    + detailsBlock(data)
    + '<div style="background:' + LIGHT_BG + ';border-radius:10px;padding:14px 20px;display:inline-block">'
    + '<span style="font-size:14px;color:' + GRAY + '">Total: <strong style="color:' + DARK + '">$' + tot + '</strong> - ' + data.participantCount + ' people</span>'
    + '</div>'
    + '</div>'
  );
}

function businessConfirmed(data) {
  var tot = parseFloat(data.totalAmount).toFixed(0);
  return wrapper(
    '<div style="padding:32px">'
    + '<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:' + GREEN + ';margin-bottom:12px">New booking confirmed</div>'
    + '<div style="font-size:26px;font-weight:800;color:' + DARK + ';margin-bottom:10px">' + data.bookingTitle + '</div>'
    + '<div style="font-size:16px;color:' + GRAY + ';line-height:1.6;margin-bottom:16px">All ' + data.participantCount + ' participants have paid. <strong style="color:' + DARK + '">$' + tot + '</strong> will be deposited to your Stripe account.</div>'
    + detailsBlock(data)
    + '<a href="https://sortora.com/dashboard.html" style="display:inline-block;padding:14px 32px;background:' + BRAND + ';color:#fff;border-radius:10px;font-size:15px;font-weight:700;text-decoration:none">View in Dashboard</a>'
    + '</div>'
  );
}

module.exports = {
  paymentLink: paymentLink,
  bookingConfirmed: bookingConfirmed,
  businessConfirmed: businessConfirmed
};
