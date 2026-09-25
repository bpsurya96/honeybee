# 15 - Decision Log

## Decision Format
Date | Decision | Reason | Alternatives Considered | Impact

---

## 2026-09-25 | Next.js 14 selected as frontend framework
Reason: Server components, API routes, and TypeScript support in one framework. Vercel deployment is first-class.
Alternatives: Remix, SvelteKit, plain React
Impact: All UI and API routes in one codebase. Future React Native app will use same Supabase backend.

## 2026-09-25 | Supabase selected as backend platform
Reason: Provides PostgreSQL, Auth, Storage, and RLS in one managed platform. Reduces infrastructure complexity for initial MVP.
Alternatives: Firebase, PlanetScale + Auth0, custom Express API
Impact: All data stored in Supabase. RLS handles data isolation. Supabase client used server-side.

## 2026-09-25 | Tailwind CSS selected for styling
Reason: Utility-first CSS aligns with component-based development. Good Tailwind UI ecosystem. Fast iteration.
Alternatives: CSS Modules, Styled Components, Vanilla CSS
Impact: All styling via Tailwind classes. Custom design tokens via tailwind.config.

## 2026-09-25 | PWA-first, native app deferred
Reason: Faster time to market. Web app can be installed as PWA. Backend APIs designed for future React Native app.
Alternatives: React Native from the start
Impact: API design must be clean and not tied to web-specific patterns.

## 2026-09-25 | Deterministic recommendation engine before AI
Reason: AI should explain recommendations, not invent them. A rules-based engine is more reliable, testable, and transparent.
Alternatives: AI-only recommendations
Impact: Phase 5 (Recommendation Engine) must be complete before Phase 6 (AI Coach).

## 2026-09-25 | Product-to-Child via Order (not direct assignment)
Reason: Correct e-commerce model. A product is purchased by the parent, then assigned to a child. This allows one product to be assigned to different children, and tracks purchase history correctly.
Alternatives: Direct child-product assignment without order tracking
Impact: child_products table references order_items, not products directly.

## 2026-09-25 | Age calculated, never stored
Reason: Avoids stale data. Age is always calculated from date_of_birth at query time.
Alternatives: Store age and update with a cron job
Impact: All age-related queries calculate from date_of_birth.

## 2026-09-25 | Progress percentages calculated, never stored
Reason: Progress is a derived value. Storing it creates sync issues between stored % and actual completion data.
Alternatives: Store and update on each completion event
Impact: Progress queries JOIN child_activities with activities. May need caching in future if slow.

## 2026-09-25 | AI has no direct database access
Reason: Prevents AI from inventing or misinterpreting database content. All context is prepared by the application layer.
Alternatives: LLM with database tool access
Impact: Context builder and prompt builder must be maintained carefully.
