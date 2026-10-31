"use client";

import React, { useState } from "react";
import { Users, UserPlus, Shield, ShieldCheck, Mail, CheckCircle2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
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

interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: "admin" | "staff";
  dateAdded: string;
  status: "active" | "invited";
}

const staffList: StaffMember[] = [
  {
    id: "staff-1",
    name: "Alex Vance",
    email: "alex.admin@subscriptions.internal",
    role: "admin",
    dateAdded: "2026-09-01",
    status: "active",
  },
  {
    id: "staff-2",
    name: "Morgan Lee",
    email: "morgan.staff@subscriptions.internal",
    role: "staff",
    dateAdded: "2026-10-12",
    status: "active",
  },
  {
    id: "staff-3",
    name: "Devon Clark",
    email: "devon.billing@subscriptions.internal",
    role: "staff",
    dateAdded: "2026-10-20",
    status: "active",
  },
  {
    id: "staff-4",
    name: "Samira Patel",
    email: "samira.ops@subscriptions.internal",
    role: "staff",
    dateAdded: "2026-10-28",
    status: "invited",
  },
];

export default function AdminStaffPage() {
  const [showInviteModal, setShowInviteModal] = useState(false);

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
            Manage billing staff access. In accordance with system security rules, only Admins may invite or authorize staff.
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
            {staffList.map((member) => (
              <TableRow key={member.id}>
                <TableCell className="font-medium text-zinc-900">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-100 text-zinc-700 text-xs font-semibold">
                      {member.name.charAt(0)}
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
            <div className="space-y-3 py-4">
              <Input label="Full Name" placeholder="e.g. Jordan Miller" />
              <Input
                label="Corporate Email Address"
                placeholder="jordan.staff@subscriptions.internal"
                helperText="Invitation link and role claim token will be issued to this email"
              />
              <div className="p-3 bg-zinc-50 border border-zinc-200 rounded text-xs text-zinc-600">
                <ShieldCheck className="h-4 w-4 text-teal-700 inline mr-1" />
                Staff users can manage quotes, subscriptions, and invoices, but cannot add or modify other staff or admin accounts.
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100">
              <Button size="sm" variant="ghost" onClick={() => setShowInviteModal(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  alert("Staff authorization workflow validated. Backend authentication hook will be wired in Phase 3.");
                  setShowInviteModal(false);
                }}
              >
                Send Staff Invitation
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
