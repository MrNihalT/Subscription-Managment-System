"use client";

import React, { useState, useEffect } from "react";
import { Package, Plus, Search, Edit3, Trash2, Check, Sparkles, Layers } from "lucide-react";
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
  getProducts,
  createProduct,
  updateProduct,
  seedCatalogDemoData,
  ProductVariantInput,
} from "@/lib/services/products";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    product_type: "subscription" as "subscription" | "one_time" | "addon",
    sales_price: 100,
    cost_price: 50,
    notes: "",
    active: true,
  });
  const [variants, setVariants] = useState<ProductVariantInput[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [alertState, setAlertState] = useState<{ type: "success" | "danger"; msg: string } | null>(null);

  const loadData = async () => {
    setLoading(true);
    const res = await getProducts();
    if (res.data) {
      setProducts(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: "",
      product_type: "subscription",
      sales_price: 199,
      cost_price: 90,
      notes: "",
      active: true,
    });
    setVariants([]);
    setAlertState(null);
    setModalOpen(true);
  };

  const openEditModal = (p: any) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      product_type: p.product_type,
      sales_price: Number(p.sales_price),
      cost_price: Number(p.cost_price),
      notes: p.notes || "",
      active: p.active,
    });
    setVariants(
      (p.variants || []).map((v: any) => ({
        id: v.id,
        name: v.name,
        price_adjustment: Number(v.price_adjustment),
      }))
    );
    setAlertState(null);
    setModalOpen(true);
  };

  const addVariantRow = () => {
    setVariants([...variants, { name: "", price_adjustment: 0 }]);
  };

  const removeVariantRow = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const updateVariantRow = (index: number, field: keyof ProductVariantInput, value: any) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: value };
    setVariants(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setAlertState({ type: "danger", msg: "Product name is required." });
      return;
    }

    setSubmitting(true);
    setAlertState(null);

    try {
      if (editingProduct) {
        const res = await updateProduct(editingProduct.id, {
          ...formData,
          variants,
        });
        if (res.error) {
          setAlertState({ type: "danger", msg: res.error });
        } else {
          setAlertState({ type: "success", msg: "Product updated successfully." });
          await loadData();
          setTimeout(() => setModalOpen(false), 900);
        }
      } else {
        const res = await createProduct({
          ...formData,
          variants,
        });
        if (res.error) {
          setAlertState({ type: "danger", msg: res.error });
        } else {
          setAlertState({ type: "success", msg: "Product created successfully." });
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

  const handleSeedCatalog = async () => {
    setSubmitting(true);
    await seedCatalogDemoData();
    await loadData();
    setSubmitting(false);
  };

  const filtered = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ? true : statusFilter === "active" ? p.active : !p.active;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-zinc-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-zinc-900">
              Products &amp; Variants
            </h1>
            <Badge variant="danger">Admin</Badge>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Configure catalog products, base sales and cost prices, and optional pricing variants.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {products.length === 0 && (
            <Button size="sm" variant="outline" onClick={handleSeedCatalog} isLoading={submitting}>
              <Sparkles className="h-3.5 w-3.5 text-teal-700" />
              Seed Demo Catalog
            </Button>
          )}
          <Button size="sm" onClick={openAddModal}>
            <Plus className="h-3.5 w-3.5" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
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

      {/* Products Table */}
      {loading ? (
        <Card className="p-8 text-center text-xs text-zinc-500">
          Loading catalog products from database...
        </Card>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No Products Found"
          description={
            searchTerm
              ? "No catalog items matched your search filter."
              : "Your catalog is empty. Create your first product or click 'Seed Demo Catalog'."
          }
          actionLabel="Add First Product"
          onAction={openAddModal}
        />
      ) : (
        <Card className="p-0 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Sales Price</TableHead>
                <TableHead className="text-right">Cost Price</TableHead>
                <TableHead className="text-right">Est. Margin</TableHead>
                <TableHead>Configured Variants</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((prod) => {
                const margin = Number(prod.sales_price) - Number(prod.cost_price);
                return (
                  <TableRow key={prod.id}>
                    <TableCell className="font-medium text-zinc-900">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-zinc-400 shrink-0" />
                        <div>
                          <span>{prod.name}</span>
                          {prod.notes && (
                            <p className="text-[11px] text-zinc-400 font-normal truncate max-w-xs">
                              {prod.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="capitalize text-zinc-600 text-xs">
                      {prod.product_type?.replace("_", " ")}
                    </TableCell>
                    <TableCell className="text-right font-mono font-medium text-zinc-900">
                      ${Number(prod.sales_price).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-zinc-500">
                      ${Number(prod.cost_price).toFixed(2)}
                    </TableCell>
                    <TableCell
                      className={`text-right font-mono text-xs font-medium ${
                        margin >= 0 ? "text-emerald-700" : "text-rose-600"
                      }`}
                    >
                      ${margin.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {prod.variants && prod.variants.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {prod.variants.map((v: any) => (
                            <span
                              key={v.id}
                              className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-zinc-100 text-zinc-700 font-mono"
                            >
                              {v.name} (
                              {Number(v.price_adjustment) >= 0 ? "+" : ""}
                              ${Number(v.price_adjustment).toFixed(2)})
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[11px] text-zinc-400 italic">None</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={prod.active ? "success" : "neutral"}>
                        {prod.active ? "Active" : "Archived"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditModal(prod)}
                        title="Edit Product & Variants"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
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

      {/* Add / Edit Product Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/50 p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl border border-zinc-200 my-8">
            <h3 className="text-sm font-semibold text-zinc-900 pb-3 border-b border-zinc-100">
              {editingProduct ? "Edit Product & Variants" : "Create New Catalog Product"}
            </h3>

            {alertState && (
              <div className="mt-3">
                <Alert variant={alertState.type} title="Notice">
                  {alertState.msg}
                </Alert>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 py-3">
              <Input
                label="Product Name *"
                required
                placeholder="e.g. Dedicated Compute Node"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={submitting}
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Select
                  label="Product Type"
                  value={formData.product_type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      product_type: e.target.value as any,
                    })
                  }
                  options={[
                    { value: "subscription", label: "Subscription" },
                    { value: "one_time", label: "One-Time" },
                    { value: "addon", label: "Add-On" },
                  ]}
                  disabled={submitting}
                />
                <Input
                  label="Sales Price ($) *"
                  type="number"
                  step="0.01"
                  required
                  value={formData.sales_price}
                  onChange={(e) =>
                    setFormData({ ...formData, sales_price: parseFloat(e.target.value) || 0 })
                  }
                  disabled={submitting}
                />
                <Input
                  label="Cost Price ($) *"
                  type="number"
                  step="0.01"
                  required
                  value={formData.cost_price}
                  onChange={(e) =>
                    setFormData({ ...formData, cost_price: parseFloat(e.target.value) || 0 })
                  }
                  disabled={submitting}
                />
              </div>

              <Input
                label="Catalog Notes & Description"
                placeholder="Optional billing or technical remarks"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                disabled={submitting}
              />

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="prod-active"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="rounded border-zinc-300 text-teal-700 focus:ring-teal-700"
                />
                <label htmlFor="prod-active" className="text-xs text-zinc-700 font-medium">
                  Active in catalog (available for new plans and quotes)
                </label>
              </div>

              {/* Product Variants Section */}
              <div className="pt-3 border-t border-zinc-100 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-semibold text-zinc-800">
                      Product Variants &amp; Price Adjustments
                    </h4>
                    <p className="text-[11px] text-zinc-500">
                      Options that adjust the base price when selected in a subscription quote
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={addVariantRow}
                    disabled={submitting}
                  >
                    <Plus className="h-3 w-3" />
                    Add Variant
                  </Button>
                </div>

                {variants.length === 0 ? (
                  <p className="text-[11px] text-zinc-400 italic py-2">
                    No variants added. The base product sales price will apply.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {variants.map((v, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2 rounded bg-zinc-50 border border-zinc-200">
                        <div className="flex-1">
                          <input
                            type="text"
                            placeholder="Variant Name (e.g. 128GB RAM)"
                            value={v.name}
                            onChange={(e) => updateVariantRow(idx, "name", e.target.value)}
                            className="w-full px-2 py-1 text-xs rounded border border-zinc-300 bg-white"
                            required
                          />
                        </div>
                        <div className="w-32">
                          <input
                            type="number"
                            step="0.01"
                            placeholder="Adj ($ +/-)"
                            value={v.price_adjustment}
                            onChange={(e) =>
                              updateVariantRow(idx, "price_adjustment", parseFloat(e.target.value) || 0)
                            }
                            className="w-full px-2 py-1 text-xs rounded border border-zinc-300 bg-white font-mono"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeVariantRow(idx)}
                          className="p-1 text-zinc-400 hover:text-rose-600 rounded"
                          title="Remove Variant"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-zinc-100">
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
                  {editingProduct ? "Save Changes" : "Create Product"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
