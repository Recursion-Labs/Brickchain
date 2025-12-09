#!/usr/bin/env node
// Deploy all BrickChain contracts to Midnight Testnet

import { setNetworkId, NetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { WebSocket } from "ws";
import * as readline from "readline/promises";
import { buildWallet, generateWalletSeed, waitForFunds, getWalletAddress, getWalletBalance } from "../utils/wallet.js";
import { deployAllContracts } from "./deployer.js";

import * as fs from "fs";
import * as path from "path";

// Fix WebSocket for Node.js environment
// @ts-ignore
globalThis.WebSocket = WebSocket;

// Configure for Midnight Testnet
setNetworkId(NetworkId.TestNet);

async function main() {
  console.log(" BrickChain Midnight Deployment\n");
  console.log("This will deploy all contracts to Midnight Testnet\n");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    // Ask user if they have an existing wallet seed
    const choice = await rl.question("Do you have a wallet seed? (y/n): ");

    let walletSeed: string;
    if (choice.toLowerCase() === "y" || choice.toLowerCase() === "yes") {
      walletSeed = await rl.question("Enter your 64-character seed: ");
    } else {
      walletSeed = generateWalletSeed();
      console.log(`\n SAVE THIS SEED: ${walletSeed}\n`);
      
      // Save seed to file
      const seedPath = path.join(process.cwd(), ".wallet-seed");
      fs.writeFileSync(seedPath, walletSeed);
      console.log(` Seed saved to ${seedPath} (keep this secure!)\n`);
    }

    // Build wallet
    console.log("🔨 Building wallet...");
    const wallet = await buildWallet(walletSeed);

    const address = await getWalletAddress(wallet);
    console.log(` Your wallet address: ${address}`);

    let balance = await getWalletBalance(wallet);

    if (balance === 0n) {
      console.log(` Your wallet balance: 0`);
      console.log(" Visit: https://midnight.network/test-faucet to get some funds.");
      console.log(` Waiting to receive tokens...`);
      balance = await waitForFunds(wallet);
    }

    console.log(` Balance: ${balance}\n`);

    // Deploy all contracts
    console.log(" Starting deployment of all contracts...\n");
    const deployments = await deployAllContracts(wallet);

    // Save all deployment addresses
    const addressesPath = path.join(process.cwd(), "deployments", "addresses.json");
    const addresses = Object.fromEntries(
      Object.entries(deployments).map(([name, info]) => [name, info.contractAddress])
    );
    fs.writeFileSync(addressesPath, JSON.stringify(addresses, null, 2));

    console.log("\n All contracts deployed successfully!");
    console.log(` Contract addresses saved to ${addressesPath}\n`);

    console.log(" Deployment Summary:");
    console.log("━".repeat(60));
    for (const [name, info] of Object.entries(deployments)) {
      console.log(`${name.padEnd(20)} ${info.contractAddress}`);
    }
    console.log("━".repeat(60));

    console.log("\n Deployment complete!");
  } catch (error) {
    console.error(" Deployment failed:", error);
    process.exit(1);
  } finally {
    rl.close();
  }
}

main().catch(console.error);
