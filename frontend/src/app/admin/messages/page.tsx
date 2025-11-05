"use client";

import { useState, useEffect } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
  status: "unread" | "read" | "replied";
}

interface ContactApiResponse {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
  status?: string;
}

export default function MessagesPage() {
  const [messagesData, setMessagesData] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const fetchMessagesData = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getContactResponses();

      if (response.success && response.data) {
        // Transform the data to match our interface
        const transformedData = Array.isArray(response.data)
          ? response.data.map((item: ContactApiResponse) => ({
              id: item.id,
              name: item.name,
              email: item.email,
              message: item.message,
              createdAt: item.createdAt,
              status: (item.status?.toLowerCase() || 'unread') as "unread" | "read" | "replied"
            }))
          : [];

        setMessagesData(transformedData);
      }
    } catch (error) {
      console.error('Failed to fetch messages data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessagesData();
  }, []);

  // Filter data based on status and search
  const filteredData = messagesData.filter((message) => {
    const matchesStatus = statusFilter === "all" || message.status === statusFilter;
    const matchesSearch =
      message.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.message.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="w-full p-8 space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-foreground">Contact Messages</h2>
        <p className="text-muted-foreground mt-2">Manage and respond to contact form submissions</p>
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap items-center">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px] bg-input border border-border text-foreground focus:border-ring">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="unread">Unread</SelectItem>
            <SelectItem value="read">Read</SelectItem>
            <SelectItem value="replied">Replied</SelectItem>
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
          onClick={fetchMessagesData}
          className="bg-accent hover:bg-accent/90 text-white px-4 py-2"
        >
          Refresh Data
        </Button>
      </div>

      {/* Messages Table */}
      <Card className="bg-card border border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Messages</CardTitle>
          <CardDescription>All contact form submissions</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">Loading...</p>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">
                {messagesData.length === 0 ? "No messages yet" : "No messages match your filters"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="text-foreground">Name</TableHead>
                    <TableHead className="text-foreground">Email</TableHead>
                    <TableHead className="text-foreground">Message</TableHead>
                    <TableHead className="text-foreground">Received</TableHead>
                    <TableHead className="text-foreground">Status</TableHead>
                    <TableHead className="text-foreground text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((message) => (
                    <TableRow key={message.id} className="border-border hover:bg-sidebar/30">
                      <TableCell className="text-foreground">{message.name}</TableCell>
                      <TableCell className="text-foreground">{message.email}</TableCell>
                      <TableCell className="text-muted-foreground max-w-xs truncate">
                        {message.message}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{new Date(message.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge
                          className={`${
                            message.status === "unread"
                              ? "bg-error text-error-foreground"
                              : message.status === "read"
                              ? "bg-warning text-warning-foreground"
                              : "bg-success text-success-foreground"
                          }`}
                        >
                          {message.status}
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
                          <DialogContent className="max-w-2xl bg-card border border-border">
                            <DialogHeader>
                              <DialogTitle className="text-foreground">Message Details</DialogTitle>
                              <DialogDescription className="text-muted-foreground">
                                Contact form submission from {message.name}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-medium text-foreground mb-1">Name</h4>
                                  <p className="text-foreground bg-sidebar/20 p-2 rounded border border-border">
                                    {message.name}
                                  </p>
                                </div>
                                <div>
                                  <h4 className="font-medium text-foreground mb-1">Email</h4>
                                  <p className="text-foreground bg-sidebar/20 p-2 rounded border border-border">
                                    {message.email}
                                  </p>
                                </div>
                              </div>
                              <div>
                                <h4 className="font-medium text-foreground mb-1">Message</h4>
                                <div className="text-foreground bg-sidebar/20 p-4 rounded border border-border whitespace-pre-wrap">
                                  {message.message}
                                </div>
                              </div>
                              <div>
                                <h4 className="font-medium text-foreground mb-1">Status</h4>
                                <Badge
                                  className={`${
                                    message.status === "unread"
                                      ? "bg-error text-error-foreground"
                                      : message.status === "read"
                                      ? "bg-warning text-warning-foreground"
                                      : "bg-success text-success-foreground"
                                  }`}
                                >
                                  {message.status}
                                </Badge>
                              </div>
                              <div>
                                <h4 className="font-medium text-foreground mb-1">Received Date</h4>
                                <p className="text-muted-foreground">
                                  {new Date(message.createdAt).toLocaleString()}
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
                                  {message.status === "unread" ? "Mark as Read" : message.status === "read" ? "Mark as Replied" : "Mark as Unread"}
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
