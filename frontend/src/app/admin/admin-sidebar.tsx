"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  Settings,
  LogOut,
  ChevronRight,
} from "lucide-react"

import { cn } from "@/lib/utils"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

interface NavItem {
  title: string
  url: string
  icon: React.ComponentType<{ className?: string }>
  isActive?: boolean
}

const adminItems: NavItem[] = [
  {
    title: "Dashboard",
    url: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Waitlist",
    url: "/admin/waitlist",
    icon: Users,
  },
  {
    title: "Messages",
    url: "/admin/messages",
    icon: MessageSquare,
  },
]

const settingsItems: NavItem[] = [
  {
    title: "Settings",
    url: "/admin/settings",
    icon: Settings,
  },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const { state } = useSidebar()
  const [settingsOpen, setSettingsOpen] = React.useState(false)

  const isCollapsed = state === "collapsed"

  return (
    <Sidebar 
      variant="sidebar"
      collapsible="icon"
      className="border-r border-border bg-sidebar"
      style={{
        "--sidebar-width": "16rem",
        "--sidebar-width-icon": "4.5rem",
      } as React.CSSProperties}
    >
      {/* Header with Logo and Trigger */}
      <SidebarHeader className="h-16 border-b border-border">
        {isCollapsed ? (
          <div className="flex items-center justify-between gap-2 px-2">
            <Image
              src="https://ik.imagekit.io/mwhha64ay/Brickchain/black-trans-logo.png"
              alt="BrickChain"
              width={32}
              height={32}
              className="w-8 h-8 shrink-0 invert"
            />
            <SidebarTrigger className="h-6 w-6" />
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3 px-8">
            <div className="flex items-center gap-3 flex-1 justify-center">
              <Image
                src="https://ik.imagekit.io/mwhha64ay/Brickchain/black-trans-logo.png"
                alt="BrickChain"
                width={40}
                height={40}
                className="w-10 h-10 shrink-0 invert"
              />
              <span className="font-bold text-lg leading-tight text-sidebar-foreground">Admin</span>
            </div>
            <SidebarTrigger />
          </div>
        )}
      </SidebarHeader>

      {/* Main Navigation */}
      <SidebarContent className="bg-sidebar">
        <SidebarGroup>
          {!isCollapsed && (
            <SidebarGroupLabel className="text-muted-foreground">Management</SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className={cn(
              isCollapsed && "flex flex-col items-center justify-center"
            )}>
              {adminItems.map((item) => {
                const Icon = item.icon
                // Only highlight dashboard for exact /admin, not for /admin/*
                const isActive = item.url === "/admin"
                  ? pathname === "/admin"
                  : pathname === item.url || pathname.startsWith(item.url + "/")
                return (
                  <SidebarMenuItem key={item.url} className={cn(
                    isCollapsed && "w-full flex justify-center"
                  )}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                      className={cn(
                        "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/20",
                        isActive && "bg-sidebar-accent/30 text-sidebar-foreground",
                        isCollapsed && "justify-center"
                      )}
                    >
                      <Link href={item.url}>
                        <Icon className="w-4 h-4" />
                        {!isCollapsed && <span>{item.title}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Settings Section */}
        {!isCollapsed && (
          <SidebarGroup>
            <Collapsible open={settingsOpen} onOpenChange={setSettingsOpen}>
              <SidebarGroupLabel asChild>
                <CollapsibleTrigger className="flex w-full items-center justify-between text-muted-foreground hover:text-sidebar-foreground">
                  <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </div>
                  <ChevronRight
                    className={cn(
                      "h-4 w-4 transition-transform",
                      settingsOpen && "rotate-180"
                    )}
                  />
                </CollapsibleTrigger>
              </SidebarGroupLabel>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {settingsItems.map((item) => {
                      const isActive = pathname === item.url || pathname.startsWith(item.url + "/")
                      return (
                        <SidebarMenuItem key={item.url}>
                          <SidebarMenuButton
                            asChild
                            isActive={isActive}
                            className={cn(
                              "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/20 pl-8",
                              isActive && "bg-sidebar-accent/30 text-sidebar-foreground"
                            )}
                          >
                            <Link href={item.url}>
                              <span>{item.title}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      )
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </Collapsible>
          </SidebarGroup>
        )}
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="border-t border-border bg-sidebar">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/20"
            >
              <Link href="/">
                <LogOut className="w-4 h-4" />
                {!isCollapsed && <span>Logout</span>}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
