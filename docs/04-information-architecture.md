# 04 - Information Architecture

## Site Structure

### Public (unauthenticated)
- / (Landing page)
- /about
- /products (browse catalogue)
- /products/[slug] (product detail)
- /login
- /signup

### Protected (authenticated parent)
- /dashboard (parent home - children overview)
- /children (manage children)
- /children/[id] (child dashboard)
- /children/[id]/activities (child activity list)
- /children/[id]/activities/[activityId] (activity detail)
- /children/[id]/progress (detailed progress view)
- /products (browse with "buy" actions)
- /products/[slug] (product detail with purchase)
- /orders (order history)
- /orders/[id] (order detail)
- /coach (HoneyBee AI Coach - global)
- /coach/[childId] (Coach with child context)
- /profile (parent profile settings)
- /onboarding (first-time setup wizard)

### Admin (future)
- /admin/* (separate admin section)

## Navigation

### Primary Navigation (desktop - sidebar/top)
1. Home (Dashboard)
2. My Children
3. Learning
4. Products
5. Orders
6. HoneyBee Coach
7. Profile / Settings

### Mobile Navigation (bottom bar)
1. Home
2. Children
3. Coach
4. Products
5. Profile

### Navigation State
- Unauthenticated: Landing, Login, Signup, public Products
- Authenticated: Full navigation

## Key UI Patterns
- Child selector in header (for quick switching)
- Contextual breadcrumbs on child-specific pages
- Sticky bottom nav on mobile
- Modal/drawer for quick actions
- Toast notifications for completions/saves
