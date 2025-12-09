// Access Control API - Permission management

import { type Wallet } from "@midnight-ntwrk/wallet-api";
import { createContractProviders, loadContractModule } from "../utils/providers.js";
import { CONTRACT_PATHS } from "../config/network.js";

export enum Permission {
  READ = 0,
  WRITE = 1,
  EXECUTE = 2,
  ADMIN = 3,
  MODERATOR = 4,
  TRANSFER = 5,
  BURN = 6,
}

export class AccessControlAPI {
  private wallet: Wallet;
  private contractAddress: string;
  private contract: any;

  constructor(wallet: Wallet, contractAddress: string) {
    this.wallet = wallet;
    this.contractAddress = contractAddress;
  }

  async initialize() {
    const ContractModule = await loadContractModule(CONTRACT_PATHS.accessControl);
    const providers = createContractProviders(
      this.wallet,
      CONTRACT_PATHS.accessControl,
      "accessControlState"
    );
    this.contract = new ContractModule.Contract({});
    return this;
  }

  async initializeAccessControl(adminAddress: string) {
    const circuit = this.contract.initializeAccessControl;
    return await circuit(adminAddress);
  }

  async grantPermission(
    grantId: string,
    userAddress: string,
    resourceId: string,
    callerAddress: string
  ) {
    const circuit = this.contract.grantPermission;
    return await circuit(grantId, userAddress, resourceId, callerAddress);
  }

  async revokePermission(grantId: string, userAddress: string, callerAddress: string) {
    const circuit = this.contract.revokePermission;
    return await circuit(grantId, userAddress, callerAddress);
  }

  async hasReadPermission(userAddress: string, resourceId: string) {
    const circuit = this.contract.hasReadPermission;
    return await circuit(userAddress, resourceId);
  }

  async hasWritePermission(userAddress: string, resourceId: string) {
    const circuit = this.contract.hasWritePermission;
    return await circuit(userAddress, resourceId);
  }

  async hasExecutePermission(userAddress: string, resourceId: string) {
    const circuit = this.contract.hasExecutePermission;
    return await circuit(userAddress, resourceId);
  }

  async pauseAccessControl(callerAddress: string) {
    const circuit = this.contract.pauseAccessControl;
    return await circuit(callerAddress);
  }

  async unpauseAccessControl(callerAddress: string) {
    const circuit = this.contract.unpauseAccessControl;
    return await circuit(callerAddress);
  }
}
