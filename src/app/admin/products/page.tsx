"use client";

import React, { useState } from "react";
import { Package, Plus, Search, Filter, Check } from "lucide-react";
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

interface DemoProduct {
  id: string;
  name: string;
  type: string;
  salesPrice: number;
  costPrice: number;
  variantsCount: number;
  active: boolean;
  notes: string;
}

const initialProducts: DemoProduct[] = [
  {
    id: "prod-1",
    name: "Enterprise Dedicated Server",
    type: "subscription",
    salesPrice: 450.0,
    costPrice: 210.0,
    variantsCount: 3,
    active: true,
    notes: "High memory & redundant bandwidth tier",
  },
  {
    id: "prod-2",
    name: "Business Cloud Storage",
    type: "subscription",
    salesPrice: 89.0,
    costPrice: 32.0,
    variantsCount: 2,
    active: true,
    notes: "1TB base tier with incremental block adjustments",
  },
  {
    id: "prod-3",
    name: "Priority SLA Support Package",
    type: "subscription",
    salesPrice: 199.0,
    costPrice: 75.0,
    variantsCount: 1,
    active: true,
    notes: "24/7 15-minute response SLA",
  },
  {
    id: "prod-4",
    name: "Legacy Hosting Appliance",
    type: "subscription",
    salesPrice: 120.0,
    costPrice: 60.0,
    variantsCount: 0,
    active: false,
    notes: "Grandfathered tier — discontinued for new quotes",
  },
];

export default function AdminProductsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);

  const filtered = initialProducts.filter((p) => {
    const matchesSearch = p.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all"
        ? true
        : statusFilter === "active"
        ? p.active
        : !p.active;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-zinc-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-zinc-900">
              Products &amp; Variants
            </h1>
            <Badge variant="danger">Admin Destination</Badge>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Configure catalog products, base sales prices, cost tracking, and variant pricing adjustments.
          </p>
        </div>
        <Button size="sm" onClick={() => setShowAddModal(true)}>
          <Plus className="h-3.5 w-3.5" />
          Add Product
        </Button>
      </div>

      <Alert variant="info" title="Phase 1 Foundation Layout">
        This screen demonstrates the full catalog layout with pricing formulas. In Phase 4, product persistence will be wired to the Supabase PostgreSQL database tables.
      </Alert>

      {/* Filter Bar */}
      <Card className="p-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md border border-zinc-300 focus:outline-none focus:ring-1 focus:ring-teal-700"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto ml-auto">
            <span className="text-xs text-zinc-500">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs rounded border border-zinc-300 py-1.5 px-2 bg-white"
            >
              <option value="all">All Products</option>
              <option value="active">Active Only</option>
              <option value="inactive">Archived Only</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Data Table */}
      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Sales Price</TableHead>
              <TableHead className="text-right">Cost Price</TableHead>
              <TableHead className="text-center">Variants</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((prod) => (
              <TableRow key={prod.id}>
                <TableCell className="font-medium text-zinc-900">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-zinc-400 shrink-0" />
                    <span>{prod.name}</span>
                  </div>
                </TableCell>
                <TableCell className="capitalize text-zinc-600">
                  {prod.type}
                </TableCell>
                <TableCell className="text-right font-mono font-medium text-zinc-900">
                  ${prod.salesPrice.toFixed(2)}
                </TableCell>
                <TableCell className="text-right font-mono text-zinc-500">
                  ${prod.costPrice.toFixed(2)}
                </TableCell>
                <TableCell className="text-center">
                  <span className="inline-block px-2 py-0.5 rounded text-[11px] bg-zinc-100 text-zinc-700">
                    {prod.variantsCount} configured
                  </span>
                </TableCell>
                <TableCell>
                  {prod.active ? (
                    <Badge variant="success">Active</Badge>
                  ) : (
                    <Badge variant="neutral">Archived</Badge>
                  )}
                </TableCell>
                <TableCell className="text-zinc-500 text-xs truncate max-w-xs">
                  {prod.notes}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Add Product Modal Mock */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-5 shadow-lg border border-zinc-200">
            <h3 className="text-sm font-semibold text-zinc-900 pb-3 border-b border-zinc-100">
              Add New Product (Admin Form)
            </h3>
            <div className="space-y-3 py-4">
              <Input label="Product Name" placeholder="e.g. Dedicated Fiber Connection" />
              <div className="grid grid-cols-2 gap-3">
                <Input label="Sales Price ($)" type="number" defaultValue="299.00" />
                <Input label="Cost Price ($)" type="number" defaultValue="150.00" />
              </div>
              <Select
                label="Product Type"
                options={[
                  { value: "subscription", label: "Recurring Subscription" },
                  { value: "one_time", label: "One-Time Setup Fee" },
                  { value: "addon", label: "Metered Add-on" },
                ]}
              />
              <Input label="Internal Notes" placeholder="Catalog remarks for billing staff" />
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100">
              <Button size="sm" variant="ghost" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  alert("Product form is structurally validated. Persistence will be activated in Phase 4.");
                  setShowAddModal(false);
                }}
              >
                Save Product
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
