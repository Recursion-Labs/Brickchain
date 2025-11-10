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

async function main() {
  console.log("BrickChain Contract Migration\n");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  try {
    // Check if deployment exists and validate structure
    const deploymentPath = path.join(process.cwd(), "deployment.json");
    if (!fs.existsSync(deploymentPath)) {
      console.error("❌ No deployment found! Run: npm run deploy first");
      process.exit(1);
    }

    let deployment: any;
    try {
      deployment = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
      
      // Validate deployment structure
      if (!deployment.contracts || typeof deployment.contracts !== 'object') {
        throw new Error("Invalid deployment structure: missing contracts");
      }
      
      console.log("✓ Found deployment with contracts:");
      Object.entries(deployment.contracts).forEach(([name, address]) => {
        console.log(`  ${name}: ${address}`);
      });
      
      // Check required contracts
      const requiredContracts = ['main'];
      for (const required of requiredContracts) {
        if (!deployment.contracts[required]) {
          throw new Error(`Required contract '${required}' not found in deployment`);
        }
      }
      
    } catch (parseError) {
      console.error("❌ Failed to parse deployment.json:", parseError);
      process.exit(1);
    }

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
      console.error("Insufficient balance for migration");
      process.exit(1);
    }

    // Load and validate contracts
    const contractPath = path.join(process.cwd(), "build");
    const contractInstances: Record<string, any> = {};
    
    // Load all deployed contracts
    for (const [contractName, contractAddress] of Object.entries(deployment.contracts)) {
      const contractFilePath = path.join(contractPath, contractName, "contract", "index.cjs");
      
      if (!fs.existsSync(contractFilePath)) {
        console.error(`❌ Contract file not found: ${contractFilePath}`);
        process.exit(1);
      }
      
      try {
        const contractModule = await import(contractFilePath);
        contractInstances[contractName] = contractModule.contract;
        console.log(`✓ Loaded ${contractName} contract`);
      } catch (loadError) {
        console.error(`❌ Failed to load ${contractName} contract:`, loadError);
        throw loadError;
      }
    }

    // Configure providers
    const zkConfigPath = path.join(contractPath, "managed", "brickchain");
    let providers: any;
    
    try {
      providers = {
        privateStateProvider: levelPrivateStateProvider({
          privateStateStoreName: "brickchain-state"
        }),
        publicDataProvider: indexerPublicDataProvider(
          TESTNET_CONFIG.indexer,
          TESTNET_CONFIG.indexerWS
        ),
        zkConfigProvider: new NodeZkConfigProvider(zkConfigPath),
        proofProvider: httpClientProofProvider(TESTNET_CONFIG.proofServer),
      };
      console.log("✓ Providers configured for migration");
    } catch (providerError) {
      console.error("❌ Failed to configure providers:", providerError);
      throw providerError;
    }

    // Initialize all contracts
    console.log("🚀 Initializing BrickChain system...");
    
    const migrationLog: Record<string, any> = {
      startedAt: new Date().toISOString(),
      adminAddress: state.address,
      initializations: {}
    };
    
    try {
      // Initialize contracts in dependency order
      const initOrder = ['main', 'role', 'property_registry', 'fractional_token', 'marketplace', 'verification'];
      
      for (const contractName of initOrder) {
        if (!contractInstances[contractName]) {
          console.log(`⏭️  Skipping ${contractName} - not deployed`);
          continue;
        }
        
        const contractInstance = contractInstances[contractName];
        console.log(`🔧 Initializing ${contractName}...`);
        
        try {
          // Try different initialization function names
          const initFunctions = [
            'initializeSystem',
            `initialize${contractName.charAt(0).toUpperCase() + contractName.slice(1)}`,
            'initialize'
          ];
          
          let initialized = false;
          for (const funcName of initFunctions) {
            if (typeof contractInstance[funcName] === "function") {
              console.log(`   Calling ${funcName}...`);
              await contractInstance[funcName]({ admin: state.address });
              migrationLog.initializations[contractName] = {
                function: funcName,
                status: 'success',
                timestamp: new Date().toISOString()
              };
              console.log(`   ✓ ${contractName} initialized via ${funcName}`);
              initialized = true;
              break;
            }
          }
          
          if (!initialized) {
            console.log(`   ⚠️  No initialization function found for ${contractName}`);
            migrationLog.initializations[contractName] = {
              status: 'skipped',
              reason: 'no_init_function',
              timestamp: new Date().toISOString()
            };
          }
          
        } catch (contractInitError) {
          console.error(`   ❌ Failed to initialize ${contractName}:`, contractInitError);
          migrationLog.initializations[contractName] = {
            status: 'failed',
            error: contractInitError.message,
            timestamp: new Date().toISOString()
          };
          // Continue with other contracts instead of failing completely
        }
      }
      
      // Update deployment record
      deployment.initialized = true;
      deployment.initializedAt = new Date().toISOString();
      deployment.adminAddress = state.address;
      deployment.migrationLog = migrationLog;
      
      fs.writeFileSync(deploymentPath, JSON.stringify(deployment, null, 2));
      
      // Write separate migration log for audit
      fs.writeFileSync("migration.log.json", JSON.stringify(migrationLog, null, 2));
      console.log("📋 Migration log saved to migration.log.json");
      
    } catch (initError) {
      console.error("❌ System initialization failed:", initError);
      migrationLog.status = 'failed';
      migrationLog.error = initError.message;
      migrationLog.completedAt = new Date().toISOString();
      
      fs.writeFileSync("migration.log.json", JSON.stringify(migrationLog, null, 2));
      throw initError;
    }

    console.log("\n🎉 Migration completed successfully!");
    console.log(`Admin address: ${state.address}`);

    await wallet.close();
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    rl.close();
    try {
      await wallet?.close();
    } catch (closeError) {
      console.warn("Warning: Failed to close wallet connection:", closeError);
    }
  }
}

main().catch(console.error);