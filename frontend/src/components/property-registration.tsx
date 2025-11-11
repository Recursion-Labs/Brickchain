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

interface PropertyRegistrationProps {
  onSuccess?: (propertyId: string) => void;
}

export function PropertyRegistration({ onSuccess }: PropertyRegistrationProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [hashProgress, setHashProgress] = useState(0);

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
    const newErrors: Partial<PropertyFormData> = {};

    if (!formData.title.trim()) newErrors.title = 'Property title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.zipCode.trim()) newErrors.zipCode = 'ZIP code is required';
    if (!formData.propertyType) newErrors.propertyType = 'Property type is required';
    if (!formData.totalValue || parseFloat(formData.totalValue) <= 0) {
      newErrors.totalValue = 'Valid total value is required';
    }
    if (!formData.totalShares || parseInt(formData.totalShares) <= 0) {
      newErrors.totalShares = 'Valid number of shares is required';
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
  };

  const hashDocument = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        resolve(hashHex);
      };
      reader.readAsArrayBuffer(file);
    });
  };

  const generateZKPProof = async (documentHash: string, propertyData: any): Promise<string> => {
    // Simulate ZKP proof generation
    // In real implementation, this would use Midnight's ZKP libraries
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock ZKP proof - in reality this would be a complex cryptographic proof
    const proof = `zkp_${documentHash}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return proof;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(0);
    setHashProgress(0);

    try {
      // Step 1: Hash documents
      toast.loading('Hashing documents...', { id: 'hashing' });
      const documentHashes: string[] = [];

      for (let i = 0; i < formData.documents.length; i++) {
        const hash = await hashDocument(formData.documents[i]);
        documentHashes.push(hash);
        setHashProgress(((i + 1) / formData.documents.length) * 100);
      }

      toast.success('Documents hashed successfully!', { id: 'hashing' });

      // Step 2: Generate ZKP proof
      toast.loading('Generating zero-knowledge proof...', { id: 'zkp' });
      const masterHash = documentHashes.join('_');
      const zkpProof = await generateZKPProof(masterHash, formData);
      toast.success('ZKP proof generated!', { id: 'zkp' });

      // Step 3: Register property on blockchain
      toast.loading('Registering property on blockchain...', { id: 'register' });

      const propertyData = {
        ...formData,
        documentHashes,
        masterHash,
        zkpProof,
        timestamp: Date.now(),
        status: 'pending_verification'
      };

      // Mock API call - replace with actual blockchain interaction
      await new Promise(resolve => setTimeout(resolve, 3000));

      const propertyId = `prop_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      toast.success('Property registered successfully!', { id: 'register' });

      // Step 4: Navigate to tokenization page
      toast.success(`Property ${propertyId} registered! Proceeding to tokenization...`);

      if (onSuccess) {
        onSuccess(propertyId);
      } else {
        router.push(`/properties/${propertyId}/tokenize`);
      }

    } catch (error) {
      console.error('Registration failed:', error);
      toast.error('Failed to register property. Please try again.');
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
      setHashProgress(0);
    }
  };

  const updateFormData = (field: keyof PropertyFormData, value: any) => {
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
                </p>
              </div>
            </div>
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
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
              <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <div className="space-y-2">
                <Label htmlFor="documents" className="text-lg font-medium cursor-pointer">
                  Click to upload documents
                </Label>
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
                <h4 className="font-medium">Uploaded Documents:</h4>
                {formData.documents.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4" />
                      <div>
                        <p className="font-medium text-sm">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeDocument(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </Button>
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
                    <span>Document Processing</span>
                    <span>{Math.round(hashProgress)}%</span>
                  </div>
                  <Progress value={hashProgress} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Blockchain Registration</span>
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