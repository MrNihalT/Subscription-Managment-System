"use client";

import React, { useState } from "react";
import { FileText, Plus, Search, Filter, Layers, CheckCircle, ArrowRight } from "lucide-react";
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
import { SubscriptionStatus } from "@/types";

interface DemoSub {
  id: string;
  subscriptionNumber: string;
  customerName: string;
  planName: string;
  interval: string;
  startDate: string;
  expiryDate?: string;
  grandTotal: number;
  status: SubscriptionStatus;
}

const initialSubscriptions: DemoSub[] = [
  {
    id: "sub-1",
    subscriptionNumber: "SUB-2026-0891",
    customerName: "Acme Logistics Ltd",
    planName: "Enterprise Dedicated (Monthly)",
    interval: "monthly",
    startDate: "2026-09-01",
    expiryDate: "2027-09-01",
    grandTotal: 1450.0,
    status: "active",
  },
  {
    id: "sub-2",
    subscriptionNumber: "SUB-2026-0890",
    customerName: "Northwind Traders",
    planName: "Standard Business (Yearly)",
    interval: "yearly",
    startDate: "2026-10-15",
    expiryDate: "2027-10-15",
    grandTotal: 4200.0,
    status: "quotation",
  },
  {
    id: "sub-3",
    subscriptionNumber: "SUB-2026-0889",
    customerName: "Global Tech Systems",
    planName: "SaaS Growth Plan",
    interval: "monthly",
    startDate: "2026-08-01",
    expiryDate: "2027-08-01",
    grandTotal: 850.0,
    status: "paused",
  },
  {
    id: "sub-4",
    subscriptionNumber: "SUB-2026-0888",
    customerName: "Apex Retail Solutions",
    planName: "Starter API Access",
    interval: "monthly",
    startDate: "2026-10-25",
    expiryDate: "2027-10-25",
    grandTotal: 220.0,
    status: "draft",
  },
  {
    id: "sub-5",
    subscriptionNumber: "SUB-2026-0887",
    customerName: "Pinnacle Manufacturing",
    planName: "Enterprise Dedicated (Monthly)",
    interval: "monthly",
    startDate: "2025-10-01",
    expiryDate: "2026-10-01",
    grandTotal: 1450.0,
    status: "closed",
  },
];

export default function StaffSubscriptionsPage() {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = initialSubscriptions.filter((s) => {
    const matchesTab = activeTab === "all" ? true : s.status === activeTab;
    const matchesSearch =
      s.subscriptionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.planName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const getStatusBadge = (status: SubscriptionStatus) => {
    switch (status) {
      case "active":
        return <Badge variant="success">Active</Badge>;
      case "confirmed":
        return <Badge variant="accent">Confirmed</Badge>;
      case "quotation":
        return <Badge variant="accent">Quotation</Badge>;
      case "draft":
        return <Badge variant="neutral">Draft</Badge>;
      case "paused":
        return <Badge variant="warning">Paused</Badge>;
      case "closed":
        return <Badge variant="danger">Closed</Badge>;
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
              Quotes &amp; Subscriptions
            </h1>
            <Badge variant="accent">Staff Destination</Badge>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Manage quote creation, line items, price calculations, and the complete subscription lifecycle.
          </p>
        </div>
        <Button size="sm">
          <Plus className="h-3.5 w-3.5" />
          Create Quote / Subscription
        </Button>
      </div>

      {/* Lifecycle Flow Tracker Notice */}
      <div className="rounded-lg border border-zinc-200 bg-white p-3 text-xs">
        <p className="font-semibold text-zinc-900 mb-2">Agreed Subscription Lifecycle</p>
        <div className="flex flex-wrap items-center gap-2 text-zinc-600">
          <span className="font-medium text-zinc-800 bg-zinc-100 px-2 py-0.5 rounded">1. Draft</span>
          <ArrowRight className="h-3.5 w-3.5 text-zinc-400" />
          <span className="font-medium text-teal-800 bg-teal-50 px-2 py-0.5 rounded">2. Quotation</span>
          <ArrowRight className="h-3.5 w-3.5 text-zinc-400" />
          <span className="font-medium text-zinc-800 bg-zinc-100 px-2 py-0.5 rounded">3. Confirmed</span>
          <ArrowRight className="h-3.5 w-3.5 text-zinc-400" />
          <span className="font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">4. Active</span>
          <ArrowRight className="h-3.5 w-3.5 text-zinc-400" />
          <span className="font-medium text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded">Paused / Closed</span>
        </div>
      </div>

      {/* Filter Tabs and Search */}
      <Card className="p-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1">
            {[
              { id: "all", label: "All Records" },
              { id: "draft", label: "Draft" },
              { id: "quotation", label: "Quotation" },
              { id: "active", label: "Active" },
              { id: "paused", label: "Paused" },
              { id: "closed", label: "Closed" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                  activeTab === tab.id
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
              placeholder="Search subscription or client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md border border-zinc-300 focus:outline-none focus:ring-1 focus:ring-teal-700"
            />
          </div>
        </div>
      </Card>

      {/* Subscriptions Table */}
      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Subscription #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Interval</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead className="text-right">Grand Total</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((sub) => (
              <TableRow key={sub.id}>
                <TableCell className="font-mono text-xs font-semibold text-zinc-900">
                  {sub.subscriptionNumber}
                </TableCell>
                <TableCell className="font-medium text-zinc-900">
                  {sub.customerName}
                </TableCell>
                <TableCell className="text-zinc-600">
                  {sub.planName}
                </TableCell>
                <TableCell className="capitalize text-zinc-600">
                  {sub.interval}
                </TableCell>
                <TableCell className="font-mono text-xs text-zinc-600">
                  {sub.startDate}
                </TableCell>
                <TableCell className="text-right font-mono font-medium text-zinc-900">
                  ${sub.grandTotal.toFixed(2)}
                </TableCell>
                <TableCell>{getStatusBadge(sub.status)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
