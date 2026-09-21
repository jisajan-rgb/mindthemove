# Architecture (Phase 1)

Mind the Move Phase 1 is a **trust-first public directory** plus **ops CRUD**. This note records the few choices that are annoying to reverse later. Prefer the reversible option unless a lock is already in the product brief.

## Auth

- **Provider:** Supabase Auth (email/password).
- **Authorization source:** `public.users`, keyed by `auth.users.id`. `OPS_ADMIN` is the only Phase 1 role.
- **Why this split:** swapping IdP later does not require rewriting Firm/Listing data; you migrate `users.id` (or keep UUIDs) and keep the rest.
- **Not used:** Clerk, HTTP Basic Auth, magic-link-only, social login.

## Data access and RLS

- Next.js server code (directory pages, admin APIs) uses **Prisma** with `DATABASE_URL`. That connection is typically the Postgres role / pooler and **bypasses RLS**.
- **RLS still ships** in `supabase/rls.sql` (applied by the init migration) so the Supabase Data API (`anon` / user JWT) cannot read unlisted firms, inactive listings, or audit logs.
- Public directory HTML is server-rendered; it does not depend on the browser calling PostgREST.
- Reversible: a later phase can drive reads through the anon key if we want RLS on the request path. Do not introduce a second ORM.

## Tenancy

- One ops `Organisation` (`mind-the-move`) for Mind the Move Ltd.
- **Firms are directory entities, not tenants.** Listings hang off firms. There is no partner portal and no per-firm login in Phase 1.
- Reversible: adding firm users later is a new table, not a rewrite of Firm.

## Geography

- `City` enum is locked to `BRISTOL`. Listings may also store BS outward codes.
- Adding Solihull/Birmingham (or anywhere else) is an explicit schema + product change. Do not treat city as a free-text field.

## Reviews

- `reviews` exists so the public UI can show an **honest empty ledger**.
- **No Phase 1 write path** (API or UI) for reviews.
- Optional column `firmAttestedCompletedAt` is labelled as **firm-attested and delayable**. It is not independent completion, not a webhook, and never “cannot be withheld”.

## Money

- No money columns in Phase 1. When fees appear, store **Decimal pence**, never floats.

## Storage / GDPR

- No file storage in Phase 1. If storage is added, use **short-lived signed URLs** only. Do not log consumer PII.

## Waitlist signals

- `waitlist_signals` stores **soft-test interest** (named-lawyer shortlist requests). It is not a Lead, Intro, or Match.
- Public POST `/api/waitlist` validates with Zod, writes via Prisma, and logs only error codes (no PII).
- No confirmation email is sent from the app. In-page success copy is the only automated acknowledgement until Counsel clears outbound mail.
- Reversible: a later product path can map these rows into a real workflow without renaming the public form into a lead panel.

## Out of scope (do not add without a new signed brief)

Lead, Intro, Match, CompletionEvent, LEAP, HMLR, enquiry-to-intro, agent brand flows, Stripe, HubSpot, Twilio, Resend, partner/client portals.
