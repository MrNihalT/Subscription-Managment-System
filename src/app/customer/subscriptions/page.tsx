"use client";

import React from "react";
import Link from "next/link";
import { Layers, ArrowLeft, Calendar, FileText, CheckCircle2 } from "lucide-react";
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

export default function CustomerSubscriptionsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-zinc-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-zinc-900">
              My Subscriptions
            </h1>
            <Badge variant="success">Customer Portal</Badge>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Review active services, line items, billing intervals, and renewal dates.
          </p>
        </div>
        <Link href="/customer/portal">
          <Button size="sm" variant="outline">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Portal
          </Button>
        </Link>
      </div>

      <Alert variant="info" title="Customer Isolation Verified">
        Only subscriptions tied to Acme Logistics Ltd (customer_id) are accessible. Direct navigation with arbitrary IDs is prevented by backend RLS.
      </Alert>

      {/* Subscription Card */}
      <Card className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-semibold text-sm text-zinc-900">
                SUB-2026-0891
              </span>
              <Badge variant="success">Active</Badge>
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">
              Plan: Enterprise Dedicated (Monthly) • Started Sep 01, 2026
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-zinc-500">Recurring Total</p>
            <p className="text-lg font-bold font-mono text-zinc-900">$1,450.00 / mo</p>
          </div>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-2">
            Included Product Lines
          </h4>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Line Item</TableHead>
                <TableHead className="text-center">Qty</TableHead>
                <TableHead className="text-right">Unit Price</TableHead>
                <TableHead className="text-right">Tax (10%)</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium text-zinc-900">
                  Dedicated High-Memory Server Core
                </TableCell>
                <TableCell className="text-center font-mono">1</TableCell>
                <TableCell className="text-right font-mono">$1,200.00</TableCell>
                <TableCell className="text-right font-mono">$120.00</TableCell>
                <TableCell className="text-right font-mono font-medium text-zinc-900">$1,320.00</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium text-zinc-900">
                  Managed Backup &amp; Storage Block
                </TableCell>
                <TableCell className="text-center font-mono">1</TableCell>
                <TableCell className="text-right font-mono">$250.00</TableCell>
                <TableCell className="text-right font-mono">$25.00</TableCell>
                <TableCell className="text-right font-mono font-medium text-zinc-900">$275.00</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
