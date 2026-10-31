"use client";

import React, { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!email.trim()) {
      setErrorMsg("Please enter your email address.");
      return;
    }

    if (!supabase) {
      setErrorMsg("Supabase client is not configured.");
      return;
    }

    setIsLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/auth/callback?next=/auth/reset-password`;

      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: redirectUrl,
      });

      if (error) {
        setErrorMsg(error.message);
      } else {
        setSuccess(true);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-md mx-auto space-y-6">
        <div className="text-center space-y-1.5">
          <div className="inline-flex h-9 w-9 items-center justify-center rounded bg-teal-700 text-white font-bold text-sm tracking-wider mb-1">
            SMS
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            Reset Password
          </h1>
          <p className="text-xs text-zinc-500">
            Receive a secure link to create a new password
          </p>
        </div>

        <Card className="p-6">
          {success ? (
            <div className="space-y-4 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-zinc-900">
                  Password Reset Email Sent
                </h3>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  We have sent a secure password reset link to <strong className="text-zinc-800">{email}</strong>. Click the link in the email to set a new password.
                </p>
              </div>
              <div className="pt-2">
                <Link href="/auth/login">
                  <Button variant="outline" size="sm" className="w-full">
                    <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                    Back to Sign In
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleResetRequest} className="space-y-4">
              {errorMsg && (
                <Alert variant="danger" title="Reset Error">
                  {errorMsg}
                </Alert>
              )}

              <p className="text-xs text-zinc-600 leading-relaxed">
                Enter your registered email address and we will dispatch a password recovery link.
              </p>

              <Input
                label="Registered Email Address"
                type="email"
                required
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />

              <Button
                type="submit"
                className="w-full"
                isLoading={isLoading}
                disabled={isLoading}
              >
                Send Password Reset Email
              </Button>

              <div className="text-center pt-2 border-t border-zinc-100">
                <Link
                  href="/auth/login"
                  className="text-xs font-medium text-teal-700 hover:underline flex items-center justify-center gap-1"
                >
                  <ArrowLeft className="h-3 w-3" /> Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
