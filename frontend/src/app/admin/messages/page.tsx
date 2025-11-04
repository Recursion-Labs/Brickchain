"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ContactMessage {
  id: string;
  email: string;
  name: string;
  subject: string;
  message: string;
  createdAt: string;
  status: "unread" | "read" | "replied";
}

export default function MessagesPage() {
  const [messages] = useState<ContactMessage[]>([]);
  const [loading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

  useEffect(() => {
    // TODO: Fetch messages from API
    // setMessages(data);
  }, []);

  return (
    <div className="w-full p-8 space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-foreground">Contact Messages</h2>
        <p className="text-muted-foreground mt-2">Manage and respond to contact form submissions</p>
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
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
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">No messages yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="text-foreground">From</TableHead>
                    <TableHead className="text-foreground">Email</TableHead>
                    <TableHead className="text-foreground">Subject</TableHead>
                    <TableHead className="text-foreground">Date</TableHead>
                    <TableHead className="text-foreground">Status</TableHead>
                    <TableHead className="text-foreground text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {messages.map((msg) => (
                    <TableRow key={msg.id} className="border-border hover:bg-sidebar/30">
                      <TableCell className="text-foreground">{msg.name}</TableCell>
                      <TableCell className="text-foreground">{msg.email}</TableCell>
                      <TableCell className="text-foreground font-medium">{msg.subject}</TableCell>
                      <TableCell className="text-muted-foreground">{new Date(msg.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge
                          className={`${
                            msg.status === "replied"
                              ? "bg-success text-success-foreground"
                              : msg.status === "read"
                              ? "bg-muted text-muted-foreground"
                              : "bg-warning text-warning-foreground"
                          }`}
                        >
                          {msg.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Dialog>
                          <DialogTrigger asChild>
                            <button
                              className="text-xs text-accent hover:underline"
                              onClick={() => setSelectedMessage(msg)}
                            >
                              View
                            </button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl bg-card border border-border">
                            <DialogHeader>
                              <DialogTitle className="text-foreground">Message Details</DialogTitle>
                              <DialogDescription className="text-muted-foreground">
                                From: {msg.name} ({msg.email}) • {new Date(msg.createdAt).toLocaleString()}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <h4 className="font-medium text-foreground mb-2">Subject</h4>
                                <p className="text-foreground bg-sidebar/20 p-3 rounded border border-border">
                                  {msg.subject}
                                </p>
                              </div>
                              <div>
                                <h4 className="font-medium text-foreground mb-2">Message</h4>
                                <div className="text-foreground bg-sidebar/20 p-3 rounded border border-border whitespace-pre-wrap">
                                  {msg.message}
                                </div>
                              </div>
                              <div className="flex gap-2 pt-4">
                                <Button
                                  variant="outline"
                                  className="border border-border text-foreground hover:bg-sidebar/50"
                                  onClick={() => setSelectedMessage(null)}
                                >
                                  Close
                                </Button>
                                <Button className="bg-accent hover:bg-accent/90 text-white">
                                  Mark as {msg.status === "read" ? "Replied" : "Read"}
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
