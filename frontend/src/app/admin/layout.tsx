import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AdminSidebar } from "@/app/admin/admin-sidebar"
import { AdminHeader } from "@/app/admin/admin-header"
import { ThemeProvider } from "next-themes"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <SidebarProvider defaultOpen={true}>
        <AdminSidebar />
        <SidebarInset className="flex flex-col h-screen w-full">
          <AdminHeader />
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </ThemeProvider>
  )
}
