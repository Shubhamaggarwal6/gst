# Supabase Integration Setup

This document explains how to set up the Supabase backend for BillSaathi.

## Prerequisites

- A [Supabase](https://supabase.com) account
- Node.js and npm installed

## 1. Create a Supabase Project

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Click **New project**
3. Fill in the project name (e.g., `billsaathi`), database password, and region
4. Click **Create new project** and wait for it to be provisioned

## 2. Run the SQL Migration

1. In your Supabase project dashboard, go to **SQL Editor**
2. Click **New query**
3. Copy the contents of `supabase/migrations/001_initial_schema.sql`
4. Paste into the SQL editor and click **Run**

This will create the following tables:
- `app_users` — App-level user profiles (not Supabase auth users)
- `customers` — Customer records per user
- `products` — Product/inventory records per user
- `invoices` — GST invoices per user
- `payments` — Payment records per user
- `purchases` — Purchase register entries per user

Row Level Security (RLS) is enabled on all tables with permissive policies, as the app manages its own authentication.

## 3. Create the Storage Bucket

1. In your Supabase project dashboard, go to **Storage**
2. Click **New bucket**
3. Name it `billsaathi-backups`
4. Enable **Public bucket** (so backups can be downloaded via public URL)
5. Click **Create bucket**

## 4. Configure Environment Variables

Create a `.env.local` file in the project root (copy from `.env.example`):

```bash
cp .env.example .env.local
```

Edit `.env.local` with your Supabase project credentials:

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

You can find these values in your Supabase project dashboard under **Settings → API**.

> **Note:** The credentials are also hardcoded as fallbacks in `src/lib/supabase.ts` for convenience during development. For production, always use environment variables.

## 5. Install Dependencies

```bash
npm install
```

This will install `@supabase/supabase-js` along with all other dependencies.

## 6. Run the App

```bash
npm run dev
```

## Architecture

The Supabase integration is fully backward-compatible:

- **localStorage** is used as a cache for instant startup and offline fallback
- **Supabase** is the primary persistence layer
- On app load, data is first read from localStorage (instant), then synced from Supabase
- All write operations (create/update/delete) are mirrored to both localStorage and Supabase
- If Supabase is unreachable, the app continues to work using cached localStorage data

### Files

| File | Purpose |
|------|---------|
| `src/lib/supabase.ts` | Supabase client initialization |
| `src/lib/supabaseDb.ts` | CRUD helper functions for all tables |
| `src/lib/supabaseStorage.ts` | Storage helper for file backups |
| `src/contexts/AppContext.tsx` | App state with Supabase sync |
| `src/components/LoadingScreen.tsx` | Loading UI shown during initial sync |
| `supabase/migrations/001_initial_schema.sql` | Database schema |
