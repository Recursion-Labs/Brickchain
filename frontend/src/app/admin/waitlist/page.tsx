"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface WaitlistEntry {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  status: "pending" | "verified" | "rejected";
}

export default function WaitlistPage() {
  const [waitlistData, setWaitlistData] = useState<WaitlistEntry[]>([]);
  const [loading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedEntry, setSelectedEntry] = useState<WaitlistEntry | null>(null);

  // Dummy data for testing
  const dummyWaitlist: WaitlistEntry[] = [
    {
      id: "1",
      email: "alex.chen@gmail.com",
      name: "Alex Chen",
      createdAt: "2025-11-03T08:15:00Z",
      status: "pending"
    },
    {
      id: "2",
      email: "emma.davis@outlook.com",
      name: "Emma Davis",
      createdAt: "2025-11-02T14:30:00Z",
      status: "verified"
    },
    {
      id: "3",
      email: "robert.wilson@yahoo.com",
      name: "Robert Wilson",
      createdAt: "2025-11-01T10:45:00Z",
      status: "pending"
    },
    {
      id: "4",
      email: "sophia.martinez@techstartup.com",
      name: "Sophia Martinez",
      createdAt: "2025-10-31T16:20:00Z",
      status: "verified"
    },
    {
      id: "5",
      email: "james.brown@investor.com",
      name: "James Brown",
      createdAt: "2025-10-30T12:10:00Z",
      status: "rejected"
    },
    {
      id: "6",
      email: "olivia.taylor@realestate.com",
      name: "Olivia Taylor",
      createdAt: "2025-10-29T09:55:00Z",
      status: "pending"
    },
    {
      id: "7",
      email: "william.garcia@blockchain.io",
      name: "William Garcia",
      createdAt: "2025-10-28T15:40:00Z",
      status: "verified"
    },
    {
      id: "8",
      email: "ava.anderson@startup.co",
      name: "Ava Anderson",
      createdAt: "2025-10-27T11:25:00Z",
      status: "pending"
    }
  ];

  const loadDummyData = () => {
    setWaitlistData(dummyWaitlist);
  };

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
          onClick={loadDummyData}
          className="bg-accent hover:bg-accent/90 text-white px-4 py-2"
        >
          Load Dummy Data
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
                        <Dialog>
                          <DialogTrigger asChild>
                            <button
                              className="text-xs text-accent hover:underline"
                              onClick={() => setSelectedEntry(entry)}
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
                                    {entry.name}
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
                                  onClick={() => setSelectedEntry(null)}
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
