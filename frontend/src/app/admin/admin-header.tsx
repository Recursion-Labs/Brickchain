"use client";

import { Bell, Settings, Menu, LogOut, Copy, Check, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeSwitcherButton } from "@/components/custom/theme-switcher-button";
import { useSidebar } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useWalletState, useWalletConnection } from "@/components/providers/wallet-provider";
import { useAuth } from "@/lib/auth";
import { useState } from "react";

export function AdminHeader() {
  const { toggleSidebar } = useSidebar();
  const { address, isConnecting } = useWalletState();
  const { disconnectWallet } = useWalletConnection();
  const { user, logout } = useAuth();
  const [copied, setCopied] = useState(false);

  // Get user initials from email or name
  const getInitials = () => {
    if (user?.username) {
      return user.username
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return 'U';
  };

  const handleCopyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDisconnect = async () => {
    await disconnectWallet();
  };

  const handleLogout = () => {
    logout();
  };

  const shortAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';
  const displayName = user?.username || user?.email?.split('@')[0] || 'User';

  return (
    <header className="w-full border-b border-border bg-sidebar">
      <div className="flex items-center justify-between h-16 px-4 md:px-8 gap-6">
        {/* Mobile Menu Trigger */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="md:hidden text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/20"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Left Section */}
        <div className="flex-1">
          <h1 className="text-xl font-bold text-foreground">Admin Dashboard</h1>
        </div>

        {/* Right Section - Controls */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/20"
          >
            <Bell className="h-5 w-5" />
          </Button>

          {/* Theme Switcher */}
          <ThemeSwitcherButton className="text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/20" />

          {/* Settings */}
          <Button
            variant="ghost"
            size="icon"
            className="text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/20"
          >
            <Settings className="h-5 w-5" />
          </Button>

          {/* Wallet Connection Status */}
          {address && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="flex items-center gap-2 px-3 py-2 h-10 text-foreground border-green-500/50 hover:border-green-500"
                  disabled={isConnecting}
                >
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-sm font-mono">{shortAddress}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={handleCopyAddress}>
                  <span className="text-xs font-mono">{address}</span>
                  {!copied ? (
                    <Copy className="ml-auto h-4 w-4" />
                  ) : (
                    <Check className="ml-auto h-4 w-4 text-green-600" />
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDisconnect} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Disconnect Wallet
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* User Profile - Google Auth */}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 px-3 py-2 h-10 text-sidebar-foreground hover:bg-sidebar-accent/20"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.profilePicture || undefined} alt={displayName} />
                    <AvatarFallback className="text-xs font-semibold">{getInitials()}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium hidden sm:inline">{displayName}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                {/* User Info Section */}
                <div className="px-3 py-2 border-b">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.profilePicture || undefined} alt={displayName} />
                      <AvatarFallback className="text-sm font-semibold">{getInitials()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{user.username || 'User'}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Role: <span className="font-medium capitalize">{user.role}</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <DropdownMenuItem asChild>
                  <a href="/admin/profile" className="cursor-pointer">
                    <UserIcon className="mr-2 h-4 w-4" />
                    View Profile
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a href="/admin/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Account Settings
                  </a>
                </DropdownMenuItem>

                {/* Divider */}
                <div className="my-1 border-t" />

                {/* Logout */}
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
