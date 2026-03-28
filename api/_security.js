/**
 * Sortora API Security Module
 * - Rate limiting (in-memory per function instance)
 * - CORS lockdown (only allow Sortora domains)
 * - Input sanitization
 */

// ═══ CORS ═══
var ALLOWED_ORIGINS = [
  'https://sortora.com',
  'https://www.sortora.com',
  'https://sortora.vercel.app',
  'http://localhost:3000',
  'http://localhost:5500'
];

function corsCheck(req, res) {
  var origin = req.headers.origin || req.headers.referer || '';
  // Strip trailing slash and path from referer
  origin = origin.replace(/\/+$/, '').replace(/\/[^/]*$/, '').replace(/\/+$/, '');

  var allowed = ALLOWED_ORIGINS.some(function(o) {
    return origin === o || origin.startsWith(o);
  });

  // Allow requests with no origin (server-to-server, curl, Stripe webhooks)
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
    return false; // Signal: don't continue
  }

  if (!allowed && origin) {
    res.status(403).json({ error: 'Forbidden' });
    return false;
  }

  return true; // Signal: continue processing
}

// ═══ RATE LIMITING ═══
// In-memory store (resets on cold start, but effective per instance)
var rateLimitStore = {};

function rateLimit(key, maxRequests, windowMs) {
  maxRequests = maxRequests || 10;
  windowMs = windowMs || 60000; // 1 minute default

  var now = Date.now();

  // Clean old entries every 100 calls
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
    return false; // Rate limited
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
    .replace(/<[^>]*>/g, '')     // Strip HTML tags
    .replace(/[<>"'`;(){}]/g, ''); // Strip dangerous chars
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

module.exports = {
  corsCheck: corsCheck,
  applyRateLimit: applyRateLimit,
  sanitizeString: sanitizeString,
  sanitizeEmail: sanitizeEmail,
  sanitizeNumber: sanitizeNumber,
  sanitizeUUID: sanitizeUUID,
  setSecurityHeaders: setSecurityHeaders
};
