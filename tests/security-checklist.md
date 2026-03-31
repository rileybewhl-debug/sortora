# Sortora Security Checklist

## Headers (verify with curl -I https://sortora.com)
- [ ] Strict-Transport-Security present
- [ ] X-Content-Type-Options: nosniff
- [ ] X-Frame-Options: DENY
- [ ] Content-Security-Policy present
- [ ] X-XSS-Protection: 0 (modern CSP replaces this)
- [ ] Referrer-Policy: strict-origin-when-cross-origin

## API Security
- [ ] All POST endpoints reject GET requests (405)
- [ ] Rate limiting active on auth endpoints
- [ ] CORS restricted to sortora.com origin
- [ ] Webhook signature verification (Stripe)
- [ ] SQL injection: parameterized queries via Supabase
- [ ] XSS: no innerHTML with user content
- [ ] CSRF: SameSite cookies + origin checking

## Auth
- [ ] Supabase RLS enabled on all tables
- [ ] service_role key only used server-side
- [ ] anon key only used client-side
- [ ] Password minimum 6 characters enforced
- [ ] Session expiry configured

## Stripe
- [ ] Webhook signature verified before processing
- [ ] Idempotency keys on all Stripe API calls
- [ ] No Stripe secret keys in client-side code
- [ ] Payment amounts validated server-side (not from client)

## Data
- [ ] PII minimized (only email + name stored)
- [ ] No credit card data stored (Stripe handles)
- [ ] Sensitive env vars not in code
- [ ] .env files in .gitignore

## Infrastructure
- [ ] Vercel WAF + bot protection enabled
- [ ] DNS uses HTTPS
- [ ] DKIM + SPF + DMARC for email
- [ ] Error messages don't leak stack traces to users
