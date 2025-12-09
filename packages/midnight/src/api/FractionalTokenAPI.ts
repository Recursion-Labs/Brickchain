// Fractional Token API for frontend integration

import { type Wallet } from "@midnight-ntwrk/wallet-api";
import { createContractProviders, loadContractModule } from "../utils/providers.js";
import { CONTRACT_PATHS } from "../config/network.js";
import type { TokenState } from "../types/contracts.js";

export class FractionalTokenAPI {
  private wallet: Wallet;
  private contractAddress: string;
  private contract: any;
  private providers: any;

  constructor(wallet: Wallet, contractAddress: string) {
    this.wallet = wallet;
    this.contractAddress = contractAddress;
  }

  async initialize(): Promise<void> {
    const ContractModule = await loadContractModule(CONTRACT_PATHS.fractionalToken);
    this.contract = new ContractModule.Contract({});
    this.providers = createContractProviders(
      this.wallet,
      CONTRACT_PATHS.fractionalToken,
      "fractionalTokenState"
    );
  }

  async mint(to: string, amount: bigint): Promise<void> {
    if (!this.contract) await this.initialize();

    const toAddress = this.addressToUint32(to);
    await this.contract.mint(toAddress, amount);
  }

  async burn(from: string, amount: bigint): Promise<void> {
    if (!this.contract) await this.initialize();

    const fromAddress = this.addressToUint32(from);
    await this.contract.burn(fromAddress, amount);
  }

  async transfer(from: string, to: string, amount: bigint): Promise<void> {
    if (!this.contract) await this.initialize();

    const fromAddress = this.addressToUint32(from);
    const toAddress = this.addressToUint32(to);
    await this.contract.transfer(fromAddress, toAddress, amount);
  }

  async approve(owner: string, spender: string, amount: bigint): Promise<void> {
    if (!this.contract) await this.initialize();

    const ownerAddress = this.addressToUint32(owner);
    const spenderAddress = this.addressToUint32(spender);
    await this.contract.approve(ownerAddress, spenderAddress, amount);
  }

  async balanceOf(holder: string): Promise<bigint> {
    if (!this.contract) await this.initialize();

    const holderAddress = this.addressToUint32(holder);
    return await this.contract.balanceOf(holderAddress);
  }

  async getTotalSupply(): Promise<bigint> {
    if (!this.contract) await this.initialize();
    return await this.contract.getTotalSupply();
  }

  async getCirculatingSupply(): Promise<bigint> {
    if (!this.contract) await this.initialize();
    return await this.contract.getCirculatingSupply();
  }

  async getTokenState(): Promise<TokenState> {
    if (!this.contract) await this.initialize();
    return await this.contract.getTokenState();
  }

  async registerProperty(propertyId: string, ownerId: string): Promise<void> {
    if (!this.contract) await this.initialize();

    const propertyIdBytes = this.stringToBytes32(propertyId);
    const ownerAddress = this.addressToUint32(ownerId);
    await this.contract.register_property(propertyIdBytes, ownerAddress);
  }

  async tokenizeProperty(propertyId: string, tokenId: number): Promise<void> {
    if (!this.contract) await this.initialize();

    const propertyIdBytes = this.stringToBytes32(propertyId);
    await this.contract.tokenize_property(propertyIdBytes, tokenId);
  }

  async getPropertyStatus(propertyId: string): Promise<number> {
    if (!this.contract) await this.initialize();

    const propertyIdBytes = this.stringToBytes32(propertyId);
    return await this.contract.getPropertyStatus(propertyIdBytes);
  }

  async getPropertyOwner(propertyId: string): Promise<string> {
    if (!this.contract) await this.initialize();

    const propertyIdBytes = this.stringToBytes32(propertyId);
    const owner = await this.contract.getPropertyOwner(propertyIdBytes);
    return this.uint32ToAddress(owner);
  }

  // Helper methods
  private stringToBytes32(str: string): Uint8Array {
    const bytes = new Uint8Array(32);
    const encoded = new TextEncoder().encode(str);
    bytes.set(encoded.slice(0, 32));
    return bytes;
  }

  private addressToUint32(address: string): number {
    return parseInt(address.slice(0, 8), 16);
  }

  private uint32ToAddress(value: number): string {
    return "0x" + value.toString(16).padStart(8, "0");
  }
}
