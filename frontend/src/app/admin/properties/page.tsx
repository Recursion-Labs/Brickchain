"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { toast } from 'react-hot-toast';
import {
  Building,
  Plus,
  List,
  TrendingUp,
  DollarSign,
  Users,
  FileText,
  Shield,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { PropertyRegistration } from '@/components/property-registration';

interface Property {
  id: string;
  title: string;
  status: 'draft' | 'registered' | 'tokenized' | 'listed';
  totalValue: number;
  totalTokens: number;
  tokensMinted: number;
  createdAt: string;
  hash?: string;
}

export default function AdminPropertiesPage() {
  const [activeTab, setActiveTab] = useState('register');
  const [isMinting, setIsMinting] = useState(false);
  const [mintingProgress, setMintingProgress] = useState(0);

  // Token minting form state
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  const [tokenSupply, setTokenSupply] = useState('');
  const [tokenPrice, setTokenPrice] = useState('');
  const [platformReserve, setPlatformReserve] = useState('10');
  const [liquidityPool, setLiquidityPool] = useState('20');
  const [publicSale, setPublicSale] = useState('70');

  const [properties, setProperties] = useState<Property[]>([
    // Mock data - replace with real data from API
    {
      id: 'prop_001',
      title: 'Downtown Office Complex',
      status: 'registered',
      totalValue: 2500000,
      totalTokens: 1000,
      tokensMinted: 0,
      createdAt: '2024-01-15',
      hash: 'a1b2c3d4...'
    },
    {
      id: 'prop_002',
      title: 'Residential Apartment Building',
      status: 'registered',
      totalValue: 1800000,
      totalTokens: 800,
      tokensMinted: 0,
      createdAt: '2024-01-20',
      hash: 'b2c3d4e5...'
    },
    {
      id: 'prop_003',
      title: 'Retail Shopping Center',
      status: 'registered',
      totalValue: 3200000,
      totalTokens: 1600,
      tokensMinted: 0,
      createdAt: '2024-02-01',
      hash: 'c3d4e5f6...'
    },
    {
      id: 'prop_004',
      title: 'Industrial Warehouse',
      status: 'tokenized',
      totalValue: 1200000,
      totalTokens: 600,
      tokensMinted: 600,
      createdAt: '2024-02-10',
      hash: 'd4e5f6g7...'
    }
  ]);

  const handlePropertyRegistered = (propertyId: string) => {
    // Add the new property to the list (in a real app, this would come from the API)
    const newProperty: Property = {
      id: propertyId,
      title: 'New Property', // This would come from the registration form
      status: 'registered',
      totalValue: 1000000, // This would come from the registration form
      totalTokens: 1000, // This would come from the registration form
      tokensMinted: 0,
      createdAt: new Date().toISOString().split('T')[0],
      hash: propertyId.substring(0, 8) + '...'
    };

    setProperties(prev => [...prev, newProperty]);
    toast.success('Property registered successfully! Ready for tokenization.');
    setActiveTab('tokenize');
  };

  const validateMintingForm = () => {
    if (!selectedPropertyId) {
      toast.error('Please select a property to tokenize');
      return false;
    }

    if (!tokenSupply || parseInt(tokenSupply) <= 0) {
      toast.error('Please enter a valid token supply');
      return false;
    }

    if (!tokenPrice || parseFloat(tokenPrice) <= 0) {
      toast.error('Please enter a valid token price');
      return false;
    }

    const totalDistribution = parseInt(platformReserve) + parseInt(liquidityPool) + parseInt(publicSale);
    if (totalDistribution !== 100) {
      toast.error('Token distribution percentages must add up to 100%');
      return false;
    }

    return true;
  };

  const handleMintTokens = async () => {
    if (!validateMintingForm()) return;

    setIsMinting(true);
    setMintingProgress(0);

    try {
      const selectedProperty = properties.find(p => p.id === selectedPropertyId);
      if (!selectedProperty) {
        throw new Error('Property not found');
      }

      toast.loading('Initializing token minting...', { id: 'minting' });

      // Simulate minting progress
      setMintingProgress(25);
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast.loading('Deploying smart contract...', { id: 'minting' });
      setMintingProgress(50);
      await new Promise(resolve => setTimeout(resolve, 1500));

      toast.loading('Minting tokens...', { id: 'minting' });
      setMintingProgress(75);
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update property status
      setProperties(prev => prev.map(prop =>
        prop.id === selectedPropertyId
          ? { ...prop, status: 'tokenized' as const, tokensMinted: parseInt(tokenSupply) }
          : prop
      ));

      setMintingProgress(100);
      toast.success('Tokens minted successfully!', { id: 'minting' });

      // Reset form
      setSelectedPropertyId('');
      setTokenSupply('');
      setTokenPrice('');
      setPlatformReserve('10');
      setLiquidityPool('20');
      setPublicSale('70');

    } catch (error) {
      console.error('Minting failed:', error);
      toast.error('Failed to mint tokens. Please try again.', { id: 'minting' });
    } finally {
      setIsMinting(false);
      setMintingProgress(0);
    }
  };

  // Auto-fill token supply and price when property is selected
  const handlePropertySelect = (propertyId: string) => {
    setSelectedPropertyId(propertyId);
    const selectedProperty = properties.find(p => p.id === propertyId);
    if (selectedProperty) {
      setTokenSupply(selectedProperty.totalTokens.toString());
      setTokenPrice((selectedProperty.totalValue / selectedProperty.totalTokens).toFixed(2));
    }
  };

  const getStatusColor = (status: Property['status']) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'registered': return 'bg-blue-100 text-blue-800';
      case 'tokenized': return 'bg-green-100 text-green-800';
      case 'listed': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalPropertiesValue = properties.reduce((sum, prop) => sum + prop.totalValue, 0);
  const totalTokensMinted = properties.reduce((sum, prop) => sum + prop.tokensMinted, 0);

  return (
    <div className="w-full p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Property Management</h2>
          <p className="text-muted-foreground mt-2">
            Register properties, mint tokens, and manage the BrickChain ecosystem
          </p>
        </div>
        <Button
          onClick={() => setActiveTab('register')}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Register Property
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{properties.length}</div>
            <p className="text-xs text-muted-foreground">Registered properties</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalPropertiesValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Property portfolio value</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tokens Minted</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTokensMinted.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total tokens in circulation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {properties.filter(p => p.status === 'listed').length}
            </div>
            <p className="text-xs text-muted-foreground">Properties available for trading</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="register" className="gap-2">
            <Plus className="h-4 w-4" />
            Register Property
          </TabsTrigger>
          <TabsTrigger value="tokenize" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Tokenize Assets
          </TabsTrigger>
          <TabsTrigger value="manage" className="gap-2">
            <List className="h-4 w-4" />
            Manage Properties
          </TabsTrigger>
        </TabsList>

        <TabsContent value="register" className="mt-6">
          <PropertyRegistration onSuccess={handlePropertyRegistered} />
        </TabsContent>

        <TabsContent value="tokenize" className="mt-6">
          <div className="space-y-6">
            {/* Token Minting Interface */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Token Minting Dashboard
                </CardTitle>
                <CardDescription>
                  Mint tokens for registered properties and manage token distribution
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Property Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="property-select">Select Property</Label>
                    <Select value={selectedPropertyId} onValueChange={handlePropertySelect}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a registered property..." />
                      </SelectTrigger>
                      <SelectContent>
                        {properties
                          .filter(p => p.status === 'registered')
                          .map(property => (
                            <SelectItem key={property.id} value={property.id}>
                              {property.title} - ${property.totalValue.toLocaleString()}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Token Configuration */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="token-supply">Total Token Supply</Label>
                      <Input
                        id="token-supply"
                        type="number"
                        placeholder="1000"
                        value={tokenSupply}
                        onChange={(e) => setTokenSupply(e.target.value)}
                        min="1"
                        disabled={isMinting}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="token-price">Token Price (USD)</Label>
                      <Input
                        id="token-price"
                        type="number"
                        placeholder="2500"
                        value={tokenPrice}
                        onChange={(e) => setTokenPrice(e.target.value)}
                        min="0.01"
                        step="0.01"
                        disabled={isMinting}
                      />
                    </div>
                  </div>

                  {/* Distribution Settings */}
                  <div className="space-y-4">
                    <h4 className="font-medium">Token Distribution (%)</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="platform-reserve">Platform Reserve</Label>
                        <Input
                          id="platform-reserve"
                          type="number"
                          placeholder="10"
                          value={platformReserve}
                          onChange={(e) => setPlatformReserve(e.target.value)}
                          min="0"
                          max="100"
                          disabled={isMinting}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="liquidity-pool">Liquidity Pool</Label>
                        <Input
                          id="liquidity-pool"
                          type="number"
                          placeholder="20"
                          value={liquidityPool}
                          onChange={(e) => setLiquidityPool(e.target.value)}
                          min="0"
                          max="100"
                          disabled={isMinting}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="public-sale">Public Sale</Label>
                        <Input
                          id="public-sale"
                          type="number"
                          placeholder="70"
                          value={publicSale}
                          onChange={(e) => setPublicSale(e.target.value)}
                          min="0"
                          max="100"
                          disabled={isMinting}
                        />
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Total: {parseInt(platformReserve || '0') + parseInt(liquidityPool || '0') + parseInt(publicSale || '0')}% 
                      {parseInt(platformReserve || '0') + parseInt(liquidityPool || '0') + parseInt(publicSale || '0') !== 100 && (
                        <span className="text-red-500 ml-2">(Must equal 100%)</span>
                      )}
                    </div>
                  </div>

                  {/* Minting Progress */}
                  {isMinting && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Minting tokens...</span>
                        <span>{mintingProgress}%</span>
                      </div>
                      <Progress value={mintingProgress} className="h-2" />
                    </div>
                  )}

                  {/* Mint Button */}
                  <div className="flex justify-end">
                    <Button
                      onClick={handleMintTokens}
                      disabled={isMinting || !selectedPropertyId}
                      className="gap-2"
                    >
                      {isMinting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Minting Tokens...
                        </>
                      ) : (
                        <>
                          <TrendingUp className="h-4 w-4" />
                          Mint Tokens
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tokenized Properties List */}
            <Card>
              <CardHeader>
                <CardTitle>Tokenized Properties</CardTitle>
                <CardDescription>
                  Properties that have been successfully tokenized
                </CardDescription>
              </CardHeader>
              <CardContent>
                {properties.filter(p => p.status === 'tokenized').length === 0 ? (
                  <div className="text-center py-8">
                    <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No tokenized properties yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {properties
                      .filter(p => p.status === 'tokenized')
                      .map(property => (
                        <div key={property.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <h4 className="font-medium">{property.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {property.tokensMinted.toLocaleString()} tokens minted
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">${property.totalValue.toLocaleString()}</div>
                            <div className="text-sm text-muted-foreground">
                              ${(property.totalValue / property.totalTokens).toFixed(2)} per token
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="manage" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <List className="h-5 w-5" />
                Property Portfolio
              </CardTitle>
              <CardDescription>
                Manage your registered properties and their tokenization status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {properties.length === 0 ? (
                <div className="text-center py-12">
                  <Building className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Properties Yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Register your first property to start building your tokenized real estate portfolio.
                  </p>
                  <Button onClick={() => setActiveTab('register')}>
                    <Plus className="mr-2 h-4 w-4" />
                    Register Property
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {properties.map((property) => (
                    <Card key={property.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-lg font-semibold">{property.title}</h4>
                            <Badge className={getStatusColor(property.status)}>
                              {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Total Value:</span>
                              <div className="font-semibold">${property.totalValue.toLocaleString()}</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Total Tokens:</span>
                              <div className="font-semibold">{property.totalTokens.toLocaleString()}</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Tokens Minted:</span>
                              <div className="font-semibold">{property.tokensMinted.toLocaleString()}</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Created:</span>
                              <div className="font-semibold">{new Date(property.createdAt).toLocaleDateString()}</div>
                            </div>
                          </div>

                          {property.hash && (
                            <div className="mt-3 p-2 bg-muted rounded text-xs font-mono">
                              <span className="text-muted-foreground">Hash: </span>
                              {property.hash}
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2 ml-4">
                          <Button variant="outline" size="sm">
                            <FileText className="h-4 w-4 mr-1" />
                            View Details
                          </Button>
                          {property.status === 'registered' && (
                            <Button
                              size="sm"
                              onClick={() => {
                                handlePropertySelect(property.id);
                                setActiveTab('tokenize');
                              }}
                            >
                              <TrendingUp className="h-4 w-4 mr-1" />
                              Mint Tokens
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Security Notice */}
      <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 dark:text-blue-100">Privacy & Security</h4>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                All property data is secured with SHA-256 hashing and zero-knowledge proofs.
                Property ownership and transactions remain private while maintaining verifiability.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}