// Window type extensions for wallet providers
declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      isWalletConnect?: boolean;
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on: (event: string, handler: (...args: unknown[]) => void) => void;
      removeListener: (event: string, handler: (...args: unknown[]) => void) => void;
      selectedAddress?: string;
      chainId?: string;
    };
    cardano?: {
      lace?: {
        enable: () => Promise<unknown>;
        getUsedAddresses: () => Promise<string[]>;
        getChangeAddress: () => Promise<string>;
        getBalance: () => Promise<string>;
        signTx: (tx: unknown) => Promise<string>;
        submitTx: (tx: string) => Promise<string>;
      };
      midnight?: Record<string, unknown>;
    };
    midnight?: Record<string, unknown>;
  }
}

export {};