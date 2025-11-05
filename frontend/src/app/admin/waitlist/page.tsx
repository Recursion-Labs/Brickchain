"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api";

interface WaitlistEntry {
  id: string;
  email: string;
  name?: string;
  createdAt: string;
  status: "pending" | "verified" | "rejected";
}

interface WaitlistApiResponse {
  id: string;
  email: string;
  name?: string;
  createdAt: string;
  status?: string;
}

export default function WaitlistPage() {
  const [waitlistData, setWaitlistData] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const fetchWaitlistData = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getWaitlistResponses();

      if (response.success && response.data) {
        // Transform the data to match our interface
        const transformedData = Array.isArray(response.data)
          ? response.data.map((item: WaitlistApiResponse) => ({
              id: item.id,
              email: item.email,
              name: item.name || undefined,
              createdAt: item.createdAt,
              status: (item.status?.toLowerCase() || 'pending') as "pending" | "verified" | "rejected"
            }))
          : [];

        setWaitlistData(transformedData);
      }
    } catch (error) {
      console.error('Failed to fetch waitlist data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWaitlistData();
  }, []);

  // Filter data based on status and search
  const filteredData = waitlistData.filter((entry) => {
    const matchesStatus = statusFilter === "all" || entry.status === statusFilter;
    const matchesSearch =
      entry.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (entry.name && entry.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="w-full p-8 space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-foreground">Waitlist</h2>
        <p className="text-muted-foreground mt-2">Manage and view all waitlist signups</p>
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap items-center">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px] bg-input border border-border text-foreground focus:border-ring">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="verified">Verified</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by email or name..."
          className="flex-1 min-w-64 px-4 py-2 rounded bg-input border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:border-ring"
        />
        <Button
          onClick={fetchWaitlistData}
          className="bg-accent hover:bg-accent/90 text-white px-4 py-2"
        >
          Refresh Data
        </Button>
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
          ) : filteredData.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">
                {waitlistData.length === 0 ? "No waitlist entries yet" : "No entries match your filters"}
              </p>
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
                  {filteredData.map((entry) => (
                    <TableRow key={entry.id} className="border-border hover:bg-sidebar/30">
                      <TableCell className="text-foreground">{entry.email}</TableCell>
                      <TableCell className="text-foreground">{entry.name || "N/A"}</TableCell>
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
                        <Dialog>
                          <DialogTrigger asChild>
                            <button
                              className="text-xs text-accent hover:underline"
                            >
                              View
                            </button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md bg-card border border-border">
                            <DialogHeader>
                              <DialogTitle className="text-foreground">Waitlist Entry Details</DialogTitle>
                              <DialogDescription className="text-muted-foreground">
                                User registration information
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-medium text-foreground mb-1">Name</h4>
                                  <p className="text-foreground bg-sidebar/20 p-2 rounded border border-border">
                                    {entry.name || "Not provided"}
                                  </p>
                                </div>
                                <div>
                                  <h4 className="font-medium text-foreground mb-1">Email</h4>
                                  <p className="text-foreground bg-sidebar/20 p-2 rounded border border-border">
                                    {entry.email}
                                  </p>
                                </div>
                              </div>
                              <div>
                                <h4 className="font-medium text-foreground mb-1">Status</h4>
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
                              </div>
                              <div>
                                <h4 className="font-medium text-foreground mb-1">Joined Date</h4>
                                <p className="text-muted-foreground">
                                  {new Date(entry.createdAt).toLocaleString()}
                                </p>
                              </div>
                              <div className="flex gap-2 pt-4">
                                <Button
                                  variant="outline"
                                  className="border border-border text-foreground hover:bg-sidebar/50"
                                >
                                  Close
                                </Button>
                                <Button className="bg-accent hover:bg-accent/90 text-white">
                                  {entry.status === "pending" ? "Verify" : entry.status === "verified" ? "Reject" : "Approve"}
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
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
