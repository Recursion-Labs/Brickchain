// Property Registry API for frontend integration

import { type Wallet } from "@midnight-ntwrk/wallet-api";
import { createContractProviders, loadContractModule } from "../utils/providers.js";
import { CONTRACT_PATHS } from "../config/network.js";
import type { PropertyData, PropertyStatus } from "../types/contracts.js";

export class PropertyRegistryAPI {
  private wallet: Wallet;
  private contractAddress: string;
  private contract: any;
  private providers: any;

  constructor(wallet: Wallet, contractAddress: string) {
    this.wallet = wallet;
    this.contractAddress = contractAddress;
  }

  async initialize(): Promise<void> {
    const ContractModule = await loadContractModule(CONTRACT_PATHS.propertyRegistry);
    this.contract = new ContractModule.Contract({});
    this.providers = createContractProviders(
      this.wallet,
      CONTRACT_PATHS.propertyRegistry,
      "propertyRegistryState"
    );
  }

  async registerProperty(
    propertyId: string,
    owner: string,
    valuation: bigint,
    locationHash: string,
    documentHash: string
  ): Promise<void> {
    if (!this.contract) await this.initialize();

    const propertyIdBytes = this.stringToBytes32(propertyId);
    const ownerAddress = this.addressToUint32(owner);
    const locationBytes = this.stringToBytes64(locationHash);
    const documentBytes = this.stringToBytes64(documentHash);

    await this.contract.registerProperty(
      propertyIdBytes,
      ownerAddress,
      valuation,
      locationBytes,
      documentBytes
    );
  }

  async getProperty(propertyId: string): Promise<PropertyData> {
    if (!this.contract) await this.initialize();

    const propertyIdBytes = this.stringToBytes32(propertyId);
    const [owner, status, value] = await this.contract.getProperty(propertyIdBytes);
    const [location, documents] = await this.contract.getPropertyMetadata(propertyIdBytes);

    return {
      propertyId,
      owner: this.uint32ToAddress(owner),
      status: status as PropertyStatus,
      valuation: value,
      locationHash: this.bytes64ToString(location),
      documentHash: this.bytes64ToString(documents),
    };
  }

  async updatePropertyStatus(
    propertyId: string,
    newStatus: PropertyStatus,
    caller: string
  ): Promise<void> {
    if (!this.contract) await this.initialize();

    const propertyIdBytes = this.stringToBytes32(propertyId);
    const callerAddress = this.addressToUint32(caller);

    await this.contract.updatePropertyStatus(propertyIdBytes, newStatus, callerAddress);
  }

  async transferProperty(
    propertyId: string,
    newOwner: string,
    caller: string
  ): Promise<void> {
    if (!this.contract) await this.initialize();

    const propertyIdBytes = this.stringToBytes32(propertyId);
    const newOwnerAddress = this.addressToUint32(newOwner);
    const callerAddress = this.addressToUint32(caller);

    await this.contract.transferProperty(propertyIdBytes, newOwnerAddress, callerAddress);
  }

  async verifyProperty(propertyId: string, caller: string): Promise<void> {
    if (!this.contract) await this.initialize();

    const propertyIdBytes = this.stringToBytes32(propertyId);
    const callerAddress = this.addressToUint32(caller);

    await this.contract.verifyProperty(propertyIdBytes, callerAddress);
  }

  // Helper methods for type conversion
  private stringToBytes32(str: string): Uint8Array {
    const bytes = new Uint8Array(32);
    const encoded = new TextEncoder().encode(str);
    bytes.set(encoded.slice(0, 32));
    return bytes;
  }

  private stringToBytes64(str: string): Uint8Array {
    const bytes = new Uint8Array(64);
    const encoded = new TextEncoder().encode(str);
    bytes.set(encoded.slice(0, 64));
    return bytes;
  }

  private bytes64ToString(bytes: Uint8Array): string {
    return new TextDecoder().decode(bytes).replace(/\0/g, "");
  }

  private addressToUint32(address: string): number {
    // Convert address string to uint32 (simplified)
    return parseInt(address.slice(0, 8), 16);
  }

  private uint32ToAddress(value: number): string {
    return "0x" + value.toString(16).padStart(8, "0");
  }
}
