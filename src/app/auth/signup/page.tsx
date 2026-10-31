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
import { Check, X, Shield, Lock, User, Mail, ArrowRight } from "lucide-react";

export default function SignUpPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const router = useRouter();

  const passwordValidation = validatePassword(password);
  const passwordsMatch = password && confirmPassword && password === confirmPassword;

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!fullName.trim()) {
      setErrorMsg("Please enter your full name.");
      return;
    }

    if (!email.trim()) {
      setErrorMsg("Please enter your email address.");
      return;
    }

    // Validate password rules
    if (!passwordValidation.isValid) {
      setErrorMsg(passwordValidation.errors[0] || "Password does not meet requirements.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    if (!supabase) {
      setErrorMsg("Supabase client is not configured.");
      return;
    }

    setIsLoading(true);

    try {
      // Security: Only full_name is sent in metadata. Never pass or accept a role!
      // The database trigger handle_new_user() automatically sets role = 'customer'.
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setErrorMsg(error.message);
      } else if (data.user) {
        if (data.session) {
          setSuccessMsg("Account created successfully! Redirecting to workspace...");
          setTimeout(() => {
            router.push("/");
            router.refresh();
          }, 1200);
        } else {
          // Email confirmation enabled in Supabase
          setSuccessMsg(
            "Registration submitted! Please check your email to confirm your account before signing in."
          );
        }
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "An unexpected error occurred during sign-up.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-md mx-auto space-y-6">
        <div className="text-center space-y-1.5">
          <div className="inline-flex h-9 w-9 items-center justify-center rounded bg-teal-700 text-white font-bold text-sm tracking-wider mb-1">
            SMS
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            Create Account
          </h1>
          <p className="text-xs text-zinc-500">
            Register for customer portal access and subscription management
          </p>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSignUp} className="space-y-4">
            {errorMsg && (
              <Alert variant="danger" title="Registration Error">
                {errorMsg}
              </Alert>
            )}

            {successMsg && (
              <Alert variant="success" title="Notice">
                {successMsg}
              </Alert>
            )}

            <Input
              label="Full Name or Company Representative"
              type="text"
              required
              placeholder="e.g. Jane Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={isLoading}
            />

            <Input
              label="Email Address"
              type="email"
              required
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />

            <Input
              label="Password"
              type="password"
              required
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />

            {/* Live Password Rules Checklist */}
            <div className="rounded-md border border-zinc-200 bg-zinc-50 p-3 space-y-1.5 text-xs">
              <p className="font-semibold text-zinc-700 text-[11px] uppercase tracking-wider">
                Password Requirements
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
              label="Confirm Password"
              type="password"
              required
              placeholder="••••••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
              error={
                confirmPassword && !passwordsMatch ? "Passwords do not match." : undefined
              }
            />

            <Button
              type="submit"
              className="w-full"
              isLoading={isLoading}
              disabled={isLoading || !passwordValidation.isValid || !passwordsMatch}
            >
              Complete Registration
            </Button>

            <div className="text-center pt-2 border-t border-zinc-100">
              <p className="text-xs text-zinc-500">
                Already have an account?{" "}
                <Link
                  href="/auth/login"
                  className="font-medium text-teal-700 hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </Card>

        {/* Security Policy Reminder */}
        <div className="p-3 rounded-md bg-zinc-100/70 border border-zinc-200 text-xs text-zinc-600 space-y-1">
          <div className="flex items-center gap-1.5 font-medium text-zinc-800 text-[11px]">
            <Shield className="h-4 w-4 text-teal-700 shrink-0" />
            Zero Privilege Escalation Policy
          </div>
          <p className="text-[11px] leading-relaxed">
            All self-registered accounts are automatically provisioned as Customers. Staff privileges must be authorized directly by an administrator inside the internal admin management portal.
          </p>
        </div>
      </div>
    </div>
  );
}
