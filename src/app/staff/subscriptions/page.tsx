"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  Plus,
  Search,
  CheckCircle,
  ArrowRight,
  Play,
  Pause,
  XCircle,
  Clock,
  Layers,
  ChevronRight,
  Sparkles,
  Trash2,
} from "lucide-react";
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
  getSubscriptions,
  createSubscriptionQuote,
  updateSubscriptionStatus,
  getQuotationTemplateForPlan,
  SubscriptionLineInput,
} from "@/lib/services/subscriptions";
import { getCustomers } from "@/lib/services/customers";
import { getPlans } from "@/lib/services/plans";
import { SubscriptionStatus } from "@/types";

export default function StaffSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Modal State for New Quote / Subscription
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [selectedVariantId, setSelectedVariantId] = useState<string>("");
  const [startDate, setStartDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("Net 30");
  const [lines, setLines] = useState<SubscriptionLineInput[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [alertState, setAlertState] = useState<{ type: "success" | "danger"; msg: string } | null>(null);

  // Detail Drawer / Viewer
  const [selectedSub, setSelectedSub] = useState<any | null>(null);
  const [transitionLoading, setTransitionLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const [subsRes, custRes, plansRes] = await Promise.all([
      getSubscriptions(),
      getCustomers(),
      getPlans(),
    ]);

    if (subsRes.data) setSubscriptions(subsRes.data);
    if (custRes.data) setCustomers(custRes.data);
    if (plansRes.data) setPlans(plansRes.data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const openNewQuoteModal = () => {
    setAlertState(null);
    const initialCust = customers[0]?.id || "";
    const initialPlan = plans[0] || null;

    setSelectedCustomerId(initialCust);
    setSelectedPlanId(initialPlan ? initialPlan.id : "");
    setSelectedVariantId("");
    setPaymentTerms("Net 30");

    if (initialPlan) {
      applyPlanTemplate(initialPlan, null);
    } else {
      setLines([]);
    }

    setModalOpen(true);
  };

  const applyPlanTemplate = async (plan: any, variant: any) => {
    const template = await getQuotationTemplateForPlan(plan, variant);
    setStartDate(template.start_date);
    setExpiryDate(template.expiry_date);
    setPaymentTerms(template.payment_terms);
    setLines(template.lines);
  };

  const handlePlanChange = (planId: string) => {
    setSelectedPlanId(planId);
    setSelectedVariantId("");
    const plan = plans.find((p) => p.id === planId);
    if (plan) {
      applyPlanTemplate(plan, null);
    }
  };

  const handleVariantChange = (varId: string) => {
    setSelectedVariantId(varId);
    const plan = plans.find((p) => p.id === selectedPlanId);
    const variant = plan?.product?.variants?.find((v: any) => v.id === varId);
    if (plan) {
      applyPlanTemplate(plan, variant);
    }
  };

  const addCustomLine = () => {
    const plan = plans.find((p) => p.id === selectedPlanId);
    setLines([
      ...lines,
      {
        product_id: plan?.product_id || plan?.product?.id || "",
        variant_id: null,
        description: "Additional Subscription Add-on / Service",
        quantity: 1,
        unit_price: 50.0,
        tax_rate: 10.0,
      },
    ]);
  };

  const removeLine = (idx: number) => {
    if (lines.length <= 1) {
      setAlertState({ type: "danger", msg: "At least one product line is required." });
      return;
    }
    setLines(lines.filter((_, i) => i !== idx));
  };

  const updateLine = (idx: number, field: keyof SubscriptionLineInput, val: any) => {
    const updated = [...lines];
    updated[idx] = { ...updated[idx], [field]: val };
    setLines(updated);
  };

  // Real-time calculated quote totals
  const subtotal = lines.reduce(
    (sum, l) => sum + Number(l.quantity || 0) * Number(l.unit_price || 0),
    0
  );
  const taxTotal = lines.reduce(
    (sum, l) =>
      sum +
      Number(l.quantity || 0) * Number(l.unit_price || 0) * (Number(l.tax_rate || 0) / 100),
    0
  );
  const grandTotal = subtotal + taxTotal;

  const handleCreateQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId) {
      setAlertState({ type: "danger", msg: "Please select a customer." });
      return;
    }
    if (!selectedPlanId) {
      setAlertState({ type: "danger", msg: "Please select a billing plan." });
      return;
    }
    if (lines.length === 0) {
      setAlertState({ type: "danger", msg: "Quote must contain at least one line item." });
      return;
    }

    setSubmitting(true);
    setAlertState(null);

    try {
      const res = await createSubscriptionQuote({
        customer_id: selectedCustomerId,
        plan_id: selectedPlanId,
        start_date: startDate,
        expiry_date: expiryDate || null,
        payment_terms: paymentTerms,
        status: "draft",
        lines,
      });

      if (res.error) {
        setAlertState({ type: "danger", msg: res.error });
      } else {
        setAlertState({ type: "success", msg: "Draft quote created successfully!" });
        await loadData();
        setTimeout(() => setModalOpen(false), 900);
      }
    } catch (err: any) {
      setAlertState({ type: "danger", msg: err?.message || "Failed to create quote." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusTransition = async (subId: string, nextStatus: SubscriptionStatus) => {
    setTransitionLoading(true);
    setAlertState(null);

    try {
      const res = await updateSubscriptionStatus(subId, nextStatus);
      if (res.error) {
        alert(`Transition error: ${res.error}`);
      } else {
        await loadData();
        if (selectedSub && selectedSub.id === subId) {
          setSelectedSub({ ...selectedSub, status: nextStatus });
        }
      }
    } catch (err: any) {
      alert(err?.message || "Status change failed.");
    } finally {
      setTransitionLoading(false);
    }
  };

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

  const filtered = subscriptions.filter((s) => {
    const matchesTab = activeTab === "all" ? true : s.status === activeTab;
    const matchesSearch =
      s.subscription_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.plan?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const selectedPlanObj = plans.find((p) => p.id === selectedPlanId);
  const availableVariants = selectedPlanObj?.product?.variants || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-zinc-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-zinc-900">
              Quotes &amp; Subscriptions
            </h1>
            <Badge variant="accent">Staff</Badge>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Prepare quotation templates, manage line items, price adjustments, and follow the lifecycle: Draft → Quotation → Confirmed → Active → Closed.
          </p>
        </div>
        <Button size="sm" onClick={openNewQuoteModal}>
          <Plus className="h-3.5 w-3.5" />
          New Quote / Subscription
        </Button>
      </div>

      {/* Lifecycle Flow Notice Banner */}
      <div className="rounded-lg border border-zinc-200 bg-white p-3 text-xs">
        <p className="font-semibold text-zinc-900 mb-2">Enforced Subscription Lifecycle</p>
        <div className="flex flex-wrap items-center gap-2 text-zinc-600">
          <span className="font-medium text-zinc-800 bg-zinc-100 px-2 py-0.5 rounded">1. Draft</span>
          <ArrowRight className="h-3.5 w-3.5 text-zinc-400" />
          <span className="font-medium text-teal-800 bg-teal-50 px-2 py-0.5 rounded">2. Quotation</span>
          <ArrowRight className="h-3.5 w-3.5 text-zinc-400" />
          <span className="font-medium text-zinc-800 bg-zinc-100 px-2 py-0.5 rounded">3. Confirmed</span>
          <ArrowRight className="h-3.5 w-3.5 text-zinc-400" />
          <span className="font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">4. Active Contract</span>
          <ArrowRight className="h-3.5 w-3.5 text-zinc-400" />
          <span className="font-medium text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded">Paused / Closed</span>
        </div>
      </div>

      {/* Filter Tabs and Search Bar */}
      <Card className="p-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1">
            {[
              { id: "all", label: "All Records" },
              { id: "draft", label: "Drafts" },
              { id: "quotation", label: "Quotations" },
              { id: "confirmed", label: "Confirmed" },
              { id: "active", label: "Active Contracts" },
              { id: "paused", label: "Paused" },
              { id: "closed", label: "Closed" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-zinc-900 text-white font-semibold"
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
              placeholder="Search by quote # or customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md border border-zinc-300 focus:outline-none focus:ring-1 focus:ring-teal-700"
            />
          </div>
        </div>
      </Card>

      {/* Subscriptions Table */}
      {loading ? (
        <Card className="p-8 text-center text-xs text-zinc-500">
          Loading quotations &amp; subscriptions from database...
        </Card>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No Subscriptions Found"
          description={
            searchTerm
              ? "No records matched your search query."
              : "No subscription quotes exist in the database. Click 'New Quote / Subscription' to create one."
          }
          actionLabel="Create Quote"
          onAction={openNewQuoteModal}
        />
      ) : (
        <Card className="p-0 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subscription #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Plan &amp; Interval</TableHead>
                <TableHead>Period Window</TableHead>
                <TableHead className="text-right">Grand Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Lifecycle Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((sub) => {
                const isDraft = sub.status === "draft";
                const isQuote = sub.status === "quotation";
                const isConfirmed = sub.status === "confirmed";
                const isActive = sub.status === "active";
                const isPaused = sub.status === "paused";
                const isClosed = sub.status === "closed";

                return (
                  <TableRow key={sub.id}>
                    <TableCell className="font-mono text-xs font-semibold text-zinc-900">
                      {sub.subscription_number}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-zinc-900">
                        {sub.customer?.name || "Customer Record"}
                      </div>
                      <div className="text-[11px] text-zinc-400 font-mono">
                        {sub.customer?.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-zinc-800 text-xs">
                        {sub.plan?.name}
                      </div>
                      <div className="text-[11px] text-zinc-500 capitalize">
                        {sub.plan?.billing_interval} recurring
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-zinc-600">
                      {sub.start_date} → {sub.expiry_date || "Ongoing"}
                    </TableCell>
                    <TableCell className="text-right font-mono font-medium text-zinc-900">
                      ${Number(sub.grandTotal || 0).toFixed(2)}
                    </TableCell>
                    <TableCell>{getStatusBadge(sub.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Progressive lifecycle actions */}
                        {isDraft && (
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => handleStatusTransition(sub.id, "quotation")}
                            disabled={transitionLoading}
                            title="Issue Quotation to Customer"
                          >
                            Send Quote
                          </Button>
                        )}

                        {isQuote && (
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => handleStatusTransition(sub.id, "confirmed")}
                            disabled={transitionLoading}
                            title="Confirm Customer Acceptance"
                          >
                            Confirm Quote
                          </Button>
                        )}

                        {isConfirmed && (
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => handleStatusTransition(sub.id, "active")}
                            disabled={transitionLoading}
                            title="Activate Contract and Start Billing Period"
                          >
                            Activate Contract
                          </Button>
                        )}

                        {isActive && (
                          <>
                            {sub.plan?.allow_pause && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleStatusTransition(sub.id, "paused")}
                                disabled={transitionLoading}
                                title="Pause active subscription"
                              >
                                <Pause className="h-3 w-3" />
                                Pause
                              </Button>
                            )}
                            {sub.plan?.allow_early_close && (
                              <Button
                                size="sm"
                                variant="danger"
                                onClick={() => handleStatusTransition(sub.id, "closed")}
                                disabled={transitionLoading}
                                title="Early Close Contract"
                              >
                                Close
                              </Button>
                            )}
                          </>
                        )}

                        {isPaused && (
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => handleStatusTransition(sub.id, "active")}
                            disabled={transitionLoading}
                            title="Resume active subscription"
                          >
                            <Play className="h-3 w-3" />
                            Resume
                          </Button>
                        )}

                        {isClosed && (
                          <span className="text-[11px] text-zinc-400 italic">Closed</span>
                        )}

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedSub(sub)}
                          title="View Details"
                        >
                          Details
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Subscription Details Viewer Modal */}
      {selectedSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/50 p-4 overflow-y-auto">
          <div className="w-full max-w-xl rounded-lg bg-white p-6 shadow-xl border border-zinc-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-sm text-zinc-900">
                  {selectedSub.subscription_number}
                </span>
                {getStatusBadge(selectedSub.status)}
              </div>
              <Button size="sm" variant="ghost" onClick={() => setSelectedSub(null)}>
                Close
              </Button>
            </div>

            <div className="py-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 rounded bg-zinc-50 border border-zinc-200">
                <div>
                  <p className="text-zinc-500 font-medium">Customer</p>
                  <p className="font-semibold text-zinc-900">{selectedSub.customer?.name}</p>
                  <p className="text-zinc-500 font-mono text-[11px]">{selectedSub.customer?.email}</p>
                </div>
                <div>
                  <p className="text-zinc-500 font-medium">Plan &amp; Interval</p>
                  <p className="font-semibold text-zinc-900">{selectedSub.plan?.name}</p>
                  <p className="text-zinc-500 capitalize text-[11px]">
                    {selectedSub.plan?.billing_interval} • Terms: {selectedSub.payment_terms}
                  </p>
                </div>
                <div>
                  <p className="text-zinc-500 font-medium">Contract Period</p>
                  <p className="font-mono text-zinc-900">
                    {selectedSub.start_date} → {selectedSub.expiry_date || "Ongoing"}
                  </p>
                </div>
                <div>
                  <p className="text-zinc-500 font-medium">Recurring Grand Total</p>
                  <p className="font-mono font-bold text-zinc-900 text-sm">
                    ${Number(selectedSub.grandTotal || 0).toFixed(2)}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-zinc-800 uppercase tracking-wider text-[11px] mb-2">
                  Line Items &amp; Variant Pricing Adjustments
                </h4>
                <div className="rounded border border-zinc-200 overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 font-medium text-left">
                      <tr>
                        <th className="p-2">Description / Variant</th>
                        <th className="p-2 text-center">Qty</th>
                        <th className="p-2 text-right">Unit Price</th>
                        <th className="p-2 text-right">Tax Rate</th>
                        <th className="p-2 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200">
                      {(selectedSub.lines || []).map((line: any) => {
                        const lineTotal = Number(line.quantity) * Number(line.unit_price);
                        return (
                          <tr key={line.id}>
                            <td className="p-2 text-zinc-800">
                              <p className="font-medium">{line.description}</p>
                              {line.variant && (
                                <p className="text-[10px] text-teal-700 font-mono">
                                  Variant: {line.variant.name} (+${Number(line.variant.price_adjustment).toFixed(2)})
                                </p>
                              )}
                            </td>
                            <td className="p-2 text-center font-mono">{line.quantity}</td>
                            <td className="p-2 text-right font-mono">${Number(line.unit_price).toFixed(2)}</td>
                            <td className="p-2 text-right font-mono">{line.tax_rate}%</td>
                            <td className="p-2 text-right font-mono font-medium text-zinc-900">
                              ${lineTotal.toFixed(2)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-zinc-100">
              <Button size="sm" onClick={() => setSelectedSub(null)}>
                Dismiss
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Create Quote / Subscription Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/50 p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl border border-zinc-200 my-8">
            <h3 className="text-base font-semibold text-zinc-900 pb-3 border-b border-zinc-100">
              Prepare Quote / Subscription
            </h3>

            {alertState && (
              <div className="mt-3">
                <Alert variant={alertState.type} title="Notice">
                  {alertState.msg}
                </Alert>
              </div>
            )}

            <form onSubmit={handleCreateQuote} className="space-y-4 py-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Select
                  label="Select Customer *"
                  required
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  disabled={submitting}
                >
                  {customers.length === 0 ? (
                    <option value="">No customers found. Register customer first.</option>
                  ) : (
                    customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.email})
                      </option>
                    ))
                  )}
                </Select>

                <Select
                  label="Select Plan Template *"
                  required
                  value={selectedPlanId}
                  onChange={(e) => handlePlanChange(e.target.value)}
                  disabled={submitting}
                >
                  {plans.length === 0 ? (
                    <option value="">No plans found. Create billing plan first.</option>
                  ) : (
                    plans.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} — ${Number(p.price).toFixed(2)} / {p.billing_interval}
                      </option>
                    ))
                  )}
                </Select>
              </div>

              {/* Optional Variant Selection (shows price adjustments) */}
              {availableVariants.length > 0 && (
                <div className="p-3 bg-teal-50/50 border border-teal-200 rounded-md space-y-1">
                  <label className="block text-xs font-semibold text-teal-900">
                    Product Variant Selection (Adjusts Base Price)
                  </label>
                  <select
                    value={selectedVariantId}
                    onChange={(e) => handleVariantChange(e.target.value)}
                    className="w-full rounded-md border border-teal-300 bg-white px-3 py-1.5 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-teal-700"
                    disabled={submitting}
                  >
                    <option value="">Standard Base Specification (+$0.00)</option>
                    {availableVariants.map((v: any) => (
                      <option key={v.id} value={v.id}>
                        {v.name} (Adjustment: {Number(v.price_adjustment) >= 0 ? "+" : ""}
                        ${Number(v.price_adjustment).toFixed(2)})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Input
                  label="Start Date *"
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  disabled={submitting}
                />
                <Input
                  label="Contract Expiry Date"
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  disabled={submitting}
                />
                <Input
                  label="Payment Terms"
                  placeholder="e.g. Net 30"
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  disabled={submitting}
                />
              </div>

              {/* Line Items Editor */}
              <div className="pt-2 border-t border-zinc-100 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-zinc-800">
                    Product Line Items &amp; Pricing
                  </h4>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={addCustomLine}
                    disabled={submitting}
                  >
                    <Plus className="h-3 w-3" /> Add Item Line
                  </Button>
                </div>

                <div className="space-y-2">
                  {lines.map((line, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-12 gap-2 p-2 rounded bg-zinc-50 border border-zinc-200 items-center text-xs"
                    >
                      <div className="col-span-5">
                        <input
                          type="text"
                          placeholder="Description"
                          value={line.description}
                          onChange={(e) => updateLine(idx, "description", e.target.value)}
                          className="w-full px-2 py-1 text-xs rounded border border-zinc-300 bg-white"
                          required
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          min="1"
                          placeholder="Qty"
                          value={line.quantity}
                          onChange={(e) =>
                            updateLine(idx, "quantity", parseInt(e.target.value) || 1)
                          }
                          className="w-full px-2 py-1 text-xs rounded border border-zinc-300 bg-white text-center font-mono"
                          required
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          step="0.01"
                          placeholder="Price ($)"
                          value={line.unit_price}
                          onChange={(e) =>
                            updateLine(idx, "unit_price", parseFloat(e.target.value) || 0)
                          }
                          className="w-full px-2 py-1 text-xs rounded border border-zinc-300 bg-white text-right font-mono"
                          required
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          step="0.5"
                          placeholder="Tax %"
                          value={line.tax_rate}
                          onChange={(e) =>
                            updateLine(idx, "tax_rate", parseFloat(e.target.value) || 0)
                          }
                          className="w-full px-2 py-1 text-xs rounded border border-zinc-300 bg-white text-right font-mono"
                        />
                      </div>
                      <div className="col-span-1 text-center">
                        <button
                          type="button"
                          onClick={() => removeLine(idx)}
                          className="p-1 text-zinc-400 hover:text-rose-600 rounded"
                          title="Remove Line"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Real-time Calculation Summary */}
                <div className="pt-3 border-t border-zinc-100 flex justify-end">
                  <div className="w-56 space-y-1 text-right text-xs">
                    <div className="flex justify-between text-zinc-600">
                      <span>Subtotal:</span>
                      <span className="font-mono">${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-zinc-600">
                      <span>Tax Estimate:</span>
                      <span className="font-mono">${taxTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-zinc-900 border-t border-zinc-200 pt-1 text-sm">
                      <span>Grand Total:</span>
                      <span className="font-mono text-teal-800">${grandTotal.toFixed(2)}</span>
                    </div>
                  </div>
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
                  Save as Draft Quote
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
