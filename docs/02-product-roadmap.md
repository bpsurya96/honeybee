# 02 - Product Roadmap

## Phase 0 - Foundation
Goal: Working Next.js app with Supabase connection and auth foundation.

Deliverables:
- Next.js 14 project with TypeScript
- Tailwind CSS configured
- Supabase client configured
- Basic layout: header, navigation, footer
- Landing page (public)
- Auth pages: signup, login, logout
- Environment configuration
- Git repository
- All documentation created

Acceptance: App runs locally. User can view landing page.

---

## Phase 1 - Parent + Children
Goal: A parent can create an account, log in, and manage multiple child profiles.

Deliverables:
- Email/password auth via Supabase Auth
- Parent profile page (name, avatar)
- Create child (name, DOB, gender optional)
- Edit child
- Delete child
- Multiple children UI
- Child selector / switcher
- Protected routes (redirect unauthenticated users)

Acceptance: Parent can create multiple children and switch between them.

---

## Phase 2 - Products + Activities
Goal: Products, skills, and activities can be browsed.

Deliverables:
- Product model in database
- Skill model and categories
- Activity model
- Age stage model
- Product listing page
- Product detail page (with activities and skills)
- Activity detail view
- Seed/demo data

Acceptance: Parent can browse products and see associated activities.

---

## Phase 3 - Orders
Goal: Products can be owned by parents and assigned to children.

Deliverables:
- Order model
- Order item model
- Assign product to child
- Order list page
- Order detail page
- My library (products assigned to each child)

Acceptance: Parent has Order 1001. Product "ABC Activity Book" is assigned to child "Aarav".

---

## Phase 4 - Learning Progress
Goal: Activity completion is tracked per child. Dashboard shows real progress.

Deliverables:
- Mark activity as complete
- Activity completion history
- Learning session tracking
- Overall progress calculation
- Skill-area progress calculation
- Dashboard with real data

Acceptance: Child A has 72% progress. Fine Motor 80%, Language 65%, etc.

---

## Phase 5 - Recommendation Engine
Goal: A deterministic engine recommends next activities without AI.

Deliverables:
- Recommendation service (server-side)
- Input: child, age, skills, completed, available
- Output: recommended activities, recommended skills, potential next products
- Dashboard integration

Acceptance: Engine produces recommendations without AI.

---

## Phase 6 - AI Coach
Goal: HoneyBee Coach answers parent questions using structured context.

Deliverables:
- AI service layer (isolated from DB)
- Child context builder
- Prompt construction
- API route for AI chat
- Chat UI component
- Safety filters (no medical claims)

Acceptance: Parent asks "What should my child do today?" and receives grounded, relevant advice.

---

## Phase 7 - Commerce
Goal: Parent can purchase products from within the app.

Deliverables:
- Cart functionality
- Checkout flow
- Payment provider integration (isolated behind service layer)
- Order creation on payment success
- Purchase confirmation

Acceptance: Parent adds product to cart, completes checkout, order is created.

---

## Phase 8 - PWA
Goal: App is installable on mobile.

Deliverables:
- PWA manifest
- App icons
- Service worker / caching strategy
- Offline handling
- Mobile-optimised navigation

Acceptance: App can be installed on iOS/Android home screen.

---

## Phase 9 - Production
Goal: Production-ready, secure, monitored deployment.

Deliverables:
- Production Vercel deployment
- Error monitoring (Sentry or similar)
- Analytics integration
- Security review
- Database backup strategy
- Performance optimisation
- SEO for public pages

Acceptance: App runs reliably in production.
