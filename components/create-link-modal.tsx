"use client"

import { useState, useEffect } from "react"
import { RefreshCw } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { LinkData } from "@/lib/links-data"
import { createLink, getAuthUser } from "@/lib/supabase/client"
import { ToastNotification } from "@/components/toast-notification"

function getFaviconForUrl(url: string): string {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, "")
    return `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`
  } catch {
    return "https://www.google.com/s2/favicons?domain=example.com&sz=64"
  }
}

function generateShortCode(): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let result = ""
  for (let i = 0; i < 7; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export interface CreateLinkModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateLink: (link: LinkData) => void
}

export default function CreateLinkModal({
  open,
  onOpenChange,
  onCreateLink,
}: CreateLinkModalProps) {
  const [destinationUrl, setDestinationUrl] = useState("")
  const [shortCode, setShortCode] = useState("")
  const [domain, setDomain] = useState("linkd.sh")
  const [description, setDescription] = useState("")
  const [folder, setFolder] = useState("Links")
  const [conversionTracking, setConversionTracking] = useState(false)

  // NEW: normal textbox state for tags (not wired into LinkCard yet)
  const [tagsText, setTagsText] = useState("")

  const [toastVisible, setToastVisible] = useState(false)
  const [toastTitle, setToastTitle] = useState("")
  const [toastMessage, setToastMessage] = useState("")
  const [toastType, setToastType] = useState<"success" | "error">("success")

  useEffect(() => {
    if (open) {
      setShortCode(generateShortCode())
    }
  }, [open])

  const handleRefreshShortCode = () => {
    setShortCode(generateShortCode())
  }

  const handleCreateLink = async () => {
    const { user } = await getAuthUser()

    if (!user) {
      setToastType("error")
      setToastTitle("User not authenticated")
      setToastMessage("You must be signed in to create a link.")
      setToastVisible(true)
      return
    }

    const destination_url = destinationUrl.trim() || "https://example.com"
    const slug = shortCode
    const tags = tagsText
      .split(/[\s,]+/)
      .map((s) => s.trim())
      .filter(Boolean)
    const conversion_tracking = conversionTracking
    const folderValue = folder
    const descriptionValue = description.trim()

    const payload = {
      user_id: user.id,
      destination_url,
      slug,
      tags: tags.length > 0 ? tags : undefined,
      conversion_tracking,
      folder: folderValue,
      description: descriptionValue || undefined,
    }

    try {
      const { error } = await createLink(payload)

      if (error) {
        setToastType("error")
        setToastTitle("Link creation failed")
        setToastMessage(error.message ?? String(error))
        setToastVisible(true)
        return
      }

      setToastType("success")
      setToastTitle("Link Created")
      setToastMessage("The short link was created successfully.")
      setToastVisible(true)
      onOpenChange(false)
      window.dispatchEvent(new Event("links:updated"))
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setToastType("error")
      setToastTitle("Link creation failed")
      setToastMessage(message)
      setToastVisible(true)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-5xl gap-0 p-0 sm:max-w-5xl">
        <DialogHeader className="px-6 pt-6 pb-4 text-left">
          <DialogTitle className="text-base font-semibold text-muted-foreground">
            Links &gt; New Link
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 px-6 pb-6 md:grid-cols-2">
          {/* Left column */}
          <div className="flex flex-col gap-4">
            <div className="space-y-2">
              <Label htmlFor="destination-url">Destination URL</Label>
              <Input
                id="destination-url"
                placeholder="https://example.com/subdomain-here"
                className="w-full"
                value={destinationUrl}
                onChange={(e) => setDestinationUrl(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Short Link</Label>
              <div className="flex gap-2">
                <Select value={domain} onValueChange={setDomain}>
                  <SelectTrigger className="w-[140px] shrink-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="linkd.sh">linkd.sh</SelectItem>
                  </SelectContent>
                </Select>
                <div className="relative flex-1">
                  <Input
                    value={shortCode}
                    onChange={(e) => setShortCode(e.target.value)}
                    className="pr-9"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground"
                    aria-label="Refresh short link"
                    onClick={handleRefreshShortCode}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                placeholder="Type tags (optional)"
                className="w-full"
                value={tagsText}
                onChange={(e) => setTagsText(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="conversion-tracking" className="cursor-pointer">
                Conversion Tracking
              </Label>
              <Switch
                id="conversion-tracking"
                checked={conversionTracking}
                onCheckedChange={setConversionTracking}
              />
            </div>

            <Separator />

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" className="rounded-full">
                UTM
              </Button>
              <Button variant="outline" size="sm" className="rounded-full">
                Targeting
              </Button>
              <Button variant="outline" size="sm" className="rounded-full">
                Expiration
              </Button>
              <Button variant="outline" size="sm" className="rounded-full">
                Password
              </Button>
            </div>
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-4">
            <div className="space-y-2">
              <Label>Folder</Label>
              <Select value={folder} onValueChange={setFolder}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Links">Links</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Add a short description here..."
                className="min-h-24 w-full resize-none"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="border-t px-6 py-4">
          <Button onClick={handleCreateLink} className="ml-auto">
            Create Link
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
      {toastVisible && (
        <ToastNotification
          title={toastTitle}
          message={toastMessage}
          type={toastType}
          onClose={() => setToastVisible(false)}
        />
      )}
    </>
  )
}