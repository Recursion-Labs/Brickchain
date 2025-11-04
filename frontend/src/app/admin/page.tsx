"use client";

import { BarChart3, Users, MessageSquare, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminDashboard() {
  return (
    <div className="w-full p-8 space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-foreground">Dashboard</h2>
        <p className="text-muted-foreground mt-2">Welcome to the BrickChain admin panel</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Waitlist */}
        <Card className="bg-card border border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Total Waitlist</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">0</div>
            <p className="text-xs text-muted-foreground mt-1">People on waitlist</p>
          </CardContent>
        </Card>

        {/* Contact Messages */}
        <Card className="bg-card border border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">0</div>
            <p className="text-xs text-muted-foreground mt-1">Contact messages</p>
          </CardContent>
        </Card>

        {/* Unread Messages */}
        <Card className="bg-card border border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Unread</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">0</div>
            <p className="text-xs text-muted-foreground mt-1">Unread messages</p>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card className="bg-card border border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Status</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">Operational</div>
            <p className="text-xs text-muted-foreground mt-1">All systems running</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Waitlist */}
        <Card className="bg-card border border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Recent Waitlist Signups</CardTitle>
            <CardDescription>Latest people who joined the waitlist</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                <p>No waitlist data yet</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Messages */}
        <Card className="bg-card border border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Recent Contact Messages</CardTitle>
            <CardDescription>Latest messages from contact form</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                <p>No messages yet</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
