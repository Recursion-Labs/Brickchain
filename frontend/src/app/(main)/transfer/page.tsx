"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Send,
  Eye,
  EyeOff,
  History,
  Zap,
  Lock,
  Shield,
  CheckCircle,
  AlertCircle,
  ArrowRight
} from 'lucide-react';

interface UserToken {
  id: string;
  propertyTitle: string;
  amount: number;
  value: number;
  tokenPrice: number;
  purchased: string;
}

interface Transaction {
  id: string;
  type: 'sent' | 'received';
  amount: number;
  recipient?: string;
  sender?: string;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
  proofHash?: string;
  tokenId?: string;
  tokenTitle?: string;
}

// Initialize transaction history from localStorage
function getInitialTransactions(): Transaction[] {
  if (typeof window === 'undefined') return [];
  const saved = localStorage.getItem('tokenTransactions');
  return saved ? JSON.parse(saved) : [];
}

// Helper function to generate a pseudo-random hash
function generateProofHash(): string {
  const chars = '0123456789abcdef';
  let result = '0x';
  for (let i = 0; i < 16; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

// Helper function to generate unique transaction ID
function generateTransactionId(): string {
  return `tx_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export default function TokenTransferPage() {
  const [activeTab, setActiveTab] = useState('transfer');
  const [showProof, setShowProof] = useState(false);
  const [selectedToken, setSelectedToken] = useState<string>('');
  const [transferAmount, setTransferAmount] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [isGeneratingProof, setIsGeneratingProof] = useState(false);
  const [proofGenerated, setProofGenerated] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>(getInitialTransactions());

  // Persist transactions to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('tokenTransactions', JSON.stringify(transactions));
  }, [transactions]);

  // Mock user token portfolio
  const [tokens] = useState<UserToken[]>([
    {
      id: 'token_001',
      propertyTitle: 'Downtown Office Complex',
      amount: 250,
      value: 625000,
      tokenPrice: 2500,
      purchased: '2024-01-15'
    },
    {
      id: 'token_002',
      propertyTitle: 'Residential Tower',
      amount: 100,
      value: 200000,
      tokenPrice: 2000,
      purchased: '2024-02-20'
    }
  ]);

  const totalTokenValue = tokens.reduce((sum, token) => sum + token.value, 0);
  const totalTokens = tokens.reduce((sum, token) => sum + token.amount, 0);

  const selectedTokenData = tokens.find(t => t.id === selectedToken);
  const maxTransferAmount = selectedTokenData?.amount || 0;

  const handleGenerateProof = async () => {
    setIsGeneratingProof(true);
    // Simulate ZKP generation (in real implementation, this would use Midnight SDK)
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsGeneratingProof(false);
    setProofGenerated(true);
  };

  const handleTransfer = () => {
    if (!selectedTokenData || !recipientAddress || !transferAmount) {
      alert('Please fill in all fields');
      return;
    }

    if (!proofGenerated) {
      alert('Please generate the zero-knowledge proof first');
      return;
    }

    // Create transaction record with timestamp and hash
    const timestamp = new Date().toISOString();
    const proofHash = generateProofHash();
    const txId = generateTransactionId();

    const newTransaction: Transaction = {
      id: txId,
      type: 'sent',
      amount: parseInt(transferAmount),
      recipient: recipientAddress,
      timestamp: timestamp,
      status: 'completed',
      proofHash: proofHash,
      tokenId: selectedToken,
      tokenTitle: selectedTokenData.propertyTitle
    };

    // Add to transactions and persist
    setTransactions([newTransaction, ...transactions]);

    // Reset form
    setSelectedToken('');
    setTransferAmount('');
    setRecipientAddress('');
    setProofGenerated(false);
    
    // Show success message
    alert('Transfer initiated successfully! Your tokens are now being transferred privately. Transaction recorded in history.');
    
    // Switch to history tab to show new transaction
    setActiveTab('history');
  };

  return (
    <div className="w-full p-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-foreground">Private Token Transfer</h2>
        <p className="text-muted-foreground">
          Transfer your property tokens securely with zero-knowledge proofs - no amount disclosure required
        </p>
      </div>

      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tokens</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTokens.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Across all properties</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Portfolio Value</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalTokenValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Current portfolio worth</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Privacy Level</CardTitle>
            <Lock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">ZK-Proof</div>
            <p className="text-xs text-muted-foreground">Maximum privacy</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="transfer" className="gap-2">
            <Send className="h-4 w-4" />
            Transfer Tokens
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="h-4 w-4" />
            Transaction History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="transfer" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Transfer Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Initiate Private Transfer</CardTitle>
                  <CardDescription>
                    Transfer tokens with zero-knowledge proof - recipient and amount remain private
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Step 1: Select Token */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Step 1: Select Token</label>
                      <Badge>Required</Badge>
                    </div>
                    <div className="space-y-2">
                      {tokens.map((token) => (
                        <div
                          key={token.id}
                          onClick={() => setSelectedToken(token.id)}
                          className={`p-4 border-2 rounded-lg cursor-pointer transition ${
                            selectedToken === token.id
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/50'
                              : 'border-gray-200 dark:border-gray-800 hover:border-blue-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">{token.propertyTitle}</h4>
                              <p className="text-sm text-muted-foreground">
                                {token.amount.toLocaleString()} tokens @ ${token.tokenPrice.toLocaleString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">${token.value.toLocaleString()}</div>
                              <div className="text-sm text-muted-foreground">Portfolio value</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {selectedToken && (
                    <>
                      {/* Step 2: Enter Amount */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">Step 2: Enter Amount</label>
                          <span className="text-xs text-muted-foreground">
                            Available: {maxTransferAmount.toLocaleString()} tokens
                          </span>
                        </div>
                        <input
                          type="number"
                          value={transferAmount}
                          onChange={(e) => setTransferAmount(e.target.value)}
                          placeholder="Number of tokens to transfer"
                          max={maxTransferAmount}
                          className="w-full p-3 border rounded-lg"
                        />
                        {transferAmount && (
                          <div className="p-3 bg-blue-50 dark:bg-blue-950/50 rounded-lg text-sm">
                            <div className="flex justify-between">
                              <span>Transfer Value:</span>
                              <span className="font-medium">
                                ${(parseInt(transferAmount) * (selectedTokenData?.tokenPrice || 0)).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Step 3: Recipient Address */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">Step 3: Recipient Address</label>
                          <Badge>Encrypted</Badge>
                        </div>
                        <input
                          type="text"
                          value={recipientAddress}
                          onChange={(e) => setRecipientAddress(e.target.value)}
                          placeholder="Enter recipient wallet address (0x...)"
                          className="w-full p-3 border rounded-lg font-mono text-sm"
                        />
                      </div>

                      {/* Step 4: Zero-Knowledge Proof */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">Step 4: Generate ZK-Proof</label>
                          {proofGenerated && <Badge variant="default" className="gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Generated
                          </Badge>}
                        </div>
                        
                        <div className="p-4 border rounded-lg space-y-3 bg-muted/50">
                          <div className="flex items-start gap-3">
                            <Shield className="h-5 w-5 text-green-600 mt-0.5" />
                            <div className="flex-1">
                              <h4 className="font-medium text-sm">Private Ownership Proof</h4>
                              <p className="text-xs text-muted-foreground mt-1">
                                Generate a cryptographic proof that you own the tokens without revealing your identity, amount, or recipient.
                              </p>
                            </div>
                          </div>

                          <Button
                            onClick={handleGenerateProof}
                            disabled={isGeneratingProof || !transferAmount}
                            className="w-full gap-2"
                            variant={proofGenerated ? 'outline' : 'default'}
                          >
                            {isGeneratingProof ? (
                              <>
                                <Zap className="h-4 w-4 animate-spin" />
                                Generating Proof...
                              </>
                            ) : proofGenerated ? (
                              <>
                                <CheckCircle className="h-4 w-4" />
                                Proof Generated
                              </>
                            ) : (
                              <>
                                <Lock className="h-4 w-4" />
                                Generate ZK-Proof
                              </>
                            )}
                          </Button>

                          {proofGenerated && (
                            <div className="space-y-2">
                              <button
                                type="button"
                                onClick={() => setShowProof(!showProof)}
                                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                              >
                                {showProof ? (
                                  <>
                                    <EyeOff className="h-4 w-4" />
                                    Hide Proof
                                  </>
                                ) : (
                                  <>
                                    <Eye className="h-4 w-4" />
                                    Show Proof
                                  </>
                                )}
                              </button>

                              {showProof && (
                                <div className="p-3 bg-black/5 dark:bg-white/5 rounded font-mono text-xs break-all">
                                  0x7f8e9d2c1b3a4f5e6d7c8b9a0f1e2d3c4b5a6f7e8d9c0b1a2f3e4d5c6b7a8
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Transfer Button */}
                      <Button
                        onClick={handleTransfer}
                        disabled={!proofGenerated || !recipientAddress || !transferAmount}
                        size="lg"
                        className="w-full gap-2"
                      >
                        <ArrowRight className="h-4 w-4" />
                        Execute Private Transfer
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Info Panel */}
            <div className="space-y-4">
              <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/50">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Privacy Benefits
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-green-900 dark:text-green-100 space-y-2">
                  <div>✓ Amount hidden from observers</div>
                  <div>✓ Recipient encrypted</div>
                  <div>✓ Ownership proved without disclosure</div>
                  <div>✓ Blockchain verifiable</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">How It Works</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-4">
                  <div className="space-y-2">
                    <div className="font-medium">1. Select & Amount</div>
                    <p className="text-muted-foreground">Choose tokens and transfer amount</p>
                  </div>
                  <div className="space-y-2">
                    <div className="font-medium">2. ZK-Proof</div>
                    <p className="text-muted-foreground">Generate ownership proof locally</p>
                  </div>
                  <div className="space-y-2">
                    <div className="font-medium">3. Transfer</div>
                    <p className="text-muted-foreground">Submit encrypted transaction</p>
                  </div>
                  <div className="space-y-2">
                    <div className="font-medium">4. Confirm</div>
                    <p className="text-muted-foreground">Verify on blockchain</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/50">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                    Important
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-amber-900 dark:text-amber-100">
                  Double-check recipient address. Transfers cannot be reversed.
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>
                Your recent token transfers and receptions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <div className="text-center py-12">
                  <History className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Transactions Yet</h3>
                  <p className="text-muted-foreground">
                    Your transaction history will appear here once you start transferring tokens.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition">
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`p-2 rounded-full ${tx.type === 'sent' ? 'bg-red-100 dark:bg-red-950' : 'bg-green-100 dark:bg-green-950'}`}>
                          {tx.type === 'sent' ? (
                            <ArrowRight className={`h-5 w-5 ${tx.type === 'sent' ? 'text-red-600' : 'text-green-600'}`} />
                          ) : (
                            <ArrowRight className="h-5 w-5 text-green-600 transform rotate-180" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">
                            {tx.type === 'sent' ? 'Sent to' : 'Received from'}{' '}
                            {tx.type === 'sent' ? tx.recipient : tx.sender}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-sm text-muted-foreground">
                              {tx.tokenTitle || 'Token Transfer'}
                            </p>
                            <span className="text-xs text-muted-foreground">•</span>
                            <p className="text-sm text-muted-foreground">
                              {new Date(tx.timestamp).toLocaleDateString()} {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="text-right ml-4">
                        <div className={`font-medium ${tx.type === 'sent' ? 'text-red-600' : 'text-green-600'}`}>
                          {tx.type === 'sent' ? '-' : '+'}{tx.amount.toLocaleString()} tokens
                        </div>
                        <Badge
                          variant={
                            tx.status === 'completed'
                              ? 'default'
                              : tx.status === 'pending'
                              ? 'secondary'
                              : 'destructive'
                          }
                          className="text-xs mt-1"
                        >
                          {tx.status}
                        </Badge>
                      </div>
                    </div>
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
            <Lock className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 dark:text-blue-100">End-to-End Encryption</h4>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                All transfers are protected with zero-knowledge cryptography powered by Midnight Protocol.
                Your ownership is verified without revealing transaction details.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}