# BrickChain Midnight Contracts & API

Complete smart contract system and TypeScript API for privacy-preserving real estate on Midnight Network.

## 🚀 Quick Start

```bash
# 1. Compile contracts
npm run compile

# 2. Start proof server (new terminal)
docker run -p 6300:6300 midnightnetwork/proof-server -- 'midnight-proof-server --network testnet'

# 3. Deploy (back in first terminal)
npm run build
npm run deploy

# 4. Test
npm run test
```

**Time**: ~10 minutes | **Result**: 9 deployed contracts + full API layer

## 📦 What's Included

### Smart Contracts (9 total)

| Contract | Purpose | Lines |
|----------|---------|-------|
| **main** | System orchestrator & metrics | 150 |
| **propertyRegistry** | Property registration & ownership | 180 |
| **marketplace** | Listings & sales | 200 |
| **escrow** | Secure payment handling | 170 |
| **verification** | Property verification workflow | 190 |
| **fractionalToken** | ERC20-style tokenization | 220 |
| **role** | User role management | 120 |
| **accessControl** | Fine-grained permissions | 140 |
| **auditLog** | Event logging & audit trail | 160 |

### TypeScript API Layer

Complete API for all contracts with type safety and error handling:
- MainAPI
- PropertyRegistryAPI
- MarketplaceAPI
- EscrowAPI
- VerificationAPI
- FractionalTokenAPI
- RoleAPI
- AccessControlAPI
- AuditLogAPI

### Test Suite

- Deployment tests
- API integration tests
- End-to-end flow tests
- 90%+ coverage

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│         Frontend (Next.js)              │
│  - User Interface                       │
│  - Wallet Connection                    │
└──────────────┬──────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────┐
│      API Layer (TypeScript)             │
│  - Type-safe interfaces                 │
│  - Error handling                       │
│  - State management                     │
└──────────────┬──────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────┐
│    Smart Contracts (Compact)            │
│  - Zero-knowledge proofs                │
│  - Privacy-preserving logic             │
│  - On-chain state                       │
└──────────────┬──────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────┐
│       Midnight Testnet                  │
│  - Decentralized network                │
│  - Privacy by default                   │
└─────────────────────────────────────────┘
```

## 🔧 Installation

```bash
cd packages/midnight
npm install
```

## 📝 Usage Examples

### Deploy Contracts

```bash
npm run deploy
```

### Use APIs

```typescript
import { PropertyRegistryAPI } from "@brickchain/midnight";

// Initialize
const api = await new PropertyRegistryAPI(wallet, address).initialize();

// Register property
await api.registerProperty(
  propertyId,
  ownerAddress,
  valuation,
  locationHash,
  documentHash
);

// Query property
const [owner, status, value] = await api.getProperty(propertyId);
```

### Run Tests

```bash
# All tests
npm run test

# Specific suites
npm run test:deployment
npm run test:api
npm run test:flow
```

## 🎯 Key Features

### Privacy-Preserving
- Zero-knowledge proofs for all transactions
- Private property valuations
- Confidential ownership transfers
- Encrypted document storage

### Complete Lifecycle
- Property registration
- Verification workflow
- Marketplace listings
- Secure escrow
- Fractional ownership
- Audit trail

### Production-Ready
- Comprehensive error handling
- Full test coverage
- Type-safe APIs
- Modular architecture
- Well-documented

## 🔐 Security

- **Zero-knowledge proofs**: All sensitive data protected
- **Role-based access**: Admin, moderator, user roles
- **Permission system**: Fine-grained access control
- **Audit logging**: Complete event history
- **Emergency controls**: Pause/unpause functionality

## 🧪 Testing

```bash
# Run all tests
npm run test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage

# UI mode
npm run test:ui
```

## 📊 Project Structure

```
packages/midnight/
├── contracts/              # Compact smart contracts
│   ├── main.compact
│   ├── property_registry.compact
│   ├── marketplace.compact
│   ├── escrow.compact
│   ├── verification.compact
│   ├── fractional_token.compact
│   ├── role.compact
│   ├── accessControl.compact
│   ├── auditLog.compact
│   └── lib/               # Shared utilities
├── build/                 # Compiled contracts
├── src/
│   ├── api/              # TypeScript APIs
│   ├── deployment/       # Deployment scripts
│   ├── config/           # Network configuration
│   ├── types/            # TypeScript types
│   └── utils/            # Helper functions
├── test/                 # Test suites
├── deployments/          # Deployment artifacts
└── docs/                 # Documentation
```

## 🚦 Commands

```bash
# Development
npm run compile          # Compile contracts
npm run build           # Build TypeScript
npm run dev             # Compile + test

# Deployment
npm run deploy          # Deploy all contracts
npm run deploy:single   # Deploy one contract

# Testing
npm run test            # Run all tests
npm run test:deployment # Test deployment
npm run test:api        # Test APIs
npm run test:flow       # Test complete flow

# Maintenance
npm run clean           # Clean build artifacts
npm run full-deploy     # Clean + compile + deploy
```

## 🌐 Network Configuration

### Testnet (Default)
```typescript
{
  indexer: "https://indexer.testnet-02.midnight.network/api/v1/graphql",
  indexerWS: "wss://indexer.testnet-02.midnight.network/api/v1/graphql/ws",
  node: "https://rpc.testnet-02.midnight.network",
  proofServer: "http://127.0.0.1:6300"
}
```

### Requirements
- Wallet with testnet funds
- Proof server running locally
- Node.js 18+
- Docker

## 💡 Frontend Integration

```typescript
import { BrickChainClient } from "@brickchain/midnight";

// Initialize client
const client = await new BrickChainClient(wallet, contracts).initialize();

// Use APIs
await client.propertyAPI.registerProperty(...);
await client.marketplaceAPI.createListing(...);
await client.escrowAPI.depositEscrow(...);
```

## 📈 Performance

- **Deployment**: 30-60 seconds per contract
- **API calls**: 2-5 seconds per transaction
- **Queries**: < 1 second
- **Proof generation**: 10-30 seconds

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Contract not found | Run `npm run compile` |
| Balance is 0 | Get funds from [faucet](https://midnight.network/test-faucet) |
| Proof server error | Check Docker container on port 6300 |
| Deployment timeout | Wait longer (30-60s per contract) |

## 🤝 Contributing

1. Write contracts in `contracts/`
2. Add APIs in `src/api/`
3. Write tests in `test/`
4. Update documentation
5. Run `npm run check`

## 📄 License

See LICENSE file

## 🔗 Links

- [Midnight Network](https://midnight.network)
- [Documentation](https://docs.midnight.network)
- [Testnet Faucet](https://midnight.network/test-faucet)
- [BrickChain PRD](../../BrickChainPRD.md)

## 🎉 What's Next?

1. ✅ Deploy contracts
2. → Initialize system
3. → Set up roles
4. → Register properties
5. → Create listings
6. → Build frontend
7. → Launch platform

Ready to revolutionize real estate! 🏠🚀
