"use client";

import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Mail, Calendar, Shield, User, Edit2, Copy, Check } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

export default function ProfilePage() {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  if (!user) {
    return (
      <div className="w-full p-8">
        <Card className="border-red-200 bg-red-50/50 dark:bg-red-950/50">
          <CardContent className="pt-6">
            <p className="text-red-900 dark:text-red-100">
              Please log in to view your profile.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getInitials = () => {
    if (user.username) {
      return user.username
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (user.email) {
      return user.email[0].toUpperCase();
    }
    return 'U';
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(user.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-8">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
          <p className="text-muted-foreground mt-2">View and manage your account information</p>
        </div>

        {/* Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Your account details from Google</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar Section */}
            <div className="flex items-center gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user.profilePicture || undefined} alt={user.username || 'User'} />
                <AvatarFallback className="text-2xl font-semibold">{getInitials()}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-foreground">{user.username || 'User'}</h2>
                <p className="text-muted-foreground">{user.email}</p>
                <div className="mt-3 flex gap-2">
                  <Badge variant="secondary" className="capitalize">
                    {user.role || 'user'}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t">
              {/* Username */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <User className="h-4 w-4" />
                  Username
                </div>
                <p className="text-foreground font-medium">{user.username || 'Not set'}</p>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  Email Address
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-foreground font-medium">{user.email}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyEmail}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {!copied ? (
                      <Copy className="h-4 w-4" />
                    ) : (
                      <Check className="h-4 w-4 text-green-600" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Account Created */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Account Created
                </div>
                <p className="text-foreground font-medium">{formatDate(user.createdAt)}</p>
              </div>

              {/* Account Role */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  Role
                </div>
                <p className="text-foreground font-medium capitalize">{user.role || 'user'}</p>
              </div>

              {/* Bio */}
              <div className="space-y-2 md:col-span-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Edit2 className="h-4 w-4" />
                  Bio
                </div>
                <p className="text-foreground font-medium">{user.bio || 'No bio set'}</p>
              </div>

              {/* Website */}
              {user.url && (
                <div className="space-y-2 md:col-span-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Shield className="h-4 w-4" />
                    Website
                  </div>
                  <a href={user.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {user.url}
                  </a>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-6 border-t">
              <Link href="/settings">
                <Button variant="default">
                  <Edit2 className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
              </Link>
              <Button variant="outline">
                Download Data
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Security Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security
            </CardTitle>
            <CardDescription>Manage your account security settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-sidebar-accent/20">
              <div>
                <p className="font-medium text-foreground">Two-Factor Authentication</p>
                <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
              </div>
              <Button variant="outline" size="sm" disabled>
                Enable
              </Button>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-sidebar-accent/20">
              <div>
                <p className="font-medium text-foreground">Active Sessions</p>
                <p className="text-sm text-muted-foreground">View and manage your active sessions</p>
              </div>
              <Button variant="outline" size="sm" disabled>
                Manage
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
