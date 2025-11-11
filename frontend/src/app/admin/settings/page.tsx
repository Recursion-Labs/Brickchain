"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bell, Lock, AlertCircle, Save } from "lucide-react";

export default function SettingsPage() {
  const { user } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  if (!user) {
    return (
      <div className="w-full p-8">
        <Card className="border-red-200 bg-red-50/50 dark:bg-red-950/50">
          <CardContent className="pt-6">
            <p className="text-red-900 dark:text-red-100">
              Please log in to access settings.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSaveProfile = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    alert('Settings saved successfully!');
  };

  return (
    <div className="w-full p-8 space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-foreground">Account Settings</h2>
        <p className="text-muted-foreground mt-2">
          Manage your account preferences and security settings powered by Google OAuth
        </p>
      </div>

      {/* Profile Settings */}
      <Card className="bg-card border border-border max-w-2xl">
        <CardHeader>
          <CardTitle className="text-foreground">Profile Information</CardTitle>
          <CardDescription>Your Google authentication details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-foreground">
              Full Name
            </Label>
            <Input
              id="name"
              defaultValue={user.username || ''}
              placeholder="Your full name"
              className="bg-input border border-border text-foreground placeholder-muted-foreground focus:border-ring"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground">
              Email Address (Google Account)
            </Label>
            <Input
              id="email"
              type="email"
              defaultValue={user.email}
              disabled
              className="bg-muted border border-border text-foreground cursor-not-allowed"
            />
            <p className="text-xs text-muted-foreground">
              Your email is managed by Google OAuth and cannot be changed here
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio" className="text-foreground">
              Bio
            </Label>
            <textarea
              id="bio"
              defaultValue={user.bio || ''}
              placeholder="Tell us about yourself..."
              rows={4}
              className="w-full px-3 py-2 border border-border rounded-md bg-input text-foreground placeholder-muted-foreground focus:border-ring"
            />
          </div>

          <Button
            onClick={handleSaveProfile}
            disabled={isSaving}
            className="bg-accent hover:bg-accent/90 text-white gap-2"
          >
            <Save className="h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card className="bg-card border border-border max-w-2xl">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
          <CardDescription>Manage how you receive notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-sidebar/20 rounded-lg border border-border">
              <div>
                <p className="font-medium text-foreground">In-App Notifications</p>
                <p className="text-sm text-muted-foreground">Receive notifications within the admin panel</p>
              </div>
              <button
                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                className={`w-12 h-6 rounded-full transition ${
                  notificationsEnabled ? 'bg-green-500' : 'bg-gray-300'
                }`}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-sidebar/20 rounded-lg border border-border">
              <div>
                <p className="font-medium text-foreground">Email Notifications</p>
                <p className="text-sm text-muted-foreground">Receive email alerts for important events</p>
              </div>
              <button
                onClick={() => setEmailNotifications(!emailNotifications)}
                className={`w-12 h-6 rounded-full transition ${
                  emailNotifications ? 'bg-green-500' : 'bg-gray-300'
                }`}
              />
            </div>
          </div>

          <Button
            onClick={handleSaveProfile}
            disabled={isSaving}
            className="w-full bg-accent hover:bg-accent/90 text-white gap-2"
          >
            <Save className="h-4 w-4" />
            Save Preferences
          </Button>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card className="bg-card border border-border max-w-2xl">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Security
          </CardTitle>
          <CardDescription>Enhance your account security</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-950/50 rounded-lg border border-blue-200 dark:border-blue-900">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
              ✓ Google OAuth Security
            </p>
            <p className="text-xs text-blue-800 dark:text-blue-200 mt-1">
            Your account is secured with Google&apos;s authentication platform, providing enterprise-level security.
            </p>
          </div>

          <div className="flex items-center justify-between p-4 bg-sidebar/20 rounded-lg border border-border">
            <div>
              <p className="font-medium text-foreground">Two-Factor Authentication</p>
              <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
            </div>
            <button
              onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
              className={`w-12 h-6 rounded-full transition ${
                twoFactorEnabled ? 'bg-green-500' : 'bg-gray-300'
              }`}
            />
          </div>

          {twoFactorEnabled && (
            <div className="p-3 bg-green-50 dark:bg-green-950/50 rounded text-sm text-green-900 dark:text-green-100">
              ✓ Two-factor authentication is enabled
            </div>
          )}

          <Button
            onClick={handleSaveProfile}
            disabled={isSaving}
            className="w-full bg-accent hover:bg-accent/90 text-white gap-2"
          >
            <Save className="h-4 w-4" />
            Save Security Settings
          </Button>
        </CardContent>
      </Card>

      {/* System Preferences */}
      <Card className="bg-card border border-border max-w-2xl">
        <CardHeader>
          <CardTitle className="text-foreground">System Preferences</CardTitle>
          <CardDescription>Configure system-wide settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-sidebar/20 rounded-lg border border-border">
            <div>
              <p className="font-medium text-foreground">Dark Theme</p>
              <p className="text-sm text-muted-foreground">Use dark theme by default</p>
            </div>
            <input
              type="checkbox"
              defaultChecked
              className="w-5 h-5 rounded border-border cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-sidebar/20 rounded-lg border border-border">
            <div>
              <p className="font-medium text-foreground">Compact View</p>
              <p className="text-sm text-muted-foreground">Display data in a more compact format</p>
            </div>
            <input
              type="checkbox"
              className="w-5 h-5 rounded border-border cursor-pointer"
            />
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="bg-card border border-red-200 dark:border-red-800/50 max-w-2xl">
        <CardHeader>
          <CardTitle className="text-red-600 dark:text-red-400 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>Irreversible actions</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            className="border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50"
          >
            Delete Account
          </Button>
          <p className="text-xs text-muted-foreground mt-4">
            Deleting your account is permanent and cannot be undone. All your data will be removed.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
