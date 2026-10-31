"use client";

import React from "react";
import Link from "next/link";
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
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
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

export default function DashboardPage() {
  const { role, mockUser, isAuthenticated } = useRole();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-zinc-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-zinc-900">
              {role === "admin"
                ? "Executive Administration"
                : role === "staff"
                ? "Billing Operations Workspace"
                : "Customer Account Center"}
            </h1>
            <Badge
              variant={
                role === "admin"
                  ? "danger"
                  : role === "staff"
                  ? "accent"
                  : "success"
              }
            >
              {role.toUpperCase()}
            </Badge>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Logged in as <span className="font-medium text-zinc-700">{mockUser.name}</span> ({mockUser.email})
          </p>
        </div>

        <div className="flex items-center gap-2">
          {role === "admin" && (
            <Link href="/admin/products">
              <Button size="sm" variant="outline">
                <Plus className="h-3.5 w-3.5" />
                Configure Products
              </Button>
            </Link>
          )}
          {role === "staff" && (
            <Link href="/staff/subscriptions">
              <Button size="sm">
                <Plus className="h-3.5 w-3.5" />
                New Quote / Subscription
              </Button>
            </Link>
          )}
          {role === "customer" && (
            <Link href="/customer/subscriptions">
              <Button size="sm">
                View My Subscriptions
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Notice Banner */}
      {!isAuthenticated ? (
        <Alert variant="warning" title="Unauthenticated Preview Mode">
          You are currently previewing role destinations without an active session. <Link href="/auth/login" className="underline font-semibold text-zinc-900">Sign in</Link> or <Link href="/auth/signup" className="underline font-semibold text-zinc-900">register an account</Link> to test live Supabase authentication, database triggers, and RLS policies.
        </Alert>
      ) : (
        <Alert variant="info" title="Phase 3 Authenticated Session Active">
          Your role is loaded securely from the trusted database <code className="bg-white/80 px-1 py-0.5 rounded border border-zinc-200">public.profiles</code> record. Row Level Security enforces data access according to your authenticated profile.
        </Alert>
      )}

      {/* KPI Stats Grid */}
      {role === "admin" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-zinc-500">Active Subscriptions</p>
              <Layers className="h-4 w-4 text-zinc-400" />
            </div>
            <p className="mt-2 text-2xl font-semibold text-zinc-900 tracking-tight">
              1,248
            </p>
            <p className="mt-1 text-[11px] text-emerald-700 font-medium flex items-center gap-1">
              <ArrowUpRight className="h-3 w-3" />
              +12.4% from last period
            </p>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-zinc-500">Monthly Recurring (MRR)</p>
              <TrendingUp className="h-4 w-4 text-zinc-400" />
            </div>
            <p className="mt-2 text-2xl font-semibold text-zinc-900 tracking-tight font-mono">
              $48,920.00
            </p>
            <p className="mt-1 text-[11px] text-zinc-500">
              Avg revenue per sub: $39.20
            </p>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-zinc-500">Active Plans</p>
              <CreditCard className="h-4 w-4 text-zinc-400" />
            </div>
            <p className="mt-2 text-2xl font-semibold text-zinc-900 tracking-tight">
              8
            </p>
            <p className="mt-1 text-[11px] text-zinc-500">
              Across 4 core products
            </p>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-zinc-500">Authorized Staff</p>
              <Users className="h-4 w-4 text-zinc-400" />
            </div>
            <p className="mt-2 text-2xl font-semibold text-zinc-900 tracking-tight">
              5
            </p>
            <p className="mt-1 text-[11px] text-zinc-500">
              Admin-controlled access
            </p>
          </Card>
        </div>
      )}

      {role === "staff" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-zinc-500">Open Quotations</p>
              <FileText className="h-4 w-4 text-amber-500" />
            </div>
            <p className="mt-2 text-2xl font-semibold text-zinc-900 tracking-tight">
              14
            </p>
            <p className="mt-1 text-[11px] text-zinc-500">
              Awaiting customer confirmation
            </p>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-zinc-500">Unbilled Active Runs</p>
              <Calendar className="h-4 w-4 text-zinc-400" />
            </div>
            <p className="mt-2 text-2xl font-semibold text-zinc-900 tracking-tight">
              26
            </p>
            <p className="mt-1 text-[11px] text-zinc-500">
              Billing period cycle closing today
            </p>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-zinc-500">Unpaid Invoices</p>
              <CreditCard className="h-4 w-4 text-rose-500" />
            </div>
            <p className="mt-2 text-2xl font-semibold text-zinc-900 tracking-tight font-mono">
              $9,410.00
            </p>
            <p className="mt-1 text-[11px] text-rose-700 font-medium">
              4 overdue by &gt; 15 days
            </p>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-zinc-500">Managed Customers</p>
              <Building2 className="h-4 w-4 text-zinc-400" />
            </div>
            <p className="mt-2 text-2xl font-semibold text-zinc-900 tracking-tight">
              430
            </p>
            <p className="mt-1 text-[11px] text-zinc-500">
              Active client billing accounts
            </p>
          </Card>
        </div>
      )}

      {role === "customer" && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-zinc-500">My Subscriptions</p>
              <Layers className="h-4 w-4 text-teal-700" />
            </div>
            <p className="mt-2 text-2xl font-semibold text-zinc-900 tracking-tight">
              2 Active
            </p>
            <p className="mt-1 text-[11px] text-emerald-700 font-medium">
              Enterprise Cloud &amp; Support Tier
            </p>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-zinc-500">Next Renewal Date</p>
              <Calendar className="h-4 w-4 text-zinc-400" />
            </div>
            <p className="mt-2 text-2xl font-semibold text-zinc-900 tracking-tight font-mono">
              Nov 15, 2026
            </p>
            <p className="mt-1 text-[11px] text-zinc-500">
              Auto-renewal enabled
            </p>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-zinc-500">Outstanding Balance</p>
              <CreditCard className="h-4 w-4 text-zinc-400" />
            </div>
            <p className="mt-2 text-2xl font-semibold text-zinc-900 tracking-tight font-mono">
              $0.00
            </p>
            <p className="mt-1 text-[11px] text-emerald-700 font-medium">
              All invoices paid
            </p>
          </Card>
        </div>
      )}

      {/* Main Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Primary Table / Stream */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-0 overflow-hidden">
            <div className="p-4 border-b border-zinc-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-zinc-900">
                  {role === "customer"
                    ? "My Recent Billing Activity"
                    : "Recent Subscription Lifecycle Events"}
                </h3>
                <p className="text-xs text-zinc-500">
                  High-density tabular data format aligned with plan requirements
                </p>
              </div>
              <Link
                href={
                  role === "admin"
                    ? "/admin/products"
                    : role === "staff"
                    ? "/staff/subscriptions"
                    : "/customer/subscriptions"
                }
                className="text-xs text-teal-700 font-medium hover:underline flex items-center gap-1"
              >
                View all <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Number</TableHead>
                  <TableHead>
                    {role === "customer" ? "Plan / Service" : "Customer / Plan"}
                  </TableHead>
                  <TableHead>Interval</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-mono text-xs font-medium">
                    SUB-2026-0891
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-zinc-900">
                      Acme Logistics Ltd
                    </div>
                    <div className="text-[11px] text-zinc-500">
                      Enterprise Dedicated — Monthly
                    </div>
                  </TableCell>
                  <TableCell className="text-zinc-600">Monthly</TableCell>
                  <TableCell className="font-mono text-zinc-900 font-medium">
                    $1,450.00
                  </TableCell>
                  <TableCell>
                    <Badge variant="success">Active</Badge>
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell className="font-mono text-xs font-medium">
                    SUB-2026-0890
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-zinc-900">
                      Northwind Traders
                    </div>
                    <div className="text-[11px] text-zinc-500">
                      Standard Business — Yearly
                    </div>
                  </TableCell>
                  <TableCell className="text-zinc-600">Yearly</TableCell>
                  <TableCell className="font-mono text-zinc-900 font-medium">
                    $4,200.00
                  </TableCell>
                  <TableCell>
                    <Badge variant="accent">Quotation</Badge>
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell className="font-mono text-xs font-medium">
                    SUB-2026-0889
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-zinc-900">
                      Global Tech Systems
                    </div>
                    <div className="text-[11px] text-zinc-500">
                      SaaS Growth Plan — Monthly
                    </div>
                  </TableCell>
                  <TableCell className="text-zinc-600">Monthly</TableCell>
                  <TableCell className="font-mono text-zinc-900 font-medium">
                    $850.00
                  </TableCell>
                  <TableCell>
                    <Badge variant="warning">Paused</Badge>
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell className="font-mono text-xs font-medium">
                    SUB-2026-0888
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-zinc-900">
                      Apex Retail Solutions
                    </div>
                    <div className="text-[11px] text-zinc-500">
                      Starter API Access — Monthly
                    </div>
                  </TableCell>
                  <TableCell className="text-zinc-600">Monthly</TableCell>
                  <TableCell className="font-mono text-zinc-900 font-medium">
                    $220.00
                  </TableCell>
                  <TableCell>
                    <Badge variant="neutral">Draft</Badge>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Card>
        </div>

        {/* Quick Operations Sidebar Card */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Role Destinations</CardTitle>
              <CardDescription>
                Quick access to destinations configured for your active role
              </CardDescription>
            </CardHeader>
            <div className="space-y-2">
              {role === "admin" && (
                <>
                  <Link
                    href="/admin/products"
                    className="block p-2.5 rounded-md border border-zinc-200 hover:bg-zinc-50 transition-colors"
                  >
                    <div className="font-medium text-xs text-zinc-900">
                      Products &amp; Variants
                    </div>
                    <div className="text-[11px] text-zinc-500">
                      Sales price, cost price, price adjustments
                    </div>
                  </Link>
                  <Link
                    href="/admin/plans"
                    className="block p-2.5 rounded-md border border-zinc-200 hover:bg-zinc-50 transition-colors"
                  >
                    <div className="font-medium text-xs text-zinc-900">
                      Billing Plans &amp; Cycles
                    </div>
                    <div className="text-[11px] text-zinc-500">
                      Intervals, pause/close/renewal rules
                    </div>
                  </Link>
                  <Link
                    href="/admin/staff"
                    className="block p-2.5 rounded-md border border-zinc-200 hover:bg-zinc-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-xs text-zinc-900">
                        Staff Management
                      </span>
                      <Badge variant="danger" className="text-[9px]">
                        Admin Only
                      </Badge>
                    </div>
                    <div className="text-[11px] text-zinc-500">
                      Authorize billing operators
                    </div>
                  </Link>
                  <Link
                    href="/admin/discounts"
                    className="block p-2.5 rounded-md border border-zinc-200 hover:bg-zinc-50 transition-colors"
                  >
                    <div className="font-medium text-xs text-zinc-900">
                      Discount Rules
                    </div>
                    <div className="text-[11px] text-zinc-500">
                      Fixed/percentage promos and limits
                    </div>
                  </Link>
                </>
              )}

              {role === "staff" && (
                <>
                  <Link
                    href="/staff/customers"
                    className="block p-2.5 rounded-md border border-zinc-200 hover:bg-zinc-50 transition-colors"
                  >
                    <div className="font-medium text-xs text-zinc-900">
                      Customers Directory
                    </div>
                    <div className="text-[11px] text-zinc-500">
                      Search and manage client profiles
                    </div>
                  </Link>
                  <Link
                    href="/staff/subscriptions"
                    className="block p-2.5 rounded-md border border-zinc-200 hover:bg-zinc-50 transition-colors"
                  >
                    <div className="font-medium text-xs text-zinc-900">
                      Quotations &amp; Subscriptions
                    </div>
                    <div className="text-[11px] text-zinc-500">
                      Draft → Quotation → Confirmed → Active
                    </div>
                  </Link>
                  <Link
                    href="/staff/invoices"
                    className="block p-2.5 rounded-md border border-zinc-200 hover:bg-zinc-50 transition-colors"
                  >
                    <div className="font-medium text-xs text-zinc-900">
                      Invoices &amp; Billing Runs
                    </div>
                    <div className="text-[11px] text-zinc-500">
                      Generate, confirm, print, and track
                    </div>
                  </Link>
                  <Link
                    href="/staff/payments"
                    className="block p-2.5 rounded-md border border-zinc-200 hover:bg-zinc-50 transition-colors"
                  >
                    <div className="font-medium text-xs text-zinc-900">
                      Manual Payment Log
                    </div>
                    <div className="text-[11px] text-zinc-500">
                      Record checks, transfers, and cards
                    </div>
                  </Link>
                </>
              )}

              {role === "customer" && (
                <>
                  <Link
                    href="/customer/portal"
                    className="block p-2.5 rounded-md border border-zinc-200 hover:bg-zinc-50 transition-colors"
                  >
                    <div className="font-medium text-xs text-zinc-900">
                      My Portal Home
                    </div>
                    <div className="text-[11px] text-zinc-500">
                      Account overview and service status
                    </div>
                  </Link>
                  <Link
                    href="/customer/subscriptions"
                    className="block p-2.5 rounded-md border border-zinc-200 hover:bg-zinc-50 transition-colors"
                  >
                    <div className="font-medium text-xs text-zinc-900">
                      My Subscriptions
                    </div>
                    <div className="text-[11px] text-zinc-500">
                      Active plans, renewals, and pause requests
                    </div>
                  </Link>
                  <Link
                    href="/customer/invoices"
                    className="block p-2.5 rounded-md border border-zinc-200 hover:bg-zinc-50 transition-colors"
                  >
                    <div className="font-medium text-xs text-zinc-900">
                      My Invoices &amp; Receipts
                    </div>
                    <div className="text-[11px] text-zinc-500">
                      Download past receipts and view balance
                    </div>
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
