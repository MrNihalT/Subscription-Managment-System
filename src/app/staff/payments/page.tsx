"use client";

import React, { useState } from "react";
import { CheckCircle, Plus, Search, Calendar, DollarSign, FileCheck } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/Table";
import { Alert } from "@/components/ui/Alert";

interface DemoPayment {
  id: string;
  invoiceNumber: string;
  customerName: string;
  amount: number;
  method: "bank_transfer" | "credit_card" | "check" | "cash";
  paidAt: string;
  note: string;
}

const paymentRecords: DemoPayment[] = [
  {
    id: "pay-1",
    invoiceNumber: "INV-2026-0101",
    customerName: "Acme Logistics Ltd",
    amount: 1595.0,
    method: "bank_transfer",
    paidAt: "2026-10-29 14:22",
    note: "Wire Ref #WT-9920148 verified in treasury",
  },
  {
    id: "pay-2",
    invoiceNumber: "INV-2026-0098",
    customerName: "Northwind Traders",
    amount: 4200.0,
    method: "credit_card",
    paidAt: "2026-10-18 09:15",
    note: "Corporate card auth token #CC-4401",
  },
  {
    id: "pay-3",
    invoiceNumber: "INV-2026-0095",
    customerName: "Global Tech Systems",
    amount: 850.0,
    method: "check",
    paidAt: "2026-10-10 16:40",
    note: "Check #1084 deposited and cleared",
  },
];

export default function StaffPaymentsPage() {
  const [showLogModal, setShowLogModal] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-zinc-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-zinc-900">
              Manual Payment Log
            </h1>
            <Badge variant="accent">Staff Destination</Badge>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Record manual payments against confirmed invoices. No external payment gateway required for demo.
          </p>
        </div>
        <Button size="sm" onClick={() => setShowLogModal(true)}>
          <Plus className="h-3.5 w-3.5" />
          Record New Payment
        </Button>
      </div>

      <Alert variant="info" title="Offline &amp; Direct Settlements">
        Supports direct bank wire transfers, corporate checks, and verified terminal charges with audit notes.
      </Alert>

      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead className="text-right">Amount Paid</TableHead>
              <TableHead>Payment Method</TableHead>
              <TableHead>Timestamp</TableHead>
              <TableHead>Audit Note / Reference</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paymentRecords.map((pay) => (
              <TableRow key={pay.id}>
                <TableCell className="font-mono text-xs font-semibold text-zinc-900">
                  {pay.invoiceNumber}
                </TableCell>
                <TableCell className="font-medium text-zinc-900">
                  {pay.customerName}
                </TableCell>
                <TableCell className="text-right font-mono font-medium text-emerald-800">
                  ${pay.amount.toFixed(2)}
                </TableCell>
                <TableCell className="capitalize text-zinc-600 font-medium">
                  {pay.method.replace("_", " ")}
                </TableCell>
                <TableCell className="font-mono text-xs text-zinc-600">
                  {pay.paidAt}
                </TableCell>
                <TableCell className="text-zinc-600 text-xs">
                  {pay.note}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Record Payment Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-5 shadow-lg border border-zinc-200">
            <h3 className="text-sm font-semibold text-zinc-900 pb-3 border-b border-zinc-100">
              Record Manual Payment
            </h3>
            <div className="space-y-3 py-4">
              <Select
                label="Select Invoice"
                options={[
                  { value: "INV-2026-0102", label: "INV-2026-0102 — Global Tech ($885.00)" },
                  { value: "INV-2026-0103", label: "INV-2026-0103 — Northwind Traders ($4,420.00)" },
                ]}
              />
              <Input label="Payment Amount ($)" type="number" defaultValue="885.00" />
              <Select
                label="Payment Method"
                options={[
                  { value: "bank_transfer", label: "Direct Bank Wire / ACH" },
                  { value: "credit_card", label: "Manual Credit Card Terminal" },
                  { value: "check", label: "Corporate Check" },
                  { value: "cash", label: "Cash / Counter Receipt" },
                ]}
              />
              <Input
                label="Payment Date & Time"
                type="datetime-local"
                defaultValue="2026-10-31T10:00"
              />
              <Input
                label="Audit Reference / Note"
                placeholder="e.g. Bank wire reference ID #99218"
              />
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100">
              <Button size="sm" variant="ghost" onClick={() => setShowLogModal(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  alert("Payment form is structurally validated. Phase 5 will execute invoice status transition to 'Paid'.");
                  setShowLogModal(false);
                }}
              >
                Log Payment Entry
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
