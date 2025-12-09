// Verification API for frontend integration

import { type Wallet } from "@midnight-ntwrk/wallet-api";
import { createContractProviders, loadContractModule } from "../utils/providers.js";
import { CONTRACT_PATHS } from "../config/network.js";
import type { VerificationRequest, VerificationStatus } from "../types/contracts.js";

export class VerificationAPI {
  private wallet: Wallet;
  private contractAddress: string;
  private contract: any;
  private providers: any;

  constructor(wallet: Wallet, contractAddress: string) {
    this.wallet = wallet;
    this.contractAddress = contractAddress;
  }

  async initialize(): Promise<void> {
    const ContractModule = await loadContractModule(CONTRACT_PATHS.verification);
    this.contract = new ContractModule.Contract({});
    this.providers = createContractProviders(
      this.wallet,
      CONTRACT_PATHS.verification,
      "verificationState"
    );
  }

  async requestVerification(
    requestId: string,
    propertyId: string,
    documentHash: string,
    requester: string
  ): Promise<void> {
    if (!this.contract) await this.initialize();

    const requestIdBytes = this.stringToBytes32(requestId);
    const propertyIdBytes = this.stringToBytes32(propertyId);
    const documentHashBytes = this.stringToBytes64(documentHash);
    const requesterAddress = this.addressToUint32(requester);
    const timestamp = BigInt(Math.floor(Date.now() / 1000));

    await this.contract.requestVerification(
      requestIdBytes,
      propertyIdBytes,
      documentHashBytes,
      timestamp,
      requesterAddress
    );
  }

  async getVerificationStatus(requestId: string): Promise<VerificationRequest> {
    if (!this.contract) await this.initialize();

    const requestIdBytes = this.stringToBytes32(requestId);
    const [status, requester, propertyId] = await this.contract.getVerificationStatus(
      requestIdBytes
    );

    return {
      requestId,
      propertyId: this.bytes32ToString(propertyId),
      requester: this.uint32ToAddress(requester),
      status: status as VerificationStatus,
      documentHash: "", // Would need to be retrieved separately
      timestamp: 0n, // Would need to be retrieved separately
    };
  }

  async approveVerifier(verifier: string, caller: string): Promise<void> {
    if (!this.contract) await this.initialize();

    const verifierAddress = this.addressToUint32(verifier);
    const callerAddress = this.addressToUint32(caller);

    await this.contract.approveVerifier(verifierAddress, callerAddress);
  }

  async startVerification(requestId: string, verifier: string): Promise<void> {
    if (!this.contract) await this.initialize();

    const requestIdBytes = this.stringToBytes32(requestId);
    const verifierAddress = this.addressToUint32(verifier);

    await this.contract.startVerification(requestIdBytes, verifierAddress);
  }

  async submitVerificationResult(
    requestId: string,
    resultHash: string,
    approved: boolean,
    verifier: string
  ): Promise<void> {
    if (!this.contract) await this.initialize();

    const requestIdBytes = this.stringToBytes32(requestId);
    const resultHashBytes = this.stringToBytes128(resultHash);
    const verifierAddress = this.addressToUint32(verifier);

    await this.contract.submitVerificationResult(
      requestIdBytes,
      resultHashBytes,
      approved,
      verifierAddress
    );
  }

  async verifyProof(
    requestId: string,
    proofData: string,
    caller: string
  ): Promise<boolean> {
    if (!this.contract) await this.initialize();

    const requestIdBytes = this.stringToBytes32(requestId);
    const proofDataBytes = this.stringToBytes256(proofData);
    const callerAddress = this.addressToUint32(caller);

    return await this.contract.verifyProof(requestIdBytes, proofDataBytes, callerAddress);
  }

  // Helper methods
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

  private stringToBytes128(str: string): Uint8Array {
    const bytes = new Uint8Array(128);
    const encoded = new TextEncoder().encode(str);
    bytes.set(encoded.slice(0, 128));
    return bytes;
  }

  private stringToBytes256(str: string): Uint8Array {
    const bytes = new Uint8Array(256);
    const encoded = new TextEncoder().encode(str);
    bytes.set(encoded.slice(0, 256));
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
