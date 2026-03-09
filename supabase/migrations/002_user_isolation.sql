-- Index on parent_user_id for faster employee lookups per user account
create index if not exists idx_app_users_parent_user_id on public.app_users(parent_user_id);

-- ─── DATA ISOLATION NOTES ────────────────────────────────────────────────────
-- This app uses custom authentication (not Supabase Auth), so RLS policies
-- cannot use auth.uid() to restrict access at the database level.
--
-- Data isolation between user accounts is enforced at the application level:
--   • Products, invoices, customers, payments, and purchases are filtered
--     by user_id in every Supabase query (see supabaseDb.ts).
--   • Employees are linked to their parent user via parent_user_id; each
--     user only sees employees where parent_user_id matches their own id.
--   • When an employee logs in, data is fetched using the parent user's id
--     (parentUserId), ensuring employees see the same data as their parent.
--   • Delete operations include a user_id guard so a user can only delete
--     records that belong to their own account.
--   • On logout, all user-scoped data is cleared from localStorage to
--     prevent data from bleeding into another user's session.
