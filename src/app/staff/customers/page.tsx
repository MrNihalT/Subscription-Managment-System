"use client";

import React, { useState, useEffect } from "react";
import { Building2, Search, Plus, Mail, Layers } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
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
import { getCustomers, createCustomer } from "@/lib/services/customers";

export default function StaffCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [submitting, setSubmitting] = useState(false);
  const [alertState, setAlertState] = useState<{ type: "success" | "danger"; msg: string } | null>(null);

  const loadData = async () => {
    setLoading(true);
    const res = await getCustomers();
    if (res.data) setCustomers(res.data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      setAlertState({ type: "danger", msg: "Name and email are required." });
      return;
    }

    setSubmitting(true);
    setAlertState(null);

    try {
      const res = await createCustomer(formData);
      if (res.error) {
        setAlertState({ type: "danger", msg: res.error });
      } else {
        setAlertState({ type: "success", msg: "Customer registered successfully." });
        setFormData({ name: "", email: "" });
        await loadData();
        setTimeout(() => setModalOpen(false), 900);
      }
    } catch (err: any) {
      setAlertState({ type: "danger", msg: err?.message || "Operation failed." });
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = customers.filter(
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
            <Badge variant="accent">Staff</Badge>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Browse and manage customer client accounts, active subscription accounts, and billing contact emails.
          </p>
        </div>
        <Button size="sm" onClick={() => setModalOpen(true)}>
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

      {loading ? (
        <Card className="p-8 text-center text-xs text-zinc-500">
          Loading customer directory from database...
        </Card>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No Customers Found"
          description={
            searchTerm
              ? "No customer matches your search query."
              : "No customer accounts registered yet. Click 'Register Customer' to add one."
          }
          actionLabel="Register Customer"
          onAction={() => setModalOpen(true)}
        />
      ) : (
        <Card className="p-0 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer / Company</TableHead>
                <TableHead>Billing Email</TableHead>
                <TableHead className="text-center">Subscriptions</TableHead>
                <TableHead>Linked Auth Account</TableHead>
                <TableHead>Created Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((cust) => {
                const subCount = cust.subscriptions?.length || 0;
                return (
                  <TableRow key={cust.id}>
                    <TableCell className="font-medium text-zinc-900">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-zinc-400 shrink-0" />
                        <span>{cust.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-zinc-600 text-xs">
                      {cust.email}
                    </TableCell>
                    <TableCell className="text-center font-mono">
                      <Badge variant={subCount > 0 ? "accent" : "neutral"}>
                        {subCount} {subCount === 1 ? "subscription" : "subscriptions"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-zinc-500">
                      {cust.auth_user_id ? (
                        <span className="text-emerald-700 font-medium flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          Linked Profile
                        </span>
                      ) : (
                        <span className="text-zinc-400 italic">Unlinked Guest</span>
                      )}
                    </TableCell>
                    <TableCell className="text-zinc-600 font-mono text-xs">
                      {new Date(cust.created_at).toISOString().split("T")[0]}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Register Customer Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-5 shadow-lg border border-zinc-200">
            <h3 className="text-sm font-semibold text-zinc-900 pb-3 border-b border-zinc-100">
              Register New Customer
            </h3>

            {alertState && (
              <div className="mt-3">
                <Alert variant={alertState.type} title="Notice">
                  {alertState.msg}
                </Alert>
              </div>
            )}

            <form onSubmit={handleCreateCustomer} className="space-y-3 py-3">
              <Input
                label="Company / Customer Name *"
                required
                placeholder="e.g. Acme Logistics Ltd"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={submitting}
              />
              <Input
                label="Billing Contact Email *"
                type="email"
                required
                placeholder="billing@acmelogistics.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={submitting}
              />

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
                  Register Customer
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
