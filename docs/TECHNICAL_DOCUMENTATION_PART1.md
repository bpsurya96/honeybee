# Production Technical Documentation — HoneyBee Learning V2
**Project:** HoneyBee Learning V2 | **Version:** 1.0 | **Generated:** September 2026
**Source:** 100% confirmed from source code inspection unless explicitly stated otherwise.

---

## 1. Executive Summary

HoneyBee Learning is a **Next.js 16 + Supabase full-stack web application** for parents of young children (0-5 years). Parents can:
1. Register and create child profiles to track developmental progress
2. Browse and purchase physical learning kits (products) via a checkout flow
3. Track digital activity completion for each child
4. Receive AI-powered parenting coaching via Google Gemini chat

**Currency:** Indian Rupees. Targeted at Indian market (+91 phone prefix, Indian address fields).
**Business objective:** Link physical educational products to digital activity tracking and AI coaching.

---

## 2. Architecture Overview

`
Browser (Parent)
    Public Routes: /  /login  /signup
    Protected Routes (session required):
      /dashboard  /children  /products  /orders  /coach  /profile  /onboarding

Next.js 16 App Router (React 19)
    Server Components (RSC) - data fetching server-side
    Client Components - cart, chat, forms
    API Routes (/app/api/*)
        /api/chat                   -> Google Gemini streaming
        /api/orders/checkout        -> Order + Items + Child Products + AI Credits
        /api/orders/assign          -> child_products upsert
        /api/activities/complete    -> child_activities upsert/delete
        /api/children/[id]          -> PUT/DELETE child
        /api/children/[id]/complete-product -> Bulk activities complete
        /api/profile                -> GET/PUT profile
        /api/profile/avatar         -> POST avatar to Supabase Storage
        /api/products/[id]/add-to-library -> Zero-cost order (dev utility)
        /api/auth/signout           -> POST sign-out
        /api/dev/seed-orders        -> Dev-only seed (blocked in production)
        /api/dev/seed-test-user     -> Dev/Test-only seed (blocked in production)

Supabase (PostgreSQL + Auth + Storage)
    Auth: email/password + email confirmation
    Database: 18 tables with Row Level Security (RLS)
    Storage: avatars bucket (parent + child photos)

Google Gemini API (gemini-3.5-flash-lite)
    Stateless streaming - NOT persisted to DB from chat UI
`

### Middleware / Route Guard (src/proxy.ts)
- Refreshes Supabase session on every request
- Redirects unauthenticated users to /login?redirect=PATH for protected routes
- Redirects authenticated users away from /login and /signup to /dashboard
- Protected routes: /dashboard, /children, /products, /orders, /coach, /profile, /onboarding

---

## 3. End-to-End Process Flows

### New User Registration
`
/signup -> SignupForm: supabase.auth.signUp() (sends email confirmation)
-> User clicks email link
-> /auth/callback: supabase.auth.exchangeCodeForSession()
-> DB Trigger: handle_new_user() -> INSERT profiles (id, full_name from metadata)
-> Redirect to /onboarding (default next param)
-> OnboardingFlow: UPSERT profiles + INSERT children
-> Redirect to /dashboard
`

### Order / Purchase Flow
`
/products -> ProductCard -> addToCart() -> localStorage[honeybee_cart]
-> /checkout form: select child, enter mobile, address
-> POST /api/orders/checkout:
    1. SELECT children WHERE id=child_id AND parent_id=user.id (ownership check)
    2. SELECT products WHERE id IN [cart items] (server-side price validation)
    3. INSERT orders (status=new, payment_status=pending, delivery_status=pending)
    4. INSERT order_items (one per cart item)
    5. INSERT child_products (auto-assign all items to selected child)
    6. INSERT ai_credit_transactions (amount=15, status=completed)
       -> DB Trigger: UPDATE profiles.ai_credits += 15
    7. sendOrderNotifications() -- console.log ONLY, no real email/WhatsApp
-> Response: { data: order }
-> Client redirects to /orders/[id]/confirmation, clearCart()
`

### Activity Completion Flow
`
/activities/[id] (RSC):
    SELECT activities + activity_skills + skills WHERE id=?
    SELECT children WHERE parent_id=user.id
    SELECT child_activities WHERE activity_id=? AND completed=true

ActivityCompletionButton (client component):
    -> POST /api/activities/complete { activity_id, child_id, completed, duration_mins }
        - Zod validation (UUID fields + boolean)
        - SELECT children WHERE id=child_id AND parent_id=user.id (ownership check)
        - IF completed=true: UPSERT child_activities ON CONFLICT (child_id, activity_id)
        - IF completed=false: DELETE FROM child_activities WHERE child_id=? AND activity_id=?
    -> router.refresh() (RSC re-renders with updated state)
`

### AI Coach Flow
`
/coach (RSC): SELECT children WHERE parent_id=user.id

CoachClient (client) - useChat() from @ai-sdk/react:
    -> POST /api/chat { messages, childId }
        - auth check (supabase.auth.getUser())
        - SELECT profiles WHERE id=user.id (full_name)
        - SELECT children WHERE parent_id=user.id [AND id=childId if provided]
        - Build system prompt with parent name + child ages in months
        - streamText() via Google Gemini (gemini-3.5-flash-lite), maxDuration=30s
    -> Streaming text response to browser

NOTE: ai_conversations and ai_messages tables are NOT written from the chat UI.
      Every conversation starts fresh with no history persistence.
`

---

## 4. Data Flow

`
products (seeded in DB via seed.sql)
    SELECT active products + skills (via product_skills join)
    -> ProductCard -> addToCart() -> localStorage[honeybee_cart]
    -> CheckoutPage reads CartContext (items + totalPrice)
    -> POST /api/orders/checkout
    -> orders table: INSERT new order
    -> order_items table: INSERT one per product
    -> child_products table: INSERT one per order_item (links to selected child)
    -> ai_credit_transactions: INSERT (amount=15, status=completed)
    -> DB Trigger fires -> profiles.ai_credits: UPDATE (+15)
    -> /children/[id] library shows: child_products JOIN order_items JOIN products
    -> Parent marks activity complete
    -> child_activities: UPSERT (completed=true)
    -> Learning Areas: child_activities -> skills -> skill_categories -> completion %
`

---

## 5. Database Architecture

**DB:** PostgreSQL managed by Supabase
**Project URL:** https://ipejjrkvyynhakxizfex.supabase.co (from .env.local)
**Auth:** email/password, session in HTTP cookies via @supabase/ssr
**Security:** RLS enabled on ALL tables. App uses anon key. All access governed by RLS.
**Extension:** uuid-ossp (uuid_generate_v4() as default PKs)

### Database Triggers

| Trigger | Table | Event | Function | Effect |
|---|---|---|---|---|
| on_auth_user_created | auth.users | AFTER INSERT | handle_new_user() | INSERT profiles (id, full_name from metadata) ON CONFLICT DO NOTHING |
| update_*_updated_at (x7) | profiles, children, products, activities, orders, ai_conversations, child_activities | BEFORE UPDATE | update_updated_at_column() | SET updated_at = NOW() |
| on_ai_credit_insert | ai_credit_transactions | AFTER INSERT | update_profile_ai_credits() | When status=completed: UPDATE profiles.ai_credits += amount WHERE id=parent_id |

---

## 6. Database Table Inventory

| Table | Purpose | SELECT | INSERT | UPDATE | DELETE | UPSERT | Role |
|---|---|:---:|:---:|:---:|:---:|:---:|---|
| profiles | Parent profile extending auth.users | Y | Y(trigger) | Y | N | Y | Source+Target |
| children | Child profiles | Y | Y | Y | Y | N | Source+Target |
| age_stages | Age stage reference | N | N | N | N | N | Unused in queries |
| skill_categories | Skill taxonomy | Y | N | N | N | N | Reference |
| skills | Individual skills | Y | N | N | N | N | Reference |
| products | Learning kit catalog | Y | N | N | N | N | Source (read-only) |
| product_skills | Product-Skill M2M join | Y(join) | N | N | N | N | Reference |
| activities | Digital activities | Y | N | N | N | N | Source (read-only) |
| activity_skills | Activity-Skill M2M join | Y(join) | N | N | N | N | Reference |
| orders | Purchase orders | Y | Y | N | N | N | Source+Target |
| order_items | Order line items | Y(join) | Y | N | N | N | Source+Target |
| child_products | Product-to-Child assignment | Y | Y | N | N | Y | Source+Target |
| child_activities | Activity completion records | Y | Y | N | Y | Y | Source+Target |
| learning_sessions | Learning session records | N | N | N | N | N | UNUSED (schema only) |
| ai_conversations | AI conversation threads | N | N | N | N | N | UNUSED (not populated) |
| ai_messages | AI messages | N | N | N | N | N | UNUSED (not populated) |
| recommendations | AI recommendations | N | N | N | N | N | UNUSED (schema only) |
| ai_credit_transactions | Credit ledger | N | Y | N | N | N | Source+Target |

---

## 7. Table-Level Documentation

### profiles
**Purpose:** Extends auth.users with parent display name, avatar URL, and AI credit balance.

**How Data Is Read:**
- SELECT * FROM profiles WHERE id = auth.uid() -- dashboard, profile, AI coach, child detail
- SELECT full_name, avatar_url, ai_credits WHERE id = child.parent_id -- AILearningSummary

**How Data Is Inserted:**
- DB Trigger handle_new_user(): INSERT INTO profiles (id, full_name) VALUES (NEW.id, NEW.raw_user_meta_data->>full_name) ON CONFLICT (id) DO NOTHING
- OnboardingFlow client: supabase.from(profiles).upsert({ id, full_name, updated_at }, { onConflict: id })

**How Data Is Updated:**
- PUT /api/profile: supabase.from(profiles).upsert({ id, full_name, updated_at })
- POST /api/profile/avatar: supabase.from(profiles).update({ avatar_url }).eq(id, user.id)
- DB Trigger on_ai_credit_insert: UPDATE profiles SET ai_credits = ai_credits + NEW.amount WHERE id = NEW.parent_id

**How Data Is Deleted:** No application delete. Cascade-deleted when auth.users row is deleted (FK: id REFERENCES auth.users ON DELETE CASCADE).

---

### children
**Purpose:** Child profiles (name, DOB, gender, avatar) linked to a parent.

**How Data Is Read:**
- SELECT * FROM children WHERE parent_id = auth.uid() -- dashboard, checkout, AI coach
- SELECT id FROM children WHERE id = ? AND parent_id = auth.uid() -- ownership check in ALL child API routes

**How Data Is Inserted:**
- Onboarding: supabase.from(children).insert({ name, date_of_birth, gender, parent_id })
- Child management: ChildForm component -> insert

**How Data Is Updated:**
- PUT /api/children/[id]: update({ name, date_of_birth, gender, updated_at }) with ownership check
- POST /api/profile/avatar with target=childId: update({ avatar_url })

**How Data Is Deleted:**
- DELETE /api/children/[id]: delete().eq(id, childId).eq(parent_id, user.id)
- CASCADE: child_products, child_activities, learning_sessions deleted; ai_conversations.child_id SET NULL

---

### products
**Purpose:** Physical learning kit catalog. Seeded via supabase/seed.sql. READ-ONLY from application code.

**How Data Is Read:**
- /products page: SELECT *, product_skills(skills(*)) WHERE active=true ORDER BY age_min_months ASC
- Product detail: SELECT *, product_skills(skills(*)) WHERE id=?
- Checkout validation: SELECT id, price, name FROM products WHERE id=? (one per cart item in loop)
- AILearningSummary: SELECT *, product_skills(skills(*)) WHERE active=true LIMIT 2

**INSERT/UPDATE/DELETE:** None from application code. Managed via seed.sql + manual DB admin.

---

### activities
**Purpose:** Digital activities per product. Seeded via seed.sql. READ-ONLY from application code.

**How Data Is Read:**
- Product detail: SELECT *, activity_skills(skills(*)) WHERE product_id=? ORDER BY display_order ASC
- Activity detail: SELECT *, activity_skills(skills(*)), product:products(id,name) WHERE id=?
- Bulk completion: SELECT id FROM activities WHERE product_id=?

**INSERT/UPDATE/DELETE:** None from application code.

---

### orders
**Purpose:** Parent purchase orders with delivery + payment metadata.

**How Data Is Read:**
- Order detail: SELECT *, children(name), items:order_items(*, product:products(*)) WHERE id=? AND parent_id=auth.uid()
- Orders list: SELECT * FROM orders WHERE parent_id = auth.uid() ORDER BY created_at DESC

**How Data Is Inserted:**
- POST /api/orders/checkout: INSERT (parent_id, child_id, mobile_number, delivery_address, delivery_city, delivery_state, delivery_pincode, subtotal, total, status=new, payment_status=pending, delivery_status=pending)
- POST /api/products/[id]/add-to-library: INSERT (parent_id, status=paid, subtotal=0, total=0)
- POST /api/dev/seed-orders (dev only): INSERT (parent_id, status=paid, delivery_status=processing, payment_ref=dev_seed_...)
- seed_db.js (dev script): same as seed-orders

**How Data Is Updated:** NO UPDATE operations in application code.
CRITICAL GAP: payment_status is always pending. No payment gateway exists. Status never transitions programmatically.

**How Data Is Deleted:** No delete operations.

---

### order_items
**Purpose:** Individual product line items within an order.

**How Data Is Read:**
- Via join from orders: items:order_items(*, product:products(*))
- Assign route: SELECT id, product_id, orders!inner(parent_id) WHERE id=?

**How Data Is Inserted:**
- POST /api/orders/checkout: INSERT (order_id, product_id, quantity, unit_price) one per cart item
- POST /api/products/[id]/add-to-library: INSERT (order_id, product_id, unit_price=0)
- POST /api/dev/seed-orders: INSERT (order_id, product_id, quantity=1, unit_price)

**How Data Is Updated/Deleted:** None identified.

---

### child_products
**Purpose:** Maps a purchased order_item to a specific child. Gives child access to product library.
**Unique constraint:** (child_id, order_item_id)

**How Data Is Read:**
- Child detail library: SELECT id, order_item:order_items(product:products(*)) WHERE child_id=? AND active=true
- Duplicate check in assign route: SELECT id, order_items!inner(product_id) WHERE child_id=? AND product_id=?

**How Data Is Inserted / Upserted:**
- POST /api/orders/checkout (auto-assign): INSERT (child_id, order_item_id, active=true) per order_item
- POST /api/orders/assign (manual reassign): UPSERT (order_item_id, child_id, active=true) ON CONFLICT (child_id, order_item_id)

**How Data Is Deleted:** Cascade-deleted when child is deleted.

---

### child_activities
**Purpose:** Activity completion records. One row per (child, activity) pair.
**Unique constraint:** (child_id, activity_id)

**How Data Is Read:**
- Activity detail: SELECT child_id WHERE activity_id=? AND completed=true
- AILearningSummary: via join children.child_activities(*)

**How Data Is Inserted / Upserted:**
- POST /api/activities/complete (completed=true): UPSERT (child_id, activity_id, completed=true, completed_at=NOW(), duration_mins) ON CONFLICT (child_id, activity_id) DO UPDATE SET completed=true, completed_at=NOW()
- POST /api/children/[id]/complete-product (bulk): UPSERT per activity ON CONFLICT (child_id, activity_id)

**How Data Is Deleted:**
- POST /api/activities/complete (completed=false): DELETE FROM child_activities WHERE child_id=? AND activity_id=?
  This un-marks a completed activity (hard delete, not soft delete)

---

### ai_credit_transactions
**Purpose:** Credit ledger. INSERT with status=completed triggers profiles.ai_credits update via DB trigger.

**How Data Is Inserted:**
- POST /api/orders/checkout: INSERT (parent_id, order_id, amount=15, reason=New Book Purchase, status=completed)
  -> DB Trigger fires: UPDATE profiles SET ai_credits = ai_credits + 15 WHERE id = parent_id

**How Data Is Updated/Deleted:** None identified.

---

### Unused Tables
- learning_sessions: Schema + RLS defined. No INSERT or SELECT from application code.
- ai_conversations: Schema + RLS defined. Chat UI does NOT persist conversations.
- ai_messages: Schema + RLS defined. Chat UI does NOT persist messages.
- recommendations: Schema + RLS defined. Never populated.
- age_stages: Schema defined. Not used in any active application query.

---

## 8. Column-Level Documentation

### profiles
| Column | Type | Source | Used For |
|---|---|---|---|
| id | UUID PK | auth.users.id | All ownership checks |
| full_name | TEXT | Sign-up metadata, profile update | AI coach greeting, UI display |
| avatar_url | TEXT | Avatar upload API | Profile display |
| ai_credits | NUMERIC(10,2) | DB Trigger: update_profile_ai_credits | Displayed on Child Detail |
| created_at | TIMESTAMPTZ | DB DEFAULT NOW() | Audit |
| updated_at | TIMESTAMPTZ | Trigger: update_updated_at_column | Audit |

### children
| Column | Type | Source | Used For |
|---|---|---|---|
| id | UUID PK | uuid_generate_v4() | All child operations |
| parent_id | UUID FK->profiles.id | Auth user ID at creation | RLS, ownership checks |
| name | TEXT | Parent input | Display, AI coach context |
| date_of_birth | DATE | Parent input (YYYY-MM-DD) | Age calculation |
| gender | TEXT | Parent input, optional: male/female/prefer_not_to_say | Display |
| avatar_url | TEXT | Avatar upload API | Display |

### orders
| Column | Type | Source | Used For |
|---|---|---|---|
| id | UUID PK | uuid_generate_v4() | All order operations |
| parent_id | UUID FK | Auth user ID | RLS, display |
| child_id | UUID FK nullable | Checkout form | Order detail display |
| status | TEXT | Checkout sets: new | Display |
| delivery_status | TEXT | Checkout sets: pending | Display |
| payment_status | TEXT | Checkout sets: pending (NEVER UPDATED) | Display |
| mobile_number | TEXT | Checkout form | Notifications |
| delivery_address | TEXT | Checkout form | Fulfillment |
| delivery_city | TEXT | Checkout form | Fulfillment |
| delivery_state | TEXT | Checkout form | Fulfillment |
| delivery_pincode | TEXT | Checkout form (6 digits) | Fulfillment |
| subtotal | NUMERIC(10,2) | Server-side calculation | Display |
| total | NUMERIC(10,2) | Server-side calculation (= subtotal, no shipping) | Display |
| payment_ref | TEXT | Not set at checkout | Future payment gateway |

### child_activities
| Column | Type | Source | Used For |
|---|---|---|---|
| child_id | UUID FK | API request | Progress tracking |
| activity_id | UUID FK | API request | Progress tracking |
| completed | BOOLEAN | API request | Progress display |
| completed_at | TIMESTAMPTZ | new Date().toISOString() | Audit, display |
| duration_mins | INTEGER | Optional from client | Analytics |
| notes | TEXT | Not set by application | Future use |

### ai_credit_transactions
| Column | Type | Source | Used For |
|---|---|---|---|
| parent_id | UUID FK | Auth user | DB trigger lookup |
| order_id | UUID FK nullable | Checkout API | Audit trail |
| amount | NUMERIC(10,2) | config.ts: NEW_BOOK_AI_CREDIT=15 | Trigger increments balance |
| reason | TEXT | Hardcoded: New Book Purchase | Audit |
| status | TEXT | Hardcoded: completed | Trigger condition |

