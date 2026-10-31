"use client";

import React from "react";
import Link from "next/link";
import { Layers, FileText, Calendar, CreditCard, ArrowRight, ShieldCheck } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Alert } from "@/components/ui/Alert";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/Table";

export default function CustomerPortalPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-zinc-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-zinc-900">
              Customer Account Portal
            </h1>
            <Badge variant="success">Customer Destination</Badge>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Self-service portal for Acme Logistics Ltd. View your active subscription plans and historical invoices.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/customer/subscriptions">
            <Button size="sm" variant="outline">
              Manage Subscriptions
            </Button>
          </Link>
          <Link href="/customer/invoices">
            <Button size="sm">
              View Invoices
            </Button>
          </Link>
        </div>
      </div>

      <Alert variant="info" title="Customer Row-Level Isolation (RLS)">
        In compliance with security rules, customers can strictly view only their own subscriptions and invoices. Queries outside customer scope are rejected by PostgreSQL RLS.
      </Alert>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-zinc-500">Active Subscriptions</p>
            <Layers className="h-4 w-4 text-teal-700" />
          </div>
          <p className="mt-2 text-2xl font-semibold text-zinc-900 tracking-tight">
            1 Plan
          </p>
          <p className="mt-1 text-[11px] text-zinc-500">
            Enterprise Dedicated — Monthly
          </p>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-zinc-500">Next Scheduled Billing</p>
            <Calendar className="h-4 w-4 text-zinc-400" />
          </div>
          <p className="mt-2 text-2xl font-semibold text-zinc-900 tracking-tight font-mono">
            Nov 01, 2026
          </p>
          <p className="mt-1 text-[11px] text-zinc-500">
            Estimated amount: $1,595.00
          </p>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-zinc-500">Account Standing</p>
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-2 text-2xl font-semibold text-emerald-800 tracking-tight">
            Good Standing
          </p>
          <p className="mt-1 text-[11px] text-emerald-700">
            0 overdue invoices
          </p>
        </Card>
      </div>

      {/* Active Subscription Summary */}
      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b border-zinc-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-zinc-900">
              My Subscribed Services
            </h3>
            <p className="text-xs text-zinc-500">
              Current active contracts and renewable services
            </p>
          </div>
          <Link
            href="/customer/subscriptions"
            className="text-xs text-teal-700 font-medium hover:underline flex items-center gap-1"
          >
            Details <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Subscription #</TableHead>
              <TableHead>Plan Name</TableHead>
              <TableHead>Billing Cycle</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead className="text-right">Recurring Fee</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-mono text-xs font-semibold text-zinc-900">
                SUB-2026-0891
              </TableCell>
              <TableCell className="font-medium text-zinc-900">
                Enterprise Dedicated Server
              </TableCell>
              <TableCell className="text-zinc-600">Monthly</TableCell>
              <TableCell className="font-mono text-xs text-zinc-600">
                2026-09-01
              </TableCell>
              <TableCell className="text-right font-mono font-medium text-zinc-900">
                $1,450.00 / mo
              </TableCell>
              <TableCell>
                <Badge variant="success">Active</Badge>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
