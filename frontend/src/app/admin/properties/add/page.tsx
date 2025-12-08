"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import toast from "react-hot-toast";
import {
  Building,
  FileText,
  MapPin,
  DollarSign,
  Loader2,
  ArrowLeft,
  Upload,
} from "lucide-react";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import Link from "next/link";
import { DocumentList } from "@/components/admin/document-list";
import { UploadedDocument } from "@/types/document.types";
import { storageApiClient } from "@/lib/storage";

const PROPERTY_TYPES = [
  "RESIDENTIAL",
  "COMMERCIAL",
  "INDUSTRIAL",
  "LAND",
  "MULTI_FAMILY",
  "OFFICE_BUILDING",
  "RETAIL",
  "MIXED_USE",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png"];

export default function AddPropertyPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [dragActive, setDragActive] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "",
    location: "",
    value: "",
    shares: "1000",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Check if user is authenticated and has admin role
  if (!isAuthenticated || !user || user.role.toLowerCase() !== "admin") {
    return (
      <div className="w-full p-4 sm:p-6 lg:p-8 flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3 sm:mb-4">
            Access Denied
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6">
            {!isAuthenticated
              ? "Please log in to access the admin dashboard."
              : "You don't have permission to access the admin dashboard. Admin role required."}
          </p>
          <a
            href={!isAuthenticated ? "/auth/login" : "/dashboard"}
            className="inline-block bg-accent hover:bg-accent/90 text-white text-sm sm:text-base px-4 py-2 rounded font-medium"
          >
            {!isAuthenticated ? "Go to Login" : "Go to Dashboard"}
          </a>
        </div>
      </div>
    );
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Property name is required";
    if (!formData.description.trim())
      newErrors.description = "Description is required";
    if (!formData.type) newErrors.type = "Property type is required";
    if (!formData.location.trim()) newErrors.location = "Location is required";
    if (!formData.value || parseFloat(formData.value) <= 0) {
      newErrors.value = "Valid property value is required";
    }
    if (!formData.shares || parseInt(formData.shares) <= 0) {
      newErrors.shares = "Valid number of shares is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    // Validate files
    const validFiles = files.filter((file) => {
      if (!ALLOWED_TYPES.includes(file.type) && file.type !== "image/jpg") {
        toast.error(
          `${file.name} is not a valid file type. Please upload PDF or images.`
        );
        return false;
      }

      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name} is too large. Maximum size is 10MB.`);
        return false;
      }

      return true;
    });

    if (validFiles.length === 0) return;

    // Just store files - don't upload yet
    setSelectedFiles((prev) => [...prev, ...validFiles]);
    toast.success(`${validFiles.length} file(s) selected. Ready to upload when you submit.`);

    // Reset file input
    if (event.target) {
      event.target.value = "";
    }
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files || []);
    if (files.length === 0) return;

    // Validate files
    const validFiles = files.filter((file) => {
      if (!ALLOWED_TYPES.includes(file.type) && file.type !== "image/jpg") {
        toast.error(
          `${file.name} is not a valid file type. Please upload PDF or images.`
        );
        return false;
      }

      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name} is too large. Maximum size is 10MB.`);
        return false;
      }

      return true;
    });

    if (validFiles.length === 0) return;

    // Add files to selection
    setSelectedFiles((prev) => [...prev, ...validFiles]);
    toast.success(`${validFiles.length} file(s) added. Ready to upload when you submit.`);
  };

  const removeDocument = (index: number) => {
    setDocuments((prev) => prev.filter((_, i) => i !== index));
  };

  const removePendingFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    toast.success("File removed from upload queue");
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setIsSubmitting(true);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Step 1: Upload files to storage service (if any)
      const uploadedDocs: UploadedDocument[] = [...documents];

      if (selectedFiles.length > 0) {
        toast.loading("Uploading documents to storage...", { id: "uploading" });

        for (let i = 0; i < selectedFiles.length; i++) {
          const file = selectedFiles[i];
          const progress = Math.round(((i / selectedFiles.length) * 100));
          setUploadProgress(progress);

          try {
            const result = await storageApiClient.uploadFile(file);
            console.log(`[Upload] File stored for ${file.name}:`, result);

            // Validate that we got a proper response
            if (!result || !result.id) {
              throw new Error("Storage server returned empty or invalid response - file may have been uploaded but cannot verify");
            }

            // Pin document to IPFS via Express API using the file ID
            try {
              console.log(`[Upload] Attempting to pin ${file.name} with ID: ${result.id}`);
              const pinResult = await storageApiClient.pinDocumentToIPFS(result.id);
              console.log(`[Upload] Successfully pinned ${file.name}:`, pinResult);
              
              uploadedDocs.push({
                id: result.id,
                cid: pinResult.cid || result.cid || "",
                filename: file.name,
                size: file.size,
                ipfsUrl: pinResult.ipfsUrl,
                blockHash: result.block_hash || "",
                uploadedAt: Date.now(),
                mimeType: file.type,
              });
            } catch (pinError) {
              // If pinning fails, still keep the upload but without IPFS CID
              const pinErrorMsg = pinError instanceof Error ? pinError.message : 'Unknown error';
              console.warn(`[Upload] IPFS pinning failed for ${file.name}:`, pinErrorMsg);
              
              uploadedDocs.push({
                id: result.id,
                cid: result.cid || "",
                filename: file.name,
                size: file.size,
                ipfsUrl: `https://ipfs.io/ipfs/${result.cid}`,
                blockHash: result.block_hash || "",
                uploadedAt: Date.now(),
                mimeType: file.type,
              });
              
              toast.error(`${file.name} uploaded but IPFS pinning failed: ${pinErrorMsg}`, { 
                id: "uploading" 
              });
            }
          } catch (uploadError) {
            const message =
              uploadError instanceof Error
                ? uploadError.message
                : "Failed to upload a document";
            toast.error(`Document upload failed: ${message}`, { id: "uploading" });
            throw uploadError;
          }
        }

        setUploadProgress(100);
        toast.success(`${selectedFiles.length} document(s) uploaded`, {
          id: "uploading",
        });
      }

      // Step 2: Create property with uploaded documents
      setIsUploading(false);
      toast.loading("Adding property...", { id: "adding" });

      const response = await apiClient.addProperty({
        name: formData.name,
        description: formData.description,
        documentId: uploadedDocs.length > 0 ? uploadedDocs[0].id : "",
        type: formData.type,
        location: formData.location,
        value: parseFloat(formData.value),
        shares: parseInt(formData.shares),
        documents: uploadedDocs.map((doc) => ({
          id: doc.id,
          cid: doc.cid,
          filename: doc.filename,
          ipfsUrl: doc.ipfsUrl,
          blockHash: doc.blockHash,
        })),
      });

      if (response.success) {
        toast.success("Property added successfully!", { id: "adding" });
        try {
          const propId = (response.data as { id?: string })?.id;
          if (propId) {
            const myPropsJson = localStorage.getItem("myPropertyIds");
            const myProps = myPropsJson
              ? (JSON.parse(myPropsJson) as string[])
              : [];
            if (!myProps.includes(propId)) {
              myProps.push(propId);
              localStorage.setItem("myPropertyIds", JSON.stringify(myProps));
            }
          }
        } catch (err) {
          console.warn("Failed to store created property id locally", err);
        }
        router.push("/admin/properties");
      } else {
        toast.error(response.message || "Failed to add property", {
          id: "adding",
        });
      }
    } catch (error) {
      console.error("Failed to add property:", error);
      toast.error("Failed to add property. Please try again.");
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        <Button variant="ghost" size="icon" asChild className="w-fit">
          <Link href="/admin/properties">
            <ArrowLeft className="h-4 sm:h-5 w-4 sm:w-5" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Add New Property</h2>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Register a new property to the platform
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <FileText className="h-4 sm:h-5 w-4 sm:w-5" />
              Property Information
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Provide basic details about your property
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm sm:text-base">Property Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => updateFormData("name", e.target.value)}
                  placeholder="e.g., Downtown Office Complex"
                  className={`text-sm ${errors.name ? "border-red-500" : ""}`}
                />
                {errors.name && (
                  <p className="text-xs sm:text-sm text-red-500">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="type" className="text-sm sm:text-base">Property Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => updateFormData("type", value)}
                >
                  <SelectTrigger
                    className={`text-sm ${errors.type ? "border-red-500" : ""}`}
                  >
                    <SelectValue placeholder="Select property type" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROPERTY_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.replace("_", " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.type && (
                  <p className="text-xs sm:text-sm text-red-500">{errors.type}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm sm:text-base">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => updateFormData("description", e.target.value)}
                placeholder="Describe your property in detail..."
                rows={4}
                className={`text-sm ${errors.description ? "border-red-500" : ""}`}
              />
              {errors.description && (
                <p className="text-xs sm:text-sm text-red-500">{errors.description}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <MapPin className="h-4 sm:h-5 w-4 sm:w-5" />
              Location
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Property location information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="location" className="text-sm sm:text-base">Full Address *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => updateFormData("location", e.target.value)}
                placeholder="e.g., 123 Main St, New York, NY 10001"
                className={`text-sm ${errors.location ? "border-red-500" : ""}`}
              />
              {errors.location && (
                <p className="text-xs sm:text-sm text-red-500">{errors.location}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Valuation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <DollarSign className="h-4 sm:h-5 w-4 sm:w-5" />
              Valuation & Shares
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Property value and tokenization details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="value" className="text-sm sm:text-base">Total Value (USD) *</Label>
                <Input
                  id="value"
                  type="number"
                  value={formData.value}
                  onChange={(e) => updateFormData("value", e.target.value)}
                  placeholder="e.g., 2500000"
                  className={`text-sm ${errors.value ? "border-red-500" : ""}`}
                />
                {errors.value && (
                  <p className="text-xs sm:text-sm text-red-500">{errors.value}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="shares" className="text-sm sm:text-base">Total Shares *</Label>
                <Input
                  id="shares"
                  type="number"
                  value={formData.shares}
                  onChange={(e) => updateFormData("shares", e.target.value)}
                  placeholder="e.g., 1000"
                  className={`text-sm ${errors.shares ? "border-red-500" : ""}`}
                />
                {errors.shares && (
                  <p className="text-xs sm:text-sm text-red-500">{errors.shares}</p>
                )}
              </div>
            </div>

            {formData.value && formData.shares && (
              <div className="p-3 sm:p-4 bg-muted rounded-lg">
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Share Price:{" "}
                  <span className="font-semibold text-foreground">
                    $
                    {(
                      parseFloat(formData.value) / parseInt(formData.shares)
                    ).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>{" "}
                  per share
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Documents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Upload className="h-4 sm:h-5 w-4 sm:w-5" />
              Documents (Optional)
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Upload property documents for verification (PDF, JPG, PNG - Max 10MB each)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div 
              className={`border-2 border-dashed rounded-lg p-4 sm:p-6 text-center transition-all ${
                dragActive 
                  ? "border-accent bg-accent/5" 
                  : "border-muted-foreground/25 hover:border-muted-foreground/40"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                id="documents"
                multiple
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileUpload}
                disabled={isSubmitting}
                className="hidden"
              />
              <label htmlFor="documents" className="cursor-pointer block">
                <Upload className="h-8 sm:h-10 w-8 sm:w-10 mx-auto text-muted-foreground mb-2" />
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {isSubmitting && isUploading
                    ? "Uploading..."
                    : dragActive
                    ? "Drop files here"
                    : "Click to upload or drag and drop"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PDF, JPG, PNG (Max 10MB)
                </p>
              </label>
            </div>

            {/* Show selected files (pending upload) */}
            {selectedFiles.length > 0 && (
              <div className="p-3 sm:p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-xs sm:text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">
                  {selectedFiles.length} file(s) selected - will be uploaded when you submit
                </p>
                <div className="space-y-1">
                  {selectedFiles.map((file, idx) => (
                    <p key={idx} className="text-xs text-blue-600 dark:text-blue-400 truncate">
                      • {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Show upload progress during submission */}
            {isSubmitting && isUploading && uploadProgress > 0 && (
              <div className="space-y-2">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-xs text-center text-muted-foreground">
                  Uploading... {uploadProgress}%
                </p>
              </div>
            )}

            {/* Show uploaded documents */}
            <DocumentList
              documents={documents}
              selectedFiles={selectedFiles}
              isUploading={isSubmitting && isUploading}
              uploadProgress={uploadProgress}
              onRemove={removeDocument}
              isLoading={isSubmitting}
            />
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-4">
          <Button variant="outline" asChild className="w-full sm:w-auto">
            <Link href="/admin/properties">Cancel</Link>
          </Button>
          <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto gap-2">
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Adding Property...
              </>
            ) : (
              <>
                <Building className="h-4 w-4" />
                Add Property
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
