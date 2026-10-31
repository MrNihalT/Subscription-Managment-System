"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Lock, Mail, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/";
  const resetSuccess = searchParams.get("reset") === "success";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!email || !password) {
      setErrorMsg("Please enter both email address and password.");
      return;
    }

    if (!supabase) {
      setErrorMsg("Supabase client is not configured. Check your environment variables.");
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMsg(error.message || "Invalid login credentials.");
      } else if (data.session) {
        setSuccessMsg("Signed in successfully. Redirecting...");
        router.push(redirectPath);
        router.refresh();
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "An unexpected error occurred during sign-in.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="text-center space-y-1.5">
        <div className="inline-flex h-9 w-9 items-center justify-center rounded bg-teal-700 text-white font-bold text-sm tracking-wider mb-1">
          SMS
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
          Sign In
        </h1>
        <p className="text-xs text-zinc-500">
          Subscription Management System — Secure Role Access
        </p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleLogin} className="space-y-4">
          {resetSuccess && (
            <Alert variant="success" title="Password Reset Complete">
              Your password has been successfully updated. You can now log in with your new password.
            </Alert>
          )}

          {errorMsg && (
            <Alert variant="danger" title="Authentication Error">
              {errorMsg}
            </Alert>
          )}

          {successMsg && (
            <Alert variant="success" title="Success">
              {successMsg}
            </Alert>
          )}

          <div className="space-y-1">
            <Input
              label="Email Address"
              type="email"
              autoComplete="email"
              required
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-medium text-zinc-700">
                Password
              </label>
              <Link
                href="/auth/forgot-password"
                className="text-xs text-teal-700 hover:text-teal-800 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              type="password"
              autoComplete="current-password"
              required
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            isLoading={isLoading}
            disabled={isLoading}
          >
            Sign In to Workspace
          </Button>

          <div className="text-center pt-2 border-t border-zinc-100">
            <p className="text-xs text-zinc-500">
              Don&apos;t have an account yet?{" "}
              <Link
                href="/auth/signup"
                className="font-medium text-teal-700 hover:underline"
              >
                Create a customer account
              </Link>
            </p>
          </div>
        </form>
      </Card>

      {/* Role and Access Architecture Note */}
      <div className="p-3 rounded-md bg-zinc-100/70 border border-zinc-200 text-xs text-zinc-600 space-y-1">
        <div className="flex items-center gap-1.5 font-medium text-zinc-800 text-[11px]">
          <ShieldCheck className="h-4 w-4 text-teal-700 shrink-0" />
          Role-Based Access Enforcement
        </div>
        <p className="text-[11px] leading-relaxed">
          Users are mapped to their role strictly from the trusted database <code className="bg-white px-1 py-0.5 rounded border border-zinc-200 text-zinc-800">public.profiles</code> table. Admins and Staff are provisioned via administrative authorization.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center py-10 px-4">
      <Suspense fallback={<div className="text-xs text-zinc-500">Loading sign in...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
