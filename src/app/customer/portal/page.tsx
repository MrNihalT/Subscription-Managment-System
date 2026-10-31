"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Layers, FileText, Calendar, CreditCard, ArrowRight, ShieldCheck, LogIn } from "lucide-react";
import { Card } from "@/components/ui/Card";
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
import { EmptyState } from "@/components/ui/EmptyState";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { getSubscriptions } from "@/lib/services/subscriptions";

export default function CustomerPortalPage() {
  const { user, profile } = useAuth();
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [customerRecord, setCustomerRecord] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCustomerData() {
      if (!supabase) return;
      setLoading(true);

      try {
        if (user) {
          // 1. Fetch customer linked to this authenticated auth user
          const { data: cust } = await supabase
            .from("customers")
            .select("*")
            .eq("auth_user_id", user.id)
            .single();

          if (cust) {
            setCustomerRecord(cust);
            // 2. Fetch subscriptions strictly belonging to this customer
            const { data: subs } = await getSubscriptions(cust.id);
            if (subs) setSubscriptions(subs);
          } else {
            // Customer record might have same email if not yet linked
            const { data: custByEmail } = await supabase
              .from("customers")
              .select("*")
              .eq("email", user.email || "")
              .single();

            if (custByEmail) {
              setCustomerRecord(custByEmail);
              const { data: subs } = await getSubscriptions(custByEmail.id);
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

    loadCustomerData();
  }, [user]);

  const activeSubscriptions = subscriptions.filter((s) => s.status === "active");
  const totalMonthlyRecurring = activeSubscriptions.reduce(
    (sum, s) => sum + Number(s.grandTotal || 0),
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-zinc-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-zinc-900">
              Customer Account Portal
            </h1>
            <Badge variant="success">Customer Portal</Badge>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            {customerRecord ? (
              <>
                Account for <span className="font-semibold text-zinc-800">{customerRecord.name}</span> ({customerRecord.email})
              </>
            ) : (
              "Self-service portal for active subscription plans, renewals, and billing records."
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/customer/subscriptions">
            <Button size="sm" variant="outline">
              All My Subscriptions
            </Button>
          </Link>
          <Link href="/customer/invoices">
            <Button size="sm">
              My Invoices
            </Button>
          </Link>
        </div>
      </div>

      <Alert variant="info" title="Row Level Security (RLS) Active">
        You are authenticated via Supabase. All database queries are filtered strictly by PostgreSQL Row Level Security to your authorized customer record.
      </Alert>

      {!user ? (
        <Card className="p-8 text-center space-y-3">
          <h3 className="text-sm font-semibold text-zinc-900">
            Sign In to View Your Subscriptions
          </h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            You are currently viewing in preview mode. Sign in with your customer account to view your live contracts.
          </p>
          <Link href="/auth/login">
            <Button size="sm">
              <LogIn className="h-3.5 w-3.5" /> Sign In
            </Button>
          </Link>
        </Card>
      ) : loading ? (
        <Card className="p-8 text-center text-xs text-zinc-500">
          Loading your active subscriptions from database...
        </Card>
      ) : (
        <>
          {/* Summary KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-zinc-500">Active Subscriptions</p>
                <Layers className="h-4 w-4 text-teal-700" />
              </div>
              <p className="mt-2 text-2xl font-semibold text-zinc-900 tracking-tight">
                {activeSubscriptions.length} {activeSubscriptions.length === 1 ? "Plan" : "Plans"}
              </p>
              <p className="mt-1 text-[11px] text-zinc-500">
                {subscriptions.length} total records on file
              </p>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-zinc-500">Recurring Billing Total</p>
                <Calendar className="h-4 w-4 text-zinc-400" />
              </div>
              <p className="mt-2 text-2xl font-semibold text-zinc-900 tracking-tight font-mono">
                ${totalMonthlyRecurring.toFixed(2)}
              </p>
              <p className="mt-1 text-[11px] text-zinc-500">
                Current active contract total
              </p>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-zinc-500">Account Standing</p>
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
              </div>
              <p className="mt-2 text-2xl font-semibold text-emerald-800 tracking-tight">
                Verified Customer
              </p>
              <p className="mt-1 text-[11px] text-emerald-700">
                RLS-isolated session
              </p>
            </Card>
          </div>

          {/* Subscriptions Table */}
          {subscriptions.length === 0 ? (
            <EmptyState
              icon={Layers}
              title="No Subscriptions on File"
              description="You do not currently have any active subscriptions or open quotations. Contact billing staff to issue a new quotation."
            />
          ) : (
            <Card className="p-0 overflow-hidden">
              <div className="p-4 border-b border-zinc-200 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900">
                    My Subscribed Services &amp; Contracts
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Contract lifecycle and variant pricing details
                  </p>
                </div>
                <Link
                  href="/customer/subscriptions"
                  className="text-xs text-teal-700 font-medium hover:underline flex items-center gap-1"
                >
                  View full details <ArrowRight className="h-3 w-3" />
                </Link>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subscription #</TableHead>
                    <TableHead>Plan Name</TableHead>
                    <TableHead>Billing Cycle</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>Expiry / Renewal</TableHead>
                    <TableHead className="text-right">Recurring Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscriptions.map((sub) => (
                    <TableRow key={sub.id}>
                      <TableCell className="font-mono text-xs font-semibold text-zinc-900">
                        {sub.subscription_number}
                      </TableCell>
                      <TableCell className="font-medium text-zinc-900">
                        {sub.plan?.name}
                      </TableCell>
                      <TableCell className="capitalize text-zinc-600 text-xs">
                        {sub.plan?.billing_interval}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-zinc-600">
                        {sub.start_date}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-zinc-600">
                        {sub.expiry_date || "Ongoing"}
                      </TableCell>
                      <TableCell className="text-right font-mono font-medium text-zinc-900">
                        ${Number(sub.grandTotal || 0).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            sub.status === "active"
                              ? "success"
                              : sub.status === "confirmed"
                              ? "accent"
                              : sub.status === "paused"
                              ? "warning"
                              : "neutral"
                          }
                        >
                          {sub.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
