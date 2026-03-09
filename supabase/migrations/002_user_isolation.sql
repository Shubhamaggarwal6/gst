-- Index on parent_user_id for faster employee lookups per user
create index if not exists idx_app_users_parent_user_id on public.app_users(parent_user_id);

-- ─── DATA ISOLATION NOTE ─────────────────────────────────────────────────────
-- This app uses custom authentication (not Supabase Auth), so RLS policies
-- cannot use auth.uid() to restrict access at the database level.
--
-- Data isolation between users is enforced at the application level:
--   • Products, invoices, customers, payments, and purchases are filtered
--     by user_id in every query (see supabaseDb.ts).
--   • Employees are linked to their parent user via parent_user_id; each
--     user only sees employees where parent_user_id = their own id.
--   • When an employee logs in, data is fetched using the parent user's id,
--     ensuring employees see the same data as their parent account.
--
-- The permissive RLS policies (using (true)) remain because the anon key
-- is the only authentication method. All access control is handled by the
-- application's query filters and role-based UI routing.
