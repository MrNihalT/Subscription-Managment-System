"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle, Plus, Search, Calendar, DollarSign, FileCheck, ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
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
import { getPayments, recordPayment } from "@/lib/services/payments";
import { getInvoices } from "@/lib/services/invoices";

export default function StaffPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [unpaidInvoices, setUnpaidInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  // Record Payment Modal State
  const [showLogModal, setShowLogModal] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState("");
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<"bank_transfer" | "credit_card" | "check" | "cash">("bank_transfer");
  const [paymentNote, setPaymentNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [alertState, setAlertState] = useState<{ type: "success" | "danger"; msg: string } | null>(null);

  const loadData = async () => {
    setLoading(true);
    const [payRes, invRes] = await Promise.all([
      getPayments({ page, pageSize: 15 }),
      getInvoices({ pageSize: 100 }),
    ]);

    if (payRes.data) {
      setPayments(payRes.data);
      setTotalCount(payRes.totalCount);
    }
    if (invRes.data) {
      // Find invoices with unpaid balance
      const eligible = invRes.data.filter(
        (i: any) => i.status !== "paid" && i.status !== "cancelled" && (i.balanceRemaining === undefined || i.balanceRemaining > 0)
      );
      setUnpaidInvoices(eligible);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [page]);

  const openModal = () => {
    setAlertState(null);
    const initialInv = unpaidInvoices[0];
    if (initialInv) {
      setSelectedInvoiceId(initialInv.id);
      setPaymentAmount(initialInv.balanceRemaining || Number(initialInv.total));
    } else {
      setSelectedInvoiceId("");
      setPaymentAmount(0);
    }
    setPaymentMethod("bank_transfer");
    setPaymentNote("");
    setShowLogModal(true);
  };

  const handleInvoiceSelect = (id: string) => {
    setSelectedInvoiceId(id);
    const inv = unpaidInvoices.find((i) => i.id === id);
    if (inv) {
      setPaymentAmount(inv.balanceRemaining || Number(inv.total));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoiceId) {
      setAlertState({ type: "danger", msg: "Please select an invoice to apply payment to." });
      return;
    }
    if (paymentAmount <= 0) {
      setAlertState({ type: "danger", msg: "Payment amount must be greater than zero." });
      return;
    }

    setSubmitting(true);
    setAlertState(null);

    try {
      const res = await recordPayment({
        invoice_id: selectedInvoiceId,
        method: paymentMethod,
        amount: Number(paymentAmount),
        note: paymentNote,
      });

      if (res.error) {
        setAlertState({ type: "danger", msg: res.error });
      } else {
        setAlertState({
          type: "success",
          msg: `Payment of $${Number(paymentAmount).toFixed(2)} recorded. Invoice updated!`,
        });
        await loadData();
        setTimeout(() => setShowLogModal(false), 1000);
      }
    } catch (err: any) {
      setAlertState({ type: "danger", msg: err.message || "Operation failed." });
    } finally {
      setSubmitting(false);
    }
  };

  const totalCollected = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);

  const filtered = payments.filter((p) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (p.invoice?.invoice_number && p.invoice.invoice_number.toLowerCase().includes(term)) ||
      (p.invoice?.customer?.name && p.invoice.customer.name.toLowerCase().includes(term)) ||
      (p.note && p.note.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-zinc-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-zinc-900">
              Manual Payment Ledger
            </h1>
            <Badge variant="accent">Staff Operations</Badge>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Record manual settlements against confirmed billing invoices. Automatically reconciles balances and marks invoices as paid.
          </p>
        </div>
        <Button size="sm" onClick={openModal}>
          <Plus className="h-3.5 w-3.5" />
          Record New Payment
        </Button>
      </div>

      <Alert variant="info" title="Offline &amp; Direct Settlements">
        Supports direct bank wire transfers, corporate checks, and verified terminal charges with audit notes. No payment gateway dependency required.
      </Alert>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-zinc-500">Total Collected Revenue</p>
            <DollarSign className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-2 text-2xl font-bold font-mono text-zinc-900 tracking-tight">
            ${totalCollected.toFixed(2)}
          </p>
          <p className="mt-1 text-[11px] text-zinc-500">
            Across {payments.length} settled transactions
          </p>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-zinc-500">Invoices Awaiting Settlement</p>
            <FileCheck className="h-4 w-4 text-amber-600" />
          </div>
          <p className="mt-2 text-2xl font-bold font-mono text-zinc-900 tracking-tight">
            {unpaidInvoices.length} {unpaidInvoices.length === 1 ? "Invoice" : "Invoices"}
          </p>
          <p className="mt-1 text-[11px] text-zinc-500">
            Open for manual payment recording
          </p>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-zinc-500">Reconciliation Engine</p>
            <CheckCircle className="h-4 w-4 text-teal-600" />
          </div>
          <p className="mt-2 text-2xl font-semibold text-zinc-800 tracking-tight">
            Auto-Paid Trigger
          </p>
          <p className="mt-1 text-[11px] text-zinc-500">
            Invoices mark paid when balance = $0.00
          </p>
        </Card>
      </div>

      {/* Filter and Table */}
      <Card className="p-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-400" />
          <Input
            placeholder="Search payment ref, invoice #, customer..."
            className="pl-8 text-xs"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </Card>

      {loading ? (
        <Card className="p-8 text-center text-xs text-zinc-500">
          Loading payment ledger from database...
        </Card>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={DollarSign}
          title="No Payment Records Found"
          description={
            searchTerm
              ? "No payments match your search filter."
              : "No payments recorded yet. Click 'Record New Payment' to settle an outstanding invoice."
          }
          actionLabel="Record New Payment"
          onAction={openModal}
        />
      ) : (
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
              {filtered.map((pay) => (
                <TableRow key={pay.id}>
                  <TableCell className="font-mono text-xs font-semibold text-zinc-900">
                    {pay.invoice?.invoice_number || "—"}
                  </TableCell>
                  <TableCell className="font-medium text-xs text-zinc-900">
                    {pay.invoice?.customer?.name || "Client"}
                  </TableCell>
                  <TableCell className="text-right font-mono font-bold text-xs text-emerald-800">
                    +${Number(pay.amount).toFixed(2)}
                  </TableCell>
                  <TableCell className="capitalize text-zinc-700 text-xs">
                    {pay.method?.replace("_", " ")}
                  </TableCell>
                  <TableCell className="text-zinc-500 text-xs font-mono">
                    {new Date(pay.paid_at).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-xs text-zinc-500">
                    {pay.note || "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination Footer */}
          {totalCount > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-zinc-200 bg-zinc-50/50 text-xs text-zinc-600">
              <div>
                Showing <span className="font-semibold text-zinc-900">{(page - 1) * 15 + 1}</span> to{" "}
                <span className="font-semibold text-zinc-900">{Math.min(page * 15, totalCount)}</span> of{" "}
                <span className="font-semibold text-zinc-900">{totalCount}</span> recorded payments
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1 || loading}
                  className="text-xs h-7 px-2.5"
                >
                  Previous
                </Button>
                <span className="text-xs font-mono px-2 text-zinc-700">
                  Page {page} of {Math.ceil(totalCount / 15) || 1}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page * 15 >= totalCount || loading}
                  className="text-xs h-7 px-2.5"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Record Payment Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl border border-zinc-200 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-semibold text-zinc-900 border-b border-zinc-100 pb-3 mb-4">
              Record Manual Payment
            </h3>

            {alertState && (
              <div className="mb-4">
                <Alert variant={alertState.type}>
                  {alertState.msg}
                </Alert>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">
                  Select Unpaid Invoice *
                </label>
                {unpaidInvoices.length === 0 ? (
                  <p className="text-xs text-zinc-500 italic p-2 border border-zinc-200 rounded">
                    No confirmed unpaid invoices available for payment recording.
                  </p>
                ) : (
                  <select
                    value={selectedInvoiceId}
                    onChange={(e) => handleInvoiceSelect(e.target.value)}
                    className="w-full text-xs rounded border border-zinc-300 py-2 px-2.5 bg-white font-mono"
                    required
                    disabled={submitting}
                  >
                    {unpaidInvoices.map((inv) => (
                      <option key={inv.id} value={inv.id}>
                        {inv.invoice_number} — {inv.customer?.name} (Due: ${Number(inv.balanceRemaining || inv.total).toFixed(2)})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">
                  Payment Method *
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full text-xs rounded border border-zinc-300 py-2 px-2.5 bg-white"
                  disabled={submitting}
                >
                  <option value="bank_transfer">Bank Wire / Electronic Transfer</option>
                  <option value="credit_card">Corporate Credit Card (Offline Auth)</option>
                  <option value="check">Bank Cheque / Draft</option>
                  <option value="cash">Direct Cash Settlement</option>
                </select>
              </div>

              <Input
                label="Payment Amount ($) *"
                type="number"
                step="0.01"
                min="0.01"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                required
                disabled={submitting}
              />

              <Input
                label="Audit Note / Reference *"
                placeholder="e.g. Wire Ref #WT-9920148 verified in Treasury"
                value={paymentNote}
                onChange={(e) => setPaymentNote(e.target.value)}
                required
                disabled={submitting}
              />

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-zinc-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowLogModal(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={submitting || unpaidInvoices.length === 0}>
                  {submitting ? "Processing..." : "Confirm & Settle"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
