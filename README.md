# Subscription Management System

A role-based subscription and recurring billing web application designed for B2B recurring services, software subscriptions, and product variants. The system manages the full contract lifecycle from sales quotation to active contract, generates period-based invoices with automatic tax and discount calculations, supports manual payment reconciliation, and aggregates finance metrics directly in the database.

---

## Features

### Role-Based Access
- **Admin**: Configures products, variants, and billing plans; manages percentage and fixed discounts; creates and provisions staff accounts; monitors real-time finance KPIs.
- **Staff**: Manages customer records, builds quotes from plan templates, manages the quotation-to-contract lifecycle, generates periodic billing invoices (single or batch), and logs manual payments.
- **Customer**: Self-service portal to view active contracts, renewal dates, itemized plan details, and invoice history with payment status.

### Subscription Lifecycle
Enforces a server-validated state machine:
`Draft` → `Quotation` → `Confirmed` → `Active` → `Paused` / `Closed`
- Quotations can include plan base fees, variant price adjustments, and custom recurring add-on lines.
- Quotes cannot be created without lines; creation and line persistence operate atomically.

### Billing & Invoicing
- **Period-Based Invoicing**: Generates invoices for active subscriptions over specific billing windows.
- **Duplicate Prevention**: Backed by a database unique constraint on `(subscription_id, period_start, period_end)` so subscriptions cannot be billed twice for the same cycle.
- **Automatic Tax & Discounts**: Line item taxes are computed from the product's configured tax rate; discounts apply fixed or percentage reductions with validity date and maximum usage checks.
- **Scalable Batch Billing**: Processes large customer bases in paginated database batches to prevent timeouts or row limit cutoffs.
- **Payment Reconciliation**: Supports manual payment recording with partial and full settlement, automatically updating invoice status to `paid`.

### Database-Side Finance Analytics
Executive dashboard metrics (active contracts, total revenue, outstanding balances, overdue totals) are aggregated via a dedicated PostgreSQL function (`get_finance_summary`) rather than pulling thousands of raw records into application memory.

---

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) 16 (App Router, Server Actions, Route Handlers)
- **Language**: TypeScript 5
- **UI & Styling**: React 19, Tailwind CSS v4, Lucide React icons
- **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL, Row Level Security, Auth, `@supabase/ssr`)

---

## Getting Started

### Prerequisites
- Node.js 18.18+ or Node.js 20+
- npm, pnpm, or yarn
- A Supabase project

### 1. Clone & Install Dependencies
```bash
git clone <repository-url>
cd Subscription-Managment-System
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Fill in your Supabase project credentials in `.env.local`:
```env
# Supabase Project URL & Anon Key (from Project Settings -> API)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-publishable-key

# Server-side only key for Admin operations (e.g. staff provisioning)
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-secret-key
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Database & Supabase Setup

To set up the database, run the SQL files in your Supabase project's **SQL Editor** in the following order.

### Step 1: Baseline Schema (`supabase/schema.sql`)
Open [`supabase/schema.sql`](supabase/schema.sql), copy its contents into the Supabase SQL Editor, and run it. This creates:
- Core tables (`profiles`, `customers`, `products`, `product_variants`, `plans`, `subscriptions`, `subscription_lines`, `discounts`, `invoices`, `invoice_lines`, `payments`).
- Unique constraint `unique_subscription_period` on `invoices` to prevent duplicate billing.
- Row Level Security (RLS) policies on all tables.
- Database trigger `handle_new_user()` ensuring public registrations default strictly to the `customer` role.

### Step 2: Configure Supabase Auth
In your Supabase Dashboard:
1. Navigate to **Authentication** → **URL Configuration**.
2. Set **Site URL** to:
   ```text
   http://localhost:3000
   ```
3. Under **Redirect URLs**, add:
   ```text
   http://localhost:3000/**
   http://localhost:3000/auth/callback
   http://localhost:3000/auth/reset-password
   ```
4. Save the configuration.

### Step 3: Promote Initial Administrator
Public sign-up forms never grant `admin` privileges. To configure your primary administrator:
1. Register an account through `/auth/signup` or create a user in **Authentication** → **Users**.
2. In the Supabase SQL Editor, run:
   ```sql
   select public.promote_user_to_admin('your-admin-email@example.com');
   ```

### Step 4: Apply Project Migrations
Run each migration script in order via the Supabase SQL Editor:

1. **Admin-Only Products & Plans** (`supabase/migrations/20261031_admin_only_products_plans.sql`):
   Restricts product, variant, and plan writes to Admins while maintaining read access for Staff.
2. **Product Tax Rate** (`supabase/migrations/20261031_product_tax_rate.sql`):
   Adds configurable `tax_rate` to products, used automatically during quote and invoice generation.
3. **Finance Dashboard RPC** (`supabase/migrations/20261031_finance_dashboard_rpc.sql`):
   Creates the `get_finance_summary()` database function with strict `auth.uid()` role verification for Admin and Staff callers.

---

## Verification & Reviewer Flow

A reviewer can test the core workflows with the following sequence:

1. **Sign In as Admin**:
   - Access `/admin/products` and `/admin/plans` to view or create product definitions, regional variants, and recurring billing plans.
   - Access `/admin/discounts` to create percentage or fixed discount coupons.
   - Access `/admin/staff` to provision new Staff members.
2. **Create & Progress a Subscription as Staff**:
   - Sign in as Staff and navigate to `/staff/subscriptions`.
   - Click **New Quote / Subscription**, pick a customer and plan. The quotation template automatically populates period dates, payment terms, pricing, and line items.
   - Advance the quote through the lifecycle: `Send Quote` (`Draft` → `Quotation`) → `Confirm Quote` (`Quotation` → `Confirmed`) → `Activate Contract` (`Confirmed` → `Active`).
3. **Generate Invoices**:
   - Go to `/staff/invoices` and click **Generate Invoices**.
   - Run a batch billing pass for the period. Invoices are generated with calculated subtotal, tax, and total. Running the same period again triggers duplicate prevention.
4. **Record Payment**:
   - Click **Pay** on an invoice to log a manual bank transfer or cash payment. The remaining balance updates and marks settled invoices as `paid`.
5. **Customer Portal**:
   - Log in with the customer's credentials and visit `/customer/portal`. Confirm that the active subscription, renewal date, and invoice history are visible with correct isolation.
6. **Finance Dashboard**:
   - Visit `/` as Admin or Staff to view live database-computed totals for revenue, receivables, and overdue invoices.
