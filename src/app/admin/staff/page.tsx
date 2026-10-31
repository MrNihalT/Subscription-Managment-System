"use client";

import React, { useState, useEffect } from "react";
import { Users, UserPlus, Shield, ShieldCheck, Mail, CheckCircle2, AlertCircle } from "lucide-react";
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
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: "admin" | "staff";
  dateAdded: string;
  status: "active" | "invited";
}

const fallbackStaff: StaffMember[] = [
  {
    id: "staff-demo-1",
    name: "Alex Vance (Admin)",
    email: "alex.admin@subscriptions.internal",
    role: "admin",
    dateAdded: "2026-09-01",
    status: "active",
  },
  {
    id: "staff-demo-2",
    name: "Morgan Lee",
    email: "morgan.staff@subscriptions.internal",
    role: "staff",
    dateAdded: "2026-10-12",
    status: "active",
  },
  {
    id: "staff-demo-3",
    name: "Devon Clark",
    email: "devon.billing@subscriptions.internal",
    role: "staff",
    dateAdded: "2026-10-20",
    status: "active",
  },
];

export default function AdminStaffPage() {
  const { user, profile } = useAuth();
  const [staff, setStaff] = useState<StaffMember[]>(fallbackStaff);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inviteStatus, setInviteStatus] = useState<{ type: "success" | "error" | "info"; msg: string } | null>(null);

  // Fetch real staff accounts from public.profiles
  useEffect(() => {
    async function loadStaff() {
      if (!supabase || !user) return;
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, full_name, role, created_at")
          .in("role", ["admin", "staff"])
          .order("created_at", { ascending: false });

        if (!error && data && data.length > 0) {
          setStaff(
            data.map((p) => ({
              id: p.id,
              name: p.full_name || "Staff Member",
              email: p.id === user.id ? user.email || "" : "staff@subscriptions.internal",
              role: p.role as "admin" | "staff",
              dateAdded: new Date(p.created_at).toISOString().split("T")[0],
              status: "active",
            }))
          );
        }
      } catch (err) {
        console.error("Error loading staff profiles:", err);
      }
    }

    loadStaff();
  }, [user]);

  const handleInviteStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteStatus(null);

    if (!inviteEmail.trim()) {
      setInviteStatus({ type: "error", msg: "Please enter an email address." });
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/admin/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: inviteEmail.trim(),
          fullName: inviteName.trim(),
          role: "staff",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setInviteStatus({
          type: "error",
          msg: data.error || "Failed to provision staff member.",
        });
      } else {
        setInviteStatus({
          type: "success",
          msg: data.message || `Staff invitation dispatched to ${inviteEmail}.`,
        });

        // Add to view state
        setStaff((prev) => [
          {
            id: data.user?.id || `staff-${Date.now()}`,
            name: inviteName.trim() || "Invited Staff",
            email: inviteEmail.trim(),
            role: "staff",
            dateAdded: new Date().toISOString().split("T")[0],
            status: "invited",
          },
          ...prev,
        ]);

        setInviteEmail("");
        setInviteName("");
      }
    } catch (err: any) {
      setInviteStatus({
        type: "error",
        msg: err?.message || "An unexpected network error occurred.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isAdmin = profile?.role === "admin";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-zinc-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-zinc-900">
              Staff Account Administration
            </h1>
            <Badge variant="danger">Strictly Admin Only</Badge>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Authorize billing operators. In accordance with system security rules, only Admins may invite or authorize staff.
          </p>
        </div>
        <Button size="sm" onClick={() => setShowInviteModal(true)}>
          <UserPlus className="h-3.5 w-3.5" />
          Authorize New Staff
        </Button>
      </div>

      <Alert variant="warning" title="Privilege Isolation Policy">
        Public sign-up forms are restricted to customer profiles. Staff privileges must be provisioned here by an authenticated administrator.
      </Alert>

      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Staff Member</TableHead>
              <TableHead>Email Address</TableHead>
              <TableHead>Assigned Role</TableHead>
              <TableHead>Authorization Date</TableHead>
              <TableHead>Account Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {staff.map((member) => (
              <TableRow key={member.id}>
                <TableCell className="font-medium text-zinc-900">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-100 text-zinc-700 text-xs font-semibold">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <span>{member.name}</span>
                  </div>
                </TableCell>
                <TableCell className="font-mono text-zinc-600">
                  {member.email}
                </TableCell>
                <TableCell>
                  <Badge variant={member.role === "admin" ? "danger" : "accent"}>
                    {member.role.toUpperCase()}
                  </Badge>
                </TableCell>
                <TableCell className="text-zinc-600 font-mono">
                  {member.dateAdded}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={member.status === "active" ? "success" : "neutral"}
                  >
                    {member.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-5 shadow-lg border border-zinc-200">
            <h3 className="text-sm font-semibold text-zinc-900 pb-3 border-b border-zinc-100">
              Authorize Billing Staff Member
            </h3>

            {inviteStatus && (
              <div className="mt-3">
                <Alert
                  variant={inviteStatus.type === "error" ? "danger" : "success"}
                  title={inviteStatus.type === "error" ? "Authorization Notice" : "Staff Provisioned"}
                >
                  {inviteStatus.msg}
                </Alert>
              </div>
            )}

            <form onSubmit={handleInviteStaff} className="space-y-3 py-3">
              <Input
                label="Full Name"
                placeholder="e.g. Jordan Miller"
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                disabled={isSubmitting}
              />
              <Input
                label="Corporate Email Address"
                type="email"
                required
                placeholder="jordan.staff@company.com"
                helperText="Invitation link will be issued via Supabase Auth Admin API"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                disabled={isSubmitting}
              />
              <div className="p-3 bg-zinc-50 border border-zinc-200 rounded text-xs text-zinc-600">
                <ShieldCheck className="h-4 w-4 text-teal-700 inline mr-1" />
                Staff users can manage quotes, subscriptions, and invoices, but cannot add or modify other staff or admin accounts.
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100">
                <Button
                  size="sm"
                  variant="ghost"
                  type="button"
                  onClick={() => {
                    setShowInviteModal(false);
                    setInviteStatus(null);
                  }}
                  disabled={isSubmitting}
                >
                  Close
                </Button>
                <Button
                  size="sm"
                  type="submit"
                  isLoading={isSubmitting}
                  disabled={isSubmitting}
                >
                  Send Staff Invitation
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
