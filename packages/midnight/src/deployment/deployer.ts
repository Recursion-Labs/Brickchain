// Contract deployment orchestrator

import { deployContract } from "@midnight-ntwrk/midnight-js-contracts";
import { type Wallet } from "@midnight-ntwrk/wallet-api";
import { createContractProviders, loadContractModule } from "../utils/providers.js";
import { CONTRACT_PATHS, type ContractName } from "../config/network.js";
import type { DeploymentInfo } from "../types/contracts.js";
import * as fs from "fs";
import * as path from "path";
import * as Rx from "rxjs";

export interface DeploymentOptions {
  wallet: Wallet;
  contractName: ContractName;
  initialState?: any;
  privateStateId?: string;
}

export async function deployContractByName(
  options: DeploymentOptions
): Promise<DeploymentInfo> {
  const { wallet, contractName, initialState = {}, privateStateId } = options;

  console.log(`\n Deploying ${contractName} contract`);

  const contractPath = CONTRACT_PATHS[contractName];
  const stateId = privateStateId || `${contractName}State`;

  // Load contract module
  const ContractModule = await loadContractModule(contractPath);
  const contractInstance = new ContractModule.Contract(initialState);

  // Create providers - ensure wallet state is loaded first
  const walletState = await Rx.firstValueFrom(wallet.state());
  const providers = await createContractProviders(wallet, contractPath, stateId);

  // Deploy contract
  console.log(` Deploying (this may take 30-60 seconds)`);
  const deployed = await deployContract(providers, {
    contract: contractInstance,
    privateStateId: stateId,
    initialPrivateState: {},
  });

  const contractAddress = deployed.deployTxData.public.contractAddress;
  console.log(` ${contractName} deployed at: ${contractAddress}`);

  const deploymentInfo: DeploymentInfo = {
    contractAddress,
    deployedAt: new Date().toISOString(),
    networkId: "TestNet",
    deployer: walletState.address,
  };

  return deploymentInfo;
}

export async function saveDeploymentInfo(
  contractName: string,
  info: DeploymentInfo
): Promise<void> {
  const deploymentsDir = path.join(process.cwd(), "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const filePath = path.join(deploymentsDir, `${contractName}.json`);
  fs.writeFileSync(filePath, JSON.stringify(info, null, 2));
  console.log(` Deployment info saved to ${filePath}`);
}

export function loadDeploymentInfo(contractName: string): DeploymentInfo | null {
  const filePath = path.join(process.cwd(), "deployments", `${contractName}.json`);
  if (!fs.existsSync(filePath)) {
    return null;
  }

  const data = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(data);
}

export async function deployAllContracts(wallet: Wallet): Promise<Record<ContractName, DeploymentInfo>> {
  const deployments: Partial<Record<ContractName, DeploymentInfo>> = {};

  // Deploy in order of dependencies
  const deploymentOrder: ContractName[] = [
    "main",
    "role",
    "accessControl",
    "auditLog",
    "propertyRegistry",
    "verification",
    "fractionalToken",
    "marketplace",
    "escrow",
  ];

  for (const contractName of deploymentOrder) {
    try {
      const info = await deployContractByName({ wallet, contractName });
      deployments[contractName] = info;
      await saveDeploymentInfo(contractName, info);
    } catch (error) {
      console.error(` Failed to deploy ${contractName}:`, error);
      throw error;
    }
  }

  return deployments as Record<ContractName, DeploymentInfo>;
}
