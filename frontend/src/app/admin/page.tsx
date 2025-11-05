"use client";

import { useState, useEffect } from "react";
import { BarChart3, Users, MessageSquare, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { apiClient } from "@/lib/api";

interface DashboardStats {
  totalWaitlist: number;
  totalContacts: number;
  unreadContacts: number;
  recentWaitlist: Array<{
    id: string;
    email: string;
    name?: string;
    createdAt: string;
  }>;
  recentContacts: Array<{
    id: string;
    email: string;
    name: string;
    subject: string;
    createdAt: string;
  }>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalWaitlist: 0,
    totalContacts: 0,
    unreadContacts: 0,
    recentWaitlist: [],
    recentContacts: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch stats from multiple endpoints
        const [waitlistStats, contactStats, waitlistResponses, contactResponses] = await Promise.all([
          apiClient.getWaitlistStats(),
          apiClient.getContactStats(),
          apiClient.getWaitlistResponses(),
          apiClient.getContactResponses()
        ]);

        // Process waitlist data
        const waitlistData = waitlistStats.data || [];
        const totalWaitlist = Array.isArray(waitlistData) ? waitlistData.length : 0;

        // Process contact data
        const contactData = contactResponses.data || [];
        const totalContacts = Array.isArray(contactData) ? contactData.length : 0;
        const unreadContacts = Array.isArray(contactData)
          ? contactData.filter((msg: any) => msg.status === 'unread').length
          : 0;

        // Get recent entries (last 5)
        const recentWaitlist = Array.isArray(waitlistData)
          ? waitlistData.slice(-5).reverse()
          : [];
        const recentContacts = Array.isArray(contactData)
          ? contactData.slice(-5).reverse()
          : [];

        setStats({
          totalWaitlist,
          totalContacts,
          unreadContacts,
          recentWaitlist,
          recentContacts
        });
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

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
            <div className="text-2xl font-bold text-foreground">
              {loading ? "..." : stats.totalWaitlist}
            </div>
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
            <div className="text-2xl font-bold text-foreground">
              {loading ? "..." : stats.totalContacts}
            </div>
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
            <div className="text-2xl font-bold text-foreground">
              {loading ? "..." : stats.unreadContacts}
            </div>
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
              {loading ? (
                <div className="flex items-center justify-center py-8 text-muted-foreground">
                  <p>Loading...</p>
                </div>
              ) : stats.recentWaitlist.length === 0 ? (
                <div className="flex items-center justify-center py-8 text-muted-foreground">
                  <p>No waitlist data yet</p>
                </div>
              ) : (
                stats.recentWaitlist.map((entry: any) => (
                  <div key={entry.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-sidebar/20">
                    <div>
                      <p className="font-medium text-foreground">{entry.email}</p>
                      {entry.name && <p className="text-sm text-muted-foreground">{entry.name}</p>}
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        {new Date(entry.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
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
              {loading ? (
                <div className="flex items-center justify-center py-8 text-muted-foreground">
                  <p>Loading...</p>
                </div>
              ) : stats.recentContacts.length === 0 ? (
                <div className="flex items-center justify-center py-8 text-muted-foreground">
                  <p>No messages yet</p>
                </div>
              ) : (
                stats.recentContacts.map((message: any) => (
                  <div key={message.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-sidebar/20">
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{message.name}</p>
                      <p className="text-sm text-muted-foreground truncate">{message.subject}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        {new Date(message.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
