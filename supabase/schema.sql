-- ==============================================================================
-- Subscription Management System — Repeatable PostgreSQL Schema & Access Rules
-- Compatible with Supabase PostgreSQL & Auth
-- Source of Truth: antigravity-project-plan.md (Phase 2)
-- ==============================================================================

-- 1. EXTENSIONS
create extension if not exists pgcrypto;

-- 2. PROFILES & ROLES
-- Stores extended user profile information linked directly to auth.users.
-- Default role is strictly 'customer'. Privileged roles cannot be self-assigned.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  role text not null default 'customer'
    check (role in ('admin', 'staff', 'customer')),
  created_at timestamptz not null default now()
);

-- 3. CUSTOMERS
-- Business or individual customer records. Customers can be linked to an auth user profile.
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references public.profiles(id) on delete set null,
  name text not null,
  email text not null,
  created_at timestamptz not null default now()
);

-- 4. PRODUCTS
-- Catalog items with sales and cost tracking.
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  product_type text not null default 'subscription'
    check (product_type in ('subscription', 'one_time', 'addon')),
  sales_price numeric(12,2) not null default 0 check (sales_price >= 0),
  cost_price numeric(12,2) not null default 0 check (cost_price >= 0),
  tax_rate numeric(5,2) not null default 10.0 check (tax_rate >= 0),
  notes text not null default '',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- 5. PRODUCT VARIANTS
-- Optional variants that apply price adjustments to the base product.
create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  name text not null,
  price_adjustment numeric(12,2) not null default 0,
  created_at timestamptz not null default now()
);

-- 6. BILLING PLANS
-- Recurring billing plans defining intervals, quantities, and policy toggles.
create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete restrict,
  name text not null,
  price numeric(12,2) not null check (price >= 0),
  billing_interval text not null
    check (billing_interval in ('daily', 'weekly', 'monthly', 'yearly')),
  minimum_quantity integer not null default 1 check (minimum_quantity > 0),
  available_from date,
  available_until date,
  allow_pause boolean not null default false,
  allow_early_close boolean not null default true,
  allow_renewal boolean not null default true,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  check (available_until is null or available_from is null or available_until >= available_from)
);

-- 7. SUBSCRIPTIONS (QUOTATIONS & ACTIVE CONTRACTS)
-- Tracks the contract lifecycle: draft -> quotation -> confirmed -> active -> paused / closed.
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  subscription_number text not null unique,
  customer_id uuid not null references public.customers(id) on delete restrict,
  plan_id uuid not null references public.plans(id) on delete restrict,
  status text not null default 'draft'
    check (status in ('draft', 'quotation', 'confirmed', 'active', 'paused', 'closed')),
  start_date date not null,
  expiry_date date,
  payment_terms text not null default '',
  created_at timestamptz not null default now(),
  check (expiry_date is null or expiry_date >= start_date)
);

-- 8. SUBSCRIPTION LINES
-- Detailed itemized lines with quantities, unit prices, and tax rates.
create table if not exists public.subscription_lines (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid not null references public.subscriptions(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  variant_id uuid references public.product_variants(id) on delete set null,
  description text not null,
  quantity integer not null default 1 check (quantity > 0),
  unit_price numeric(12,2) not null check (unit_price >= 0),
  tax_rate numeric(5,2) not null default 0 check (tax_rate >= 0),
  created_at timestamptz not null default now()
);

-- 9. DISCOUNTS & PROMOTIONAL RULES
-- Fixed or percentage discount rules managed exclusively by Admins.
create table if not exists public.discounts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  discount_type text not null check (discount_type in ('fixed', 'percentage')),
  value numeric(12,2) not null check (value > 0),
  minimum_purchase numeric(12,2) not null default 0,
  minimum_quantity integer not null default 1,
  starts_at date,
  ends_at date,
  usage_limit integer,
  uses_count integer not null default 0,
  product_id uuid references public.products(id) on delete cascade,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  check (discount_type <> 'percentage' or value <= 100)
);

-- 10. INVOICES
-- Billing invoices generated from active subscriptions.
-- Includes constraint preventing duplicate invoices for the same subscription and period.
create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  invoice_number text not null unique,
  subscription_id uuid not null references public.subscriptions(id) on delete restrict,
  customer_id uuid not null references public.customers(id) on delete restrict,
  period_start date not null,
  period_end date not null,
  status text not null default 'draft'
    check (status in ('draft', 'confirmed', 'paid', 'cancelled')),
  subtotal numeric(12,2) not null default 0,
  discount_total numeric(12,2) not null default 0,
  tax_total numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  due_date date,
  created_at timestamptz not null default now(),
  check (period_end >= period_start),
  -- Database constraint: A billing period must not be billed twice
  constraint unique_subscription_period unique (subscription_id, period_start, period_end)
);

-- 11. INVOICE LINES
create table if not exists public.invoice_lines (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  description text not null,
  quantity integer not null default 1 check (quantity > 0),
  unit_price numeric(12,2) not null check (unit_price >= 0),
  tax_rate numeric(5,2) not null default 0 check (tax_rate >= 0),
  line_total numeric(12,2) not null check (line_total >= 0)
);

-- 12. MANUAL PAYMENTS
-- Records manual payment settlements against invoices (no gateway required).
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete restrict,
  method text not null,
  amount numeric(12,2) not null check (amount > 0),
  paid_at timestamptz not null default now(),
  note text not null default '',
  created_at timestamptz not null default now()
);

-- ==============================================================================
-- 13. PERFORMANCE & DASHBOARD INDEXES
-- Designed to support sub-2-second responses over large datasets
-- ==============================================================================
create index if not exists subscriptions_customer_status_idx
  on public.subscriptions(customer_id, status);
create index if not exists subscriptions_start_date_idx
  on public.subscriptions(start_date);
create index if not exists subscriptions_status_idx
  on public.subscriptions(status);
create index if not exists invoices_customer_status_due_idx
  on public.invoices(customer_id, status, due_date);
create index if not exists invoices_status_idx
  on public.invoices(status);
create index if not exists invoices_due_date_idx
  on public.invoices(due_date);
create index if not exists payments_invoice_idx
  on public.payments(invoice_id);
create index if not exists plans_product_active_idx
  on public.plans(product_id, active);
create index if not exists customers_auth_user_id_idx
  on public.customers(auth_user_id);
create index if not exists customers_email_idx
  on public.customers(email);

-- ==============================================================================
-- 14. SECURITY DEFINER HELPER FUNCTIONS
-- Role verification functions evaluated securely without exposing profile data
-- ==============================================================================
create or replace function public.current_user_is_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.role in ('admin', 'staff')
  );
$$;

create or replace function public.current_user_is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.role = 'admin'
  );
$$;

create or replace function public.current_user_owns_customer(customer_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.customers c
    where c.id = customer_uuid and c.auth_user_id = (select auth.uid())
  );
$$;

grant execute on function public.current_user_is_staff() to authenticated;
grant execute on function public.current_user_is_admin() to authenticated;
grant execute on function public.current_user_owns_customer(uuid) to authenticated;

-- ==============================================================================
-- 15. ROW LEVEL SECURITY (RLS) ACTIVATION
-- Enabled on every application table
-- ==============================================================================
alter table public.profiles enable row level security;
alter table public.customers enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.plans enable row level security;
alter table public.subscriptions enable row level security;
alter table public.subscription_lines enable row level security;
alter table public.discounts enable row level security;
alter table public.invoices enable row level security;
alter table public.invoice_lines enable row level security;
alter table public.payments enable row level security;

-- ==============================================================================
-- 16. RLS POLICIES
-- ==============================================================================

-- PROFILES
create policy "profiles_read_self_or_staff" on public.profiles
  for select to authenticated
  using (id = (select auth.uid()) or (select public.current_user_is_staff()));

create policy "profiles_update_self" on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()) and role = (select p.role from public.profiles p where p.id = auth.uid()));

create policy "profiles_admin_manage" on public.profiles
  for all to authenticated
  using ((select public.current_user_is_admin()))
  with check ((select public.current_user_is_admin()));

-- CUSTOMERS
create policy "customers_read_self" on public.customers
  for select to authenticated
  using (auth_user_id = (select auth.uid()));

create policy "customers_staff_manage" on public.customers
  for all to authenticated
  using ((select public.current_user_is_staff()))
  with check ((select public.current_user_is_staff()));

-- PRODUCTS
create policy "products_read_authenticated" on public.products
  for select to authenticated
  using (active or (select public.current_user_is_staff()));

create policy "products_admin_manage" on public.products
  for all to authenticated
  using ((select public.current_user_is_admin()))
  with check ((select public.current_user_is_admin()));

-- PRODUCT VARIANTS
create policy "variants_read_authenticated" on public.product_variants
  for select to authenticated
  using (true);

create policy "variants_admin_manage" on public.product_variants
  for all to authenticated
  using ((select public.current_user_is_admin()))
  with check ((select public.current_user_is_admin()));

-- PLANS
create policy "plans_read_authenticated" on public.plans
  for select to authenticated
  using (active or (select public.current_user_is_staff()));

create policy "plans_admin_manage" on public.plans
  for all to authenticated
  using ((select public.current_user_is_admin()))
  with check ((select public.current_user_is_admin()));

-- SUBSCRIPTIONS
create policy "subscriptions_customer_read" on public.subscriptions
  for select to authenticated
  using ((select public.current_user_owns_customer(customer_id)));

create policy "subscriptions_staff_manage" on public.subscriptions
  for all to authenticated
  using ((select public.current_user_is_staff()))
  with check ((select public.current_user_is_staff()));

-- SUBSCRIPTION LINES
create policy "subscription_lines_customer_read" on public.subscription_lines
  for select to authenticated
  using (exists (
    select 1 from public.subscriptions s
    where s.id = subscription_id and public.current_user_owns_customer(s.customer_id)
  ));

create policy "subscription_lines_staff_manage" on public.subscription_lines
  for all to authenticated
  using ((select public.current_user_is_staff()))
  with check ((select public.current_user_is_staff()));

-- DISCOUNTS (Admin-only manage per requirements)
create policy "discounts_read_active_or_staff" on public.discounts
  for select to authenticated
  using (active or (select public.current_user_is_staff()));

create policy "discounts_admin_manage" on public.discounts
  for all to authenticated
  using ((select public.current_user_is_admin()))
  with check ((select public.current_user_is_admin()));

-- INVOICES
create policy "invoices_customer_read" on public.invoices
  for select to authenticated
  using ((select public.current_user_owns_customer(customer_id)));

create policy "invoices_staff_manage" on public.invoices
  for all to authenticated
  using ((select public.current_user_is_staff()))
  with check ((select public.current_user_is_staff()));

-- INVOICE LINES
create policy "invoice_lines_customer_read" on public.invoice_lines
  for select to authenticated
  using (exists (
    select 1 from public.invoices i
    where i.id = invoice_id and public.current_user_owns_customer(i.customer_id)
  ));

create policy "invoice_lines_staff_manage" on public.invoice_lines
  for all to authenticated
  using ((select public.current_user_is_staff()))
  with check ((select public.current_user_is_staff()));

-- PAYMENTS
create policy "payments_customer_read" on public.payments
  for select to authenticated
  using (exists (
    select 1 from public.invoices i
    where i.id = invoice_id and public.current_user_owns_customer(i.customer_id)
  ));

create policy "payments_staff_manage" on public.payments
  for all to authenticated
  using ((select public.current_user_is_staff()))
  with check ((select public.current_user_is_staff()));

-- ==============================================================================
-- 17. AUTOMATED PROFILE PROVISIONING ON SIGN-UP
-- Ensures public sign-up ALWAYS assigns the 'customer' role.
-- Prevents privilege escalation from user metadata.
-- ==============================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_full_name text;
begin
  v_full_name := coalesce(new.raw_user_meta_data->>'full_name', '');

  insert into public.profiles (id, full_name, role)
  values (new.id, v_full_name, 'customer')
  on conflict (id) do nothing;

  -- Automatically register a corresponding customer record if email is present
  if new.email is not null and new.email <> '' then
    insert into public.customers (auth_user_id, name, email)
    values (
      new.id,
      coalesce(nullif(v_full_name, ''), split_part(new.email, '@', 1)),
      new.email
    )
    on conflict (auth_user_id) do nothing;
  end if;

  return new;
end;
$$;

-- Drop trigger if it already exists to allow re-running this script cleanly
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ==============================================================================
-- 18. TRUSTED INITIAL ADMIN PROMOTION PROCEDURE
-- Used once in the Supabase SQL Editor to elevate the initial administrator.
-- ==============================================================================
create or replace function public.promote_user_to_admin(target_email text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid;
begin
  select id into v_user_id from auth.users where email = target_email limit 1;

  if v_user_id is null then
    return 'User with email ' || target_email || ' not found in auth.users.';
  end if;

  update public.profiles
  set role = 'admin'
  where id = v_user_id;

  return 'User ' || target_email || ' successfully promoted to admin.';
end;
$$;

-- Grant execution only to postgres / service_role
revoke all on function public.promote_user_to_admin(text) from public, anon, authenticated;

-- ==============================================================================
-- 19. DATABASE-SIDE FINANCE SUMMARY FUNCTION
-- Computes real-time dashboard aggregates entirely within PostgreSQL.
-- ==============================================================================
create or replace function public.get_finance_summary()
returns json
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_active_subs bigint;
  v_total_subs bigint;
  v_revenue numeric;
  v_outstanding numeric;
  v_outstanding_count bigint;
  v_overdue_count bigint;
  v_overdue_amount numeric;
begin
  select count(*) into v_total_subs from public.subscriptions;
  select count(*) into v_active_subs from public.subscriptions where status = 'active';
  select coalesce(sum(amount), 0) into v_revenue from public.payments;

  with inv_totals as (
    select
      i.id,
      i.total,
      coalesce(sum(p.amount), 0) as paid_amount,
      greatest(0, i.total - coalesce(sum(p.amount), 0)) as balance,
      i.status,
      i.due_date
    from public.invoices i
    left join public.payments p on p.invoice_id = i.id
    where i.status in ('confirmed', 'draft')
    group by i.id, i.total, i.status, i.due_date
  )
  select
    count(*) filter (where balance > 0),
    coalesce(sum(balance), 0),
    count(*) filter (where balance > 0 and due_date < current_date),
    coalesce(sum(balance) filter (where balance > 0 and due_date < current_date), 0)
  into
    v_outstanding_count,
    v_outstanding,
    v_overdue_count,
    v_overdue_amount
  from inv_totals;

  return json_build_object(
    'active_subscriptions_count', coalesce(v_active_subs, 0),
    'total_subscriptions_count', coalesce(v_total_subs, 0),
    'total_revenue_collected', coalesce(round(v_revenue, 2), 0),
    'outstanding_balance', coalesce(round(v_outstanding, 2), 0),
    'outstanding_invoices_count', coalesce(v_outstanding_count, 0),
    'overdue_invoices_count', coalesce(v_overdue_count, 0),
    'overdue_invoices_amount', coalesce(round(v_overdue_amount, 2), 0)
  );
end;
$$;

grant execute on function public.get_finance_summary() to authenticated;

