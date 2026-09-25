# 05 - Technical Architecture

## System Overview

```
Browser (Next.js React)
    |
    |  HTTP/WebSocket
    v
Next.js Server (API Routes + Server Components)
    |              |
    |              |-- Supabase Auth
    |              |-- Supabase PostgreSQL (RLS)
    |              |-- Supabase Storage
    |              |-- AI Service Layer (LLM API)
    v
External APIs:
    - LLM Provider (Gemini / OpenAI)
    - Payment Provider (future: Stripe)
```

## Technology Stack

### Frontend
- Framework: Next.js 14 (App Router)
- Language: TypeScript
- Styling: Tailwind CSS
- State: React hooks + React Query / SWR for server state
- Forms: React Hook Form + Zod
- Icons: Lucide React

### Backend
- Runtime: Next.js API Routes (Edge/Node)
- Language: TypeScript
- ORM/Query: Supabase JS client (server-side)
- Validation: Zod

### Database
- Provider: Supabase
- Engine: PostgreSQL
- Security: Row Level Security (RLS) on all tables
- Migrations: Supabase Migrations

### Authentication
- Provider: Supabase Auth
- Method: Email/password (initial)
- Sessions: JWT via Supabase
- SSR: @supabase/ssr package

### File Storage
- Provider: Supabase Storage
- Used for: Profile photos, product images

### AI
- Service: Isolated AI service layer
- Initial provider: Google Gemini or OpenAI
- Architecture: Context builder -> Prompt builder -> LLM -> Response validator

### Deployment
- Platform: Vercel
- CI/CD: GitHub Actions or Vercel auto-deploy
- Branch strategy: main (prod), develop (staging)

## Key Architectural Decisions

1. Next.js App Router - modern, server-first React
2. Supabase for all backend primitives - auth, DB, storage in one platform
3. RLS on every table - data isolation is a hard requirement
4. AI service layer is isolated - provider can be swapped without touching UI
5. Deterministic recommendation engine before AI - AI explains, does not invent
6. PWA-first - no native app initially, but API designed for future React Native

## Directory Structure

```
honeybee_V2/
  src/
    app/                    # Next.js App Router pages
      (auth)/               # Auth route group
      (protected)/          # Protected route group
      (public)/             # Public route group
      api/                  # API routes
    components/
      ui/                   # Base UI components
      forms/                # Form components
      layout/               # Layout components
      children/             # Child-related components
      learning/             # Learning/activity components
      dashboard/            # Dashboard components
    lib/
      supabase/             # Supabase client utilities
      ai/                   # AI service layer
      recommendations/      # Recommendation engine
      utils/                # Shared utilities
    types/                  # TypeScript type definitions
    hooks/                  # Custom React hooks
    services/               # Business logic services
  docs/
  agent/
  supabase/
    migrations/             # Database migrations
    seed.sql                # Seed data
  public/
```

## API Design Principles
- All mutations go through API routes (never direct Supabase from client for mutations)
- Reads can use Supabase client directly from server components
- API routes validate input with Zod before any DB operation
- API routes check ownership before any DB operation
- Never expose raw database errors to the client
