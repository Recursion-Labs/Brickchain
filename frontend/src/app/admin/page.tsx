"use client";

import { useState, useEffect } from "react";
import { BarChart3, Users, MessageSquare, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/lib/auth";

interface WaitlistApiResponse {
  status: string;
  data: WaitlistEntry[];
}

interface ContactApiResponse {
  status: string;
  data: ContactMessage[];
}

interface WaitlistEntry {
  id: string;
  email: string;
  name?: string;
  createdAt: string;
}

interface ContactMessage {
  id: string;
  email: string;
  name: string;
  subject: string;
  createdAt: string;
  status?: string;
}

interface DashboardStats {
  totalWaitlist: number;
  totalContacts: number;
  unreadContacts: number;
  recentWaitlist: WaitlistEntry[];
  recentContacts: ContactMessage[];
}

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuth();
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

        // Fetch stats from multiple endpoints with better error handling
        const results = await Promise.allSettled([
          apiClient.getWaitlistStats(),
          apiClient.getContactStats(),
          apiClient.getWaitlistResponses(),
          apiClient.getContactResponses()
        ]);

        // Process results safely
        let waitlistResponses = null;
        let contactResponses = null;

        if (results[2].status === 'fulfilled') {
          waitlistResponses = results[2].value;
        }
        if (results[3].status === 'fulfilled') {
          contactResponses = results[3].value;
        }

        // Process waitlist data
        const waitlistData = waitlistResponses?.data?.data || [];
        const totalWaitlist = Array.isArray(waitlistData) ? waitlistData.length : 0;

        // Process contact data
        const contactData = contactResponses?.data?.data || [];
        const totalContacts = Array.isArray(contactData) ? contactData.length : 0;
        const unreadContacts = Array.isArray(contactData)
          ? contactData.filter((msg: ContactMessage) => msg.status === 'unread').length
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
        // Set default empty stats on error
        setStats({
          totalWaitlist: 0,
          totalContacts: 0,
          unreadContacts: 0,
          recentWaitlist: [],
          recentContacts: []
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Check if user is authenticated and has admin role
  if (!isAuthenticated || !user || user.role.toLowerCase() !== 'admin') {
    return (
      <div className="w-full p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Access Denied</h2>
          <p className="text-muted-foreground mb-4">
            {!isAuthenticated 
              ? "Please log in to access the admin dashboard." 
              : "You don't have permission to access the admin dashboard. Admin role required."
            }
          </p>
          <a 
            href={!isAuthenticated ? "/auth/login" : "/dashboard"}
            className="bg-accent hover:bg-accent/90 text-white px-4 py-2 rounded"
          >
            {!isAuthenticated ? "Go to Login" : "Go to Dashboard"}
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Dashboard</h2>
        <p className="text-muted-foreground mt-2 text-sm sm:text-base">Welcome to the BrickChain admin panel</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Waitlist */}
        <Card className="bg-card border border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-foreground">Total Waitlist</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-foreground">
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Recent Waitlist */}
        <Card className="bg-card border border-border">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl text-foreground">Recent Waitlist Signups</CardTitle>
            <CardDescription className="text-sm">Latest people who joined the waitlist</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 sm:space-y-4">
              {loading ? (
                <div className="flex items-center justify-center py-8 text-muted-foreground">
                  <p>Loading...</p>
                </div>
              ) : stats.recentWaitlist.length === 0 ? (
                <div className="flex items-center justify-center py-8 text-muted-foreground">
                  <p>No waitlist data yet</p>
                </div>
              ) : (
                stats.recentWaitlist.map((entry: WaitlistEntry) => (
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
            <CardTitle className="text-lg sm:text-xl text-foreground">Recent Contact Messages</CardTitle>
            <CardDescription className="text-sm">Latest messages from contact form</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 sm:space-y-4">
              {loading ? (
                <div className="flex items-center justify-center py-8 text-muted-foreground">
                  <p>Loading...</p>
                </div>
              ) : stats.recentContacts.length === 0 ? (
                <div className="flex items-center justify-center py-8 text-muted-foreground">
                  <p>No messages yet</p>
                </div>
              ) : (
                stats.recentContacts.map((message: ContactMessage) => (
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
