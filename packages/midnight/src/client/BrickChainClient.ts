// Main client for BrickChain - integrates all APIs

import { type Wallet } from "@midnight-ntwrk/wallet-api";
import { PropertyRegistryAPI } from "../api/PropertyRegistryAPI.js";
import { MarketplaceAPI } from "../api/MarketplaceAPI.js";
import { EscrowAPI } from "../api/EscrowAPI.js";
import { VerificationAPI } from "../api/VerificationAPI.js";
import { FractionalTokenAPI } from "../api/FractionalTokenAPI.js";
import { buildWallet } from "../utils/wallet.js";
import type { ContractAddresses } from "../types/contracts.js";
import * as fs from "fs";
import * as path from "path";

export class BrickChainClient {
  private wallet: Wallet;
  private addresses: ContractAddresses;

  public propertyRegistry: PropertyRegistryAPI;
  public marketplace: MarketplaceAPI;
  public escrow: EscrowAPI;
  public verification: VerificationAPI;
  public fractionalToken: FractionalTokenAPI;

  private constructor(wallet: Wallet, addresses: ContractAddresses) {
    this.wallet = wallet;
    this.addresses = addresses;

    // Initialize all APIs
    this.propertyRegistry = new PropertyRegistryAPI(wallet, addresses.propertyRegistry);
    this.marketplace = new MarketplaceAPI(wallet, addresses.marketplace);
    this.escrow = new EscrowAPI(wallet, addresses.escrow);
    this.verification = new VerificationAPI(wallet, addresses.verification);
    this.fractionalToken = new FractionalTokenAPI(wallet, addresses.fractionalToken);
  }

  static async create(walletSeed: string, addressesPath?: string): Promise<BrickChainClient> {
    // Build wallet
    const wallet = await buildWallet(walletSeed);

    // Load contract addresses
    const defaultPath = path.join(process.cwd(), "deployments", "addresses.json");
    const addrPath = addressesPath || defaultPath;

    if (!fs.existsSync(addrPath)) {
      throw new Error(`Contract addresses not found at ${addrPath}. Deploy contracts first.`);
    }

    const addresses = JSON.parse(fs.readFileSync(addrPath, "utf-8")) as ContractAddresses;

    return new BrickChainClient(wallet, addresses);
  }

  async initialize(): Promise<void> {
    await Promise.all([
      this.propertyRegistry.initialize(),
      this.marketplace.initialize(),
      this.escrow.initialize(),
      this.verification.initialize(),
      this.fractionalToken.initialize(),
    ]);
  }

  getWallet(): Wallet {
    return this.wallet;
  }

  getAddresses(): ContractAddresses {
    return this.addresses;
  }

  async close(): Promise<void> {
    // Wallet cleanup if needed
    console.log("Client closed");
  }
}
