"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateUserPassword } from "@/lib/supabase/client";

const inputClass =
  "w-full border bg-transparent text-white placeholder:opacity-60";
const inputStyle = { borderColor: "#2E2E2E" };
const mutedStyle = { color: "#BCBCBC" };
const cardStyle = { borderColor: "#2E2E2E" };
const bgStyle = { backgroundColor: "#090909" };
const btnSolidStyle = { backgroundColor: "#1F1F1F" };

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!newPassword) {
      setError("Please enter a new password.");
      return;
    }
    if (!confirmPassword) {
      setError("Please confirm your new password.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const { error: err } = await updateUserPassword(newPassword);
    setLoading(false);

    if (err) {
      setError(err.message);
      return;
    }

    setDone(true);
  };

  if (done) {
    return (
      <div
        className="flex min-h-screen flex-col items-center justify-center px-4"
        style={bgStyle}
      >
        <div
          className="w-full max-w-sm rounded-lg border p-6 text-center"
          style={cardStyle}
        >
          <p className="text-white">Password updated</p>
          <p className="mt-2 text-sm" style={mutedStyle}>
            Your password has been successfully reset.
          </p>
          <a
            href="/"
            className="mt-4 inline-block text-sm hover:underline"
            style={mutedStyle}
          >
            Click Here - Go to Dashboard
          </a>
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
        <h1 className="text-xl font-semibold text-white">Set new password</h1>
        <p className="mt-1 text-sm" style={mutedStyle}>
          Enter and confirm your new password below.
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="new-password" className="mb-1.5 block text-sm text-white">
              New password
            </label>
            <div className="relative">
              <Input
                id="new-password"
                type={showNew ? "text" : "password"}
                placeholder="Enter your new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={`${inputClass} pr-10`}
                style={inputStyle}
                disabled={loading}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowNew((prev) => !prev)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 transition-opacity hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-white/20"
                style={mutedStyle}
                aria-label={showNew ? "Hide password" : "Show password"}
                tabIndex={-1}
              >
                {showNew ? (
                  <EyeOff className="h-4 w-4" aria-hidden />
                ) : (
                  <Eye className="h-4 w-4" aria-hidden />
                )}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirm-password" className="mb-1.5 block text-sm text-white">
              Confirm new password
            </label>
            <div className="relative">
              <Input
                id="confirm-password"
                type={showConfirm ? "text" : "password"}
                placeholder="Enter your new password again"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`${inputClass} pr-10`}
                style={inputStyle}
                disabled={loading}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((prev) => !prev)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 transition-opacity hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-white/20"
                style={mutedStyle}
                aria-label={showConfirm ? "Hide password" : "Show password"}
                tabIndex={-1}
              >
                {showConfirm ? (
                  <EyeOff className="h-4 w-4" aria-hidden />
                ) : (
                  <Eye className="h-4 w-4" aria-hidden />
                )}
              </button>
            </div>
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <Button
            type="submit"
            className="w-full text-white"
            style={btnSolidStyle}
            disabled={loading}
          >
            {loading ? "Updating\u2026" : "Update Password"}
          </Button>
        </form>
      </div>
    </div>
  );
}
