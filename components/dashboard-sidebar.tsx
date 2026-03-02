"use client"

import {
  Home,
  BarChart3,
  Users,
  Handshake,
  Wallet,
  Settings,
  HelpCircle,
  Link2,
  ChevronDown,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const navItems = [
  { icon: Home, label: "Home", active: true },
  { icon: BarChart3, label: "Analytics", active: false },
  { icon: Users, label: "Customers", active: false },
]

const secondaryItems = [
  { icon: Handshake, label: "Partners", badge: "New" },
  { icon: Wallet, label: "Payouts" },
]

const bottomItems = [
  { icon: Settings, label: "Settings" },
  { icon: HelpCircle, label: "Help Centre" },
]

interface DashboardSidebarProps {
  collapsed: boolean
}

export function DashboardSidebar({ collapsed }: DashboardSidebarProps) {
  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={`flex h-screen flex-col border-r border-border bg-sidebar transition-all duration-300 ease-in-out ${
          collapsed ? "w-16" : "w-64"
        }`}
      >
        {/* Account */}
        <div className={`flex items-center gap-3 p-4 ${collapsed ? "justify-center px-2" : ""}`}>
          <Avatar className="h-9 w-9 shrink-0">
            <AvatarImage src="https://api.dicebear.com/9.x/notionists/svg?seed=Aidan" alt="Profile" />
            <AvatarFallback className="bg-primary text-primary-foreground text-xs">JD</AvatarFallback>
          </Avatar>
          {!collapsed && (
            <>
              <div className="flex flex-col overflow-hidden">
                <span className="truncate text-sm font-medium text-sidebar-foreground">
                  Jordan Davis
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  jordan@linkly.io
                </span>
              </div>
              <ChevronDown className="ml-auto h-4 w-4 shrink-0 text-muted-foreground" />
            </>
          )}
        </div>

        {/* Integrations */}
        {collapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="mx-auto flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground">
                <Link2 className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">Link Integrations</TooltipContent>
          </Tooltip>
        ) : (
          <button className="mx-3 flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground">
            <Link2 className="h-4 w-4 shrink-0" />
            Link Integrations
          </button>
        )}

        <Separator className={collapsed ? "mx-2 my-2" : "mx-3 my-2"} />

        {/* Main nav */}
        <nav className={`flex flex-col gap-0.5 ${collapsed ? "items-center px-1.5" : "px-3"}`}>
          {navItems.map((item) =>
            collapsed ? (
              <Tooltip key={item.label}>
                <TooltipTrigger asChild>
                  <button
                    className={`flex h-9 w-9 items-center justify-center rounded-md transition-colors ${
                      item.active
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">{item.label}</TooltipContent>
              </Tooltip>
            ) : (
              <button
                key={item.label}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                  item.active
                    ? "bg-accent text-accent-foreground font-medium"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </button>
            )
          )}
        </nav>

        <Separator className={collapsed ? "mx-2 my-2" : "mx-3 my-2"} />

        {/* Secondary nav */}
        <nav className={`flex flex-col gap-0.5 ${collapsed ? "items-center px-1.5" : "px-3"}`}>
          {secondaryItems.map((item) =>
            collapsed ? (
              <Tooltip key={item.label}>
                <TooltipTrigger asChild>
                  <button className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground">
                    <item.icon className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  {item.label}
                  {item.badge && (
                    <span className="ml-2 rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                      {item.badge}
                    </span>
                  )}
                </TooltipContent>
              </Tooltip>
            ) : (
              <button
                key={item.label}
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
                {item.badge && (
                  <span className="ml-auto rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary">
                    {item.badge}
                  </span>
                )}
              </button>
            )
          )}
        </nav>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Bottom nav */}
        <nav className={`flex flex-col gap-0.5 pb-4 ${collapsed ? "items-center px-1.5" : "px-3"}`}>
          {bottomItems.map((item) =>
            collapsed ? (
              <Tooltip key={item.label}>
                <TooltipTrigger asChild>
                  <button className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground">
                    <item.icon className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">{item.label}</TooltipContent>
              </Tooltip>
            ) : (
              <button
                key={item.label}
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </button>
            )
          )}
        </nav>
      </aside>
    </TooltipProvider>
  )
}
