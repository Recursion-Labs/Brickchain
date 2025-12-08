#!/usr/bin/env node
// Example: Complete property transaction flow

import { setNetworkId, NetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { WebSocket } from "ws";
import { BrickChainClient } from "../client/BrickChainClient.js";
import { PropertyStatus, ListingStatus } from "../types/contracts.js";
import * as fs from "fs";
import * as path from "path";
import * as Rx from "rxjs";

// Fix WebSocket for Node.js environment
// @ts-ignore
globalThis.WebSocket = WebSocket;

// Configure for Midnight Testnet
setNetworkId(NetworkId.TestNet);

async function main() {
  console.log(" BrickChain Complete Flow Example\n");

  // Load wallet seed
  const seedPath = path.join(process.cwd(), ".wallet-seed");
  if (!fs.existsSync(seedPath)) {
    console.error(" Wallet seed not found. Run deployment first.");
    process.exit(1);
  }

  const walletSeed = fs.readFileSync(seedPath, "utf-8").trim();

  // Create client
  console.log(" Initializing BrickChain client...");
  const client = await BrickChainClient.create(walletSeed);
  await client.initialize();

  const wallet = client.getWallet();
  const state = await Rx.firstValueFrom(wallet.state());
  const userAddress = state.address;

  console.log(` User address: ${userAddress}\n`);

  try {
    // Step 1: Register a property
    console.log(" Step 1: Registering property...");
    const propertyId = `property-${Date.now()}`;
    await client.propertyRegistry.registerProperty(
      propertyId,
      userAddress,
      1000000n, // $1M valuation
      "location-hash-123",
      "document-hash-456"
    );
    console.log(` Property registered: ${propertyId}\n`);

    // Step 2: Request verification
    console.log(" Step 2: Requesting verification...");
    const verificationId = `verification-${Date.now()}`;
    await client.verification.requestVerification(
      verificationId,
      propertyId,
      "verification-docs-hash",
      userAddress
    );
    console.log(` Verification requested: ${verificationId}\n`);

    // Step 3: Verify property (admin action)
    console.log(" Step 3: Verifying property...");
    await client.propertyRegistry.verifyProperty(propertyId, userAddress);
    console.log(` Property verified\n`);

    // Step 4: Tokenize property
    console.log(" Step 4: Tokenizing property...");
    await client.fractionalToken.registerProperty(propertyId, userAddress);
    await client.fractionalToken.tokenizeProperty(propertyId, 1);
    
    // Mint fractional tokens (1000 tokens representing property shares)
    await client.fractionalToken.mint(userAddress, 1000n);
    console.log(` Property tokenized with 1000 fractional tokens\n`);

    // Step 5: Create marketplace listing
    console.log(" Step 5: Creating marketplace listing...");
    const listingId = `listing-${Date.now()}`;
    await client.marketplace.createListing(
      listingId,
      propertyId,
      1000000n, // $1M price
      2592000n, // 30 days duration
      userAddress
    );
    console.log(` Listing created: ${listingId}\n`);

    // Step 6: Get listing details
    console.log(" Step 6: Fetching listing details...");
    const listing = await client.marketplace.getListing(listingId);
    console.log(`Listing Details:`);
    console.log(`  - Property: ${listing.propertyId}`);
    console.log(`  - Price: ${listing.price}`);
    console.log(`  - Status: ${ListingStatus[listing.status]}`);
    console.log(`  - Seller: ${listing.seller}\n`);

    // Step 7: Check token balance
    console.log(" Step 7: Checking token balance...");
    const balance = await client.fractionalToken.balanceOf(userAddress);
    const totalSupply = await client.fractionalToken.getTotalSupply();
    console.log(`Token Balance: ${balance}`);
    console.log(`Total Supply: ${totalSupply}\n`);

    // Step 8: Get property details
    console.log(" Step 8: Fetching property details...");
    const property = await client.propertyRegistry.getProperty(propertyId);
    console.log(`Property Details:`);
    console.log(`  - Owner: ${property.owner}`);
    console.log(`  - Status: ${PropertyStatus[property.status]}`);
    console.log(`  - Valuation: ${property.valuation}`);
    console.log(`  - Location Hash: ${property.locationHash}`);
    console.log(`  - Document Hash: ${property.documentHash}\n`);

    console.log(" Complete flow executed successfully!");
  } catch (error) {
    console.error(" Error during flow execution:", error);
  } finally {
    await client.close();
  }
}

main().catch(console.error);
