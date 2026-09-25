# 07 - API Design

## Conventions
- Base path: /api/v1/
- Auth: All protected routes require Authorization header (Supabase JWT)
- Format: JSON request and response bodies
- Errors: { error: string, code: string }
- Success: { data: T, meta?: { count, page } }

## Auth Routes
POST /api/auth/signup
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me

## Profile Routes
GET  /api/profile
PUT  /api/profile

## Children Routes
GET    /api/children               - list parent's children
POST   /api/children               - create child
GET    /api/children/:id           - get child (with age calculated)
PUT    /api/children/:id           - update child
DELETE /api/children/:id           - delete child (and all associated data)
GET    /api/children/:id/dashboard - full child dashboard data
GET    /api/children/:id/progress  - skill progress breakdown

## Products Routes (public)
GET /api/products                  - list all active products
GET /api/products/:slug            - product detail with activities

## Orders Routes
GET  /api/orders                   - parent's orders
POST /api/orders                   - create order
GET  /api/orders/:id               - order detail
PUT  /api/orders/:id/items/:itemId/assign - assign product to child

## Activities Routes
GET  /api/activities/:id           - activity detail
POST /api/children/:childId/activities/:activityId/complete   - mark complete
DELETE /api/children/:childId/activities/:activityId/complete - unmark

## Recommendations Routes
GET /api/children/:id/recommendations - get recommendations for child

## AI Coach Routes
GET  /api/coach/conversations                     - list conversations
POST /api/coach/conversations                     - create conversation
POST /api/coach/conversations/:id/messages        - send message + get AI reply
GET  /api/coach/conversations/:id/messages        - message history

## Input Validation
All POST/PUT routes validate with Zod schemas.
Reject unknown fields.
Return 422 for validation errors.

## Security
- Verify Supabase session on every protected route
- Check resource ownership before returning/modifying data
- Never return another user's data
- Rate limit AI coach routes
