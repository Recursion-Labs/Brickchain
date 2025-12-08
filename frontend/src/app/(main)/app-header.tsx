"use client";

import { Search, Bell, Settings, ChevronDown, Menu, LogOut, User as UserIcon, Home as HomeIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
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
import { WalletConnect } from "@/components/wallet-connect";
import { useAuth } from "@/lib/auth";

export function AppHeader() {
  const { toggleSidebar } = useSidebar();
  const { user, logout } = useAuth();

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

  const displayName = user?.username || user?.email?.split('@')[0] || 'User';

  return (
    <header className="w-full border-b border-border bg-sidebar">
      <div className="flex items-center justify-between h-16 px-4 md:px-8 gap-4 md:gap-6">
        {/* Mobile Menu Trigger */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="md:hidden text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/20"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Left Section - Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search collections, tokens..."
              className="pl-10 bg-sidebar-accent/20 border-sidebar-accent/30 text-foreground placeholder:text-muted-foreground focus:border-sidebar-accent"
            />
          </div>
        </div>

        {/* Right Section - Wallet & Profile */}
        <div className="flex items-center gap-2 md:gap-4">
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

          {/* Wallet Connect - positioned beside settings */}
          <div className="hidden sm:block">
            <WalletConnect compact={true} />
          </div>

          {/* Settings */}
          <Button
            variant="ghost"
            size="icon"
            className="text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/20"
          >
            <Settings className="h-5 w-5" />
          </Button>

          {/* Profile Dropdown */}
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
                  <ChevronDown className="h-4 w-4" />
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
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <DropdownMenuItem asChild>
                  <a href="/dashboard" className="cursor-pointer">
                    <HomeIcon className="mr-2 h-4 w-4" />
                    Dashboard
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a href="/profile" className="cursor-pointer">
                    <UserIcon className="mr-2 h-4 w-4" />
                    View Profile
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a href="/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Account Settings
                  </a>
                </DropdownMenuItem>

                {/* Divider */}
                <div className="my-1 border-t" />

                {/* Logout */}
                <DropdownMenuItem onClick={logout} className="text-red-600 cursor-pointer">
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
