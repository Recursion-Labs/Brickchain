"use client";

import React, { useState } from 'react';
import { useWalletState, useWalletConnection, useWallet } from './providers/wallet-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Copy,
  Send,
  Building,
  History,
  Wallet,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Coins,
  Home,
  TrendingUp,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { MidnightSessionTimer } from '@uppzen/midnight-auth';

// Mock data for BrickChain properties (replace with real API calls)
const mockProperties = [
  {
    id: 'prop-001',
    name: 'Downtown Office Complex',
    location: 'New York, NY',
    totalValue: 2500000,
    userShares: 25,
    totalShares: 100,
    tokenSymbol: 'DOC',
    image: '/api/placeholder/400/200',
  },
  {
    id: 'prop-002',
    name: 'Residential Tower',
    location: 'San Francisco, CA',
    totalValue: 1800000,
    userShares: 15,
    totalShares: 80,
    tokenSymbol: 'RT',
    image: '/api/placeholder/400/200',
  },
];

// Mock transaction history
const mockTransactions = [
  {
    id: 'tx-001',
    type: 'purchase',
    amount: '500',
    token: 'tDUST',
    timestamp: new Date(Date.now() - 86400000),
    status: 'confirmed',
    description: 'Property token purchase',
  },
  {
    id: 'tx-002',
    type: 'transfer',
    amount: '100',
    token: 'DOC',
    timestamp: new Date(Date.now() - 172800000),
    status: 'confirmed',
    description: 'Token transfer to investor',
  },
  {
    id: 'tx-003',
    type: 'receive',
    amount: '250',
    token: 'tDUST',
    timestamp: new Date(Date.now() - 259200000),
    status: 'confirmed',
    description: 'Dividend payment',
  },
];

interface WalletProfileDialogProps {
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function WalletProfileDialog({ children, open, onOpenChange }: WalletProfileDialogProps) {
  const { address, provider, balance, walletState, providerName, walletName, apiVersion } = useWalletState();
  const { disconnectWallet } = useWalletConnection();
  const { refreshBalance } = useWallet();
  const [sendAmount, setSendAmount] = useState('');
  const [sendAddress, setSendAddress] = useState('');
  const [sendToken, setSendToken] = useState('tDUST');
  const [isSending, setIsSending] = useState(false);

  const formatAddress = (addr?: string) => {
    if (!addr) return "—";
    return `${addr.slice(0, 8)}...${addr.slice(-6)}`;
  };

  const copyAddress = async () => {
    if (!address) return;

    try {
      // Try modern clipboard API first
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(address);
        toast.success('Address copied to clipboard!');
      } else {
        // Fallback for older browsers or non-secure contexts
        const textArea = document.createElement('textarea');
        textArea.value = address;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
          const successful = document.execCommand('copy');
          if (successful) {
            toast.success('Address copied to clipboard!');
          } else {
            throw new Error('Copy failed');
          }
        } finally {
          document.body.removeChild(textArea);
        }
      }
    } catch {
      toast.error('Failed to copy address');
    }
  };

  const handleSend = async () => {
    if (!sendAmount || !sendAddress) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsSending(true);
    try {
      // Mock send functionality - replace with real implementation
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success(`Successfully sent ${sendAmount} ${sendToken} to ${formatAddress(sendAddress)}`);

      // Reset form
      setSendAmount('');
      setSendAddress('');
    } catch {
      toast.error('Failed to send transaction');
    } finally {
      setIsSending(false);
    }
  };

  const totalPropertyValue = mockProperties.reduce((sum, prop) => {
    const userValue = (prop.totalValue * prop.userShares) / prop.totalShares;
    return sum + userValue;
  }, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children && !open && !onOpenChange && (
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
      )}
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Wallet Profile
          </DialogTitle>
          <DialogDescription>
            Manage your BrickChain wallet, view properties, and send transactions
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="send">Send</TabsTrigger>
            <TabsTrigger value="properties">Properties</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Wallet Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Wallet Overview</span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyAddress}
                      className="gap-2"
                    >
                      <Copy className="h-4 w-4" />
                      Copy Address
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={disconnectWallet}
                    >
                      Disconnect
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Address</Label>
                    <div className="font-mono text-sm break-all">{address || "—"}</div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Provider</Label>
                    <div className="font-mono text-sm">{providerName || provider || "—"}</div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Wallet</Label>
                    <div className="font-mono text-sm">{walletName || "—"}</div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">API Version</Label>
                    <div className="font-mono text-sm">{apiVersion || "—"}</div>
                  </div>
                </div>

                <Separator />

                {/* Balance Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Coins className="h-4 w-4" />
                      Balances
                    </h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={refreshBalance}
                      className="gap-2"
                      title="Balance refresh may not work due to API limitations"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Refresh Balance
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold">
                            {balance ? `${balance} tDUST` : "Check Wallet Extension"}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {balance ? "Available Balance" : "Balance not available via API"}
                          </div>
                        </div>
                        <Coins className="h-8 w-8 text-yellow-500" />
                      </div>
                      {!balance && (
                        <div className="mt-2 text-xs text-yellow-600">
                          Open Lace wallet extension to view balance
                        </div>
                      )}
                    </Card>
                    <Card className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold">${totalPropertyValue.toLocaleString()}</div>
                          <div className="text-sm text-muted-foreground">Property Value</div>
                        </div>
                        <Home className="h-8 w-8 text-blue-500" />
                      </div>
                    </Card>
                  </div>
                </div>

                {/* Session Timer */}
                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Session Status
                  </h3>
                  <MidnightSessionTimer
                    variant="compact"
                    showRefreshButton={true}
                    autoRefreshThreshold={5 * 60 * 1000} // Auto-refresh when 5 min remaining
                  />
                </div>
              </CardContent>
            </Card>

            {/* Keys & Addresses (Shield/Legacy) */}
            {walletState && (
              <Card>
                <CardHeader>
                  <CardTitle>Keys & Addresses</CardTitle>
                  <CardDescription>
                    Shield (privacy-preserving) and Legacy (compatible) keys
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid gap-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm">Shield Address & Keys</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (walletState.address) {
                              navigator.clipboard?.writeText(walletState.address).then(() => {
                                toast.success('Shield address copied!');
                              });
                            }
                          }}
                          className="h-6 px-2"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Address:</span>
                          <code className="font-mono bg-muted px-1 py-0.5 rounded text-xs">
                            {formatAddress(walletState.address)}
                          </code>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Coin Public Key:</span>
                          <code className="font-mono bg-muted px-1 py-0.5 rounded text-xs">
                            {formatAddress(walletState.coinPublicKey)}
                          </code>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Encryption Public Key:</span>
                          <code className="font-mono bg-muted px-1 py-0.5 rounded text-xs">
                            {formatAddress(walletState.encryptionPublicKey)}
                          </code>
                        </div>
                      </div>
                    </div>

                    {(walletState.addressLegacy || walletState.coinPublicKeyLegacy || walletState.encryptionPublicKeyLegacy) && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-sm">Legacy Address & Keys</h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (walletState.addressLegacy) {
                                navigator.clipboard?.writeText(walletState.addressLegacy).then(() => {
                                  toast.success('Legacy address copied!');
                                });
                              }
                            }}
                            className="h-6 px-2"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="space-y-1 text-xs">
                          {walletState.addressLegacy && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Address:</span>
                              <code className="font-mono bg-muted px-1 py-0.5 rounded text-xs">
                                {formatAddress(walletState.addressLegacy)}
                              </code>
                            </div>
                          )}
                          {walletState.coinPublicKeyLegacy && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Coin Public Key:</span>
                              <code className="font-mono bg-muted px-1 py-0.5 rounded text-xs">
                                {formatAddress(walletState.coinPublicKeyLegacy)}
                              </code>
                            </div>
                          )}
                          {walletState.encryptionPublicKeyLegacy && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Encryption Public Key:</span>
                              <code className="font-mono bg-muted px-1 py-0.5 rounded text-xs">
                                {formatAddress(walletState.encryptionPublicKeyLegacy)}
                              </code>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="send" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5" />
                  Send Tokens
                </CardTitle>
                <CardDescription>
                  Transfer tDUST tokens or property tokens to another address
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="send-token">Token Type</Label>
                    <select
                      id="send-token"
                      value={sendToken}
                      onChange={(e) => setSendToken(e.target.value)}
                      className="w-full mt-1 px-3 py-2 border border-input bg-background rounded-md"
                    >
                      <option value="tDUST">tDUST (Native Token)</option>
                      {mockProperties.map(prop => (
                        <option key={prop.tokenSymbol} value={prop.tokenSymbol}>
                          {prop.tokenSymbol} ({prop.name})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="send-amount">Amount</Label>
                    <Input
                      id="send-amount"
                      type="number"
                      placeholder="Enter amount to send"
                      value={sendAmount}
                      onChange={(e) => setSendAmount(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="send-address">Recipient Address</Label>
                    <Input
                      id="send-address"
                      placeholder="Enter recipient address"
                      value={sendAddress}
                      onChange={(e) => setSendAddress(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={handleSend}
                    disabled={isSending || !sendAmount || !sendAddress}
                    className="flex-1"
                  >
                    {isSending ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Send Transaction
                      </>
                    )}
                  </Button>
                </div>

                <div className="text-sm text-muted-foreground">
                  <AlertCircle className="inline h-4 w-4 mr-1" />
                  Transactions on BrickChain are private and shielded for your security.
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="properties" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  My Properties
                </CardTitle>
                <CardDescription>
                  View your fractional property ownership and token holdings
                </CardDescription>
              </CardHeader>
              <CardContent>
                {mockProperties.length === 0 ? (
                  <div className="text-center py-8">
                    <Building className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-semibold mb-2">No Properties Yet</h3>
                    <p className="text-muted-foreground mb-4">
                      You haven&apos;t invested in any properties yet. Browse available properties to get started.
                    </p>
                    <Button>
                      <TrendingUp className="mr-2 h-4 w-4" />
                      Browse Properties
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {mockProperties.map((property) => (
                      <Card key={property.id} className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                            <Building className="h-8 w-8 text-muted-foreground" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-semibold">{property.name}</h4>
                                <p className="text-sm text-muted-foreground">{property.location}</p>
                              </div>
                              <Badge variant="outline">{property.tokenSymbol}</Badge>
                            </div>

                            <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
                              <div>
                                <div className="text-muted-foreground">Your Shares</div>
                                <div className="font-semibold">{property.userShares} / {property.totalShares}</div>
                              </div>
                              <div>
                                <div className="text-muted-foreground">Ownership</div>
                                <div className="font-semibold">
                                  {((property.userShares / property.totalShares) * 100).toFixed(1)}%
                                </div>
                              </div>
                              <div>
                                <div className="text-muted-foreground">Value</div>
                                <div className="font-semibold">
                                  ${((property.totalValue * property.userShares) / property.totalShares).toLocaleString()}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}

                    <Separator />

                    <div className="flex items-center justify-between pt-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Total Property Value</div>
                        <div className="text-2xl font-bold">${totalPropertyValue.toLocaleString()}</div>
                      </div>
                      <Button variant="outline">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View All Properties
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Transaction History
                </CardTitle>
                <CardDescription>
                  View your recent transactions and activity
                </CardDescription>
              </CardHeader>
              <CardContent>
                {mockTransactions.length === 0 ? (
                  <div className="text-center py-8">
                    <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-semibold mb-2">No Transactions Yet</h3>
                    <p className="text-muted-foreground">
                      Your transaction history will appear here once you start using BrickChain.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {mockTransactions.map((tx) => (
                      <div key={tx.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${
                            tx.type === 'purchase' ? 'bg-green-100 text-green-600' :
                            tx.type === 'transfer' ? 'bg-blue-100 text-blue-600' :
                            'bg-purple-100 text-purple-600'
                          }`}>
                            {tx.type === 'purchase' && <TrendingUp className="h-4 w-4" />}
                            {tx.type === 'transfer' && <Send className="h-4 w-4" />}
                            {tx.type === 'receive' && <Coins className="h-4 w-4" />}
                          </div>
                          <div>
                            <div className="font-medium capitalize">{tx.type}</div>
                            <div className="text-sm text-muted-foreground">{tx.description}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">
                            {tx.type === 'receive' ? '+' : '-'}{tx.amount} {tx.token}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {tx.timestamp.toLocaleDateString()}
                          </div>
                        </div>
                        <Badge variant={tx.status === 'confirmed' ? 'default' : 'secondary'}>
                          {tx.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}