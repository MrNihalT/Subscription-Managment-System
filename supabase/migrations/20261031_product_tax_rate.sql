-- Migration: 20261031_product_tax_rate.sql
-- Description: Add tax_rate column to public.products for Admin-configured per-product tax calculations

alter table public.products
  add column if not exists tax_rate numeric(5,2) not null default 10.0 check (tax_rate >= 0);

comment on column public.products.tax_rate is 'Admin-configurable percentage tax rate applied automatically to subscription lines and invoices';
