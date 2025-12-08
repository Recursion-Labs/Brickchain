"use client";

import { useAuth } from "@/lib/auth";
import { useEffect, useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, User, Mail, Calendar } from "lucide-react";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    try {
      const response = await (await import("@/lib/api")).apiClient.getProperties();
      if (response.success && response.data) {
        const apiData = response.data as { success?: boolean; data?: unknown[] };
        const rawData = Array.isArray(response.data)
          ? response.data
          : Array.isArray(apiData.data)
            ? apiData.data
            : [];

        // Normalize field names
        const normalizedData = rawData.map((prop: any) => ({
          id: prop.id as string,
          name: prop.name as string,
          description: prop.description as string,
          type: prop.type as string,
          location: (prop.location || prop.Location) as string,
          value: (prop.value || prop.Value) as number || 0,
          shares: (prop.shares || prop.Shares) as number || 0,
          createdAt: prop.createdAt as string,
          updatedAt: prop.updatedAt as string,
          userId: (prop.userId || (prop.user && (prop.user as any).id) || prop.user) as string || undefined,
        }));

        setProperties(normalizedData);
      }
    } catch (err) {
      console.error("Failed to load properties for dashboard:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
            <h2 className="text-xl font-semibold text-foreground mb-2">Not authenticated</h2>
            <p className="text-muted-foreground">Please log in to access the dashboard</p>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
          <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back to BrickChain</p>
          </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => fetchProperties()} disabled={loading}>
                Refresh
              </Button>
              <Button onClick={handleLogout} variant="outline" className="flex items-center gap-2">
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
        </div>

        {/* User Profile Card */}
          <Card className="bg-card border-border mb-8">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Your account details and settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user.profilePicture || undefined} />
                <AvatarFallback className="bg-accent text-accent-foreground text-lg">
                  {user.username?.charAt(0)?.toUpperCase() || user.email.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-xl font-semibold text-foreground">
                  {user.username || user.email.split('@')[0]}
                </h3>
                <p className="text-muted-foreground flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {user.email}
                </p>
                <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                  <Calendar className="h-4 w-4" />
                  Joined {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {user.bio && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Bio</h4>
                <p className="text-muted-foreground">{user.bio}</p>
              </div>
            )}

            {user.url && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Website</h4>
                <a
                  href={user.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:text-accent-foreground"
                >
                  {user.url}
                </a>
              </div>
            )}

                <div className="pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Account Role</span>
                    <span className="text-sm font-medium text-foreground capitalize">{user.role}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dashboard Summary: dynamic data */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground text-lg">Total Properties</CardTitle>
              <CardDescription className="text-muted-foreground">Available on platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{loading ? '...' : properties.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground text-lg">Portfolio Value</CardTitle>
              <CardDescription className="text-muted-foreground">Total value across properties</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{loading ? '...' : `$${properties.reduce((s, p) => s + (p.value || 0), 0).toLocaleString()}`}</div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground text-lg">Total Shares</CardTitle>
              <CardDescription className="text-muted-foreground">Total number of shares</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{loading ? '...' : properties.reduce((s, p) => s + (p.shares || 0), 0)}</div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground text-lg">My Properties</CardTitle>
              <CardDescription className="text-muted-foreground">Properties you created</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{loading ? '...' : properties.filter(p => p.userId === user.id).length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-card border-border hover:bg-muted transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="text-foreground text-lg">Admin Panel</CardTitle>
              <CardDescription className="text-muted-foreground">
                Manage waitlist and contact messages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full"
                onClick={() => window.location.href = '/admin'}
              >
                Access Admin Panel
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground text-lg">Settings</CardTitle>
              <CardDescription className="text-muted-foreground">
                Update your profile and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" disabled>
                Coming Soon
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground text-lg">Support</CardTitle>
              <CardDescription className="text-muted-foreground">
                Get help and contact support
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" disabled>
                Coming Soon
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
