# 13 - Deployment

## Platform
- Hosting: Vercel
- Database: Supabase (cloud)
- Source control: GitHub

## Environments
- Production: main branch -> auto-deploy to prod Vercel project
- Staging: develop branch -> auto-deploy to staging Vercel project
- Local: npm run dev

## Environment Variables
See .env.example for required variables.
Set in Vercel dashboard for prod/staging.
Never commit .env.local or .env.

## Deployment Steps
1. Push to GitHub
2. Vercel picks up the change
3. Build runs (npm run build)
4. If build passes, deploys
5. Supabase migrations run separately via Supabase CLI

## Database Migrations
Run via Supabase CLI:
supabase db push (applies pending migrations to linked project)
Never alter schema manually in the Supabase dashboard for production.

## Vercel Configuration
- Framework: Next.js
- Build command: npm run build
- Output directory: .next
- Install command: npm install

## Domain
- Production: app.honeybeelearning.com (future)
- Staging: staging-honeybee.vercel.app (future)

## Monitoring (Phase 9)
- Error monitoring: Sentry
- Uptime monitoring: Vercel analytics + external ping
- Performance: Vercel Web Analytics / Google Lighthouse CI

## Rollback
- Vercel supports instant rollback to previous deployment
- Database: take Supabase backup before any migration
