"use client";

import React from 'react';
import { useWalletConnection, useWalletState, WalletContext } from './providers/wallet-provider';
import { MidnightWalletState } from '@/lib/wallet-types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle, Loader2, Wallet, ChevronDown, Copy, User, Settings, LogOut } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { WalletProfileDialog } from './wallet-profile-dialog';

const WALLET_NAMES = {
  metamask: 'MetaMask',
  walletconnect: 'WalletConnect',
  lace: 'Lace',
  midnight: 'Midnight',
} as const;

const WALLET_ICONS = {
  metamask: '🦊',
  walletconnect: '🔗',
  lace: '💎',
  midnight: '🌙',
} as const;

// Comprehensive wallet info component (inspired by create-midnight-dapp)
function WalletInfo({ walletState, providerName, walletName, apiVersion, balance, capabilities, onDisconnect }: {
  walletState?: MidnightWalletState;
  providerName?: string;
  walletName?: string;
  apiVersion?: string;
  balance?: string;
  capabilities?: { walletTransfer?: boolean; coinEnum?: boolean };
  onDisconnect?: () => void;
}) {
  const formatAddress = (addr?: string) => {
    if (!addr) return "—";
    return `${addr.slice(0, 8)}...${addr.slice(-6)}`;
  };

  return (
    <div className="space-y-4">
      {/* Wallet Summary */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Wallet Connected
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="font-medium text-muted-foreground">Provider:</span>
              <div className="font-mono">{providerName || "—"}</div>
            </div>
            <div>
              <span className="font-medium text-muted-foreground">Wallet:</span>
              <div className="font-mono">{walletName || "—"}</div>
            </div>
            <div>
              <span className="font-medium text-muted-foreground">API Version:</span>
              <div className="font-mono">{apiVersion || "—"}</div>
            </div>
            <div>
              <span className="font-medium text-muted-foreground">Balance:</span>
              <div className="font-mono">{balance ? `${balance} tDUST` : "—"}</div>
            </div>
          </div>

          <div>
            <span className="font-medium text-muted-foreground">Capabilities:</span>
            <div className="flex gap-2 mt-1">
              <Badge variant={capabilities?.walletTransfer ? "default" : "secondary"}>
                Transfer
              </Badge>
              <Badge variant={capabilities?.coinEnum ? "default" : "secondary"}>
                Coin Enum
              </Badge>
            </div>
          </div>

          {onDisconnect && (
            <Button
              onClick={onDisconnect}
              variant="outline"
              className="w-full"
            >
              Disconnect Wallet
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Detailed Keys & Addresses */}
      {walletState && (
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Keys & Addresses</CardTitle>
            <CardDescription>
              Shield (privacy-preserving) and Legacy (compatible) keys
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Shield Address & Keys</h4>
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
                  <h4 className="font-medium text-sm">Legacy Address & Keys</h4>
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
    </div>
  );
}

// Internal component that requires wallet provider
function WalletConnectContent() {
  const { connectWallet, disconnectWallet, isConnected, isConnecting, error } = useWalletConnection();
  const { address, provider, balance, walletState, providerName, walletName, apiVersion, capabilities } = useWalletState();

  const handleConnect = async (walletType: 'metamask' | 'walletconnect' | 'lace' | 'midnight') => {
    await connectWallet(walletType);
  };

  const handleDisconnect = async () => {
    await disconnectWallet();
  };

  if (isConnected && address && provider) {
    return (
      <WalletInfo
        walletState={walletState}
        providerName={providerName}
        walletName={walletName}
        apiVersion={apiVersion}
        balance={balance}
        capabilities={capabilities}
        onDisconnect={handleDisconnect}
      />
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Connect Wallet
        </CardTitle>
        <CardDescription>
          Choose a wallet to connect to BrickChain
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
            <AlertCircle className="h-4 w-4" />
            <span>
              {typeof error === 'string' ? error : 'Failed to connect wallet'}
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 gap-2">
          <Button
            onClick={() => handleConnect('metamask')}
            disabled={isConnecting}
            variant="outline"
            className="justify-start"
          >
            {isConnecting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <span className="mr-2">{WALLET_ICONS.metamask}</span>
            )}
            {WALLET_NAMES.metamask}
          </Button>

          <Button
            onClick={() => handleConnect('walletconnect')}
            disabled={isConnecting}
            variant="outline"
            className="justify-start"
          >
            {isConnecting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <span className="mr-2">{WALLET_ICONS.walletconnect}</span>
            )}
            {WALLET_NAMES.walletconnect}
          </Button>

          <Button
            onClick={() => handleConnect('lace')}
            disabled={isConnecting}
            variant="outline"
            className="justify-start"
          >
            {isConnecting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <span className="mr-2">{WALLET_ICONS.lace}</span>
            )}
            {WALLET_NAMES.lace}
          </Button>

          <Button
            onClick={() => handleConnect('midnight')}
            disabled={isConnecting}
            variant="outline"
            className="justify-start"
          >
            {isConnecting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <span className="mr-2">{WALLET_ICONS.midnight}</span>
            )}
            {WALLET_NAMES.midnight}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Compact version for headers
function WalletConnectCompact() {
  const { connectWallet, disconnectWallet, isConnected, isConnecting } = useWalletConnection();
  const { address, provider } = useWalletState();
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);

  const handleConnect = async () => {
    console.log('WalletConnectCompact: Connect button clicked');
    console.log('WalletConnectCompact: isConnecting:', isConnecting);
    console.log('WalletConnectCompact: isConnected:', isConnected);

    if (isConnecting) {
      console.log('WalletConnectCompact: Already connecting, skipping');
      return;
    }

    try {
      console.log('WalletConnectCompact: Attempting to connect to Lace wallet');
      const result = await connectWallet('lace');
      console.log('WalletConnectCompact: Connection result:', result);

      if (!result.success) {
        console.error('WalletConnectCompact: Connection failed:', result.error);
      }
    } catch (error) {
      console.error('WalletConnectCompact: Unexpected error during connection:', error);
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const copyAddress = async () => {
    if (!address) return;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(address);
        console.log('Address copied to clipboard');
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = address;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
          document.execCommand('copy');
          console.log('Address copied to clipboard');
        } finally {
          document.body.removeChild(textArea);
        }
      }
    } catch (error) {
      console.error('Failed to copy address:', error);
    }
  };

  const handleViewProfile = () => {
    setIsProfileOpen(true);
  };

  const handleSettings = () => {
    setIsSettingsOpen(true);
  };

  const handleDisconnect = async () => {
    await disconnectWallet();
  };

  if (isConnected && address && provider) {
    return (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-9 gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="hidden md:inline">{formatAddress(address)}</span>
              <span className="md:hidden">Connected</span>
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={copyAddress} className="gap-2">
              <Copy className="h-4 w-4" />
              Copy Address
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleViewProfile} className="gap-2">
              <User className="h-4 w-4" />
              View Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleSettings} className="gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleDisconnect} className="gap-2 text-red-600">
              <LogOut className="h-4 w-4" />
              Disconnect
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <WalletProfileDialog open={isProfileOpen} onOpenChange={setIsProfileOpen} />

        {/* Simple Settings Dialog */}
        <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Wallet Settings
              </DialogTitle>
              <DialogDescription>
                Configure your wallet preferences and security settings.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Auto-lock after inactivity</Label>
                <select className="w-full px-3 py-2 border border-input bg-background rounded-md">
                  <option>5 minutes</option>
                  <option>15 minutes</option>
                  <option>30 minutes</option>
                  <option>1 hour</option>
                  <option>Never</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Transaction notifications</Label>
                <select className="w-full px-3 py-2 border border-input bg-background rounded-md">
                  <option>All transactions</option>
                  <option>Only sent</option>
                  <option>Only received</option>
                  <option>None</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="privacy-mode" className="rounded" />
                <Label htmlFor="privacy-mode">Enable privacy mode</Label>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setIsSettingsOpen(false)}>Save Settings</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <Button
      onClick={handleConnect}
      disabled={isConnecting}
      variant="outline"
      size="sm"
      className="h-9"
    >
      {isConnecting ? (
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
      ) : (
        <Wallet className="h-4 w-4 mr-2" />
      )}
      <span className="hidden md:inline">Connect Wallet</span>
      <span className="md:hidden">Connect</span>
    </Button>
  );
}

// Main component that safely checks for wallet provider
export function WalletConnect({ compact = false }: { compact?: boolean }) {
  const context = React.useContext(WalletContext);

  // If no wallet context, show disabled button
  if (!context) {
    return (
      <Button variant="outline" size="sm" disabled className="h-9">
        <Wallet className="h-4 w-4 mr-2" />
        {compact ? "Connect" : "Connect Wallet"}
      </Button>
    );
  }

  // If we have context, render the appropriate component
  return compact ? <WalletConnectCompact /> : <WalletConnectContent />;
}