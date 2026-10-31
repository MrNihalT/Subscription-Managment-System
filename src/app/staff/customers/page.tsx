"use client";

import React, { useState } from "react";
import { Building2, Search, Plus, Mail, Layers } from "lucide-react";
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

interface CustomerRecord {
  id: string;
  name: string;
  email: string;
  activeSubscriptions: number;
  totalInvoiced: number;
  createdAt: string;
}

const customerRecords: CustomerRecord[] = [
  {
    id: "cust-1",
    name: "Acme Logistics Ltd",
    email: "billing@acmelogistics.com",
    activeSubscriptions: 2,
    totalInvoiced: 17400.0,
    createdAt: "2026-08-14",
  },
  {
    id: "cust-2",
    name: "Northwind Traders",
    email: "accounts@northwind.io",
    activeSubscriptions: 1,
    totalInvoiced: 50400.0,
    createdAt: "2026-09-02",
  },
  {
    id: "cust-3",
    name: "Global Tech Systems",
    email: "finance@globaltech.org",
    activeSubscriptions: 3,
    totalInvoiced: 28900.0,
    createdAt: "2026-09-20",
  },
  {
    id: "cust-4",
    name: "Apex Retail Solutions",
    email: "support@apexretail.co",
    activeSubscriptions: 1,
    totalInvoiced: 2640.0,
    createdAt: "2026-10-05",
  },
];

export default function StaffCustomersPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = customerRecords.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-zinc-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-zinc-900">
              Customers Directory
            </h1>
            <Badge variant="accent">Staff Destination</Badge>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Browse and manage customer client records, active subscription accounts, and billing contact emails.
          </p>
        </div>
        <Button size="sm">
          <Plus className="h-3.5 w-3.5" />
          Register Customer
        </Button>
      </div>

      <Card className="p-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-400" />
          <input
            type="text"
            placeholder="Search by company name or billing email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md border border-zinc-300 focus:outline-none focus:ring-1 focus:ring-teal-700"
          />
        </div>
      </Card>

      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer / Company</TableHead>
              <TableHead>Billing Email</TableHead>
              <TableHead className="text-center">Active Subs</TableHead>
              <TableHead className="text-right">Total Invoiced</TableHead>
              <TableHead>Customer Since</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((cust) => (
              <TableRow key={cust.id}>
                <TableCell className="font-medium text-zinc-900">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-zinc-400 shrink-0" />
                    <span>{cust.name}</span>
                  </div>
                </TableCell>
                <TableCell className="font-mono text-zinc-600">
                  {cust.email}
                </TableCell>
                <TableCell className="text-center font-mono">
                  <Badge variant="accent">{cust.activeSubscriptions}</Badge>
                </TableCell>
                <TableCell className="text-right font-mono font-medium text-zinc-900">
                  ${cust.totalInvoiced.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell className="text-zinc-600 font-mono text-xs">
                  {cust.createdAt}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
