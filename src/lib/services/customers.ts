"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface CustomerInput {
  name: string;
  email: string;
  auth_user_id?: string;
}

export async function getCustomers() {
  const supabase = await createClient();

  const { data: customers, error } = await supabase
    .from("customers")
    .select(`
      *,
      subscriptions(id, status)
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching customers:", error.message);
    return { data: [], error: error.message };
  }

  return { data: customers, error: null };
}

export async function createCustomer(input: CustomerInput) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Authentication required." };
  }

  const { data: customer, error } = await supabase
    .from("customers")
    .insert({
      name: input.name.trim(),
      email: input.email.trim().toLowerCase(),
      auth_user_id: input.auth_user_id || null,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/staff/customers");
  revalidatePath("/staff/subscriptions");
  return { data: customer, error: null };
}
