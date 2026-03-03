# MindTheMove MVP Plan

## Positioning
MindTheMove is a UK property-services marketplace for home buyers/sellers to find trusted professionals quickly.

## Phase 1 Scope (Fast Launch)
- Landing page with clear value proposition
- Service search intent capture (buy/sell/both + postcode + service)
- Professionals listing page
- "List your business" intake page
- Admin-ready structure for adding moderation + lead routing next

## Scalable Stack Recommendation
- Frontend: Next.js (App Router)
- Backend: Next.js API routes (move to dedicated service later if needed)
- Database: PostgreSQL
- ORM: Prisma
- Auth: Clerk or Supabase Auth
- Messaging: Resend (email) + Twilio/WhatsApp optional later
- Hosting: Vercel + Supabase/Neon

## Data Model (Initial)
- users
- businesses
- business_services
- business_coverage_areas
- reviews
- leads
- lead_matches

## Go-To-Market (First 30 days)
1. Start with one region + legal services.
2. Manually onboard first 20–50 businesses.
3. Focus on SEO pages for key terms (e.g., "conveyancing solicitor in [city]").
4. Track lead volume and response time as key quality metrics.
