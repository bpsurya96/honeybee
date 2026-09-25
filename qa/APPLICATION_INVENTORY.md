# APPLICATION INVENTORY

## Routes Discovered

| Route | Page Name | Authentication Required | User Role | Purpose | API Dependencies | Database Dependencies |
|-------|-----------|-------------------------|-----------|---------|------------------|-----------------------|
| `/` | Landing Redirect | No | Any | Redirects to dashboard | None | None |
| `/login` | Sign In | No | Guest | Authenticate user | Supabase Auth | profiles |
| `/signup` | Sign Up | No | Guest | Register user | Supabase Auth | profiles |
| `/onboarding` | Profile Setup | Yes | Parent | First-time setup (add child) | `/api/profile` | profiles, children |
| `/dashboard` | Parent Dashboard | Yes | Parent | Overview of children and stats | None | children, activities |
| `/children` | Children List | Yes | Parent | Manage child profiles | None | children |
| `/children/new` | Add Child | Yes | Parent | Create new child profile | `/api/children` | children |
| `/children/[id]` | Child Dashboard | Yes | Parent | "My Library", Skill Radar Chart | None | children, child_activities, child_products |
| `/products` | Catalog | Yes | Parent | View available kits | None | products, activities |
| `/products/[id]` | Product Details | Yes | Parent | View kit details and activities | None | products, activities, skills |
| `/orders` | Order History | Yes | Parent | View past purchases | None | orders, order_items |
| `/orders/[id]` | Order Details | Yes | Parent | Assign kit to child | `/api/orders/assign` | orders, child_products |
| `/activities/[id]`| Activity Detail | Yes | Parent | View/Complete activity | `/api/activities/complete`| activities, child_activities |
| `/coach` | AI Coach | Yes | Parent | AI Parenting assistant | `/api/chat` | profiles, children |

## User Roles Implemented
1. **Guest**: Can access login and signup pages. Redirected away from protected routes.
2. **Parent**: Can access all `/(protected)` routes, manage their own children, place orders, assign kits, and chat with the AI.

