# Production Technical Documentation — HoneyBee Learning V2
## Part 2: Business Rules, Security, Error Handling, Config, Testing, Runbook, AI Summary

---

## 9. Business Rules (Confirmed from Code)

| Rule ID | Business Rule | Source | Impact |
|---|---|---|---|
| BR-01 | Product purchase awards 15 AI credits | config.ts NEW_BOOK_AI_CREDIT=15; checkout/route.ts | profiles.ai_credits += 15 via trigger |
| BR-02 | Product prices validated server-side | checkout/route.ts DB lookup per item | Prevents client price tampering |
| BR-03 | Child must belong to parent for all writes | All API routes WHERE parent_id=auth.uid() | 403 Forbidden if mismatch |
| BR-04 | Order item must belong to parent for assign | assign/route.ts joins orders.parent_id | 403 Forbidden if mismatch |
| BR-05 | Un-marking activity hard-deletes record | activities/complete/route.ts DELETE when completed=false | Progress fully reversible |
| BR-06 | New users redirected to /onboarding | auth/callback default next=/onboarding | UX first-run flow |
| BR-07 | Checkout requires child selection | checkout/route.ts 400 if !child_id | Order integrity |
| BR-08 | AI coach generates age-aware responses | chat/route.ts system prompt includes child age months | Personalized coaching |
| BR-09 | AI summary is rule-based NOT ML | AILearningSummary.tsx generateAiSummary() hardcoded buckets | Informational only |
| BR-10 | Dev/test endpoints blocked in production | NODE_ENV check in seed-orders and seed-test-user | 403 in production |
| BR-11 | Avatar max 5MB image types only | profile/avatar/route.ts size + MIME validation | 400 if invalid |
| BR-12 | Cart in localStorage only | CartContext.tsx localStorage.setItem(honeybee_cart) | Cart lost on browser clear |
| BR-13 | Duplicate child-product assignment blocked | assign/route.ts checks existing child_products | 400 if duplicate |

---

## 10. Processing Functions

### POST /api/orders/checkout
- Input: { child_id, mobile_number, delivery_address, delivery_city, delivery_state, delivery_pincode, items: [{product_id, quantity}] }
- Output: { data: order }
- Tables Read: children (ownership), products (price lookup per item in loop)
- Tables Written: orders, order_items, child_products, ai_credit_transactions
- Trigger side-effect: profiles.ai_credits += 15
- CRITICAL: If order_items or child_products INSERT fails after orders INSERT succeeds, error is logged (console.error) but NO rollback occurs. Creates inconsistent state.
- Business Rules: BR-01, BR-02, BR-03, BR-07

### POST /api/activities/complete
- Input: { activity_id: UUID, child_id: UUID, completed: boolean, duration_mins?: number }
- Output: { data: childActivity } or { success: true }
- Validation: Zod schema (UUIDs + boolean)
- Tables Read: children (ownership check)
- Tables Written: child_activities (UPSERT if completed=true, DELETE if completed=false)
- Error: 422 validation, 403 ownership, 500 DB

### POST /api/chat
- Input: { messages: Message[], childId?: string }
- Output: Text stream (SSE via @ai-sdk/react)
- External: GEMINI_API_KEY, @ai-sdk/google gemini-3.5-flash-lite
- Tables Read: profiles (full_name), children (name, date_of_birth)
- Tables Written: NONE
- Error: 401 unauthenticated, 500 missing key or Gemini error
- Max duration: 30 seconds
- Business Rules: BR-08

### POST /api/children/[id]/complete-product
- Input: { product_id: UUID }
- Tables Read: children (ownership), activities WHERE product_id=?
- Tables Written: child_activities (bulk UPSERT onConflict: child_id,activity_id)
- Idempotent: YES

### generateAiSummary(childName, ageMonths) - AILearningSummary.tsx
- NOT machine learning. Hardcoded conditional logic confirmed from source:
  - ageMonths < 24: strengths=[Motor skills, Visual tracking], areas=[Vocabulary, Early speech]
  - ageMonths < 48: strengths=[Curiosity, Basic vocabulary, Creativity], areas=[Problem solving, Story comprehension]
  - ageMonths >= 48: strengths=[Story comprehension, Creativity, Social skills], areas=[Reading practice, Complex problem solving]

### sendOrderNotifications(data) - src/lib/notifications.ts
- Implementation: console.log() ONLY. No real email or WhatsApp API called.
- Source comment: "Mock implementations — In a real application these would call actual APIs (e.g. Resend, Twilio)"
- Called by: POST /api/orders/checkout

### proxy(request) - src/proxy.ts (Middleware)
Runs on every HTTP request (except static files, images, favicon).
1. Creates Supabase server client, refreshes session via auth.getUser()
2. Protected route check: path starts with protected route AND no user -> redirect to /login?redirect=PATH
3. Auth page check: path is /login or /signup AND user exists -> redirect to /dashboard

---

## 11. ML / AI Architecture

No in-house ML models exist in this project.

Google Gemini (gemini-3.5-flash-lite):
- External LLM via @ai-sdk/google
- Used for conversational AI coach at /coach page
- System prompt includes: parent full_name + all children names + ages in months
- Streamed via SSE to browser (maxDuration=30s)
- NOT persisted to DB (ai_conversations and ai_messages tables UNUSED from chat UI)
- Configured via GEMINI_API_KEY environment variable
- Model hardcoded in /api/chat/route.ts: google('gemini-3.5-flash-lite')

Rule-based AI Summary (generateAiSummary()):
- Age-bucket conditional logic in AILearningSummary.tsx
- NOT machine learning

---

## 12. Configuration

| Variable | Purpose | Required | Used By |
|---|---|---|---|
| NEXT_PUBLIC_SUPABASE_URL | Supabase project URL | YES | Both Supabase clients |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Supabase anon key (public) | YES | Both clients |
| SUPABASE_SERVICE_ROLE_KEY | Supabase admin key | Dev/test only | createAdminClient(), seed-test-user |
| GEMINI_API_KEY | Google Gemini API key | YES for AI coach | /api/chat (server-side only) |
| NEXT_PUBLIC_APP_URL | App base URL | YES | /api/auth/signout redirect |
| AI_PROVIDER | AI model reference | Informational | NOT used (model hardcoded) |
| NODE_ENV | Environment flag | Auto (Next.js) | Dev-only endpoint guards |

Hardcoded values in source code:
- NEW_BOOK_AI_CREDIT = 15 (src/lib/config.ts)
- AI model: gemini-3.5-flash-lite (hardcoded in /api/chat/route.ts)
- maxDuration: 30 seconds (/api/chat/route.ts)
- Avatar size limit: 5MB (profile/avatar/route.ts)
- Allowed avatar types: image/jpeg, image/png, image/webp, image/gif

SECURITY: .env.local contains real Supabase URL, anon key, service role key, and Gemini API key.
Service role key and Gemini API key MUST NOT be committed to version control or sent to client.

---

## 13. Dependencies

Production Dependencies:
- next 16.3.6: React full-stack framework (App Router)
- react / react-dom 19.2.8: UI library
- @supabase/supabase-js ^2.117.1: Supabase DB + Auth + Storage
- @supabase/ssr ^0.12.7: Supabase SSR cookie handling
- @ai-sdk/google ^4.0.82: Google Gemini AI provider
- @ai-sdk/react ^1.0.0: useChat hook
- ai ^7.0.118: Vercel AI SDK core (streamText)
- react-hook-form ^7.88.0: Form state
- @hookform/resolvers ^5.9.1: Zod integration
- zod ^3.25.76: Runtime schema validation
- lucide-react ^1.48.0: Icons
- recharts ^3.10.1: Charts
- clsx ^2.1.1: Conditional CSS
- tailwind-merge ^3.7.0: Tailwind class resolution

Dev Dependencies:
- @playwright/test ^1.63.0: End-to-end testing
- tailwindcss ^4: CSS framework
- typescript ^5: TypeScript
- eslint ^9: Linting

External Services:
- Supabase (PostgreSQL + Auth + Storage): REQUIRED
- Google Gemini API (gemini-3.5-flash-lite): REQUIRED for AI coach
- Email service: NOT IMPLEMENTED (console.log only)
- WhatsApp API: NOT IMPLEMENTED (console.log only)
- Payment gateway: NOT IMPLEMENTED

---

## 14. Error Handling

| Scenario | Detection | Response | Recovery |
|---|---|---|---|
| Unauthenticated -> protected route | proxy.ts session check | Redirect /login?redirect=PATH | User logs in |
| Unauthenticated API request | auth.getUser() null | 401 Unauthorized | Retry after login |
| Child not owned by parent | DB AND parent_id=auth.uid() returns null | 403 Forbidden | Security block |
| Order item not owned | DB join on orders.parent_id fails | 403 Forbidden | Security block |
| Missing checkout fields | !child_id OR !items | 400 Missing required fields | Fix request body |
| Product not found | DB SELECT null | 400 Product not found | Check product catalog |
| Zod validation failure | schema.safeParse() success=false | 422 with error details | Fix input data |
| Gemini API key missing | !process.env.GEMINI_API_KEY | 500 AI service not configured | Set GEMINI_API_KEY |
| Gemini API error | catch(error) in chat route | 500 Internal Server Error | Check Gemini status |
| order_items INSERT fails SILENT | if (itemsError) check | console.error only | Manual order_items insert |
| child_products INSERT fails SILENT | if (cpError) check | console.error only | Manual child_products insert |
| ai_credit_transactions fails SILENT | if (creditError) check | console.error only | Manual insert + trigger |
| Avatar too large | file.size > 5MB | 400 File too large | Upload smaller file |
| Avatar wrong type | MIME not in allowedTypes | 400 Invalid file type | Upload correct format |
| Cart localStorage corrupt | JSON.parse exception | Clear localStorage key | Cart reset |

---

## 15. Logging and Monitoring

Current logging (all console only):
- console.error(Chat API Error) -- chat route
- console.error(Order creation failed) -- checkout
- console.error(Order items creation failed) -- checkout SILENT FAILURE
- console.error(Failed to auto-assign to child) -- checkout SILENT FAILURE
- console.error(Failed to award AI credit) -- checkout SILENT FAILURE
- console.error(Failed to read image directory) -- product detail
- console.error(Failed to parse cart) -- CartContext
- console.log(Seeded order for parent) -- seed_db.js
- console.log (full email + WhatsApp notification content) -- sendOrderNotifications() on every checkout

No structured logging, log aggregation, metrics, or alerting is implemented.

---

## 16. Security

Authentication:
- Supabase Auth email/password + email confirmation required
- Session in HTTP cookies via @supabase/ssr (httpOnly, secure)
- Session refresh: automatic on every request via middleware

Multi-Layer Authorization:
1. Middleware (proxy.ts): redirects unauthenticated users before page/API loads
2. Protected Layout ((protected)/layout.tsx): verifies session server-side, redirects to /login
3. API Ownership: every write API route explicitly checks parent_id = auth.uid()
4. RLS: database-level per-user isolation on all tables using anon key

Dev-Only Endpoint Protection:
- /api/dev/seed-orders: NODE_ENV !== development -> 403
- /api/dev/seed-test-user: NODE_ENV not in [development, test] -> 403

Secret Management:
- SUPABASE_SERVICE_ROLE_KEY: server-side only (createAdminClient + dev seed routes)
- GEMINI_API_KEY: server-side only (/api/chat route, never sent to client)
- NEXT_PUBLIC_SUPABASE_ANON_KEY: intentionally public -- security relies on RLS

---

## 17. Scheduling and Execution

No scheduler, cron job, or batch execution exists in this project.

Entry point: next dev (dev) or next start (production)
Trigger: HTTP request (user-driven, on-demand)
Execution: Serverless Next.js API routes + React Server Components
Deployment: UNKNOWN (no Dockerfile, Vercel config, or CI/CD pipeline found)

---

## 18. Idempotency

| Process | Idempotent | Reason |
|---|---|---|
| Signup / profile creation | YES | ON CONFLICT DO NOTHING in trigger + UPSERT in onboarding |
| Child creation | NO | Plain INSERT creates duplicates |
| Checkout / order creation | NO | Plain INSERT creates duplicates + duplicate credits |
| Activity mark complete | YES | UPSERT ON CONFLICT (child_id, activity_id) |
| Activity un-complete | YES | DELETE by composite key -- safe to repeat |
| Bulk product complete | YES | UPSERT all ON CONFLICT |
| Child-product assign | YES | UPSERT ON CONFLICT (child_id, order_item_id) |
| Profile update | YES | UPSERT by primary key |
| Avatar upload | YES | Supabase Storage upsert:true replaces existing |
| AI credit award | NO | Plain INSERT -- rerun adds more credits and trigger fires again |

---

## 19. Production Runbook

Pre-Execution Checklist:
1. Verify all environment variables (see Configuration section)
2. Confirm DB migrations applied (001 + 002)
3. Confirm seed data loaded (supabase/seed.sql)
4. Confirm Supabase Storage avatars bucket created and public
5. Confirm NODE_ENV=production is set

After a Successful Order -- Verify in Supabase DB:
1. orders: row with parent_id, child_id, status=new, payment_status=pending
2. order_items: one row per product with correct unit_price
3. child_products: rows linking order_items to selected child
4. ai_credit_transactions: row with amount=15, status=completed
5. profiles.ai_credits: incremented by 15

Failure Recovery:

Checkout order exists but order_items missing:
  Detection: console.error(Order items creation failed) in logs
  Recovery: Manually INSERT order_items, then child_products, then ai_credit_transactions

Checkout order + items exist but child_products missing:
  Detection: console.error(Failed to auto-assign to child)
  Recovery: Manually INSERT child_products (child_id, order_item_id, active=true)

AI credits not awarded:
  Detection: console.error(Failed to award AI credit)
  Recovery: Manually INSERT ai_credit_transactions (parent_id, order_id, amount=15, reason='New Book Purchase', status='completed') -- trigger auto-updates balance

Gemini API unavailable:
  Detection: /api/chat returns 500
  Impact: AI coach completely unavailable. Rest of app unaffected.
  Recovery: Check GEMINI_API_KEY validity, check Google Cloud Console

Products page empty:
  Cause: Seed data not loaded
  Recovery: Run supabase/seed.sql in Supabase SQL editor

---

## 20. Known Limitations / Gaps

1. NO payment processing: payment_status always pending. No payment gateway integrated.
2. SILENT failure paths in checkout: no transaction rollback if downstream INSERTs fail.
3. Notifications are mock-only: console.log only. No real email or WhatsApp sent.
4. AI conversations NOT persisted: ai_conversations and ai_messages exist but never written. Every session starts fresh.
5. Unused tables: learning_sessions, recommendations, age_stages -- schema defined, no app writes.
6. Dashboard shows hardcoded 0% progress (static JSX, not computed from data).
7. No pagination on any list views (products, orders, children, activities).
8. Checkout N+1 query: product prices fetched one-by-one in a loop.
9. add-to-library route not restricted to dev: creates real DB records in production.
10. AI_PROVIDER env var ignored: model hardcoded as gemini-3.5-flash-lite regardless.

---

## 21. Assumptions and Unknowns

| Item | Status | Note |
|---|---|---|
| Deployment platform | UNKNOWN | No Dockerfile, Vercel config, or CI/CD found |
| Payment gateway plan | UNKNOWN | .env.example references stripe but no code |
| Production domain | UNKNOWN | .env.local shows http://localhost:3000 |
| Supabase Storage avatars bucket config | INFERRED | Assumed public -- not confirmed from code |
| Order fulfillment | UNKNOWN | No fulfillment system. Manual process assumed. |
| Admin interface | NOT FOUND | No admin panel, no admin-role RLS policy |
| Real-time subscriptions | NOT USED | No supabase.channel() found |

---

## 22. Production Checklist

- [ ] NEXT_PUBLIC_SUPABASE_URL configured
- [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY configured
- [ ] SUPABASE_SERVICE_ROLE_KEY configured (server-side only)
- [ ] GEMINI_API_KEY configured (server-side only)
- [ ] NEXT_PUBLIC_APP_URL set to production domain
- [ ] NODE_ENV=production
- [ ] DB migrations applied (001_initial_schema.sql + 002_add_order_fields_and_ai_credits.sql)
- [ ] Seed data loaded (supabase/seed.sql)
- [ ] Supabase Storage avatars bucket created and public
- [ ] .env.local secrets rotated if previously committed
- [ ] Gemini API key active with sufficient quota
- [ ] E2E smoke test passing
- [ ] Notification system replaced with real implementation before launch
- [ ] Payment gateway integrated before accepting real transactions
- [ ] Silent failure paths in checkout mitigated (transaction/compensation logic)

---

## 23. Traceability Matrix

| Business Requirement | Code Location | Input | DB Tables |
|---|---|---|---|
| Parent creates account | SignupForm.tsx -> auth.signUp() | email, password, full_name | auth.users -> (trigger) profiles |
| Parent adds first child | OnboardingFlow.tsx -> insert children | name, dob, gender | children, profiles |
| Parent browses products | /products/page.tsx RSC | skill filter param | products, product_skills, skills |
| Parent adds to cart | ProductCard.tsx -> addToCart() | product, quantity | localStorage only |
| Parent places order | checkout/route.ts | child_id, address, items | orders, order_items, child_products, ai_credit_transactions, profiles |
| Child gets product in library | checkout/route.ts auto-assign | order_item IDs + child_id | child_products |
| Parent marks activity complete | ActivityCompletionButton -> activities/complete | activity_id, child_id, completed | child_activities |
| Parent marks book complete | ChildDetailClient -> complete-product | product_id | child_activities |
| AI credits awarded | checkout/route.ts | order_id | ai_credit_transactions, profiles |
| Parent chats with AI | CoachClient -> chat/route.ts | messages, childId | profiles, children (read only) |
| Parent updates profile | ProfileClient -> profile/route.ts | full_name | profiles |
| Parent uploads avatar | AvatarUpload -> profile/avatar/route.ts | file, target | profiles or children, Supabase Storage |
| Parent deletes child | children/[id]/route.ts DELETE | child id | children (cascade: child_products, child_activities) |

---

## 24. AI Knowledge Summary (Machine-Readable)

```
SYSTEM: HoneyBee Learning V2
PURPOSE: Early-childhood learning platform. Register + child profiles + purchase kits + track activities + AI coaching. 15 AI credits per order.

ENTRY_POINT: src/proxy.ts (middleware) + src/app/layout.tsx
TRIGGER: HTTP request. NO scheduled jobs.

SOURCE_TABLES (read-only from app):
  products, activities, skills, skill_categories, product_skills, activity_skills

SOURCE_AND_TARGET_TABLES (read + write):
  children, profiles, child_products, child_activities, orders, order_items, ai_credit_transactions

UNUSED_TABLES:
  learning_sessions, ai_conversations, ai_messages, recommendations, age_stages

INSERT_OPERATIONS:
  orders: checkout, status=new payment_status=pending
  order_items: one per cart item
  child_products: auto-assigned at checkout
  ai_credit_transactions: 15 credits per checkout status=completed
  children: at onboarding or child management

UPDATE_OPERATIONS:
  profiles.ai_credits: DB trigger on ai_credit_transactions INSERT
  profiles.avatar_url, full_name: via profile API
  children fields: via child update API

DELETE_OPERATIONS:
  children: cascade to child_products, child_activities
  child_activities: hard DELETE when un-marked (completed=false)

UPSERT_OPERATIONS:
  profiles: ON CONFLICT (id)
  child_products: ON CONFLICT (child_id, order_item_id)
  child_activities: ON CONFLICT (child_id, activity_id)

MODELS:
  Google Gemini gemini-3.5-flash-lite (external, stateless, streaming, NOT persisted)
  NO in-house ML models

BUSINESS_RULES:
  15 AI credits per purchase (config.ts)
  Product prices validated server-side
  Child ownership verified on every write (multi-layer)
  Dev-only endpoints blocked in production by NODE_ENV
  Avatar max 5MB image types only
  Cart in localStorage only
  Duplicate child-product assignment blocked
  Un-completing activity = hard DELETE

FAILURE_POINTS:
  Supabase connection failure: all functionality fails
  Gemini API key invalid: AI coach fails (rest unaffected)
  Checkout downstream INSERT failures: SILENT (logged, no rollback)

RERUN_STRATEGY:
  Checkout: NOT idempotent
  Activity completion toggle: IDEMPOTENT
  Profile update: IDEMPOTENT
  Child creation: NOT idempotent

CRITICAL_GAPS:
  No payment gateway (payment_status always pending)
  No transaction rollback in checkout
  Notifications are console.log only
  AI conversations not persisted
  No admin interface
  No fulfillment system
  Deployment platform unknown
```
