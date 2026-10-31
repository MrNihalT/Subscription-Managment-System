"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { InvoiceStatus } from "@/types";
import { evaluateEligibleDiscount, incrementDiscountUses } from "./discounts";

export interface InvoiceFilters {
  status?: string;
  search?: string;
  customerId?: string;
  page?: number;
  pageSize?: number;
}

export interface GenerateInvoiceInput {
  subscription_id: string;
  period_start: string;
  period_end: string;
  due_date?: string;
  initial_status?: "draft" | "confirmed";
}

function generateInvoiceNumber(): string {
  const year = new Date().getFullYear();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `INV-${year}-${randomSuffix}`;
}

// Fetch invoices with pagination, filters, and computed balance
export async function getInvoices(filters: InvoiceFilters = {}) {
  const supabase = await createClient();
  const page = filters.page || 1;
  const pageSize = filters.pageSize || 20;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("invoices")
    .select(`
      *,
      customer:customers(id, name, email),
      subscription:subscriptions(
        id,
        subscription_number,
        plan:plans(id, name, billing_interval)
      ),
      lines:invoice_lines(*),
      payments:payments(id, amount, method, paid_at, note)
    `, { count: "exact" })
    .order("created_at", { ascending: false });

  // If customer querying or specific customer filter
  if (filters.customerId) {
    query = query.eq("customer_id", filters.customerId);
  }

  const today = new Date().toISOString().split("T")[0];

  if (filters.status && filters.status !== "all") {
    if (filters.status === "overdue") {
      query = query
        .in("status", ["draft", "confirmed"])
        .lt("due_date", today);
    } else {
      query = query.eq("status", filters.status);
    }
  }

  const { data: invoices, error, count } = await query.range(from, to);

  if (error) {
    console.error("Error fetching invoices:", error.message);
    return { data: [], totalCount: 0, error: error.message };
  }

  // Enrich with payment totals and balance
  const enriched = (invoices || []).map((inv: any) => {
    const totalPaid = (inv.payments || []).reduce(
      (sum: number, p: any) => sum + Number(p.amount || 0),
      0
    );
    const balanceRemaining = Math.max(0, Number(inv.total) - totalPaid);
    const isOverdue =
      inv.status !== "paid" &&
      inv.status !== "cancelled" &&
      inv.due_date &&
      inv.due_date < today;

    return {
      ...inv,
      totalPaid,
      balanceRemaining,
      isOverdue,
    };
  });

  return { data: enriched, totalCount: count || 0, error: null };
}

// Fetch single invoice with all details
export async function getInvoiceById(id: string) {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];

  const { data: inv, error } = await supabase
    .from("invoices")
    .select(`
      *,
      customer:customers(id, name, email, auth_user_id),
      subscription:subscriptions(
        id,
        subscription_number,
        plan:plans(id, name, billing_interval)
      ),
      lines:invoice_lines(*),
      payments:payments(*)
    `)
    .eq("id", id)
    .single();

  if (error || !inv) {
    return { data: null, error: error?.message || "Invoice not found." };
  }

  const totalPaid = (inv.payments || []).reduce(
    (sum: number, p: any) => sum + Number(p.amount || 0),
    0
  );
  const balanceRemaining = Math.max(0, Number(inv.total) - totalPaid);
  const isOverdue =
    inv.status !== "paid" &&
    inv.status !== "cancelled" &&
    inv.due_date &&
    inv.due_date < today;

  return {
    data: {
      ...inv,
      totalPaid,
      balanceRemaining,
      isOverdue,
    },
    error: null,
  };
}

// Generate Invoice for a single active subscription and billing period
export async function generateInvoiceForSubscription(input: GenerateInvoiceInput) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Authentication required." };
  }

  // 1. Fetch subscription, customer, and lines with product tax rates
  const { data: sub, error: subErr } = await supabase
    .from("subscriptions")
    .select(`
      id,
      subscription_number,
      customer_id,
      status,
      start_date,
      expiry_date,
      plan:plans(id, name, billing_interval),
      lines:subscription_lines(
        id,
        product_id,
        variant_id,
        description,
        quantity,
        unit_price,
        tax_rate,
        product:products(id, name, tax_rate)
      )
    `)
    .eq("id", input.subscription_id)
    .single();

  if (subErr || !sub) {
    return { error: "Subscription not found." };
  }

  if (sub.status !== "active" && sub.status !== "confirmed") {
    return { error: `Cannot invoice subscription with status '${sub.status}'. Must be active or confirmed.` };
  }

  // 2. Compute itemized lines and subtotal
  const subLines = sub.lines || [];
  if (subLines.length === 0) {
    return { error: "Subscription has no product lines to invoice." };
  }

  let subtotal = 0;
  let taxTotal = 0;

  const invoiceLinesToInsert = subLines.map((line: any) => {
    const qty = Number(line.quantity) || 1;
    const unitPrice = Number(line.unit_price) || 0;
    // Prefer product-level configured tax_rate if present, else line tax_rate, else default 10.0
    const taxRate =
      line.product?.tax_rate !== undefined
        ? Number(line.product.tax_rate)
        : Number(line.tax_rate || 10.0);

    const lineSub = qty * unitPrice;
    const lineTax = lineSub * (taxRate / 100);

    subtotal += lineSub;
    taxTotal += lineTax;

    return {
      description: line.description,
      quantity: qty,
      unit_price: unitPrice,
      tax_rate: taxRate,
      line_total: lineSub + lineTax,
    };
  });

  // 3. Automatic Discount Evaluation Engine
  const { discount, discountAmount } = await evaluateEligibleDiscount(subLines, subtotal);

  // Recalculate tax if discount reduces the taxable base, or apply discount against grand total
  const finalDiscount = Math.min(discountAmount, subtotal);
  const grandTotal = Math.max(0, subtotal - finalDiscount + taxTotal);

  // Default due date: Net 15 days from period_end
  const dueDate =
    input.due_date ||
    (() => {
      const d = new Date(input.period_end);
      d.setDate(d.getDate() + 15);
      return d.toISOString().split("T")[0];
    })();

  // 4. Generate unique invoice number and insert (leveraging unique_subscription_period constraint)
  let invNum = generateInvoiceNumber();
  let createdInvoice: any = null;
  let attempts = 0;

  while (!createdInvoice && attempts < 5) {
    attempts++;
    const { data: invData, error: invErr } = await supabase
      .from("invoices")
      .insert({
        invoice_number: invNum,
        subscription_id: sub.id,
        customer_id: sub.customer_id,
        period_start: input.period_start,
        period_end: input.period_end,
        status: input.initial_status || "confirmed",
        subtotal,
        discount_total: finalDiscount,
        tax_total: taxTotal,
        total: grandTotal,
        due_date: dueDate,
      })
      .select()
      .single();

    if (!invErr && invData) {
      createdInvoice = invData;
    } else if (invErr && invErr.code === "23505") {
      // Check if collision is due to duplicate billing constraint or invoice_number
      if (
        invErr.message.includes("unique_subscription_period") ||
        invErr.message.includes("period_start") ||
        invErr.message.includes("invoices_subscription_id")
      ) {
        return {
          error: `Duplicate billing prevented: Subscription ${sub.subscription_number} has already been invoiced for the period ${input.period_start} to ${input.period_end}.`,
        };
      }
      // Regenerate invoice number on number collision
      invNum = generateInvoiceNumber();
    } else {
      return { error: invErr?.message || "Failed to create invoice record." };
    }
  }

  if (!createdInvoice) {
    return { error: "Failed to generate unique invoice record." };
  }

  // 5. Insert invoice lines
  const linesWithInvoiceId = invoiceLinesToInsert.map((l) => ({
    ...l,
    invoice_id: createdInvoice.id,
  }));

  const { error: lineInsertErr } = await supabase
    .from("invoice_lines")
    .insert(linesWithInvoiceId);

  if (lineInsertErr) {
    console.error("Error inserting invoice lines:", lineInsertErr.message);
    // Atomic rollback
    await supabase.from("invoices").delete().eq("id", createdInvoice.id);
    return { error: `Failed to save invoice lines: ${lineInsertErr.message}` };
  }

  // 6. Record discount usage if applied
  if (discount) {
    await incrementDiscountUses(discount.id);
  }

  revalidatePath("/staff/invoices");
  revalidatePath("/customer/invoices");
  revalidatePath("/");
  return { data: createdInvoice, error: null };
}

// Generate batch billing invoices for ALL active subscriptions for a given period
// Paginates through active subscriptions in batches of 500 so it scales beyond Supabase's default 1,000 row limit
export async function generateBatchBillingInvoices(
  period_start: string,
  period_end: string,
  due_date?: string
) {
  const supabase = await createClient();

  const PAGE_SIZE = 500;
  let pageIndex = 0;
  let hasMore = true;
  const activeSubs: { id: string; subscription_number: string }[] = [];

  while (hasMore) {
    const from = pageIndex * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data, error } = await supabase
      .from("subscriptions")
      .select("id, subscription_number")
      .eq("status", "active")
      .order("id", { ascending: true })
      .range(from, to);

    if (error) {
      console.error(`Error fetching active subscriptions page ${pageIndex + 1}:`, error.message);
      return {
        createdCount: 0,
        skippedCount: 0,
        error: `Failed to fetch active subscriptions: ${error.message}`,
      };
    }

    if (data && data.length > 0) {
      activeSubs.push(...data);
      if (data.length < PAGE_SIZE) {
        hasMore = false;
      } else {
        pageIndex++;
      }
    } else {
      hasMore = false;
    }
  }

  if (activeSubs.length === 0) {
    return { createdCount: 0, skippedCount: 0, error: "No active subscriptions found." };
  }

  let createdCount = 0;
  let skippedCount = 0;
  const errors: string[] = [];

  for (const sub of activeSubs) {
    const res = await generateInvoiceForSubscription({
      subscription_id: sub.id,
      period_start,
      period_end,
      due_date,
      initial_status: "confirmed",
    });

    if (res.data) {
      createdCount++;
    } else if (res.error && res.error.includes("Duplicate billing prevented")) {
      skippedCount++;
    } else if (res.error) {
      errors.push(`${sub.subscription_number}: ${res.error}`);
    }
  }

  revalidatePath("/staff/invoices");
  revalidatePath("/customer/invoices");
  revalidatePath("/");
  return { createdCount, skippedCount, errors, error: null };
}

// Update invoice status (e.g. staff confirms draft, or cancels invoice)
export async function updateInvoiceStatus(id: string, newStatus: InvoiceStatus) {
  const supabase = await createClient();

  const { data: updated, error } = await supabase
    .from("invoices")
    .update({ status: newStatus })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/staff/invoices");
  revalidatePath("/customer/invoices");
  revalidatePath("/");
  return { data: updated, error: null };
}
