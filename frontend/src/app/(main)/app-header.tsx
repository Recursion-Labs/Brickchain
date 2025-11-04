"use client";

import { Search, Bell, Settings, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ThemeSwitcherButton } from "@/components/custom/theme-switcher-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function AppHeader() {
  return (
    <header className="w-full border-b border-border bg-sidebar">
      <div className="flex items-center justify-between h-16 px-8 gap-6">
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
        <div className="flex items-center gap-4">
          {/* Wallet Info */}
          <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-sidebar-accent/10 rounded-lg border border-sidebar-accent/20">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground">Balance</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">0.00</span>
                <span className="text-xs text-muted-foreground">ETH</span>
              </div>
            </div>
            <div className="w-px h-8 bg-sidebar-accent/20"></div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground">WETH</span>
              <span className="text-sm font-medium text-foreground">0.00</span>
            </div>
          </div>

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

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 px-3 py-2 h-10 text-sidebar-foreground hover:bg-sidebar-accent/20"
              >
                <Avatar className="h-6 w-6">
                  <AvatarImage src="https://github.com/shadcn.png" alt="User" />
                  <AvatarFallback className="text-xs">BC</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium hidden sm:inline">0x1234...5678</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem>
                <span>Copy Address</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <span>View Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <span>Disconnect</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
