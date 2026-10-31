-- ==============================================================================
-- SEED DEMO DATA FOR ACCOUNTS:
-- Customer: nihal6235chiyoor@gmail.com
-- Staff:    nihalchiyoor6235@gmail.com
-- Admin:    nihal.chiyoor@gmail.com
-- ==============================================================================

-- 1. Ensure Verified Roles in public.profiles
UPDATE public.profiles
SET role = 'admin'
WHERE id IN (SELECT id FROM auth.users WHERE email = 'nihal.chiyoor@gmail.com');

UPDATE public.profiles
SET role = 'staff'
WHERE id IN (SELECT id FROM auth.users WHERE email = 'nihalchiyoor6235@gmail.com');

UPDATE public.profiles
SET role = 'customer'
WHERE id IN (SELECT id FROM auth.users WHERE email = 'nihal6235chiyoor@gmail.com');

-- 2. Clean up unlinked customer duplicate and ensure linked customer record exists
DELETE FROM public.customers
WHERE email = 'nihal6235chiyoor@gmail.com' AND auth_user_id IS NULL;

INSERT INTO public.customers (auth_user_id, name, email)
SELECT 
  id, 
  COALESCE(raw_user_meta_data->>'full_name', 'Sinan Chiyoor'), 
  email
FROM auth.users
WHERE email = 'nihal6235chiyoor@gmail.com'
ON CONFLICT (auth_user_id) DO UPDATE
SET 
  name = EXCLUDED.name,
  email = EXCLUDED.email;

-- 3. Insert Subscriptions, Lines, Invoices, and Payments
DO $$
DECLARE
  v_customer_id uuid;
  v_plan_enterprise uuid;
  v_plan_storage uuid;
  v_plan_support uuid;
  v_product_server uuid;
  v_product_storage uuid;
  v_product_support uuid;
  v_variant_ram uuid;
  v_variant_storage uuid;
  v_sub_active uuid;
  v_sub_quote uuid;
  v_sub_draft uuid;
  v_inv_paid uuid;
  v_inv_confirmed uuid;
BEGIN
  -- Retrieve Customer ID
  SELECT id INTO v_customer_id
  FROM public.customers
  WHERE email = 'nihal6235chiyoor@gmail.com'
  LIMIT 1;

  IF v_customer_id IS NULL THEN
    RAISE EXCEPTION 'Customer nihal6235chiyoor@gmail.com not found. Ensure the user is registered.';
  END IF;

  -- Retrieve Plans & Products
  SELECT id, product_id INTO v_plan_enterprise, v_product_server
  FROM public.plans
  WHERE name ILIKE '%Enterprise Dedicated — Monthly%'
  LIMIT 1;

  SELECT id, product_id INTO v_plan_storage, v_product_storage
  FROM public.plans
  WHERE name ILIKE '%Business Cloud Storage — Monthly Base%'
  LIMIT 1;

  SELECT id, product_id INTO v_plan_support, v_product_support
  FROM public.plans
  WHERE name ILIKE '%Priority Support — Monthly SLA%'
  LIMIT 1;

  -- Fallbacks if specific plan names differ
  IF v_plan_enterprise IS NULL THEN
    SELECT id, product_id INTO v_plan_enterprise, v_product_server FROM public.plans LIMIT 1;
  END IF;
  IF v_plan_storage IS NULL THEN
    v_plan_storage := v_plan_enterprise;
    v_product_storage := v_product_server;
  END IF;
  IF v_plan_support IS NULL THEN
    v_plan_support := v_plan_enterprise;
    v_product_support := v_product_server;
  END IF;

  -- Retrieve Variants
  SELECT id INTO v_variant_ram
  FROM public.product_variants
  WHERE product_id = v_product_server AND name ILIKE '%64GB%'
  LIMIT 1;

  SELECT id INTO v_variant_storage
  FROM public.product_variants
  WHERE product_id = v_product_storage AND name ILIKE '%Multi-Region%'
  LIMIT 1;

  -- ----------------------------------------------------------------------------
  -- A. ACTIVE SUBSCRIPTION (SUB-2026-00101)
  -- ----------------------------------------------------------------------------
  INSERT INTO public.subscriptions (
    subscription_number,
    customer_id,
    plan_id,
    status,
    start_date,
    expiry_date,
    payment_terms
  ) VALUES (
    'SUB-2026-00101',
    v_customer_id,
    v_plan_enterprise,
    'active',
    '2026-10-01',
    '2027-10-01',
    'Net 30'
  )
  ON CONFLICT (subscription_number) DO UPDATE
  SET 
    customer_id = EXCLUDED.customer_id,
    status = 'active',
    start_date = EXCLUDED.start_date,
    expiry_date = EXCLUDED.expiry_date
  RETURNING id INTO v_sub_active;

  -- Lines for Active Subscription
  DELETE FROM public.subscription_lines WHERE subscription_id = v_sub_active;

  INSERT INTO public.subscription_lines (
    subscription_id,
    product_id,
    variant_id,
    description,
    quantity,
    unit_price,
    tax_rate
  ) VALUES 
  (
    v_sub_active,
    v_product_server,
    v_variant_ram,
    'Enterprise Dedicated Server (64GB High-Memory RAM)',
    1,
    530.00,
    10.00
  ),
  (
    v_sub_active,
    v_product_support,
    NULL,
    'Priority Support SLA Add-on',
    1,
    100.00,
    10.00
  );

  -- ----------------------------------------------------------------------------
  -- B. QUOTATION READY FOR REVIEW (SUB-2026-00102)
  -- ----------------------------------------------------------------------------
  INSERT INTO public.subscriptions (
    subscription_number,
    customer_id,
    plan_id,
    status,
    start_date,
    expiry_date,
    payment_terms
  ) VALUES (
    'SUB-2026-00102',
    v_customer_id,
    v_plan_storage,
    'quotation',
    '2026-11-01',
    '2027-11-01',
    'Net 15'
  )
  ON CONFLICT (subscription_number) DO UPDATE
  SET 
    customer_id = EXCLUDED.customer_id,
    status = 'quotation',
    start_date = EXCLUDED.start_date
  RETURNING id INTO v_sub_quote;

  DELETE FROM public.subscription_lines WHERE subscription_id = v_sub_quote;

  INSERT INTO public.subscription_lines (
    subscription_id,
    product_id,
    variant_id,
    description,
    quantity,
    unit_price,
    tax_rate
  ) VALUES (
    v_sub_quote,
    v_product_storage,
    v_variant_storage,
    'Business Cloud Storage (Multi-Region Replication)',
    2,
    134.00,
    10.00
  );

  -- ----------------------------------------------------------------------------
  -- C. DRAFT QUOTATION (SUB-2026-00103)
  -- ----------------------------------------------------------------------------
  INSERT INTO public.subscriptions (
    subscription_number,
    customer_id,
    plan_id,
    status,
    start_date,
    expiry_date,
    payment_terms
  ) VALUES (
    'SUB-2026-00103',
    v_customer_id,
    v_plan_support,
    'draft',
    '2026-11-15',
    '2027-11-15',
    'Due on Receipt'
  )
  ON CONFLICT (subscription_number) DO UPDATE
  SET 
    customer_id = EXCLUDED.customer_id,
    status = 'draft'
  RETURNING id INTO v_sub_draft;

  DELETE FROM public.subscription_lines WHERE subscription_id = v_sub_draft;

  INSERT INTO public.subscription_lines (
    subscription_id,
    product_id,
    variant_id,
    description,
    quantity,
    unit_price,
    tax_rate
  ) VALUES (
    v_sub_draft,
    v_product_support,
    NULL,
    'Priority Support Package — Monthly SLA',
    1,
    199.00,
    10.00
  );

  -- ----------------------------------------------------------------------------
  -- D. INVOICE 1: SETTLED OCTOBER BILLING (INV-2026-00091)
  -- ----------------------------------------------------------------------------
  INSERT INTO public.invoices (
    invoice_number,
    subscription_id,
    customer_id,
    period_start,
    period_end,
    status,
    subtotal,
    discount_total,
    tax_total,
    total,
    due_date
  ) VALUES (
    'INV-2026-00091',
    v_sub_active,
    v_customer_id,
    '2026-10-01',
    '2026-10-31',
    'paid',
    630.00,
    0.00,
    63.00,
    693.00,
    '2026-10-15'
  )
  ON CONFLICT (subscription_id, period_start, period_end) DO UPDATE
  SET 
    status = 'paid',
    total = 693.00
  RETURNING id INTO v_inv_paid;

  DELETE FROM public.invoice_lines WHERE invoice_id = v_inv_paid;

  INSERT INTO public.invoice_lines (
    invoice_id,
    description,
    quantity,
    unit_price,
    tax_rate,
    line_total
  ) VALUES 
  (
    v_inv_paid,
    'Enterprise Dedicated Server (64GB High-Memory RAM)',
    1,
    530.00,
    10.00,
    530.00
  ),
  (
    v_inv_paid,
    'Priority Support SLA Add-on',
    1,
    100.00,
    10.00,
    100.00
  );

  -- Payment for October Invoice
  DELETE FROM public.payments WHERE invoice_id = v_inv_paid;

  INSERT INTO public.payments (
    invoice_id,
    method,
    amount,
    paid_at,
    note
  ) VALUES (
    v_inv_paid,
    'Bank Wire Transfer',
    693.00,
    '2026-10-12 14:30:00+00',
    'Settled in full via Wire Transfer ref #WT-88219'
  );

  -- ----------------------------------------------------------------------------
  -- E. INVOICE 2: CURRENT NOVEMBER BILLING (INV-2026-00092)
  -- ----------------------------------------------------------------------------
  INSERT INTO public.invoices (
    invoice_number,
    subscription_id,
    customer_id,
    period_start,
    period_end,
    status,
    subtotal,
    discount_total,
    tax_total,
    total,
    due_date
  ) VALUES (
    'INV-2026-00092',
    v_sub_active,
    v_customer_id,
    '2026-11-01',
    '2026-11-30',
    'confirmed',
    630.00,
    0.00,
    63.00,
    693.00,
    '2026-11-15'
  )
  ON CONFLICT (subscription_id, period_start, period_end) DO UPDATE
  SET 
    status = 'confirmed',
    total = 693.00
  RETURNING id INTO v_inv_confirmed;

  DELETE FROM public.invoice_lines WHERE invoice_id = v_inv_confirmed;

  INSERT INTO public.invoice_lines (
    invoice_id,
    description,
    quantity,
    unit_price,
    tax_rate,
    line_total
  ) VALUES 
  (
    v_inv_confirmed,
    'Enterprise Dedicated Server (64GB High-Memory RAM)',
    1,
    530.00,
    10.00,
    530.00
  ),
  (
    v_inv_confirmed,
    'Priority Support SLA Add-on',
    1,
    100.00,
    10.00,
    100.00
  );

  RAISE NOTICE 'Demo data successfully seeded for customer %', v_customer_id;
END $$;
