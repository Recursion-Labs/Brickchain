"use client";

import { PropertySidebar } from "./property-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

export default function PropertiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <PropertySidebar />
        <SidebarInset className="flex-1">
          {children}
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
