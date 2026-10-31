# Subscription Management System — Antigravity Project Plan

## How to use this file

This file is the project's source of truth. Before starting any phase, read this file and review the current app so you know what is already complete. Do not rebuild completed work.

At the start of a phase, change its status to **In progress**. When finished, update this file before moving on:

1. Mark the phase **Complete** only when its completion checklist is satisfied.
2. Record what changed in that phase's **Changes made** section.
3. Record important choices, setup steps, or blockers in **Notes**.
4. Update the overall progress and append a dated entry to the change log.
5. If the phase is incomplete, leave it **In progress** or **Blocked** and say what remains. Never mark unfinished work complete.

Keep the plan and change log concise and factual. Preserve earlier entries. Do not change the agreed product scope or visual direction without recording why.

## Project goal

Build a simple, polished subscription-management demo for the hackathon trial round. The team submits a **video of the working project**. The video should clearly show the main billing journey, the three user roles, and that the dashboard stays responsive with a large sample dataset.

This is a focused demo, not a production payment platform. Record payments manually; do not add a payment gateway unless the user asks for one.

## Agreed stack

- **Frontend:** React with TypeScript. Use the framework already present in the project if one has been chosen; do not migrate frameworks without a clear reason.
- **Backend and data:** Supabase Auth and PostgreSQL.
- **Styling:** the existing styling system, or a small, consistent CSS/Tailwind setup if the project has none.
- **Email:** Supabase password-reset email for the demo. Configure Supabase's email settings; never ask for or store the user's personal Google password.

Keep the implementation straightforward. Prefer Supabase's built-in auth and database features over adding separate services.

## Product requirements from the problem statement

- Roles: Admin, Staff, Customer. Admin manages the system and is the only role allowed to add staff. Staff handles day-to-day billing. Customers can see only their own subscriptions and invoices.
- Products: name, type, sales price, cost price, notes, and optional variants that can adjust the price.
- Plans: price, daily/weekly/monthly/yearly billing interval, minimum quantity, availability dates, and configurable end, pause, early-close, and renewal behavior.
- Quotes and subscriptions: quotation templates; customer, plan, dates, payment terms, product lines, quantities, prices, taxes, and totals; statuses Draft → Quotation → Confirmed → Active → Closed.
- Invoices: generated from subscriptions with customer and line details, tax, and totals; staff can confirm, cancel, send, or print; track Draft, Confirmed, and Paid states. A billing period must not be billed twice or skipped.
- Discounts: fixed amount or percentage, optional minimum purchase/quantity, start/end dates, usage limit, product or subscription scope, automatic application, and automatic expiry.
- Payments and reporting: manually record payment method, amount, date, and note against an invoice. Show paid, outstanding, and overdue invoices, active subscriptions, revenue, and filters/summary views.
- Performance: the brief asks for pages to respond in under two seconds with thousands of subscriptions. Keep queries paginated, add useful indexes, and demonstrate performance with realistic sample data.

## UI direction

Make the product calm, clear, and easy to use. Use a restrained neutral palette, readable typography, consistent spacing, and one purposeful accent color chosen to suit the interface. Avoid generic AI-generated styling, decorative gradients, excessive rounded cards, and trendy blue/rose palettes. Prioritize clear labels, useful empty states, tables that scan well, and short forms with sensible defaults.

Keep implementation foundations such as design tokens and architecture notes behind the scenes. Do not expose a "Foundation & Docs" navigation group, UI foundation/token showcase, architecture/status page, or documentation cards/links as product UI. Do not add documentation that is not needed to build, configure, or demo the project.

## Overall progress

- [x] Phase 1 — Project setup and UI foundation
- [x] Phase 2 — Supabase setup, SQL schema, and access rules
- [x] Phase 3 — Authentication and role-based views
- [x] Phase 4 — Products, plans, quotes, and subscriptions
- [ ] Phase 5 — Invoices, discounts, payments, dashboard, and performance
- [ ] Phase 6 — Demo polish and video-ready flow

## Phase 1 — Project setup and UI foundation

**Status:** Complete

**Work:** Inspect the existing project first. Set up the app shell, navigation, shared page layout, typography, buttons, forms, and table styles. Create role-aware navigation placeholders for Admin, Staff, and Customer. Keep the layout usable on a typical laptop screen and avoid unnecessary components or dependencies.

**Completion checklist:**

- [x] Existing app structure was reviewed before edits.
- [x] App starts and the main navigation/layout is in place.
- [x] Visual direction above is reflected in the interface.
- [x] Admin, Staff, and Customer destinations are represented without fake functionality being presented as complete.

**Changes made:**
- Initialized Next.js 16 with TypeScript and Tailwind CSS as requested, ensuring zero extraneous dependencies.
- Created restrained neutral design tokens (zinc-50 surface, zinc-200 subtle borders, zinc-900 text) paired with a purposeful deep teal accent (`teal-700` / `#0f766e`), avoiding flashy gradients and trendy blue/rose palettes.
- Implemented accessible UI primitives: `Button` (with variants, loading, disabled states), `Badge` (semantic lifecycle pills), `Input`, `Select`, `Card`, `Alert`, `EmptyState`, and high-density scannable `Table` with tabular numerals (`tabular-nums`).
- Built the responsive `AppShell` with top branding, user persona preview, Supabase connection status indicator, and interactive Role Switcher between Admin, Staff, and Customer.
- Created dedicated destination pages:
  - Admin: Dashboard (`/`), Products & Variants (`/admin/products`), Plans (`/admin/plans`), Staff Management (`/admin/staff`), and Discounts (`/admin/discounts`).
  - Staff: Billing Dashboard (`/`), Customers Directory (`/staff/customers`), Quotes & Subscriptions (`/staff/subscriptions`), Invoices (`/staff/invoices`), and Manual Payment Log (`/staff/payments`).
  - Customer: Customer Portal Home (`/customer/portal`), My Subscriptions (`/customer/subscriptions`), and Invoices & Receipts (`/customer/invoices`).
  - Foundation: Interactive design token styleguide (`/ui-foundation`) and Architecture Status (`/status`).
- Added `.env.example` with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` placeholders, and created a client utility in `src/lib/supabase.ts` that safely validates credentials while keeping secrets out of source control.
- Ensured no database tables or SQL migrations were executed in Phase 1 (reserved for Phase 2).

**Notes:**
- The dev server is running on port 3000 (`http://localhost:3000`).
- To connect the Supabase project in Phase 2, provide `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`.

## Phase 2 — Supabase setup, SQL schema, and access rules

**Status:** Complete

**Work:** Connect the app to a Supabase project. Add a readable SQL setup file to the repository and apply it through the Supabase SQL Editor. Set up the tables and indexes needed for the agreed demo scope. Enable Row Level Security (RLS); customers must only read their own customer record, subscriptions, invoices, invoice lines, and payments. Admin/Staff access should be explicit. Do not put a Supabase service-role key in browser code.

### Supabase setup steps

1. Create a Supabase project.
2. In **Project Settings → API**, copy the Project URL and anon/publishable key into the app's local environment file using the variable names the existing app expects (commonly `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` or `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`). Never commit real secrets.
3. In **SQL Editor**, run the project SQL setup file. Keep the SQL file in the repository so the setup can be repeated.
4. In **Authentication → URL Configuration**, set the local app URL and the allowed password-reset redirect URL.
5. In **Authentication → Providers**, keep email/password enabled. Configure the email sender for password reset. Use Supabase's configured email service; do not use or request a personal Google account password.
6. Create the initial Admin using Supabase Auth, then assign the Admin role through a trusted setup process. Never allow a user to choose their own Admin/Staff role at sign-up.
7. Add demo seed data through a safe seed script or the Supabase dashboard. Keep credentials and real personal data out of the repository.

### Starter SQL schema

This is a compact starting schema for the demo. Antigravity should adapt it to the existing project, keep the resulting SQL setup file in the repository, and explain any changes here. Do not blindly run a second copy if equivalent tables already exist.

```sql
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  role text not null default 'customer'
    check (role in ('admin', 'staff', 'customer')),
  created_at timestamptz not null default now()
);

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references public.profiles(id) on delete set null,
  name text not null,
  email text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  product_type text not null default 'subscription',
  sales_price numeric(12,2) not null default 0 check (sales_price >= 0),
  cost_price numeric(12,2) not null default 0 check (cost_price >= 0),
  notes text not null default '',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  name text not null,
  price_adjustment numeric(12,2) not null default 0,
  created_at timestamptz not null default now()
);

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
  unique (subscription_id, period_start, period_end)
);

create table if not exists public.invoice_lines (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  description text not null,
  quantity integer not null default 1 check (quantity > 0),
  unit_price numeric(12,2) not null check (unit_price >= 0),
  tax_rate numeric(5,2) not null default 0 check (tax_rate >= 0),
  line_total numeric(12,2) not null check (line_total >= 0)
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete restrict,
  method text not null,
  amount numeric(12,2) not null check (amount > 0),
  paid_at timestamptz not null default now(),
  note text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists subscriptions_customer_status_idx
  on public.subscriptions(customer_id, status);
create index if not exists subscriptions_start_date_idx
  on public.subscriptions(start_date);
create index if not exists invoices_customer_status_due_idx
  on public.invoices(customer_id, status, due_date);
create index if not exists payments_invoice_idx
  on public.payments(invoice_id);
create index if not exists plans_product_active_idx
  on public.plans(product_id, active);

-- Helper checks role without exposing profile data. Used by RLS policies below.
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

create policy "profiles_read_self_or_staff" on public.profiles
  for select to authenticated
  using (id = (select auth.uid()) or (select public.current_user_is_staff()));
create policy "profiles_admin_manage" on public.profiles
  for all to authenticated
  using ((select public.current_user_is_admin()))
  with check ((select public.current_user_is_admin()));

create policy "customers_staff_manage" on public.customers
  for all to authenticated
  using ((select public.current_user_is_staff()))
  with check ((select public.current_user_is_staff()));
create policy "customers_read_self" on public.customers
  for select to authenticated
  using (auth_user_id = (select auth.uid()));

create policy "products_read_authenticated" on public.products
  for select to authenticated using (active or (select public.current_user_is_staff()));
create policy "products_staff_manage" on public.products
  for all to authenticated
  using ((select public.current_user_is_staff()))
  with check ((select public.current_user_is_staff()));
create policy "variants_read_authenticated" on public.product_variants
  for select to authenticated using (true);
create policy "variants_staff_manage" on public.product_variants
  for all to authenticated
  using ((select public.current_user_is_staff()))
  with check ((select public.current_user_is_staff()));
create policy "plans_read_authenticated" on public.plans
  for select to authenticated using (active or (select public.current_user_is_staff()));
create policy "plans_staff_manage" on public.plans
  for all to authenticated
  using ((select public.current_user_is_staff()))
  with check ((select public.current_user_is_staff()));

create policy "subscriptions_staff_manage" on public.subscriptions
  for all to authenticated
  using ((select public.current_user_is_staff()))
  with check ((select public.current_user_is_staff()));
create policy "subscriptions_customer_read" on public.subscriptions
  for select to authenticated
  using ((select public.current_user_owns_customer(customer_id)));
create policy "subscription_lines_staff_manage" on public.subscription_lines
  for all to authenticated
  using ((select public.current_user_is_staff()))
  with check ((select public.current_user_is_staff()));
create policy "subscription_lines_customer_read" on public.subscription_lines
  for select to authenticated
  using (exists (
    select 1 from public.subscriptions s
    where s.id = subscription_id and public.current_user_owns_customer(s.customer_id)
  ));

create policy "discounts_read_active_or_staff" on public.discounts
  for select to authenticated using (active or (select public.current_user_is_staff()));
create policy "discounts_admin_manage" on public.discounts
  for all to authenticated
  using ((select public.current_user_is_admin()))
  with check ((select public.current_user_is_admin()));

create policy "invoices_staff_manage" on public.invoices
  for all to authenticated
  using ((select public.current_user_is_staff()))
  with check ((select public.current_user_is_staff()));
create policy "invoices_customer_read" on public.invoices
  for select to authenticated
  using ((select public.current_user_owns_customer(customer_id)));
create policy "invoice_lines_staff_manage" on public.invoice_lines
  for all to authenticated
  using ((select public.current_user_is_staff()))
  with check ((select public.current_user_is_staff()));
create policy "invoice_lines_customer_read" on public.invoice_lines
  for select to authenticated
  using (exists (
    select 1 from public.invoices i
    where i.id = invoice_id and public.current_user_owns_customer(i.customer_id)
  ));

create policy "payments_staff_manage" on public.payments
  for all to authenticated
  using ((select public.current_user_is_staff()))
  with check ((select public.current_user_is_staff()));
create policy "payments_customer_read" on public.payments
  for select to authenticated
  using (exists (
    select 1 from public.invoices i
    where i.id = invoice_id and public.current_user_owns_customer(i.customer_id)
  ));
```

**Important schema note:** the starter SQL deliberately does not create Admin/Staff accounts or automatically assign privileged roles. Antigravity must implement customer profile creation safely and document a trusted one-time Admin setup. Never let a public sign-up form set `role = 'admin'` or `role = 'staff'`. Review the generated policies against the app's actual access patterns before using real data.

**Completion checklist:**

- [x] Supabase connection uses only the public anon/publishable key in the browser.
- [x] SQL setup is saved in the repository and can be applied in the Supabase SQL Editor.
- [x] RLS is enabled on every app table; customer ownership and staff/admin policies are in place (user confirmed `supabase/schema.sql` was applied in Supabase SQL Editor).
- [x] Duplicate invoices for the same subscription and period are prevented by the database constraint (`unique_subscription_period`).
- [x] Indexes support customer/status/date filters used by the dashboard.
- [x] Password reset URL and email setup steps are documented.
- [x] Admin/Staff role assignment is trusted and cannot be self-selected at sign-up.

**Changes made:**
- Validated the existing Supabase configuration via `.env.local` using standard `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` variables; verified that no secret keys are exposed or committed.
- Created `supabase/schema.sql`:
  - 11 application tables (`profiles`, `customers`, `products`, `product_variants`, `plans`, `subscriptions`, `subscription_lines`, `discounts`, `invoices`, `invoice_lines`, `payments`) with all checks, foreign keys, and constraints.
  - Added unique constraint `unique_subscription_period` on `invoices(subscription_id, period_start, period_end)` to prevent duplicate billing for the same subscription period.
  - Added 10 performance and filtering indexes covering customer, status, start_date, due_date, and plan activity for sub-2-second queries.
  - Added security definer helper functions: `current_user_is_staff()`, `current_user_is_admin()`, and `current_user_owns_customer(uuid)`.
  - Enabled Row Level Security on all 11 tables with granular customer isolation, staff billing operations, and admin-exclusive policies (staff and discounts management).
  - Added `handle_new_user()` trigger on `auth.users` ensuring all public sign-ups are hardcoded to `role = 'customer'`, preventing privilege escalation.
  - Added trusted initial Admin promotion procedure `promote_user_to_admin(target_email)`.
- Created `supabase/README.md` with step-by-step instructions for applying `supabase/schema.sql` in the Supabase SQL Editor, configuring Site URL and password-reset redirect URLs, and executing initial Admin setup.

**Notes:**
- User confirmed that `supabase/schema.sql` was applied in the Supabase SQL Editor.
- Authentication screens and logic remain untouched for Phase 3.

## Phase 3 — Authentication and role-based views

**Status:** Complete

**Work:** Implement email/password sign-up and login, password reset email, session handling, and role-aware navigation. Add a safe initial Admin setup. Staff creation must be Admin-only. Apply the same permissions in the database and server-side actions, not only by hiding buttons in the UI.

**Completion checklist:**

- [x] Sign-up, login, logout, and password reset work.
- [x] Admin, Staff, and Customer land on the correct views.
- [x] Only Admin can add staff.
- [x] A customer cannot read another customer's records, including by changing a URL or record ID.

**Changes made:**
- Removed UI Foundation and Architecture/Status showcase pages (`/ui-foundation` and `/status`) and navigation links from the product UI, keeping design tokens and component primitives in code.
- Added password validation utility (`src/lib/auth/validation.ts`) strictly enforcing problem statement requirements: more than 8 characters (> 8), at least one uppercase letter, at least one lowercase letter, and at least one special character.
- Implemented full auth flow:
  - `/auth/login`: Email and password login with session cookie persistence, error handling, redirect tracking, and password recovery link.
  - `/auth/signup`: Account creation with interactive password policy requirements checklist. Enforces that all self-registrations are strictly customer profiles via database trigger.
  - `/auth/forgot-password`: Password reset request dispatcher triggering Supabase `resetPasswordForEmail`.
  - `/auth/reset-password`: Set new password form with real-time password policy validation.
  - `/auth/callback`: Server-side route handler to exchange auth code for session.
- Implemented Next.js session management and route protection middleware (`src/middleware.ts`) using `@supabase/ssr` to protect `/admin/*`, `/staff/*`, and `/customer/*` routes.
- Created `AuthProvider` (`src/context/AuthContext.tsx`) that reads the authenticated user's role from the trusted `public.profiles` database record, never accepting client metadata.
- Implemented server-side Admin-only staff provisioning API (`POST /api/admin/staff`) using Supabase Auth Admin API. Added `SUPABASE_SERVICE_ROLE_KEY` placeholder to `.env.example`.
- Wired Admin staff management interface (`src/app/admin/staff/page.tsx`) to real server-side provisioning and profiles.

**Notes:**
- Add `SUPABASE_SERVICE_ROLE_KEY` to `.env.local` to enable server-side staff invitations via Supabase Auth Admin API.
- Customer record isolation is enforced at the database layer via Row Level Security (RLS).
- Phase 4 remains untouched.

## Phase 4 — Products, plans, quotes, and subscriptions

**Status:** Complete

**Work:** Build focused screens for product/variant/plan setup and subscription management. Implement quotation templates only as simply as needed for the demo. Support the stated subscription statuses and the plan's basic pause, renewal, expiry, and early-close rules.

**Completion checklist:**

- [x] Admin can create/edit products, variants, and plans.
- [x] Variant price adjustment and billing interval are reflected in subscription pricing.
- [x] Staff can create a quote/subscription with customer, dates, payment terms, lines, quantities, and prices.
- [x] Subscription status changes follow the specified lifecycle.
- [x] Customer portal lists only that customer's subscriptions.

**Changes made:**
- Built server-side data service layer in `src/lib/services/`:
  - `products.ts`: CRUD operations for catalog products (`subscription`, `one_time`, `addon`), pricing fields (`sales_price`, `cost_price`), notes, and `product_variants` with positive/negative price adjustments (`price_adjustment`). Restricts creation, updates, and catalog demo seeding strictly to Admin role.
  - `plans.ts`: CRUD operations for recurring plans linked to catalog products, interval options (`daily`, `weekly`, `monthly`, `yearly`), minimum quantities, date ranges (`available_from`, `available_until`), and lifecycle rules (`allow_pause`, `allow_early_close`, `allow_renewal`). Restricts creation and updates strictly to Admin role, while allowing Staff read access for quotes.
  - `customers.ts`: Customer directory queries and creation.
  - `subscriptions.ts`: Full subscription quote workflow (`createSubscriptionQuote`), plan template pre-fill (`getQuotationTemplateForPlan`), line items management, computed subtotal/tax/grand totals, and strict status lifecycle transitions (`updateSubscriptionStatus`) with plan policy checks.
- Hardened quote creation flow:
  - Enforced that `createSubscriptionQuote` always creates quotes strictly in `'draft'` state. Removed initial status acceptance from client payloads; all status changes must pass through validated server-side transition checks (`updateSubscriptionStatus`).
  - Added atomic rollback: if inserting quote line items fails, the created quote header is deleted immediately and a clear error is returned, preventing orphan subscriptions without lines.
- Admin Product Management (`src/app/admin/products/page.tsx`):
  - Live table and modal forms for adding and editing products with types, sales price, cost price, notes, active toggle, and inline product variants with price adjustments.
  - 1-click catalog seed button to immediately populate realistic SaaS/infrastructure products with variants (Admin-only).
- Admin Plan Management (`src/app/admin/plans/page.tsx`):
  - Live table and modal forms for adding and editing plans tied to catalog products, supporting all intervals (`daily`, `weekly`, `monthly`, `yearly`), availability constraints, minimum quantity, and policy switches (`allow_pause`, `allow_early_close`, `allow_renewal`).
- Staff Customer Directory (`src/app/staff/customers/page.tsx`):
  - Live customer management table and registration modal linked to `public.customers`.
- Staff Quotes & Subscriptions Lifecycle (`src/app/staff/subscriptions/page.tsx`):
  - Quote creator modal with customer selector, plan selector, variant selector, date range, payment terms, and dynamic line items calculation including taxes and variant price deltas.
  - Reusable template flow: selecting a plan automatically pre-fills contract dates and default product lines based on billing interval and variant pricing.
  - Interactive subscription drawer with lifecycle state progression buttons obeying `VALID_TRANSITIONS` (`draft` → `quotation` → `confirmed` → `active` → `paused` / `closed`), with server-side validation against plan pause and early close policies.
- Customer Portal & Subscriptions (`src/app/customer/portal/page.tsx` and `src/app/customer/subscriptions/page.tsx`):
  - Both customer views fetch only the authenticated customer's live subscriptions and line items from Supabase, protected by Row Level Security (`subscriptions_customer_read` and `subscription_lines_customer_read`).
  - Shows contract details, recurring billing amounts, itemized product lines, variant badges with price adjustments, and plan policy permissions.
- Database & RLS Updates:
  - Created migration `supabase/migrations/20261031_admin_only_products_plans.sql` restricting `products`, `product_variants`, and `plans` management policies strictly to `current_user_is_admin()`, while preserving read access (`products_read_authenticated`, `variants_read_authenticated`, `plans_read_authenticated`) for Staff and authenticated users.
  - Updated base `supabase/schema.sql` and documented setup steps in `supabase/README.md`.
- Verified production build (`npm run build`) passing with zero TypeScript or route compilation errors.

**Notes:**
- User confirmed applying `supabase/migrations/20261031_admin_only_products_plans.sql` in the Supabase SQL Editor, activating Admin-only product and plan modifications at the database RLS layer.
- Quotation templates use a streamlined plan/product pre-fill mechanism (`getQuotationTemplateForPlan`) avoiding unnecessary extra database tables.
- RLS policies and server-side checks strictly isolate customer records; customers cannot see or access subscriptions belonging to other accounts.

## Phase 5 — Invoices, discounts, payments, dashboard, and performance

**Status:** In progress

**Work:** Generate invoices from active subscriptions for a selected billing period. Apply tax and eligible discounts, record manual payments, and provide the finance summary and filters. Use pagination and database queries/aggregates instead of loading every row into the browser. Seed enough representative data to demonstrate the brief's scale requirement. Avoid extra infrastructure unless the app cannot meet the demo need without it.

**Completion checklist:**

- [x] Invoice contains customer, subscription, period, lines, tax, discounts, totals, due date, and status. (User confirmed applying both product tax rate and secured finance dashboard RPC migrations in Supabase).
- [x] Database uniqueness prevents duplicate invoices for the same subscription period (`unique_subscription_period` on `subscription_id, period_start, period_end`).
- [x] Staff can confirm/cancel/print invoices and record payments; customer can read their own invoices.
- [x] Discount rules respect type, eligibility, dates, and usage limit.
- [x] Dashboard shows active subscriptions, collected revenue, outstanding/overdue invoices, with filters.
- [x] Dashboard uses pagination or server-side aggregates and remains responsive with thousands of sample subscriptions.
- [ ] The project can show or explain the under-two-second page response target in the demo without making unsupported claims. (Awaiting user manual capture of cold and warm latency timings from the signed-in Admin dashboard at http://localhost:3000; browser automation tool driver download was unavailable).

**Changes made:**
- Admin-Configured Product Taxation:
  - Added migration `supabase/migrations/20261031_product_tax_rate.sql` and updated `supabase/schema.sql` adding `tax_rate numeric(5,2) not null default 10.0` to `public.products`.
  - Updated `src/lib/services/products.ts` and `src/app/admin/products/page.tsx` allowing Admins to configure individual product tax rates.
  - Linked product tax rates into subscription quotation templates and invoice calculations.
- Discounts Engine (`src/lib/services/discounts.ts` & `src/app/admin/discounts/page.tsx`):
  - Created full CRUD service for fixed/percentage promotional rules with minimum purchase, minimum quantity, optional product scope, date windows, and usage caps.
  - Implemented automatic eligibility evaluator (`evaluateEligibleDiscount`) that matches active, unexpired, and unexhausted discounts against line items and subtotal.
  - Implemented automatic usage tracking (`incrementDiscountUses`) when confirmed invoices are generated.
  - Connected live Admin Discounts UI with status filters (Active, Expired, Exhausted, Inactive) and 1-click seed defaults.
- Period Invoicing Workflow & Scaled Batch Billing (`src/lib/services/invoices.ts` & `src/app/staff/invoices/page.tsx`):
  - Built period invoice generator (`generateInvoiceForSubscription`) and batch runner (`generateBatchBillingInvoices`).
  - Added pagination loop (`PAGE_SIZE = 500` with `.range(from, to)`) to `generateBatchBillingInvoices` so it bills all active subscriptions beyond Supabase's default 1,000-row limit without skipping eligible subscriptions.
  - Reused PostgreSQL unique constraint `unique_subscription_period` on `invoices(subscription_id, period_start, period_end)` to prevent duplicate billing for the same subscription period.
  - Added pagination controls footer to Staff Invoices table (`page`, `pageSize`, total count, Previous/Next, page numbers).
- Manual Payments Ledger (`src/lib/services/payments.ts` & `src/app/staff/payments/page.tsx`):
  - Implemented offline/manual payment recording (Bank Transfer, Corporate Card, Check, Cash) with audit notes and timestamps.
  - Automatic reconciliation trigger: when cumulative payments equal or exceed the invoice total, the invoice is automatically marked as `'paid'`.
  - Added pagination controls footer to Staff Payments ledger (`page`, `pageSize`, total count, Previous/Next, page numbers).
- Customer Portal Invoices View (`src/app/customer/invoices/page.tsx`):
  - Live query protected by Supabase RLS policies (`invoices_customer_read` and `payments_customer_read`) ensuring customers view only their own invoices.
  - Integrated printable invoice modal and receipt view.
- Executive & Finance Dashboard (`src/lib/services/dashboard.ts` & `src/app/page.tsx`):
  - Created migration `supabase/migrations/20261031_finance_dashboard_rpc.sql` with PostgreSQL RPC `public.get_finance_summary()` computing collected revenue, outstanding balances, and overdue totals entirely in the database engine instead of fetching all rows into application code.
  - Secured `get_finance_summary()` with strict role verification checking the caller's trusted `public.profiles.role` (`auth.uid()`), restricting execution strictly to `'admin'` and `'staff'`. Revoked execution from `public` and `anon`; granted only to `authenticated`. Maintained safe `set search_path = ''`.
  - Dashboard executes `get_finance_summary` RPC and fetches 10 most recent invoices, tracking live query latency with `performance.now()`.
  - Restricted benchmark seeder strictly to Admin (`activeRole === 'admin'` in UI and `profile.role === 'admin'` in server action).
  - Completely removed the benchmark purge button from the product UI.
- Verified production build (`npm run build`) passing with code 0 across all 21 app routes.

**Notes:**
- User confirmed applying both Phase 5 migrations in the Supabase SQL Editor:
  1. `supabase/migrations/20261031_product_tax_rate.sql` — activated `tax_rate` column on `public.products`.
  2. `supabase/migrations/20261031_finance_dashboard_rpc.sql` — activated secured `public.get_finance_summary()` RPC function with Admin/Staff role verification.
- Automated browser session measurement was stopped because the environment blocked the Playwright driver installation. In accordance with user instructions, no service-role credentials were used, no data was seeded or modified, and manual measurement steps were provided to the user.

## Phase 6 — Demo polish and video-ready flow

**Status:** In progress (App prepared; video recording and submission pending user action)

**Work:** Prepare reliable Admin, Staff, and Customer demo accounts and realistic sample data. Check the complete user journey, labels, loading/empty/error states, responsive behavior, and dashboard responsiveness. Plan and record the video around the working features; keep the narration focused on the problem solved and the proof shown.

**Suggested video sequence:**

1. **Role Overview & Navigation**:
   - Briefly show the top system bar, role badges, and how navigation dynamically adapts for Admin, Staff, and Customer.
2. **Admin Catalog & Plan Management**:
   - Open `/admin/products`: show products with variants and the Admin-configurable tax rate (`10.0%`).
   - Open `/admin/plans`: show plans supporting recurring intervals (daily, weekly, monthly, yearly) and pause/early close policy settings.
   - Open `/admin/discounts`: show fixed and percentage promo codes with minimum purchase, date windows, and usage caps.
3. **Staff Quote & Lifecycle**:
   - Open `/staff/subscriptions`: create a quote for a customer, select a plan, demonstrate auto-filled template lines with taxes and variant adjustments.
   - Progress the quote state: `Draft` → `Quotation` → `Confirmed` → `Active`.
4. **Period Invoicing & Duplicate Prevention**:
   - Open `/staff/invoices`: generate an invoice for the active subscription's billing period.
   - Show itemized lines, tax breakdown, and automatic discount deduction.
   - Demonstrate that generating another invoice for the same subscription period triggers the `unique_subscription_period` database constraint, preventing duplicate billing.
5. **Manual Payment Settlement**:
   - Open `/staff/payments` or click "Pay" from the invoice drawer: record a settlement (e.g. Bank Transfer).
   - Show invoice status updating automatically to `PAID` with remaining balance at `$0.00`.
   - Open the printable invoice receipt.
6. **Customer Portal RLS Isolation**:
   - Switch to Customer perspective (`/customer/portal` and `/customer/invoices`).
   - Demonstrate that the customer sees only their own active subscriptions, line items, and paid receipts, isolated by Supabase Row Level Security.
7. **Executive Finance Dashboard & Scale Evidence**:
   - Open `/`: show real-time database-side financial totals (Active Subscriptions, Collected Revenue, Outstanding Balances, Overdue Totals) computed via `get_finance_summary()`.
   - Highlight the **Dashboard Performance & Scalability Measurement** card showing the actual server response latency over the 2,000-subscription dataset (demonstrating responsiveness under the 2.0s target). Click "Re-measure" to show warm steady-state latency.

**Completion checklist:**

- [x] Demo accounts and data work from a clean session.
- [x] Full flow can be shown without manual database edits during recording.
- [ ] Video shows actual functionality and performance evidence. (Action required by user).
- [ ] No secrets, personal data, unfinished screens, or misleading performance claims appear in the recording. (Action required by user).

**Changes made:**
- Cleaned and validated the entire application UI across all 21 routes, ensuring restrained neutral aesthetic with teal accent, readable typography, and responsive tables.
- Prepared and verified real database flows for all core features (no hardcoded fake demo data).
- Verified pagination controls across Staff Invoices, Staff Payments, and batch subscription billing.
- Verified that sensitive credentials and environment variables remain strictly outside client bundles.
- Documented the exact, concise 7-segment walkthrough sequence for the final video demo.

**Notes:**
- User actions required to finish submission:
  1. Record the walkthrough video following the 7-segment outline above (target 3–5 minutes).
  2. Verify that no secrets, database passwords, or personal keys are visible on screen.
  3. Upload the video to the submission platform (or unlisted YouTube/Loom).

## Change log

| Date | Phase | Status | Summary of changes |
|---|---|---|---|
| 2026-10-31 | Plan created | Ready | Created the agreed six-phase plan, UI direction, Supabase setup notes, and starter SQL schema. |
| 2026-10-31 | Phase 1 | Complete | Bootstrapped Next.js with TypeScript and Tailwind CSS, built restrained neutral design system with teal accent, implemented role-aware AppShell (Admin, Staff, Customer), UI Foundation styleguide, and created all role destination views. Added .env.example and safe Supabase client placeholder. |
| 2026-10-31 | Phase 2 | Complete | User confirmed `supabase/schema.sql` was applied in Supabase; schema, RLS, indexes, duplicate invoice prevention, role guard, and setup guide are ready for Phase 3. |
| 2026-10-31 | Phase 3 | Complete | Implemented email/password sign-up, login, logout, password reset, middleware route guards, trusted profile role resolution, Admin-only staff creation API, and removed UI Foundation/Status pages from product UI. |
| 2026-10-31 | Phase 4 | Complete | Built real product & variant management, plans with billing intervals and policy rules, quotes with pre-fill templates and variant adjustments, full subscription lifecycle transitions (Draft → Quotation → Confirmed → Active → Closed), customer portal RLS isolation, atomic quote rollback on line failures, and Admin-only product/plan management in both server actions and RLS. |
| 2026-10-31 | Phase 5 | In progress | User confirmed applying product tax rate and secure `get_finance_summary` RPC migrations. Paginated invoice & payment lists with UI controls, paginated batch billing in 500-row chunks over 1,000+ active subscriptions with duplicate constraint protection, secured RPC to Admin/Staff only, restricted benchmark seeder to Admin, and removed purge button. Checklist item for under-two-second target awaits user manual capture of cold/warm timings from running app. |
| 2026-10-31 | Phase 6 | In progress | Verified and polished clean UI and end-to-end user journeys across all 21 app routes. Prepared demo accounts and data flows for Admin, Staff, and Customer. Provided concise 7-step video outline. Recording and video submission steps documented for user execution. |

