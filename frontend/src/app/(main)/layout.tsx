import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/app/(main)/app-sidebar"
import { AppHeader } from "@/app/(main)/app-header"

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="dark">
      <SidebarProvider defaultOpen={true}>
        <AppSidebar />
        <SidebarInset className="flex flex-col ml-2">
          <AppHeader />
          <main className="flex-1 overflow-auto mx-2">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
