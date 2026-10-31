"use client";

import React, { useState, useEffect } from "react";
import { Percent, Plus, Tag, Calendar, Edit2, AlertCircle, CheckCircle2, Search, Sparkles } from "lucide-react";
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
import { getDiscounts, createDiscount, updateDiscount, DiscountInput } from "@/lib/services/discounts";
import { getProducts } from "@/lib/services/products";

export default function AdminDiscountsPage() {
  const [discounts, setDiscounts] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [today, setToday] = useState("");

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [alertState, setAlertState] = useState<{ type: "success" | "danger"; msg: string } | null>(null);

  const [formData, setFormData] = useState<DiscountInput>({
    name: "",
    discount_type: "percentage",
    value: 10,
    minimum_purchase: 0,
    minimum_quantity: 1,
    starts_at: "",
    ends_at: "",
    usage_limit: null,
    product_id: null,
    active: true,
  });

  const loadData = async () => {
    setLoading(true);
    const [discRes, prodRes] = await Promise.all([
      getDiscounts(),
      getProducts(),
    ]);

    if (discRes.data) setDiscounts(discRes.data);
    if (prodRes.data) setProducts(prodRes.data);
    setLoading(false);
  };

  useEffect(() => {
    setToday(new Date().toISOString().split("T")[0]);
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingDiscount(null);
    setFormData({
      name: "",
      discount_type: "percentage",
      value: 15,
      minimum_purchase: 0,
      minimum_quantity: 1,
      starts_at: "",
      ends_at: "",
      usage_limit: 100,
      product_id: null,
      active: true,
    });
    setAlertState(null);
    setModalOpen(true);
  };

  const openEditModal = (d: any) => {
    setEditingDiscount(d);
    setFormData({
      name: d.name,
      discount_type: d.discount_type,
      value: Number(d.value),
      minimum_purchase: Number(d.minimum_purchase || 0),
      minimum_quantity: Number(d.minimum_quantity || 1),
      starts_at: d.starts_at || "",
      ends_at: d.ends_at || "",
      usage_limit: d.usage_limit ? Number(d.usage_limit) : null,
      product_id: d.product_id || null,
      active: d.active,
    });
    setAlertState(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setAlertState({ type: "danger", msg: "Discount rule name is required." });
      return;
    }

    setSubmitting(true);
    setAlertState(null);

    try {
      if (editingDiscount) {
        const res = await updateDiscount(editingDiscount.id, formData);
        if (res.error) {
          setAlertState({ type: "danger", msg: res.error });
        } else {
          setAlertState({ type: "success", msg: "Discount rule updated successfully." });
          await loadData();
          setTimeout(() => setModalOpen(false), 900);
        }
      } else {
        const res = await createDiscount(formData);
        if (res.error) {
          setAlertState({ type: "danger", msg: res.error });
        } else {
          setAlertState({ type: "success", msg: "Discount rule created successfully." });
          await loadData();
          setTimeout(() => setModalOpen(false), 900);
        }
      }
    } catch (err: any) {
      setAlertState({ type: "danger", msg: err.message || "Operation failed." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSeedDefaults = async () => {
    setSubmitting(true);
    try {
      await createDiscount({
        name: "Q4 High-Volume Corporate Credit",
        discount_type: "fixed",
        value: 100.0,
        minimum_purchase: 800.0,
        minimum_quantity: 1,
        usage_limit: 50,
        active: true,
      });
      await createDiscount({
        name: "Early-Adopter 15% Launch Incentive",
        discount_type: "percentage",
        value: 15.0,
        minimum_purchase: 200.0,
        minimum_quantity: 1,
        usage_limit: 100,
        active: true,
      });
      await loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };
  const filtered = discounts.filter((d) => {
    const matchesSearch =
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.product?.name && d.product.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const isExpired = d.ends_at && d.ends_at < today;
    const isExhausted = d.usage_limit && Number(d.uses_count) >= Number(d.usage_limit);

    if (statusFilter === "active") return matchesSearch && d.active && !isExpired && !isExhausted;
    if (statusFilter === "inactive") return matchesSearch && !d.active;
    if (statusFilter === "expired") return matchesSearch && (isExpired || isExhausted);
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-zinc-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-zinc-900">
              Discounts &amp; Promotional Rules
            </h1>
            <Badge variant="danger">Admin Destination</Badge>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Define fixed or percentage discounts with minimum thresholds, usage caps, product scope, and validity windows.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {discounts.length === 0 && !loading && (
            <Button size="sm" variant="outline" onClick={handleSeedDefaults} disabled={submitting}>
              <Sparkles className="h-3.5 w-3.5" />
              Seed Demo Discounts
            </Button>
          )}
          <Button size="sm" onClick={openCreateModal}>
            <Plus className="h-3.5 w-3.5" />
            Create Discount Rule
          </Button>
        </div>
      </div>

      <Alert variant="info" title="Automatic Application Engine">
        Eligible discounts automatically apply during invoice generation when the subscription meets min quantity or purchase thresholds. Expired or exhausted discounts stop applying.
      </Alert>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-400" />
            <Input
              placeholder="Search discount rules..."
              className="pl-8 text-xs"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto ml-auto">
            <span className="text-xs text-zinc-500">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs rounded border border-zinc-300 py-1.5 px-2 bg-white"
            >
              <option value="all">All Discounts</option>
              <option value="active">Active &amp; Valid</option>
              <option value="expired">Expired / Exhausted</option>
              <option value="inactive">Disabled / Inactive</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Table */}
      {loading ? (
        <Card className="p-8 text-center text-xs text-zinc-500">
          Loading discount rules from database...
        </Card>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Percent}
          title="No Discount Rules Found"
          description={
            searchTerm
              ? "No discounts matched your search."
              : "No discount rules are configured yet. Add your first promotional rule or seed demo discounts."
          }
          actionLabel="Create Discount Rule"
          onAction={openCreateModal}
        />
      ) : (
        <Card className="p-0 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rule Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Value</TableHead>
                <TableHead className="text-right">Min Purchase</TableHead>
                <TableHead className="text-center">Min Qty</TableHead>
                <TableHead>Scope</TableHead>
                <TableHead>Validity Period</TableHead>
                <TableHead className="text-center">Usage</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((disc) => {
                const isExpired = disc.ends_at && disc.ends_at < today;
                const isExhausted = disc.usage_limit && Number(disc.uses_count) >= Number(disc.usage_limit);

                return (
                  <TableRow key={disc.id}>
                    <TableCell className="font-medium text-zinc-900">
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-zinc-400 shrink-0" />
                        <span>{disc.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="capitalize text-zinc-600 text-xs">
                      {disc.discount_type}
                    </TableCell>
                    <TableCell className="text-right font-mono font-medium text-zinc-900">
                      {disc.discount_type === "percentage"
                        ? `${Number(disc.value)}%`
                        : `$${Number(disc.value).toFixed(2)}`}
                    </TableCell>
                    <TableCell className="text-right font-mono text-zinc-600">
                      ${Number(disc.minimum_purchase || 0).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-center font-mono">
                      {disc.minimum_quantity || 1}
                    </TableCell>
                    <TableCell className="text-xs text-zinc-600">
                      {disc.product ? (
                        <span className="font-medium text-teal-800">
                          Product: {disc.product.name}
                        </span>
                      ) : (
                        <span className="text-zinc-500">Entire Subscription</span>
                      )}
                    </TableCell>
                    <TableCell className="text-zinc-500 text-xs font-mono">
                      {disc.starts_at || disc.ends_at ? (
                        <span>
                          {disc.starts_at || "Start"} → {disc.ends_at || "Ongoing"}
                        </span>
                      ) : (
                        "Continuous"
                      )}
                    </TableCell>
                    <TableCell className="text-center text-xs font-mono">
                      {disc.uses_count || 0}
                      {disc.usage_limit ? ` / ${disc.usage_limit}` : " (unlimited)"}
                    </TableCell>
                    <TableCell>
                      {isExhausted ? (
                        <Badge variant="danger">Exhausted</Badge>
                      ) : isExpired ? (
                        <Badge variant="warning">Expired</Badge>
                      ) : disc.active ? (
                        <Badge variant="success">Active</Badge>
                      ) : (
                        <Badge variant="neutral">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openEditModal(disc)}
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Modal for Create/Edit */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl border border-zinc-200 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-semibold text-zinc-900 border-b border-zinc-100 pb-3 mb-4">
              {editingDiscount ? "Edit Discount Rule" : "Create Promotional Rule"}
            </h3>

            {alertState && (
              <div className="mb-4">
                <Alert variant={alertState.type}>
                  {alertState.msg}
                </Alert>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Rule Name *"
                placeholder="e.g. Q4 High-Volume Corporate Credit"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                disabled={submitting}
              />

              <div className="grid grid-cols-2 gap-3">
                <Select
                  label="Discount Type *"
                  value={formData.discount_type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      discount_type: e.target.value as "fixed" | "percentage",
                    })
                  }
                  options={[
                    { value: "percentage", label: "Percentage (%)" },
                    { value: "fixed", label: "Fixed Amount ($)" },
                  ]}
                  disabled={submitting}
                />
                <Input
                  label={formData.discount_type === "percentage" ? "Value (% max 100) *" : "Value ($) *"}
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={formData.discount_type === "percentage" ? "100" : undefined}
                  value={formData.value}
                  onChange={(e) =>
                    setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })
                  }
                  required
                  disabled={submitting}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Minimum Purchase ($)"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.minimum_purchase || 0}
                  onChange={(e) =>
                    setFormData({ ...formData, minimum_purchase: parseFloat(e.target.value) || 0 })
                  }
                  disabled={submitting}
                />
                <Input
                  label="Minimum Quantity"
                  type="number"
                  min="1"
                  value={formData.minimum_quantity || 1}
                  onChange={(e) =>
                    setFormData({ ...formData, minimum_quantity: parseInt(e.target.value) || 1 })
                  }
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">
                  Product Scope (Optional)
                </label>
                <select
                  value={formData.product_id || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, product_id: e.target.value || null })
                  }
                  className="w-full text-xs rounded border border-zinc-300 py-1.5 px-2 bg-white"
                  disabled={submitting}
                >
                  <option value="">Entire Subscription / Order</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      Product: {p.name}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-zinc-400 mt-1">
                  If selected, only line items with this specific product qualify for this discount.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Valid From"
                  type="date"
                  value={formData.starts_at || ""}
                  onChange={(e) => setFormData({ ...formData, starts_at: e.target.value || null })}
                  disabled={submitting}
                />
                <Input
                  label="Valid Until"
                  type="date"
                  value={formData.ends_at || ""}
                  onChange={(e) => setFormData({ ...formData, ends_at: e.target.value || null })}
                  disabled={submitting}
                />
              </div>

              <Input
                label="Usage Cap / Limit (Optional)"
                type="number"
                min="1"
                placeholder="Unlimited if left empty"
                value={formData.usage_limit || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    usage_limit: e.target.value ? parseInt(e.target.value) : null,
                  })
                }
                disabled={submitting}
              />

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="disc-active"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="rounded border-zinc-300 text-teal-700 focus:ring-teal-700"
                />
                <label htmlFor="disc-active" className="text-xs text-zinc-700 font-medium">
                  Active (available for automatic application)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-zinc-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setModalOpen(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={submitting}>
                  {submitting
                    ? "Saving..."
                    : editingDiscount
                    ? "Update Discount Rule"
                    : "Create Discount Rule"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
