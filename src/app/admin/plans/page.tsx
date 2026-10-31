"use client";

import React, { useState, useEffect } from "react";
import { Layers, Plus, Search, Edit3, Check, X, Calendar, DollarSign, Clock } from "lucide-react";
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
import { getPlans, createPlan, updatePlan, PlanInput } from "@/lib/services/plans";
import { getProducts } from "@/lib/services/products";
import { BillingInterval } from "@/types";

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [intervalFilter, setIntervalFilter] = useState("all");

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any | null>(null);
  const [formData, setFormData] = useState<PlanInput>({
    product_id: "",
    name: "",
    price: 99,
    billing_interval: "monthly",
    minimum_quantity: 1,
    available_from: null,
    available_until: null,
    allow_pause: true,
    allow_early_close: true,
    allow_renewal: true,
    active: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [alertState, setAlertState] = useState<{ type: "success" | "danger"; msg: string } | null>(null);

  const loadData = async () => {
    setLoading(true);
    const [plansRes, prodsRes] = await Promise.all([getPlans(), getProducts()]);
    if (plansRes.data) setPlans(plansRes.data);
    if (prodsRes.data) setProducts(prodsRes.data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = () => {
    setEditingPlan(null);
    setFormData({
      product_id: products[0]?.id || "",
      name: "",
      price: products[0]?.sales_price ? Number(products[0].sales_price) : 99,
      billing_interval: "monthly",
      minimum_quantity: 1,
      available_from: null,
      available_until: null,
      allow_pause: true,
      allow_early_close: true,
      allow_renewal: true,
      active: true,
    });
    setAlertState(null);
    setModalOpen(true);
  };

  const openEditModal = (plan: any) => {
    setEditingPlan(plan);
    setFormData({
      product_id: plan.product_id,
      name: plan.name,
      price: Number(plan.price),
      billing_interval: plan.billing_interval,
      minimum_quantity: Number(plan.minimum_quantity) || 1,
      available_from: plan.available_from || null,
      available_until: plan.available_until || null,
      allow_pause: plan.allow_pause,
      allow_early_close: plan.allow_early_close,
      allow_renewal: plan.allow_renewal,
      active: plan.active,
    });
    setAlertState(null);
    setModalOpen(true);
  };

  const handleProductSelect = (prodId: string) => {
    const selectedProd = products.find((p) => p.id === prodId);
    setFormData((prev) => ({
      ...prev,
      product_id: prodId,
      name: prev.name || (selectedProd ? `${selectedProd.name} (${prev.billing_interval})` : ""),
      price: selectedProd ? Number(selectedProd.sales_price) : prev.price,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setAlertState({ type: "danger", msg: "Plan name is required." });
      return;
    }
    if (!formData.product_id) {
      setAlertState({ type: "danger", msg: "Please select a catalog product." });
      return;
    }

    setSubmitting(true);
    setAlertState(null);

    try {
      if (editingPlan) {
        const res = await updatePlan(editingPlan.id, formData);
        if (res.error) {
          setAlertState({ type: "danger", msg: res.error });
        } else {
          setAlertState({ type: "success", msg: "Billing plan updated successfully." });
          await loadData();
          setTimeout(() => setModalOpen(false), 900);
        }
      } else {
        const res = await createPlan(formData);
        if (res.error) {
          setAlertState({ type: "danger", msg: res.error });
        } else {
          setAlertState({ type: "success", msg: "Billing plan created successfully." });
          await loadData();
          setTimeout(() => setModalOpen(false), 900);
        }
      }
    } catch (err: any) {
      setAlertState({ type: "danger", msg: err?.message || "Operation failed." });
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = plans.filter((plan) => {
    const matchesSearch =
      plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.product?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesInterval =
      intervalFilter === "all" ? true : plan.billing_interval === intervalFilter;
    return matchesSearch && matchesInterval;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-zinc-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-zinc-900">
              Billing Plans &amp; Cycles
            </h1>
            <Badge variant="danger">Admin</Badge>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Define recurring frequencies, minimum quantities, pause rules, early close, and renewal rules.
          </p>
        </div>
        <Button size="sm" onClick={openAddModal}>
          <Plus className="h-3.5 w-3.5" />
          Create Plan
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-400" />
            <input
              type="text"
              placeholder="Search plans or linked product..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md border border-zinc-300 focus:outline-none focus:ring-1 focus:ring-teal-700"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto ml-auto">
            <span className="text-xs text-zinc-500">Interval:</span>
            <select
              value={intervalFilter}
              onChange={(e) => setIntervalFilter(e.target.value)}
              className="text-xs rounded border border-zinc-300 py-1.5 px-2 bg-white"
            >
              <option value="all">All Intervals</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Plans Table */}
      {loading ? (
        <Card className="p-8 text-center text-xs text-zinc-500">
          Loading billing plans from database...
        </Card>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="No Billing Plans Found"
          description={
            searchTerm
              ? "No plans match your current search criteria."
              : "No recurring billing plans exist yet. Create a plan linked to a catalog product."
          }
          actionLabel="Create Plan"
          onAction={openAddModal}
        />
      ) : (
        <Card className="p-0 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plan Name</TableHead>
                <TableHead>Linked Product</TableHead>
                <TableHead>Interval</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-center">Min Qty</TableHead>
                <TableHead className="text-center">Pause</TableHead>
                <TableHead className="text-center">Early Close</TableHead>
                <TableHead className="text-center">Renewal</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell className="font-medium text-zinc-900">
                    <div className="flex items-center gap-2">
                      <Layers className="h-4 w-4 text-zinc-400 shrink-0" />
                      <div>
                        <span>{plan.name}</span>
                        {(plan.available_from || plan.available_until) && (
                          <p className="text-[10px] text-zinc-400 font-mono">
                            {plan.available_from || "Start"} → {plan.available_until || "Open"}
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-zinc-600 text-xs font-medium">
                    {plan.product?.name || "Unlinked Product"}
                  </TableCell>
                  <TableCell className="capitalize text-zinc-800 text-xs font-semibold">
                    {plan.billing_interval}
                  </TableCell>
                  <TableCell className="text-right font-mono font-medium text-zinc-900">
                    ${Number(plan.price).toFixed(2)}
                  </TableCell>
                  <TableCell className="text-center font-mono text-xs">
                    {plan.minimum_quantity}
                  </TableCell>
                  <TableCell className="text-center">
                    {plan.allow_pause ? (
                      <span className="text-emerald-700 font-semibold text-xs">Yes</span>
                    ) : (
                      <span className="text-zinc-400 text-xs">No</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {plan.allow_early_close ? (
                      <span className="text-emerald-700 font-semibold text-xs">Yes</span>
                    ) : (
                      <span className="text-zinc-400 text-xs">No</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {plan.allow_renewal ? (
                      <span className="text-emerald-700 font-semibold text-xs">Yes</span>
                    ) : (
                      <span className="text-zinc-400 text-xs">No</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={plan.active ? "success" : "neutral"}>
                      {plan.active ? "Active" : "Archived"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditModal(plan)}
                      title="Edit Plan Configuration"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Add / Edit Plan Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/50 p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl border border-zinc-200 my-8">
            <h3 className="text-sm font-semibold text-zinc-900 pb-3 border-b border-zinc-100">
              {editingPlan ? "Edit Billing Plan" : "Create Recurring Billing Plan"}
            </h3>

            {alertState && (
              <div className="mt-3">
                <Alert variant={alertState.type} title="Notice">
                  {alertState.msg}
                </Alert>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 py-3">
              <Select
                label="Linked Catalog Product *"
                required
                value={formData.product_id}
                onChange={(e) => handleProductSelect(e.target.value)}
                disabled={submitting || Boolean(editingPlan)}
              >
                {products.length === 0 ? (
                  <option value="">No products in catalog. Add product first.</option>
                ) : (
                  products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Base: ${Number(p.sales_price).toFixed(2)})
                    </option>
                  ))
                )}
              </Select>

              <Input
                label="Plan Display Name *"
                required
                placeholder="e.g. Enterprise Dedicated (Monthly)"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={submitting}
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Input
                  label="Plan Price ($) *"
                  type="number"
                  step="0.01"
                  required
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })
                  }
                  disabled={submitting}
                />
                <Select
                  label="Billing Interval *"
                  value={formData.billing_interval}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      billing_interval: e.target.value as BillingInterval,
                    })
                  }
                  options={[
                    { value: "daily", label: "Daily" },
                    { value: "weekly", label: "Weekly" },
                    { value: "monthly", label: "Monthly" },
                    { value: "yearly", label: "Yearly" },
                  ]}
                  disabled={submitting}
                />
                <Input
                  label="Min Quantity *"
                  type="number"
                  min="1"
                  required
                  value={formData.minimum_quantity}
                  onChange={(e) =>
                    setFormData({ ...formData, minimum_quantity: parseInt(e.target.value) || 1 })
                  }
                  disabled={submitting}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Available From"
                  type="date"
                  value={formData.available_from || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, available_from: e.target.value || null })
                  }
                  disabled={submitting}
                />
                <Input
                  label="Available Until"
                  type="date"
                  value={formData.available_until || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, available_until: e.target.value || null })
                  }
                  disabled={submitting}
                />
              </div>

              {/* Policy Rules Checks */}
              <div className="rounded-md border border-zinc-200 bg-zinc-50 p-3 space-y-2">
                <p className="text-[11px] font-semibold text-zinc-700 uppercase tracking-wider">
                  Plan Policy Rules &amp; Lifecycle Controls
                </p>
                <div className="space-y-1.5 text-xs text-zinc-700">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.allow_pause}
                      onChange={(e) =>
                        setFormData({ ...formData, allow_pause: e.target.checked })
                      }
                      className="rounded border-zinc-300 text-teal-700 focus:ring-teal-700"
                    />
                    <span>Allow customer / staff to pause active subscriptions</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.allow_early_close}
                      onChange={(e) =>
                        setFormData({ ...formData, allow_early_close: e.target.checked })
                      }
                      className="rounded border-zinc-300 text-teal-700 focus:ring-teal-700"
                    />
                    <span>Allow early termination / closure before scheduled period end</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.allow_renewal}
                      onChange={(e) =>
                        setFormData({ ...formData, allow_renewal: e.target.checked })
                      }
                      className="rounded border-zinc-300 text-teal-700 focus:ring-teal-700"
                    />
                    <span>Enable automatic renewal upon expiry</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer pt-1 border-t border-zinc-200">
                    <input
                      type="checkbox"
                      checked={formData.active}
                      onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                      className="rounded border-zinc-300 text-teal-700 focus:ring-teal-700"
                    />
                    <span>Active plan (available for staff to generate new quotes)</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100">
                <Button
                  size="sm"
                  variant="ghost"
                  type="button"
                  onClick={() => setModalOpen(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button size="sm" type="submit" isLoading={submitting} disabled={submitting}>
                  {editingPlan ? "Save Plan Changes" : "Create Plan"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
