"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SettingsPage() {
  const [adminName, setAdminName] = useState("Admin");
  const [adminEmail, setAdminEmail] = useState("admin@brickchain.io");

  const handleSaveProfile = () => {
    console.log("Saving profile:", { adminName, adminEmail });
    // TODO: API call to save profile
  };

  return (
    <div className="w-full p-8 space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-foreground">Settings</h2>
        <p className="text-muted-foreground mt-2">Manage admin panel settings and preferences</p>
      </div>

      {/* Admin Profile Settings */}
      <Card className="bg-card border border-border max-w-2xl">
        <CardHeader>
          <CardTitle className="text-foreground">Admin Profile</CardTitle>
          <CardDescription>Update your admin profile information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-foreground">
              Full Name
            </Label>
            <Input
              id="name"
              value={adminName}
              onChange={(e) => setAdminName(e.target.value)}
              placeholder="Enter your full name"
              className="bg-input border border-border text-foreground placeholder-muted-foreground focus:border-ring"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              placeholder="Enter your email"
              className="bg-input border border-border text-foreground placeholder-muted-foreground focus:border-ring"
            />
          </div>

          <Button
            onClick={handleSaveProfile}
            className="bg-accent hover:bg-accent/90 text-white"
          >
            Save Profile
          </Button>
        </CardContent>
      </Card>

      {/* System Preferences */}
      <Card className="bg-card border border-border max-w-2xl">
        <CardHeader>
          <CardTitle className="text-foreground">System Preferences</CardTitle>
          <CardDescription>Configure system-wide settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-sidebar/20 rounded-lg border border-border">
              <div>
                <p className="font-medium text-foreground">Email Notifications</p>
                <p className="text-sm text-muted-foreground">Receive alerts for new messages</p>
              </div>
              <input
                type="checkbox"
                defaultChecked
                className="w-5 h-5 rounded border-border cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-sidebar/20 rounded-lg border border-border">
              <div>
                <p className="font-medium text-foreground">Waitlist Alerts</p>
                <p className="text-sm text-muted-foreground">Get notified of new waitlist signups</p>
              </div>
              <input
                type="checkbox"
                defaultChecked
                className="w-5 h-5 rounded border-border cursor-pointer"
              />
            </div>

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
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card className="bg-card border border-border max-w-2xl">
        <CardHeader>
          <CardTitle className="text-foreground">Data Management</CardTitle>
          <CardDescription>Manage your data and exports</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            variant="outline"
            className="w-full border border-border text-foreground hover:bg-sidebar/50"
          >
            Export Waitlist Data
          </Button>
          <Button
            variant="outline"
            className="w-full border border-border text-foreground hover:bg-sidebar/50"
          >
            Export Messages Data
          </Button>
          <p className="text-xs text-muted-foreground mt-4">
            Data will be exported in CSV format
          </p>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="bg-card border border-error/30 max-w-2xl">
        <CardHeader>
          <CardTitle className="text-error">Danger Zone</CardTitle>
          <CardDescription>Irreversible actions</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            className="border border-error text-error hover:bg-error/10"
          >
            Clear All Data
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
