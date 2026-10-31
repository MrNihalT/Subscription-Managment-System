"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRole } from "@/context/RoleContext";
import { isSupabaseConfigured } from "@/lib/supabase";
import {
  LayoutDashboard,
  Package,
  Layers,
  Users,
  Percent,
  FileText,
  CreditCard,
  Building2,
  ShieldAlert,
  Sliders,
  Palette,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Menu,
  X,
  ChevronRight,
  Database,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: Array<"admin" | "staff" | "customer">;
  badge?: string;
}

const navItems: NavItem[] = [
  // Admin & Staff Dashboard
  {
    name: "Dashboard & Overview",
    href: "/",
    icon: LayoutDashboard,
    roles: ["admin", "staff"],
  },
  // Admin items
  {
    name: "Products & Variants",
    href: "/admin/products",
    icon: Package,
    roles: ["admin"],
  },
  {
    name: "Billing Plans",
    href: "/admin/plans",
    icon: Layers,
    roles: ["admin"],
  },
  {
    name: "Staff Management",
    href: "/admin/staff",
    icon: Users,
    roles: ["admin"],
    badge: "Admin Only",
  },
  {
    name: "Discounts & Promos",
    href: "/admin/discounts",
    icon: Percent,
    roles: ["admin"],
  },

  // Staff items
  {
    name: "Customers Directory",
    href: "/staff/customers",
    icon: Building2,
    roles: ["staff"],
  },
  {
    name: "Quotes & Subscriptions",
    href: "/staff/subscriptions",
    icon: FileText,
    roles: ["staff"],
  },
  {
    name: "Invoices & Billing",
    href: "/staff/invoices",
    icon: CreditCard,
    roles: ["staff"],
  },
  {
    name: "Manual Payment Log",
    href: "/staff/payments",
    icon: CheckCircle,
    roles: ["staff"],
  },

  // Customer items
  {
    name: "Customer Portal",
    href: "/customer/portal",
    icon: LayoutDashboard,
    roles: ["customer"],
  },
  {
    name: "My Subscriptions",
    href: "/customer/subscriptions",
    icon: Layers,
    roles: ["customer"],
  },
  {
    name: "My Invoices",
    href: "/customer/invoices",
    icon: FileText,
    roles: ["customer"],
  },
];

export const AppShell: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { role, setRole, mockUser } = useRole();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showEnvModal, setShowEnvModal] = useState(false);

  const filteredNav = navItems.filter((item) => item.roles.includes(role));

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 text-zinc-900 font-sans selection:bg-teal-100 selection:text-teal-900">
      {/* Top Banner / System Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-zinc-200 bg-white/95 backdrop-blur-xs">
        <div className="flex h-14 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 text-zinc-600 hover:text-zinc-900 rounded-md hover:bg-zinc-100"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>

            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded bg-teal-700 text-white font-semibold text-xs tracking-wider">
                SMS
              </div>
              <span className="font-semibold text-sm tracking-tight text-zinc-900">
                Subscription Manager
              </span>
            </Link>

            <div className="hidden sm:flex items-center pl-2">
              <Badge variant="neutral" className="text-[10px] uppercase font-mono">
                Phase 1 Shell
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Supabase status indicator */}
            <button
              onClick={() => setShowEnvModal(true)}
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 transition-colors"
              title="Click to check Supabase configuration status"
            >
              <Database className="h-3.5 w-3.5 text-zinc-600" />
              <span className="text-zinc-600 font-medium">Supabase:</span>
              {isSupabaseConfigured ? (
                <span className="flex items-center gap-1 text-emerald-700 font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Connected
                </span>
              ) : (
                <span className="flex items-center gap-1 text-amber-700 font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                  Awaiting .env.local
                </span>
              )}
            </button>

            {/* Interactive Role Switcher */}
            <div className="flex items-center rounded-md border border-zinc-200 bg-zinc-100 p-0.5 text-xs">
              <span className="px-2 text-zinc-500 font-medium hidden sm:inline">
                Role:
              </span>
              <button
                onClick={() => setRole("admin")}
                className={`px-2 py-1 rounded font-medium transition-all ${
                  role === "admin"
                    ? "bg-white text-zinc-900 shadow-2xs font-semibold"
                    : "text-zinc-600 hover:text-zinc-900"
                }`}
              >
                Admin
              </button>
              <button
                onClick={() => setRole("staff")}
                className={`px-2 py-1 rounded font-medium transition-all ${
                  role === "staff"
                    ? "bg-white text-zinc-900 shadow-2xs font-semibold"
                    : "text-zinc-600 hover:text-zinc-900"
                }`}
              >
                Staff
              </button>
              <button
                onClick={() => setRole("customer")}
                className={`px-2 py-1 rounded font-medium transition-all ${
                  role === "customer"
                    ? "bg-white text-zinc-900 shadow-2xs font-semibold"
                    : "text-zinc-600 hover:text-zinc-900"
                }`}
              >
                Customer
              </button>
            </div>

            {/* User profile capsule */}
            <div className="hidden xl:flex items-center gap-2 pl-2 border-l border-zinc-200">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-200 text-zinc-700 font-medium text-xs">
                {mockUser.name.charAt(0)}
              </div>
              <div className="text-left text-xs leading-none">
                <p className="font-medium text-zinc-800">{mockUser.name}</p>
                <p className="text-[10px] text-zinc-500 mt-0.5">{mockUser.email}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex max-w-(--breakpoint-2xl) w-full mx-auto">
        {/* Sidebar Navigation */}
        <aside
          className={`fixed inset-y-0 left-0 z-30 w-64 border-r border-zinc-200 bg-white transform transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="h-full flex flex-col pt-16 lg:pt-4 px-3 pb-6">
            <div className="px-3 pb-3 border-b border-zinc-100 mb-2">
              <p className="text-[11px] font-semibold tracking-wider uppercase text-zinc-400">
                Active Perspective
              </p>
              <div className="flex items-center justify-between mt-1">
                <span className="font-semibold text-sm capitalize text-zinc-900">
                  {role} Workspace
                </span>
                <Badge
                  variant={
                    role === "admin"
                      ? "danger"
                      : role === "staff"
                      ? "accent"
                      : "success"
                  }
                >
                  {role}
                </Badge>
              </div>
            </div>

            <nav className="flex-1 space-y-1">
              <p className="px-3 pt-2 pb-1 text-[10px] font-medium tracking-wider uppercase text-zinc-400">
                Role Destinations
              </p>
              {filteredNav.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                      active
                        ? "bg-teal-50 text-teal-900 font-semibold border-l-2 border-teal-700"
                        : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="h-4 w-4 shrink-0" />
                      <span>{item.name}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[10px] bg-zinc-200/60 text-zinc-600 px-1.5 py-0.5 rounded">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}

              <div className="pt-4 border-t border-zinc-100 mt-4">
                <p className="px-3 pb-1 text-[10px] font-medium tracking-wider uppercase text-zinc-400">
                  Foundation & Docs
                </p>
                <Link
                  href="/ui-foundation"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                    pathname === "/ui-foundation"
                      ? "bg-teal-50 text-teal-900 font-semibold border-l-2 border-teal-700"
                      : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                  }`}
                >
                  <Palette className="h-4 w-4 shrink-0 text-zinc-500" />
                  <span>UI Foundation & Tokens</span>
                </Link>
                <Link
                  href="/status"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                    pathname === "/status"
                      ? "bg-teal-50 text-teal-900 font-semibold border-l-2 border-teal-700"
                      : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                  }`}
                >
                  <Sliders className="h-4 w-4 shrink-0 text-zinc-500" />
                  <span>Phase 1 Architecture</span>
                </Link>
              </div>
            </nav>

            {/* Bottom info widget */}
            <div className="mt-auto pt-3 border-t border-zinc-200">
              <div className="rounded bg-zinc-100/70 p-2.5 border border-zinc-200 text-xs">
                <div className="flex items-center gap-1.5 font-medium text-zinc-800 text-[11px]">
                  <CheckCircle className="h-3.5 w-3.5 text-teal-700" />
                  Phase 1 Compliant
                </div>
                <p className="text-[11px] text-zinc-500 mt-1">
                  Clean app shell, typography, forms, tables, and role destinations.
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile backdrop */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 z-20 bg-zinc-900/40 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* Supabase Config Guidance Modal */}
      {showEnvModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/50 p-4">
          <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-lg border border-zinc-200">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-teal-700" />
                <h3 className="font-semibold text-base text-zinc-900">
                  Supabase Environment Status
                </h3>
              </div>
              <button
                onClick={() => setShowEnvModal(false)}
                className="text-zinc-400 hover:text-zinc-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs text-zinc-700">
              <p>
                As required by <strong>Phase 1</strong>, the app keeps all secrets out
                of source control and client code.
              </p>

              <div className="rounded border border-zinc-200 bg-zinc-50 p-3 font-mono text-[11px] text-zinc-800">
                <div>NEXT_PUBLIC_SUPABASE_URL=...</div>
                <div>NEXT_PUBLIC_SUPABASE_ANON_KEY=...</div>
              </div>

              <p className="text-zinc-600">
                To connect the existing Supabase project, provide these two public
                credentials in a local <code className="bg-zinc-100 px-1 py-0.5 rounded text-zinc-800">.env.local</code> file (referenced in <code className="bg-zinc-100 px-1 py-0.5 rounded text-zinc-800">.env.example</code>).
              </p>

              <div className="rounded bg-teal-50 border border-teal-200 p-2.5 text-teal-900">
                <strong>Phase 2 Note:</strong> SQL schema creation, table migrations, and RLS policies are reserved for Phase 2. No tables or queries will be run in Phase 1.
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-zinc-100">
              <Button size="sm" onClick={() => setShowEnvModal(false)}>
                Dismiss
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
