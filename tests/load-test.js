// Sortora Load Test — k6
// Install: brew install k6
// Run: k6 run tests/load-test.js

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const BASE_URL = __ENV.BASE_URL || 'https://sortora.com';

// Custom metrics
const errorRate = new Rate('errors');
const checkoutDuration = new Trend('checkout_duration');

export const options = {
  stages: [
    { duration: '30s', target: 10 },   // Ramp up to 10 users
    { duration: '1m', target: 25 },    // Hold at 25 users
    { duration: '30s', target: 50 },   // Spike to 50
    { duration: '1m', target: 50 },    // Hold spike
    { duration: '30s', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'],  // 95% of requests under 2s
    errors: ['rate<0.05'],              // Error rate under 5%
    checkout_duration: ['p(95)<3000'],  // Checkout under 3s at p95
  },
};

// Test 1: Landing page load
export function landingPage() {
  const res = http.get(BASE_URL + '/');
  check(res, {
    'landing status 200': (r) => r.status === 200,
    'landing has content': (r) => r.body.includes('Sortora'),
  });
  errorRate.add(res.status !== 200);
  sleep(1);
}

// Test 2: Pricing page
export function pricingPage() {
  const res = http.get(BASE_URL + '/pricing.html');
  check(res, {
    'pricing status 200': (r) => r.status === 200,
  });
  errorRate.add(res.status !== 200);
  sleep(1);
}

// Test 3: Create split API
export function createSplit() {
  const payload = JSON.stringify({
    businessId: 'test-business-id',
    title: 'Load Test Booking',
    totalAmount: 120,
    totalParticipants: 4,
  });

  const params = { headers: { 'Content-Type': 'application/json' } };
  const start = Date.now();
  const res = http.post(BASE_URL + '/api/create-split', payload, params);
  checkoutDuration.add(Date.now() - start);

  check(res, {
    'create-split responds': (r) => r.status === 200 || r.status === 400 || r.status === 401,
  });
  errorRate.add(res.status >= 500);
  sleep(2);
}

// Test 4: Pay API (will fail without valid token, but tests server response)
export function payEndpoint() {
  const payload = JSON.stringify({
    participantId: 'test-id',
    bookingSessionId: 'test-session',
    token: 'test-token',
  });

  const params = { headers: { 'Content-Type': 'application/json' } };
  const res = http.post(BASE_URL + '/api/pay', payload, params);

  check(res, {
    'pay responds (not 500)': (r) => r.status !== 500,
    'pay has json': (r) => r.headers['Content-Type'] && r.headers['Content-Type'].includes('json'),
  });
  errorRate.add(res.status >= 500);
  sleep(1);
}

// Test 5: Widget status check
export function widgetStatus() {
  const res = http.get(BASE_URL + '/api/widget-status?businessId=test');
  check(res, {
    'widget-status responds': (r) => r.status === 200 || r.status === 400,
  });
  errorRate.add(res.status >= 500);
  sleep(1);
}

// Test 6: Webhook endpoint (simulates Stripe webhook without signature)
export function webhookEndpoint() {
  const payload = JSON.stringify({
    type: 'checkout.session.completed',
    data: { object: { metadata: {} } },
  });

  const params = { headers: { 'Content-Type': 'application/json' } };
  const res = http.post(BASE_URL + '/api/webhook', payload, params);

  check(res, {
    'webhook responds (not crash)': (r) => r.status !== 500,
  });
  errorRate.add(res.status >= 500);
  sleep(1);
}

// Main scenario: mix of all tests weighted by real traffic
export default function() {
  const scenario = Math.random();
  if (scenario < 0.3) landingPage();
  else if (scenario < 0.45) pricingPage();
  else if (scenario < 0.6) createSplit();
  else if (scenario < 0.75) payEndpoint();
  else if (scenario < 0.9) widgetStatus();
  else webhookEndpoint();
}
