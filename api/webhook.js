const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');
const { Resend } = require('resend');
const { setSecurityHeaders, alertError, dispatchWebhook } = require('./_security');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const emails = require('./_emails');
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

  var event;

  try {
    var rawBody = await getRawBody(req);
    var sig = req.headers['stripe-signature'];

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
  } catch (err) {
    console.error('Webhook parse error:', err);
    return res.status(400).json({ error: 'Invalid request body' });
  }

  // ── Idempotent processing: check if already handled ──
  var { data: existing } = await supabase
    .from('processed_events')
    .select('id')
    .eq('id', event.id)
    .single();

  if (existing) {
    console.log('Webhook already processed: ' + event.id);
    return res.status(200).json({ received: true, duplicate: true });
  }

  // Claim this event — insert first to prevent race conditions
  var { error: insertErr } = await supabase
    .from('processed_events')
    .insert({ id: event.id, event_type: event.type });

  if (insertErr && insertErr.code === '23505') {
    // Unique constraint violation — another instance already claimed it
    console.log('Webhook claimed by another instance: ' + event.id);
    return res.status(200).json({ received: true, duplicate: true });
  }
  // ── End idempotency check ──

  try {
    // PAYMENT COMPLETED
    if (event.type === 'checkout.session.completed') {
      var session = event.data.object;

      // Subscription checkout
      if (session.mode === 'subscription') {
        var bizId = session.metadata && session.metadata.sortora_business_id;
        var plan = session.metadata && session.metadata.sortora_plan;
        if (bizId && plan) {
          await supabase
            .from('businesses')
            .update({
              plan: plan,
              subscription_status: 'active',
              stripe_subscription_id: session.subscription
            })
            .eq('id', bizId);
          console.log('Subscription activated: ' + bizId + ' -> ' + plan);
        }
        
    
    // Handle payout notifications
    if (event.type === 'payout.paid') {
      try {
        var payout = event.data.object;
        var accountId = event.account;
        if (accountId) {
          var { data: payoutBiz } = await supabase
            .from('businesses')
            .select('id, email, owner_name, business_name')
            .eq('stripe_account_id', accountId)
            .single();
          if (payoutBiz && payoutBiz.email) {
            var payoutName = payoutBiz.owner_name || payoutBiz.business_name || 'there';
            var payoutHtml = emails.payoutNotification({
              name: payoutName,
              amount: (payout.amount / 100),
              arrivalDays: '2-3',
              dashUrl: 'https://sortora.com/dashboard.html'
            });
            await resendClient.emails.send({
              from: EMAIL_FROM, to: payoutBiz.email,
              subject: 'Payout of $' + (payout.amount / 100).toFixed(2) + ' is on its way',
              html: payoutHtml,
              tags: [{ name: 'category', value: 'payout-notification' }]
            });
          }
        }
      } catch (payoutErr) { console.error('Payout notification error:', payoutErr); }
    }

    // Track activation milestones
    try {
      if (event.type === 'checkout.session.completed' && event.data.object.metadata) {
        var meta = event.data.object.metadata;
        var bizId = meta.sortora_business_id;
        if (bizId) {
          var { data: biz } = await supabase.from('businesses').select('first_payment_at, first_split_at').eq('id', bizId).single();
          if (biz && !biz.first_payment_at) {
            await supabase.from('businesses').update({ first_payment_at: new Date().toISOString() }).eq('id', bizId);
          }
        }
      }
    } catch (metricErr) { console.error('Activation metric error:', metricErr); }

    return res.status(200).json({ received: true });
      }

      // Split payment checkout
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
          paid_at: new Date().toISOString()
        })
        .eq('id', participantId);

      // Dispatch webhook: payment.received
      try { var sessBiz = receiptSession && receiptSession.businesses; if (sessBiz) dispatchWebhook(supabase, bookingSessionId, "payment.received", { participantId: participantId, bookingId: bookingSessionId }); } catch(wd) {}

      // ── Send individual payment receipt ──
      var { data: paidParticipant } = await supabase
        .from('participants')
        .select('email, name, amount, paid_at')
        .eq('id', participantId)
        .single();

      var { data: receiptSession } = await supabase
        .from('booking_sessions')
        .select('title, total_amount, total_participants, booking_date, metadata, businesses(business_name)')
        .eq('id', bookingSessionId)
        .single();

      if (paidParticipant && paidParticipant.email && receiptSession) {
        var feePercent = 0.03;
        var shareAmount = parseFloat(paidParticipant.amount);
        var feeAmount = Math.round(shareAmount * feePercent * 100) / 100;
        var totalPaid = Math.round((shareAmount + feeAmount) * 100) / 100;

        resend.emails.send({
          from: 'Sortora <noreply@sortora.com>',
          to: paidParticipant.email,
          subject: 'Payment receipt \u2014 ' + receiptSession.title,
          html: emails.paymentReceipt({
            participantName: paidParticipant.name || null,
            amount: totalPaid,
            shareAmount: shareAmount,
            feeAmount: feeAmount,
            bookingTitle: receiptSession.title,
            businessName: receiptSession.businesses && receiptSession.businesses.business_name || 'Business',
            paidAt: paidParticipant.paid_at,
            receiptId: paymentIntentId,
            date: receiptSession.booking_date || (receiptSession.metadata && receiptSession.metadata.date) || null,
            location: receiptSession.metadata && receiptSession.metadata.location || null
          })
        }).catch(function(err) {
          console.error('Receipt email failed:', err);
        });
      }
      // ── End receipt email ──

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
        // Dispatch webhook: booking.confirmed
        try { dispatchWebhook(supabase, bookingSessionId, "booking.confirmed", { bookingId: bookingSessionId, paidCount: paidCount }); } catch(wd2) {}
        await sendConfirmationEmails(bookingSessionId, totalCount);
      }

      console.log('Webhook processed: participant ' + participantId + ' paid (' + paidCount + '/' + totalCount + ')');
    }

    // SUBSCRIPTION UPDATED
    if (event.type === 'customer.subscription.updated') {
      var sub = event.data.object;
      var bizId = sub.metadata && sub.metadata.sortora_business_id;
      if (bizId) {
        var status = sub.status === 'active' ? 'active' : (sub.status === 'past_due' ? 'expired' : sub.status);
        await supabase.from('businesses').update({ subscription_status: status }).eq('id', bizId);
        console.log('Subscription updated: ' + bizId + ' -> ' + status);
      }
    }

    // SUBSCRIPTION DELETED
    if (event.type === 'customer.subscription.deleted') {
      var sub = event.data.object;
      var bizId = sub.metadata && sub.metadata.sortora_business_id;
      if (bizId) {
        await supabase.from('businesses').update({ subscription_status: 'cancelled', plan: null }).eq('id', bizId);
        console.log('Subscription cancelled: ' + bizId);
      }
    }

    // PAYMENT FAILED
    if (event.type === 'invoice.payment_failed') {
      var invoice = event.data.object;
      var subId = invoice.subscription;
      if (subId) {
        var { data: biz } = await supabase.from('businesses').select('id').eq('stripe_subscription_id', subId).single();
        if (biz) {
          await supabase.from('businesses').update({ subscription_status: 'expired' }).eq('id', biz.id);
          console.log('Payment failed, subscription expired: ' + biz.id);
        }
      }
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('Webhook processing error:', err);
    alertError('webhook', err, req);

    // Store failed payload in dead letter queue for manual replay
    await supabase
      .from('failed_webhooks')
      .insert({
        event_id: event.id,
        event_type: event.type,
        payload: event,
        error_message: err.message || String(err)
      })
      .catch(function(dlqErr) {
        console.error('Dead letter queue insert failed:', dlqErr);
      });

    // Still return 200 — we already claimed the event. Returning 500
    // would trigger a Stripe retry that our idempotency check catches.
    return res.status(200).json({ received: true, error: 'Processing failed but event acknowledged' });
  }
};

async function sendConfirmationEmails(bookingSessionId, totalCount) {
  var { data: bookingSession } = await supabase
    .from('booking_sessions')
    .select('*, businesses(business_name, email)')
    .eq('id', bookingSessionId)
    .single();

  var { data: participants } = await supabase
    .from('participants')
    .select('email')
    .eq('booking_session_id', bookingSessionId);

  if (!bookingSession || !participants) return;

  var emailPromises = participants.map(function(p) {
    return resend.emails.send({
      from: 'Sortora <noreply@sortora.com>',
      to: p.email,
      subject: 'Booking confirmed! - ' + bookingSession.title,
      html: emails.bookingConfirmed({
        bookingTitle: bookingSession.title,
        businessName: bookingSession.businesses && bookingSession.businesses.business_name || 'Business',
        totalAmount: bookingSession.total_amount,
        participantCount: totalCount,
        date: bookingSession.booking_date || (bookingSession.metadata && bookingSession.metadata.date) || null,
        location: bookingSession.metadata && bookingSession.metadata.location || null
      })
    }).catch(function(err) {
      console.error('Confirmation email failed:', err);
    });
  });

  if (bookingSession.businesses && bookingSession.businesses.email) {
    emailPromises.push(
      resend.emails.send({
        from: 'Sortora <noreply@sortora.com>',
        to: bookingSession.businesses.email,
        subject: 'New booking confirmed - ' + bookingSession.title + ' ($' + parseFloat(bookingSession.total_amount).toFixed(0) + ')',
        html: emails.businessConfirmed({
          bookingTitle: bookingSession.title,
          totalAmount: bookingSession.total_amount,
          participantCount: totalCount,
          date: bookingSession.booking_date || (bookingSession.metadata && bookingSession.metadata.date) || null,
          location: bookingSession.metadata && bookingSession.metadata.location || null
        })
      }).catch(function(err) {
        console.error('Business email failed:', err);
      })
    );
  }

  await Promise.all(emailPromises);
}