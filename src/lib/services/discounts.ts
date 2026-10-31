"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface DiscountInput {
  name: string;
  discount_type: "fixed" | "percentage";
  value: number;
  minimum_purchase?: number;
  minimum_quantity?: number;
  starts_at?: string | null;
  ends_at?: string | null;
  usage_limit?: number | null;
  product_id?: string | null;
  active?: boolean;
}

// Fetch all discounts (Admin sees all; Staff/Auth sees active)
export async function getDiscounts() {
  const supabase = await createClient();

  const { data: discounts, error } = await supabase
    .from("discounts")
    .select(`
      *,
      product:products(id, name)
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching discounts:", error.message);
    return { data: [], error: error.message };
  }

  return { data: discounts || [], error: null };
}

// Admin-only: Create a new discount rule
export async function createDiscount(input: DiscountInput) {
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

  if (!profile || profile.role !== "admin") {
    return { error: "Permission denied. Admin privileges required to create discounts." };
  }

  if (!input.name.trim()) {
    return { error: "Discount name is required." };
  }

  if (Number(input.value) <= 0) {
    return { error: "Discount value must be greater than 0." };
  }

  if (input.discount_type === "percentage" && Number(input.value) > 100) {
    return { error: "Percentage discount cannot exceed 100%." };
  }

  const { data: discount, error } = await supabase
    .from("discounts")
    .insert({
      name: input.name.trim(),
      discount_type: input.discount_type,
      value: Number(input.value),
      minimum_purchase: Number(input.minimum_purchase) || 0,
      minimum_quantity: Number(input.minimum_quantity) || 1,
      starts_at: input.starts_at || null,
      ends_at: input.ends_at || null,
      usage_limit: input.usage_limit ? Number(input.usage_limit) : null,
      product_id: input.product_id || null,
      active: input.active !== undefined ? input.active : true,
    })
    .select(`
      *,
      product:products(id, name)
    `)
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/discounts");
  revalidatePath("/staff/invoices");
  return { data: discount, error: null };
}

// Admin-only: Update an existing discount rule
export async function updateDiscount(id: string, input: Partial<DiscountInput>) {
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

  if (!profile || profile.role !== "admin") {
    return { error: "Permission denied. Admin privileges required to update discounts." };
  }

  const updateFields: any = {};
  if (input.name !== undefined) updateFields.name = input.name.trim();
  if (input.discount_type !== undefined) updateFields.discount_type = input.discount_type;
  if (input.value !== undefined) updateFields.value = Number(input.value);
  if (input.minimum_purchase !== undefined) updateFields.minimum_purchase = Number(input.minimum_purchase);
  if (input.minimum_quantity !== undefined) updateFields.minimum_quantity = Number(input.minimum_quantity);
  if (input.starts_at !== undefined) updateFields.starts_at = input.starts_at || null;
  if (input.ends_at !== undefined) updateFields.ends_at = input.ends_at || null;
  if (input.usage_limit !== undefined) {
    updateFields.usage_limit = input.usage_limit ? Number(input.usage_limit) : null;
  }
  if (input.product_id !== undefined) updateFields.product_id = input.product_id || null;
  if (input.active !== undefined) updateFields.active = input.active;

  const { data: updated, error } = await supabase
    .from("discounts")
    .update(updateFields)
    .eq("id", id)
    .select(`
      *,
      product:products(id, name)
    `)
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/discounts");
  revalidatePath("/staff/invoices");
  return { data: updated, error: null };
}

// Evaluate the best automatic eligible discount for a set of subscription/invoice lines and subtotal
export async function evaluateEligibleDiscount(lines: any[], subtotal: number) {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];

  const { data: discounts } = await supabase
    .from("discounts")
    .select("*")
    .eq("active", true);

  if (!discounts || discounts.length === 0) {
    return { discount: null, discountAmount: 0 };
  }

  let bestDiscount: any = null;
  let maxDiscountAmount = 0;

  for (const disc of discounts) {
    // 1. Date validity check
    if (disc.starts_at && disc.starts_at > today) continue;
    if (disc.ends_at && disc.ends_at < today) continue;

    // 2. Usage limit check
    if (disc.usage_limit && Number(disc.uses_count) >= Number(disc.usage_limit)) {
      continue;
    }

    // 3. Minimum purchase check
    if (subtotal < Number(disc.minimum_purchase || 0)) {
      continue;
    }

    // 4. Scope and Minimum Quantity check
    let eligibleSubtotal = subtotal;
    if (disc.product_id) {
      // Product-scoped discount
      const matchingLines = lines.filter((l) => l.product_id === disc.product_id);
      const matchingQty = matchingLines.reduce((sum, l) => sum + Number(l.quantity || 1), 0);
      if (matchingQty < Number(disc.minimum_quantity || 1)) {
        continue;
      }
      eligibleSubtotal = matchingLines.reduce(
        (sum, l) => sum + Number(l.quantity) * Number(l.unit_price),
        0
      );
    } else {
      // Order/Subscription-scoped discount
      const totalQty = lines.reduce((sum, l) => sum + Number(l.quantity || 1), 0);
      if (totalQty < Number(disc.minimum_quantity || 1)) {
        continue;
      }
    }

    // 5. Calculate discount savings
    let calculatedAmount = 0;
    if (disc.discount_type === "percentage") {
      calculatedAmount = (Number(disc.value) / 100) * eligibleSubtotal;
    } else {
      calculatedAmount = Math.min(Number(disc.value), eligibleSubtotal);
    }

    if (calculatedAmount > maxDiscountAmount) {
      maxDiscountAmount = calculatedAmount;
      bestDiscount = disc;
    }
  }

  return {
    discount: bestDiscount,
    discountAmount: Math.round(maxDiscountAmount * 100) / 100,
  };
}

// Safely increment uses count on confirmed invoice
export async function incrementDiscountUses(discountId: string) {
  const supabase = await createClient();
  const { data: current } = await supabase
    .from("discounts")
    .select("uses_count")
    .eq("id", discountId)
    .single();

  if (current) {
    await supabase
      .from("discounts")
      .update({ uses_count: (current.uses_count || 0) + 1 })
      .eq("id", discountId);
  }
}
