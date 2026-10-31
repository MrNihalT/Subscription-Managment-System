"use client";

import React from "react";
import Link from "next/link";
import { CreditCard, ArrowLeft, Printer, Download } from "lucide-react";
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

export default function CustomerInvoicesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-zinc-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-zinc-900">
              My Invoices &amp; Billing History
            </h1>
            <Badge variant="success">Customer Portal</Badge>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Download receipts and review payment settlement records for Acme Logistics Ltd.
          </p>
        </div>
        <Link href="/customer/portal">
          <Button size="sm" variant="outline">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Portal
          </Button>
        </Link>
      </div>

      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice #</TableHead>
              <TableHead>Period</TableHead>
              <TableHead className="text-right">Subtotal</TableHead>
              <TableHead className="text-right">Tax</TableHead>
              <TableHead className="text-right">Total Paid</TableHead>
              <TableHead>Payment Method</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-mono text-xs font-semibold text-zinc-900">
                INV-2026-0101
              </TableCell>
              <TableCell className="text-zinc-600 font-mono text-xs">
                2026-10-01 → 2026-10-31
              </TableCell>
              <TableCell className="text-right font-mono text-zinc-700">
                $1,450.00
              </TableCell>
              <TableCell className="text-right font-mono text-zinc-600">
                $145.00
              </TableCell>
              <TableCell className="text-right font-mono font-medium text-emerald-800">
                $1,595.00
              </TableCell>
              <TableCell className="text-zinc-600 text-xs">
                Bank Wire (#WT-9920148)
              </TableCell>
              <TableCell>
                <Badge variant="success">Paid</Badge>
              </TableCell>
              <TableCell className="text-right">
                <button
                  onClick={() => window.print()}
                  className="p-1 text-zinc-600 hover:text-zinc-900 rounded"
                  title="Print Receipt"
                >
                  <Printer className="h-3.5 w-3.5" />
                </button>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-mono text-xs font-semibold text-zinc-900">
                INV-2026-0084
              </TableCell>
              <TableCell className="text-zinc-600 font-mono text-xs">
                2026-09-01 → 2026-09-30
              </TableCell>
              <TableCell className="text-right font-mono text-zinc-700">
                $1,450.00
              </TableCell>
              <TableCell className="text-right font-mono text-zinc-600">
                $145.00
              </TableCell>
              <TableCell className="text-right font-mono font-medium text-emerald-800">
                $1,595.00
              </TableCell>
              <TableCell className="text-zinc-600 text-xs">
                Bank Wire (#WT-9810411)
              </TableCell>
              <TableCell>
                <Badge variant="success">Paid</Badge>
              </TableCell>
              <TableCell className="text-right">
                <button
                  onClick={() => window.print()}
                  className="p-1 text-zinc-600 hover:text-zinc-900 rounded"
                  title="Print Receipt"
                >
                  <Printer className="h-3.5 w-3.5" />
                </button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
