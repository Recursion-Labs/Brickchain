"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  ArrowLeft,
  Building,
  MapPin,
  DollarSign,
  Loader2,
  Save,
  Upload,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/lib/auth";
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

const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export default function EditPropertyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated } = useAuth();
  
  const propertyId = searchParams.get("id");
  
  const [isLoading, setIsLoading] = useState(true);
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

  // Load property data
  useEffect(() => {
    if (!isAuthenticated || !user || user.role.toLowerCase() !== "admin") return;
    if (!propertyId) {
      router.push("/admin/properties");
      return;
    }

    const loadProperty = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.getProperty(propertyId);
        if (response.success && response.data) {
          const prop = response.data as any;
          setFormData({
            name: prop.name || "",
            description: prop.description || "",
            type: prop.type || "",
            location: prop.location || "",
            value: prop.value?.toString() || "",
            shares: prop.shares?.toString() || "1000",
          });
          setDocuments(prop.documents || []);
        } else {
          toast.error("Failed to load property");
          router.push("/admin/properties");
        }
      } catch (error) {
        console.error("Failed to load property:", error);
        toast.error("Failed to load property");
        router.push("/admin/properties");
      } finally {
        setIsLoading(false);
      }
    };

    loadProperty();
  }, [propertyId, isAuthenticated, user, router]);

  if (!isAuthenticated || !user || user.role.toLowerCase() !== "admin") {
    return (
      <div className="w-full p-4 sm:p-6 lg:p-8 flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3 sm:mb-4">
            Access Denied
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6">
            Admin role required to edit properties.
          </p>
          <Link href="/admin/properties">
            <Button>Go Back</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full p-4 sm:p-6 lg:p-8 flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
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

    // Check for duplicate filenames
    const existingNames = new Set([
      ...documents.map((doc) => doc.filename),
      ...selectedFiles.map((file) => file.name),
    ]);

    const validFiles = files.filter((file) => {
      // Check for duplicates
      if (existingNames.has(file.name)) {
        toast.error(
          `${file.name} is already uploaded. Please use a different filename.`
        );
        return false;
      }

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

    setSelectedFiles((prev) => [...prev, ...validFiles]);
    toast.success(
      `${validFiles.length} file(s) selected. Ready to upload when you save.`
    );

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

    // Check for duplicate filenames
    const existingNames = new Set([
      ...documents.map((doc) => doc.filename),
      ...selectedFiles.map((file) => file.name),
    ]);

    const validFiles = files.filter((file) => {
      // Check for duplicates
      if (existingNames.has(file.name)) {
        toast.error(
          `${file.name} is already uploaded. Please use a different filename.`
        );
        return false;
      }

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

    setSelectedFiles((prev) => [...prev, ...validFiles]);
    toast.success(
      `${validFiles.length} file(s) added. Ready to upload when you save.`
    );
  };

  const removeDocument = (index: number, isPending?: boolean) => {
    if (isPending) {
      setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
      toast.success("File removed from upload queue");
    } else {
      setDocuments((prev) => prev.filter((_, i) => i !== index));
      toast.success("Document removed");
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setIsSubmitting(true);
    setIsUploading(false);
    setUploadProgress(0);

    try {
      // Step 1: Upload new files if any
      const uploadedDocs: UploadedDocument[] = [...documents];

      if (selectedFiles.length > 0) {
        toast.loading("Uploading documents to storage...", { id: "uploading" });
        setIsUploading(true);

        for (let i = 0; i < selectedFiles.length; i++) {
          const file = selectedFiles[i];
          const progress = Math.round((i / selectedFiles.length) * 100);
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
                cid: pinResult.cid,
                filename: file.name,
                size: file.size,
                ipfsUrl: pinResult.ipfsUrl,
                blockHash: result.block_hash || "",
                uploadedAt: Date.now(),
                mimeType: file.type,
              });
              
              toast.success(`${file.name} pinned to IPFS`, { id: "uploading" });
            } catch (pinError) {
              // If pinning fails, still keep the upload but without IPFS CID
              const pinErrorMsg = pinError instanceof Error ? pinError.message : 'Unknown error';
              console.warn(`[Upload] IPFS pinning failed for ${file.name}:`, pinErrorMsg);
              
              uploadedDocs.push({
                id: result.id,
                cid: result.cid,
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
            const errorMessage = uploadError instanceof Error ? uploadError.message : "Failed to upload a document";
            
            console.error(`[Upload Error] ${file.name}:`, errorMessage);
            
            // Check if this is an empty response error from storage API
            if (errorMessage.includes("empty or invalid response") || errorMessage.includes("incomplete response")) {
              toast.error(
                `${file.name}: Storage server connection issue. Please check the storage service is running and retry.`,
                { id: "uploading" }
              );
            } else if (errorMessage.includes("IPFS")) {
              toast.error(
                `${file.name}: IPFS pinning failed. The file was uploaded but not pinned to IPFS. Try uploading again.`,
                { id: "uploading" }
              );
            } else {
              toast.error(`${file.name}: ${errorMessage}`, {
                id: "uploading",
              });
            }
            throw uploadError;
          }
        }

        setUploadProgress(100);
        toast.success(`${selectedFiles.length} document(s) uploaded`, {
          id: "uploading",
        });
      }

      // Step 2: Update property
      setIsUploading(false);
      toast.loading("Updating property...", { id: "updating" });

      if (!propertyId) {
        toast.error("Property ID is missing", { id: "updating" });
        return;
      }

      const response = await apiClient.updateProperty(propertyId, {
        name: formData.name,
        description: formData.description,
        type: formData.type,
        location: formData.location,
        value: parseFloat(formData.value),
        shares: parseInt(formData.shares),
        documentId: uploadedDocs.length > 0 ? uploadedDocs[0].id : "",
      });

      if (response.success) {
        toast.success("Property updated successfully!", { id: "updating" });
        setSelectedFiles([]);
        router.push("/admin/properties");
      } else {
        toast.error(response.message || "Failed to update property", {
          id: "updating",
        });
      }
    } catch (error) {
      console.error("Failed to update property:", error);
      toast.error("Failed to update property. Please try again.");
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
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
            Edit Property
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Update property details and documents
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
              Update property details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm sm:text-base">
                  Property Name
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => updateFormData("name", e.target.value)}
                  className={`text-sm ${errors.name ? "border-red-500" : ""}`}
                />
                {errors.name && (
                  <p className="text-xs sm:text-sm text-red-500">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="type" className="text-sm sm:text-base">
                  Property Type
                </Label>
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
              <Label htmlFor="description" className="text-sm sm:text-base">
                Description
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => updateFormData("description", e.target.value)}
                rows={4}
                className={`text-sm ${errors.description ? "border-red-500" : ""}`}
              />
              {errors.description && (
                <p className="text-xs sm:text-sm text-red-500">
                  {errors.description}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Location & Valuation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <MapPin className="h-4 sm:h-5 w-4 sm:w-5" />
              Location & Valuation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="location" className="text-sm sm:text-base">
                Location
              </Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => updateFormData("location", e.target.value)}
                className={`text-sm ${errors.location ? "border-red-500" : ""}`}
              />
              {errors.location && (
                <p className="text-xs sm:text-sm text-red-500">
                  {errors.location}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="value" className="text-sm sm:text-base">
                  Total Value (USD)
                </Label>
                <Input
                  id="value"
                  type="number"
                  value={formData.value}
                  onChange={(e) => updateFormData("value", e.target.value)}
                  className={`text-sm ${errors.value ? "border-red-500" : ""}`}
                />
                {errors.value && (
                  <p className="text-xs sm:text-sm text-red-500">{errors.value}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="shares" className="text-sm sm:text-base">
                  Total Shares
                </Label>
                <Input
                  id="shares"
                  type="number"
                  value={formData.shares}
                  onChange={(e) => updateFormData("shares", e.target.value)}
                  className={`text-sm ${errors.shares ? "border-red-500" : ""}`}
                />
                {errors.shares && (
                  <p className="text-xs sm:text-sm text-red-500">
                    {errors.shares}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Upload className="h-4 sm:h-5 w-4 sm:w-5" />
              Documents
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Add or update property documents (PDF, JPG, PNG - Max 10MB each)
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

            {/* Show documents */}
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
          <Button type="button" variant="outline" asChild>
            <Link href="/admin/properties">Cancel</Link>
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
