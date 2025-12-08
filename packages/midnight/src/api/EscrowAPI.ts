// Escrow API for frontend integration

import { type Wallet } from "@midnight-ntwrk/wallet-api";
import { createContractProviders, loadContractModule } from "../utils/providers.js";
import { CONTRACT_PATHS } from "../config/network.js";
import type { EscrowData, EscrowStatus } from "../types/contracts.js";

export class EscrowAPI {
  private wallet: Wallet;
  private contractAddress: string;
  private contract: any;
  private providers: any;

  constructor(wallet: Wallet, contractAddress: string) {
    this.wallet = wallet;
    this.contractAddress = contractAddress;
  }

  async initialize(): Promise<void> {
    const ContractModule = await loadContractModule(CONTRACT_PATHS.escrow);
    this.contract = new ContractModule.Contract({});
    this.providers = createContractProviders(
      this.wallet,
      CONTRACT_PATHS.escrow,
      "escrowState"
    );
  }

  async depositEscrow(
    escrowId: string,
    listingId: string,
    seller: string,
    buyer: string,
    amount: bigint
  ): Promise<void> {
    if (!this.contract) await this.initialize();

    const escrowIdBytes = this.stringToBytes32(escrowId);
    const listingIdBytes = this.stringToBytes32(listingId);
    const sellerAddress = this.addressToUint32(seller);
    const buyerAddress = this.addressToUint32(buyer);
    const timestamp = BigInt(Math.floor(Date.now() / 1000));

    await this.contract.depositEscrow(
      escrowIdBytes,
      listingIdBytes,
      sellerAddress,
      buyerAddress,
      amount,
      timestamp
    );
  }

  async getEscrow(escrowId: string): Promise<EscrowData> {
    if (!this.contract) await this.initialize();

    const escrowIdBytes = this.stringToBytes32(escrowId);
    const [buyer, seller, amount, status] = await this.contract.getEscrow(escrowIdBytes);
    const [createdAt, releasedAt] = await this.contract.getEscrowTimestamps(escrowIdBytes);

    return {
      escrowId,
      listingId: "", // Would need to be stored separately
      buyer: this.uint32ToAddress(buyer),
      seller: this.uint32ToAddress(seller),
      amount,
      status: status as EscrowStatus,
      createdAt,
      releasedAt: releasedAt > 0n ? releasedAt : undefined,
    };
  }

  async releaseEscrow(escrowId: string, caller: string): Promise<void> {
    if (!this.contract) await this.initialize();

    const escrowIdBytes = this.stringToBytes32(escrowId);
    const callerAddress = this.addressToUint32(caller);
    const timestamp = BigInt(Math.floor(Date.now() / 1000));

    await this.contract.releaseEscrow(escrowIdBytes, callerAddress, timestamp);
  }

  async fileDispute(
    escrowId: string,
    disputeReason: string,
    caller: string
  ): Promise<void> {
    if (!this.contract) await this.initialize();

    const escrowIdBytes = this.stringToBytes32(escrowId);
    const disputeReasonBytes = this.stringToBytes128(disputeReason);
    const callerAddress = this.addressToUint32(caller);

    await this.contract.fileDispute(escrowIdBytes, disputeReasonBytes, callerAddress);
  }

  async resolveDispute(
    escrowId: string,
    releaseToSeller: boolean,
    caller: string
  ): Promise<void> {
    if (!this.contract) await this.initialize();

    const escrowIdBytes = this.stringToBytes32(escrowId);
    const callerAddress = this.addressToUint32(caller);

    await this.contract.resolveDispute(escrowIdBytes, releaseToSeller, callerAddress);
  }

  // Helper methods
  private stringToBytes32(str: string): Uint8Array {
    const bytes = new Uint8Array(32);
    const encoded = new TextEncoder().encode(str);
    bytes.set(encoded.slice(0, 32));
    return bytes;
  }

  private stringToBytes128(str: string): Uint8Array {
    const bytes = new Uint8Array(128);
    const encoded = new TextEncoder().encode(str);
    bytes.set(encoded.slice(0, 128));
    return bytes;
  }

  private addressToUint32(address: string): number {
    return parseInt(address.slice(0, 8), 16);
  }

  private uint32ToAddress(value: number): string {
    return "0x" + value.toString(16).padStart(8, "0");
  }
}
