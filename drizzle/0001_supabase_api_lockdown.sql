-- Supabase is used purely as a Postgres database: all reads and writes go
-- through the Next.js server, which connects as the database owner.
--
-- Supabase also exposes every table in the "public" schema through its
-- auto-generated REST/GraphQL API using the "anon" and "authenticated" roles.
-- RLS (enabled in 0000) with no policies already blocks every row for those
-- roles; revoking their table privileges as well is defence in depth.
--
-- The roles only exist on Supabase, so this is a no-op on plain Postgres.
DO $$
DECLARE
  api_role text;
BEGIN
  FOREACH api_role IN ARRAY ARRAY['anon', 'authenticated'] LOOP
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = api_role) THEN
      EXECUTE format('REVOKE ALL ON ALL TABLES IN SCHEMA public FROM %I', api_role);
      EXECUTE format('REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM %I', api_role);
      EXECUTE format('ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM %I', api_role);
      EXECUTE format('ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON SEQUENCES FROM %I', api_role);
    END IF;
  END LOOP;
END $$;
