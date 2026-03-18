"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  signInWithMagicLink,
  signInWithPassword,
  signUpWithPassword,
  resetPasswordForEmail,
  SIGNUP_NAME_COOKIE,
} from "@/lib/supabase/client";

function setSignupNameCookie(name: string) {
  const value = encodeURIComponent(name.trim());
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${SIGNUP_NAME_COOKIE}=${value}; path=/; max-age=600; SameSite=Lax${secure}`;
}

type AuthMode = "magic" | "signin" | "signup" | "forgot";
type Action = "sign-in" | "sign-up" | "magic-link" | "reset-request" | null;

const inputClass =
  "w-full border bg-transparent text-white placeholder:opacity-60";
const inputStyle = { borderColor: "#2E2E2E" };
const mutedStyle = { color: "#BCBCBC" };
const cardStyle = { borderColor: "#2E2E2E" };
const bgStyle = { backgroundColor: "#090909" };
const btnSolidStyle = { backgroundColor: "#1F1F1F" };
const btnOutlineStyle = { borderColor: "#2E2E2E", backgroundColor: "transparent" };

export function MagicAuth() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("magic");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loadingAction, setLoadingAction] = useState<Action>(null);
  const [success, setSuccess] = useState(false);
  const [successConfirmEmail, setSuccessConfirmEmail] = useState(false);
  const [successResetEmail, setSuccessResetEmail] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const busy = loadingAction !== null;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError("Please enter your email.");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }
    setLoadingAction("sign-in");
    const { error: err } = await signInWithPassword(trimmedEmail, password);
    setLoadingAction(null);
    if (err) {
      setError(err.message);
      return;
    }
    router.refresh();
    window.location.href = "/";
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError("Please enter your email.");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }
    setLoadingAction("sign-up");
    const { data, error: err } = await signUpWithPassword(
      trimmedEmail,
      password,
      name.trim() || undefined,
    );
    setLoadingAction(null);
    if (err) {
      setError(err.message);
      return;
    }
    if (data?.session) {
      router.refresh();
      window.location.href = "/";
      return;
    }
    setSuccessConfirmEmail(true);
    setSuccess(true);
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError("Please enter your email.");
      return;
    }
    setLoadingAction("magic-link");
    const nameTrimmed = name.trim();
    if (nameTrimmed) {
      setSignupNameCookie(nameTrimmed);
    }
    const emailRedirectTo =
      typeof window !== "undefined"
        ? `${window.location.origin}/auth/callback`
        : undefined;
    const { error: err } = await signInWithMagicLink(trimmedEmail, {
      emailRedirectTo,
    });
    setLoadingAction(null);
    if (err) {
      setError(err.message);
      return;
    }
    setSuccess(true);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError("Please enter your email.");
      return;
    }
    setLoadingAction("reset-request");
    const { error: err } = await resetPasswordForEmail(trimmedEmail);
    setLoadingAction(null);
    if (err) {
      setError(err.message);
      return;
    }
    setSuccessResetEmail(true);
    setSuccess(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    if (mode === "magic") return handleMagicLink(e);
    if (mode === "signin") return handleSignIn(e);
    if (mode === "forgot") return handleForgotPassword(e);
    return handleSignUp(e);
  };

  if (success) {
    return (
      <div
        className="flex min-h-screen flex-col items-center justify-center px-4"
        style={bgStyle}
      >
        <div
          className="w-full max-w-sm rounded-lg border p-6 text-center"
          style={cardStyle}
        >
          <p className="text-white">Check your email</p>
          <p className="mt-2 text-sm" style={mutedStyle}>
            {successResetEmail ? (
              <>
                We sent a password reset link to{" "}
                <span className="text-white">{email}</span>. Click the link to
                set a new password.
              </>
            ) : successConfirmEmail ? (
              <>
                We sent a confirmation link to{" "}
                <span className="text-white">{email}</span>. Click the link to
                confirm your account and sign in.
              </>
            ) : (
              <>
                We sent a magic link to{" "}
                <span className="text-white">{email}</span>. Click the link to
                sign in.
              </>
            )}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-4"
      style={bgStyle}
    >
      <div
        className="w-full max-w-sm rounded-lg border p-6"
        style={cardStyle}
      >
        <h1 className="text-xl font-semibold text-white">
          {mode === "forgot" ? "Reset password" : "Sign in"}
        </h1>
        <p className="mt-1 text-sm" style={mutedStyle}>
          {mode === "forgot"
            ? "Enter your email and we\u2019ll send you a reset link."
            : "Choose how you'd like to sign in or create an account."}
        </p>

        {mode !== "forgot" && (
          <div className="mt-4 flex gap-1 rounded-md p-0.5" style={{ backgroundColor: "#1F1F1F" }}>
            <button
              type="button"
              onClick={() => { setMode("magic"); setError(null); }}
              className="flex-1 rounded px-3 py-2 text-sm font-medium transition-colors"
              style={
                mode === "magic"
                  ? { backgroundColor: "#2E2E2E", color: "#fff" }
                  : mutedStyle
              }
            >
              Continue with Magic Link
            </button>
            <button
              type="button"
              onClick={() => { setMode("signin"); setError(null); }}
              className="flex-1 rounded px-3 py-2 text-sm font-medium transition-colors"
              style={
                mode === "signin"
                  ? { backgroundColor: "#2E2E2E", color: "#fff" }
                  : mutedStyle
              }
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode("signup"); setError(null); }}
              className="flex-1 rounded px-3 py-2 text-sm font-medium transition-colors"
              style={
                mode === "signup"
                  ? { backgroundColor: "#2E2E2E", color: "#fff" }
                  : mutedStyle
              }
            >
              Create Account
            </button>
          </div>
        )}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          {(mode === "magic" || mode === "signup") && (
            <div>
              <label htmlFor="name" className="mb-1.5 block text-sm text-white">
                Name <span style={mutedStyle}>(optional)</span>
              </label>
              <Input
                id="name"
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
                style={inputStyle}
                disabled={busy}
                autoComplete="name"
              />
            </div>
          )}
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm text-white">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              style={inputStyle}
              disabled={busy}
              required
              autoComplete="email"
            />
          </div>
          {(mode === "signin" || mode === "signup") && (
            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm text-white">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${inputClass} pr-10`}
                  style={inputStyle}
                  disabled={busy}
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 transition-opacity hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-white/20"
                  style={mutedStyle}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" aria-hidden />
                  ) : (
                    <Eye className="h-4 w-4" aria-hidden />
                  )}
                </button>
              </div>
              {mode === "signin" && (
                <button
                  type="button"
                  onClick={() => { setMode("forgot"); setError(null); }}
                  className="mt-1.5 text-sm hover:underline"
                  style={mutedStyle}
                >
                  Forgot password?
                </button>
              )}
            </div>
          )}
          {error && <p className="text-sm text-red-400">{error}</p>}
          <Button
            type="submit"
            className="w-full text-white"
            style={mode === "magic" ? btnOutlineStyle : btnSolidStyle}
            disabled={busy}
          >
            {mode === "magic" &&
              (loadingAction === "magic-link" ? "Sending\u2026" : "Send Magic Link")}
            {mode === "signin" &&
              (loadingAction === "sign-in" ? "Signing in\u2026" : "Sign In")}
            {mode === "signup" &&
              (loadingAction === "sign-up" ? "Signing up\u2026" : "Create Account")}
            {mode === "forgot" &&
              (loadingAction === "reset-request" ? "Sending\u2026" : "Send Reset Link")}
          </Button>
          {mode === "forgot" && (
            <button
              type="button"
              onClick={() => { setMode("signin"); setError(null); }}
              className="w-full text-center text-sm hover:underline"
              style={mutedStyle}
            >
              Back to Sign In
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
