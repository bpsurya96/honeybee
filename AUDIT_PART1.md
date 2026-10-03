# 🐝 Honeybee Learning V2 — Full Technical Audit (Part 1 of 2)
**Audit Date:** 2026-10-03
**Codebase:** /home/bpsurya96/projects/honeybee_V2
**Production Readiness Score: 38/100 — NOT production-ready.**

---

## 1. EXECUTIVE SUMMARY

Honeybee Learning is a Next.js 16 + Supabase educational e-commerce platform for parents of children aged 0-5 years. The application has a solid architectural skeleton but critical gaps between stated ambitions and actual implementation.

**Most dangerous issues:**
- Admin authentication uses hardcoded credentials + forgeable cookie session
- AI credit system: credits are never deducted; parents can self-issue credits via RLS
- Payment integration: completely absent despite trust badges
- Checkout: non-atomic DB operations; no idempotency; duplicate orders possible
- Unauthenticated file upload endpoint (anyone can upload to Supabase bucket)
- Order payment_status can be set to 'paid' by the parent via RLS

---

## 2. APPLICATION FEATURE INVENTORY

| Feature | Status | Notes |
|---------|--------|-------|
| Landing Page | FULL | Redirects to /login or /dashboard |
| Signup (Email/Password) | FULL | Supabase Auth |
| Login (Email/Password) | FULL | Supabase Auth |
| Google OAuth | MISSING | Not implemented |
| Logout | FULL | /api/auth/signout route |
| Password Reset | MISSING | No UI or server logic |
| Onboarding Flow | FULL | 2-step child creation |
| Dashboard | FULL | Shows children list |
| Parent Profile | PARTIAL | Name + avatar edit work; credits shown |
| Child Add/Edit/Delete | FULL | API routes with ownership checks |
| Child Detail/Learning Dashboard | FULL | Skill radar charts, progress, library |
| AI Learning Summary | UI-MOCK | Hardcoded age-bracket lookup, NOT real AI |
| Product Catalog | FULL | Age/skill filtering |
| Product Detail | FULL | Skills + activities shown |
| Cart | FULL | localStorage-based |
| Checkout | PARTIAL | No real payment; orders created as 'pending' |
| Payment | MISSING | Zero payment code despite Stripe in .env.example |
| Orders List/Detail | FULL | Parent sees own orders |
| Order Child Assignment | PARTIAL | Auto-assigned at checkout; manual re-assign works |
| Library (Child Products) | FULL | child_products table |
| Activities | FULL | Per-product activity list |
| Activity Completion Tracking | FULL | Mark complete/incomplete |
| Skill Progress (Radar Chart) | FULL | Correct Set-dedup calculation |
| AI Coach (Chat) | FULL | Gemini streaming with child context |
| AI Credits System | PARTIAL | Ledger exists; credits never deducted |
| Admin: Dashboard | FULL | Stats, charts (but top products uses Math.random()) |
| Admin: Customers | FULL | List, detail, edit |
| Admin: Orders | FULL | List, detail, edit status |
| Admin: Products | FULL | Create, edit, soft-delete |
| Admin: Activities | FULL | Create, edit, soft-delete |
| Admin: Settings | UI-ONLY | Page exists, no functionality |
| Notifications (Email) | MOCK | console.log only |
| Notifications (WhatsApp/SMS) | MOCK | console.log only |
| School/Wholesale | MISSING | No code or DB support |
| Coupons/Discounts | MISSING | No code or DB support |
| Search | MISSING | No search on products page |
| Learning Sessions | DB-ONLY | Table exists, never used in code |
| Dev Seed Routes | RISK | Protected by NODE_ENV only |
| Add to Library (Free) | CRITICAL | Creates £0 'paid' order - bypasses commerce |

---

## 3. CURRENT ARCHITECTURE

Framework: Next.js 16.3.6 (App Router, React 19)
Frontend: React 19, Tailwind CSS 4, Recharts
Backend: Next.js Server Actions + API Route Handlers
Database: Supabase (PostgreSQL with RLS)
Auth: Supabase Auth (users) + hardcoded cookie (admin)
AI: Google Gemini via Vercel AI SDK
Testing: Playwright (1 smoke test, was blocked)
Notifications: Mocked (console.log)
Payment: NOT IMPLEMENTED



---

## 4. CURRENT DATABASE SCHEMA (18 Tables)

### Reference Tables (public read, RLS enabled)
- **age_stages** (id, label, min_months, max_months, description, display_order)
- **skill_categories** (id, name, description, icon, colour, display_order, active)
- **skills** (id, category_id FK, age_stage_id FK nullable, name, description, display_order, active)
- **products** (id, name, slug UNIQUE, description, image_url, thumbnail_url, price, age_min_months, age_max_months, active)
- **product_skills** (product_id FK, skill_id FK, PRIMARY KEY composite)
- **activities** (id, product_id FK NOT NULL, name, description, instructions, age_min_months, age_max_months, difficulty CHECK(1-5), sequence_order, duration_mins, active)
- **activity_skills** (activity_id FK, skill_id FK, PRIMARY KEY composite)

### User Data Tables (RLS enabled, auth-gated)
- **profiles** (id FK auth.users CASCADE, full_name, avatar_url, ai_credits NUMERIC DEFAULT 0, created_at, updated_at)
- **children** (id, parent_id FK profiles CASCADE, name, date_of_birth DATE, gender CHECK, avatar_url)
- **orders** (id, parent_id FK, child_id FK nullable, status CHECK, delivery_status CHECK, payment_status CHECK, mobile_number, delivery_address, delivery_city, delivery_state, delivery_pincode, subtotal, total, payment_ref)
- **order_items** (id, order_id FK CASCADE, product_id FK RESTRICT, quantity, unit_price)
- **child_products** (id, child_id FK CASCADE, order_item_id FK CASCADE, assigned_at, active, UNIQUE child_id+order_item_id)
- **child_activities** (id, child_id FK CASCADE, activity_id FK CASCADE, completed BOOL, completed_at, notes, duration_mins, UNIQUE child_id+activity_id)
- **learning_sessions** (id, child_id FK CASCADE, started_at, ended_at, notes) -- UNUSED
- **ai_conversations** (id, parent_id FK CASCADE, child_id FK SET NULL, title) -- Not written to by /api/chat
- **ai_messages** (id, conversation_id FK CASCADE, role CHECK, content) -- Dead table
- **recommendations** (id, child_id FK CASCADE, recommended_activity_id FK CASCADE nullable, recommended_product_id FK CASCADE nullable) -- Both FKs nullable; meaningless
- **ai_credit_transactions** (id, parent_id FK CASCADE, order_id FK SET NULL, amount, reason, status CHECK, created_at) -- No idempotency; no negative prevention

### Schema Problems Summary

| Issue | Table | Problem |
|-------|-------|---------|
| DATA BUG | activities | saveProduct() sets product_id=null on update before re-linking; if re-link fails, activities orphaned |
| CORRUPTION | orders | child_id is single UUID; cannot support multi-child orders |
| MISSING | order_items | product_name not snapshotted; product rename breaks order history |
| MISSING | orders | No idempotency_key; duplicate orders possible |
| MISSING | ai_credit_transactions | No idempotency_key; double-credits on retry |
| DEADLOCK | recommendations | No INSERT RLS policy; system can never write recommendations |
| UNUSED | learning_sessions | Table exists but no code ever creates sessions |
| UNUSED | ai_conversations | /api/chat never persists conversations |
| RISKY | profiles | ai_credits balance field without negative CHECK constraint |

---

## 5. RECOMMENDED DATABASE SCHEMA (Key Additions)



---

## 6. ENTITY RELATIONSHIP MODEL



---

## 7. DATA STORAGE RECOMMENDATIONS

| Data | Decision | Reason |
|------|----------|--------|
| Child age | CALCULATE from DOB | Age changes daily; storing = constant updates |
| Progress % | CALCULATE on demand | Activity set changes; stored % becomes stale |
| AI credit balance | LEDGER + materialized balance | Ledger = audit; balance field = fast read |
| Product price | SNAPSHOT into order_items | Prices will change; history must be immutable |
| Delivery address | SNAPSHOT into orders | User may delete address; orders must be immutable |
| Skill mastery | CALCULATE from completions | Add score_percentage to child_activities |
| AI recommendations | GENERATE + PERSIST | Regenerate when stale; persist for display speed |
| Order status history | SEPARATE events table | Audit trail; state machine validation |

---

## 8. AUTHENTICATION & AUTHORIZATION AUDIT

### User Auth (Supabase)
| Check | Result | Detail |
|-------|--------|--------|
| Signup | PASS | Supabase handles |
| Login | PASS | Supabase JWT session |
| Logout | PASS | /api/auth/signout |
| Password Reset | FAIL | Not implemented |
| Google OAuth | FAIL | Not implemented |
| Session persistence | PASS | @supabase/ssr cookies |
| Identity check | PASS | Uses getUser(), not getSession() (correct) |

### IDOR Checks
| Resource | Authorization | Result |
|----------|--------------|--------|
| /children/[id] page | .eq('parent_id', user.id) | PASS |
| PUT /api/children/[id] | DB ownership check + RLS | PASS |
| DELETE /api/children/[id] | DB ownership check + RLS | PASS |
| POST /api/activities/complete | Child ownership verified | PASS |
| POST /api/orders/assign | Both child AND order item checked | PASS |
| POST /api/orders/checkout | Child ownership + DB prices | PASS |
| /orders/[id] page | .eq('parent_id', user.id) | PASS |
| POST /api/products/[id]/add-to-library | NO payment/ownership check | CRITICAL FAIL |

### Admin Auth (CRITICAL FAILURES)
| Check | Result | Detail |
|-------|--------|--------|
| Credentials | CRITICAL | Falls back to 'honeybee / Qwerty@12345' if env vars missing |
| Session token | CRITICAL | Cookie value = 'authenticated' — no signature, trivially forgeable |
| Role check | CRITICAL | Only checks string equality to cookie value |
| Rate limiting | FAIL | Brute-force possible |
| Admin RLS bypass | RISK | Uses service role key; forged session = full DB access |

SECRET FOUND
Location: src/app/admin/actions.ts
Type: Hardcoded fallback admin credentials (username + password)
Severity: CRITICAL

---

## 9. SUPABASE / RLS AUDIT

| Table | RLS | SELECT | INSERT | UPDATE | DELETE | Critical Gap |
|-------|-----|--------|--------|--------|--------|-------------|
| age_stages | YES | Public | None | None | None | Admin has no RLS policy (uses service role) |
| skill_categories | YES | Public | None | None | None | Same |
| skills | YES | Public | None | None | None | Same |
| products | YES | Active public | None | None | None | Same |
| profiles | YES | Own | Own | Own | None | OK |
| children | YES | Own | Own | Own | Own | OK |
| orders | YES | Own | Own | Own (ALL fields!) | None | CRITICAL: parent can set payment_status='paid' |
| order_items | YES | Via order | Via order | None | None | OK - immutable |
| child_products | YES | Via child | Via child | Via child | None | OK |
| child_activities | YES | Via child | Via child | Via child | None | OK |
| learning_sessions | YES | Via child | Via child | None | None | No UPDATE RLS (minor) |
| ai_conversations | YES | Own | Own | None | None | OK |
| ai_messages | YES | Via conv | Via conv | None | None | OK |
| recommendations | YES | Via child | None | None | None | INSERT missing = system can't write |
| ai_credit_transactions | YES | Own | Own (ANY amount!) | None | None | CRITICAL: parent can self-issue credits |

CRITICAL RLS ISSUES:
1. orders UPDATE: parent can set payment_status='paid' via direct Supabase client
2. ai_credit_transactions INSERT: parent can award themselves unlimited credits
3. /api/upload: uses service_role key with NO user auth check

---

## 10. API AUDIT

| Endpoint | Auth | Zod | Owner Check | Rate Limit | Idempotency | Issues |
|---------|------|-----|-------------|-----------|-------------|--------|
| POST /api/orders/checkout | YES | NO | YES (child) | NO | NO | Non-atomic; no Zod; duplicate orders |
| POST /api/activities/complete | YES | YES | YES | NO | YES (upsert) | Good |
| PUT /api/children/[id] | YES | YES | YES | NO | - | Good |
| DELETE /api/children/[id] | YES | - | YES | NO | - | Good |
| POST /api/orders/assign | YES | YES | YES (both) | NO | YES (upsert) | Good |
| POST /api/chat | YES | NO | YES (user) | NO | NO | No credit deduction; no rate limit; prompt injection risk |
| GET/PUT /api/profile | YES | YES | YES | NO | YES (upsert) | Good |
| POST /api/profile/avatar | YES | File check | YES (child) | NO | - | Good |
| POST /api/upload | NO | NO | NO | NO | NO | CRITICAL: Unauthenticated + service role |
| POST /api/products/[id]/add-to-library | YES | - | NO payment check | NO | NO | CRITICAL: Free product acquisition |
| POST /api/dev/seed-orders | YES | - | NODE_ENV only | NO | NO | Remove from production |
| POST /api/dev/seed-test-user | NO | - | NODE_ENV only | NO | NO | CRITICAL: No auth; creates users |

---

## 11. BUSINESS LOGIC AUDIT

### Checkout Flow Problems
1. Steps not wrapped in DB transaction - partial failures create corrupt state
2. No payment gateway - orders stay 'pending' forever
3. Single child_id - cannot handle multi-child family orders
4. AI credits awarded on order creation (not payment) - credits given before payment

### AI Credit Logic Problems
1. ALLOCATION: +15 credits on any order creation (not payment confirmation)
2. DEDUCTION: ZERO - /api/chat never deducts credits - AI is always free
3. RACE CONDITION: Concurrent checkouts can double-award credits
4. SELF-ISSUE: RLS allows parent to INSERT their own credit transactions

### Progress Calculation (BEST part of codebase)
- Uses Set deduplication to prevent double-counting correctly
- Eligible = paid library products' activities
- Per-category % = completed eligible activities / total eligible activities
- Overall % uses union of all eligible IDs
- GAPS: No score weighting; no age-appropriateness; binary completion only

### Product 
