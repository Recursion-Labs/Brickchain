import { WalletBuilder } from "@midnight-ntwrk/wallet";
import { deployContract } from "@midnight-ntwrk/midnight-js-contracts";
import { httpClientProofProvider } from "@midnight-ntwrk/midnight-js-http-client-proof-provider";
import { indexerPublicDataProvider } from "@midnight-ntwrk/midnight-js-indexer-public-data-provider";
import { NodeZkConfigProvider } from "@midnight-ntwrk/midnight-js-node-zk-config-provider";
import { levelPrivateStateProvider } from "@midnight-ntwrk/midnight-js-level-private-state-provider";
import {
  NetworkId,
  setNetworkId,
  getZswapNetworkId,
  getLedgerNetworkId,
} from "@midnight-ntwrk/midnight-js-network-id";
import { createBalancedTx } from "@midnight-ntwrk/midnight-js-types";
import { nativeToken, Transaction } from "@midnight-ntwrk/ledger";
import { Transaction as ZswapTransaction } from "@midnight-ntwrk/zswap";
import { WebSocket } from "ws";
import * as fs from "fs";
import * as path from "path";
import * as readline from "readline/promises";
import * as Rx from "rxjs";
import { type Wallet } from "@midnight-ntwrk/wallet-api";

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

const waitForFunds = (wallet: Wallet) =>
  Rx.firstValueFrom(
    wallet.state().pipe(
      Rx.tap((state) => {
        if (state.syncProgress) {
          console.log(
            `Sync progress: synced=${state.syncProgress.synced}, sourceGap=${state.syncProgress.lag.sourceGap}, applyGap=${state.syncProgress.lag.applyGap}`
          );
        }
      }),
      Rx.filter((state) => state.syncProgress?.synced === true),
      Rx.map((s) => s.balances[nativeToken()] ?? 0n),
      Rx.filter((balance) => balance > 0n),
      Rx.tap((balance) => console.log(`Wallet funded with balance: ${balance}`))
    )
  );


async function main() {
  console.log("Midnight Hello World Deployment\n");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  try {
    // Ask user if they have an existing wallet seed
    const choice = await rl.question("Do you have a wallet seed? (y/n): ");

    let walletSeed: string;
    if (choice.toLowerCase() === "y" || choice.toLowerCase() === "yes") {
      // Use existing seed
      walletSeed = await rl.question("Enter your 64-character seed: ");
    } else {
      // Generate new wallet seed
      const bytes = new Uint8Array(32);
      // @ts-ignore
      crypto.getRandomValues(bytes);
      walletSeed = Array.from(bytes, (b) =>
        b.toString(16).padStart(2, "0")
      ).join("");
      console.log(`\nSAVE THIS SEED: ${walletSeed}\n`);
    }

    // Rest of deployment logic follows...

    // Build wallet from seed
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

    console.log(`Your wallet address is: ${state.address}`);

    let balance = state.balances[nativeToken()] || 0n;

    if (balance === 0n) {
      console.log(`Your wallet balance is: 0`);
      console.log("Visit: https://midnight.network/test-faucet to get some funds.");
      console.log(`Waiting to receive tokens...`);
      balance = await waitForFunds(wallet);
    }

    console.log(`Balance: ${balance}`);



    // Load compiled contract files
    console.log("Loading contracts...");
    const contractPath = path.join(process.cwd(), "contracts");
    
    const contractConfigs = [
      { name: "main", path: "managed/main/contract/index.cjs", stateId: "brickchainMainState" },
      { name: "property_registry", path: "managed/property_registry/contract/index.cjs", stateId: "propertyRegistryState" },
      { name: "fractional_token", path: "managed/fractional_token/contract/index.cjs", stateId: "fractionalTokenState" },
      { name: "marketplace", path: "managed/marketplace/contract/index.cjs", stateId: "marketplaceState" },
      { name: "verification", path: "managed/verification/contract/index.cjs", stateId: "verificationState" },
      { name: "role", path: "managed/role/contract/index.cjs", stateId: "roleState" }
    ];

    // Validate all contract files exist before deployment
    for (const config of contractConfigs) {
      const contractModulePath = path.join(contractPath, config.path);
      if (!fs.existsSync(contractModulePath)) {
        console.error(`Contract ${config.name} not found at ${contractModulePath}! Run: npm run compile`);
        process.exit(1);
      }
    }

    console.log("All contract files validated. Starting deployment...");

    // Create wallet provider for transactions
    const walletState = await Rx.firstValueFrom(wallet.state());

    const walletProvider = {
      coinPublicKey: walletState.coinPublicKey,
      encryptionPublicKey: walletState.encryptionPublicKey,
      balanceTx(tx: any, newCoins: any) {
        return wallet
          .balanceTransaction(
            ZswapTransaction.deserialize(
              tx.serialize(getLedgerNetworkId()),
              getZswapNetworkId()
            ),
            newCoins
          )
          .then((tx) => wallet.proveTransaction(tx))
          .then((zswapTx) =>
            Transaction.deserialize(
              zswapTx.serialize(getZswapNetworkId()),
              getLedgerNetworkId()
            )
          )
          .then(createBalancedTx);
      },
      submitTx(tx: any) {
        return wallet.submitTransaction(tx);
      }
    };


    // Configure all required providers
    console.log("Setting up providers...");


    // Deploy all contracts
    console.log("Starting contract deployment (30-60 seconds per contract)...");
    
    const deployedAddresses: Record<string, string> = {};
    
    for (const config of contractConfigs) {
      const contractModulePath = path.join(contractPath, config.path);
      const zkConfigPath = path.join(contractPath, "managed", config.name);
      
      console.log(`\nDeploying ${config.name}...`);
      
      // Load contract module
      const ContractModule = await import(contractModulePath);
      const contractInstance = new ContractModule.Contract({});
      
      // Configure providers for this contract
      const providers = {
        privateStateProvider: levelPrivateStateProvider({
          privateStateStoreName: `${config.name}-state`
        }),
        publicDataProvider: indexerPublicDataProvider(
          TESTNET_CONFIG.indexer,
          TESTNET_CONFIG.indexerWS
        ),
        zkConfigProvider: new NodeZkConfigProvider(zkConfigPath),
        proofProvider: httpClientProofProvider(TESTNET_CONFIG.proofServer),
        walletProvider: walletProvider,
        midnightProvider: walletProvider
      };
      
      // Deploy contract to blockchain
      const deployed = await deployContract(providers, {
        contract: contractInstance,
        privateStateId: config.stateId,
        initialPrivateState: {}
      });
      
      const contractAddress = deployed.deployTxData.public.contractAddress;
      deployedAddresses[config.name] = contractAddress;
      console.log(`✓ ${config.name} deployed at: ${contractAddress}`);
    }

    // Save deployment information
    console.log("\nDEPLOYED!");
    console.log("Contracts:");
    Object.entries(deployedAddresses).forEach(([name, address]) => {
      console.log(`  ${name}: ${address}`);
    });

    const info = {
      contracts: deployedAddresses,
      deployedAt: new Date().toISOString(),
      network: "testnet",
      deployer: walletState.address
    };

    fs.writeFileSync("deployment.json", JSON.stringify(info, null, 2));
    console.log("\nSaved to deployment.json");
    
    // Close wallet connection
    await wallet.close();

  } catch (error) {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  } finally {
    rl.close();
  }
}

main().catch(console.error);