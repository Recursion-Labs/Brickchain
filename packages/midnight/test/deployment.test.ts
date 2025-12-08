// Deployment tests for BrickChain contracts

import { describe, it, expect, beforeAll } from "vitest";
import { WalletBuilder } from "@midnight-ntwrk/wallet";
import type { Wallet } from "@midnight-ntwrk/wallet-api";
import { setNetworkId, NetworkId, getZswapNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { WebSocket } from "ws";
import { TESTNET_CONFIG } from "../src/config/network.js";
import { deployContractByName } from "../src/deployment/deployer.js";

// @ts-ignore
globalThis.WebSocket = WebSocket;
setNetworkId(NetworkId.TestNet);

describe("Contract Deployment", () => {
  let wallet: Wallet;
  const testSeed = process.env.TEST_WALLET_SEED || "0".repeat(64);

  beforeAll(async () => {
    wallet = await WalletBuilder.buildFromSeed(
      TESTNET_CONFIG.indexer,
      TESTNET_CONFIG.indexerWS,
      TESTNET_CONFIG.proofServer,
      TESTNET_CONFIG.node,
      testSeed,
      getZswapNetworkId(),
      "error"
    );
  }, 30000);

  it("should deploy main contract", async () => {
    const deployment = await deployContractByName({
      wallet,
      contractName: "main",
    });

    expect(deployment).toBeDefined();
    expect(deployment.contractAddress).toBeTruthy();
    expect(deployment.networkId).toBe("TestNet");
  }, 120000);

  it("should deploy property registry contract", async () => {
    const deployment = await deployContractByName({
      wallet,
      contractName: "propertyRegistry",
    });

    expect(deployment).toBeDefined();
    expect(deployment.contractAddress).toBeTruthy();
  }, 120000);

  it("should deploy role contract", async () => {
    const deployment = await deployContractByName({
      wallet,
      contractName: "role",
    });

    expect(deployment).toBeDefined();
    expect(deployment.contractAddress).toBeTruthy();
  }, 120000);
});
