// Audit Log API - Event logging and tracking

import { type Wallet } from "@midnight-ntwrk/wallet-api";
import { createContractProviders, loadContractModule } from "../utils/providers.js";
import { CONTRACT_PATHS } from "../config/network.js";

export enum EventType {
  PropertyRegistered = 0,
  PropertyVerified = 1,
  PropertyTokenized = 2,
  ListingCreated = 3,
  ListingSold = 4,
  TransactionCompleted = 5,
  UserRoleChanged = 6,
  AdminAction = 7,
  EmergencyPause = 8,
  FeeCollected = 9,
  DisputeFiled = 10,
  DisputeResolved = 11,
}

export class AuditLogAPI {
  private wallet: Wallet;
  private contractAddress: string;
  private contract: any;

  constructor(wallet: Wallet, contractAddress: string) {
    this.wallet = wallet;
    this.contractAddress = contractAddress;
  }

  async initialize() {
    const ContractModule = await loadContractModule(CONTRACT_PATHS.auditLog);
    const providers = createContractProviders(
      this.wallet,
      CONTRACT_PATHS.auditLog,
      "auditLogState"
    );
    this.contract = new ContractModule.Contract({});
    return this;
  }

  async initializeAudit(adminAddress: string) {
    const circuit = this.contract.initializeAudit;
    return await circuit(adminAddress);
  }

  async logPropertyEvent(
    entryId: string,
    eventType: EventType,
    propertyId: string,
    actorAddress: string,
    timestamp: bigint
  ) {
    const circuit = this.contract.logPropertyEvent;
    return await circuit(entryId, eventType, propertyId, actorAddress, timestamp);
  }

  async logTransactionEvent(
    entryId: string,
    eventType: EventType,
    transactionId: string,
    actorAddress: string,
    counterpartyAddress: string,
    amount: bigint,
    timestamp: bigint
  ) {
    const circuit = this.contract.logTransactionEvent;
    return await circuit(
      entryId,
      eventType,
      transactionId,
      actorAddress,
      counterpartyAddress,
      amount,
      timestamp
    );
  }

  async logAdminAction(
    entryId: string,
    actionType: EventType,
    adminAddress: string,
    targetResource: string,
    detailsHash: string,
    timestamp: bigint
  ) {
    const circuit = this.contract.logAdminAction;
    return await circuit(entryId, actionType, adminAddress, targetResource, detailsHash, timestamp);
  }

  async getAuditEntry(entryId: string) {
    const circuit = this.contract.getAuditEntry;
    return await circuit(entryId);
  }

  async getEventTypeCount(eventType: EventType) {
    const circuit = this.contract.getEventTypeCount;
    return await circuit(eventType);
  }

  async getActorEventCount(actorAddress: string) {
    const circuit = this.contract.getActorEventCount;
    return await circuit(actorAddress);
  }

  async getTotalEntries() {
    const circuit = this.contract.getTotalEntries;
    return await circuit();
  }
}
