"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signInWithMagicLink, SIGNUP_NAME_COOKIE } from "@/lib/supabase/client";

function setSignupNameCookie(name: string) {
  const value = encodeURIComponent(name.trim());
  document.cookie = `${SIGNUP_NAME_COOKIE}=${value}; path=/; max-age=600; SameSite=Lax`;
}

export function MagicAuth() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError("Please enter your email.");
      return;
    }
    setLoading(true);
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
    setLoading(false);
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
            We sent a magic link to <span className="text-white">{email}</span>.
            Click the link to sign in.
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
          Enter your email and we’ll send you a magic link.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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
              disabled={loading}
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
              disabled={loading}
              required
              autoComplete="email"
            />
          </div>
          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}
          <Button
            type="submit"
            className="w-full text-white"
            style={{ backgroundColor: "#1F1F1F" }}
            disabled={loading}
          >
            {loading ? "Sending…" : "Send Magic Link"}
          </Button>
        </form>
      </div>
    </div>
  );
}
