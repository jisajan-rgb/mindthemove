# Mind the Move — Phase 1

Trust-first conveyancing directory. Phase 1 is a **Bristol public listing** of authorised firms plus **ops CRUD**. It is not a lead marketplace.

Product: Mind the Move Ltd. Authorised firm on the matter for seed: **Nexa Law Limited, SRA 633024**.

## What this slice includes

- Next.js 14 App Router, TypeScript strict, Tailwind, shadcn/ui
- Prisma schema + migration for User, Organisation, Firm, Listing, Review, AuditLog
- Supabase Auth for ops sign-in; RLS for the Data API
- Public Bristol directory (`/bristol`) showing **listed + diligenced** firms only
- Honest empty review ledger (“reviews unlock after completion” — no fake stars)
- Admin CRUD for firms and listings (`/admin`)
- Seed: Nexa Law Limited only, listed, with `diligencePassedAt` set. **PLC is not seeded and must not appear as listed.**

## What this slice does not include

- Lead, Intro, Match, CompletionEvent
- LEAP, HMLR, completion webhooks, or any “independent completion” claim
- Enquiry-to-intro / pay-per-intro
- Agent brand flows (consumer-first; agents are not the product)
- Stripe / listing fees
- HubSpot, Twilio, Resend
- Partner portal or client portal
- Any copy that reviews “cannot be withheld”

## Product locks

| Lock | Rule |
| --- | --- |
| City | Bristol only (not Solihull / Birmingham) |
| Authorised firm | Nexa Law Limited SRA 633024 |
| O8 | Consumer-first. Agents = disclosed supply only, not brand |
| O3 | No “cannot be withheld” for reviews in P1 |
| O4 | Empty ledger + honest cold-start copy |
| O9 | Live SRA or CLC number **and** ops-set `diligencePassedAt` before directory publish |
| Regulator | `SRA` or `CLC` with a real number (`@@unique([regulator, regulatorNumber])`) |
| Expand gate | **30 reviews / 5 firms** is a product rule. It is documented here, not hard-coded as growth logic. |

## Environment variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Required for a live app:

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Supabase Postgres URI for Prisma (pooled is fine for the app) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key (browser-safe) |

Optional for seed:

| Variable | Purpose |
| --- | --- |
| `ADMIN_USER_ID` | UUID of an existing Supabase Auth user |
| `ADMIN_EMAIL` | Email for that user (linked as `OPS_ADMIN`) |

If these are missing, `npm run build` should still succeed (pages are dynamic and show a configuration message). **Migrate, seed, directory data, and admin CRUD need a real database.**

For `prisma migrate` against Supabase, prefer the **direct** connection (port `5432`) if the pooler rejects migration statements. You can temporarily set `DATABASE_URL` to the direct URI for migrate, then switch back to the pooler for `next dev`.

Never commit real keys. Do not put the service-role key in `NEXT_PUBLIC_*`.

## Local run

```bash
npm install
cp .env.example .env.local
# fill DATABASE_URL + NEXT_PUBLIC_SUPABASE_* 

npx prisma generate
npx prisma migrate deploy   # or: npm run prisma:migrate
npm run prisma:seed
npm run dev
```

Open:

- Public home: http://localhost:3000
- Bristol directory: http://localhost:3000/bristol
- Ops sign-in: http://localhost:3000/login
- Admin: http://localhost:3000/admin

## Database + seed

1. Create a Supabase project (Postgres + Auth).
2. Apply the Prisma migration (`prisma/migrations/20260921120000_phase1_init`). It creates tables **and** RLS policies from `supabase/rls.sql`.
3. Run the seed:

```bash
npm run prisma:seed
```

Seed behaviour:

- Upserts organisation `Mind the Move Ltd` (`slug: mind-the-move`)
- Upserts **Nexa Law Limited** / `SRA` / `633024` with `listed: true`, `clientMoneyOk: true`, and `diligencePassedAt` set
- Ensures an active **Bristol** listing for that firm
- Does **not** insert PLC (or any other firm)
- Does **not** insert reviews (ledger stays empty)
- If `ADMIN_USER_ID` and `ADMIN_EMAIL` are set, upserts that Auth user as `OPS_ADMIN`

Create the ops user in **Supabase Auth → Users** first, then paste the UUID into `.env.local` and re-seed. Alternatively, after Auth signup:

```sql
INSERT INTO users (id, email, role, "organisationId", "createdAt", "updatedAt")
VALUES (
  '<auth-user-uuid>',
  'ops@example.com',
  'OPS_ADMIN',
  (SELECT id FROM organisations WHERE slug = 'mind-the-move'),
  NOW(),
  NOW()
);
```

## RLS (Data API)

Anon/authenticated clients may **read** listed diligenced firms, their active Bristol listings, and reviews for those firms. Writes to firms/listings/audit logs require an authenticated `OPS_ADMIN` row. Reviews have **no write policy** in Phase 1.

The Next.js server uses Prisma (privileged `DATABASE_URL`) and checks Auth + `users.role` in application code. See `ARCHITECTURE.md`.

## Admin publish rules (O9)

- `listed = true` is rejected unless `diligencePassedAt` is set
- `listing.active = true` is rejected unless the firm is already listed with diligence
- Unlisting a firm deactivates its active listings

## Stack notes

- TypeScript `strict`; no `any`
- Zod on every admin API body
- Money: none in P1; future amounts as Decimal pence
- Logs: error codes only, no consumer PII
- Storage: none in P1 (signed URLs only if added later)

Irreversible-ish choices (auth provider, Prisma vs Data API, single ops org) are recorded in `ARCHITECTURE.md`.
