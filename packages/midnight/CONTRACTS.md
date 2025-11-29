# BrickChain Smart Contracts Documentation

## Overview

BrickChain is a production-grade smart contract system built on the Midnight blockchain using the Compact language. The architecture is modular and comprehensive, managing property registration, tokenization, marketplace operations, escrow services, verification, and access control.

**Total Contracts:** 11 files (9 core contracts + 2 library files)
**Language:** Compact (Midnight blockchain)
**Version:** Language 0.16 - 0.18

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Core Contracts](#core-contracts)
3. [Library Contracts](#library-contracts)
4. [Contract Interactions](#contract-interactions)
5. [Common Patterns](#common-patterns)
6. [Ledger State Management](#ledger-state-management)
7. [Security Features](#security-features)
8. [Fee Management](#fee-management)

---

## Architecture Overview

### System Design

The BrickChain system follows a layered architecture:

```
┌─────────────────────────────────────────────────────────┐
│           APPLICATION LAYER                             │
│  (Frontend/API interactions)                             │
└────────────────┬────────────────────────────────────────┘
                 │
┌────────────────┴────────────────────────────────────────┐
│         ORCHESTRATION LAYER                              │
│  Main Contract (System State & Metrics)                  │
└────────────────┬────────────────────────────────────────┘
                 │
    ┌────────────┼────────────────────────┐
    │            │                        │
┌───▼───┐  ┌────▼─────┐  ┌──────────┐  ┌─▼──────────┐
│ Role  │  │ Access   │  │ Audit    │  │ Registry   │
│ Mgmt  │  │ Control  │  │ Log      │  │ & Props    │
└─────┬─┘  └────┬─────┘  └──┬───────┘  └─┬──────────┘
      │         │           │           │
      └─────────┼───────────┼───────────┘
                │           │
         ┌──────┴──────┐    │
         │             │    │
    ┌────▼────┐  ┌────▼────┴────┐
    │ Tokens  │  │ Marketplace  │
    │ & Assets│  │ & Escrow     │
    └────┬────┘  └────┬────┬────┘
         │            │    │
         └────────────┼────┴─────┐
                      │          │
              ┌───────▼────┐  ┌──▼─────────┐
              │Verification│  │ Fee System │
              │Service     │  │& Payments  │
              └────────────┘  └────────────┘

         ┌────────────────────────────────┐
         │  LIBRARY LAYER                 │
         │  Types & Utilities             │
         └────────────────────────────────┘
```

---

## Core Contracts

### 1. Main Contract (main.compact)

**Purpose:** Central orchestrator for the entire BrickChain system

**Key Responsibilities:**
- System initialization and lifecycle management
- Emergency controls (pause/unpause)
- System metrics tracking (users, properties, transactions, fees)
- Admin management and transfer
- Contract version tracking

**Ledgers:**
- `system_initialized` - Boolean flag for initialization state
- `emergency_paused` - Boolean flag for emergency pause
- `admin_address` - Admin wallet address
- `system_metrics` - Map for custom system metrics
- `contract_versions` - Map for contract version tracking
- `system_event_counter` - Counter for all system events
- `total_users_count` - Total user count
- `total_properties_count` - Total property count
- `total_transactions_count` - Total transaction count
- `system_fees_collected` - Accumulated system fees

**Key Circuits (Methods):**
```
Initialization:
  - initializeSystem(admin)

Emergency Control:
  - emergencyPause(caller)
  - emergencyUnpause(caller)
  - getSystemStatus() → [initialized, paused, admin]
  - isSystemOperational() → [operational]

Metrics Management:
  - incrementUserCount(caller)
  - incrementPropertyCount(caller)
  - incrementTransactionCount(caller)
  - getTotalUsers() → count
  - getTotalProperties() → count
  - getTotalTransactions() → count
  - updateMetric(key, value, caller)
  - getMetric(key) → value
  - incrementMetric(key, amount, caller)

Fee Management:
  - collectSystemFees(amount, caller)
  - getCollectedFees() → amount
  - withdrawCollectedFees(caller) → amount

Admin Management:
  - transferAdmin(new_admin, caller)

Version Management:
  - registerContractVersion(name, version, caller)
  - getContractVersion(name) → version
```

---

### 2. Role Contract (role.compact)

**Purpose:** Manages user roles and access levels in the system

**Key Responsibilities:**
- User role assignment and management
- Admin verification and access control
- Emergency pause capability for role changes

**Enums:**
```
enum Role {
  USER,       // Standard user
  ADMIN,      // Administrative access
  MODERATOR   // Moderation capabilities
}
```

**Ledgers:**
- `user_roles` - Map of user addresses to their roles
- `admin_address` - Primary admin address
- `is_initialized` - Initialization flag
- `role_counter` - Counter for role changes (audit trail)
- `is_paused` - Emergency pause flag

**Key Circuits:**
```
Initialization:
  - initialize_roles(admin)

Role Management:
  - set_role(user, role, caller)
  - get_user_role(user) → role
  - remove_role(user, caller)
  - is_user_admin(user) → [is_admin]

Admin Management:
  - transfer_admin(new_admin, caller)

Emergency Controls:
  - pause_contract(caller)
  - unpause_contract(caller)
```

---

### 3. AccessControl Contract (accessControl.compact)

**Purpose:** Fine-grained permission and access control management

**Key Responsibilities:**
- Permission grant and revocation
- Resource-level access control
- Permission type management (READ, WRITE, EXECUTE, etc.)
- Authorization checks

**Enums:**
```
enum Permission {
  READ,       // Read-only access
  WRITE,      // Write/modify access
  EXECUTE,    // Execute/invoke access
  ADMIN,      // Administrative access
  MODERATOR,  // Moderation access
  TRANSFER,   // Transfer capabilities
  BURN        // Burn/destroy capabilities
}
```

**Ledgers:**
- `user_permissions` - Nested map: user → resource → has_permission
- `resource_permissions` - Nested map: resource → permission → enabled
- `permission_grants` - Map tracking permission grants
- `permission_history` - Permission change history
- `access_control_initialized` - Initialization flag
- `admin_address` - Admin address
- `access_paused` - Pause flag
- Counters: `permission_counter`, `grant_counter`, `revoke_counter`

**Key Circuits:**
```
Initialization:
  - initializeAccessControl(admin)

Permission Management:
  - grantPermission(grant_id, user, resource_id, caller)
  - revokePermission(grant_id, user, caller)
  - hasReadPermission(user, resource_id) → [has_permission]
  - hasWritePermission(user, resource_id) → [has_permission]
  - hasExecutePermission(user, resource_id) → [has_permission]

Resource Permissions:
  - enableResourcePermission(resource_id, permission, caller)
  - disableResourcePermission(resource_id, permission, caller)

Emergency Controls:
  - pauseAccessControl(caller)
  - unpauseAccessControl(caller)

Admin Management:
  - transferAdminRights(new_admin, caller)
```

---

### 4. AuditLog Contract (auditLog.compact)

**Purpose:** Immutable event logging and compliance tracking

**Key Responsibilities:**
- Record all system events and transactions
- Maintain audit trail for compliance
- Track event statistics by type and actor
- Support failed transaction marking

**Enums:**
```
enum EventType {
  PropertyRegistered,    // Property registration
  PropertyVerified,      // Property verification
  PropertyTokenized,     // Property tokenization
  ListingCreated,        // Listing creation
  ListingSold,           // Listing sold
  TransactionCompleted,  // Transaction completion
  UserRoleChanged,       // Role change
  AdminAction,           // Administrative action
  EmergencyPause,        // Emergency pause
  FeeCollected,          // Fee collection
  DisputeFiled,          // Dispute filed
  DisputeResolved        // Dispute resolved
}
```

**Ledgers:**
- `audit_entries` - Map: entry_id → event_type
- `entry_actors` - Map: entry_id → actor_address
- `entry_targets` - Map: entry_id → target_id
- `entry_details` - Map: entry_id → details_hash
- `entry_timestamps` - Map: entry_id → timestamp
- `entry_statuses` - Map: entry_id → success/failure
- `audit_initialized` - Initialization flag
- `admin_address` - Admin address
- `audit_paused` - Pause flag
- `total_entries` - Entry counter
- `entries_by_type` - Statistics map: event_type → count
- `entries_by_actor` - Statistics map: actor → count

**Key Circuits:**
```
Initialization:
  - initializeAudit(admin)

Event Logging:
  - logPropertyEvent(entry_id, type, property_id, actor, timestamp)
  - logTransactionEvent(entry_id, type, tx_id, actor, counterparty, amount, timestamp)
  - logAdminAction(entry_id, action_type, admin, target, details_hash, timestamp)
  - markEntryFailed(entry_id, caller)

Queries:
  - getAuditEntry(entry_id) → [type, actor, target, timestamp, status]
  - getEventTypeCount(event_type) → count
  - getActorEventCount(actor) → count
  - getTotalEntries() → count

Emergency Controls:
  - pauseAudit(caller)
  - unpauseAudit(caller)
```

---

### 5. PropertyRegistry Contract (property_registry.compact)

**Purpose:** Central registry for property ownership and lifecycle management

**Key Responsibilities:**
- Property registration with metadata
- Property status lifecycle management
- Ownership transfer and verification
- Registration fee collection
- Property metadata storage

**Enums:**
```
enum PropertyStatus {
  Registered,   // Newly registered
  Verified,     // Verified by validator
  Tokenized,    // Converted to tokens
  Listed,       // Listed on marketplace
  Sold,         // Sold/transferred
  Deactivated   // No longer active
}
```

**Ledgers:**
- `property_owners` - Map: property_id → owner_address
- `property_statuses` - Map: property_id → status
- `property_values` - Map: property_id → valuation
- `property_locations` - Map: property_id → location_hash
- `property_documents` - Map: property_id → document_hash
- `registry_initialized` - Initialization flag
- `registration_fee` - Fee amount in wei
- `registry_paused` - Pause flag
- `admin_address` - Admin address
- `collected_fees` - Accumulated registration fees
- `property_counter` - Property count (audit)
- `property_history` - Map: property_id → update_count

**Key Circuits:**
```
Initialization:
  - initializeRegistry(admin)

Property Management:
  - registerProperty(property_id, owner, valuation, location_hash, document_hash)
  - updatePropertyStatus(property_id, new_status, caller)
  - getProperty(property_id) → [owner, status, value]
  - getPropertyMetadata(property_id) → [location, documents]
  - transferProperty(property_id, new_owner, caller)
  - verifyProperty(property_id, caller)

Fee Management:
  - setRegistrationFee(new_fee, caller)
  - getCollectedFees() → amount
  - withdrawCollectedFees(caller) → amount

Emergency Controls:
  - pauseRegistry(caller)
  - unpauseRegistry(caller)
```

---

### 6. FractionalToken Contract (fractional_token.compact)

**Purpose:** ERC20-style fungible token for property fractionalization

**Key Responsibilities:**
- Token supply management (mint/burn)
- Token transfers between holders
- Approval mechanism for spending
- Property-to-token mapping
- Holder tracking and transaction history

**Enums:**
```
enum TokenState {
  Active,      // Normal operations
  Paused,      // Operations frozen
  Frozen       // Permanently frozen
}

enum PropertyStatus {
  Registered,  // Registered property
  Tokenized,   // Tokenized
  Transferred, // Ownership transferred
  Deactivated  // No longer active
}
```

**Ledgers:**
- `total_supply` - Total tokens minted
- `circulating_supply` - Tokens in circulation
- `nonce` - Transaction counter
- `balances` - Map: holder → balance
- `token_state` - Current operational state
- `holder_count` - Number of token holders
- `holders` - Map: holder → is_holder
- `holder_history` - Map: holder → transaction_count
- `property_statuses` - Map: property_id → status
- `property_owners` - Map: property_id → owner
- `property_token_ids` - Map: property_id → token_id
- `property_history` - Map: property_id → update_count

**Key Circuits:**
```
Supply Management:
  - mint(to, amount)
  - burn(from, amount)

Transfer Operations:
  - transfer(from, to, amount)
  - approve(owner, spender, amount)

Token State:
  - pause_token()
  - unpause_token()

Query Functions:
  - balanceOf(holder) → balance
  - getTotalSupply() → supply
  - getCirculatingSupply() → supply
  - getTokenState() → state

Property Tokenization:
  - register_property(property_id, owner_id)
  - tokenize_property(property_id, token_id)
  - transfer_property_ownership(property_id, new_owner_id)
  - deactivate_property(property_id)
  - getPropertyStatus(property_id) → status
  - getPropertyOwner(property_id) → owner
```

---

### 7. Marketplace Contract (marketplace.compact)

**Purpose:** Property listing and sales management with fee collection

**Key Responsibilities:**
- Listing creation and lifecycle management
- Price updates and cancellations
- Purchase transactions with fee collection
- Listing status tracking
- Fee management for marketplace operations

**Enums:**
```
enum ListingStatus {
  Active,      // Currently listed
  Sold,        // Transaction completed
  Cancelled,   // Listing cancelled
  Expired      // Listing expired
}
```

**Ledgers:**
- `listing_sellers` - Map: listing_id → seller_address
- `listing_property_ids` - Map: listing_id → property_id
- `listing_prices` - Map: listing_id → price
- `listing_statuses` - Map: listing_id → status
- `listing_timestamps` - Map: listing_id → creation_time
- `listing_durations` - Map: listing_id → duration_seconds
- `listing_buyers` - Map: listing_id → buyer_address
- `marketplace_initialized` - Initialization flag
- `marketplace_fee` - Fee in basis points (e.g., 250 = 2.5%)
- `marketplace_paused` - Pause flag
- `admin_address` - Admin address
- `collected_fees` - Accumulated fees
- `listing_counter` - Listing count
- `transaction_counter` - Transaction count
- `listing_history` - Map: listing_id → update_count

**Key Circuits:**
```
Initialization:
  - initializeMarketplace(admin)

Listing Management:
  - createListing(listing_id, property_id, price, duration_seconds, timestamp, seller)
  - updateListing(listing_id, new_price, caller)
  - cancelListing(listing_id, caller)

Transactions:
  - purchaseListing(listing_id, buyer)

Queries:
  - getListing(listing_id) → [seller, property_id, price, status]
  - getListingDetails(listing_id) → [timestamp, duration]

Fee Management:
  - setMarketplaceFee(new_fee, caller)
  - collectFees(caller) → amount
  - getCollectedFees(caller) → amount

Emergency Controls:
  - pauseMarketplace(caller)
  - unpauseMarketplace(caller)
```

---

### 8. Escrow Contract (escrow.compact)

**Purpose:** Secure fund escrow for trusted transactions with dispute resolution

**Key Responsibilities:**
- Escrow deposit management
- Fund release upon transaction completion
- Dispute filing and resolution
- Fee collection for escrow services
- Buyer/seller protection mechanism

**Enums:**
```
enum EscrowStatus {
  Pending,     // Awaiting confirmation
  Deposited,   // Funds received
  Released,    // Released to seller
  Disputed,    // Under dispute
  Cancelled,   // Transaction cancelled
  Resolved     // Dispute resolved
}
```

**Ledgers:**
- `escrow_buyers` - Map: escrow_id → buyer_address
- `escrow_sellers` - Map: escrow_id → seller_address
- `escrow_amounts` - Map: escrow_id → amount
- `escrow_statuses` - Map: escrow_id → status
- `escrow_listing_ids` - Map: escrow_id → listing_id
- `escrow_created_at` - Map: escrow_id → creation_timestamp
- `escrow_released_at` - Map: escrow_id → release_timestamp
- `escrow_disputes` - Map: escrow_id → dispute_reason_hash
- `escrow_initialized` - Initialization flag
- `escrow_fee_percentage` - Fee in basis points (e.g., 100 = 1%)
- `escrow_paused` - Pause flag
- `admin_address` - Admin address
- `collected_fees` - Accumulated fees
- Counters: `escrow_counter`, `release_counter`, `dispute_counter`
- `escrow_history` - Map: escrow_id → update_count

**Key Circuits:**
```
Initialization:
  - initializeEscrow(admin)

Escrow Management:
  - depositEscrow(escrow_id, listing_id, seller, buyer, amount, timestamp)
  - releaseEscrow(escrow_id, caller, timestamp)

Dispute Handling:
  - fileDispute(escrow_id, dispute_reason, caller)
  - resolveDispute(escrow_id, release_to_seller, caller)

Queries:
  - getEscrow(escrow_id) → [buyer, seller, amount, status]
  - getEscrowTimestamps(escrow_id) → [created_at, released_at]

Fee Management:
  - setEscrowFee(new_fee, caller)
  - collectEscrowFees(caller) → amount

Emergency Controls:
  - pauseEscrow(caller)
  - unpauseEscrow(caller)
```

---

### 9. Verification Contract (verification.compact)

**Purpose:** Property verification workflow with verifier management and proof validation

**Key Responsibilities:**
- Verification request creation and tracking
- Verifier approval and management
- Verification workflow (pending → in-progress → approved/rejected)
- Zero-knowledge proof validation
- Fee management for verification services

**Enums:**
```
enum VerificationStatus {
  Pending,     // Awaiting verifier
  InProgress,  // Under review
  Approved,    // Verification approved
  Rejected,    // Verification rejected
  Expired      // Request expired
}
```

**Ledgers:**
- `verification_requesters` - Map: request_id → requester_address
- `verification_property_ids` - Map: request_id → property_id
- `verification_statuses` - Map: request_id → status
- `verification_timestamps` - Map: request_id → timestamp
- `verification_documents` - Map: request_id → document_hash
- `verification_results` - Map: request_id → result_hash
- `verification_verifiers` - Map: request_id → verifier_address
- `verification_history` - Map: request_id → update_count
- `verification_initialized` - Initialization flag
- `verification_fee` - Fee amount
- `verification_paused` - Pause flag
- `admin_address` - Admin address
- `verifier_addresses` - Map: verifier → is_approved
- `collected_fees` - Accumulated fees
- Counters: `request_counter`, `approved_count`, `rejected_count`

**Key Circuits:**
```
Initialization:
  - initializeVerification(admin)

Request Management:
  - requestVerification(request_id, property_id, document_hash, timestamp, requester)

Verifier Management:
  - approveVerifier(verifier, caller)
  - removeVerifier(verifier, caller)

Verification Workflow:
  - startVerification(request_id, verifier)
  - submitVerificationResult(request_id, result_hash, approved, verifier)

Proof Validation:
  - verifyProof(request_id, proof_data, caller) → verified

Queries:
  - getVerificationStatus(request_id) → [status, requester, property_id]
  - getVerificationResult(request_id) → result_hash
  - getVerificationStats() → [operational]

Fee Management:
  - setVerificationFee(new_fee, caller)
  - collectVerificationFee(amount, caller)
  - getCollectedFees() → amount
  - withdrawCollectedFees(caller) → amount

Emergency Controls:
  - pauseVerification(caller)
  - unpauseVerification(caller)
```

---

## Library Contracts

### 1. Types Contract (lib/types.compact)

**Purpose:** Common type definitions and system constants

**Functions:**
```
Default Values:
  - getDefaultRegistrationFee() → 1,000,000
  - getDefaultMarketplaceFee() → 250 (2.5%)
  - getDefaultEscrowFee() → 100 (1%)
  - getDefaultVerificationFee() → 500

Safety Limits:
  - getMaximumFeePercentage() → 1000 (10%)

Validation Utilities:
  - isValidAddress(address) → Boolean
  - isValidAmount(amount) → Boolean
  - isValidTimestamp(timestamp) → Boolean
  - isValidHash(hash) → Boolean

Permission Utilities:
  - requireAdmin(caller, admin) → []
  - requireInitialized(is_initialized) → []
  - requireNotPaused(is_paused) → []

Query Functions:
  - getBasisPointsMax() → 10000
  - calculatePercentage(amount, basis_points) → result
  - getZeroAddress() → 0
  - getEmptyHash() → 0x00...00
```

### 2. Utils Contract (lib/utils.compact)

**Purpose:** Production-grade utility functions for common operations

**Function Categories:**

```
Authorization:
  - verifyAuthorization(caller, authorized_user) → []
  - verifyAdminAuthorization(caller, admin) → []
  - verifyAddressMatch(address1, address2) → Boolean

State Transitions:
  - isValidStateTransition(from_state, to_state) → Boolean
  - getStateName(state) → name

Timestamp Operations:
  - isValidFutureTimestamp(timestamp) → Boolean
  - isTimestampValid(timestamp, current_time) → Boolean
  - calculateExpiryTime(base_time, duration) → expiry_time
  - isExpired(expiry_time, current_time) → Boolean

Calculations:
  - calculateFee(principal, basis_points) → fee
  - calculateNetAmount(principal, fee) → net
  - isAmountSufficientForFee(amount, fee) → Boolean
  - getMinimumTransactionAmount() → 1

Counter Management:
  - incrementCounter(count) → new_count
  - decrementCounter(count) → new_count
```

---

## Contract Interactions

### 1. Property Lifecycle Flow

```
┌──────────────┐
│   Register   │  Main + PropertyRegistry
│   Property   │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Verify     │  Verification Contract
│   Property   │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Tokenize    │  FractionalToken Contract
│  Property    │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   List on    │  Marketplace Contract
│  Marketplace │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Purchase   │  Escrow + Marketplace
│  with Escrow │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Audit &    │  AuditLog Contract
│    Record    │
└──────────────┘
```

### 2. Transaction Flow

```
User Action
    │
    ▼
Role & Access Check (Role + AccessControl)
    │
    ▼
Execute Circuit (Core Contract)
    │
    ▼
Update Ledger State
    │
    ▼
Log Event (AuditLog)
    │
    ▼
Emit Result
    │
    ▼
Update Metrics (Main)
```

### 3. Authorization Flow

```
        Caller
           │
           ▼
    ┌──────────────┐
    │ Check Role   │ Role Contract
    └──────┬───────┘
           │
           ▼
    ┌──────────────────┐
    │ Check Permissions│ AccessControl Contract
    └──────┬───────────┘
           │
           ▼
    ┌──────────────────┐
    │ Verify Admin?    │ Main/Core Contracts
    └──────┬───────────┘
           │
           ▼
    Proceed or Deny
```

---

## Common Patterns

### 1. Initialization Pattern

Every contract implements:
```
export circuit initialize[ContractName](admin: Uint<32>): [] {
    assert(!initialized, "Already initialized");
    assert(admin != 0, "Invalid admin");
    
    initialized = true;
    admin_address = disclose(admin);
}
```

### 2. Authorization Pattern

Every state-changing circuit includes:
```
export circuit action(caller: Uint<32>): [] {
    assert(initialized, "Not initialized");
    assert(!paused, "Contract paused");
    assert(caller == admin_address, "Unauthorized");
    
    // Perform action
}
```

### 3. Ledger Update Pattern

State changes follow:
```
export circuit updateState(id: Bytes<32>, value: NewValue): [] {
    assert(ledger.member(id), "Entry not found");
    
    ledger.insert(disclose(id), disclose(value));
    counter.increment(1);
    
    // Update history
    history_map.insert(id, count + 1);
}
```

### 4. Fee Collection Pattern

Fee-based operations implement:
```
export circuit collectFees(amount: Uint<64>, caller: Uint<32>): [] {
    assert(caller == admin, "Admin only");
    assert(amount > 0, "Invalid amount");
    
    collected_fees = (collected_fees + amount) as Uint<64>;
    counter.increment(1);
}
```

### 5. Pause/Unpause Pattern

Emergency controls implement:
```
export circuit pause(caller: Uint<32>): [] {
    assert(caller == admin, "Admin only");
    assert(!paused, "Already paused");
    
    paused = true;
    counter.increment(1);
}

export circuit unpause(caller: Uint<32>): [] {
    assert(caller == admin, "Admin only");
    assert(paused, "Not paused");
    
    paused = false;
    counter.increment(1);
}
```

---

## Ledger State Management

### 1. State Transition Rules

**Property States:**
```
Registered → Verified → Tokenized → Listed → Sold
                                ↓
                            Deactivated
```

**Escrow States:**
```
Pending → Deposited → Released
             ↓
          Disputed → Resolved
             ↓
           Cancelled
```

**Verification States:**
```
Pending → InProgress → Approved
             ↓
            Rejected
             ↓
           Expired
```

### 2. Ledger Types

**Simple State:**
```
export ledger flag: Boolean;
export ledger counter: Uint<64>;
```

**Maps (Key-Value):**
```
export ledger balances: Map<Uint<32>, Uint<64>>;        // user → balance
export ledger owners: Map<Bytes<32>, Uint<32>>;        // property → owner
export ledger statuses: Map<Bytes<32>, Status>;        // id → status
```

**Nested Maps:**
```
export ledger permissions: Map<Uint<32>, Map<Bytes<32>, Boolean>>;
// user → (resource → has_permission)
```

**Counters:**
```
export ledger event_counter: Counter;
// Tracks event count for audit trail
```

### 3. History Tracking

Most entities maintain history:
```
export ledger property_history: Map<Bytes<32>, Uint<64>>;
// property_id → number_of_updates

// Each update increments:
const count = property_history.lookup(property_id);
property_history.insert(property_id, count + 1);
```

---

## Security Features

### 1. Access Control

- **Role-Based Access:** USER, ADMIN, MODERATOR roles
- **Permission-Based Access:** Fine-grained permissions per resource
- **Admin-Only Functions:** Critical operations restricted to admin
- **Caller Verification:** All state-changing circuits verify caller identity

### 2. State Validation

- **Initialization Checks:** All circuits verify system initialization
- **Pause Checks:** Critical operations blocked when paused
- **State Transition Validation:** Only valid state transitions allowed
- **Ledger Member Checks:** Entry existence verified before operations

### 3. Emergency Controls

- **Emergency Pause:** System-wide pause capability for each contract
- **Emergency Unpause:** Admin can restore normal operations
- **Fail-Safe Defaults:** Operations fail securely on assertion failure

### 4. Immutable Audit Trail

- **Event Logging:** Every significant event logged
- **Timestamp Recording:** All events timestamped
- **Actor Tracking:** All operations track who performed them
- **Status Recording:** Success/failure status recorded

### 5. Privacy Features

- **Disclose Pattern:** Sensitive data wrapped in disclose() for privacy
- **Zero-Knowledge Proofs:** Verification supports ZK proofs
- **Private State:** Ledger state treated as private

### 6. Financial Security

- **Fee Management:** Transparent fee collection and withdrawal
- **Amount Validation:** All amounts validated as positive
- **Balance Verification:** Sufficient balance checked before operations
- **Overflow Protection:** Type safety prevents integer overflow

---

## Fee Management

### 1. Fee Configuration

```
Registration Fee:  1,000,000 wei (property registration)
Marketplace Fee:   250 basis points (2.5%)
Escrow Fee:        100 basis points (1%)
Verification Fee:  500 wei (per verification)
Maximum Fee:       1000 basis points (10% safety limit)
```

### 2. Fee Collection Points

| Event | Contract | Fee Amount | Receiver |
|-------|----------|-----------|----------|
| Property Registration | PropertyRegistry | Registration Fee | Admin |
| Marketplace Purchase | Marketplace | Marketplace Fee | Admin |
| Escrow Release | Escrow | Escrow Fee | Admin |
| Verification | Verification | Verification Fee | Admin |

### 3. Fee Withdrawal Process

```
Admin initiates withdrawal request
    │
    ▼
Contract validates admin authorization
    │
    ▼
Collect all accumulated fees
    │
    ▼
Reset fee counter to zero
    │
    ▼
Return fees to admin wallet
    │
    ▼
Log withdrawal event
```

---

## Deployment and Testing

### Compilation

```bash
npm run compile  # Compiles all contracts to build/
```

### Testing

```bash
npm run test     # Runs comprehensive test suite (91 tests)
npm run test:watch  # Run tests in watch mode
npm run test:coverage  # Generate coverage report
```

### Deployment

```bash
npm run deploy          # Deploy all contracts
npm run full-deploy     # Clean, compile, deploy, migrate
npm run migrate        # Run post-deployment migrations
```

---

## Best Practices

### 1. Circuit Development

- Always verify initialization before operations
- Check pause state for critical functions
- Use disclose() for privacy-sensitive data
- Include comprehensive assert statements
- Update counters for audit trail

### 2. Ledger Usage

- Use Maps for key-value state storage
- Maintain history maps for important entities
- Use Counters for tracking occurrences
- Check member() before lookup()
- Always insert with disclose() for privacy

### 3. Authorization

- Verify caller identity in state-changing circuits
- Check roles before granting permissions
- Verify admin status for admin-only operations
- Use util functions: verifyAdminAuthorization()

### 4. Fee Handling

- Calculate fees based on basis points
- Validate fee amounts before collection
- Maintain separate fee ledgers
- Log all fee collection events
- Provide withdrawal circuits for fee recovery

### 5. Testing

- Test initialization for each contract
- Test authorization checks
- Test state transitions
- Test edge cases (zero amounts, invalid IDs)
- Test pause/unpause functionality
- Verify audit logging

---

## Quick Reference

### Total Contracts: 11
- **Core Contracts:** 9
- **Library Contracts:** 2

### Total Circuits: 100+
### Total Ledgers: 130+
### Total Enums: 12

### Supported Roles: 3
### Permission Types: 7
### Event Types: 12

---

## Support & Maintenance

For issues or questions regarding the BrickChain contracts:

1. Review this documentation
2. Check the test suite for implementation examples
3. Examine contract comments for detailed explanations
4. Verify compilation with `npm run compile`
5. Run tests with `npm run test`

---

**Last Updated:** November 2025
**Language Version:** Compact 0.16 - 0.18
**Blockchain:** Midnight Network
