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

-- waitlist_signals RLS lives in prisma/migrations/20260921140000_waitlist_signals
-- (no anon access; ops read via is_ops_admin).
