"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRole } from "@/context/RoleContext";
import {
  TrendingUp,
  CreditCard,
  Layers,
  Users,
  ArrowUpRight,
  Plus,
  FileText,
  AlertTriangle,
  Building2,
  Calendar,
  CheckCircle,
  Clock,
  Gauge,
  Sparkles,
  RefreshCw,
  DollarSign,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/Table";
import { Alert } from "@/components/ui/Alert";
import {
  getFinanceDashboardData,
  seedPerformanceDataset,
  FinanceSummary,
} from "@/lib/services/dashboard";

export default function DashboardPage() {
  const { user, profile } = useAuth();
  const { role: previewRole, mockUser } = useRole();

  // Resolved role: prefer real database profile role, fall back to preview role
  const activeRole = profile?.role || (user ? "customer" : previewRole);

  const [summary, setSummary] = useState<FinanceSummary>({
    activeSubscriptionsCount: 0,
    totalSubscriptionsCount: 0,
    totalRevenueCollected: 0,
    outstandingBalance: 0,
    outstandingInvoicesCount: 0,
    overdueInvoicesCount: 0,
    overdueInvoicesAmount: 0,
    recentInvoices: [],
    measuredLatencyMs: 0,
  });

  const [loading, setLoading] = useState(true);
  const [seedingLoading, setSeedingLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    const res = await getFinanceDashboardData();
    if (res.data) {
      setSummary(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const handleSeedScale = async () => {
    setSeedingLoading(true);
    setActionMessage("Generating benchmark subscriptions into Supabase...");
    try {
      const res = await seedPerformanceDataset(2000);
      if (res.message) {
        setActionMessage(res.message);
      }
      await fetchDashboardData();
    } catch (err: any) {
      setActionMessage(err.message || "Failed to seed benchmark data.");
    } finally {
      setSeedingLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-zinc-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-zinc-900">
              {activeRole === "admin"
                ? "Executive Administration & Finance Dashboard"
                : activeRole === "staff"
                ? "Billing Operations & Finance Summary"
                : "Customer Account Center"}
            </h1>
            <Badge
              variant={
                activeRole === "admin"
                  ? "danger"
                  : activeRole === "staff"
                  ? "accent"
                  : "success"
              }
            >
              {activeRole.toUpperCase()}
            </Badge>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            {user ? (
              <>
                Signed in as <span className="font-semibold text-zinc-800">{user.email}</span> (Trusted Role: {activeRole})
              </>
            ) : (
              <>
                Preview session as <span className="font-semibold text-zinc-800">{mockUser.name}</span> ({mockUser.email})
              </>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeRole === "admin" && (
            <Link href="/admin/products">
              <Button size="sm" variant="outline">
                <Plus className="h-3.5 w-3.5" />
                Catalog &amp; Plans
              </Button>
            </Link>
          )}
          {activeRole !== "customer" && (
            <Link href="/staff/invoices">
              <Button size="sm">
                <CreditCard className="h-3.5 w-3.5" />
                Run Billing
              </Button>
            </Link>
          )}
          {activeRole === "customer" && (
            <Link href="/customer/invoices">
              <Button size="sm">
                View My Invoices
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Performance & Benchmark Bar */}
      <Card className="p-4 bg-zinc-900 text-white border-zinc-800">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Gauge className="h-4 w-4 text-teal-400" />
              <h3 className="text-sm font-semibold tracking-tight text-white">
                Dashboard Performance &amp; Scalability Measurement
              </h3>
              <Badge variant="accent" className="bg-teal-950 text-teal-300 border-teal-800 font-mono">
                {summary.measuredLatencyMs} ms
              </Badge>
            </div>
            <p className="text-xs text-zinc-400">
              Measured server-side execution time of the actual finance dashboard query over{" "}
              <span className="font-semibold text-zinc-200">{summary.totalSubscriptionsCount.toLocaleString()}</span> subscriptions.
              Target response is &lt; 2,000 ms.
            </p>
            {actionMessage && (
              <p className="text-xs text-teal-300 font-mono mt-1">
                {actionMessage}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Button
              size="sm"
              variant="outline"
              onClick={fetchDashboardData}
              disabled={loading || seedingLoading}
              className="text-xs bg-zinc-800 border-zinc-700 text-zinc-200 hover:bg-zinc-700 hover:text-white"
            >
              <RefreshCw className={`h-3.5 w-3.5 mr-1 ${loading ? "animate-spin" : ""}`} />
              Re-measure
            </Button>
            {/* Seeder clearly restricted strictly to Admin */}
            {activeRole === "admin" && (
              <Button
                size="sm"
                onClick={handleSeedScale}
                disabled={loading || seedingLoading}
                className="text-xs bg-teal-600 hover:bg-teal-500 text-white"
              >
                <Sparkles className="h-3.5 w-3.5 mr-1" />
                {seedingLoading ? "Seeding..." : "Seed 2,000 Scale Dataset"}
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Subscriptions */}
        <Card>
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-zinc-500">Active Subscriptions</p>
            <Layers className="h-4 w-4 text-teal-700" />
          </div>
          <p className="mt-2 text-2xl font-bold font-mono text-zinc-900 tracking-tight">
            {summary.activeSubscriptionsCount.toLocaleString()}
          </p>
          <p className="mt-1 text-[11px] text-zinc-500">
            Out of {summary.totalSubscriptionsCount.toLocaleString()} total subscriptions on file
          </p>
        </Card>

        {/* Collected Revenue */}
        <Card>
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-zinc-500">Total Collected Revenue</p>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-2 text-2xl font-bold font-mono text-zinc-900 tracking-tight">
            ${summary.totalRevenueCollected.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
          <p className="mt-1 text-[11px] text-emerald-700 font-medium">
            Settled via verified manual payments
          </p>
        </Card>

        {/* Outstanding Invoices */}
        <Card>
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-zinc-500">Outstanding Balance</p>
            <Clock className="h-4 w-4 text-amber-600" />
          </div>
          <p className="mt-2 text-2xl font-bold font-mono text-zinc-900 tracking-tight">
            ${summary.outstandingBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
          <p className="mt-1 text-[11px] text-zinc-500">
            Across {summary.outstandingInvoicesCount} open billing statements
          </p>
        </Card>

        {/* Overdue Invoices */}
        <Card>
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-zinc-500">Overdue Invoices</p>
            <AlertTriangle className="h-4 w-4 text-rose-600" />
          </div>
          <p className="mt-2 text-2xl font-bold font-mono text-rose-700 tracking-tight">
            ${summary.overdueInvoicesAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
          <p className="mt-1 text-[11px] text-rose-600 font-medium">
            {summary.overdueInvoicesCount} invoices past payment due date
          </p>
        </Card>
      </div>

      {/* Quick Navigation & Recent Invoices */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent Invoices Table (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-0 overflow-hidden">
            <div className="p-4 border-b border-zinc-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-zinc-900">
                  Recent Invoices &amp; Statements
                </h3>
                <p className="text-xs text-zinc-500">
                  Real-time billing run and payment status
                </p>
              </div>
              <Link href={activeRole === "customer" ? "/customer/invoices" : "/staff/invoices"}>
                <Button size="sm" variant="outline" className="text-xs">
                  All Invoices <ArrowUpRight className="h-3 w-3 ml-1" />
                </Button>
              </Link>
            </div>

            {summary.recentInvoices.length === 0 ? (
              <div className="p-8 text-center text-xs text-zinc-400">
                No invoices recorded yet. Run a billing cycle from the Staff Operations workspace.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {summary.recentInvoices.map((inv) => (
                    <TableRow key={inv.id}>
                      <TableCell className="font-mono text-xs font-semibold text-zinc-900">
                        {inv.invoice_number}
                      </TableCell>
                      <TableCell className="text-xs font-medium text-zinc-800">
                        {inv.customer?.name || "Client"}
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs font-semibold text-zinc-900">
                        ${Number(inv.total).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-xs font-mono text-zinc-500">
                        {inv.due_date || "—"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            inv.status === "paid"
                              ? "success"
                              : inv.status === "confirmed"
                              ? "accent"
                              : "neutral"
                          }
                        >
                          {inv.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>
        </div>

        {/* Right Column: Role Navigation Shortcuts */}
        <div className="space-y-4">
          <Card className="p-4 space-y-3">
            <h3 className="text-xs font-semibold text-zinc-800 uppercase tracking-wider">
              Role Workspaces &amp; Quick Links
            </h3>

            <div className="space-y-2">
              <Link
                href="/staff/subscriptions"
                className="flex items-center justify-between p-2.5 rounded border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Layers className="h-4 w-4 text-zinc-600" />
                  <div>
                    <p className="text-xs font-medium text-zinc-900">Quotes &amp; Subscriptions</p>
                    <p className="text-[11px] text-zinc-400">Create quotes &amp; advance lifecycles</p>
                  </div>
                </div>
                <ArrowUpRight className="h-3.5 w-3.5 text-zinc-400" />
              </Link>

              <Link
                href="/staff/invoices"
                className="flex items-center justify-between p-2.5 rounded border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <CreditCard className="h-4 w-4 text-zinc-600" />
                  <div>
                    <p className="text-xs font-medium text-zinc-900">Billing Runs &amp; Invoices</p>
                    <p className="text-[11px] text-zinc-400">Generate period invoices with discounts</p>
                  </div>
                </div>
                <ArrowUpRight className="h-3.5 w-3.5 text-zinc-400" />
              </Link>

              <Link
                href="/staff/payments"
                className="flex items-center justify-between p-2.5 rounded border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <DollarSign className="h-4 w-4 text-zinc-600" />
                  <div>
                    <p className="text-xs font-medium text-zinc-900">Manual Payment Ledger</p>
                    <p className="text-[11px] text-zinc-400">Record settlements &amp; reconcile balances</p>
                  </div>
                </div>
                <ArrowUpRight className="h-3.5 w-3.5 text-zinc-400" />
              </Link>

              {activeRole === "admin" && (
                <>
                  <Link
                    href="/admin/discounts"
                    className="flex items-center justify-between p-2.5 rounded border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <TrendingUp className="h-4 w-4 text-zinc-600" />
                      <div>
                        <p className="text-xs font-medium text-zinc-900">Discounts &amp; Promos</p>
                        <p className="text-[11px] text-zinc-400">Manage promotional rules and caps</p>
                      </div>
                    </div>
                    <ArrowUpRight className="h-3.5 w-3.5 text-zinc-400" />
                  </Link>

                  <Link
                    href="/admin/staff"
                    className="flex items-center justify-between p-2.5 rounded border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Users className="h-4 w-4 text-zinc-600" />
                      <div>
                        <p className="text-xs font-medium text-zinc-900">Staff Account Management</p>
                        <p className="text-[11px] text-zinc-400">Invite billing specialists &amp; operators</p>
                      </div>
                    </div>
                    <ArrowUpRight className="h-3.5 w-3.5 text-zinc-400" />
                  </Link>
                </>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
