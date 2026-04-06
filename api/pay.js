const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');
const { corsCheck, applyRateLimit, sanitizeString, setSecurityHeaders, alertError } = require('./_security');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

module.exports = async function handler(req, res) {
  setSecurityHeaders(res);
  if (!corsCheck(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!applyRateLimit(req, res, 10, 60000)) return;

  try {
    var token = sanitizeString(req.body.token, 128);
    if (!token || token.length < 10) return res.status(400).json({ error: 'Invalid payment token' });

    var { data: participant } = await supabase
      .from('participants')
      .select('*')
      .eq('payment_token', token)
      .single();

    if (!participant) return res.status(404).json({ error: 'Payment link not found' });

    // ── Edge case: already paid (double-pay prevention) ──
    if (participant.status === 'paid') {
      return res.status(400).json({
        error: 'You\'ve already paid your share. No further action needed.',
        type: 'already_paid'
      });
    }

    var { data: session } = await supabase
      .from('booking_sessions')
      .select('*, businesses(stripe_account_id, business_name)')
      .eq('id', participant.booking_session_id)
      .single();

    if (!session) return res.status(404).json({ error: 'Booking session not found' });

    // ── Edge case: expired split ──
    if (session.status === 'expired') {
      return res.status(400).json({
        error: 'This split payment has expired. Contact the organizer for a new link.',
        type: 'expired'
      });
    }

    if (session.expires_at && new Date(session.expires_at) < new Date()) {
      // Auto-expire the session in the database
      await supabase
        .from('booking_sessions')
        .update({ status: 'expired' })
        .eq('id', session.id)
        .eq('status', 'pending');

      return res.status(400).json({
        error: 'This split payment has expired. Contact the organizer for a new link.',
        type: 'expired'
      });
    }

    // ── Edge case: booking already fully paid ──
    if (session.status === 'confirmed') {
      return res.status(400).json({
        error: 'This booking is already fully paid.',
        type: 'already_confirmed'
      });
    }

    var stripeAccountId = session.businesses && session.businesses.stripe_account_id;
    if (!stripeAccountId) return res.status(400).json({ error: 'Business has not connected Stripe yet' });

    var siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sortora.com';
    var amountCents = Math.round(parseFloat(participant.amount) * 100);
    var feePercent = 0.03;
    var applicationFee = Math.round(amountCents * feePercent);

    var checkoutSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: session.title,
            description: 'Your share — ' + session.businesses.business_name
          },
          unit_amount: amountCents
        },
        quantity: 1
      }],
      payment_intent_data: {
        application_fee_amount: applicationFee,
        setup_future_usage: session.auto_charge ? 'off_session' : undefined,
        transfer_data: { destination: stripeAccountId },
        metadata: {
          participant_id: participant.id,
          booking_session_id: session.id,
          payment_token: token
        }
      },
      success_url: siteUrl + '/pay.html?token=' + token + '&success=true',
      cancel_url: siteUrl + '/pay.html?token=' + token,
      customer_email: participant.email,
      metadata: {
        participant_id: participant.id,
        booking_session_id: session.id
      }
    }, {
      idempotencyKey: 'pay_' + token
    });

    return res.status(200).json({ url: checkoutSession.url });
  } catch (err) {
    // ── 4-Category Stripe Error Handling ──
    if (err.type === 'StripeCardError') {
      console.error('Card error:', err.message);
      return res.status(400).json({
        error: 'Your card was declined. Please try a different payment method.',
        code: err.code,
        type: 'card_error',
        retryable: true
      });
    }

    if (err.type === 'StripeInvalidRequestError') {
      console.error('Stripe API error:', err.message);
      alertError('pay', err, req);
      return res.status(400).json({
        error: 'There was a problem setting up your payment. Please try again.',
        type: 'api_error',
        retryable: true
      });
    }

    if (err.type === 'StripeAPIError') {
      console.error('Stripe server error:', err.message);
      alertError('pay', err, req);
      return res.status(502).json({
        error: 'Our payment processor is temporarily unavailable. Please try again in a moment.',
        type: 'server_error',
        retryable: true
      });
    }

    if (err.type === 'StripeConnectionError') {
      console.error('Stripe connection error:', err.message);
      alertError('pay', err, req);
      return res.status(503).json({
        error: 'Could not connect to payment processor. Please check your connection and try again.',
        type: 'network_error',
        retryable: true
      });
    }

    if (err.type === 'StripeRateLimitError') {
      console.error('Stripe rate limit:', err.message);
      return res.status(429).json({
        error: 'Too many payment requests. Please wait a moment and try again.',
        type: 'rate_limit',
        retryable: true
      });
    }

    if (err.type === 'StripeAuthenticationError') {
      console.error('Stripe auth error:', err.message);
      alertError('pay-critical', err, req);
      return res.status(500).json({
        error: 'Payment system configuration error. We\'ve been notified and are fixing it.',
        type: 'auth_error',
        retryable: false
      });
    }

    console.error('Pay error:', err);
    alertError('pay', err, req);
    return res.status(500).json({
      error: 'Something went wrong. Please try again.',
      type: 'internal_error',
      retryable: true
    });
  }
};
