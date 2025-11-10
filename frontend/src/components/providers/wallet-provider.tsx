"use client";

import React, { createContext, useContext, useEffect, useCallback, useMemo, useRef } from 'react';
import { MidnightAuthProvider, useMidnightAuth, useMidnightWallet } from '@uppzen/midnight-auth';
import {
  WalletState,
  WalletProvider as WalletProviderType,
  WalletConfig,
  WalletConnectionResult,
  WALLET_ERRORS,
  MidnightWalletState,
} from '@/lib/wallet-types';

// Wallet configurations
const walletConfigs: Record<WalletProviderType, WalletConfig> = {
  metamask: {
    provider: 'metamask',
    name: 'MetaMask',
    icon: '🦊',
    description: 'Connect to your MetaMask wallet',
    supportedChains: ['ethereum', 'polygon', 'bsc'],
  },
  walletconnect: {
    provider: 'walletconnect',
    name: 'WalletConnect',
    icon: '🔗',
    description: 'Connect with WalletConnect protocol',
    supportedChains: ['ethereum', 'polygon', 'bsc', 'solana'],
  },
  lace: {
    provider: 'lace',
    name: 'Lace Wallet',
    icon: '💎',
    description: 'Modern Cardano wallet with Midnight support',
    supportedChains: ['cardano'],
  },
  midnight: {
    provider: 'midnight',
    name: 'Midnight Lace Wallet',
    icon: '🌙',
    description: 'Privacy-first wallet for Midnight Network',
    supportedChains: ['midnight'],
  },
};

interface WalletContextType {
  state: WalletState;
  availableWallets: WalletConfig[];
  connectWallet: (provider: WalletProviderType) => Promise<WalletConnectionResult>;
  disconnectWallet: () => Promise<void>;
  switchNetwork: (chainId: string | number) => Promise<boolean>;
  refreshBalance: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export { WalletContext };

// Internal component that uses the @uppzen/midnight-auth hooks
function WalletProviderInner({ children }: { children: React.ReactNode }) {
  const { isConnected, isConnecting, walletState, error, connect, disconnect } = useMidnightAuth();
  const { address, balance, provider, refreshBalance: walletRefreshBalance } = useMidnightWallet();

  const availableWallets = Object.values(walletConfigs);

  // Track if we've already refreshed balance for this connection
  const hasRefreshedBalance = useRef(false);

  // Compute state from @uppzen/midnight-auth hooks
  const computedState = useMemo(() => {
    // Note: Balance is not available via midnight-auth API
    // Users must check balance directly in Lace wallet extension
    const finalBalance = balance; // This will be null according to midnight-auth docs

    return {
      isConnected,
      address: address || null,
      provider: (isConnected ? 'lace' : null) as WalletProviderType | null,
      chainId: undefined,
      balance: finalBalance || undefined, // Balance not available via API
      isConnecting,
      error: error || null,
      // Extended wallet state for Midnight
      walletState: walletState as MidnightWalletState || undefined,
      providerName: provider || undefined,
      walletName: 'Lace Wallet',
      apiVersion: undefined,
      capabilities: undefined,
    };
  }, [isConnected, isConnecting, address, balance, walletState, provider, error]);

  // Auto-refresh balance when connected
  useEffect(() => {
    if (isConnected && walletRefreshBalance && !hasRefreshedBalance.current) {
      hasRefreshedBalance.current = true;
      walletRefreshBalance().then(() => {
        // Balance refresh completed
      }).catch((error) => {
        console.error('WalletProvider: Balance refresh failed:', error);
        hasRefreshedBalance.current = false; // Reset on failure
      });
    } else if (!isConnected) {
      // Reset when disconnected
      hasRefreshedBalance.current = false;
    }
  }, [isConnected, walletRefreshBalance]);

  // Connect wallet function
  const connectWallet = useCallback(async (providerType: WalletProviderType): Promise<WalletConnectionResult> => {
    if (providerType !== 'lace' && providerType !== 'midnight') {
      return { success: false, error: WALLET_ERRORS.UNKNOWN_ERROR };
    }

    try {
      await connect();
      // Wait a brief moment for hooks to update
      await new Promise(resolve => setTimeout(resolve, 100));

      return {
        success: true,
        address: address || '',
        provider: 'lace',
        walletState: walletState as MidnightWalletState || undefined,
      };
    } catch (error) {
      console.error('WalletProvider: Connect failed:', error);
      return { success: false, error: WALLET_ERRORS.CONNECTION_FAILED };
    }
  }, [connect, address, walletState]);

  // Disconnect wallet function
  const disconnectWallet = useCallback(async () => {
    await disconnect();
  }, [disconnect]);

  // Switch network (not supported by @uppzen/midnight-auth)
  const switchNetwork = useCallback(async (): Promise<boolean> => {
    return false; // Not supported
  }, []);

  // Refresh balance function
  const refreshBalanceCallback = useCallback(async () => {
    if (walletRefreshBalance) {
      try {
        const refreshedBalance = await walletRefreshBalance();
        console.log('WalletProvider: Manual balance refresh result:', refreshedBalance);
      } catch (error) {
        console.error('WalletProvider: Manual balance refresh failed:', error);
      }
    }
  }, [walletRefreshBalance]);

  const contextValue: WalletContextType = {
    state: computedState,
    availableWallets,
    connectWallet,
    disconnectWallet,
    switchNetwork,
    refreshBalance: refreshBalanceCallback,
  };

  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  );
}

// Main provider component that wraps @uppzen/midnight-auth
export function WalletProvider({ children }: { children: React.ReactNode }) {
  return (
    <MidnightAuthProvider
      sessionTimeout={24 * 60 * 60 * 1000} // 24 hours
      autoConnect={true} // Enable auto-connect to persist wallet connection across page navigations
      onConnect={() => {
        // Connected
      }}
      onError={(error) => {
        console.error('WalletProvider: Midnight auth error:', error);
      }}
      onDisconnect={() => {
        // Disconnected
      }}
    >
      <WalletProviderInner>
        {children}
      </WalletProviderInner>
    </MidnightAuthProvider>
  );
}

export function useWallet(): WalletContextType {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}

// Convenience hooks
export function useWalletState() {
  const { state } = useWallet();
  return state;
}

export function useWalletConnection() {
  const { connectWallet, disconnectWallet, state } = useWallet();
  return {
    connectWallet,
    disconnectWallet,
    isConnected: state.isConnected,
    isConnecting: state.isConnecting,
    error: state.error,
  };
}