"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface WaitlistEntry {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  status: "pending" | "verified" | "rejected";
}

export default function WaitlistPage() {
  const [waitlistData] = useState<WaitlistEntry[]>([]);
  const [loading] = useState(false);

  useEffect(() => {
    // TODO: Fetch waitlist data from API
    // setWaitlistData(data);
  }, []);

  return (
    <div className="w-full p-8 space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-foreground">Waitlist</h2>
        <p className="text-muted-foreground mt-2">Manage and view all waitlist signups</p>
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <select className="px-4 py-2 rounded bg-input border border-border text-foreground focus:outline-none focus:border-ring">
          <option>All Status</option>
          <option>Pending</option>
          <option>Verified</option>
          <option>Rejected</option>
        </select>
        <input
          type="text"
          placeholder="Search by email or name..."
          className="flex-1 min-w-64 px-4 py-2 rounded bg-input border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:border-ring"
        />
      </div>

      {/* Waitlist Table */}
      <Card className="bg-card border border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Waitlist Entries</CardTitle>
          <CardDescription>All people who have signed up for the waitlist</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">Loading...</p>
            </div>
          ) : waitlistData.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">No waitlist entries yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="text-foreground">Email</TableHead>
                    <TableHead className="text-foreground">Name</TableHead>
                    <TableHead className="text-foreground">Joined</TableHead>
                    <TableHead className="text-foreground">Status</TableHead>
                    <TableHead className="text-foreground text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {waitlistData.map((entry) => (
                    <TableRow key={entry.id} className="border-border hover:bg-sidebar/30">
                      <TableCell className="text-foreground">{entry.email}</TableCell>
                      <TableCell className="text-foreground">{entry.name}</TableCell>
                      <TableCell className="text-muted-foreground">{new Date(entry.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge
                          className={`${
                            entry.status === "verified"
                              ? "bg-success text-success-foreground"
                              : entry.status === "rejected"
                              ? "bg-error text-error-foreground"
                              : "bg-warning text-warning-foreground"
                          }`}
                        >
                          {entry.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <button className="text-xs text-accent hover:underline">
                          View
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
