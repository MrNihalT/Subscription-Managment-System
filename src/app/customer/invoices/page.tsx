"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { CreditCard, ArrowLeft, Printer, FileText, CheckCircle2, ShieldCheck, LogIn } from "lucide-react";
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
import { EmptyState } from "@/components/ui/EmptyState";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { getInvoices, getInvoiceById } from "@/lib/services/invoices";

export default function CustomerInvoicesPage() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [customerRecord, setCustomerRecord] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);

  useEffect(() => {
    async function loadCustomerInvoices() {
      if (!supabase) return;
      setLoading(true);

      try {
        if (user) {
          const { data: cust } = await supabase
            .from("customers")
            .select("*")
            .eq("auth_user_id", user.id)
            .single();

          if (cust) {
            setCustomerRecord(cust);
            const { data: invs } = await getInvoices({ customerId: cust.id });
            if (invs) setInvoices(invs);
          } else {
            const { data: custByEmail } = await supabase
              .from("customers")
              .select("*")
              .eq("email", user.email || "")
              .single();

            if (custByEmail) {
              setCustomerRecord(custByEmail);
              const { data: invs } = await getInvoices({ customerId: custByEmail.id });
              if (invs) setInvoices(invs);
            }
          }
        }
      } catch (err) {
        console.error("Error loading customer invoices:", err);
      } finally {
        setLoading(false);
      }
    }

    loadCustomerInvoices();
  }, [user]);

  const openInvoiceDetail = async (inv: any) => {
    setSelectedInvoice(inv);
    const detail = await getInvoiceById(inv.id);
    if (detail.data) setSelectedInvoice(detail.data);
  };

  const handlePrint = () => {
    window.print();
  };

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
            {customerRecord ? (
              <>
                Download receipts and review payment settlement records for{" "}
                <span className="font-semibold text-zinc-800">{customerRecord.name}</span>.
              </>
            ) : (
              "Download receipts and review settlement history."
            )}
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
        PostgreSQL Row Level Security ensures that only invoice and payment records associated with your account are returned.
      </Alert>

      {!user ? (
        <Card className="p-8 text-center space-y-3">
          <h3 className="text-sm font-semibold text-zinc-900">
            Sign In to View Your Invoices
          </h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            Please log in with your verified customer credentials to view your billing statements and payment receipts.
          </p>
          <Link href="/auth/login">
            <Button size="sm">
              <LogIn className="h-3.5 w-3.5" /> Sign In
            </Button>
          </Link>
        </Card>
      ) : loading ? (
        <Card className="p-8 text-center text-xs text-zinc-500">
          Loading billing statements from database...
        </Card>
      ) : invoices.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="No Invoices on File"
          description="You do not currently have any generated invoices. Invoices will appear here once your active subscription completes a billing cycle."
        />
      ) : (
        <Card className="p-0 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Subscription</TableHead>
                <TableHead>Period</TableHead>
                <TableHead className="text-right">Subtotal</TableHead>
                <TableHead className="text-right">Discount</TableHead>
                <TableHead className="text-right">Tax</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Balance Due</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell className="font-mono text-xs font-semibold text-zinc-900">
                    {inv.invoice_number}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-zinc-600">
                    {inv.subscription?.subscription_number || "—"}
                  </TableCell>
                  <TableCell className="text-zinc-600 font-mono text-xs">
                    {inv.period_start} → {inv.period_end}
                  </TableCell>
                  <TableCell className="text-right font-mono text-zinc-700">
                    ${Number(inv.subtotal).toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-emerald-700">
                    {Number(inv.discount_total) > 0 ? `-$${Number(inv.discount_total).toFixed(2)}` : "$0.00"}
                  </TableCell>
                  <TableCell className="text-right font-mono text-zinc-600">
                    ${Number(inv.tax_total).toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right font-mono font-semibold text-zinc-900">
                    ${Number(inv.total).toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right font-mono font-bold text-xs text-zinc-900">
                    {inv.status === "paid" ? (
                      <span className="text-emerald-700 font-normal">$0.00</span>
                    ) : (
                      `$${Number(inv.balanceRemaining || inv.total).toFixed(2)}`
                    )}
                  </TableCell>
                  <TableCell>
                    {inv.status === "paid" ? (
                      <Badge variant="success">Paid</Badge>
                    ) : inv.isOverdue ? (
                      <Badge variant="danger">Overdue</Badge>
                    ) : inv.status === "confirmed" ? (
                      <Badge variant="accent">Due</Badge>
                    ) : (
                      <Badge variant="neutral">{inv.status}</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openInvoiceDetail(inv)}
                      className="text-xs px-2 py-0.5 h-7"
                    >
                      <Printer className="h-3.5 w-3.5 mr-1" />
                      View / Print
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Printable Invoice Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-xl bg-white rounded-lg shadow-2xl p-6 overflow-y-auto max-h-[90vh] space-y-6 border border-zinc-200">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-200">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold font-mono text-zinc-900">
                    {selectedInvoice.invoice_number}
                  </span>
                  <Badge variant={selectedInvoice.status === "paid" ? "success" : "neutral"}>
                    {selectedInvoice.status.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Statement for {customerRecord?.name || selectedInvoice.customer?.name}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={handlePrint}>
                  <Printer className="h-3.5 w-3.5" />
                  Print / Save PDF
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setSelectedInvoice(null)}>
                  Close
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs p-3 bg-zinc-50 rounded border border-zinc-200">
              <div>
                <span className="text-zinc-500 block">Subscription:</span>
                <span className="font-mono font-medium text-zinc-800">
                  {selectedInvoice.subscription?.subscription_number || "—"}
                </span>
              </div>
              <div>
                <span className="text-zinc-500 block">Billing Period:</span>
                <span className="font-mono font-medium text-zinc-800">
                  {selectedInvoice.period_start} → {selectedInvoice.period_end}
                </span>
              </div>
            </div>

            {/* Line items */}
            <div>
              <h4 className="text-xs font-semibold text-zinc-800 uppercase tracking-wider mb-2">
                Itemized Services
              </h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
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
                        <TableCell className="text-center font-mono text-xs">{l.quantity}</TableCell>
                        <TableCell className="text-right font-mono text-xs">${Number(l.unit_price).toFixed(2)}</TableCell>
                        <TableCell className="text-right font-mono text-xs text-zinc-600">{Number(l.tax_rate)}%</TableCell>
                        <TableCell className="text-right font-mono text-xs font-semibold text-zinc-900">
                          ${Number(l.line_total).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-xs text-zinc-400 py-3">
                        No lines recorded.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Totals */}
            <div className="flex justify-end pt-2 border-t border-zinc-100 text-xs">
              <div className="w-64 space-y-1.5">
                <div className="flex justify-between text-zinc-600">
                  <span>Subtotal:</span>
                  <span className="font-mono">${Number(selectedInvoice.subtotal).toFixed(2)}</span>
                </div>
                {Number(selectedInvoice.discount_total) > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Discount Applied:</span>
                    <span className="font-mono">-${Number(selectedInvoice.discount_total).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-zinc-600">
                  <span>Tax:</span>
                  <span className="font-mono">${Number(selectedInvoice.tax_total).toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t border-zinc-200 pt-1.5 text-sm font-bold text-zinc-900">
                  <span>Invoice Total:</span>
                  <span className="font-mono">${Number(selectedInvoice.total).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Payments */}
            {selectedInvoice.payments && selectedInvoice.payments.length > 0 && (
              <div className="pt-2 border-t border-zinc-100">
                <h4 className="text-xs font-semibold text-zinc-800 uppercase tracking-wider mb-2">
                  Payment History
                </h4>
                <div className="space-y-1.5 text-xs">
                  {selectedInvoice.payments.map((p: any) => (
                    <div key={p.id} className="flex justify-between p-2 rounded bg-zinc-50 border border-zinc-200">
                      <div>
                        <span className="capitalize font-medium text-zinc-800">
                          {p.method?.replace("_", " ")}
                        </span>
                        <span className="text-zinc-400 ml-2 text-[11px]">
                          {new Date(p.paid_at).toLocaleDateString()}
                        </span>
                      </div>
                      <span className="font-mono font-bold text-emerald-800">
                        ${Number(p.amount).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
