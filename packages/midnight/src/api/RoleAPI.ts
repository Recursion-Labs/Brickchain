// Role contract API - User role management

import { type Wallet } from "@midnight-ntwrk/wallet-api";
import { createContractProviders, loadContractModule } from "../utils/providers.js";
import { CONTRACT_PATHS } from "../config/network.js";

export enum Role {
  USER = 0,
  ADMIN = 1,
  MODERATOR = 2,
}

export class RoleAPI {
  private wallet: Wallet;
  private contractAddress: string;
  private contract: any;

  constructor(wallet: Wallet, contractAddress: string) {
    this.wallet = wallet;
    this.contractAddress = contractAddress;
  }

  async initialize() {
    const ContractModule = await loadContractModule(CONTRACT_PATHS.role);
    const providers = createContractProviders(this.wallet, CONTRACT_PATHS.role, "roleState");
    this.contract = new ContractModule.Contract({});
    return this;
  }

  // Initialize roles
  async initializeRoles(adminAddress: string) {
    const circuit = this.contract.initialize_roles;
    return await circuit(adminAddress);
  }

  // Role management
  async setRole(userAddress: string, role: Role, callerAddress: string) {
    const circuit = this.contract.set_role;
    return await circuit(userAddress, role, callerAddress);
  }

  async getUserRole(userAddress: string) {
    const circuit = this.contract.get_user_role;
    return await circuit(userAddress);
  }

  async removeRole(userAddress: string, callerAddress: string) {
    const circuit = this.contract.remove_role;
    return await circuit(userAddress, callerAddress);
  }

  async isUserAdmin(userAddress: string) {
    const circuit = this.contract.is_user_admin;
    return await circuit(userAddress);
  }

  // Admin transfer
  async transferAdmin(newAdminAddress: string, callerAddress: string) {
    const circuit = this.contract.transfer_admin;
    return await circuit(newAdminAddress, callerAddress);
  }

  // Pause controls
  async pauseContract(callerAddress: string) {
    const circuit = this.contract.pause_contract;
    return await circuit(callerAddress);
  }

  async unpauseContract(callerAddress: string) {
    const circuit = this.contract.unpause_contract;
    return await circuit(callerAddress);
  }
}
