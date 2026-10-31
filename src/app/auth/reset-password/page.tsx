"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { validatePassword } from "@/lib/auth/validation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { Check, X, Lock, CheckCircle2 } from "lucide-react";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const passwordValidation = validatePassword(password);
  const passwordsMatch = password && confirmPassword && password === confirmPassword;

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!passwordValidation.isValid) {
      setErrorMsg(passwordValidation.errors[0] || "Password does not meet requirements.");
      return;
    }

    if (!passwordsMatch) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    if (!supabase) {
      setErrorMsg("Supabase client is not configured.");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        setErrorMsg(error.message);
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push("/auth/login?reset=success");
        }, 1500);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "An unexpected error occurred while resetting password.");
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
            Set New Password
          </h1>
          <p className="text-xs text-zinc-500">
            Choose a strong password compliant with security rules
          </p>
        </div>

        <Card className="p-6">
          {success ? (
            <div className="text-center space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-semibold text-zinc-900">
                Password Successfully Updated
              </h3>
              <p className="text-xs text-zinc-600">
                Your password has been reset. Redirecting you to sign in...
              </p>
            </div>
          ) : (
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              {errorMsg && (
                <Alert variant="danger" title="Password Update Error">
                  {errorMsg}
                </Alert>
              )}

              <Input
                label="New Password"
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />

              {/* Password checklist */}
              <div className="rounded-md border border-zinc-200 bg-zinc-50 p-3 space-y-1.5 text-xs">
                <p className="font-semibold text-zinc-700 text-[11px] uppercase tracking-wider">
                  Password Policy Rules
                </p>
                <div className="space-y-1 text-zinc-600">
                  <div className="flex items-center gap-1.5">
                    {passwordValidation.rules.hasMinLength ? (
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <X className="h-3.5 w-3.5 text-zinc-400" />
                    )}
                    <span className={passwordValidation.rules.hasMinLength ? "text-emerald-700 font-medium" : ""}>
                      More than 8 characters (at least 9)
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {passwordValidation.rules.hasUppercase ? (
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <X className="h-3.5 w-3.5 text-zinc-400" />
                    )}
                    <span className={passwordValidation.rules.hasUppercase ? "text-emerald-700 font-medium" : ""}>
                      At least one uppercase letter (A-Z)
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {passwordValidation.rules.hasLowercase ? (
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <X className="h-3.5 w-3.5 text-zinc-400" />
                    )}
                    <span className={passwordValidation.rules.hasLowercase ? "text-emerald-700 font-medium" : ""}>
                      At least one lowercase letter (a-z)
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {passwordValidation.rules.hasSpecialChar ? (
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <X className="h-3.5 w-3.5 text-zinc-400" />
                    )}
                    <span className={passwordValidation.rules.hasSpecialChar ? "text-emerald-700 font-medium" : ""}>
                      At least one special character (!@#$%^&amp;*)
                    </span>
                  </div>
                </div>
              </div>

              <Input
                label="Confirm New Password"
                type="password"
                required
                placeholder="••••••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                error={confirmPassword && !passwordsMatch ? "Passwords do not match." : undefined}
              />

              <Button
                type="submit"
                className="w-full"
                isLoading={isLoading}
                disabled={isLoading || !passwordValidation.isValid || !passwordsMatch}
              >
                Update Password
              </Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
