"use client"

import { useCallback, useEffect, useState } from "react"
import { ChevronDown, ChevronRight, LogIn, LogOut, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  signInWithPassword,
  signUpWithPassword,
  signOut,
  getAuthUser,
} from "@/lib/supabase/client"

export function DevAuth() {
  const [expanded, setExpanded] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<{ email: string; id: string } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    const { user } = await getAuthUser()
    setStatus(user ? { email: user.email ?? "", id: user.id } : null)
  }, [])

  useEffect(() => {
    refresh()
    window.addEventListener("auth:updated", refresh)
    return () => window.removeEventListener("auth:updated", refresh)
  }, [refresh])

  const handleSignIn = async () => {
    setLoading(true)
    setError(null)
    const { error: err } = await signInWithPassword(email, password)
    if (err) {
      setError(err.message)
    } else {
      await refresh()
      window.dispatchEvent(new Event("auth:updated"))
    }
    setLoading(false)
  }

  const handleSignUp = async () => {
    setLoading(true)
    setError(null)
    const { error: err } = await signUpWithPassword(email, password)
    if (err) {
      setError(err.message)
    } else {
      await refresh()
      window.dispatchEvent(new Event("auth:updated"))
    }
    setLoading(false)
  }

  const handleSignOut = async () => {
    setLoading(true)
    setError(null)
    await signOut()
    setStatus(null)
    window.dispatchEvent(new Event("auth:updated"))
    setLoading(false)
  }

  return (
    <div className="mx-6 mt-3 rounded-lg border border-border bg-secondary/50">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center gap-2 px-4 py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        {expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        Dev Auth
        {status && (
          <span className="ml-auto truncate text-[10px] font-normal text-green-500">
            {status.email}
          </span>
        )}
        {!status && (
          <span className="ml-auto text-[10px] font-normal text-red-400">Not signed in</span>
        )}
      </button>

      {expanded && (
        <div className="space-y-3 border-t border-border px-4 py-3">
          {status ? (
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 text-xs text-muted-foreground">
                <p className="truncate">
                  <span className="text-foreground">{status.email}</span>
                </p>
                <p className="truncate font-mono text-[10px]">{status.id}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="shrink-0 gap-1.5 text-xs"
                onClick={handleSignOut}
                disabled={loading}
              >
                <LogOut className="h-3 w-3" />
                Sign Out
              </Button>
            </div>
          ) : (
            <>
              <div className="flex gap-2">
                <Input
                  placeholder="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-8 text-xs"
                />
                <Input
                  placeholder="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs"
                  onClick={handleSignIn}
                  disabled={loading}
                >
                  <LogIn className="h-3 w-3" />
                  Sign In
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs"
                  onClick={handleSignUp}
                  disabled={loading}
                >
                  <UserPlus className="h-3 w-3" />
                  Sign Up
                </Button>
              </div>
            </>
          )}

          {error && <p className="text-xs text-red-400">{error}</p>}
        </div>
      )}
    </div>
  )
}
