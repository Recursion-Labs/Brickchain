"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import toast from "react-hot-toast";
import {
  Download,
  Search,
  Trash2,
  ExternalLink,
  FileText,
  AlertCircle,
  Loader2,
  RefreshCw,
  ArrowLeft,
  Eye,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { storageApiClient } from "@/lib/storage";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DocumentMetadata {
  id_hex: string;
  filename: string;
  mime: string;
  size_bytes: number;
  created_at_unix_ms: number;
  cid: string | null;
}

export default function DocumentsPage() {
  const { user, isAuthenticated } = useAuth();
  const [documents, setDocuments] = useState<DocumentMetadata[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<DocumentMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [downloading, setDownloading] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Load documents
  const loadDocuments = async () => {
    try {
      setLoading(true);
      const docs = await storageApiClient.listDocuments();
      // Handle null response (API error) and extract documents array
      const documentsList = Array.isArray(docs) ? docs : docs?.documents || [];
      setDocuments(documentsList);
      setFilteredDocuments(documentsList);
    } catch (error) {
      console.error("Failed to load documents:", error);
      toast.error("Failed to load documents");
      setDocuments([]);
      setFilteredDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    loadDocuments();
  }, [isAuthenticated, user]);

  // Search documents
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredDocuments(documents);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = documents.filter(
      (doc) =>
        doc.filename.toLowerCase().includes(term) ||
        doc.id_hex.toLowerCase().includes(term)
    );
    setFilteredDocuments(filtered);
    setSearching(false);
  }, [searchTerm, documents]);

  const handleDownload = async (docId: string, filename: string) => {
    try {
      setDownloading(docId);
      const blob = await storageApiClient.downloadFile(docId);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Document downloaded");
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Failed to download document");
    } finally {
      setDownloading(null);
    }
  };

  const handleDelete = async (docId: string) => {
    try {
      setDeleting(docId);
      const response = await storageApiClient.deleteFile(docId);

      if (response.success) {
        setDocuments((prev) => prev.filter((doc) => doc.id_hex !== docId));
        toast.success("Document deleted successfully");
      } else {
        toast.error("Failed to delete document");
      }
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error("Failed to delete document");
    } finally {
      setDeleting(null);
      setDeleteConfirm(null);
    }
  };

  if (!isAuthenticated || !user || user.role.toLowerCase() !== "admin") {
    return (
      <div className="w-full p-4 sm:p-6 lg:p-8 flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3">
            Access Denied
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            Admin role required to access this page.
          </p>
          <Link href="/admin/properties">
            <Button>Go Back</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <Button variant="ghost" size="icon" asChild className="w-fit">
            <Link href="/admin/properties">
              <ArrowLeft className="h-4 sm:h-5 w-4 sm:w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Document Management
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              View, search, and manage all uploaded documents
            </p>
          </div>
        </div>
        <Button onClick={loadDocuments} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by filename or ID..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setSearching(true);
              }}
              className="pl-10 text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl sm:text-3xl font-bold">
              {Array.isArray(documents) ? documents.length : 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              With IPFS (CID)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl sm:text-3xl font-bold">
              {Array.isArray(documents) ? documents.filter((d) => d.cid).length : 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Size
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl sm:text-3xl font-bold">
              {Array.isArray(documents)
                ? (
                    documents.reduce((sum, doc) => sum + doc.size_bytes, 0) /
                    1024 /
                    1024
                  ).toFixed(2)
                : "0.00"}{" "}
              MB
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Documents List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Documents
          </CardTitle>
          <CardDescription>
            {filteredDocuments.length} of {documents.length} document(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">
                {searchTerm
                  ? "No documents match your search"
                  : "No documents yet. Upload documents from the property form."}
              </p>
            </div>
          ) : (
            <div className="space-y-2 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 font-medium">
                      Filename
                    </th>
                    <th className="text-left py-3 px-2 font-medium">Size</th>
                    <th className="text-left py-3 px-2 font-medium">CID</th>
                    <th className="text-left py-3 px-2 font-medium">Created</th>
                    <th className="text-right py-3 px-2 font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDocuments.map((doc) => (
                    <tr key={doc.id_hex} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-2 truncate">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span className="truncate">{doc.filename}</span>
                        </div>
                      </td>
                      <td className="py-3 px-2 whitespace-nowrap">
                        {(doc.size_bytes / 1024 / 1024).toFixed(2)} MB
                      </td>
                      <td className="py-3 px-2">
                        {doc.cid ? (
                          <Badge variant="secondary" className="text-xs">
                            {doc.cid.slice(0, 12)}...
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">
                            Pending
                          </Badge>
                        )}
                      </td>
                      <td className="py-3 px-2 text-xs text-muted-foreground">
                        {new Date(doc.created_at_unix_ms).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-2 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {doc.cid && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              asChild
                            >
                              <a
                                href={`https://ipfs.io/ipfs/${doc.cid}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Eye className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleDownload(doc.id_hex, doc.filename)
                            }
                            disabled={downloading === doc.id_hex}
                          >
                            {downloading === doc.id_hex ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Download className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteConfirm(doc.id_hex)}
                            disabled={deleting === doc.id_hex}
                            className="text-red-600 hover:text-red-700"
                          >
                            {deleting === doc.id_hex ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this document? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                deleteConfirm && handleDelete(deleteConfirm)
              }
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
