/**
 * Sortora API Security Module
 * - Rate limiting (in-memory per function instance)
 * - CORS lockdown (only allow Sortora domains)
 * - Input sanitization
 * - Slack error alerts
 * - Sentry error tracking
 */

// ═══ SENTRY ═══
var Sentry;
try {
  Sentry = require('@sentry/node');
  if (process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.VERCEL_ENV || 'development',
      tracesSampleRate: 1.0,
      beforeSend: function(event) {
        // Strip sensitive data
        if (event.request && event.request.headers) {
          delete event.request.headers['authorization'];
          delete event.request.headers['cookie'];
        }
        return event;
      }
    });
  }
} catch (e) {
  // Sentry not installed — continue without it
  Sentry = null;
}

// ═══ CORS ═══
var ALLOWED_ORIGINS = [
  'https://sortora.com',
  'https://www.sortora.com',
  'https://sortora.vercel.app',
  'http://localhost:3000',
  'http://localhost:5500'
];

function corsCheck(req, res) {
  var origin = req.headers.origin || '';
  if (!origin && req.headers.referer) {
    try { origin = new URL(req.headers.referer).origin; } catch(e) { origin = ''; }
  }

  var allowed = ALLOWED_ORIGINS.some(function(o) {
    return origin === o || origin.startsWith(o);
  });

  if (!origin) allowed = true;

  if (allowed) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  } else {
    res.setHeader('Access-Control-Allow-Origin', 'https://sortora.com');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return false;
  }

  if (!allowed && origin) {
    res.status(403).json({ error: 'Forbidden' });
    return false;
  }

  return true;
}

// ═══ RATE LIMITING ═══
var rateLimitStore = {};

function rateLimit(key, maxRequests, windowMs) {
  maxRequests = maxRequests || 10;
  windowMs = windowMs || 60000;

  var now = Date.now();

  if (Math.random() < 0.01) {
    Object.keys(rateLimitStore).forEach(function(k) {
      if (rateLimitStore[k].resetAt < now) delete rateLimitStore[k];
    });
  }

  if (!rateLimitStore[key] || rateLimitStore[key].resetAt < now) {
    rateLimitStore[key] = { count: 1, resetAt: now + windowMs };
    return true;
  }

  rateLimitStore[key].count++;

  if (rateLimitStore[key].count > maxRequests) {
    return false;
  }

  return true;
}

function getRateLimitKey(req) {
  return req.headers['x-forwarded-for'] ||
         req.headers['x-real-ip'] ||
         req.connection.remoteAddress ||
         'unknown';
}

function applyRateLimit(req, res, maxRequests, windowMs) {
  var key = getRateLimitKey(req);
  if (!rateLimit(key, maxRequests, windowMs)) {
    res.status(429).json({ error: 'Too many requests. Please try again later.' });
    return false;
  }
  return true;
}

// ═══ INPUT VALIDATION ═══
function sanitizeString(str, maxLength) {
  if (typeof str !== 'string') return '';
  maxLength = maxLength || 500;
  return str
    .trim()
    .substring(0, maxLength)
    .replace(/<[^>]*>/g, '')
    .replace(/[<>"'`;(){}]/g, '');
}

function sanitizeEmail(email) {
  if (typeof email !== 'string') return '';
  email = email.trim().toLowerCase().substring(0, 254);
  var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return '';
  return email;
}

function sanitizeNumber(val, min, max) {
  var num = parseFloat(val);
  if (isNaN(num)) return null;
  if (min !== undefined && num < min) return null;
  if (max !== undefined && num > max) return null;
  return num;
}

function sanitizeUUID(str) {
  if (typeof str !== 'string') return '';
  str = str.trim();
  var uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(str)) return '';
  return str;
}

// ═══ SECURITY HEADERS ═══
function setSecurityHeaders(res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
}

// ═══ ERROR ALERTS (Slack + Sentry) ═══
var lastAlertTime = {};

function alertError(route, error, req) {
  // ── Sentry capture ──
  if (Sentry && process.env.SENTRY_DSN) {
    Sentry.withScope(function(scope) {
      scope.setTag('route', route);
      scope.setTag('method', req && req.method || 'unknown');
      scope.setExtra('ip', req ? getRateLimitKey(req) : 'unknown');
      scope.setExtra('url', req && req.url || 'unknown');
      if (error instanceof Error) {
        Sentry.captureException(error);
      } else {
        Sentry.captureMessage(String(error), 'error');
      }
    });
  }

  // ── Slack alert ──
  var webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) return;

  // Throttle: max 1 alert per route per 5 minutes
  var now = Date.now();
  if (lastAlertTime[route] && (now - lastAlertTime[route]) < 300000) return;
  lastAlertTime[route] = now;

  var ip = getRateLimitKey(req);
  var payload = {
    text: ':rotating_light: *Sortora API Error*',
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: ':rotating_light: *API Error — ' + route + '*\n```' + (error.message || String(error)).substring(0, 500) + '```'
        }
      },
      {
        type: 'context',
        elements: [
          { type: 'mrkdwn', text: '*Route:* ' + route + ' | *IP:* ' + ip + ' | *Time:* ' + new Date().toISOString() }
        ]
      }
    ]
  };

  fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }).catch(function() {});
}

// ═══ SENTRY FLUSH ═══
// Call before returning from serverless functions
// Ensures Sentry events are sent before the function instance freezes
async function flushSentry() {
  if (Sentry && process.env.SENTRY_DSN) {
    await Sentry.flush(2000);
  }
}



// Webhook dispatch — fires events to business webhook URLs
async function dispatchWebhook(supabase, businessId, eventType, payload) {
  try {
    var { data: biz } = await supabase
      .from('businesses')
      .select('webhook_url, webhook_events, webhook_secret')
      .eq('id', businessId)
      .single();

    if (!biz || !biz.webhook_url) return;

    // Check if this event type is enabled
    var events = biz.webhook_events || [];
    if (events.length > 0 && events.indexOf(eventType) === -1) return;

    var body = JSON.stringify({
      event: eventType,
      timestamp: new Date().toISOString(),
      data: payload
    });

    // Generate HMAC signature if secret is set
    var headers = { 'Content-Type': 'application/json', 'X-Sortora-Event': eventType };
    if (biz.webhook_secret) {
      var crypto = require('crypto');
      var sig = crypto.createHmac('sha256', biz.webhook_secret).update(body).digest('hex');
      headers['X-Sortora-Signature'] = 'sha256=' + sig;
    }

    // Fire and forget with timeout
    var controller = new AbortController();
    var timeout = setTimeout(function() { controller.abort(); }, 5000);
    await fetch(biz.webhook_url, {
      method: 'POST', headers: headers, body: body, signal: controller.signal
    }).catch(function() {});
    clearTimeout(timeout);

    // Log the delivery
    await supabase.from('webhook_deliveries').insert({
      business_id: businessId,
      event_type: eventType,
      payload: payload,
      status: 'delivered',
      delivered_at: new Date().toISOString()
    }).catch(function() {});
  } catch (err) {
    // Log failed delivery
    await supabase.from('webhook_deliveries').insert({
      business_id: businessId,
      event_type: eventType,
      payload: payload,
      status: 'failed',
      error: err.message
    }).catch(function() {});
  }
}

module.exports = {
  dispatchWebhook: dispatchWebhook,
  corsCheck: corsCheck,
  applyRateLimit: applyRateLimit,
  sanitizeString: sanitizeString,
  sanitizeEmail: sanitizeEmail,
  sanitizeNumber: sanitizeNumber,
  sanitizeUUID: sanitizeUUID,
  setSecurityHeaders: setSecurityHeaders,
  alertError: alertError,
  flushSentry: flushSentry
};
