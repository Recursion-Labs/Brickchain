import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/app/(main)/app-sidebar"
import { AppHeader } from "@/app/(main)/app-header"
import { ThemeProvider } from "next-themes"
import { WalletProvider } from "@/components/providers/wallet-provider"

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <SidebarProvider defaultOpen={true}>
        <AppSidebar />
        <SidebarInset className="flex flex-col h-screen w-full">
          <WalletProvider>
            <AppHeader />
            <main className="flex-1 overflow-auto">
              {children}
            </main>
          </WalletProvider>
        </SidebarInset>
      </SidebarProvider>
    </ThemeProvider>
  )
}
