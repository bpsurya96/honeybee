# TODO

## Phase 0 - Foundation
- [x] Initialise Next.js 16 project with TypeScript
- [x] Configure Tailwind CSS v4
- [x] Configure ESLint
- [x] Set up Supabase client (server + client utilities)
- [x] Create .env.example
- [x] Create basic layout (AppLayout component)
- [x] Create header with navigation (AppHeader)
- [x] Create mobile bottom navigation (MobileNav)
- [x] Create landing page (public, marketing)
- [x] Create login page + LoginForm
- [x] Create signup page + SignupForm
- [x] Create auth callback route
- [x] Create protected route wrapper (middleware)
- [x] Create dashboard page
- [x] Create profile page
- [x] Create children list page
- [x] Create new child page with ChildForm
- [x] Create child detail page
- [x] Create edit child page
- [x] Create placeholder pages (products, orders, coach)
- [x] Create 404 page
- [x] Create sign-out API route
- [x] Create TypeScript types
- [x] Create utility functions
- [x] Create initial Supabase migration (full schema + RLS)
- [x] Create seed data SQL script
- [x] Initialise Git repository with initial commit
- [x] Verify build passes (npm run build) - PASSED

## Phase 1 - Parent + Children
- [ ] Test auth flow end-to-end with real Supabase credentials
- [ ] Migrate middleware to proxy convention (Next.js 16)
- [ ] Add delete child functionality (with confirmation dialog)
- [ ] Add avatar upload for children (Supabase Storage)
- [ ] Add parent profile edit form
- [ ] Add avatar upload for parent profile
- [ ] Add child selector in AppHeader (quick switch)
- [ ] Add onboarding flow (first-time parent experience)
- [ ] Write unit tests for child service
- [ ] Write security test (Parent A cannot see Parent B's children)
- [ ] Update CURRENT_STATUS.md

## Phase 2 - Products + Activities
- [ ] Product listing page with real data
- [ ] Product card component
- [ ] Product detail page
- [ ] Activity list (within product)
- [ ] Activity detail component
- [ ] Skills display (badge components)
- [ ] Age range display component
- [ ] Verify seed data (3+ products with activities and skills)
- [ ] Update CURRENT_STATUS.md

## Phase 3 - Orders
- [ ] Orders list page with real data
- [ ] Order detail page
- [ ] Order item with child assignment UI
- [ ] Assign product to child functionality
- [ ] My Library view (child's products)
- [ ] Order service (server-side)
- [ ] Seed sample orders for demo parent
- [ ] Update CURRENT_STATUS.md

## Phase 4 - Learning Progress
- [ ] Mark activity complete (button on activity detail)
- [ ] Activity completion API route
- [ ] Activity history list
- [ ] Overall progress calculation service
- [ ] Skill progress calculation service
- [ ] Child dashboard with real progress bars
- [ ] Progress bar components with animation
- [ ] Skill progress grid
- [ ] Recently completed activities list
- [ ] Seed sample completions for demo children
- [ ] Tests: progress calculation accuracy
- [ ] Update CURRENT_STATUS.md

## Phase 5 - Recommendation Engine
- [ ] Recommendation service (deterministic, no AI)
- [ ] Input: child context (age, skills, completed, owned products)
- [ ] Output: next activities, skill gaps, next products
- [ ] Dashboard: recommended next activities section
- [ ] Dashboard: next product suggestion
- [ ] Tests: recommendation engine logic
- [ ] Update CURRENT_STATUS.md

## Phase 6 - AI Coach
- [ ] AI service layer (isolated, provider-agnostic interface)
- [ ] Child context builder
- [ ] Prompt builder with system prompt and safety constraints
- [ ] AI conversations API route
- [ ] AI messages API route (with rate limiting)
- [ ] Coach chat UI
- [ ] Safety filter / response validator
- [ ] Tests: context builder produces correct context
- [ ] Tests: no cross-parent data leakage
- [ ] Update CURRENT_STATUS.md

## Phase 7 - Commerce
- [ ] Cart context/state (React context)
- [ ] Add to cart button on product detail
- [ ] Cart page / drawer
- [ ] Checkout page
- [ ] Payment provider service layer (isolated interface)
- [ ] Mock payment (dev/test)
- [ ] Order creation on payment success
- [ ] Purchase confirmation page
- [ ] Tests: order creation flow
- [ ] Update CURRENT_STATUS.md

## Phase 8 - PWA
- [ ] PWA manifest (manifest.json)
- [ ] App icons (all required sizes)
- [ ] Service worker / next-pwa setup
- [ ] Offline fallback page
- [ ] Mobile nav review and polish
- [ ] Lighthouse PWA audit
- [ ] Update CURRENT_STATUS.md

## Phase 9 - Production
- [ ] Sentry error monitoring setup
- [ ] Vercel Analytics integration
- [ ] Security review
- [ ] Performance audit (Lighthouse)
- [ ] SEO: meta tags on all public pages
- [ ] Database backup strategy documented
- [ ] Production environment variables in Vercel
- [ ] Production deployment
- [ ] Update CURRENT_STATUS.md
