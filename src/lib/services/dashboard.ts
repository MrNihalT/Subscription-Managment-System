"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface FinanceSummary {
  activeSubscriptionsCount: number;
  totalSubscriptionsCount: number;
  totalRevenueCollected: number;
  outstandingBalance: number;
  outstandingInvoicesCount: number;
  overdueInvoicesCount: number;
  overdueInvoicesAmount: number;
  recentInvoices: any[];
  measuredLatencyMs: number;
}

// Fetch fast database-side finance summaries with measured latency
export async function getFinanceDashboardData(): Promise<{
  data: FinanceSummary;
  error: string | null;
}> {
  const startTime = performance.now();
  const supabase = await createClient();

  try {
    // 1. Calculate revenue, outstanding balances, and overdue totals directly in PostgreSQL via RPC
    const [rpcRes, recentInvoicesRes] = await Promise.all([
      supabase.rpc("get_finance_summary"),
      supabase
        .from("invoices")
        .select(`
          id,
          invoice_number,
          period_start,
          period_end,
          total,
          status,
          due_date,
          customer:customers(name),
          payments(amount)
        `)
        .order("created_at", { ascending: false })
        .limit(10),
    ]);

    const endTime = performance.now();
    const measuredLatencyMs = Math.round((endTime - startTime) * 10) / 10;

    if (!rpcRes.error && rpcRes.data) {
      const summaryData = rpcRes.data as any;
      return {
        data: {
          activeSubscriptionsCount: Number(summaryData.active_subscriptions_count || 0),
          totalSubscriptionsCount: Number(summaryData.total_subscriptions_count || 0),
          totalRevenueCollected: Number(summaryData.total_revenue_collected || 0),
          outstandingBalance: Number(summaryData.outstanding_balance || 0),
          outstandingInvoicesCount: Number(summaryData.outstanding_invoices_count || 0),
          overdueInvoicesCount: Number(summaryData.overdue_invoices_count || 0),
          overdueInvoicesAmount: Number(summaryData.overdue_invoices_amount || 0),
          recentInvoices: recentInvoicesRes.data || [],
          measuredLatencyMs,
        },
        error: null,
      };
    }

    // Fallback if get_finance_summary RPC has not yet been applied in Supabase SQL editor
    console.warn("get_finance_summary RPC unavailable, falling back to aggregate queries:", rpcRes.error?.message);

    const today = new Date().toISOString().split("T")[0];
    const [activeSubsRes, totalSubsRes, paymentsRes, invoicesRes, overdueInvoicesRes] = await Promise.all([
      supabase.from("subscriptions").select("id", { count: "exact", head: true }).eq("status", "active"),
      supabase.from("subscriptions").select("id", { count: "exact", head: true }),
      supabase.from("payments").select("amount"),
      supabase.from("invoices").select("id, total, status, payments(amount)").in("status", ["confirmed", "draft"]),
      supabase.from("invoices").select("id, total, due_date").in("status", ["draft", "confirmed"]).lt("due_date", today),
    ]);

    const totalRevenue = (paymentsRes.data || []).reduce((sum, p) => sum + Number(p.amount || 0), 0);
    let outstanding = 0;
    let outstandingCount = 0;
    (invoicesRes.data || []).forEach((inv: any) => {
      const invTotal = Number(inv.total || 0);
      const paid = (inv.payments || []).reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0);
      const rem = Math.max(0, invTotal - paid);
      if (rem > 0) {
        outstanding += rem;
        outstandingCount++;
      }
    });

    const overdueAmount = (overdueInvoicesRes.data || []).reduce((sum, inv) => sum + Number(inv.total || 0), 0);

    return {
      data: {
        activeSubscriptionsCount: activeSubsRes.count || 0,
        totalSubscriptionsCount: totalSubsRes.count || 0,
        totalRevenueCollected: Math.round(totalRevenue * 100) / 100,
        outstandingBalance: Math.round(outstanding * 100) / 100,
        outstandingInvoicesCount: outstandingCount,
        overdueInvoicesCount: overdueInvoicesRes.data?.length || 0,
        overdueInvoicesAmount: Math.round(overdueAmount * 100) / 100,
        recentInvoices: recentInvoicesRes.data || [],
        measuredLatencyMs,
      },
      error: rpcRes.error ? "Database RPC get_finance_summary() migration pending in Supabase." : null,
    };
  } catch (err: any) {
    console.error("Error calculating finance dashboard summary:", err);
    const endTime = performance.now();
    return {
      data: {
        activeSubscriptionsCount: 0,
        totalSubscriptionsCount: 0,
        totalRevenueCollected: 0,
        outstandingBalance: 0,
        outstandingInvoicesCount: 0,
        overdueInvoicesCount: 0,
        overdueInvoicesAmount: 0,
        recentInvoices: [],
        measuredLatencyMs: Math.round((endTime - startTime) * 10) / 10,
      },
      error: err.message,
    };
  }
}

// Seed performance demo dataset (up to 2,000 subscriptions) for the brief's scale requirement
export async function seedPerformanceDataset(countToSeed: number = 2000) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Authentication required." };
  }

  // Strictly verify Admin role from trusted profiles record
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    return { error: "Unauthorized. Benchmark seeder is strictly limited to Admin accounts." };
  }

  // 1. Check existing benchmark subscriptions
  const { count } = await supabase
    .from("subscriptions")
    .select("id", { count: "exact", head: true })
    .like("subscription_number", "PERF-%");

  if (count && count >= countToSeed) {
    return {
      message: `Performance dataset already contains ${count} benchmark subscriptions.`,
      count,
    };
  }

  // 2. Fetch or create benchmark customer & plan
  let { data: benchmarkCustomer } = await supabase
    .from("customers")
    .select("id")
    .eq("email", "benchmark.client@demo.local")
    .single();

  if (!benchmarkCustomer) {
    const { data: newCust } = await supabase
      .from("customers")
      .insert({
        name: "Enterprise Benchmark Cohort",
        email: "benchmark.client@demo.local",
      })
      .select("id")
      .single();
    benchmarkCustomer = newCust;
  }

  if (!benchmarkCustomer) {
    return { error: "Could not initialize benchmark customer." };
  }

  // Fetch an active plan
  const { data: plans } = await supabase
    .from("plans")
    .select("id, product_id, price")
    .eq("active", true)
    .limit(1);

  if (!plans || plans.length === 0) {
    return { error: "Please seed or create at least one product & plan before seeding benchmark subscriptions." };
  }

  const planId = plans[0].id;
  const productId = plans[0].product_id;

  // 3. Generate benchmark subscriptions in batches of 400
  const remaining = countToSeed - (count || 0);
  const batchSize = 400;
  const batches = Math.ceil(remaining / batchSize);
  let totalInserted = 0;

  const statuses: ("active" | "draft" | "quotation" | "confirmed" | "paused")[] = [
    "active",
    "active",
    "active",
    "confirmed",
    "paused",
    "draft",
  ];

  for (let b = 0; b < batches; b++) {
    const thisBatchSize = Math.min(batchSize, remaining - totalInserted);
    const subsToInsert = [];

    const baseOffset = (count || 0) + totalInserted + 1;

    for (let i = 0; i < thisBatchSize; i++) {
      const idx = baseOffset + i;
      const status = statuses[idx % statuses.length];
      const startDay = (idx % 28) + 1;
      const startDate = `2026-09-${String(startDay).padStart(2, "0")}`;

      subsToInsert.push({
        subscription_number: `PERF-2026-${String(idx).padStart(6, "0")}`,
        customer_id: benchmarkCustomer.id,
        plan_id: planId,
        status,
        start_date: startDate,
        payment_terms: "Net 30",
      });
    }

    const { data: insertedSubs, error: subErr } = await supabase
      .from("subscriptions")
      .insert(subsToInsert)
      .select("id");

    if (subErr) {
      console.error("Error inserting subscription batch:", subErr.message);
      break;
    }

    if (insertedSubs && insertedSubs.length > 0) {
      // Bulk insert 1 line item per subscription
      const linesToInsert = insertedSubs.map((s) => ({
        subscription_id: s.id,
        product_id: productId,
        description: "Standard Scale Node License",
        quantity: 1,
        unit_price: Number(plans[0].price || 250),
        tax_rate: 10.0,
      }));

      await supabase.from("subscription_lines").insert(linesToInsert);
      totalInserted += insertedSubs.length;
    }
  }

  revalidatePath("/");
  revalidatePath("/staff/subscriptions");
  return {
    message: `Successfully generated ${totalInserted} benchmark subscriptions into the database. Total scale dataset: ${(count || 0) + totalInserted}.`,
    totalScale: (count || 0) + totalInserted,
  };
}

// Clean up benchmark dataset if needed
export async function clearPerformanceDataset() {
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
    return { error: "Unauthorized. Benchmark cleanup is strictly limited to Admin accounts." };
  }

  const { error } = await supabase
    .from("subscriptions")
    .delete()
    .like("subscription_number", "PERF-%");

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/");
  revalidatePath("/staff/subscriptions");
  return { message: "Performance dataset successfully purged." };
}
