# 14 - Development Guidelines

## Code Standards
- Language: TypeScript everywhere (strict mode)
- Linter: ESLint with Next.js preset
- Formatter: Prettier
- No eslint-disable unless absolutely necessary (document why)

## File Naming
- React components: PascalCase (ChildCard.tsx)
- Utilities/hooks: camelCase (useChildProfile.ts)
- API routes: Next.js convention (route.ts)
- Types: PascalCase (Child.ts or types/index.ts)

## Component Guidelines
- Keep components small and focused
- Separate business logic from UI
- Use custom hooks for data fetching
- Use server components for data-fetching, client components for interactivity
- Always handle loading, error, and empty states
- Use TypeScript props interfaces, never 'any'

## Data Access Pattern
- Server Components: can use Supabase server client directly
- Client Components: fetch via custom hooks calling API routes or Supabase client
- API Routes: validate input -> check auth -> check ownership -> query DB -> return

## Services Layer
Business logic lives in src/services/:
- childService.ts
- activityService.ts
- recommendationService.ts
- aiService.ts
- orderService.ts

Services take typed inputs and return typed outputs.
Services do not know about HTTP or UI.

## Type Definitions
All DB types in src/types/database.ts (generated or manually maintained).
All application types in src/types/*.ts.
Never use 'any'. Use 'unknown' if type is genuinely unknown.

## Error Handling
- All async operations have try/catch
- API routes return appropriate HTTP status codes
- Never expose internal errors to the client
- Log errors server-side

## Git Workflow
- main: production-ready code only
- develop: integration branch
- feature/xxx: feature branches
- Commit messages: conventional commits (feat:, fix:, docs:, chore:)

## Environment Variables
- NEXT_PUBLIC_ prefix: safe for browser
- No NEXT_PUBLIC_ prefix: server-only
- Never put secrets in NEXT_PUBLIC_ variables

## Performance
- Use Next.js Image component for all images
- Use React.lazy / dynamic imports for heavy components
- Avoid unnecessary re-renders (useMemo, useCallback where beneficial)
- Server-side rendering for SEO pages

## Accessibility
- All form inputs have labels
- All images have alt text
- Colour contrast meets WCAG AA
- Keyboard navigation works on all interactive elements
