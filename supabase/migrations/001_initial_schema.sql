-- Users table (app-level user profiles, not Supabase auth users)
create table if not exists public.app_users (
  id text primary key,
  username text unique not null,
  password text not null,
  role text not null default 'user',
  firm_name text not null default '',
  gst_number text not null default '',
  email text not null default '',
  phone text not null default '',
  plan text not null default 'Basic',
  max_employees integer not null default 2,
  subscription_start text not null default '',
  subscription_end text not null default '',
  active boolean not null default true,
  parent_user_id text,
  show_stock_to_employees boolean not null default false,
  firm_settings jsonb,
  created_at timestamptz default now()
);

-- Customers
create table if not exists public.customers (
  id text primary key,
  user_id text not null references public.app_users(id) on delete cascade,
  name text not null,
  phone text not null default '',
  gst_number text not null default '',
  address text not null default '',
  city text,
  state text,
  state_code text,
  pincode text,
  created_at timestamptz default now()
);

-- Products
create table if not exists public.products (
  id text primary key,
  user_id text not null references public.app_users(id) on delete cascade,
  name text not null,
  hsn text not null default '',
  price numeric not null default 0,
  gst_percent numeric not null default 0,
  unit text not null default 'Nos',
  stock numeric not null default 0,
  low_stock_threshold numeric not null default 5
);

-- Invoices
create table if not exists public.invoices (
  id text primary key,
  user_id text not null references public.app_users(id) on delete cascade,
  invoice_number text not null,
  date text not null,
  customer_id text not null,
  customer_name text not null,
  customer_gst text not null default '',
  customer_address text not null default '',
  customer_state text,
  customer_state_code text,
  vehicle_number text not null default '',
  eway_bill_number text,
  items jsonb not null default '[]',
  total_amount numeric not null default 0,
  total_gst numeric not null default 0,
  total_cgst numeric not null default 0,
  total_sgst numeric not null default 0,
  total_igst numeric not null default 0,
  grand_total numeric not null default 0,
  round_off numeric not null default 0,
  is_inter_state boolean not null default false,
  place_of_supply text not null default '',
  status text not null default 'pending',
  paid_amount numeric not null default 0,
  created_by jsonb not null,
  created_at timestamptz default now()
);

-- Payments
create table if not exists public.payments (
  id text primary key,
  user_id text not null references public.app_users(id) on delete cascade,
  customer_id text not null,
  amount numeric not null default 0,
  date text not null,
  mode text not null default 'Cash',
  invoice_id text,
  note text not null default '',
  timestamp text not null,
  created_at timestamptz default now()
);

-- Purchases
create table if not exists public.purchases (
  id text primary key,
  user_id text not null references public.app_users(id) on delete cascade,
  supplier_name text not null,
  supplier_gstin text not null default '',
  invoice_number text not null,
  invoice_date text not null,
  taxable_amount numeric not null default 0,
  igst numeric not null default 0,
  cgst numeric not null default 0,
  sgst numeric not null default 0,
  description text not null default '',
  timestamp text not null,
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table public.app_users enable row level security;
alter table public.customers enable row level security;
alter table public.products enable row level security;
alter table public.invoices enable row level security;
alter table public.payments enable row level security;
alter table public.purchases enable row level security;

-- Allow all operations with anon key (app handles its own auth)
create policy "Allow all for anon" on public.app_users for all using (true) with check (true);
create policy "Allow all for anon" on public.customers for all using (true) with check (true);
create policy "Allow all for anon" on public.products for all using (true) with check (true);
create policy "Allow all for anon" on public.invoices for all using (true) with check (true);
create policy "Allow all for anon" on public.payments for all using (true) with check (true);
create policy "Allow all for anon" on public.purchases for all using (true) with check (true);
