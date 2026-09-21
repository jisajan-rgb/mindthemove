-- Phase 1 schema (Prisma) + Supabase RLS.
-- Tables first, then policies from supabase/rls.sql.

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('OPS_ADMIN');

-- CreateEnum
CREATE TYPE "Regulator" AS ENUM ('SRA', 'CLC');

-- CreateEnum
CREATE TYPE "City" AS ENUM ('BRISTOL');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'OPS_ADMIN',
    "organisationId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organisations" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organisations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "firms" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "regulator" "Regulator" NOT NULL,
    "regulatorNumber" TEXT NOT NULL,
    "listed" BOOLEAN NOT NULL DEFAULT false,
    "clientMoneyOk" BOOLEAN NOT NULL DEFAULT false,
    "diligenceNotes" TEXT,
    "diligencePassedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "firms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "listings" (
    "id" UUID NOT NULL,
    "firmId" UUID NOT NULL,
    "city" "City" NOT NULL DEFAULT 'BRISTOL',
    "postcodeOutwardCodes" TEXT[],
    "active" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "listings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" UUID NOT NULL,
    "firmId" UUID NOT NULL,
    "listingId" UUID,
    "comment" TEXT,
    "rating" INTEGER,
    "firmAttestedCompletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL,
    "actorUserId" UUID,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "organisations_slug_key" ON "organisations"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "firms_regulator_regulatorNumber_key" ON "firms"("regulator", "regulatorNumber");

-- CreateIndex
CREATE INDEX "listings_city_active_idx" ON "listings"("city", "active");

-- CreateIndex
CREATE INDEX "audit_logs_entityType_entityId_idx" ON "audit_logs"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "organisations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listings" ADD CONSTRAINT "listings_firmId_fkey" FOREIGN KEY ("firmId") REFERENCES "firms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_firmId_fkey" FOREIGN KEY ("firmId") REFERENCES "firms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "listings"("id") ON DELETE SET NULL ON UPDATE CASCADE;


-- ---------------------------------------------------------------------------
-- Row Level Security (Supabase Data API)
-- ---------------------------------------------------------------------------

-- Phase 1 RLS for Supabase Data API (anon / authenticated roles).
-- Applied by prisma/migrations/20260921120000_phase1_init after tables exist.
--
-- The Next.js server uses Prisma with DATABASE_URL (typically the Postgres
-- role / service connection) and therefore bypasses RLS. RLS is defence in
-- depth for PostgREST and any client that uses the anon or user JWT.
-- See ARCHITECTURE.md.

ALTER TABLE organisations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE firms ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

GRANT USAGE ON SCHEMA public TO anon, authenticated;

GRANT SELECT ON TABLE firms, listings, reviews TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE firms, listings, reviews, organisations, users, audit_logs TO authenticated;

-- SECURITY DEFINER so admin checks do not recurse through users RLS.
CREATE OR REPLACE FUNCTION public.is_ops_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.users
    WHERE id = auth.uid()
      AND role = 'OPS_ADMIN'
  );
$$;

REVOKE ALL ON FUNCTION public.is_ops_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_ops_admin() TO authenticated;

-- ---------------------------------------------------------------------------
-- Public read: listed firms that have passed diligence (O9)
-- ---------------------------------------------------------------------------
CREATE POLICY firms_public_read ON firms
  FOR SELECT
  TO anon, authenticated
  USING (listed = true AND "diligencePassedAt" IS NOT NULL);

CREATE POLICY listings_public_read ON listings
  FOR SELECT
  TO anon, authenticated
  USING (
    active = true
    AND city = 'BRISTOL'
    AND EXISTS (
      SELECT 1
      FROM firms f
      WHERE f.id = listings."firmId"
        AND f.listed = true
        AND f."diligencePassedAt" IS NOT NULL
    )
  );

CREATE POLICY reviews_public_read ON reviews
  FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM firms f
      WHERE f.id = reviews."firmId"
        AND f.listed = true
        AND f."diligencePassedAt" IS NOT NULL
    )
  );

-- ---------------------------------------------------------------------------
-- Authenticated ops admin writes
-- ---------------------------------------------------------------------------
CREATE POLICY firms_admin_all ON firms
  FOR ALL
  TO authenticated
  USING (public.is_ops_admin())
  WITH CHECK (public.is_ops_admin());

CREATE POLICY listings_admin_all ON listings
  FOR ALL
  TO authenticated
  USING (public.is_ops_admin())
  WITH CHECK (public.is_ops_admin());

-- No public or admin review write policy in Phase 1. The table is a ledger
-- only. Adding a write path that claims independent completion is out of scope.

CREATE POLICY organisations_admin_read ON organisations
  FOR SELECT
  TO authenticated
  USING (public.is_ops_admin());

CREATE POLICY users_self_or_admin_read ON users
  FOR SELECT
  TO authenticated
  USING (id = auth.uid() OR public.is_ops_admin());

CREATE POLICY audit_logs_admin_read ON audit_logs
  FOR SELECT
  TO authenticated
  USING (public.is_ops_admin());

CREATE POLICY audit_logs_admin_insert ON audit_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_ops_admin());
