// Complete end-to-end flow test

import { describe, it, expect, beforeAll } from "vitest";
import { WalletBuilder } from "@midnight-ntwrk/wallet";
import type { Wallet } from "@midnight-ntwrk/wallet-api";
import { setNetworkId, NetworkId, getZswapNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { WebSocket } from "ws";
import { TESTNET_CONFIG } from "../src/config/network.js";
import { MainAPI } from "../src/api/MainAPI.js";
import { RoleAPI } from "../src/api/RoleAPI.js";
import { PropertyRegistryAPI } from "../src/api/PropertyRegistryAPI.js";
import { MarketplaceAPI } from "../src/api/MarketplaceAPI.js";
import { EscrowAPI } from "../src/api/EscrowAPI.js";
import * as fs from "fs";
import * as path from "path";
import * as Rx from "rxjs";

// @ts-ignore
globalThis.WebSocket = WebSocket;
setNetworkId(NetworkId.TestNet);

describe("Complete BrickChain Flow", () => {
  let wallet: Wallet;
  let deployments: any;
  let adminAddress: string;
  const testSeed = process.env.TEST_WALLET_SEED || "0".repeat(64);

  beforeAll(async () => {
    // Load deployments
    const deploymentPath = path.join(process.cwd(), "deployments", "all-contracts.json");
    if (!fs.existsSync(deploymentPath)) {
      throw new Error("Run deployment first: npm run deploy");
    }
    deployments = JSON.parse(fs.readFileSync(deploymentPath, "utf-8"));

    // Build wallet
    wallet = await WalletBuilder.buildFromSeed(
      TESTNET_CONFIG.indexer,
      TESTNET_CONFIG.indexerWS,
      TESTNET_CONFIG.proofServer,
      TESTNET_CONFIG.node,
      testSeed,
      getZswapNetworkId(),
      "error"
    );

    const state = await Rx.firstValueFrom(wallet.state());
    if (state) {
      adminAddress = state.address;
    }
  }, 30000);

  it("should complete full property lifecycle", async () => {
    // 1. Initialize system
    const mainAPI = new MainAPI(wallet, deployments.contracts.main);
    await mainAPI.initialize();
    await mainAPI.initializeSystem(adminAddress);
    console.log("✓ System initialized");

    // 2. Initialize roles
    const roleAPI = new RoleAPI(wallet, deployments.contracts.role);
    await roleAPI.initialize();
    await roleAPI.initializeRoles(adminAddress);
    console.log("✓ Roles initialized");

    // 3. Register property
    const registryAPI = new PropertyRegistryAPI(
      wallet,
      deployments.contracts.propertyRegistry
    );
    await registryAPI.initialize();

    const propertyId = "0x" + "1".repeat(64);
    const valuation = 1000000n;
    const locationHash = "0x" + "a".repeat(128);
    const documentHash = "0x" + "b".repeat(128);

    await registryAPI.registerProperty(
      propertyId,
      adminAddress,
      valuation,
      locationHash,
      documentHash
    );
    console.log("✓ Property registered");

    // 4. Get property info
    const property = await registryAPI.getProperty(propertyId);
    expect(property).toBeDefined();
    console.log("✓ Property retrieved");

    // 5. Create marketplace listing
    const marketplaceAPI = new MarketplaceAPI(
      wallet,
      deployments.contracts.marketplace
    );
    await marketplaceAPI.initialize();

    const listingId = "0x" + "2".repeat(64);
    const price = 1000000n;
    const duration = 86400n; // 1 day

    await marketplaceAPI.createListing(
      listingId,
      propertyId,
      price,
      duration,
      adminAddress
    );
    console.log("✓ Listing created");

    // 6. Get listing info
    const listing = await marketplaceAPI.getListing(listingId);
    expect(listing).toBeDefined();
    console.log("✓ Listing retrieved");

    // 7. Create escrow
    const escrowAPI = new EscrowAPI(wallet, deployments.contracts.escrow);
    await escrowAPI.initialize();

    const escrowId = "0x" + "3".repeat(64);
    const buyerAddress = adminAddress; // In real scenario, different address

    await escrowAPI.depositEscrow(
      escrowId,
      listingId,
      adminAddress,
      buyerAddress,
      price
    );
    console.log("✓ Escrow created");

    // 8. Get escrow info
    const escrow = await escrowAPI.getEscrow(escrowId);
    expect(escrow).toBeDefined();
    console.log("✓ Escrow retrieved");

    console.log("\n🎉 Complete flow test passed!");
  }, 300000); // 5 minutes timeout for full flow
});
