#!/usr/bin/env node
// Complete deployment script for all BrickChain contracts

import { WalletBuilder } from "@midnight-ntwrk/wallet";
import { setNetworkId, NetworkId, getZswapNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { nativeToken } from "@midnight-ntwrk/ledger";
import { WebSocket } from "ws";
import * as fs from "fs";
import * as path from "path";
import * as readline from "readline/promises";
import * as Rx from "rxjs";
import { type Wallet } from "@midnight-ntwrk/wallet-api";
import { deployAllContracts } from "./deployer.js";
import { TESTNET_CONFIG } from "../config/network.js";

// Fix WebSocket for Node.js environment
// @ts-ignore
globalThis.WebSocket = WebSocket;

// Configure for Midnight Testnet
setNetworkId(NetworkId.TestNet);

const waitForFunds = (wallet: Wallet) =>
  Rx.firstValueFrom(
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

async function main() {
  console.log(" BrickChain Contract Deployment\n");
  console.log("Network: Midnight Testnet");
  console.log("Contracts: 9 total\n");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  let wallet: Wallet | undefined;

  try {
    // Get or generate wallet seed
    const choice = await rl.question("Do you have a wallet seed? (y/n): ");

    let walletSeed: string;
    if (choice.toLowerCase() === "y" || choice.toLowerCase() === "yes") {
      walletSeed = await rl.question("Enter your 64-character seed: ");
    } else {
      const bytes = new Uint8Array(32);
      // @ts-ignore
      crypto.getRandomValues(bytes);
      walletSeed = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
      console.log(`\n SAVE THIS SEED: ${walletSeed}\n`);
    }

    // Build wallet
    console.log("Building wallet...");
    wallet = await WalletBuilder.buildFromSeed(
      TESTNET_CONFIG.indexer,
      TESTNET_CONFIG.indexerWS,
      TESTNET_CONFIG.proofServer,
      TESTNET_CONFIG.node,
      walletSeed,
      getZswapNetworkId(),
      "info"
    );

    const state = await Rx.firstValueFrom(wallet.state());

    console.log(` Wallet address: ${state.address}`);

    let balance = state.balances[nativeToken()] || 0n;

    if (balance === 0n) {
      console.log(`\n Wallet balance is: 0`);
      console.log("Visit: https://midnight.network/test-faucet to get funds.");
      console.log(`Waiting to receive tokens...\n`);
      balance = await waitForFunds(wallet);
    }

    console.log(` Balance: ${balance}\n`);

    // Deploy all contracts
    console.log(" Starting deployment of all contracts...");
    console.log("This will take several minutes (30-60 seconds per contract)\n");

    const deployments = await deployAllContracts(wallet);

    // Save consolidated deployment info
    const consolidatedInfo = {
      network: "testnet",
      deployedAt: new Date().toISOString(),
      deployer: state.address,
      contracts: Object.entries(deployments).reduce((acc, [name, info]) => {
        acc[name] = info.contractAddress;
        return acc;
      }, {} as Record<string, string>),
    };

    const deploymentsDir = path.join(process.cwd(), "deployments");
    fs.writeFileSync(
      path.join(deploymentsDir, "all-contracts.json"),
      JSON.stringify(consolidatedInfo, null, 2)
    );

    console.log("\n ALL CONTRACTS DEPLOYED SUCCESSFULLY!\n");
    console.log("Contract Addresses:");
    Object.entries(consolidatedInfo.contracts).forEach(([name, address]) => {
      console.log(`  ${name}: ${address}`);
    });
    console.log(`\n Deployment info saved to deployments/all-contracts.json`);
  } catch (error) {
    console.error("\n Deployment failed:", error);
    process.exit(1);
  } finally {
    rl.close();
  }
}

main().catch(console.error);
