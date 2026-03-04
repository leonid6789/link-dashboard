 "use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Check, X } from "lucide-react"

const HIDE_ANIMATION_DURATION = 200

export interface ToastNotificationProps {
  title: string
  message: string
  type: "success" | "error"
  duration?: number
  onClose?: () => void
}

export function ToastNotification({
  title,
  message,
  type,
  duration = 3000,
  onClose,
}: ToastNotificationProps) {
  const [isVisible, setIsVisible] = useState(false)
  const autoCloseTimeout = useRef<number | null>(null)
  const removeTimeout = useRef<number | null>(null)

  const handleClose = useCallback(() => {
    if (!isVisible) return

    setIsVisible(false)

    if (autoCloseTimeout.current !== null) {
      window.clearTimeout(autoCloseTimeout.current)
      autoCloseTimeout.current = null
    }

    if (removeTimeout.current !== null) {
      window.clearTimeout(removeTimeout.current)
    }

    removeTimeout.current = window.setTimeout(() => {
      onClose?.()
    }, HIDE_ANIMATION_DURATION)
  }, [isVisible, onClose])

  useEffect(() => {
    // Trigger initial fade/slide-in animation
    const showTimeout = window.setTimeout(() => {
      setIsVisible(true)
    }, 10)

    return () => {
      window.clearTimeout(showTimeout)
    }
  }, [])

  useEffect(() => {
    autoCloseTimeout.current = window.setTimeout(() => {
      handleClose()
    }, duration)

    return () => {
      if (autoCloseTimeout.current !== null) {
        window.clearTimeout(autoCloseTimeout.current)
      }
      if (removeTimeout.current !== null) {
        window.clearTimeout(removeTimeout.current)
      }
    }
  }, [duration, handleClose])

  const role = type === "error" ? "alert" : "status"

  const visibilityClasses = isVisible
    ? "translate-y-0 opacity-100"
    : "translate-y-2 opacity-0 pointer-events-none"

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end space-y-2">
      <div
        role={role}
        aria-live={type === "error" ? "assertive" : "polite"}
        className={`relative flex w-full max-w-sm items-start gap-3 rounded-lg border border-[#2E2E2E] bg-[#161618] p-4 shadow-lg transition-all duration-200 ease-out ${visibilityClasses}`}
      >
        <button
          type="button"
          onClick={handleClose}
          className="absolute left-3 top-3 rounded p-1 text-[#797979] transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          aria-label="Close notification"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
        </button>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-[#2E2E2E] bg-[#28282B]">
          {type === "success" ? (
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1DC91D]">
              <Check className="h-3.5 w-3.5 text-white" aria-hidden="true" />
            </span>
          ) : (
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500">
              <X className="h-3.5 w-3.5 text-white" aria-hidden="true" />
            </span>
          )}
        </div>

        <div className="ml-1 flex min-w-0 flex-col gap-1 pr-2">
          <p className="text-sm font-semibold text-white">{title}</p>
          <p className="text-sm text-[#797979]">{message}</p>
        </div>
      </div>
    </div>
  )
}

