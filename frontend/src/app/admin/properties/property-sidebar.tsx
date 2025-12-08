"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building,
  Plus,
  List,
  RefreshCw,
  TrendingUp,
  ArrowLeft,
  Home,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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
} from "@/components/ui/sidebar";

interface NavItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
}

const propertyNavItems: NavItem[] = [
  {
    title: "All Properties",
    url: "/admin/properties",
    icon: List,
  },
  {
    title: "Add Property",
    url: "/admin/properties/add",
    icon: Plus,
  },
  {
    title: "Tokenization",
    url: "/admin/properties/tokenize",
    icon: TrendingUp,
  },
];

export function PropertySidebar() {
  const pathname = usePathname();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar
      variant="sidebar"
      collapsible="icon"
      className="border-r border-border bg-sidebar"
      style={
        {
          "--sidebar-width": "16rem",
          "--sidebar-width-icon": "4.5rem",
        } as React.CSSProperties
      }
    >
      {/* Header */}
      <SidebarHeader className="h-16 border-b border-border">
        {isCollapsed ? (
          <div className="flex items-center justify-center px-2 py-4">
            <Building className="h-6 w-6 text-primary" />
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2 px-4 py-4">
            <div className="flex items-center gap-2">
              <Building className="h-6 w-6 text-primary" />
              <span className="font-semibold text-lg">Properties</span>
            </div>
            <SidebarTrigger />
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        {/* Back to Admin */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Back to Admin">
                  <Link href="/admin" className="flex items-center gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    {!isCollapsed && <span>Back to Admin</span>}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Property Management */}
        <SidebarGroup>
          <SidebarGroupLabel>Property Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {propertyNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    tooltip={item.title}
                  >
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Quick Actions */}
        <SidebarGroup>
          <SidebarGroupLabel>Quick Actions</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className={cn("px-2", isCollapsed && "px-1")}>
              <Button
                variant="outline"
                size={isCollapsed ? "icon" : "default"}
                className={cn("w-full", isCollapsed && "h-9 w-9")}
                onClick={() => {
                  // Dispatch a custom event that the properties page can listen to
                  window.dispatchEvent(new CustomEvent("refresh-properties"));
                }}
              >
                <RefreshCw className="h-4 w-4" />
                {!isCollapsed && <span className="ml-2">Refresh List</span>}
              </Button>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border p-4">
        <SidebarMenuButton asChild tooltip="Dashboard">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            {!isCollapsed && <span>Go to Dashboard</span>}
          </Link>
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  );
}
