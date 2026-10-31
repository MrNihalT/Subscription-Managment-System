"use client";

import React, { useState } from "react";
import { Layers, Plus, Calendar, Check, X } from "lucide-react";
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

interface DemoPlan {
  id: string;
  name: string;
  productName: string;
  price: number;
  interval: "daily" | "weekly" | "monthly" | "yearly";
  minQuantity: number;
  allowPause: boolean;
  allowEarlyClose: boolean;
  allowRenewal: boolean;
  active: boolean;
}

const initialPlans: DemoPlan[] = [
  {
    id: "plan-1",
    name: "Enterprise Dedicated (Monthly)",
    productName: "Enterprise Dedicated Server",
    price: 450.0,
    interval: "monthly",
    minQuantity: 1,
    allowPause: true,
    allowEarlyClose: true,
    allowRenewal: true,
    active: true,
  },
  {
    id: "plan-2",
    name: "Enterprise Dedicated (Annual Contract)",
    productName: "Enterprise Dedicated Server",
    price: 4800.0,
    interval: "yearly",
    minQuantity: 1,
    allowPause: false,
    allowEarlyClose: false,
    allowRenewal: true,
    active: true,
  },
  {
    id: "plan-3",
    name: "Business Cloud Storage (Weekly Sync)",
    productName: "Business Cloud Storage",
    price: 25.0,
    interval: "weekly",
    minQuantity: 2,
    allowPause: true,
    allowEarlyClose: true,
    allowRenewal: true,
    active: true,
  },
  {
    id: "plan-4",
    name: "Business Cloud Storage (Monthly Base)",
    productName: "Business Cloud Storage",
    price: 89.0,
    interval: "monthly",
    minQuantity: 1,
    allowPause: true,
    allowEarlyClose: true,
    allowRenewal: true,
    active: true,
  },
];

export default function AdminPlansPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-zinc-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-zinc-900">
              Billing Plans &amp; Cycles
            </h1>
            <Badge variant="danger">Admin Destination</Badge>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Configure interval frequencies, minimum quantities, pause rules, early termination, and auto-renewal policies.
          </p>
        </div>
        <Button size="sm">
          <Plus className="h-3.5 w-3.5" />
          Create Plan
        </Button>
      </div>

      <Alert variant="info" title="Interval Frequency &amp; Rules Engine">
        Supports daily, weekly, monthly, and yearly intervals with enforcement of pause and early termination policies.
      </Alert>

      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Plan Name</TableHead>
              <TableHead>Linked Product</TableHead>
              <TableHead>Interval</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-center">Min Qty</TableHead>
              <TableHead className="text-center">Pause Allowed</TableHead>
              <TableHead className="text-center">Early Close</TableHead>
              <TableHead className="text-center">Renewal</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialPlans.map((plan) => (
              <TableRow key={plan.id}>
                <TableCell className="font-medium text-zinc-900">
                  <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4 text-zinc-400 shrink-0" />
                    <span>{plan.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-zinc-600">
                  {plan.productName}
                </TableCell>
                <TableCell className="capitalize text-zinc-700 font-medium">
                  {plan.interval}
                </TableCell>
                <TableCell className="text-right font-mono font-medium text-zinc-900">
                  ${plan.price.toFixed(2)}
                </TableCell>
                <TableCell className="text-center font-mono">
                  {plan.minQuantity}
                </TableCell>
                <TableCell className="text-center">
                  {plan.allowPause ? (
                    <span className="text-emerald-700 font-semibold text-xs">Yes</span>
                  ) : (
                    <span className="text-zinc-400 text-xs">No</span>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {plan.allowEarlyClose ? (
                    <span className="text-emerald-700 font-semibold text-xs">Yes</span>
                  ) : (
                    <span className="text-zinc-400 text-xs">No</span>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {plan.allowRenewal ? (
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
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
