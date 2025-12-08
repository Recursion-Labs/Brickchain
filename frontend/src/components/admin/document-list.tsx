/**
 * Document List Component
 * Displays uploaded documents with metadata
 * Keeps it simple and reusable
 */

"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileText, X, ExternalLink, Loader2 } from "lucide-react";
import { UploadedDocument } from "@/types/document.types";

interface DocumentListProps {
  documents: UploadedDocument[];
  isUploading?: boolean;
  uploadProgress?: number;
  onRemove?: (index: number, isPending?: boolean) => void;
  isLoading?: boolean;
  selectedFiles?: File[];
}

export function DocumentList({
  documents,
  isUploading,
  uploadProgress,
  onRemove,
  isLoading,
  selectedFiles,
}: DocumentListProps) {
  const [, setPreviews] = useState<Record<number, string>>({});
  // Kept for future image preview enhancement
  void setPreviews;

  const allItems = selectedFiles
    ? [...selectedFiles.map((f, i) => ({ type: "pending" as const, file: f, index: i })), ...documents.map((d) => ({ type: "uploaded" as const, doc: d, index: documents.indexOf(d) }))]
    : documents.map((d) => ({ type: "uploaded" as const, doc: d, index: documents.indexOf(d) }));

  if (!allItems.length && !isUploading) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm sm:text-base font-medium">
          Documents ({selectedFiles ? selectedFiles.length + documents.length : documents.length})
        </label>
        {isUploading && uploadProgress !== undefined && (
          <span className="text-xs sm:text-sm text-muted-foreground">
            {uploadProgress}%
          </span>
        )}
      </div>

      <div className="space-y-2">
        {/* Uploading state */}
        {isUploading && uploadProgress !== undefined && (
          <Card className="p-3 sm:p-4 bg-blue-50 border-blue-200">
            <div className="flex items-center gap-2 sm:gap-3">
              <Loader2 className="h-4 w-4 animate-spin text-blue-600 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-blue-900 truncate">
                  Uploading to storage...
                </p>
                <div className="w-full bg-blue-200 rounded-full h-1.5 mt-1.5">
                  <div
                    className="bg-blue-600 h-1.5 rounded-full transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Pending files */}
        {selectedFiles && selectedFiles.map((file, index) => (
          <Card key={`pending-${index}`} className="p-3 sm:p-4 opacity-75">
            <div className="space-y-2">
              {/* Header */}
              <div className="flex items-start justify-between gap-2 min-h-fit">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  {/* Icon only - simple display */}
                  <div className="h-12 w-12 sm:h-16 sm:w-16 bg-gray-100 rounded flex items-center justify-center shrink-0">
                    <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium truncate text-foreground">
                      {file.name}
                    </p>
                    <Badge variant="secondary" className="text-xs mt-1 w-fit">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </Badge>
                    <p className="text-xs text-yellow-600 mt-1">Pending upload</p>
                  </div>
                </div>

                {/* Remove button */}
                {onRemove && !isLoading && !isUploading && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemove(index, true)}
                    className="h-7 w-7 shrink-0 text-muted-foreground hover:text-red-600"
                  >
                    <X className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}

        {/* Uploaded documents */}
        {documents.map((doc, index) => (
          <Card key={`${doc.id}-${index}`} className="p-3 sm:p-4">
            <div className="space-y-2">
              {/* Header */}
              <div className="flex items-start justify-between gap-2 min-h-fit">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  {/* Thumbnail placeholder - simple display */}
                  <div className="h-12 w-12 sm:h-16 sm:w-16 bg-gray-100 rounded flex items-center justify-center shrink-0">
                    <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium truncate text-foreground">
                      {doc.filename}
                    </p>
                    <Badge variant="secondary" className="text-xs mt-1 w-fit">
                      {(doc.size / 1024 / 1024).toFixed(2)} MB
                    </Badge>
                  </div>
                </div>

                {/* Remove button */}
                {onRemove && !isLoading && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemove(index)}
                    className="h-7 w-7 shrink-0 text-muted-foreground hover:text-red-600"
                  >
                    <X className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                )}
              </div>

              {/* Metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs text-muted-foreground pl-16 sm:pl-20">
                <div className="truncate">
                  <span className="font-medium">ID:</span> {doc.id.slice(0, 16)}...
                </div>
                <div className="truncate">
                  <span className="font-medium">CID:</span> {doc.cid.slice(0, 16)}...
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 flex-wrap pt-2 pl-16 sm:pl-20">
                {doc.ipfsUrl && (
                  <a
                    href={doc.ipfsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs inline-flex items-center gap-1 text-blue-600 hover:text-blue-700"
                  >
                    <ExternalLink className="h-3 w-3" />
                    View on IPFS
                  </a>
                )}
                {doc.blockHash && (
                  <div className="text-xs text-green-600">
                    <span className="font-medium">Block:</span> {doc.blockHash.slice(0, 12)}...
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
