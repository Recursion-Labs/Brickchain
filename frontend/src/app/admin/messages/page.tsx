"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

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
        <select className="px-4 py-2 rounded bg-input border border-border text-foreground focus:outline-none focus:border-ring">
          <option>All Status</option>
          <option>Unread</option>
          <option>Read</option>
          <option>Replied</option>
        </select>
        <input
          type="text"
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
