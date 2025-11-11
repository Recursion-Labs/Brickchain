"use client";

import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Bell, Lock, Save } from "lucide-react";
import { useState } from "react";
import { AlertCircle, CheckCircle } from "lucide-react";

export default function SettingsPage() {
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    bio: user?.bio || '',
    url: user?.url || '',
  });

  if (!user) {
    return (
      <div className="w-full p-8">
        <Card className="border-red-200 bg-red-50/50 dark:bg-red-950/50">
          <CardContent className="pt-6">
            <p className="text-red-900 dark:text-red-100">
              Please log in to view your settings.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      // TODO: Implement API call to save profile
      // const response = await fetch('/api/user/profile', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData),
      // });
      
      setSaveMessage({ type: 'success', text: 'Profile saved successfully!' });
      setTimeout(() => setSaveMessage(null), 3000);
    } catch {
      setSaveMessage({ type: 'error', text: 'Failed to save profile. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-8">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Account Settings</h1>
          <p className="text-muted-foreground mt-2">Manage your account preferences and information</p>
        </div>

        {/* Save Message */}
        {saveMessage && (
          <div className={`flex items-center gap-3 p-4 rounded-lg border ${
            saveMessage.type === 'success'
              ? 'bg-green-50/50 dark:bg-green-950/50 border-green-200'
              : 'bg-red-50/50 dark:bg-red-950/50 border-red-200'
          }`}>
            {saveMessage.type === 'success' ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600" />
            )}
            <p className={saveMessage.type === 'success' ? 'text-green-900 dark:text-green-100' : 'text-red-900 dark:text-red-100'}>
              {saveMessage.text}
            </p>
          </div>
        )}

        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Your username"
                className="bg-sidebar-accent/20"
              />
            </div>

            {/* Email (Read-only) */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                value={formData.email}
                disabled
                className="bg-sidebar-accent/40 cursor-not-allowed"
              />
              <p className="text-xs text-muted-foreground">Email cannot be changed. It is tied to your Google Account.</p>
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                placeholder="Tell us about yourself..."
                className="bg-sidebar-accent/20 min-h-24 resize-none"
              />
              <p className="text-xs text-muted-foreground">Max 500 characters</p>
            </div>

            {/* Website */}
            <div className="space-y-2">
              <Label htmlFor="url">Website URL</Label>
              <Input
                id="url"
                name="url"
                value={formData.url}
                onChange={handleInputChange}
                placeholder="https://example.com"
                className="bg-sidebar-accent/20"
              />
            </div>

            {/* Save Button */}
            <div className="flex gap-3 pt-6 border-t">
              <Button 
                onClick={handleSaveProfile} 
                disabled={isSaving}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button variant="outline" disabled={isSaving}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>Control how you receive notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-sidebar-accent/20">
              <div>
                <p className="font-medium text-foreground">Email Notifications</p>
                <p className="text-sm text-muted-foreground">Receive updates via email</p>
              </div>
              <Button variant="outline" size="sm" disabled>
                Manage
              </Button>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-sidebar-accent/20">
              <div>
                <p className="font-medium text-foreground">Push Notifications</p>
                <p className="text-sm text-muted-foreground">Get instant notifications</p>
              </div>
              <Button variant="outline" size="sm" disabled>
                Configure
              </Button>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-sidebar-accent/20">
              <div>
                <p className="font-medium text-foreground">Transaction Alerts</p>
                <p className="text-sm text-muted-foreground">Get notified on token transfers</p>
              </div>
              <Button variant="outline" size="sm" disabled>
                Enable
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Privacy & Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Privacy & Security
            </CardTitle>
            <CardDescription>Manage your privacy settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-sidebar-accent/20">
              <div>
                <p className="font-medium text-foreground">Profile Visibility</p>
                <p className="text-sm text-muted-foreground">Control who can see your profile</p>
              </div>
              <Button variant="outline" size="sm" disabled>
                Configure
              </Button>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-sidebar-accent/20">
              <div>
                <p className="font-medium text-foreground">Two-Factor Authentication</p>
                <p className="text-sm text-muted-foreground">Add extra security to your account</p>
              </div>
              <Button variant="outline" size="sm" disabled>
                Enable
              </Button>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-sidebar-accent/20">
              <div>
                <p className="font-medium text-foreground">Session Management</p>
                <p className="text-sm text-muted-foreground">View and manage active sessions</p>
              </div>
              <Button variant="outline" size="sm" disabled>
                Manage
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600">Danger Zone</CardTitle>
            <CardDescription>Irreversible actions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg border border-red-200 hover:bg-red-50/50 dark:hover:bg-red-950/50">
              <div>
                <p className="font-medium text-foreground">Delete Account</p>
                <p className="text-sm text-muted-foreground">Permanently delete your account and data</p>
              </div>
              <Button variant="destructive" size="sm" disabled>
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
