# Supabase Setup Guide — Phase 2

This guide outlines the repeatable steps to apply the schema, configure access rules, and prepare Supabase for the Subscription Management System.

---

## 1. Apply Database Schema & Access Rules

1. Log in to your [Supabase Dashboard](https://supabase.com/dashboard).
2. Open your project.
3. In the left navigation, click on **SQL Editor**.
4. Click **New Query** (or paste into an existing query tab).
5. Open the [`supabase/schema.sql`](./schema.sql) file from this repository and copy its entire content into the SQL Editor.
6. Click **Run** (or press `Cmd + Enter` / `Ctrl + Enter`).
7. Confirm that the query succeeds with `Success. No rows returned`.

### What This Created:
- **Extensions**: `pgcrypto` for UUID generation.
- **Tables**: `profiles`, `customers`, `products`, `product_variants`, `plans`, `subscriptions`, `subscription_lines`, `discounts`, `invoices`, `invoice_lines`, `payments`.
- **Duplicate Prevention Constraint**: `unique_subscription_period` on `invoices(subscription_id, period_start, period_end)` ensuring no period can be billed twice.
- **Indexes**: Customer, status, and date indexes on `subscriptions`, `invoices`, `payments`, and `plans` for high-performance dashboard filters.
- **Row Level Security (RLS)**: Enabled across all 11 tables.
- **Sign-up Safety Trigger**: `handle_new_user()` ensures all public registrations are strictly assigned the `customer` role and cannot elevate their role to `admin` or `staff`.
- **Helper Functions**: `current_user_is_admin()`, `current_user_is_staff()`, and `current_user_owns_customer()`.

---

## 2. Authentication & URL Configuration

In the Supabase Dashboard:

1. Go to **Authentication** → **URL Configuration**.
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
4. Click **Save**.

---

## 3. Email Provider Configuration

1. In the Supabase Dashboard, navigate to **Authentication** → **Providers** → **Email**.
2. Ensure **Email provider** is **Enabled**.
3. Keep **Confirm email** enabled or disabled according to your testing preference for local development.
4. **Important**: Use Supabase's built-in email service or a standard transactional SMTP service. Never ask for or enter personal Google/Gmail passwords.

---

## 4. Trusted Initial Admin Setup

Public sign-up forms in this application can never assign the `admin` or `staff` role. To establish your initial Administrator:

1. Sign up a new user through Supabase Auth (either in the app sign-up screen in Phase 3, or in Supabase Dashboard → **Authentication** → **Users** → **Add user** with an email and password).
2. In the **SQL Editor**, run the trusted promotion procedure:
   ```sql
   select public.promote_user_to_admin('your-admin-email@example.com');
   ```
3. The function will safely update the user's role to `'admin'` in `public.profiles`.
4. Subsequent staff accounts can then be managed directly by this Admin in the Admin portal.
