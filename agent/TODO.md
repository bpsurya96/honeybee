# TODO

## Phase 0 — Foundation
- [ ] Initialise Next.js 14 project with TypeScript
- [ ] Configure Tailwind CSS
- [ ] Configure ESLint and Prettier
- [ ] Set up Supabase client (server + client utilities)
- [ ] Create .env.example
- [ ] Create basic layout (AppLayout component)
- [ ] Create header with navigation
- [ ] Create mobile bottom navigation
- [ ] Create landing page (public, marketing)
- [ ] Create login page
- [ ] Create signup page
- [ ] Create protected route wrapper
- [ ] Configure Next.js middleware for auth
- [ ] Initialise Git repository
- [ ] Create initial Supabase migration (full schema)
- [ ] Create seed data SQL script
- [ ] Verify build passes (npm run build)
- [ ] Update CURRENT_STATUS.md

## Phase 1 — Parent + Children
- [ ] Parent profile page
- [ ] Profile edit form
- [ ] Create child form (name, DOB, gender, photo)
- [ ] Children list page
- [ ] Child card component
- [ ] Edit child page
- [ ] Delete child (with confirmation)
- [ ] Child selector in header
- [ ] Onboarding flow (first child)
- [ ] Protected route checks
- [ ] Unit tests for child service
- [ ] Update CURRENT_STATUS.md

## Phase 2 — Products + Activities
- [ ] Product listing page
- [ ] Product card component
- [ ] Product detail page
- [ ] Activities list (within product)
- [ ] Activity detail component
- [ ] Skills display (badge components)
- [ ] Age range display
- [ ] Seed: 3+ products with activities
- [ ] Seed: Skills and skill categories
- [ ] Update CURRENT_STATUS.md

## Phase 3 — Orders
- [ ] Orders list page
- [ ] Order detail page
- [ ] Order item with child assignment
- [ ] Assign product to child UI
- [ ] My Library view (child -> products)
- [ ] Order service
- [ ] Seed: Sample orders for demo parent
- [ ] Update CURRENT_STATUS.md

## Phase 4 — Learning Progress
- [ ] Mark activity complete (button on activity detail)
- [ ] Activity history list
- [ ] Overall progress calculation (service)
- [ ] Skill progress calculation (service)
- [ ] Child dashboard with real progress
- [ ] Progress bar components
- [ ] Skill progress grid
- [ ] Recently completed activities
- [ ] Seed: Sample completions for demo children
- [ ] Tests: progress calculation
- [ ] Update CURRENT_STATUS.md

## Phase 5 — Recommendation Engine
- [ ] Recommendation service (deterministic)
- [ ] Input: child context
- [ ] Output: next activities, skill focus, next products
- [ ] Dashboard: recommended next activities
- [ ] Dashboard: next product suggestion
- [ ] Tests: recommendation engine
- [ ] Update CURRENT_STATUS.md

## Phase 6 — AI Coach
- [ ] AI service layer (isolated, provider-agnostic)
- [ ] Child context builder
- [ ] Prompt builder with system prompt
- [ ] AI conversations API route
- [ ] AI messages API route
- [ ] Coach chat UI
- [ ] Safety filter / response validator
- [ ] Rate limiting
- [ ] Tests: context builder
- [ ] Tests: no cross-parent data
- [ ] Update CURRENT_STATUS.md

## Phase 7 — Commerce
- [ ] Cart context/state
- [ ] Add to cart button on product
- [ ] Cart page / drawer
- [ ] Checkout page
- [ ] Payment provider service layer
- [ ] Mock payment (dev)
- [ ] Order creation on payment success
- [ ] Purchase confirmation page
- [ ] Tests: order creation
- [ ] Update CURRENT_STATUS.md

## Phase 8 — PWA
- [ ] PWA manifest (manifest.json)
- [ ] App icons (all required sizes)
- [ ] Service worker / next-pwa setup
- [ ] Offline page
- [ ] Mobile nav review
- [ ] Lighthouse PWA audit
- [ ] Update CURRENT_STATUS.md

## Phase 9 — Production
- [ ] Sentry error monitoring
- [ ] Vercel Analytics
- [ ] Security review
- [ ] Performance audit
- [ ] SEO: meta tags on public pages
- [ ] Database backup strategy
- [ ] Production environment variables
- [ ] Production deployment
- [ ] Update CURRENT_STATUS.md
