"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Layers, ArrowLeft, Calendar, FileText, CheckCircle2, ShieldCheck, LogIn, AlertCircle } from "lucide-react";
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
import { getSubscriptions } from "@/lib/services/subscriptions";

export default function CustomerSubscriptionsPage() {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [customerRecord, setCustomerRecord] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCustomerSubscriptions() {
      if (!supabase) return;
      setLoading(true);

      try {
        if (user) {
          // Fetch customer record linked to auth user
          const { data: cust } = await supabase
            .from("customers")
            .select("*")
            .eq("auth_user_id", user.id)
            .single();

          let targetCust = cust;
          if (!targetCust) {
            const { data: custByEmail } = await supabase
              .from("customers")
              .select("*")
              .eq("email", user.email || "")
              .single();
            targetCust = custByEmail;
          }

          if (targetCust) {
            setCustomerRecord(targetCust);

            // Fetch with direct authenticated client session
            const { data: directSubs } = await supabase
              .from("subscriptions")
              .select(`
                *,
                plan:plans(
                  id,
                  name,
                  billing_interval,
                  price,
                  allow_pause,
                  allow_early_close,
                  allow_renewal,
                  product:products(id, name)
                ),
                lines:subscription_lines(
                  id,
                  product_id,
                  variant_id,
                  description,
                  quantity,
                  unit_price,
                  tax_rate,
                  variant:product_variants(id, name, price_adjustment)
                )
              `)
              .eq("customer_id", targetCust.id)
              .order("created_at", { ascending: false });

            if (directSubs && directSubs.length > 0) {
              const enriched = directSubs.map((sub: any) => {
                let subtotal = 0;
                let taxTotal = 0;
                (sub.lines || []).forEach((line: any) => {
                  const lineSub = Number(line.quantity) * Number(line.unit_price);
                  const lineTax = lineSub * (Number(line.tax_rate) / 100);
                  subtotal += lineSub;
                  taxTotal += lineTax;
                });
                return {
                  ...sub,
                  linesTotal: subtotal,
                  taxTotal,
                  grandTotal: subtotal + taxTotal,
                };
              });
              setSubscriptions(enriched);
            } else {
              // Server action fallback
              const { data: subs } = await getSubscriptions(targetCust.id);
              if (subs) setSubscriptions(subs);
            }
          }
        }
      } catch (err) {
        console.error("Error loading customer subscriptions:", err);
      } finally {
        setLoading(false);
      }
    }

    loadCustomerSubscriptions();
  }, [user]);

  function getStatusBadgeVariant(status: string): "neutral" | "success" | "warning" | "danger" | "accent" | "outline" {
    switch (status) {
      case "active":
        return "success";
      case "confirmed":
        return "accent";
      case "quotation":
        return "neutral";
      case "paused":
        return "warning";
      case "closed":
      case "expired":
        return "danger";
      default:
        return "neutral";
    }
  }

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
            {customerRecord ? (
              <>
                Active services, line items, billing intervals, and contracts for{" "}
                <span className="font-semibold text-zinc-800">{customerRecord.name}</span>.
              </>
            ) : (
              "Review active services, line items, billing intervals, and renewal dates."
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

      <Alert variant="info" title="Row Level Security (RLS) Enforced">
        PostgreSQL Row Level Security ensures only subscription records associated with your authorized customer profile are queried.
      </Alert>

      {!user ? (
        <Card className="p-8 text-center space-y-3">
          <h3 className="text-sm font-semibold text-zinc-900">
            Sign In to View Your Subscriptions
          </h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            You must be signed in with your customer account to view your subscriptions and itemized lines.
          </p>
          <Link href="/auth/login">
            <Button size="sm">
              <LogIn className="h-3.5 w-3.5" /> Sign In
            </Button>
          </Link>
        </Card>
      ) : loading ? (
        <Card className="p-8 text-center text-xs text-zinc-500">
          Loading subscription contracts from database...
        </Card>
      ) : subscriptions.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="No Subscriptions Found"
          description="You do not currently have any subscriptions or quotations associated with your customer account."
        />
      ) : (
        <div className="space-y-6">
          {subscriptions.map((sub) => {
            const planInterval = sub.plan?.billing_interval || "monthly";
            return (
              <Card key={sub.id} className="space-y-4">
                {/* Header info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-sm text-zinc-900">
                        {sub.subscription_number}
                      </span>
                      <Badge variant={getStatusBadgeVariant(sub.status)}>
                        {sub.status.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Plan: <span className="font-medium text-zinc-800">{sub.plan?.name || "Standard Plan"}</span>{" "}
                      • Billing Cycle: <span className="capitalize font-medium text-zinc-800">{planInterval}</span>{" "}
                      • Started {sub.start_date}
                      {sub.expiry_date && ` • Renews / Expires ${sub.expiry_date}`}
                    </p>
                  </div>
                  <div className="sm:text-right">
                    <p className="text-xs text-zinc-500">Recurring Total</p>
                    <p className="text-lg font-bold font-mono text-zinc-900">
                      ${Number(sub.grandTotal || 0).toFixed(2)}
                      <span className="text-xs font-normal text-zinc-500">
                        {" "}/ {planInterval}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Line Items Table */}
                <div>
                  <h4 className="text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-2">
                    Included Product Lines &amp; Pricing
                  </h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Line Item / Service</TableHead>
                        <TableHead className="text-center">Qty</TableHead>
                        <TableHead className="text-right">Unit Price</TableHead>
                        <TableHead className="text-right">Tax Rate</TableHead>
                        <TableHead className="text-right">Line Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sub.lines && sub.lines.length > 0 ? (
                        sub.lines.map((line: any) => {
                          const lineSub = Number(line.quantity) * Number(line.unit_price);
                          const lineTax = lineSub * (Number(line.tax_rate) / 100);
                          const lineTotal = lineSub + lineTax;

                          return (
                            <TableRow key={line.id}>
                              <TableCell className="font-medium text-zinc-900">
                                <div>
                                  <span>{line.description}</span>
                                  {line.variant && (
                                    <div className="mt-0.5 flex items-center gap-1.5">
                                      <Badge variant="neutral" className="text-[10px] py-0 px-1.5">
                                        Variant: {line.variant.name}
                                      </Badge>
                                      {Number(line.variant.price_adjustment) !== 0 && (
                                        <span className="text-[11px] text-zinc-500">
                                          ({Number(line.variant.price_adjustment) > 0 ? "+" : ""}${Number(line.variant.price_adjustment).toFixed(2)})
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="text-center font-mono">
                                {line.quantity}
                              </TableCell>
                              <TableCell className="text-right font-mono">
                                ${Number(line.unit_price).toFixed(2)}
                              </TableCell>
                              <TableCell className="text-right font-mono text-zinc-600">
                                {line.tax_rate}%
                              </TableCell>
                              <TableCell className="text-right font-mono font-medium text-zinc-900">
                                ${lineTotal.toFixed(2)}
                              </TableCell>
                            </TableRow>
                          );
                        })
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-xs text-zinc-400 py-4">
                            No product lines recorded for this subscription.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Financial Summary & Policy Notes */}
                <div className="pt-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-t border-zinc-100 text-xs">
                  <div className="flex flex-wrap items-center gap-3 text-zinc-500">
                    <span>Payment Terms: <span className="font-medium text-zinc-700">{sub.payment_terms || "Net 30"}</span></span>
                    <span>•</span>
                    <span>Early Close: <span className="font-medium text-zinc-700">{sub.plan?.allow_early_close ? "Permitted" : "Restricted"}</span></span>
                    <span>•</span>
                    <span>Pause: <span className="font-medium text-zinc-700">{sub.plan?.allow_pause ? "Permitted" : "Restricted"}</span></span>
                  </div>

                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <span className="text-zinc-500">Subtotal: </span>
                      <span className="font-mono font-medium text-zinc-800">${Number(sub.linesTotal || 0).toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500">Tax: </span>
                      <span className="font-mono font-medium text-zinc-800">${Number(sub.taxTotal || 0).toFixed(2)}</span>
                    </div>
                    <div className="border-l border-zinc-200 pl-4">
                      <span className="text-zinc-500 font-medium">Cycle Total: </span>
                      <span className="font-mono font-bold text-zinc-900">${Number(sub.grandTotal || 0).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
