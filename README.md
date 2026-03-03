# MindTheMove.co MVP

Checkatrade-style referral marketplace for UK property transactions, starting with legal/conveyancing support for home buyers and sellers.

## Current MVP pages

- `/` → landing page + lead capture
- `/professionals` → sample professional listing directory
- `/list-your-business` → provider onboarding form
- `/admin` → protected moderation dashboard (Basic Auth)

## Local development

```bash
npm install
cp .env.example .env.local
# set DATABASE_URL in .env.local
npm run prisma:generate
npm run prisma:push
npm run dev
```

Open: `http://localhost:3000`

## Deploy to Vercel (public URL)

### Option A — GitHub + Vercel (recommended)

1. Push this `mindthemove/` folder to a GitHub repo.
2. Go to: https://vercel.com/new
3. Import the repo.
4. Vercel auto-detects Next.js.
5. Click **Deploy**.

You’ll get a public URL like:
`https://mindthemove-xyz.vercel.app`

### Option B — Vercel CLI

```bash
npm i -g vercel
vercel login
vercel
```

Then for production:

```bash
vercel --prod
```

## Environment variables

Copy `.env.example` to `.env.local` for local setup:

```bash
cp .env.example .env.local
```

Important for admin access:
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`

These protect `/admin` and `/api/admin/*` using HTTP Basic Auth.

Public API hardening now includes:
- rate limiting on lead/application endpoints
- honeypot anti-spam fields
- stricter payload validation

Phase B additions:
- lead-to-business auto matching (service + coverage + quality score)
- baseline partner quality scoring on approval
- admin KPI cards (pending/approved/leads/match rate)

After pulling latest changes, run:
```bash
npm run prisma:generate
npm run prisma:push
```

## Fast next steps (Phase 1)

1. Add Prisma + PostgreSQL schema
2. Wire lead form to `/api/leads`
3. Add admin moderation dashboard
4. Add search/filter with real data
5. Add SEO service/city landing pages
