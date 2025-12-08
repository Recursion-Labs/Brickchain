"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import toast from "react-hot-toast";
import {
  Building,
  Plus,
  RefreshCw,
  DollarSign,
  Users,
  Edit,
  Trash2,
  Loader2,
  Search,
  MapPin,
} from "lucide-react";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import Link from "next/link";

interface Property {
  id: string;
  name: string;
  description: string;
  type: string;
  location: string;
  value: number;
  shares: number;
  createdAt: string;
  updatedAt: string;
}

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

export default function AdminPropertiesPage() {
  const { user, isAuthenticated } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteIncludeDocuments, setDeleteIncludeDocuments] = useState(false);

  // Form states for editing
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    type: "",
    location: "",
    value: "",
    shares: "",
  });

  const fetchProperties = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.getProperties();
      if (response.success && response.data) {
        // API returns { success: true, data: [...] }, so we need response.data.data
        const apiData = response.data as { success?: boolean; data?: unknown[] };
        const rawData = Array.isArray(response.data)
          ? response.data
          : Array.isArray(apiData.data)
            ? apiData.data
            : [];
        
        // Normalize field names (API returns Location, Value, Shares with capitals)
        const normalizedData = (rawData || []).map((prop: unknown) => {
          const p = prop as Record<string, unknown>;
          return {
            id: p.id as string,
            name: p.name as string,
            description: p.description as string,
            type: p.type as string,
            location: (p.location || p.Location) as string,
            value: (p.value || p.Value) as number,
            shares: (p.shares || p.Shares) as number,
            createdAt: p.createdAt as string,
            updatedAt: p.updatedAt as string,
          };
        });
        
        setProperties(normalizedData);
      } else {
        toast.error(response.message || "Failed to fetch properties");
      }
    } catch {
      toast.error("Failed to fetch properties");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  // Listen for refresh event from sidebar
  useEffect(() => {
    const handleRefresh = () => {
      fetchProperties();
      toast.success("Properties refreshed");
    };

    window.addEventListener("refresh-properties", handleRefresh);
    return () => window.removeEventListener("refresh-properties", handleRefresh);
  }, [fetchProperties]);

  // Check if user is authenticated and has admin role
  if (!isAuthenticated || !user || user.role.toLowerCase() !== "admin") {
    return (
      <div className="w-full p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Access Denied
          </h2>
          <p className="text-muted-foreground mb-4">
            {!isAuthenticated
              ? "Please log in to access the admin dashboard."
              : "You don't have permission to access the admin dashboard. Admin role required."}
          </p>
          <a
            href={!isAuthenticated ? "/auth/login" : "/dashboard"}
            className="bg-accent hover:bg-accent/90 text-white px-4 py-2 rounded"
          >
            {!isAuthenticated ? "Go to Login" : "Go to Dashboard"}
          </a>
        </div>
      </div>
    );
  }

  const handleEditProperty = (property: Property) => {
    setEditingProperty(property);
    setEditForm({
      name: property.name,
      description: property.description,
      type: property.type,
      location: property.location,
      value: property.value.toString(),
      shares: property.shares.toString(),
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateProperty = async () => {
    if (!editingProperty) return;

    try {
      setIsSubmitting(true);
      const response = await apiClient.updateProperty(editingProperty.id, {
        name: editForm.name,
        description: editForm.description,
        type: editForm.type,
        location: editForm.location,
        value: parseFloat(editForm.value),
        shares: parseInt(editForm.shares),
      });

      if (response.success) {
        toast.success("Property updated successfully");
        setIsEditDialogOpen(false);
        setEditingProperty(null);
        fetchProperties();
      } else {
        toast.error(response.message || "Failed to update property");
      }
    } catch {
      toast.error("Failed to update property");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProperty = async (propertyId: string) => {
    try {
      setIsSubmitting(true);
      const response = await apiClient.deletePropertyWithDocuments(
        propertyId,
        deleteIncludeDocuments
      );
      if (response.success) {
        toast.success(
          deleteIncludeDocuments
            ? "Property and documents deleted successfully"
            : "Property deleted successfully"
        );
        fetchProperties();
        setIsDeleteDialogOpen(false);
        setPropertyToDelete(null);
        setDeleteIncludeDocuments(false);
      } else {
        toast.error(response.message || "Failed to delete property");
      }
    } catch (error) {
      toast.error("Failed to delete property");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDeleteDialog = (property: Property) => {
    setPropertyToDelete(property);
    setIsDeleteDialogOpen(true);
    setDeleteIncludeDocuments(false);
  };

  const getPropertyTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      RESIDENTIAL: "bg-blue-100 text-blue-800",
      COMMERCIAL: "bg-green-100 text-green-800",
      INDUSTRIAL: "bg-orange-100 text-orange-800",
      LAND: "bg-yellow-100 text-yellow-800",
      MULTI_FAMILY: "bg-purple-100 text-purple-800",
      OFFICE_BUILDING: "bg-indigo-100 text-indigo-800",
      RETAIL: "bg-pink-100 text-pink-800",
      MIXED_USE: "bg-gray-100 text-gray-800",
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  const filteredProperties = properties.filter(
    (property) =>
      property.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPropertiesValue = properties.reduce(
    (sum, prop) => sum + (prop.value || 0),
    0
  );
  const totalShares = properties.reduce(
    (sum, prop) => sum + (prop.shares || 0),
    0
  );

  return (
    <div className="w-full min-h-screen p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">All Properties</h2>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            View and manage all registered properties
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            onClick={fetchProperties}
            disabled={loading}
            className="gap-2 w-full sm:w-auto"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button asChild className="gap-2 w-full sm:w-auto">
            <Link href="/admin/properties/add">
              <Plus className="h-4 w-4" />
              Add Property
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Total Properties
            </CardTitle>
            <Building className="h-4 w-4 text-muted-foreground shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              {loading ? "..." : properties.length}
            </div>
            <p className="text-xs text-muted-foreground">Registered properties</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              {loading ? "..." : `$${totalPropertiesValue.toLocaleString()}`}
            </div>
            <p className="text-xs text-muted-foreground">
              Property portfolio value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Shares</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              {loading ? "..." : totalShares.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Total shares available
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Avg Value
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              {loading || properties.length === 0
                ? "..."
                : `$${Math.round(totalPropertiesValue / properties.length).toLocaleString()}`}
            </div>
            <p className="text-xs text-muted-foreground">Average per property</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative w-full sm:max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search properties..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Properties List */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Property Portfolio</CardTitle>
          <CardDescription className="text-sm">
            {filteredProperties.length} properties found
          </CardDescription>
        </CardHeader>
        <CardContent className="w-full">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2 text-sm sm:text-base">Loading properties...</span>
            </div>
          ) : filteredProperties.length === 0 ? (
            <div className="text-center py-12">
              <Building className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold mb-2">No Properties Found</h3>
              <p className="text-muted-foreground mb-6 text-sm">
                {searchTerm
                  ? "No properties match your search criteria."
                  : "Register your first property to start building your portfolio."}
              </p>
              {!searchTerm && (
                <Button asChild>
                  <Link href="/admin/properties/add">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Property
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {filteredProperties.map((property) => (
                <Card key={property.id} className="p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-4">
                    <div className="flex-1 w-full">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mb-2">
                        <h4 className="text-base sm:text-lg font-semibold">{property.name}</h4>
                        <Badge className={getPropertyTypeColor(property.type)}>
                          {property.type?.replace("_", " ")}
                        </Badge>
                      </div>

                      <p className="text-muted-foreground mb-3 line-clamp-2 text-sm">
                        {property.description}
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs sm:text-sm">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span className="text-muted-foreground">Location:</span>
                          <span className="font-medium truncate">{property.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span className="text-muted-foreground">Value:</span>
                          <span className="font-medium">
                            ${property.value?.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span className="text-muted-foreground">Shares:</span>
                          <span className="font-medium">
                            {property.shares?.toLocaleString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Created:</span>
                          <span className="font-medium ml-1">
                            {new Date(property.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 ml-0 sm:ml-4 w-full sm:w-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="flex-1 sm:flex-none"
                      >
                        <Link href={`/admin/properties/edit?id=${property.id}`}>
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 flex-1 sm:flex-none"
                        onClick={() => openDeleteDialog(property)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Property Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="w-[95vw] sm:w-full sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Property</DialogTitle>
            <DialogDescription>
              Update the property details below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-4">
              <Label htmlFor="name" className="sm:text-right">
                Name
              </Label>
              <Input
                id="name"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm({ ...editForm, name: e.target.value })
                }
                className="col-span-1 sm:col-span-3"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-4">
              <Label htmlFor="description" className="sm:text-right">
                Description
              </Label>
              <Textarea
                id="description"
                value={editForm.description}
                onChange={(e) =>
                  setEditForm({ ...editForm, description: e.target.value })
                }
                className="col-span-1 sm:col-span-3"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-4">
              <Label htmlFor="type" className="sm:text-right">
                Type
              </Label>
              <Select
                value={editForm.type}
                onValueChange={(value) =>
                  setEditForm({ ...editForm, type: value })
                }
              >
                <SelectTrigger className="col-span-1 sm:col-span-3">
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
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="location" className="text-right">
                Location
              </Label>
              <Input
                id="location"
                value={editForm.location}
                onChange={(e) =>
                  setEditForm({ ...editForm, location: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="value" className="text-right">
                Value
              </Label>
              <Input
                id="value"
                type="number"
                value={editForm.value}
                onChange={(e) =>
                  setEditForm({ ...editForm, value: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="shares" className="text-right">
                Shares
              </Label>
              <Input
                id="shares"
                type="number"
                value={editForm.shares}
                onChange={(e) =>
                  setEditForm({ ...editForm, shares: e.target.value })
                }
                className="col-span-3"
              />
            </div>
          </div>
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateProperty} disabled={isSubmitting} className="w-full sm:w-auto">
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Update Property
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Property Dialog with Document Option */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="w-[95vw] sm:w-full">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Property</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{propertyToDelete?.name}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4 space-y-4">
            <div className="flex items-start space-x-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
              <input
                type="checkbox"
                id="deleteDocuments"
                checked={deleteIncludeDocuments}
                onChange={(e) => setDeleteIncludeDocuments(e.target.checked)}
                className="w-4 h-4 rounded mt-1"
              />
              <label htmlFor="deleteDocuments" className="text-sm cursor-pointer flex-1">
                <span className="font-medium">Also delete associated documents</span>
                <p className="text-xs text-gray-600 mt-1">
                  This will remove the documents from storage and IPFS as well.
                </p>
              </label>
            </div>
          </div>
          <AlertDialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
            <AlertDialogCancel className="w-full sm:w-auto">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                propertyToDelete && handleDeleteProperty(propertyToDelete.id)
              }
              disabled={isSubmitting}
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
