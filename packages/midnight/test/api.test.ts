// API integration tests

import { describe, it, expect, beforeAll } from "vitest";
import { WalletBuilder } from "@midnight-ntwrk/wallet";
import { setNetworkId, NetworkId, getZswapNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { WebSocket } from "ws";
import { TESTNET_CONFIG } from "../src/config/network.js";
import { MainAPI } from "../src/api/MainAPI.js";
import { RoleAPI, Role } from "../src/api/RoleAPI.js";
import { PropertyRegistryAPI } from "../src/api/PropertyRegistryAPI.js";
import * as fs from "fs";
import * as path from "path";

// @ts-ignore
globalThis.WebSocket = WebSocket;
setNetworkId(NetworkId.TestNet);

describe("API Integration Tests", () => {
  let wallet: any;
  let deployments: any;
  const testSeed = process.env.TEST_WALLET_SEED || "0".repeat(64);

  beforeAll(async () => {
    // Load deployment info
    const deploymentPath = path.join(process.cwd(), "deployments", "all-contracts.json");
    if (!fs.existsSync(deploymentPath)) {
      throw new Error("Deployments not found. Run deployment first.");
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
    wallet.start();
  }, 30000);

  describe("MainAPI", () => {
    it("should get system status", async () => {
      const api = await new MainAPI(wallet, deployments.contracts.main).initialize();
      const status = await api.getSystemStatus();
      expect(status).toBeDefined();
    }, 30000);

    it("should check if system is operational", async () => {
      const api = await new MainAPI(wallet, deployments.contracts.main).initialize();
      const operational = await api.isSystemOperational();
      expect(operational).toBeDefined();
    }, 30000);
  });

  describe("RoleAPI", () => {
    it("should get user role", async () => {
      const api = await new RoleAPI(wallet, deployments.contracts.role).initialize();
      const role = await api.getUserRole(deployments.deployer);
      expect(role).toBeDefined();
    }, 30000);
  });

  describe("PropertyRegistryAPI", () => {
    it("should initialize registry", async () => {
      const api = await new PropertyRegistryAPI(wallet, deployments.contracts.propertyRegistry).initialize();
      expect(api).toBeDefined();
    }, 30000);
  });
});
