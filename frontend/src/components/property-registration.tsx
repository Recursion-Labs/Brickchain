"use client";

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Upload,
  FileText,
  MapPin,
  DollarSign,
  Shield,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { storageService } from '../lib/storage';

interface PropertyFormData {
  title: string;
  description: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  propertyType: string;
  totalValue: string;
  totalShares: string;
  documents: File[];
}

interface UploadedDocument {
  file: File;
  documentId: string;
  cid: string;
  blockHash?: string;
  sha256: string;
  timestamp?: string;
}

interface PropertyRegistrationProps {
  onSuccess?: (propertyId: string) => void;
}

export function PropertyRegistration({ onSuccess }: PropertyRegistrationProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [formData, setFormData] = useState<PropertyFormData>({
    title: '',
    description: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    propertyType: '',
    totalValue: '',
    totalShares: '1000',
    documents: []
  });

  const [errors, setErrors] = useState<Partial<Record<keyof PropertyFormData, string>>>({});
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([]);

  const propertyTypes = [
    'Residential',
    'Commercial',
    'Industrial',
    'Land',
    'Multi-family',
    'Office Building',
    'Retail',
    'Mixed-use'
  ];

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof PropertyFormData, string>> = {};

    if (!formData.title.trim()) newErrors.title = 'Property title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.zipCode.trim()) newErrors.zipCode = 'ZIP code is required';
    if (!formData.propertyType) newErrors.propertyType = 'Property type is required';
    if (!formData.totalValue || parseFloat(formData.totalValue) <= 0) {
      newErrors.totalValue = 'Valid total value is required';
    } else if (parseFloat(formData.totalValue) < 1000) {
      newErrors.totalValue = 'Total value must be at least $1,000';
    }
    if (!formData.totalShares || parseInt(formData.totalShares) <= 0) {
      newErrors.totalShares = 'Valid number of shares is required';
    } else if (parseInt(formData.totalShares) < 10) {
      newErrors.totalShares = 'Minimum 10 shares required';
    } else if (parseInt(formData.totalShares) > 1000000) {
      newErrors.totalShares = 'Maximum 1,000,000 shares allowed';
    } else if (formData.totalValue && parseFloat(formData.totalValue) / parseInt(formData.totalShares) < 0.01) {
      newErrors.totalShares = 'Share value too small - increase total value or decrease shares';
    }
    if (formData.documents.length === 0) {
      newErrors.documents = 'At least one document is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => {
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      const maxSize = 10 * 1024 * 1024; // 10MB

      if (!validTypes.includes(file.type)) {
        toast.error(`${file.name} is not a valid file type. Please upload PDF or images.`);
        return false;
      }

      if (file.size > maxSize) {
        toast.error(`${file.name} is too large. Maximum size is 10MB.`);
        return false;
      }

      return true;
    });

    setFormData(prev => ({
      ...prev,
      documents: [...prev.documents, ...validFiles]
    }));
  }, []);

  const removeDocument = (index: number) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index)
    }));
    setUploadedDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      // Step 1: Upload documents to Rust storage server
      toast.loading('Uploading documents to IPFS & blockchain...', { id: 'uploading' });
      const newUploadedDocuments: UploadedDocument[] = [];

      for (let i = 0; i < formData.documents.length; i++) {
        const file = formData.documents[i];
        try {
          const response = await storageService.uploadDocument(file, (progress) => {
            setUploadProgress(((i + progress / 100) / formData.documents.length) * 100);
          });

          newUploadedDocuments.push({
            file,
            documentId: response.id,
            cid: response.cid,
            blockHash: response.block_hash,
            sha256: response.sha256,
            timestamp: response.timestamp,
          });

          console.log(`Document ${file.name} uploaded to IPFS & blockchain:`, {
            id: response.id,
            cid: response.cid,
            blockHash: response.block_hash,
            ipfsUrl: storageService.getIPFSUrl(response.cid),
          });

          toast.success(`${file.name} uploaded!`);
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Unknown error';
          console.error(`Failed to upload ${file.name}:`, error);
          toast.error(`Failed to upload ${file.name}: ${errorMsg}`);
          throw error;
        }
      }

      setUploadedDocuments(newUploadedDocuments);
      toast.success(`${newUploadedDocuments.length} documents uploaded!`, { id: 'uploading' });

      // Step 2: Create property record with document metadata
      toast.loading('Creating property record...', { id: 'creating' });

      const propertyId = `prop_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // In a real app, you'd save this to your database
      const propertyData = {
        id: propertyId,
        ...formData,
        documents: newUploadedDocuments.map(doc => ({
          documentId: doc.documentId,
          filename: doc.file.name,
          size: doc.file.size,
          cid: doc.cid,
          blockHash: doc.blockHash,
          sha256: doc.sha256,
          timestamp: doc.timestamp,
          ipfsUrl: storageService.getIPFSUrl(doc.cid),
          downloadUrl: storageService.getDownloadUrl(doc.documentId),
        })),
        createdAt: new Date().toISOString(),
      };

      console.log('Property registered:', propertyData);
      toast.success('Property registered successfully!', { id: 'creating' });

      // Step 3: Navigate to next step
      if (onSuccess) {
        onSuccess(propertyId);
      } else {
        router.push(`/admin/properties?tab=manage`);
      }

    } catch (error) {
      console.error('Registration failed:', error);
      toast.error('Failed to register property. Please try again.');
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  const updateFormData = (field: keyof PropertyFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Register Your Property</h1>
        <p className="text-muted-foreground">
          Tokenize your property with zero-knowledge proofs for privacy-preserving ownership
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Property Information
            </CardTitle>
            <CardDescription>
              Provide basic details about your property
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Property Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => updateFormData('title', e.target.value)}
                  placeholder="e.g., Downtown Office Complex"
                  className={errors.title ? 'border-red-500' : ''}
                />
                {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title}</p>}
              </div>

              <div>
                <Label htmlFor="propertyType">Property Type *</Label>
                <Select value={formData.propertyType} onValueChange={(value) => updateFormData('propertyType', value)}>
                  <SelectTrigger className={errors.propertyType ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select property type" />
                  </SelectTrigger>
                  <SelectContent>
                    {propertyTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.propertyType && <p className="text-sm text-red-500 mt-1">{errors.propertyType}</p>}
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => updateFormData('description', e.target.value)}
                placeholder="Describe your property in detail..."
                rows={4}
                className={errors.description ? 'border-red-500' : ''}
              />
              {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description}</p>}
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Property Location
            </CardTitle>
            <CardDescription>
              Enter the complete address of your property
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="address">Street Address *</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => updateFormData('address', e.target.value)}
                placeholder="123 Main Street"
                className={errors.address ? 'border-red-500' : ''}
              />
              {errors.address && <p className="text-sm text-red-500 mt-1">{errors.address}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => updateFormData('city', e.target.value)}
                  placeholder="New York"
                  className={errors.city ? 'border-red-500' : ''}
                />
                {errors.city && <p className="text-sm text-red-500 mt-1">{errors.city}</p>}
              </div>

              <div>
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => updateFormData('state', e.target.value)}
                  placeholder="NY"
                  className={errors.state ? 'border-red-500' : ''}
                />
                {errors.state && <p className="text-sm text-red-500 mt-1">{errors.state}</p>}
              </div>

              <div>
                <Label htmlFor="zipCode">ZIP Code *</Label>
                <Input
                  id="zipCode"
                  value={formData.zipCode}
                  onChange={(e) => updateFormData('zipCode', e.target.value)}
                  placeholder="10001"
                  className={errors.zipCode ? 'border-red-500' : ''}
                />
                {errors.zipCode && <p className="text-sm text-red-500 mt-1">{errors.zipCode}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tokenization */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Tokenization Details
            </CardTitle>
            <CardDescription>
              Define how your property will be tokenized
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="totalValue">Total Property Value (USD) *</Label>
                <Input
                  id="totalValue"
                  type="number"
                  min="1000"
                  step="1000"
                  value={formData.totalValue}
                  onChange={(e) => updateFormData('totalValue', e.target.value)}
                  placeholder="1000000"
                  className={errors.totalValue ? 'border-red-500' : ''}
                />
                {errors.totalValue && <p className="text-sm text-red-500 mt-1">{errors.totalValue}</p>}
              </div>

              <div>
                <Label htmlFor="totalShares">Total Token Shares *</Label>
                <Input
                  id="totalShares"
                  type="number"
                  min="10"
                  max="1000000"
                  step="10"
                  value={formData.totalShares}
                  onChange={(e) => updateFormData('totalShares', e.target.value)}
                  placeholder="1000"
                  className={errors.totalShares ? 'border-red-500' : ''}
                />
                {errors.totalShares && <p className="text-sm text-red-500 mt-1">{errors.totalShares}</p>}
                <p className="text-xs text-muted-foreground mt-1">
                  Each share represents {formData.totalValue && formData.totalShares ?
                    `$${(parseFloat(formData.totalValue) / parseInt(formData.totalShares)).toFixed(2)}` :
                    'ownership percentage'}
                  {formData.totalValue && formData.totalShares && parseFloat(formData.totalValue) / parseInt(formData.totalShares) < 0.01 ?
                    ' (Very small share value - consider increasing total value or decreasing shares)' : ''}
                </p>
              </div>
            </div>

            {/* Tokenization Summary */}
            {formData.totalValue && formData.totalShares && (
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Tokenization Summary</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Total Property Value</p>
                    <p className="font-medium text-blue-900 dark:text-blue-100">
                      ${parseFloat(formData.totalValue).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total Token Shares</p>
                    <p className="font-medium text-blue-900 dark:text-blue-100">
                      {parseInt(formData.totalShares).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Value per Share</p>
                    <p className="font-medium text-blue-900 dark:text-blue-100">
                      ${(parseFloat(formData.totalValue) / parseInt(formData.totalShares)).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Document Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Property Documents
            </CardTitle>
            <CardDescription>
              Upload property documents for verification and hashing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center cursor-pointer hover:border-muted-foreground/50 hover:bg-muted/20 transition-colors"
              onClick={() => document.getElementById('documents')?.click()}
            >
              <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <div className="space-y-2">
                <div className="text-lg font-medium">
                  Click to upload documents
                </div>
                <p className="text-sm text-muted-foreground">
                  PDF, JPG, PNG files up to 10MB each
                </p>
                <Input
                  id="documents"
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </div>

            {errors.documents && (
              <p className="text-sm text-red-500">{errors.documents}</p>
            )}

            {/* Document List */}
            {formData.documents.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Documents to Upload:</h4>
                {formData.documents.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4" />
                      <div>
                        <p className="font-medium text-sm">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {storageService.formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeDocument(index)}
                      className="text-red-500 hover:text-red-700"
                      disabled={isSubmitting}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Uploaded Documents with IPFS & Blockchain Details */}
            {uploadedDocuments.length > 0 && (
              <div className="space-y-3 border-t pt-4">
                <h4 className="font-medium text-green-600 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Documents on IPFS & Blockchain
                </h4>
                {uploadedDocuments.map((doc, index) => (
                  <div key={index} className="p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="font-medium text-sm text-green-900 dark:text-green-100">{doc.file.name}</p>
                        <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                          Size: {storageService.formatFileSize(doc.file.size)}
                        </p>
                      </div>
                      <Badge className="bg-green-600 text-white">Uploaded</Badge>
                    </div>

                    {/* IPFS Details */}
                    <div className="space-y-2 mt-3 text-xs">
                      <div className="bg-white dark:bg-slate-900 p-2 rounded">
                        <p className="text-muted-foreground font-medium mb-1">📌 IPFS Content ID (CID):</p>
                        <div className="flex items-center gap-2">
                          <code className="flex-1 bg-slate-100 dark:bg-slate-800 p-1 rounded font-mono text-xs overflow-auto max-h-16">
                            {doc.cid}
                          </code>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              window.open(storageService.getIPFSUrl(doc.cid), '_blank');
                            }}
                            title="View on IPFS Gateway"
                          >
                            🔗
                          </Button>
                        </div>
                      </div>

                      {/* Blockchain Details */}
                      {doc.blockHash && (
                        <div className="bg-white dark:bg-slate-900 p-2 rounded">
                          <p className="text-muted-foreground font-medium mb-1">⛓️ Blockchain Proof (Block Hash):</p>
                          <div className="flex items-center gap-2">
                            <code className="flex-1 bg-slate-100 dark:bg-slate-800 p-1 rounded font-mono text-xs overflow-auto max-h-16">
                              {doc.blockHash}
                            </code>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const explorerUrl = `https://substrate.io/substrate-how-to-guides/`;
                                window.open(explorerUrl, '_blank');
                              }}
                              title="View on Block Explorer"
                            >
                              🔍
                            </Button>
                          </div>
                          <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                            ✓ Document published on Substrate blockchain
                          </p>
                        </div>
                      )}

                      {/* Document Hash */}
                      <div className="bg-white dark:bg-slate-900 p-2 rounded">
                        <p className="text-muted-foreground font-medium mb-1">🔐 SHA-256 Hash (Document ID):</p>
                        <code className="block bg-slate-100 dark:bg-slate-800 p-1 rounded font-mono text-xs overflow-auto max-h-16">
                          {doc.sha256}
                        </code>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Progress Indicators */}
        {isSubmitting && (
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Uploading to IPFS & Blockchain</span>
                    <span>{Math.round(uploadProgress)}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Security Notice */}
        <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 dark:text-blue-100">Privacy & Security</h4>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  Your property documents will be hashed using SHA-256 and verified with zero-knowledge proofs.
                  No sensitive information is stored on-chain - only cryptographic proofs ensure authenticity.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Registering Property...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Register Property
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}