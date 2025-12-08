// Wallet utilities for Midnight blockchain

import { WalletBuilder } from "@midnight-ntwrk/wallet";
import { type Wallet } from "@midnight-ntwrk/wallet-api";
import { nativeToken } from "@midnight-ntwrk/ledger";
import { getZswapNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import * as Rx from "rxjs";
import { TESTNET_CONFIG } from "../config/network.js";

export async function buildWallet(seed: string): Promise<Wallet> {
  const wallet = await WalletBuilder.buildFromSeed(
    TESTNET_CONFIG.indexer,
    TESTNET_CONFIG.indexerWS,
    TESTNET_CONFIG.proofServer,
    TESTNET_CONFIG.node,
    seed,
    getZswapNetworkId(),
    "info"
  );

  return wallet;
}

export function generateWalletSeed(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function waitForFunds(wallet: Wallet): Promise<bigint> {
  return Rx.firstValueFrom(
    wallet.state().pipe(
      Rx.tap((state) => {
        if (state.syncProgress) {
          console.log(
            `Sync progress: synced=${state.syncProgress.synced}, sourceGap=${state.syncProgress.lag.sourceGap}, applyGap=${state.syncProgress.lag.applyGap}`
          );
        }
      }),
      Rx.filter((state) => state.syncProgress?.synced === true),
      Rx.map((s) => s.balances[nativeToken()] ?? 0n),
      Rx.filter((balance) => balance > 0n),
      Rx.tap((balance) => console.log(`Wallet funded with balance: ${balance}`))
    )
  );
}

export async function getWalletBalance(wallet: Wallet): Promise<bigint> {
  const state = await Rx.firstValueFrom(wallet.state());
  return state.balances[nativeToken()] ?? 0n;
}

export async function getWalletAddress(wallet: Wallet): Promise<string> {
  const state = await Rx.firstValueFrom(wallet.state());
  return state.address;
}
