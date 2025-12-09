// Marketplace API for frontend integration

import { type Wallet } from "@midnight-ntwrk/wallet-api";
import { createContractProviders, loadContractModule } from "../utils/providers.js";
import { CONTRACT_PATHS } from "../config/network.js";
import type { ListingData, ListingStatus } from "../types/contracts.js";

export class MarketplaceAPI {
  private wallet: Wallet;
  private contractAddress: string;
  private contract: any;
  private providers: any;

  constructor(wallet: Wallet, contractAddress: string) {
    this.wallet = wallet;
    this.contractAddress = contractAddress;
  }

  async initialize(): Promise<void> {
    const ContractModule = await loadContractModule(CONTRACT_PATHS.marketplace);
    this.contract = new ContractModule.Contract({});
    this.providers = createContractProviders(
      this.wallet,
      CONTRACT_PATHS.marketplace,
      "marketplaceState"
    );
  }

  async createListing(
    listingId: string,
    propertyId: string,
    price: bigint,
    durationSeconds: bigint,
    seller: string
  ): Promise<void> {
    if (!this.contract) await this.initialize();

    const listingIdBytes = this.stringToBytes32(listingId);
    const propertyIdBytes = this.stringToBytes32(propertyId);
    const sellerAddress = this.addressToUint32(seller);
    const timestamp = BigInt(Math.floor(Date.now() / 1000));

    await this.contract.createListing(
      listingIdBytes,
      propertyIdBytes,
      price,
      durationSeconds,
      timestamp,
      sellerAddress
    );
  }

  async getListing(listingId: string): Promise<ListingData> {
    if (!this.contract) await this.initialize();

    const listingIdBytes = this.stringToBytes32(listingId);
    const [seller, propertyId, price, status] = await this.contract.getListing(listingIdBytes);
    const [timestamp, duration] = await this.contract.getListingDetails(listingIdBytes);

    return {
      listingId,
      propertyId: this.bytes32ToString(propertyId),
      seller: this.uint32ToAddress(seller),
      price,
      status: status as ListingStatus,
      timestamp,
      duration,
    };
  }

  async updateListing(
    listingId: string,
    newPrice: bigint,
    caller: string
  ): Promise<void> {
    if (!this.contract) await this.initialize();

    const listingIdBytes = this.stringToBytes32(listingId);
    const callerAddress = this.addressToUint32(caller);

    await this.contract.updateListing(listingIdBytes, newPrice, callerAddress);
  }

  async cancelListing(listingId: string, caller: string): Promise<void> {
    if (!this.contract) await this.initialize();

    const listingIdBytes = this.stringToBytes32(listingId);
    const callerAddress = this.addressToUint32(caller);

    await this.contract.cancelListing(listingIdBytes, callerAddress);
  }

  async purchaseListing(listingId: string, buyer: string): Promise<void> {
    if (!this.contract) await this.initialize();

    const listingIdBytes = this.stringToBytes32(listingId);
    const buyerAddress = this.addressToUint32(buyer);

    await this.contract.purchaseListing(listingIdBytes, buyerAddress);
  }

  async getCollectedFees(caller: string): Promise<bigint> {
    if (!this.contract) await this.initialize();

    const callerAddress = this.addressToUint32(caller);
    return await this.contract.getCollectedFees(callerAddress);
  }

  // Helper methods
  private stringToBytes32(str: string): Uint8Array {
    const bytes = new Uint8Array(32);
    const encoded = new TextEncoder().encode(str);
    bytes.set(encoded.slice(0, 32));
    return bytes;
  }

  private bytes32ToString(bytes: Uint8Array): string {
    return new TextDecoder().decode(bytes).replace(/\0/g, "");
  }

  private addressToUint32(address: string): number {
    return parseInt(address.slice(0, 8), 16);
  }

  private uint32ToAddress(value: number): string {
    return "0x" + value.toString(16).padStart(8, "0");
  }
}
