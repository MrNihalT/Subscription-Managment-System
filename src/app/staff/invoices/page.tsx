"use client";

import React, { useState, useEffect } from "react";
import {
  CreditCard,
  Plus,
  Printer,
  CheckCircle,
  XCircle,
  Search,
  AlertCircle,
  Layers,
  Calendar,
  DollarSign,
  ChevronRight,
  FileText,
  Clock,
  Sparkles,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
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
import { EmptyState } from "@/components/ui/EmptyState";
import {
  getInvoices,
  generateInvoiceForSubscription,
  generateBatchBillingInvoices,
  updateInvoiceStatus,
  getInvoiceById,
} from "@/lib/services/invoices";
import { getSubscriptions } from "@/lib/services/subscriptions";
import { recordPayment } from "@/lib/services/payments";
import { InvoiceStatus } from "@/types";

export default function StaffInvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Generation Modal
  const [genModalOpen, setGenModalOpen] = useState(false);
  const [selectedSubId, setSelectedSubId] = useState<string>("all");
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [genAlert, setGenAlert] = useState<{ type: "success" | "danger" | "warning"; msg: string } | null>(null);

  // Invoice Detail / Drawer
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);

  // Payment Recording Modal
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<"bank_transfer" | "credit_card" | "check" | "cash">("bank_transfer");
  const [paymentNote, setPaymentNote] = useState("");
  const [paySubmitting, setPaySubmitting] = useState(false);
  const [payAlert, setPayAlert] = useState<{ type: "success" | "danger"; msg: string } | null>(null);

  const loadData = async () => {
    setLoading(true);
    const [invRes, subsRes] = await Promise.all([
      getInvoices({
        page,
        pageSize: 15,
        status: activeFilter,
        search: searchTerm,
      }),
      getSubscriptions(),
    ]);

    if (invRes.data) {
      setInvoices(invRes.data);
      setTotalCount(invRes.totalCount);
    }
    if (subsRes.data) {
      setSubscriptions(subsRes.data.filter((s: any) => s.status === "active" || s.status === "confirmed"));
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [page, activeFilter]);

  const openGenModal = () => {
    setGenAlert(null);
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    // Default current month billing period
    const start = new Date(year, month, 1).toISOString().split("T")[0];
    const end = new Date(year, month + 1, 0).toISOString().split("T")[0];
    const due = new Date(year, month + 1, 15).toISOString().split("T")[0];

    setPeriodStart(start);
    setPeriodEnd(end);
    setDueDate(due);
    setSelectedSubId("all");
    setGenModalOpen(true);
  };

  const handleGenerateInvoices = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!periodStart || !periodEnd) {
      setGenAlert({ type: "danger", msg: "Please select period start and end dates." });
      return;
    }

    setSubmitting(true);
    setGenAlert(null);

    try {
      if (selectedSubId === "all") {
        // Batch generate for all active subscriptions
        const res = await generateBatchBillingInvoices(periodStart, periodEnd, dueDate);
        if (res.error) {
          setGenAlert({ type: "danger", msg: res.error });
        } else {
          let msg = `Batch complete: Generated ${res.createdCount} new invoices.`;
          if (res.skippedCount > 0) {
            msg += ` (${res.skippedCount} subscriptions skipped because they were already billed for this period — duplicate prevented).`;
          }
          setGenAlert({ type: "success", msg });
          await loadData();
          setTimeout(() => {
            if (res.createdCount > 0) setGenModalOpen(false);
          }, 1500);
        }
      } else {
        // Generate for specific subscription
        const res = await generateInvoiceForSubscription({
          subscription_id: selectedSubId,
          period_start: periodStart,
          period_end: periodEnd,
          due_date: dueDate,
        });

        if (res.error) {
          setGenAlert({ type: "danger", msg: res.error });
        } else {
          setGenAlert({
            type: "success",
            msg: `Invoice ${res.data.invoice_number} successfully generated!`,
          });
          await loadData();
          setTimeout(() => setGenModalOpen(false), 1200);
        }
      }
    } catch (err: any) {
      setGenAlert({ type: "danger", msg: err.message || "Failed to generate invoice." });
    } finally {
      setSubmitting(false);
    }
  };

  const openDrawer = async (inv: any) => {
    setDrawerLoading(true);
    setSelectedInvoice(inv);
    const detail = await getInvoiceById(inv.id);
    if (detail.data) {
      setSelectedInvoice(detail.data);
    }
    setDrawerLoading(false);
  };

  const handleStatusChange = async (newStatus: InvoiceStatus) => {
    if (!selectedInvoice) return;
    setStatusUpdating(true);
    const res = await updateInvoiceStatus(selectedInvoice.id, newStatus);
    if (res.data) {
      setSelectedInvoice({ ...selectedInvoice, status: newStatus });
      await loadData();
    }
    setStatusUpdating(false);
  };

  const openRecordPaymentModal = (inv: any) => {
    setSelectedInvoice(inv);
    setPaymentAmount(inv.balanceRemaining || Number(inv.total));
    setPaymentMethod("bank_transfer");
    setPaymentNote("");
    setPayAlert(null);
    setPayModalOpen(true);
  };

  const handleRecordPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;
    if (paymentAmount <= 0) {
      setPayAlert({ type: "danger", msg: "Payment amount must be greater than zero." });
      return;
    }

    setPaySubmitting(true);
    setPayAlert(null);

    try {
      const res = await recordPayment({
        invoice_id: selectedInvoice.id,
        method: paymentMethod,
        amount: Number(paymentAmount),
        note: paymentNote,
      });

      if (res.error) {
        setPayAlert({ type: "danger", msg: res.error });
      } else {
        setPayAlert({
          type: "success",
          msg: `Payment of $${Number(paymentAmount).toFixed(2)} recorded successfully!`,
        });
        await loadData();
        const updatedInv = await getInvoiceById(selectedInvoice.id);
        if (updatedInv.data) setSelectedInvoice(updatedInv.data);
        setTimeout(() => setPayModalOpen(false), 1000);
      }
    } catch (err: any) {
      setPayAlert({ type: "danger", msg: err.message || "Payment recording failed." });
    } finally {
      setPaySubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const filteredInvoices = invoices.filter((inv) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      inv.invoice_number.toLowerCase().includes(term) ||
      (inv.customer?.name && inv.customer.name.toLowerCase().includes(term)) ||
      (inv.subscription?.subscription_number &&
        inv.subscription.subscription_number.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-zinc-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-zinc-900">
              Invoices &amp; Billing Runs
            </h1>
            <Badge variant="accent">Staff Operations</Badge>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Generate billing period invoices from active subscriptions, apply automatic discounts, and settle manual payments.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={openGenModal}>
            <Plus className="h-3.5 w-3.5" />
            Generate Period Invoices
          </Button>
        </div>
      </div>

      <Alert variant="info" title="Duplicate Billing Prevention Active">
        Backed by database constraint <code className="bg-white/80 px-1 py-0.5 rounded border border-zinc-200 text-zinc-800">unique_subscription_period</code> on (subscription_id, period_start, period_end). A subscription cannot be billed twice for the same billing window.
      </Alert>

      {/* Filter Tabs & Search */}
      <Card className="p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 w-full sm:w-auto">
            {[
              { id: "all", label: "All Invoices" },
              { id: "confirmed", label: "Confirmed / Outstanding" },
              { id: "draft", label: "Draft" },
              { id: "paid", label: "Paid" },
              { id: "overdue", label: "Overdue" },
              { id: "cancelled", label: "Cancelled" },
            ].map((tab) => (
              <Button
                key={tab.id}
                size="sm"
                variant={activeFilter === tab.id ? "secondary" : "ghost"}
                onClick={() => {
                  setActiveFilter(tab.id);
                  setPage(1);
                }}
                className="text-xs shrink-0"
              >
                {tab.label}
              </Button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-400" />
            <Input
              placeholder="Search invoice #, customer..."
              className="pl-8 text-xs"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* Invoices Table */}
      {loading ? (
        <Card className="p-8 text-center text-xs text-zinc-500">
          Loading billing invoices from database...
        </Card>
      ) : filteredInvoices.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="No Invoices Found"
          description={
            searchTerm
              ? "No invoices matched your search filter."
              : "No invoices generated yet for this filter. Click 'Generate Period Invoices' to bill active subscriptions."
          }
          actionLabel="Generate Period Invoices"
          onAction={openGenModal}
        />
      ) : (
        <Card className="p-0 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Subscription &amp; Customer</TableHead>
                <TableHead>Billing Period</TableHead>
                <TableHead className="text-right">Subtotal</TableHead>
                <TableHead className="text-right">Discount</TableHead>
                <TableHead className="text-right">Tax</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Balance Due</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map((inv) => {
                const isOverdue = inv.isOverdue;
                return (
                  <TableRow key={inv.id} className="hover:bg-zinc-50/70 transition-colors">
                    <TableCell className="font-mono text-xs font-semibold text-zinc-900">
                      {inv.invoice_number}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-xs text-zinc-900">{inv.customer?.name || "Client"}</p>
                        <p className="text-[11px] text-zinc-400 font-mono">
                          {inv.subscription?.subscription_number}
                          {inv.subscription?.plan?.name && ` • ${inv.subscription.plan.name}`}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-zinc-600 font-mono">
                      {inv.period_start} → {inv.period_end}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs text-zinc-700">
                      ${Number(inv.subtotal).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs text-emerald-700">
                      {Number(inv.discount_total) > 0 ? `-$${Number(inv.discount_total).toFixed(2)}` : "$0.00"}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs text-zinc-600">
                      ${Number(inv.tax_total).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs font-semibold text-zinc-900">
                      ${Number(inv.total).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs font-bold text-zinc-900">
                      {inv.status === "paid" ? (
                        <span className="text-emerald-700 font-normal">$0.00 (Settled)</span>
                      ) : (
                        `$${Number(inv.balanceRemaining || inv.total).toFixed(2)}`
                      )}
                    </TableCell>
                    <TableCell className="text-xs font-mono">
                      <span className={isOverdue ? "text-rose-700 font-bold" : "text-zinc-600"}>
                        {inv.due_date || "—"}
                      </span>
                    </TableCell>
                    <TableCell>
                      {inv.status === "paid" ? (
                        <Badge variant="success">PAID</Badge>
                      ) : isOverdue ? (
                        <Badge variant="danger">OVERDUE</Badge>
                      ) : inv.status === "confirmed" ? (
                        <Badge variant="accent">CONFIRMED</Badge>
                      ) : inv.status === "draft" ? (
                        <Badge variant="neutral">DRAFT</Badge>
                      ) : (
                        <Badge variant="outline">CANCELLED</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {inv.status !== "paid" && inv.status !== "cancelled" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openRecordPaymentModal(inv)}
                            className="text-xs px-2 py-0.5 h-7"
                          >
                            Pay
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openDrawer(inv)}
                          className="text-xs px-2 py-0.5 h-7"
                        >
                          Details
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Generation Modal */}
      {genModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl border border-zinc-200 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-semibold text-zinc-900 border-b border-zinc-100 pb-3 mb-4">
              Generate Billing Invoices
            </h3>

            {genAlert && (
              <div className="mb-4">
                <Alert variant={genAlert.type}>
                  {genAlert.msg}
                </Alert>
              </div>
            )}

            <form onSubmit={handleGenerateInvoices} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">
                  Target Subscription *
                </label>
                <select
                  value={selectedSubId}
                  onChange={(e) => setSelectedSubId(e.target.value)}
                  className="w-full text-xs rounded border border-zinc-300 py-2 px-2.5 bg-white font-mono"
                  disabled={submitting}
                >
                  <option value="all">⚡ All Active Subscriptions (Batch Billing Run)</option>
                  {subscriptions.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.subscription_number} — {s.customer?.name} ({s.plan?.name})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-zinc-400 mt-1">
                  Selecting 'All Active' runs the recurring billing cycle for all clients at once.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Period Start Date *"
                  type="date"
                  value={periodStart}
                  onChange={(e) => setPeriodStart(e.target.value)}
                  required
                  disabled={submitting}
                />
                <Input
                  label="Period End Date *"
                  type="date"
                  value={periodEnd}
                  onChange={(e) => setPeriodEnd(e.target.value)}
                  required
                  disabled={submitting}
                />
              </div>

              <Input
                label="Invoice Payment Due Date *"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
                disabled={submitting}
              />

              <div className="p-3 rounded bg-zinc-50 border border-zinc-200 text-xs text-zinc-600 space-y-1">
                <p className="font-semibold text-zinc-800">Billing Engine Rules Applied:</p>
                <p>• Automatically attaches Admin-configured product tax rates.</p>
                <p>• Automatically checks and applies valid active promotional discounts.</p>
                <p>• Prevents duplicate invoices for the same subscription period.</p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-zinc-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setGenModalOpen(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={submitting}>
                  {submitting ? "Processing Billing..." : "Generate Invoices"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice Details & Print Drawer */}
      {selectedInvoice && !payModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-xl h-full bg-white shadow-2xl p-6 overflow-y-auto space-y-6 border-l border-zinc-200 flex flex-col justify-between print:p-0 print:max-w-none print:shadow-none">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-zinc-200">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold font-mono text-zinc-900">
                      {selectedInvoice.invoice_number}
                    </span>
                    <Badge
                      variant={
                        selectedInvoice.status === "paid"
                          ? "success"
                          : selectedInvoice.isOverdue
                          ? "danger"
                          : selectedInvoice.status === "confirmed"
                          ? "accent"
                          : "neutral"
                      }
                    >
                      {selectedInvoice.status.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Issued to {selectedInvoice.customer?.name} ({selectedInvoice.customer?.email})
                  </p>
                </div>
                <div className="flex items-center gap-2 print:hidden">
                  <Button size="sm" variant="outline" onClick={handlePrint}>
                    <Printer className="h-3.5 w-3.5" />
                    Print / PDF
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setSelectedInvoice(null)}>
                    Close
                  </Button>
                </div>
              </div>

              {/* Summary details */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-zinc-50 rounded border border-zinc-200 text-xs">
                <div>
                  <span className="text-zinc-500 block">Subscription:</span>
                  <span className="font-mono font-medium text-zinc-900">
                    {selectedInvoice.subscription?.subscription_number || "—"}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Billing Period:</span>
                  <span className="font-mono font-medium text-zinc-900">
                    {selectedInvoice.period_start} → {selectedInvoice.period_end}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Due Date:</span>
                  <span className={`font-mono font-medium ${selectedInvoice.isOverdue ? "text-rose-700 font-bold" : "text-zinc-900"}`}>
                    {selectedInvoice.due_date || "Immediate"}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Balance Remaining:</span>
                  <span className="font-mono font-bold text-zinc-900">
                    ${Number(selectedInvoice.balanceRemaining || 0).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Invoice Lines Table */}
              <div>
                <h4 className="text-xs font-semibold text-zinc-800 uppercase tracking-wider mb-2">
                  Line Items &amp; Calculations
                </h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-center">Qty</TableHead>
                      <TableHead className="text-right">Unit Price</TableHead>
                      <TableHead className="text-right">Tax</TableHead>
                      <TableHead className="text-right">Line Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedInvoice.lines && selectedInvoice.lines.length > 0 ? (
                      selectedInvoice.lines.map((l: any) => (
                        <TableRow key={l.id}>
                          <TableCell className="font-medium text-xs text-zinc-900">
                            {l.description}
                          </TableCell>
                          <TableCell className="text-center font-mono text-xs">
                            {l.quantity}
                          </TableCell>
                          <TableCell className="text-right font-mono text-xs">
                            ${Number(l.unit_price).toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right font-mono text-xs text-zinc-600">
                            {Number(l.tax_rate)}%
                          </TableCell>
                          <TableCell className="text-right font-mono text-xs font-semibold text-zinc-900">
                            ${Number(l.line_total).toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-xs text-zinc-400 py-3">
                          No itemized lines on file.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Totals Breakdown */}
              <div className="flex justify-end pt-2">
                <div className="w-64 space-y-1.5 text-xs">
                  <div className="flex justify-between text-zinc-600">
                    <span>Subtotal:</span>
                    <span className="font-mono">${Number(selectedInvoice.subtotal).toFixed(2)}</span>
                  </div>
                  {Number(selectedInvoice.discount_total) > 0 && (
                    <div className="flex justify-between text-emerald-700 font-medium">
                      <span>Eligible Discount Applied:</span>
                      <span className="font-mono">-${Number(selectedInvoice.discount_total).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-zinc-600">
                    <span>Taxes:</span>
                    <span className="font-mono">${Number(selectedInvoice.tax_total).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t border-zinc-200 pt-1.5 text-sm font-bold text-zinc-900">
                    <span>Invoice Total:</span>
                    <span className="font-mono">${Number(selectedInvoice.total).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-zinc-600 pt-1">
                    <span>Payments Received:</span>
                    <span className="font-mono text-emerald-700 font-semibold">
                      ${Number(selectedInvoice.totalPaid || 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-zinc-200 pt-1 text-sm font-bold text-zinc-900">
                    <span>Balance Due:</span>
                    <span className="font-mono">
                      ${Number(selectedInvoice.balanceRemaining || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payments History */}
              {selectedInvoice.payments && selectedInvoice.payments.length > 0 && (
                <div className="pt-2">
                  <h4 className="text-xs font-semibold text-zinc-800 uppercase tracking-wider mb-2">
                    Settled Payment Transactions
                  </h4>
                  <div className="space-y-1.5">
                    {selectedInvoice.payments.map((p: any) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between p-2 rounded bg-zinc-50 border border-zinc-200 text-xs"
                      >
                        <div>
                          <span className="capitalize font-medium text-zinc-800">
                            {p.method?.replace("_", " ")}
                          </span>
                          <span className="text-zinc-500 font-mono text-[11px] ml-2">
                            {new Date(p.paid_at).toLocaleString()}
                          </span>
                          {p.note && <p className="text-[11px] text-zinc-400 mt-0.5">{p.note}</p>}
                        </div>
                        <span className="font-mono font-bold text-emerald-800">
                          +${Number(p.amount).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-zinc-200 flex items-center justify-between gap-2 print:hidden">
              <div className="flex items-center gap-1.5">
                {selectedInvoice.status === "draft" && (
                  <Button
                    size="sm"
                    onClick={() => handleStatusChange("confirmed")}
                    disabled={statusUpdating}
                  >
                    Confirm Invoice
                  </Button>
                )}
                {selectedInvoice.status !== "paid" && selectedInvoice.status !== "cancelled" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openRecordPaymentModal(selectedInvoice)}
                  >
                    <DollarSign className="h-3.5 w-3.5" />
                    Record Payment
                  </Button>
                )}
                {selectedInvoice.status !== "cancelled" && selectedInvoice.status !== "paid" && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleStatusChange("cancelled")}
                    disabled={statusUpdating}
                    className="text-rose-700 hover:text-rose-800 hover:bg-rose-50"
                  >
                    Cancel Invoice
                  </Button>
                )}
              </div>
              <Button size="sm" variant="outline" onClick={() => setSelectedInvoice(null)}>
                Dismiss
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Recording Modal */}
      {payModalOpen && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl border border-zinc-200 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-semibold text-zinc-900 border-b border-zinc-100 pb-3 mb-4">
              Record Payment — {selectedInvoice.invoice_number}
            </h3>

            {payAlert && (
              <div className="mb-4">
                <Alert variant={payAlert.type}>
                  {payAlert.msg}
                </Alert>
              </div>
            )}

            <form onSubmit={handleRecordPaymentSubmit} className="space-y-4">
              <div className="p-3 rounded bg-zinc-50 border border-zinc-200 text-xs">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Customer:</span>
                  <span className="font-semibold text-zinc-900">{selectedInvoice.customer?.name}</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-zinc-500">Invoice Total:</span>
                  <span className="font-mono font-medium">${Number(selectedInvoice.total).toFixed(2)}</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-zinc-500">Remaining Balance:</span>
                  <span className="font-mono font-bold text-zinc-900">
                    ${Number(selectedInvoice.balanceRemaining || selectedInvoice.total).toFixed(2)}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">
                  Payment Method *
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full text-xs rounded border border-zinc-300 py-2 px-2.5 bg-white"
                  disabled={paySubmitting}
                >
                  <option value="bank_transfer">Bank Wire / Electronic Transfer</option>
                  <option value="credit_card">Corporate Credit Card (Offline Auth)</option>
                  <option value="check">Bank Cheque / Draft</option>
                  <option value="cash">Direct Cash Deposit</option>
                </select>
              </div>

              <Input
                label="Payment Amount ($) *"
                type="number"
                step="0.01"
                min="0.01"
                max={Number(selectedInvoice.balanceRemaining || selectedInvoice.total)}
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                required
                disabled={paySubmitting}
              />

              <Input
                label="Reference Note / Transaction ID"
                placeholder="e.g. Wire Ref #WT-902148 deposited in Treasury"
                value={paymentNote}
                onChange={(e) => setPaymentNote(e.target.value)}
                disabled={paySubmitting}
              />

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-zinc-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPayModalOpen(false)}
                  disabled={paySubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={paySubmitting}>
                  {paySubmitting ? "Recording..." : "Confirm Payment"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
