"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface ProductVariantInput {
  id?: string;
  name: string;
  price_adjustment: number;
}

export interface ProductInput {
  name: string;
  product_type: "subscription" | "one_time" | "addon";
  sales_price: number;
  cost_price: number;
  tax_rate?: number;
  notes?: string;
  active?: boolean;
  variants?: ProductVariantInput[];
}

// Fetch all products with their variants
export async function getProducts() {
  const supabase = await createClient();

  const { data: products, error } = await supabase
    .from("products")
    .select(`
      *,
      variants:product_variants(*)
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching products:", error.message);
    return { data: [], error: error.message };
  }

  return { data: products, error: null };
}

// Create a new product and optional variants
export async function createProduct(input: ProductInput) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Authentication required." };
  }

  // Verify admin role (Admin-only per problem statement)
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    return { error: "Permission denied. Admin privileges required to create products." };
  }

  // 1. Insert product
  const { data: product, error: prodErr } = await supabase
    .from("products")
    .insert({
      name: input.name.trim(),
      product_type: input.product_type,
      sales_price: Number(input.sales_price),
      cost_price: Number(input.cost_price),
      tax_rate: input.tax_rate !== undefined ? Number(input.tax_rate) : 10.0,
      notes: input.notes?.trim() || "",
      active: input.active !== undefined ? input.active : true,
    })
    .select()
    .single();

  if (prodErr || !product) {
    return { error: prodErr?.message || "Failed to create product." };
  }

  // 2. Insert variants if any
  if (input.variants && input.variants.length > 0) {
    const variantsToInsert = input.variants
      .filter((v) => v.name.trim())
      .map((v) => ({
        product_id: product.id,
        name: v.name.trim(),
        price_adjustment: Number(v.price_adjustment) || 0,
      }));

    if (variantsToInsert.length > 0) {
      const { error: varErr } = await supabase
        .from("product_variants")
        .insert(variantsToInsert);

      if (varErr) {
        console.error("Error inserting variants:", varErr.message);
      }
    }
  }

  revalidatePath("/admin/products");
  revalidatePath("/admin/plans");
  revalidatePath("/staff/subscriptions");
  return { data: product, error: null };
}

// Update product and variants
export async function updateProduct(id: string, input: Partial<ProductInput>) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Authentication required." };
  }

  // Verify admin role (Admin-only per problem statement)
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    return { error: "Permission denied. Admin privileges required to update products." };
  }

  const updateFields: any = {};
  if (input.name !== undefined) updateFields.name = input.name.trim();
  if (input.product_type !== undefined) updateFields.product_type = input.product_type;
  if (input.sales_price !== undefined) updateFields.sales_price = Number(input.sales_price);
  if (input.cost_price !== undefined) updateFields.cost_price = Number(input.cost_price);
  if (input.tax_rate !== undefined) updateFields.tax_rate = Number(input.tax_rate);
  if (input.notes !== undefined) updateFields.notes = input.notes.trim();
  if (input.active !== undefined) updateFields.active = input.active;

  const { data: updated, error } = await supabase
    .from("products")
    .update(updateFields)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  // Handle variants replacement/sync if provided
  if (input.variants) {
    // Delete existing variants
    await supabase.from("product_variants").delete().eq("product_id", id);

    // Insert updated list
    const validVariants = input.variants
      .filter((v) => v.name.trim())
      .map((v) => ({
        product_id: id,
        name: v.name.trim(),
        price_adjustment: Number(v.price_adjustment) || 0,
      }));

    if (validVariants.length > 0) {
      await supabase.from("product_variants").insert(validVariants);
    }
  }

  revalidatePath("/admin/products");
  revalidatePath("/admin/plans");
  revalidatePath("/staff/subscriptions");
  return { data: updated, error: null };
}

// Seed initial sample products and plans for demo testing
export async function seedCatalogDemoData() {
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
    return { error: "Permission denied. Admin privileges required to seed catalog." };
  }

  const { data: existing } = await supabase.from("products").select("id").limit(1);
  if (existing && existing.length > 0) {
    return { message: "Catalog already has products." };
  }

  // Sample Product 1
  const { data: p1 } = await supabase
    .from("products")
    .insert({
      name: "Enterprise Dedicated Server",
      product_type: "subscription",
      sales_price: 450.0,
      cost_price: 210.0,
      notes: "Dedicated compute node with SLA support.",
      active: true,
    })
    .select()
    .single();

  if (p1) {
    await supabase.from("product_variants").insert([
      { product_id: p1.id, name: "64GB High-Memory RAM", price_adjustment: 80.0 },
      { product_id: p1.id, name: "128GB High-Memory RAM", price_adjustment: 160.0 },
      { product_id: p1.id, name: "Redundant 10Gbps Uplink", price_adjustment: 95.0 },
    ]);

    await supabase.from("plans").insert([
      {
        product_id: p1.id,
        name: "Enterprise Dedicated — Monthly",
        price: 450.0,
        billing_interval: "monthly",
        minimum_quantity: 1,
        allow_pause: true,
        allow_early_close: true,
        allow_renewal: true,
        active: true,
      },
      {
        product_id: p1.id,
        name: "Enterprise Dedicated — Annual Contract",
        price: 4800.0,
        billing_interval: "yearly",
        minimum_quantity: 1,
        allow_pause: false,
        allow_early_close: false,
        allow_renewal: true,
        active: true,
      },
    ]);
  }

  // Sample Product 2
  const { data: p2 } = await supabase
    .from("products")
    .insert({
      name: "Business Cloud Storage",
      product_type: "subscription",
      sales_price: 89.0,
      cost_price: 32.0,
      notes: "Encrypted distributed object storage.",
      active: true,
    })
    .select()
    .single();

  if (p2) {
    await supabase.from("product_variants").insert([
      { product_id: p2.id, name: "Multi-Region Replication", price_adjustment: 45.0 },
      { product_id: p2.id, name: "Cold Archive Tier", price_adjustment: -20.0 },
    ]);

    await supabase.from("plans").insert([
      {
        product_id: p2.id,
        name: "Business Cloud Storage — Monthly Base",
        price: 89.0,
        billing_interval: "monthly",
        minimum_quantity: 1,
        allow_pause: true,
        allow_early_close: true,
        allow_renewal: true,
        active: true,
      },
      {
        product_id: p2.id,
        name: "Cloud Storage — Weekly Sync Tier",
        price: 25.0,
        billing_interval: "weekly",
        minimum_quantity: 2,
        allow_pause: true,
        allow_early_close: true,
        allow_renewal: true,
        active: true,
      },
    ]);
  }

  // Sample Product 3
  const { data: p3 } = await supabase
    .from("products")
    .insert({
      name: "Priority SLA Support Package",
      product_type: "subscription",
      sales_price: 199.0,
      cost_price: 75.0,
      notes: "24/7 15-minute response SLA escalation team.",
      active: true,
    })
    .select()
    .single();

  if (p3) {
    await supabase.from("plans").insert([
      {
        product_id: p3.id,
        name: "Priority Support — Monthly SLA",
        price: 199.0,
        billing_interval: "monthly",
        minimum_quantity: 1,
        allow_pause: true,
        allow_early_close: true,
        allow_renewal: true,
        active: true,
      },
    ]);
  }

  revalidatePath("/admin/products");
  revalidatePath("/admin/plans");
  revalidatePath("/staff/subscriptions");
  return { success: true };
}
