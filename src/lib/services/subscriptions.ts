"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { SubscriptionStatus } from "@/types";

export interface SubscriptionLineInput {
  product_id: string;
  variant_id?: string | null;
  description: string;
  quantity: number;
  unit_price: number;
  tax_rate: number;
}

export interface CreateSubscriptionQuoteInput {
  customer_id: string;
  plan_id: string;
  start_date: string;
  expiry_date?: string | null;
  payment_terms?: string;
  lines: SubscriptionLineInput[];
}

// Generate sequential/unique subscription number e.g. SUB-2026-1001
function generateSubNumber(): string {
  const year = new Date().getFullYear();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `SUB-${year}-${randomSuffix}`;
}

// Allowed state transitions based on plan policy
export const VALID_TRANSITIONS: Record<SubscriptionStatus, SubscriptionStatus[]> = {
  draft: ["quotation", "closed"],
  quotation: ["confirmed", "draft", "closed"],
  confirmed: ["active", "closed"],
  active: ["paused", "closed"],
  paused: ["active", "closed"],
  closed: [], // Terminal state
};

// Fetch subscriptions (Role-aware: Customers only see their own; Staff/Admin see all)
export async function getSubscriptions(targetCustomerId?: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let query = supabase
    .from("subscriptions")
    .select(`
      *,
      customer:customers(id, name, email),
      plan:plans(
        id,
        name,
        billing_interval,
        price,
        allow_pause,
        allow_early_close,
        allow_renewal,
        product:products(id, name)
      ),
      lines:subscription_lines(
        id,
        product_id,
        variant_id,
        description,
        quantity,
        unit_price,
        tax_rate,
        variant:product_variants(id, name, price_adjustment)
      )
    `)
    .order("created_at", { ascending: false });

  // If customer is querying, enforce customer filter or let RLS handle it
  if (targetCustomerId) {
    query = query.eq("customer_id", targetCustomerId);
  }

  const { data: subscriptions, error } = await query;

  if (error) {
    console.error("Error fetching subscriptions:", error.message);
    return { data: [], error: error.message };
  }

  // Calculate computed totals for each subscription
  const enriched = (subscriptions || []).map((sub: any) => {
    let subtotal = 0;
    let taxTotal = 0;

    (sub.lines || []).forEach((line: any) => {
      const lineSub = Number(line.quantity) * Number(line.unit_price);
      const lineTax = lineSub * (Number(line.tax_rate) / 100);
      subtotal += lineSub;
      taxTotal += lineTax;
    });

    return {
      ...sub,
      linesTotal: subtotal,
      taxTotal,
      grandTotal: subtotal + taxTotal,
    };
  });

  return { data: enriched, error: null };
}

// Fetch single subscription with lines
export async function getSubscriptionById(id: string) {
  const supabase = await createClient();

  const { data: sub, error } = await supabase
    .from("subscriptions")
    .select(`
      *,
      customer:customers(id, name, email, auth_user_id),
      plan:plans(
        id,
        name,
        billing_interval,
        price,
        allow_pause,
        allow_early_close,
        allow_renewal,
        product:products(id, name)
      ),
      lines:subscription_lines(
        id,
        product_id,
        variant_id,
        description,
        quantity,
        unit_price,
        tax_rate,
        variant:product_variants(id, name, price_adjustment)
      )
    `)
    .eq("id", id)
    .single();

  if (error || !sub) {
    return { data: null, error: error?.message || "Subscription not found." };
  }

  let subtotal = 0;
  let taxTotal = 0;
  (sub.lines || []).forEach((line: any) => {
    const lineSub = Number(line.quantity) * Number(line.unit_price);
    const lineTax = lineSub * (Number(line.tax_rate) / 100);
    subtotal += lineSub;
    taxTotal += lineTax;
  });

  return {
    data: {
      ...sub,
      linesTotal: subtotal,
      taxTotal,
      grandTotal: subtotal + taxTotal,
    },
    error: null,
  };
}

// Create a Quote / Subscription with line items
export async function createSubscriptionQuote(input: CreateSubscriptionQuoteInput) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Authentication required." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || (profile.role !== "admin" && profile.role !== "staff")) {
    return { error: "Permission denied. Staff or Admin role required." };
  }

  if (!input.customer_id) {
    return { error: "Customer selection is required." };
  }

  if (!input.plan_id) {
    return { error: "Plan selection is required." };
  }

  if (!input.lines || input.lines.length === 0) {
    return { error: "At least one product line item is required." };
  }

  // Generate unique subscription number
  let subNum = generateSubNumber();
  let subCreated = false;
  let attempts = 0;
  let subRecord: any = null;

  while (!subCreated && attempts < 5) {
    attempts++;
    const { data, error } = await supabase
      .from("subscriptions")
      .insert({
        subscription_number: subNum,
        customer_id: input.customer_id,
        plan_id: input.plan_id,
        status: "draft", // Always create quotes in draft; lifecycle transitions must use updateSubscriptionStatus
        start_date: input.start_date,
        expiry_date: input.expiry_date || null,
        payment_terms: input.payment_terms || "Net 30",
      })
      .select()
      .single();

    if (!error && data) {
      subRecord = data;
      subCreated = true;
    } else if (error && error.code === "23505") {
      // Unique violation on subscription_number, regenerate
      subNum = generateSubNumber();
    } else {
      return { error: error?.message || "Failed to create subscription record." };
    }
  }

  if (!subRecord) {
    return { error: "Could not generate unique subscription number." };
  }

  // Insert subscription lines
  const linesToInsert = input.lines.map((line) => ({
    subscription_id: subRecord.id,
    product_id: line.product_id,
    variant_id: line.variant_id || null,
    description: line.description,
    quantity: Number(line.quantity) || 1,
    unit_price: Number(line.unit_price) || 0,
    tax_rate: Number(line.tax_rate) || 0,
  }));

  const { error: lineErr } = await supabase
    .from("subscription_lines")
    .insert(linesToInsert);

  if (lineErr) {
    console.error("Error creating subscription lines:", lineErr.message);
    // Atomic cleanup: remove the empty quote to avoid orphan quotes without lines
    await supabase.from("subscriptions").delete().eq("id", subRecord.id);
    return {
      error: `Failed to save quote line items: ${lineErr.message}. The quote creation was cancelled.`,
    };
  }

  revalidatePath("/staff/subscriptions");
  revalidatePath("/customer/subscriptions");
  revalidatePath("/customer/portal");
  return { data: subRecord, error: null };
}

// Update subscription status enforcing lifecycle transition rules
export async function updateSubscriptionStatus(
  id: string,
  newStatus: SubscriptionStatus,
  reason?: string
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Authentication required." };
  }

  // 1. Fetch current subscription and linked plan policy
  const { data: currentSub, error: fetchErr } = await supabase
    .from("subscriptions")
    .select(`
      id,
      status,
      plan:plans(
        id,
        allow_pause,
        allow_early_close,
        allow_renewal
      )
    `)
    .eq("id", id)
    .single();

  if (fetchErr || !currentSub) {
    return { error: "Subscription not found." };
  }

  const currentStatus = currentSub.status as SubscriptionStatus;
  const planPolicy = currentSub.plan as any;

  // 2. Validate lifecycle progression
  const allowed = VALID_TRANSITIONS[currentStatus] || [];
  if (!allowed.includes(newStatus)) {
    return {
      error: `Invalid status transition: Cannot transition from '${currentStatus}' to '${newStatus}'. Allowed: ${allowed.join(", ") || "none"}.`,
    };
  }

  // 3. Plan-specific policy enforcement
  if (newStatus === "paused" && planPolicy && !planPolicy.allow_pause) {
    return { error: "This subscription's plan does not allow pausing." };
  }

  if (newStatus === "closed" && currentStatus === "active" && planPolicy && !planPolicy.allow_early_close) {
    return { error: "This subscription's plan does not allow early termination/closure." };
  }

  // 4. Update status in database
  const { data: updated, error: updateErr } = await supabase
    .from("subscriptions")
    .update({ status: newStatus })
    .eq("id", id)
    .select()
    .single();

  if (updateErr) {
    return { error: updateErr.message };
  }

  revalidatePath("/staff/subscriptions");
  revalidatePath("/customer/subscriptions");
  revalidatePath("/customer/portal");
  return { data: updated, error: null };
}

// Pre-fill quotation template helper based on plan and product details
export async function getQuotationTemplateForPlan(plan: any, variant?: any) {
  const today = new Date().toISOString().split("T")[0];

  // Calculate default expiry date based on interval
  const expDate = new Date();
  if (plan.billing_interval === "daily") expDate.setDate(expDate.getDate() + 1);
  else if (plan.billing_interval === "weekly") expDate.setDate(expDate.getDate() + 7);
  else if (plan.billing_interval === "monthly") expDate.setMonth(expDate.getMonth() + 1);
  else if (plan.billing_interval === "yearly") expDate.setFullYear(expDate.getFullYear() + 1);

  const priceAdjustment = variant ? Number(variant.price_adjustment || 0) : 0;
  const unitPrice = Number(plan.price) + priceAdjustment;

  return {
    start_date: today,
    expiry_date: expDate.toISOString().split("T")[0],
    payment_terms: "Net 30",
    lines: [
      {
        product_id: plan.product_id || plan.product?.id,
        variant_id: variant?.id || null,
        description: variant
          ? `${plan.name} (${variant.name})`
          : plan.name,
        quantity: plan.minimum_quantity || 1,
        unit_price: unitPrice,
        tax_rate: plan.product?.tax_rate !== undefined ? Number(plan.product.tax_rate) : 10.0,
      },
    ],
  };
}
