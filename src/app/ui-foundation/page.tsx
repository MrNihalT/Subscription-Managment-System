"use client";

import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Alert } from "@/components/ui/Alert";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";
import { Check, Copy, Layers, Plus } from "lucide-react";

export default function UIFoundationPage() {
  const [copied, setCopied] = useState(false);

  const copyTokens = () => {
    navigator.clipboard.writeText("Neutral: Zinc / Gray, Accent: Teal-700 (#0f766e)");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="border-b border-zinc-200 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-zinc-900">
              UI Foundation &amp; Design Tokens
            </h1>
            <p className="text-xs text-zinc-500 mt-1">
              Specification compliance: restrained neutral palette, one purposeful teal accent, crisp scannable tables, and short forms.
            </p>
          </div>
          <Button size="sm" variant="outline" onClick={copyTokens}>
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-600" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                Copy Tokens
              </>
            )}
          </Button>
        </div>
      </div>

      {/* 1. Color Palette Tokens */}
      <Card>
        <CardHeader>
          <CardTitle>1. Color Palette &amp; Contrast</CardTitle>
          <CardDescription>
            Calm, high-contrast palette avoiding trendy gradients or saturated blue/rose schemes.
          </CardDescription>
        </CardHeader>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          <div className="p-3 rounded border border-zinc-200 bg-white">
            <div className="h-10 rounded bg-white border border-zinc-300 mb-2" />
            <p className="text-xs font-semibold text-zinc-900">Base White</p>
            <p className="text-[11px] text-zinc-500 font-mono">#ffffff</p>
          </div>
          <div className="p-3 rounded border border-zinc-200 bg-white">
            <div className="h-10 rounded bg-zinc-50 border border-zinc-200 mb-2" />
            <p className="text-xs font-semibold text-zinc-900">Surface Gray</p>
            <p className="text-[11px] text-zinc-500 font-mono">zinc-50</p>
          </div>
          <div className="p-3 rounded border border-zinc-200 bg-white">
            <div className="h-10 rounded bg-zinc-200 mb-2" />
            <p className="text-xs font-semibold text-zinc-900">Subtle Border</p>
            <p className="text-[11px] text-zinc-500 font-mono">zinc-200</p>
          </div>
          <div className="p-3 rounded border border-zinc-200 bg-white">
            <div className="h-10 rounded bg-zinc-700 mb-2" />
            <p className="text-xs font-semibold text-zinc-900">Muted Text</p>
            <p className="text-[11px] text-zinc-500 font-mono">zinc-700</p>
          </div>
          <div className="p-3 rounded border border-zinc-200 bg-white">
            <div className="h-10 rounded bg-zinc-900 mb-2" />
            <p className="text-xs font-semibold text-zinc-900">Dark Foreground</p>
            <p className="text-[11px] text-zinc-500 font-mono">zinc-900</p>
          </div>
          <div className="p-3 rounded border border-teal-300 bg-teal-50/50">
            <div className="h-10 rounded bg-teal-700 mb-2" />
            <p className="text-xs font-semibold text-teal-900">Purposeful Accent</p>
            <p className="text-[11px] text-teal-700 font-mono">teal-700 (#0f766e)</p>
          </div>
        </div>
      </Card>

      {/* 2. Typography Hierarchy */}
      <Card>
        <CardHeader>
          <CardTitle>2. Typography Hierarchy</CardTitle>
          <CardDescription>
            System sans-serif with readable tracking and tabular numbers for financial and quantity data.
          </CardDescription>
        </CardHeader>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between border-b border-zinc-100 pb-2">
            <span className="text-2xl font-bold tracking-tight text-zinc-900">
              Heading 1 — Display (24px)
            </span>
            <span className="text-xs font-mono text-zinc-400">text-2xl font-bold tracking-tight</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between border-b border-zinc-100 pb-2">
            <span className="text-xl font-semibold tracking-tight text-zinc-900">
              Heading 2 — Section Header (20px)
            </span>
            <span className="text-xs font-mono text-zinc-400">text-xl font-semibold tracking-tight</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between border-b border-zinc-100 pb-2">
            <span className="text-base font-semibold text-zinc-900">
              Heading 3 — Card Title (16px)
            </span>
            <span className="text-xs font-mono text-zinc-400">text-base font-semibold</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between border-b border-zinc-100 pb-2">
            <span className="text-sm text-zinc-800">
              Body Text — Default paragraphs, field labels, and descriptions (14px)
            </span>
            <span className="text-xs font-mono text-zinc-400">text-sm text-zinc-800</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between">
            <span className="text-sm font-mono tabular-nums text-zinc-900 font-medium">
              Tabular Numerals: $12,490.50 | Period: 2026-10-31 | Quantity: 1,500
            </span>
            <span className="text-xs font-mono text-zinc-400">font-mono tabular-nums</span>
          </div>
        </div>
      </Card>

      {/* 3. Button Component States */}
      <Card>
        <CardHeader>
          <CardTitle>3. Action Controls &amp; Buttons</CardTitle>
          <CardDescription>
            High visual clarity with distinct hierarchy, active focus ring, and loading states.
          </CardDescription>
        </CardHeader>
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary">Primary (Teal)</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Destructive</Button>
          </div>
          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-zinc-100">
            <Button size="sm">Small (32px)</Button>
            <Button size="md">Medium (36px)</Button>
            <Button size="lg">Large (40px)</Button>
            <Button isLoading>Processing</Button>
            <Button disabled>Disabled</Button>
          </div>
        </div>
      </Card>

      {/* 4. Status Badges */}
      <Card>
        <CardHeader>
          <CardTitle>4. Status Badges</CardTitle>
          <CardDescription>
            Restrained semantic indicators for subscription lifecycles and invoice states.
          </CardDescription>
        </CardHeader>
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="neutral">Draft</Badge>
          <Badge variant="accent">Quotation</Badge>
          <Badge variant="success">Active / Paid</Badge>
          <Badge variant="warning">Paused / Pending</Badge>
          <Badge variant="danger">Closed / Cancelled</Badge>
          <Badge variant="outline">Standard Tier</Badge>
        </div>
      </Card>

      {/* 5. Forms & Input Fields */}
      <Card>
        <CardHeader>
          <CardTitle>5. Form Controls</CardTitle>
          <CardDescription>
            Accessible labels, placeholder styling, error states, and helper descriptions.
          </CardDescription>
        </CardHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Product Name"
            placeholder="e.g. Cloud Dedicated Server"
            helperText="Internal identifier used for subscription lines"
          />
          <Select
            label="Billing Interval"
            defaultValue="monthly"
            options={[
              { value: "daily", label: "Daily" },
              { value: "weekly", label: "Weekly" },
              { value: "monthly", label: "Monthly" },
              { value: "yearly", label: "Yearly" },
            ]}
            helperText="Determines recurring invoice frequency"
          />
          <Input
            label="Sales Price ($)"
            type="number"
            defaultValue="199.00"
            helperText="Base sales price before variant adjustments"
          />
          <Input
            label="Validation Example"
            defaultValue="invalid-format"
            error="Please enter a valid format adhering to ISO specifications"
          />
        </div>
      </Card>

      {/* 6. Data Tables */}
      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b border-zinc-200">
          <h3 className="text-base font-semibold text-zinc-900">
            6. High-Density Data Table
          </h3>
          <p className="text-xs text-zinc-500">
            Built for scanning large datasets with crisp dividers and numeric right alignment.
          </p>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Billing Period</TableHead>
              <TableHead className="text-right">Subtotal</TableHead>
              <TableHead className="text-right">Tax</TableHead>
              <TableHead className="text-right">Total Due</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-mono text-xs font-medium">INV-2026-0042</TableCell>
              <TableCell className="font-medium text-zinc-900">Apex Retail Group</TableCell>
              <TableCell className="text-zinc-600">2026-10-01 → 2026-10-31</TableCell>
              <TableCell className="text-right font-mono">$1,200.00</TableCell>
              <TableCell className="text-right font-mono">$120.00</TableCell>
              <TableCell className="text-right font-mono font-medium text-zinc-900">$1,320.00</TableCell>
              <TableCell><Badge variant="success">Paid</Badge></TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-mono text-xs font-medium">INV-2026-0043</TableCell>
              <TableCell className="font-medium text-zinc-900">BioHealth Systems</TableCell>
              <TableCell className="text-zinc-600">2026-10-01 → 2026-10-31</TableCell>
              <TableCell className="text-right font-mono">$3,400.00</TableCell>
              <TableCell className="text-right font-mono">$340.00</TableCell>
              <TableCell className="text-right font-mono font-medium text-zinc-900">$3,740.00</TableCell>
              <TableCell><Badge variant="warning">Confirmed</Badge></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Card>

      {/* 7. Empty State */}
      <Card>
        <CardHeader>
          <CardTitle>7. Useful Empty States</CardTitle>
          <CardDescription>
            Clear guidance when no records are found or prior to first configuration.
          </CardDescription>
        </CardHeader>
        <EmptyState
          icon={Layers}
          title="No Active Subscriptions Found"
          description="There are currently no active subscriptions matching your search filter. Create a quotation or reset your filter criteria."
          actionLabel="Create Quotation"
          onAction={() => alert("Action triggered")}
        />
      </Card>
    </div>
  );
}
