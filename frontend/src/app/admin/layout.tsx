
"use client"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AdminSidebar } from "@/app/admin/admin-sidebar"
import { AdminHeader } from "@/app/admin/admin-header"
import { ThemeProvider } from "next-themes"
import { useWalletState } from "@/components/providers/wallet-provider"
import Link from "next/link"
import { WalletProvider } from "@/components/providers/wallet-provider"

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
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

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <WalletProvider>
      <AdminLayoutInner>
        {children}
      </AdminLayoutInner>
    </WalletProvider>
  )
}

function AdminLayoutInner({
  children,
}: {
  children: React.ReactNode
}) {
  const { isConnected, address, isConnecting } = useWalletState()

  // Check if actually connected - not just localStorage state
  // isConnecting is true while wallet is being initialized
  const isActuallyConnected = isConnected && address && address.length > 0

  // Show loading state while wallet is initializing (autoConnect)
  if (isConnecting) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="mb-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="animate-spin w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">Checking Wallet Connection</h2>
            <p className="text-muted-foreground mb-4">
              Please wait while we verify your wallet...
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!isActuallyConnected) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="mb-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">Admin Access Required</h2>
            <p className="text-muted-foreground mb-4">
              You need to connect your Midnight wallet to access the admin panel.
            </p>
            <p className="text-sm text-muted-foreground">
              Please connect your Lace wallet from the main page to continue.
            </p>
          </div>
          <div className="space-y-2">
            <Link
              href="/"
              className="inline-flex items-center justify-center w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Go to Main Page
            </Link>
            <p className="text-xs text-muted-foreground">
              Connect your wallet there and return to access admin features.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return <AdminLayoutContent>{children}</AdminLayoutContent>
}
