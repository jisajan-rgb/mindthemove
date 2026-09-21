-- CreateEnum
CREATE TYPE "WaitlistMoveIntent" AS ENUM ('BUYING', 'SELLING', 'BOTH', 'NOT_SURE');

-- CreateTable
CREATE TABLE "waitlist_signals" (
    "id" UUID NOT NULL,
    "firstName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "moveIntent" "WaitlistMoveIntent" NOT NULL,
    "timeline" TEXT,
    "notes" TEXT,
    "consent" BOOLEAN NOT NULL,
    "via" TEXT NOT NULL DEFAULT 'waitlist',
    "status" TEXT NOT NULL DEFAULT 'shortlist_pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "waitlist_signals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "waitlist_signals_createdAt_idx" ON "waitlist_signals"("createdAt");

ALTER TABLE waitlist_signals ENABLE ROW LEVEL SECURITY;

-- Supabase Data API roles. Skipped on vanilla Postgres (no anon/authenticated).
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    GRANT SELECT ON TABLE waitlist_signals TO authenticated;
    EXECUTE $policy$
      CREATE POLICY waitlist_admin_read ON waitlist_signals
        FOR SELECT
        TO authenticated
        USING (public.is_ops_admin());
    $policy$;
  END IF;
END $$;
