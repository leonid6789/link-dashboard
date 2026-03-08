"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  signInWithMagicLink,
  signInWithPassword,
  signUpWithPassword,
  SIGNUP_NAME_COOKIE,
} from "@/lib/supabase/client";

function setSignupNameCookie(name: string) {
  const value = encodeURIComponent(name.trim());
  document.cookie = `${SIGNUP_NAME_COOKIE}=${value}; path=/; max-age=600; SameSite=Lax`;
}

type Action = "sign-in" | "sign-up" | "magic-link" | null;

export function MagicAuth() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loadingAction, setLoadingAction] = useState<Action>(null);
  const [success, setSuccess] = useState(false);
  const [successConfirmEmail, setSuccessConfirmEmail] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  if (success) {
    return (
      <div
        className="flex min-h-screen flex-col items-center justify-center px-4"
        style={{ backgroundColor: "#090909" }}
      >
        <div
          className="w-full max-w-sm rounded-lg border p-6 text-center"
          style={{ borderColor: "#2E2E2E" }}
        >
          <p className="text-white">Check your email</p>
          <p className="mt-2 text-sm" style={{ color: "#BCBCBC" }}>
            {successConfirmEmail ? (
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
      style={{ backgroundColor: "#090909" }}
    >
      <div
        className="w-full max-w-sm rounded-lg border p-6"
        style={{ borderColor: "#2E2E2E" }}
      >
        <h1 className="text-xl font-semibold text-white">Sign in</h1>
        <p className="mt-1 text-sm" style={{ color: "#BCBCBC" }}>
          Sign in with email and password, or use a magic link.
        </p>
        <form className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="name"
              className="mb-1.5 block text-sm text-white"
            >
              Name <span style={{ color: "#BCBCBC" }}>(optional)</span>
            </label>
            <Input
              id="name"
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border bg-transparent text-white placeholder:opacity-60"
              style={{ borderColor: "#2E2E2E" }}
              disabled={busy}
              autoComplete="name"
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-sm text-white"
            >
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border bg-transparent text-white placeholder:opacity-60"
              style={{ borderColor: "#2E2E2E" }}
              disabled={busy}
              required
              autoComplete="email"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-sm text-white"
            >
              Password
            </label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border bg-transparent text-white placeholder:opacity-60"
              style={{ borderColor: "#2E2E2E" }}
              disabled={busy}
              autoComplete="current-password"
            />
          </div>
          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}
          <div className="flex flex-col gap-2">
            <Button
              type="button"
              onClick={handleSignIn}
              className="w-full text-white"
              style={{ backgroundColor: "#1F1F1F" }}
              disabled={busy}
            >
              {loadingAction === "sign-in"
                ? "Signing in…"
                : "Sign In"}
            </Button>
            <Button
              type="button"
              onClick={handleSignUp}
              className="w-full text-white"
              style={{ backgroundColor: "#1F1F1F" }}
              disabled={busy}
            >
              {loadingAction === "sign-up"
                ? "Signing up…"
                : "Sign Up"}
            </Button>
            <Button
              type="button"
              onClick={handleMagicLink}
              variant="outline"
              className="w-full text-white"
              style={{
                borderColor: "#2E2E2E",
                backgroundColor: "transparent",
              }}
              disabled={busy}
            >
              {loadingAction === "magic-link"
                ? "Sending…"
                : "Send Magic Link"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
