"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"
import {
  Compass,
  Grid3x3,
  Coins,
  ArrowLeftRight,
  Gift,
  Activity,
  Trophy,
  Wand2,
  BookOpen,
  Settings,
  HelpCircle,
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
import { NavUser } from "../../components/custom/nav-user"

interface NavItem {
  title: string
  url: string
  icon: React.ComponentType<{ className?: string }>
  isActive?: boolean
}

const mainItems: NavItem[] = [
  {
    title: "Discover",
    url: "/discover",
    icon: Compass,
  },
  {
    title: "Collections",
    url: "/collections",
    icon: Grid3x3,
  },
  {
    title: "Tokens",
    url: "/tokens",
    icon: Coins,
  },
  {
    title: "Swap",
    url: "/swap",
    icon: ArrowLeftRight,
  },
  {
    title: "Drops",
    url: "/drops",
    icon: Gift,
  },
  {
    title: "Activity",
    url: "/activity",
    icon: Activity,
  },
  {
    title: "Rewards",
    url: "/rewards",
    icon: Trophy,
  },
  {
    title: "Studio",
    url: "/studio",
    icon: Wand2,
  },
]

const resourcesItems: NavItem[] = [
  {
    title: "Learn",
    url: "/resources/learn",
    icon: BookOpen,
  },
  {
    title: "Help Center",
    url: "/resources/help",
    icon: HelpCircle,
  },
  {
    title: "Blog",
    url: "/resources/blog",
    icon: BookOpen,
  },
  {
    title: "Careers",
    url: "/resources/careers",
    icon: BookOpen,
  },
]

const settingsItems: NavItem[] = [
  {
    title: "Profile",
    url: "/settings/profile",
    icon: Settings,
  },
  {
    title: "Preferences",
    url: "/settings/preferences",
    icon: Settings,
  },
  {
    title: "Account",
    url: "/settings/account",
    icon: Settings,
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { state } = useSidebar()
  const [resourcesOpen, setResourcesOpen] = React.useState(false)
  const [settingsOpen, setSettingsOpen] = React.useState(false)

  // Mock user data - replace with actual user data from context/API
  const user = {
    name: "John Doe",
    email: "john@brickchain.com",
    avatar: "https://github.com/shadcn.png",
  };

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
              <span className="font-bold text-lg leading-tight text-sidebar-foreground">BrickChain</span>
            </div>
            <SidebarTrigger />
          </div>
        )}
      </SidebarHeader>

      {/* Main Navigation */}
      <SidebarContent className="bg-sidebar">
        <SidebarGroup>
          {!isCollapsed && (
            <SidebarGroupLabel className="text-muted-foreground">Navigation</SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className={cn(
              isCollapsed && "flex flex-col items-center justify-center"
            )}>
              {mainItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.url || pathname.startsWith(item.url + "/")
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

        {/* Collapsible Resources Section - Only visible when expanded OR on hover */}
        {!isCollapsed && (
          <SidebarGroup className="group/resources">
            <Collapsible open={resourcesOpen} onOpenChange={setResourcesOpen}>
              <SidebarGroupLabel asChild>
                <CollapsibleTrigger className="flex w-full items-center justify-between text-muted-foreground hover:text-sidebar-foreground">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    <span>Resources</span>
                  </div>
                  <ChevronRight
                    className={cn(
                      "h-4 w-4 transition-transform",
                      resourcesOpen && "rotate-180"
                    )}
                  />
                </CollapsibleTrigger>
              </SidebarGroupLabel>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {resourcesItems.map((item) => {
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

        {/* Collapsible Settings Section */}
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

      {/* Footer with User Profile */}
      <SidebarFooter className="border-t border-border bg-sidebar">
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
