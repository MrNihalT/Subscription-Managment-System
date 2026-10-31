"use client";

import React, { useState } from "react";
import { CreditCard, Plus, Printer, CheckCircle, XCircle, Search, AlertCircle } from "lucide-react";
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
import { InvoiceStatus } from "@/types";

interface DemoInvoice {
  id: string;
  invoiceNumber: string;
  subNumber: string;
  customerName: string;
  periodStart: string;
  periodEnd: string;
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  total: number;
  dueDate: string;
  status: InvoiceStatus;
}

const initialInvoices: DemoInvoice[] = [
  {
    id: "inv-1",
    invoiceNumber: "INV-2026-0101",
    subNumber: "SUB-2026-0891",
    customerName: "Acme Logistics Ltd",
    periodStart: "2026-10-01",
    periodEnd: "2026-10-31",
    subtotal: 1450.0,
    taxTotal: 145.0,
    discountTotal: 0.0,
    total: 1595.0,
    dueDate: "2026-11-15",
    status: "paid",
  },
  {
    id: "inv-2",
    invoiceNumber: "INV-2026-0102",
    subNumber: "SUB-2026-0889",
    customerName: "Global Tech Systems",
    periodStart: "2026-10-01",
    periodEnd: "2026-10-31",
    subtotal: 850.0,
    taxTotal: 85.0,
    discountTotal: 50.0,
    total: 885.0,
    dueDate: "2026-11-15",
    status: "confirmed",
  },
  {
    id: "inv-3",
    invoiceNumber: "INV-2026-0103",
    subNumber: "SUB-2026-0890",
    customerName: "Northwind Traders",
    periodStart: "2026-10-15",
    periodEnd: "2027-10-14",
    subtotal: 4200.0,
    taxTotal: 420.0,
    discountTotal: 200.0,
    total: 4420.0,
    dueDate: "2026-11-01",
    status: "draft",
  },
  {
    id: "inv-4",
    invoiceNumber: "INV-2026-0099",
    subNumber: "SUB-2026-0887",
    customerName: "Pinnacle Manufacturing",
    periodStart: "2026-09-01",
    periodEnd: "2026-09-30",
    subtotal: 1450.0,
    taxTotal: 145.0,
    discountTotal: 0.0,
    total: 1595.0,
    dueDate: "2026-10-15",
    status: "cancelled",
  },
];

export default function StaffInvoicesPage() {
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = initialInvoices.filter((inv) => {
    const matchesFilter =
      activeFilter === "all" ? true : inv.status === activeFilter;
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.subNumber.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status: InvoiceStatus) => {
    switch (status) {
      case "paid":
        return <Badge variant="success">Paid</Badge>;
      case "confirmed":
        return <Badge variant="warning">Confirmed</Badge>;
      case "draft":
        return <Badge variant="neutral">Draft</Badge>;
      case "cancelled":
        return <Badge variant="danger">Cancelled</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-zinc-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-zinc-900">
              Invoices &amp; Billing Runs
            </h1>
            <Badge variant="accent">Staff Destination</Badge>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Generate period invoices, verify tax and discounts, confirm, print, and track billing states.
          </p>
        </div>
        <Button size="sm">
          <Plus className="h-3.5 w-3.5" />
          Generate Billing Run
        </Button>
      </div>

      <Alert variant="info" title="Period Uniqueness Protection">
        The database schema enforces unique (subscription_id, period_start, period_end) so no subscription can ever be billed twice for the same interval.
      </Alert>

      {/* Filter Bar */}
      <Card className="p-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1">
            {[
              { id: "all", label: "All Invoices" },
              { id: "draft", label: "Draft" },
              { id: "confirmed", label: "Confirmed" },
              { id: "paid", label: "Paid" },
              { id: "cancelled", label: "Cancelled" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                  activeFilter === tab.id
                    ? "bg-zinc-900 text-white"
                    : "text-zinc-600 hover:bg-zinc-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-400" />
            <input
              type="text"
              placeholder="Search invoice # or client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md border border-zinc-300 focus:outline-none focus:ring-1 focus:ring-teal-700"
            />
          </div>
        </div>
      </Card>

      {/* Invoices Table */}
      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice #</TableHead>
              <TableHead>Subscription #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Period</TableHead>
              <TableHead className="text-right">Subtotal</TableHead>
              <TableHead className="text-right">Tax</TableHead>
              <TableHead className="text-right">Total Due</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((inv) => (
              <TableRow key={inv.id}>
                <TableCell className="font-mono text-xs font-semibold text-zinc-900">
                  {inv.invoiceNumber}
                </TableCell>
                <TableCell className="font-mono text-xs text-zinc-600">
                  {inv.subNumber}
                </TableCell>
                <TableCell className="font-medium text-zinc-900">
                  {inv.customerName}
                </TableCell>
                <TableCell className="text-zinc-600 font-mono text-[11px]">
                  {inv.periodStart} → {inv.periodEnd}
                </TableCell>
                <TableCell className="text-right font-mono text-zinc-700">
                  ${inv.subtotal.toFixed(2)}
                </TableCell>
                <TableCell className="text-right font-mono text-zinc-600">
                  ${inv.taxTotal.toFixed(2)}
                </TableCell>
                <TableCell className="text-right font-mono font-medium text-zinc-900">
                  ${inv.total.toFixed(2)}
                </TableCell>
                <TableCell className="font-mono text-xs text-zinc-600">
                  {inv.dueDate}
                </TableCell>
                <TableCell>{getStatusBadge(inv.status)}</TableCell>
                <TableCell className="text-right">
                  <button
                    onClick={() => window.print()}
                    className="p-1 text-zinc-500 hover:text-zinc-900 rounded"
                    title="Print Invoice"
                  >
                    <Printer className="h-3.5 w-3.5" />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
