"use client";

import React, { useState } from "react";
import { Percent, Plus, Tag, Calendar } from "lucide-react";
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

interface DiscountRule {
  id: string;
  name: string;
  type: "fixed" | "percentage";
  value: number;
  minPurchase: number;
  minQuantity: number;
  validity: string;
  usageLimit: number;
  usesCount: number;
  active: boolean;
}

const discountRules: DiscountRule[] = [
  {
    id: "disc-1",
    name: "Q4 Launch Promotion",
    type: "percentage",
    value: 15,
    minPurchase: 500,
    minQuantity: 1,
    validity: "2026-10-01 to 2026-12-31",
    usageLimit: 100,
    usesCount: 24,
    active: true,
  },
  {
    id: "disc-2",
    name: "High Volume Client Credit",
    type: "fixed",
    value: 150,
    minPurchase: 1000,
    minQuantity: 3,
    validity: "Active ongoing",
    usageLimit: 50,
    usesCount: 12,
    active: true,
  },
  {
    id: "disc-3",
    name: "Early Adopter Beta",
    type: "percentage",
    value: 20,
    minPurchase: 0,
    minQuantity: 1,
    validity: "Expired 2026-09-30",
    usageLimit: 25,
    usesCount: 25,
    active: false,
  },
];

export default function AdminDiscountsPage() {
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
            Define fixed or percentage discounts with minimum thresholds, usage caps, and validity windows.
          </p>
        </div>
        <Button size="sm">
          <Plus className="h-3.5 w-3.5" />
          Create Discount Rule
        </Button>
      </div>

      <Alert variant="info" title="Automatic Application Engine">
        Discounts can apply automatically during invoice generation when the subscription meets min quantity or purchase thresholds.
      </Alert>

      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rule Name</TableHead>
              <TableHead>Discount Type</TableHead>
              <TableHead className="text-right">Value</TableHead>
              <TableHead className="text-right">Min Purchase</TableHead>
              <TableHead className="text-center">Min Qty</TableHead>
              <TableHead>Validity Period</TableHead>
              <TableHead className="text-center">Usage Count</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {discountRules.map((disc) => (
              <TableRow key={disc.id}>
                <TableCell className="font-medium text-zinc-900">
                  <div className="flex items-center gap-2">
                    <Percent className="h-4 w-4 text-zinc-400 shrink-0" />
                    <span>{disc.name}</span>
                  </div>
                </TableCell>
                <TableCell className="capitalize text-zinc-600">
                  {disc.type}
                </TableCell>
                <TableCell className="text-right font-mono font-medium text-zinc-900">
                  {disc.type === "percentage" ? `${disc.value}%` : `$${disc.value.toFixed(2)}`}
                </TableCell>
                <TableCell className="text-right font-mono text-zinc-600">
                  ${disc.minPurchase.toFixed(2)}
                </TableCell>
                <TableCell className="text-center font-mono">
                  {disc.minQuantity}
                </TableCell>
                <TableCell className="text-zinc-500 text-xs font-mono">
                  {disc.validity}
                </TableCell>
                <TableCell className="text-center text-xs font-mono">
                  {disc.usesCount} / {disc.usageLimit}
                </TableCell>
                <TableCell>
                  <Badge variant={disc.active ? "success" : "neutral"}>
                    {disc.active ? "Active" : "Expired / Inactive"}
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
