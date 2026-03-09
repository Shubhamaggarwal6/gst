# Supabase Integration Setup

This document explains **exactly** what you need to configure in Supabase to make BillSaathi work.

## Prerequisites

- A [Supabase](https://supabase.com) account
- Node.js and npm installed

---

## Step 1 — Create a Supabase Project

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Click **New project**
3. Fill in:
   - **Project name** — e.g. `billsaathi`
   - **Database Password** — choose a strong password (save it somewhere safe)
   - **Region** — pick the one closest to you
4. Click **Create new project** and wait (~2 min) for it to be provisioned

---

## Step 2 — Run the SQL Migration (creates all tables, indexes, policies AND storage bucket)

> ⚠️ This single script sets up **everything** in Supabase — tables, row-level security, indexes, and the storage bucket. You only need to run it once.

1. In your Supabase project dashboard, click **SQL Editor** in the left sidebar
2. Click **New query**
3. Open the file `supabase/migrations/001_initial_schema.sql` from this project
4. Copy its **entire** contents and paste into the SQL editor
5. Click **Run** (or press `Ctrl+Enter`)

After running, you should see **no errors**. The script creates:

| Object | Type | Purpose |
|--------|------|---------|
| `app_users` | Table | App-level user profiles |
| `customers` | Table | Customer records per user |
| `products` | Table | Product / inventory records |
| `invoices` | Table | GST invoices |
| `payments` | Table | Payment records |
| `purchases` | Table | Purchase register entries |
| `idx_*_user_id` | Indexes | Faster queries by user |
| RLS policies | Security | Allow anonymous access (app manages its own auth) |
| `billsaathi-backups` | Storage bucket | File backups (public) |
| Storage policies | Security | Allow anonymous upload/download of backups |

---

## Step 3 — Get Your API Credentials

1. In the left sidebar go to **Settings → API**
2. Copy:
   - **Project URL** — looks like `https://xxxxxxxxxxxx.supabase.co`
   - **anon / public key** — the long JWT string under *Project API keys*

---

## Step 4 — Configure Environment Variables

Create a `.env.local` file in the project root:

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in your credentials from Step 3:

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

> **Tip:** `.env.local` is listed in `.gitignore` — it will never be committed to git.

---

## Step 5 — Install Dependencies & Run

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) and log in. All data is now persisted in Supabase.

---

## Verify the Setup

After running the app and logging in you can verify everything is working:

1. **Tables** — Supabase dashboard → **Table Editor**: you should see `app_users`, `customers`, `products`, `invoices`, `payments`, `purchases`
2. **Storage** — Supabase dashboard → **Storage**: you should see the `billsaathi-backups` bucket
3. **Data** — Create a customer or product in the app, then check the corresponding table in Supabase — the row should appear immediately

---

## Architecture

The Supabase integration is fully backward-compatible:

- **localStorage** is used as a cache for instant startup and offline fallback
- **Supabase** is the primary persistence layer
- On app load, data is first read from localStorage (instant), then synced from Supabase
- All write operations (create/update/delete) are mirrored to both localStorage and Supabase
- If Supabase is unreachable, the app continues to work using cached localStorage data

### Key Files

| File | Purpose |
|------|---------|
| `src/lib/supabase.ts` | Supabase client initialization |
| `src/lib/supabaseDb.ts` | CRUD helper functions for all tables |
| `src/lib/supabaseStorage.ts` | Storage helper for file backups |
| `src/contexts/AppContext.tsx` | App state with Supabase sync |
| `src/components/LoadingScreen.tsx` | Loading UI shown during initial sync |
| `supabase/migrations/001_initial_schema.sql` | **Complete** database + storage setup script |

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "permission denied" errors | Make sure you ran the full SQL migration including the RLS policy section |
| Storage upload fails | Make sure the SQL migration ran completely — it creates the bucket and its policies |
| Data not appearing in Supabase | Check browser console for errors; verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env.local` |
| App shows loading spinner forever | Supabase URL or key is wrong; check `.env.local` values match **Settings → API** |
