"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { BillingInterval } from "@/types";

export interface PlanInput {
  product_id: string;
  name: string;
  price: number;
  billing_interval: BillingInterval;
  minimum_quantity: number;
  available_from?: string | null;
  available_until?: string | null;
  allow_pause?: boolean;
  allow_early_close?: boolean;
  allow_renewal?: boolean;
  active?: boolean;
}

// Fetch all plans with joined product details
export async function getPlans() {
  const supabase = await createClient();

  const { data: plans, error } = await supabase
    .from("plans")
    .select(`
      *,
      product:products(
        id,
        name,
        product_type,
        sales_price,
        cost_price,
        variants:product_variants(*)
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching plans:", error.message);
    return { data: [], error: error.message };
  }

  return { data: plans, error: null };
}

// Create a new plan
export async function createPlan(input: PlanInput) {
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
    return { error: "Permission denied. Admin or Staff privileges required." };
  }

  if (!input.product_id) {
    return { error: "A linked catalog product is required." };
  }

  if (Number(input.price) < 0) {
    return { error: "Plan price must be non-negative." };
  }

  if (Number(input.minimum_quantity) < 1) {
    return { error: "Minimum quantity must be at least 1." };
  }

  const { data: plan, error } = await supabase
    .from("plans")
    .insert({
      product_id: input.product_id,
      name: input.name.trim(),
      price: Number(input.price),
      billing_interval: input.billing_interval,
      minimum_quantity: Number(input.minimum_quantity) || 1,
      available_from: input.available_from || null,
      available_until: input.available_until || null,
      allow_pause: input.allow_pause ?? false,
      allow_early_close: input.allow_early_close ?? true,
      allow_renewal: input.allow_renewal ?? true,
      active: input.active ?? true,
    })
    .select(`
      *,
      product:products(id, name)
    `)
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/plans");
  revalidatePath("/staff/subscriptions");
  return { data: plan, error: null };
}

// Update an existing plan
export async function updatePlan(id: string, input: Partial<PlanInput>) {
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
    return { error: "Permission denied. Admin or Staff privileges required." };
  }

  const updateFields: any = {};
  if (input.name !== undefined) updateFields.name = input.name.trim();
  if (input.price !== undefined) updateFields.price = Number(input.price);
  if (input.billing_interval !== undefined) updateFields.billing_interval = input.billing_interval;
  if (input.minimum_quantity !== undefined) updateFields.minimum_quantity = Number(input.minimum_quantity);
  if (input.available_from !== undefined) updateFields.available_from = input.available_from || null;
  if (input.available_until !== undefined) updateFields.available_until = input.available_until || null;
  if (input.allow_pause !== undefined) updateFields.allow_pause = input.allow_pause;
  if (input.allow_early_close !== undefined) updateFields.allow_early_close = input.allow_early_close;
  if (input.allow_renewal !== undefined) updateFields.allow_renewal = input.allow_renewal;
  if (input.active !== undefined) updateFields.active = input.active;

  const { data: updated, error } = await supabase
    .from("plans")
    .update(updateFields)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/plans");
  revalidatePath("/staff/subscriptions");
  return { data: updated, error: null };
}
