import { WalletBuilder } from "@midnight-ntwrk/wallet";
import { httpClientProofProvider } from "@midnight-ntwrk/midnight-js-http-client-proof-provider";
import { indexerPublicDataProvider } from "@midnight-ntwrk/midnight-js-indexer-public-data-provider";
import { NodeZkConfigProvider } from "@midnight-ntwrk/midnight-js-node-zk-config-provider";
import { levelPrivateStateProvider } from "@midnight-ntwrk/midnight-js-level-private-state-provider";
import {
  NetworkId,
  setNetworkId,
  getZswapNetworkId,
} from "@midnight-ntwrk/midnight-js-network-id";
import { nativeToken } from "@midnight-ntwrk/ledger";
import { WebSocket } from "ws";
import * as fs from "fs";
import * as path from "path";
import * as readline from "readline/promises";
import * as Rx from "rxjs";
import { 
  validateAddress, 
  validateAmount, 
  validateShares, 
  validatePropertyId,
  validateContractAddress,
  handleContractError,
  mapErrorForFrontend,
  BrickChainError,
  ErrorCode
} from "./errors.js";

// Fix WebSocket for Node.js environment
// @ts-ignore
globalThis.WebSocket = WebSocket;

// Configure for Midnight Testnet
setNetworkId(NetworkId.TestNet);

// Testnet connection endpoints
const TESTNET_CONFIG = {
  indexer: "https://indexer.testnet-02.midnight.network/api/v1/graphql",
  indexerWS: "wss://indexer.testnet-02.midnight.network/api/v1/graphql/ws",
  node: "https://rpc.testnet-02.midnight.network",
  proofServer: "http://127.0.0.1:6300",
};

interface ContractInteraction {
  name: string;
  description: string;
  action: (contract: any, wallet: any) => Promise<void>;
}

const INTERACTIONS: ContractInteraction[] = [
  {
    name: "getSystemStatus",
    description: "Get current system status",
    action: async (contract, wallet) => {
      console.log("Fetching system status...");
      try {
        validateContractAddress(contract.address, 'main');
        const status = await contract.getSystemStatus();
        console.log("✅ System Status:", status);
        
        // Emit event for UI sync
        return {
          success: true,
          data: status,
          event: 'SYSTEM_STATUS_FETCHED'
        };
      } catch (error) {
        const mappedError = error instanceof BrickChainError 
          ? mapErrorForFrontend(error)
          : { code: ErrorCode.UNKNOWN_ERROR, message: error.message, userMessage: "Failed to fetch system status" };
        
        console.error("❌ Failed to get system status:", mappedError.userMessage);
        return {
          success: false,
          error: mappedError
        };
      }
    }
  },
  {
    name: "registerProperty",
    description: "Register a new property",
    action: async (contract, wallet) => {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      try {
        const cid = await rl.question("Enter property IPFS CID: ");
        const fileName = await rl.question("Enter file name: ");
        const propertyType = await rl.question("Enter property type: ");
        const location = await rl.question("Enter location: ");
        const valuationInput = await rl.question("Enter valuation (in wei): ");
        const totalSharesInput = await rl.question("Enter total shares: ");

        // Validate inputs
        validateAddress(wallet.address);
        validateAmount(BigInt(valuationInput));
        validateShares(parseInt(totalSharesInput));

        const propertyDetails = {
          cid: cid.trim(),
          fileName: fileName.trim(),
          uploader: wallet.address,
          uploadedAt: Date.now(),
          propertyType: propertyType.trim(),
          location: location.trim(),
          valuation: BigInt(valuationInput),
          isActive: true
        };

        console.log("🏠 Registering property...");
        const result = await contract.registerProperty(
          propertyDetails,
          wallet.address,
          parseInt(totalSharesInput),
          true, // publishPublicCID
          "true" // authProof
        );
        
        console.log("✅ Property registered successfully:", result);
        return {
          success: true,
          data: result,
          event: 'PROPERTY_REGISTERED'
        };
      } catch (error) {
        const mappedError = error instanceof BrickChainError 
          ? mapErrorForFrontend(error)
          : { code: ErrorCode.UNKNOWN_ERROR, message: error.message, userMessage: "Failed to register property" };
        
        console.error("❌ Failed to register property:", mappedError.userMessage);
        return {
          success: false,
          error: mappedError
        };
      } finally {
        rl.close();
      }
    }
  },
  {
    name: "createListing",
    description: "Create a marketplace listing",
    action: async (contract, wallet) => {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      try {
        const pid = await rl.question("Enter property ID: ");
        const shareAmount = await rl.question("Enter share amount: ");
        const pricePerShare = await rl.question("Enter price per share (in wei): ");
        const isFullSale = await rl.question("Is this a full sale? (y/n): ");
        const expiresIn = await rl.question("Expires in how many days? ");

        const expiresAt = Math.floor(Date.now() / 1000) + (parseInt(expiresIn) * 24 * 60 * 60);

        console.log("Creating listing...");
        const result = await contract.createListing(
          parseInt(pid),
          wallet.address,
          parseInt(shareAmount),
          BigInt(pricePerShare),
          isFullSale.toLowerCase() === 'y',
          expiresAt,
          "true" // authProof
        );
        
        console.log("Listing created successfully:", result);
      } catch (error) {
        console.error("Failed to create listing:", error);
      } finally {
        rl.close();
      }
    }
  }
];

async function main() {
  console.log("BrickChain Contract Interaction Tool\n");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  try {
    // Check deployment
    const deploymentPath = path.join(process.cwd(), "deployment.json");
    if (!fs.existsSync(deploymentPath)) {
      console.error("No deployment found! Run: npm run deploy first");
      process.exit(1);
    }

    const deployment = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
    console.log("Found contracts:", Object.keys(deployment.contracts || {}));

    // Get wallet seed
    const walletSeed = await rl.question("Enter your wallet seed: ");

    // Build wallet
    console.log("Building wallet...");
    const wallet = await WalletBuilder.buildFromSeed(
      TESTNET_CONFIG.indexer,
      TESTNET_CONFIG.indexerWS,
      TESTNET_CONFIG.proofServer,
      TESTNET_CONFIG.node,
      walletSeed,
      getZswapNetworkId(),
      "info"
    );

    wallet.start();
    const state = await Rx.firstValueFrom(wallet.state());

    console.log(`Wallet address: ${state.address}`);
    const balance = state.balances[nativeToken()] || 0n;
    console.log(`Balance: ${balance}`);

    if (balance === 0n) {
      console.error("Insufficient balance for interactions");
      process.exit(1);
    }

    // Load contract
    const contractPath = path.join(process.cwd(), "build");
    const mainContractPath = path.join(contractPath, "main", "contract", "index.cjs");
    
    if (!fs.existsSync(mainContractPath)) {
      console.error("Contract not found! Ensure it's compiled and deployed");
      process.exit(1);
    }

    const contractModule = await import(mainContractPath);
    const contract = contractModule.contract;

    // Show available interactions
    console.log("\nAvailable interactions:");
    INTERACTIONS.forEach((interaction, index) => {
      console.log(`${index + 1}. ${interaction.name} - ${interaction.description}`);
    });

    const choice = await rl.question("\nSelect an interaction (1-" + INTERACTIONS.length + "): ");
    const selectedInteraction = INTERACTIONS[parseInt(choice) - 1];

    if (!selectedInteraction) {
      console.error("Invalid choice");
      process.exit(1);
    }

    console.log(`\nExecuting: ${selectedInteraction.name}`);
    await selectedInteraction.action(contract, { address: state.address });

    await wallet.close();
  } catch (error) {
    console.error("Interaction failed:", error);
  } finally {
    rl.close();
  }
}

main().catch(console.error);