// Provider utilities for contract deployment and interaction

import { type Wallet } from "@midnight-ntwrk/wallet-api";
import { httpClientProofProvider } from "@midnight-ntwrk/midnight-js-http-client-proof-provider";
import { indexerPublicDataProvider } from "@midnight-ntwrk/midnight-js-indexer-public-data-provider";
import { NodeZkConfigProvider } from "@midnight-ntwrk/midnight-js-node-zk-config-provider";
import { levelPrivateStateProvider } from "@midnight-ntwrk/midnight-js-level-private-state-provider";
import {
  getZswapNetworkId,
  getLedgerNetworkId,
} from "@midnight-ntwrk/midnight-js-network-id";
import { createBalancedTx } from "@midnight-ntwrk/midnight-js-types";
import { Transaction } from "@midnight-ntwrk/ledger";
import { Transaction as ZswapTransaction } from "@midnight-ntwrk/zswap";
import * as Rx from "rxjs";
import { TESTNET_CONFIG } from "../config/network.js";
import * as path from "path";

export async function createWalletProvider(wallet: Wallet) {
  // Get wallet state once to cache keys
  const state = await Rx.firstValueFrom(wallet.state());

  return {
    coinPublicKey: state.coinPublicKey,
    encryptionPublicKey: state.encryptionPublicKey,
    async balanceTx(tx: any, newCoins: any) {
      return wallet
        .balanceTransaction(
          ZswapTransaction.deserialize(
            tx.serialize(getLedgerNetworkId()),
            getZswapNetworkId()
          ),
          newCoins
        )
        .then((tx) => wallet.proveTransaction(tx))
        .then((zswapTx) =>
          Transaction.deserialize(
            zswapTx.serialize(getZswapNetworkId()),
            getLedgerNetworkId()
          )
        )
        .then(createBalancedTx);
    },
    async submitTx(tx: any) {
      return wallet.submitTransaction(tx);
    },
  };
}

export async function createContractProviders(
  wallet: Wallet,
  zkConfigPath: string,
  privateStateStoreName: string
) {
  const walletProvider = await createWalletProvider(wallet);

  return {
    privateStateProvider: levelPrivateStateProvider({
      privateStateStoreName,
    }),
    publicDataProvider: indexerPublicDataProvider(
      TESTNET_CONFIG.indexer,
      TESTNET_CONFIG.indexerWS
    ),
    zkConfigProvider: new NodeZkConfigProvider(zkConfigPath),
    proofProvider: httpClientProofProvider(TESTNET_CONFIG.proofServer),
    walletProvider,
    midnightProvider: walletProvider,
  };
}

export async function loadContractModule(contractPath: string) {
  const contractModulePath = path.join(
    process.cwd(),
    contractPath,
    "contract",
    "index.cjs"
  );

  const module = await import(contractModulePath);
  return module;
}
