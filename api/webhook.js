const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');
const { Resend } = require('resend');
const { setSecurityHeaders } = require('./_security');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const resend = new Resend(process.env.RESEND_API_KEY);

module.exports.config = { api: { bodyParser: false } };

function getRawBody(req) {
  return new Promise(function(resolve, reject) {
    var chunks = [];
    req.on('data', function(chunk) { chunks.push(chunk); });
    req.on('end', function() { resolve(Buffer.concat(chunks)); });
    req.on('error', reject);
  });
}

module.exports = async function handler(req, res) {
  setSecurityHeaders(res);
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    var rawBody = await getRawBody(req);
    var sig = req.headers['stripe-signature'];
    var event;

    if (process.env.STRIPE_WEBHOOK_SECRET) {
      try {
        event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
      } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).json({ error: 'Webhook signature verification failed' });
      }
    } else {
      event = JSON.parse(rawBody.toString());
    }

    if (event.type === 'checkout.session.completed') {
      var session = event.data.object;
      var participantId = session.metadata && session.metadata.participant_id;
      var bookingSessionId = session.metadata && session.metadata.booking_session_id;
      var paymentIntentId = session.payment_intent;

      if (!participantId || !bookingSessionId) {
        console.log('Webhook: no Sortora metadata, skipping');
        return res.status(200).json({ received: true });
      }

      await supabase
        .from('participants')
        .update({
          status: 'paid',
          stripe_payment_intent_id: paymentIntentId,
          paid_at: new Date().toISOString()
        })
        .eq('id', participantId);

      var { data: allParts } = await supabase
        .from('participants')
        .select('id, status')
        .eq('booking_session_id', bookingSessionId);

      var paidCount = (allParts || []).filter(function(p) { return p.status === 'paid'; }).length;
      var totalCount = (allParts || []).length;
      var updateData = { paid_count: paidCount };

      if (paidCount >= totalCount) {
        updateData.status = 'confirmed';
      }

      await supabase
        .from('booking_sessions')
        .update(updateData)
        .eq('id', bookingSessionId);

      if (paidCount >= totalCount) {
        var { data: bookingSession } = await supabase
          .from('booking_sessions')
          .select('*, businesses(business_name, email)')
          .eq('id', bookingSessionId)
          .single();

        var { data: participants } = await supabase
          .from('participants')
          .select('email')
          .eq('booking_session_id', bookingSessionId);

        if (bookingSession && participants) {
          var emailPromises = participants.map(function(p) {
            return resend.emails.send({
              from: 'Sortora <noreply@sortora.com>',
              to: p.email,
              subject: 'Booking confirmed! — ' + bookingSession.title,
              html: buildConfirmationEmail({
                bookingTitle: bookingSession.title,
                businessName: bookingSession.businesses && bookingSession.businesses.business_name || 'Business',
                totalAmount: bookingSession.total_amount,
                participantCount: totalCount
              })
            }).catch(function(err) { console.error('Confirmation email failed:', err); });
          });

          if (bookingSession.businesses && bookingSession.businesses.email) {
            emailPromises.push(
              resend.emails.send({
                from: 'Sortora <noreply@sortora.com>',
                to: bookingSession.businesses.email,
                subject: 'New booking confirmed — ' + bookingSession.title + ' ($' + parseFloat(bookingSession.total_amount).toFixed(0) + ')',
                html: buildBusinessConfirmEmail({
                  bookingTitle: bookingSession.title,
                  totalAmount: bookingSession.total_amount,
                  participantCount: totalCount
                })
              }).catch(function(err) { console.error('Business email failed:', err); })
            );
          }

          await Promise.all(emailPromises);
        }
      }

      console.log('Webhook processed: participant ' + participantId + ' paid (' + paidCount + '/' + totalCount + ')');
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

function buildConfirmationEmail(data) {
  return '<!DOCTYPE html><html><head><meta charset="utf-8"/></head><body style="margin:0;padding:0;background:#f7f8fa;font-family:-apple-system,BlinkMacSystemFont,sans-serif"><div style="max-width:480px;margin:0 auto;padding:40px 20px"><div style="background:#fff;border-radius:16px;overflow:hidden;border:1px solid #EBEBEB;text-align:center;padding:48px 32px"><div style="width:64px;height:64px;border-radius:50%;background:#10B981;display:inline-flex;align-items:center;justify-content:center;margin-bottom:20px"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div><div style="font-size:24px;font-weight:800;color:#0C1220;margin-bottom:8px">Booking confirmed!</div><div style="font-size:16px;color:#6a6a6a;line-height:1.5;margin-bottom:24px">All ' + data.participantCount + ' participants have paid for <strong>' + data.bookingTitle + '</strong> with ' + data.businessName + '.</div><div style="font-size:14px;color:#b0b0b0">Total: $' + parseFloat(data.totalAmount).toFixed(0) + ' · ' + data.participantCount + ' people</div></div><div style="text-align:center;margin-top:20px;font-size:12px;color:#b0b0b0">Powered by <a href="https://sortora.com" style="color:#6a6a6a;font-weight:700;text-decoration:none">Sortora</a></div></div></body></html>';
}

function buildBusinessConfirmEmail(data) {
  return '<!DOCTYPE html><html><head><meta charset="utf-8"/></head><body style="margin:0;padding:0;background:#f7f8fa;font-family:-apple-system,BlinkMacSystemFont,sans-serif"><div style="max-width:480px;margin:0 auto;padding:40px 20px"><div style="background:#fff;border-radius:16px;overflow:hidden;border:1px solid #EBEBEB;padding:36px 32px"><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#10B981;margin-bottom:12px">New booking confirmed</div><div style="font-size:24px;font-weight:800;color:#0C1220;margin-bottom:8px">' + data.bookingTitle + '</div><div style="font-size:16px;color:#6a6a6a;line-height:1.5;margin-bottom:20px">All ' + data.participantCount + ' participants have paid. Total of <strong>$' + parseFloat(data.totalAmount).toFixed(0) + '</strong> will be deposited to your Stripe account.</div><a href="https://sortora.com/dashboard.html" style="display:inline-block;padding:14px 32px;background:#3B6BFF;color:#fff;border-radius:10px;font-size:15px;font-weight:700;text-decoration:none">View in Dashboard</a></div></div></body></html>';
}
