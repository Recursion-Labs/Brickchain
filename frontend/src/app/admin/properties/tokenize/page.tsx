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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import toast from "react-hot-toast";
import {
  TrendingUp,
  Loader2,
  ArrowLeft,
  Coins,
  DollarSign,
  Building,
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

export default function TokenizePage() {
  const { user, isAuthenticated } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedPropertyId, setSelectedPropertyId] = useState("");
  const [mintAmount, setMintAmount] = useState("");
  const [tokenPrice, setTokenPrice] = useState("");
  const [platformReserve, setPlatformReserve] = useState("10");
  const [liquidityPool, setLiquidityPool] = useState("20");
  const [publicSale, setPublicSale] = useState("70");

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
        const normalizedData = rawData.map((prop: Record<string, unknown>) => ({
          id: prop.id as string,
          name: prop.name as string,
          description: prop.description as string,
          type: prop.type as string,
          location: (prop.location || prop.Location) as string,
          value: (prop.value || prop.Value) as number,
          shares: (prop.shares || prop.Shares) as number,
          createdAt: prop.createdAt as string,
          updatedAt: prop.updatedAt as string,
        }));
        
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

  const selectedProperty = properties.find((p) => p.id === selectedPropertyId);

  const handleMintTokens = async () => {
    if (!selectedPropertyId) {
      toast.error("Please select a property to tokenize");
      return;
    }

    if (!mintAmount || parseInt(mintAmount) <= 0) {
      toast.error("Please enter a valid token supply");
      return;
    }

    if (!tokenPrice || parseFloat(tokenPrice) <= 0) {
      toast.error("Please enter a valid token price");
      return;
    }

    const totalDistribution =
      parseInt(platformReserve) + parseInt(liquidityPool) + parseInt(publicSale);
    if (totalDistribution !== 100) {
      toast.error("Distribution percentages must add up to 100%");
      return;
    }

    try {
      setIsSubmitting(true);
      toast.loading("Initiating tokenization...", { id: "tokenize" });

      // Simulate tokenization process
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast.success("Property tokenization initiated successfully!", {
        id: "tokenize",
      });

      // Reset form
      setSelectedPropertyId("");
      setMintAmount("");
      setTokenPrice("");
    } catch {
      toast.error("Failed to tokenize property", { id: "tokenize" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/properties">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h2 className="text-3xl font-bold text-foreground">
            Token Minting Dashboard
          </h2>
          <p className="text-muted-foreground mt-1">
            Mint tokens for registered properties and manage token distribution
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Minting Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Property Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Select Property
              </CardTitle>
              <CardDescription>
                Choose a registered property to tokenize
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Loading properties...</span>
                </div>
              ) : properties.length === 0 ? (
                <div className="text-center py-8">
                  <Building className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">
                    No properties available for tokenization.
                  </p>
                  <Button asChild>
                    <Link href="/admin/properties/add">Add Property First</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>Property</Label>
                  <Select
                    value={selectedPropertyId}
                    onValueChange={setSelectedPropertyId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a registered property..." />
                    </SelectTrigger>
                    <SelectContent>
                      {properties.map((property) => (
                        <SelectItem key={property.id} value={property.id}>
                          {property.name} - ${property.value?.toLocaleString()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Token Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Coins className="h-5 w-5" />
                Token Configuration
              </CardTitle>
              <CardDescription>
                Configure the token supply and pricing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Total Token Supply</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 1000"
                    value={mintAmount}
                    onChange={(e) => setMintAmount(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Token Price (USD)</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 2500"
                    value={tokenPrice}
                    onChange={(e) => setTokenPrice(e.target.value)}
                  />
                </div>
              </div>

              {mintAmount && tokenPrice && (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Total Token Value:{" "}
                    <span className="font-semibold text-foreground">
                      $
                      {(
                        parseInt(mintAmount) * parseFloat(tokenPrice)
                      ).toLocaleString()}
                    </span>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Distribution Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Token Distribution
              </CardTitle>
              <CardDescription>
                Configure how tokens will be distributed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Platform Reserve (%)</Label>
                  <Input
                    type="number"
                    value={platformReserve}
                    onChange={(e) => setPlatformReserve(e.target.value)}
                    min="0"
                    max="100"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Liquidity Pool (%)</Label>
                  <Input
                    type="number"
                    value={liquidityPool}
                    onChange={(e) => setLiquidityPool(e.target.value)}
                    min="0"
                    max="100"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Public Sale (%)</Label>
                  <Input
                    type="number"
                    value={publicSale}
                    onChange={(e) => setPublicSale(e.target.value)}
                    min="0"
                    max="100"
                  />
                </div>
              </div>

              {parseInt(platformReserve) +
                parseInt(liquidityPool) +
                parseInt(publicSale) !==
                100 && (
                <p className="text-sm text-red-500">
                  Distribution percentages must add up to 100% (Currently:{" "}
                  {parseInt(platformReserve || "0") +
                    parseInt(liquidityPool || "0") +
                    parseInt(publicSale || "0")}
                  %)
                </p>
              )}

              <div className="flex justify-end pt-4">
                <Button
                  className="gap-2"
                  onClick={handleMintTokens}
                  disabled={isSubmitting || !selectedPropertyId || loading}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <TrendingUp className="h-4 w-4" />
                  )}
                  Mint Tokens
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Selected Property Preview */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Selected Property</CardTitle>
              <CardDescription>Property details preview</CardDescription>
            </CardHeader>
            <CardContent>
              {selectedProperty ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-semibold">{selectedProperty.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Type</p>
                    <p className="font-semibold">
                      {selectedProperty.type?.replace("_", " ")}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-semibold">{selectedProperty.location}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Value</p>
                    <p className="font-semibold text-lg">
                      ${selectedProperty.value?.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Existing Shares
                    </p>
                    <p className="font-semibold">
                      {selectedProperty.shares?.toLocaleString()}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">
                    Select a property to see details
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Token Summary */}
          {selectedProperty && mintAmount && tokenPrice && (
            <Card>
              <CardHeader>
                <CardTitle>Token Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Supply</span>
                  <span className="font-semibold">
                    {parseInt(mintAmount).toLocaleString()} tokens
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Price per Token</span>
                  <span className="font-semibold">${tokenPrice}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Value</span>
                  <span className="font-semibold">
                    $
                    {(
                      parseInt(mintAmount) * parseFloat(tokenPrice)
                    ).toLocaleString()}
                  </span>
                </div>
                <hr />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Platform Reserve</span>
                  <span>
                    {Math.floor(
                      (parseInt(mintAmount) * parseInt(platformReserve)) / 100
                    ).toLocaleString()}{" "}
                    tokens
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Liquidity Pool</span>
                  <span>
                    {Math.floor(
                      (parseInt(mintAmount) * parseInt(liquidityPool)) / 100
                    ).toLocaleString()}{" "}
                    tokens
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Public Sale</span>
                  <span>
                    {Math.floor(
                      (parseInt(mintAmount) * parseInt(publicSale)) / 100
                    ).toLocaleString()}{" "}
                    tokens
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
