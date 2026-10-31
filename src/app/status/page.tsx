"use client";

import React from "react";
import { CheckCircle2, Circle, AlertCircle, Database, Shield, Layers, FileText, ExternalLink } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Alert } from "@/components/ui/Alert";
import { isSupabaseConfigured } from "@/lib/supabase";

export default function StatusPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="border-b border-zinc-200 pb-4">
        <h1 className="text-xl font-bold tracking-tight text-zinc-900">
          Project Implementation Status
        </h1>
        <p className="text-xs text-zinc-500 mt-1">
          Source of truth: <code className="font-mono text-zinc-700">antigravity-project-plan.md</code>
        </p>
      </div>

      {/* Phase Tracker */}
      <Card>
        <CardHeader>
          <CardTitle>Phase Road Map &amp; Deliverables</CardTitle>
          <CardDescription>
            Strict phase execution. No phase marked complete without satisfying its checklist.
          </CardDescription>
        </CardHeader>
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 rounded-md border border-emerald-200 bg-emerald-50/50">
            <CheckCircle2 className="h-5 w-5 text-emerald-700 shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-zinc-900">
                  Phase 1 — Project Setup and UI Foundation
                </span>
                <Badge variant="success">Completed</Badge>
              </div>
              <p className="text-xs text-zinc-600 mt-1">
                App shell, navigation, restrained palette (zinc neutrals + single purposeful teal accent), role-aware switcher, and destinations for Admin, Staff, and Customer.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-md border border-teal-200 bg-teal-50/40">
            <CheckCircle2 className="h-5 w-5 text-teal-700 shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-zinc-900">
                  Phase 2 — Supabase Setup, SQL Schema, and Access Rules
                </span>
                <Badge variant="accent">In Progress / SQL Ready</Badge>
              </div>
              <p className="text-xs text-zinc-600 mt-1">
                Repeatable schema file created at <code className="font-mono text-zinc-800">supabase/schema.sql</code> with 11 tables, RLS policies, duplicate period constraints, and performance indexes. Setup guide documented at <code className="font-mono text-zinc-800">supabase/README.md</code>. Ready to run in Supabase SQL Editor.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-md border border-zinc-200 bg-white">
            <Circle className="h-5 w-5 text-zinc-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-zinc-900">
                  Phase 3 — Authentication and Role-Based Views
                </span>
                <Badge variant="neutral">Pending Phase 2</Badge>
              </div>
              <p className="text-xs text-zinc-500 mt-1">
                Email/password sign-up, login, password reset flow, and secure Admin-only staff provisioning.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-md border border-zinc-200 bg-white">
            <Circle className="h-5 w-5 text-zinc-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-zinc-900">
                  Phase 4 — Products, Plans, Quotes, and Subscriptions
                </span>
                <Badge variant="neutral">Planned</Badge>
              </div>
              <p className="text-xs text-zinc-500 mt-1">
                Catalog CRUD, variant price adjustments, interval rules, and quotation-to-subscription lifecycle.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-md border border-zinc-200 bg-white">
            <Circle className="h-5 w-5 text-zinc-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-zinc-900">
                  Phase 5 — Invoices, Discounts, Payments, Dashboard, &amp; Performance
                </span>
                <Badge variant="neutral">Planned</Badge>
              </div>
              <p className="text-xs text-zinc-500 mt-1">
                Invoice runs, automatic discounts, manual payment logging, sub-2-second queries on large datasets.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-md border border-zinc-200 bg-white">
            <Circle className="h-5 w-5 text-zinc-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-zinc-900">
                  Phase 6 — Demo Polish and Video-Ready Flow
                </span>
                <Badge variant="neutral">Final</Badge>
              </div>
              <p className="text-xs text-zinc-500 mt-1">
                Sample seed data, end-to-end recording walkthrough showing Admin, Staff, and Customer journeys.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Supabase Connection Health Card */}
      <Card>
        <CardHeader>
          <CardTitle>Supabase Environment Readiness</CardTitle>
          <CardDescription>
            Zero-secret storage in code. Only public anon key used in browser.
          </CardDescription>
        </CardHeader>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded bg-zinc-50 border border-zinc-200">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-zinc-500" />
              <span className="text-xs font-medium text-zinc-800">
                Connection Status:
              </span>
            </div>
            {isSupabaseConfigured ? (
              <Badge variant="success">Configured &amp; Ready</Badge>
            ) : (
              <Badge variant="warning">Awaiting .env.local Credentials</Badge>
            )}
          </div>

          <div className="p-3 bg-zinc-50 rounded border border-zinc-200 font-mono text-[11px] text-zinc-700 space-y-1">
            <p># Copy .env.example to .env.local</p>
            <p>NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co</p>
            <p>NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-publishable-key</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
