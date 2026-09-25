# 10 - Security & Privacy

## Authentication
- Supabase Auth for all authentication
- JWT tokens, never stored in localStorage (use httpOnly cookies or Supabase session management)
- Session expiry enforced
- Password reset via email

## Authorisation
- Row Level Security (RLS) on every parent-owned table
- RLS policies check auth.uid() against parent_id / user_id
- Admin actions require a separate admin role claim
- Least-privilege: read only what is needed

## Data Isolation
- Parent A cannot access Parent B's children, orders, progress, or AI conversations
- This is enforced at the database level via RLS, not just application logic
- Test for cross-parent data leakage in every test suite

## API Security
- All protected API routes verify Supabase session
- Input validated with Zod before any DB operation
- SQL injection: prevented by using Supabase client parameterised queries
- Output: never expose raw DB errors to the client

## Children's Data
- Children are minors - handle their data with extra care
- Collect only: name, date of birth, gender (optional), photo (optional)
- No location data
- No unnecessary identifying information
- Child data can be fully deleted on request (cascade delete)
- Do not use child data for any purpose other than the learning platform

## Privacy by Design
- Collect only necessary data
- Retention policy: data deleted on account deletion
- No third-party tracking scripts on authenticated pages
- Analytics: use privacy-respecting, aggregated-only analytics where possible

## Environment Variables
- No secrets committed to Git
- .env files in .gitignore
- .env.example contains only placeholder values
- Server-only secrets never exposed to browser (no NEXT_PUBLIC_ prefix for secrets)

## Storage
- Profile photos and product images stored in Supabase Storage
- Storage buckets have appropriate access policies
- Private buckets for user uploads; public buckets for product imagery

## AI Safety
- Child context sent to LLM is structured and controlled
- No raw database queries from the LLM
- AI responses validated before storage
- Conversation history access is parent-scoped

## GDPR / Privacy Compliance (future)
- Data export functionality (right to access)
- Data deletion functionality (right to erasure)
- Privacy policy page
- Cookie consent
- Terms of service
