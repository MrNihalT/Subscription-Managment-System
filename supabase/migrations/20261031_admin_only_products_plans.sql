-- Migration: 20261031_admin_only_products_plans.sql
-- Description: Restrict creation, updating, and deletion of products, product variants,
-- and plans strictly to Admin role, while maintaining full read access for Staff and authenticated users.

-- 1. PRODUCTS: Drop staff manage policy and replace with admin-only manage policy
drop policy if exists "products_staff_manage" on public.products;
drop policy if exists "products_admin_manage" on public.products;

create policy "products_admin_manage" on public.products
  for all to authenticated
  using ((select public.current_user_is_admin()))
  with check ((select public.current_user_is_admin()));

-- 2. PRODUCT VARIANTS: Drop staff manage policy and replace with admin-only manage policy
drop policy if exists "variants_staff_manage" on public.product_variants;
drop policy if exists "variants_admin_manage" on public.product_variants;

create policy "variants_admin_manage" on public.product_variants
  for all to authenticated
  using ((select public.current_user_is_admin()))
  with check ((select public.current_user_is_admin()));

-- 3. PLANS: Drop staff manage policy and replace with admin-only manage policy
drop policy if exists "plans_staff_manage" on public.plans;
drop policy if exists "plans_admin_manage" on public.plans;

create policy "plans_admin_manage" on public.plans
  for all to authenticated
  using ((select public.current_user_is_admin()))
  with check ((select public.current_user_is_admin()));
