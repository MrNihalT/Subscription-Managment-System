"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface RecordPaymentInput {
  invoice_id: string;
  method: "bank_transfer" | "credit_card" | "check" | "cash";
  amount: number;
  paid_at?: string;
  note?: string;
}

export interface PaymentFilters {
  customerId?: string;
  page?: number;
  pageSize?: number;
  search?: string;
}

// Fetch recorded payments with pagination, invoice and customer context
export async function getPayments(filters: PaymentFilters | string = {}) {
  const supabase = await createClient();
  const filterObj: PaymentFilters = typeof filters === "string" ? { customerId: filters } : filters;
  const page = filterObj.page || 1;
  const pageSize = filterObj.pageSize || 15;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("payments")
    .select(`
      *,
      invoice:invoices(
        id,
        invoice_number,
        total,
        status,
        customer:customers(id, name, email, auth_user_id)
      )
    `, { count: "exact" })
    .order("paid_at", { ascending: false });

  const { data: payments, error, count } = await query.range(from, to);

  if (error) {
    console.error("Error fetching payments:", error.message);
    return { data: [], totalCount: 0, error: error.message };
  }

  let result = payments || [];
  if (filterObj.customerId) {
    result = result.filter((p: any) => p.invoice?.customer?.id === filterObj.customerId);
  }

  return { data: result, totalCount: count || 0, error: null };
}

// Record manual payment against an invoice (no payment gateway needed)
export async function recordPayment(input: RecordPaymentInput) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Authentication required." };
  }

  if (!input.invoice_id) {
    return { error: "Invoice selection is required." };
  }

  if (Number(input.amount) <= 0) {
    return { error: "Payment amount must be greater than zero." };
  }

  // 1. Fetch current invoice details
  const { data: invoice, error: invErr } = await supabase
    .from("invoices")
    .select("id, invoice_number, total, status")
    .eq("id", input.invoice_id)
    .single();

  if (invErr || !invoice) {
    return { error: "Invoice not found." };
  }

  if (invoice.status === "cancelled") {
    return { error: "Cannot record payments against a cancelled invoice." };
  }

  // 2. Insert payment record
  const paidAt = input.paid_at || new Date().toISOString();
  const { data: payment, error: payErr } = await supabase
    .from("payments")
    .insert({
      invoice_id: invoice.id,
      method: input.method,
      amount: Number(input.amount),
      paid_at: paidAt,
      note: input.note?.trim() || "",
    })
    .select()
    .single();

  if (payErr || !payment) {
    return { error: payErr?.message || "Failed to record payment." };
  }

  // 3. Calculate cumulative payments for this invoice
  const { data: allPayments } = await supabase
    .from("payments")
    .select("amount")
    .eq("invoice_id", invoice.id);

  const totalPaid = (allPayments || []).reduce(
    (sum: number, p: any) => sum + Number(p.amount || 0),
    0
  );

  // 4. Automatically update invoice status to 'paid' when balance is covered
  if (totalPaid >= Number(invoice.total)) {
    await supabase
      .from("invoices")
      .update({ status: "paid" })
      .eq("id", invoice.id);
  } else if (invoice.status === "draft") {
    // If draft received partial payment, advance to confirmed
    await supabase
      .from("invoices")
      .update({ status: "confirmed" })
      .eq("id", invoice.id);
  }

  revalidatePath("/staff/payments");
  revalidatePath("/staff/invoices");
  revalidatePath("/customer/invoices");
  revalidatePath("/");
  return { data: payment, totalPaid, error: null };
}
