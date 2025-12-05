// Main contract API - System orchestrator

import { type Wallet } from "@midnight-ntwrk/wallet-api";
import { createContractProviders, loadContractModule } from "../utils/providers.js";
import { CONTRACT_PATHS } from "../config/network.js";

export class MainAPI {
  private wallet: Wallet;
  private contractAddress: string;
  private contract: any;

  constructor(wallet: Wallet, contractAddress: string) {
    this.wallet = wallet;
    this.contractAddress = contractAddress;
  }

  async initialize() {
    const ContractModule = await loadContractModule(CONTRACT_PATHS.main);
    const providers = createContractProviders(this.wallet, CONTRACT_PATHS.main, "mainState");
    this.contract = new ContractModule.Contract({});
    return this;
  }

  // Initialize system
  async initializeSystem(adminAddress: string) {
    const circuit = this.contract.initializeSystem;
    const result = await circuit(adminAddress);
    return result;
  }

  // Emergency controls
  async emergencyPause(callerAddress: string) {
    const circuit = this.contract.emergencyPause;
    return await circuit(callerAddress);
  }

  async emergencyUnpause(callerAddress: string) {
    const circuit = this.contract.emergencyUnpause;
    return await circuit(callerAddress);
  }

  // System status
  async getSystemStatus() {
    const circuit = this.contract.getSystemStatus;
    return await circuit();
  }

  async isSystemOperational() {
    const circuit = this.contract.isSystemOperational;
    return await circuit();
  }

  // Metrics
  async getTotalUsers() {
    const circuit = this.contract.getTotalUsers;
    return await circuit();
  }

  async getTotalProperties() {
    const circuit = this.contract.getTotalProperties;
    return await circuit();
  }

  async getTotalTransactions() {
    const circuit = this.contract.getTotalTransactions;
    return await circuit();
  }

  async incrementUserCount(callerAddress: string) {
    const circuit = this.contract.incrementUserCount;
    return await circuit(callerAddress);
  }

  async incrementPropertyCount(callerAddress: string) {
    const circuit = this.contract.incrementPropertyCount;
    return await circuit(callerAddress);
  }

  async incrementTransactionCount(callerAddress: string) {
    const circuit = this.contract.incrementTransactionCount;
    return await circuit(callerAddress);
  }

  // Fees
  async getCollectedFees() {
    const circuit = this.contract.getCollectedFees;
    return await circuit();
  }

  async withdrawCollectedFees(callerAddress: string) {
    const circuit = this.contract.withdrawCollectedFees;
    return await circuit(callerAddress);
  }

  // Admin
  async transferAdmin(newAdminAddress: string, callerAddress: string) {
    const circuit = this.contract.transferAdmin;
    return await circuit(newAdminAddress, callerAddress);
  }
}
