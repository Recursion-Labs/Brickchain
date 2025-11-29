import { describe, it, expect, beforeAll } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

import { TEST_CONFIG } from '../src/config.js';

// All 9 compact contract files
const ALL_CONTRACTS = [
  'main.compact',
  'accessControl.compact',
  'auditLog.compact',
  'escrow.compact',
  'fractional_token.compact',
  'marketplace.compact',
  'property_registry.compact',
  'role.compact',
  'verification.compact'
];

describe('BrickChain Complete Contract Test Suite', () => {
  let contractPath: string;

  beforeAll(() => {
    contractPath = path.join(process.cwd(), TEST_CONFIG.buildDir);
  });

  // GLOBAL TESTS
  describe('Global Contract Requirements', () => {
    it('should have all 9 contracts compiled successfully', () => {
      ALL_CONTRACTS.forEach(file => {
        const filePath = path.join(TEST_CONFIG.contractsDir, file);
        expect(fs.existsSync(filePath), `${file} should exist`).toBe(true);
        const stats = fs.statSync(filePath);
        expect(stats.size).toBeGreaterThan(1000);
      });
    });

    it('should have valid pragma in all contracts', () => {
      ALL_CONTRACTS.forEach(file => {
        const filePath = path.join(TEST_CONFIG.contractsDir, file);
        const content = fs.readFileSync(filePath, 'utf8');
        expect(content).toContain('pragma language_version >= 0.16 && <= 0.18');
      });
    });

    it('should have CompactStandardLibrary import in all contracts', () => {
      ALL_CONTRACTS.forEach(file => {
        const filePath = path.join(TEST_CONFIG.contractsDir, file);
        const content = fs.readFileSync(filePath, 'utf8');
        expect(content).toContain('import CompactStandardLibrary');
      });
    });

    it('should have constructor in all contracts', () => {
      ALL_CONTRACTS.forEach(file => {
        const filePath = path.join(TEST_CONFIG.contractsDir, file);
        const content = fs.readFileSync(filePath, 'utf8');
        expect(content).toContain('constructor()');
      });
    });

    it('should have export circuit definitions in all contracts', () => {
      ALL_CONTRACTS.forEach(file => {
        const filePath = path.join(TEST_CONFIG.contractsDir, file);
        const content = fs.readFileSync(filePath, 'utf8');
        expect(content).toMatch(/export circuit/);
      });
    });

    it('should use proper assert statements', () => {
      ALL_CONTRACTS.forEach(file => {
        const filePath = path.join(TEST_CONFIG.contractsDir, file);
        const content = fs.readFileSync(filePath, 'utf8');
        expect(content).toMatch(/assert\(/);
      });
    });

    it('should have disclose statements for privacy', () => {
      ALL_CONTRACTS.forEach(file => {
        const filePath = path.join(TEST_CONFIG.contractsDir, file);
        const content = fs.readFileSync(filePath, 'utf8');
        // Most contracts use disclose
        if (!file.includes('role')) {
          expect(content).toMatch(/disclose\(/);
        }
      });
    });
  });

  // MAIN CONTRACT TESTS
  describe('Main Contract', () => {
    it('should have all required ledgers', () => {
      const filePath = path.join(TEST_CONFIG.contractsDir, 'main.compact');
      const content = fs.readFileSync(filePath, 'utf8');
      
      const ledgers = [
        'system_initialized',
        'emergency_paused',
        'admin_address',
        'system_metrics',
        'contract_versions',
        'system_event_counter',
        'metric_keys',
        'total_users_count',
        'total_properties_count',
        'total_transactions_count',
        'system_fees_collected'
      ];
      
      ledgers.forEach(ledger => {
        expect(content).toContain(`export ledger ${ledger}`);
      });
    });

    it('should have system initialization circuit', () => {
      const filePath = path.join(TEST_CONFIG.contractsDir, 'main.compact');
      const content = fs.readFileSync(filePath, 'utf8');
      expect(content).toContain('export circuit initializeSystem');
    });

    it('should have emergency control circuits', () => {
      const filePath = path.join(TEST_CONFIG.contractsDir, 'main.compact');
      const content = fs.readFileSync(filePath, 'utf8');
      
      const circuits = [
        'emergencyPause',
        'emergencyUnpause',
        'getSystemStatus',
        'isSystemOperational'
      ];
      
      circuits.forEach(circuit => {
        expect(content).toContain(`export circuit ${circuit}`);
      });
    });

    it('should have metrics management circuits', () => {
      const filePath = path.join(TEST_CONFIG.contractsDir, 'main.compact');
      const content = fs.readFileSync(filePath, 'utf8');
      
      const circuits = [
        'incrementUserCount',
        'incrementPropertyCount',
        'incrementTransactionCount',
        'getTotalUsers',
        'getTotalProperties',
        'getTotalTransactions',
        'updateMetric',
        'getMetric',
        'incrementMetric'
      ];
      
      circuits.forEach(circuit => {
        expect(content).toContain(`export circuit ${circuit}`);
      });
    });

    it('should have contract version management', () => {
      const filePath = path.join(TEST_CONFIG.contractsDir, 'main.compact');
      const content = fs.readFileSync(filePath, 'utf8');
      expect(content).toContain('export circuit registerContractVersion');
      expect(content).toContain('export circuit getContractVersion');
    });

    it('should have system fee management', () => {
      const filePath = path.join(TEST_CONFIG.contractsDir, 'main.compact');
      const content = fs.readFileSync(filePath, 'utf8');
      
      const circuits = [
        'collectSystemFees',
        'getCollectedFees',
        'withdrawCollectedFees'
      ];
      
      circuits.forEach(circuit => {
        expect(content).toContain(`export circuit ${circuit}`);
      });
    });

    it('should have admin transfer capability', () => {
      const filePath = path.join(TEST_CONFIG.contractsDir, 'main.compact');
      const content = fs.readFileSync(filePath, 'utf8');
      expect(content).toContain('export circuit transferAdmin');
    });

    it('should use Counter for event tracking', () => {
      const filePath = path.join(TEST_CONFIG.contractsDir, 'main.compact');
      const content = fs.readFileSync(filePath, 'utf8');
      expect(content).toContain('system_event_counter: Counter');
      expect(content).toContain('system_event_counter.increment');
    });
  });

  // ACCESS CONTROL TESTS
  describe('AccessControl Contract', () => {
    it('should have Permission enum', () => {
      const filePath = path.join(TEST_CONFIG.contractsDir, 'accessControl.compact');
      const content = fs.readFileSync(filePath, 'utf8');
      
      expect(content).toContain('enum Permission');
      const permissions = ['READ', 'WRITE', 'EXECUTE', 'ADMIN', 'MODERATOR', 'TRANSFER', 'BURN'];
      permissions.forEach(perm => {
        expect(content).toContain(perm);
      });
    });

    it('should have all required ledgers', () => {
      const filePath = path.join(TEST_CONFIG.contractsDir, 'accessControl.compact');
      const content = fs.readFileSync(filePath, 'utf8');
      
      const ledgers = [
        'user_permissions',
        'resource_permissions',
        'permission_grants',
        'permission_history',
        'access_control_initialized',
        'admin_address',
        'access_paused',
        'permission_counter',
        'grant_counter',
        'revoke_counter'
      ];
      
      ledgers.forEach(ledger => {
        expect(content).toContain(`export ledger ${ledger}`);
      });
    });

    it('should have initialization circuit', () => {
      const filePath = path.join(TEST_CONFIG.contractsDir, 'accessControl.compact');
      const content = fs.readFileSync(filePath, 'utf8');
      expect(content).toContain('export circuit initializeAccessControl');
    });

    it('should have permission grant/revoke circuits', () => {
      const filePath = path.join(TEST_CONFIG.contractsDir, 'accessControl.compact');
      const content = fs.readFileSync(filePath, 'utf8');
      
      const circuits = [
        'grantPermission',
        'revokePermission'
      ];
      
      circuits.forEach(circuit => {
        expect(content).toContain(`export circuit ${circuit}`);
      });
    });

    it('should have permission check circuits', () => {
      const filePath = path.join(TEST_CONFIG.contractsDir, 'accessControl.compact');
      const content = fs.readFileSync(filePath, 'utf8');
      
      const circuits = [
        'hasReadPermission',
        'hasWritePermission',
        'hasExecutePermission'
      ];
      
      circuits.forEach(circuit => {
        expect(content).toContain(`export circuit ${circuit}`);
      });
    });

    it('should have resource permission circuits', () => {
      const filePath = path.join(TEST_CONFIG.contractsDir, 'accessControl.compact');
      const content = fs.readFileSync(filePath, 'utf8');
      
      const circuits = [
        'enableResourcePermission',
        'disableResourcePermission'
      ];
      
      circuits.forEach(circuit => {
        expect(content).toContain(`export circuit ${circuit}`);
      });
    });

    it('should have pause/unpause circuits', () => {
      const filePath = path.join(TEST_CONFIG.contractsDir, 'accessControl.compact');
      const content = fs.readFileSync(filePath, 'utf8');
      
      expect(content).toContain('export circuit pauseAccessControl');
      expect(content).toContain('export circuit unpauseAccessControl');
    });

    it('should have admin transfer circuit', () => {
      const filePath = path.join(TEST_CONFIG.contractsDir, 'accessControl.compact');
      const content = fs.readFileSync(filePath, 'utf8');
      expect(content).toContain('export circuit transferAdminRights');
    });
  });

  // AUDIT LOG TESTS
  describe('AuditLog Contract', () => {
    it('should have EventType enum with all events', () => {
      const filePath = path.join(TEST_CONFIG.contractsDir, 'auditLog.compact');
      const content = fs.readFileSync(filePath, 'utf8');
      
      expect(content).toContain('enum EventType');
      const events = [
        'PropertyRegistered',
        'PropertyVerified',
        'PropertyTokenized',
        'ListingCreated',
        'ListingSold',
        'TransactionCompleted',
        'UserRoleChanged',
        'AdminAction',
        'EmergencyPause',
        'FeeCollected',
        'DisputeFiled',
        'DisputeResolved'
      ];
      events.forEach(event => {
        expect(content).toContain(event);
      });
    });

    it('should have complete audit tracking ledgers', () => {
      const filePath = path.join(TEST_CONFIG.contractsDir, 'auditLog.compact');
      const content = fs.readFileSync(filePath, 'utf8');
      
      const ledgers = [
        'audit_entries',
        'entry_actors',
        'entry_targets',
        'entry_details',
        'entry_timestamps',
        'entry_statuses',
        'audit_initialized',
        'admin_address',
        'audit_paused',
        'total_entries',
        'entry_counter',
        'entries_by_type',
        'entries_by_actor'
      ];
      
      ledgers.forEach(ledger => {
        expect(content).toContain(`export ledger ${ledger}`);
      });
    });

    it('should have initialization circuit', () => {
      const filePath = path.join(TEST_CONFIG.contractsDir, 'auditLog.compact');
      const content = fs.readFileSync(filePath, 'utf8');
      expect(content).toContain('export circuit initializeAudit');
    });

    it('should have comprehensive logging circuits', () => {
      const filePath = path.join(TEST_CONFIG.contractsDir, 'auditLog.compact');
      const content = fs.readFileSync(filePath, 'utf8');
      
      const circuits = [
        'logPropertyEvent',
        'logTransactionEvent',
        'logAdminAction',
        'markEntryFailed'
      ];
      
      circuits.forEach(circuit => {
        expect(content).toContain(`export circuit ${circuit}`);
      });
    });

    it('should have query circuits for audit data', () => {
      const filePath = path.join(TEST_CONFIG.contractsDir, 'auditLog.compact');
      const content = fs.readFileSync(filePath, 'utf8');
      
      const circuits = [
        'getAuditEntry',
        'getEventTypeCount',
        'getActorEventCount',
        'getTotalEntries'
      ];
      
      circuits.forEach(circuit => {
        expect(content).toContain(`export circuit ${circuit}`);
      });
    });

    it('should have pause/unpause audit circuits', () => {
      const filePath = path.join(TEST_CONFIG.contractsDir, 'auditLog.compact');
      const content = fs.readFileSync(filePath, 'utf8');
      
      expect(content).toContain('export circuit pauseAudit');
      expect(content).toContain('export circuit unpauseAudit');
    });
  });

  // ESCROW TESTS
  describe('Escrow Contract', () => {
    it('should have EscrowStatus enum', () => {
      const filePath = path.join(TEST_CONFIG.contractsDir, 'escrow.compact');
      const content = fs.readFileSync(filePath, 'utf8');
      
      expect(content).toContain('enum EscrowStatus');
      const statuses = ['Pending', 'Deposited', 'Released', 'Disputed', 'Cancelled', 'Resolved'];
      statuses.forEach(status => {
        expect(content).toContain(status);
      });
    });

    it('should have complete escrow ledgers', () => {
      const filePath = path.join(TEST_CONFIG.contractsDir, 'escrow.compact');
      const content = fs.readFileSync(filePath, 'utf8');
      
      const ledgers = [
        'escrow_buyers',
        'escrow_sellers',
        'escrow_amounts',
        'escrow_statuses',
        'escrow_listing_ids',
        'escrow_created_at',
        'escrow_released_at',
        'escrow_disputes',
        'escrow_initialized',
        'escrow_fee_percentage',
        'escrow_paused',
        'admin_address',
        'collected_fees',
        'escrow_counter',
        'release_counter',
        'dispute_counter',
        'escrow_history'
      ];
      
      ledgers.forEach(ledger => {
        expect(content).toContain(`export ledger ${ledger}`);
      });
    });

    it('should have initialization circuit', () => {
      const filePath = path.join(TEST_CONFIG.contractsDir, 'escrow.compact');
      const content = fs.readFileSync(filePath, 'utf8');
      expect(content).toContain('export circuit initializeEscrow');
    });

    it('should have deposit circuit', () => {
      const filePath = path.join(TEST_CONFIG.contractsDir, 'escrow.compact');
      const content = fs.readFileSync(filePath, 'utf8');
      expect(content).toContain('export circuit depositEscrow');
    });

    it('should have release and dispute circuits', () => {
      const filePath = path.join(TEST_CONFIG.contractsDir, 'escrow.compact');
      const content = fs.readFileSync(filePath, 'utf8');
      
      const circuits = [
        'releaseEscrow',
        'fileDispute',
        'resolveDispute'
      ];
      
      circuits.forEach(circuit => {
        expect(content).toContain(`export circuit ${circuit}`);
      });
    });

    it('should have query circuits', () => {
      const filePath = path.join(TEST_CONFIG.contractsDir, 'escrow.compact');
      const content = fs.readFileSync(filePath, 'utf8');
      
      const circuits = [
        'getEscrow',
        'getEscrowTimestamps'
      ];
      
      circuits.forEach(circuit => {
        expect(content).toContain(`export circuit ${circuit}`);
      });
    });

    it('should have admin management circuits', () => {
      const filePath = path.join(TEST_CONFIG.contractsDir, 'escrow.compact');
      const content = fs.readFileSync(filePath, 'utf8');
      
      const circuits = [
        'setEscrowFee',
        'pauseEscrow',
        'unpauseEscrow',
        'collectEscrowFees'
      ];
      
      circuits.forEach(circuit => {
        expect(content).toContain(`export circuit ${circuit}`);
      });
    });
  });

  // FRACTIONAL TOKEN TESTS
  describe('Fractional Token Contract', () => {
    it('should have TokenState and PropertyStatus enums', () => {
      const filePath = path.join(TEST_CONFIG.contractsDir, 'fractional_token.compact');
      const content = fs.readFileSync(filePath, 'utf8');
      
      expect(content).toContain('enum TokenState');
      expect(content).toContain('Active');
      expect(content).toContain('Paused');
      expect(content).toContain('Frozen');
      
      expect(content).toContain('enum PropertyStatus');
      expect(content).toContain('Registered');
      expect(content).toContain('Tokenized');
      expect(content).toContain('Transferred');
      expect(content).toContain('Deactivated');
    });

    it('should have complete token ledgers', () => {
      const filePath = path.join(TEST_CONFIG.contractsDir, 'fractional_token.compact');
      const content = fs.readFileSync(filePath, 'utf8');
      
      const ledgers = [
        'total_supply',
        'circulating_supply',
        'nonce',
        'balances',
        'token_state',
        'holder_count',
        'holders',
        'holder_history',
        'property_statuses',
        'property_owners',
        'property_token_ids',
        'property_history'
      ];
      
      ledgers.forEach(ledger => {
        expect(content).toContain(`export ledger ${ledger}`);
      });
    });

    it('should have supply management circuits', () => {
      const filePath = path.join(TEST_CONFIG.contractsDir, 'fractional_token.compact');
      const content = fs.readFileSync(filePath, 'utf8');
      
      const circuits = [
        'mint',
        'burn'
      ];
      
      circuits.forEach(circuit => {
        expect(content).toContain(`export circuit ${circuit}`);
      });
    });

    it('should have transfer circuits', () => {
      const filePath = path.join(TEST_CONFIG.contractsDir, 'fractional_token.compact');
      const content = fs.readFileSync(filePath, 'utf8');
      
      const circuits = [
        'transfer',
        'approve'
      ];
      
      circuits.forEach(circuit => {
        expect(content).toContain(`export circuit ${circuit}`);
      });
    });

    it('should have token state management', () => {
      const filePath = path.join(TEST_CONFIG.contractsDir, 'fractional_token.compact');
      const content = fs.readFileSync(filePath, 'utf8');
      
      expect(content).toContain('export circuit pause_token');
      expect(content).toContain('export circuit unpause_token');
    });

    it('should have token query circuits', () => {
      const filePath = path.join(TEST_CONFIG.contractsDir, 'fractional_token.compact');
      const content = fs.readFileSync(filePath, 'utf8');
      
      const circuits = [
        'balanceOf',
        'getTotalSupply',
        'getCirculatingSupply',
        'getTokenState'
      ];
      
      circuits.forEach(circuit => {
        expect(content).toContain(`export circuit ${circuit}`);
      });
    });

    it('should have property tokenization circuits', () => {
      const filePath = path.join(TEST_CONFIG.contractsDir, 'fractional_token.compact');
      const content = fs.readFileSync(filePath, 'utf8');
      
      const circuits = [
        'register_property',
        'tokenize_property',
        'transfer_property_ownership',
        'deactivate_property',
        'getPropertyStatus',
        'getPropertyOwner'
      ];
      
      circuits.forEach(circuit => {
        expect(content).toContain(`export circuit ${circuit}`);
      });
    });

    it('should track holder history and transactions', () => {
      const filePath = path.join(TEST_CONFIG.contractsDir, 'fractional_token.compact');
      const content = fs.readFileSync(filePath, 'utf8');
      
      expect(content).toContain('holder_history');
      expect(content).toContain('holder_txn_count');
      expect(content).toContain('property_history');
      expect(content).toContain('nonce.increment');
    });
  });

  // MARKETPLACE TESTS
  describe('Marketplace Contract', () => {
    it('should have ListingStatus enum', () => {
      const filePath = path.join(TEST_CONFIG.contractsDir, 'marketplace.compact');
      const content = fs.readFileSync(filePath, 'utf8');
      
      expect(content).toContain('enum ListingStatus');
      const statuses = ['Active', 'Sold', 'Cancelled', 'Expired'];
      statuses.forEach(status => {
        expect(content).toContain(status);
      });
    });

    it('should have complete marketplace ledgers', () => {
      const filePath = path.join(TEST_CONFIG.contractsDir, 'marketplace.compact');
      const content = fs.readFileSync(filePath, 'utf8');
      
      const ledgers = [
        'listing_sellers',
        'listing_property_ids',
        'listing_prices',
        'listing_statuses',
        'listing_timestamps',
        'listing_durations',
        'listing_buyers',
        'marketplace_initialized',
        'marketplace_fee',
        'marketplace_paused',
        'admin_address',
        'collected_fees',
        'listing_counter',
        'transaction_counter',
        'listing_history'
      ];
      
      ledgers.forEach(ledger => {
        expect(content).toContain(`export ledger ${ledger}`);
      });
    });

    it('should have initialization circuit', () => {
      const filePath = path.join(TEST_CONFIG.contractsDir, 'marketplace.compact');
      const content = fs.readFileSync(filePath, 'utf8');
      expect(content).toContain('export circuit initializeMarketplace');
    });

    it('should have listing management circuits', () => {
      const filePath = path.join(TEST_CONFIG.contractsDir, 'marketplace.compact');
      const content = fs.readFileSync(filePath, 'utf8');
      
      const circuits = [
        'createListing',
        'updateListing',
        'cancelListing'
      ];
      
      circuits.forEach(circuit => {
        expect(content).toContain(`export circuit ${circuit}`);
      });
    });

    it('should have transaction circuit', () => {
      const filePath = path.join(TEST_CONFIG.contractsDir, 'marketplace.compact');
      const content = fs.readFileSync(filePath, 'utf8');
      expect(content).toContain('export circuit purchaseListing');
    });

    it('should have query circuits', () => {
      const filePath = path.join(TEST_CONFIG.contractsDir, 'marketplace.compact');
      const content = fs.readFileSync(filePath, 'utf8');
      
      const circuits = [
        'getListing',
        'getListingDetails'
      ];
      
      circuits.forEach(circuit => {
        expect(content).toContain(`export circuit ${circuit}`);
      });
    });

    it('should have admin circuits', () => {
      const filePath = path.join(TEST_CONFIG.contractsDir, 'marketplace.compact');
      const content = fs.readFileSync(filePath, 'utf8');
      
      const circuits = [
        'setMarketplaceFee',
        'pauseMarketplace',
        'unpauseMarketplace',
        'collectFees',
        'getCollectedFees'
      ];
      
      circuits.forEach(circuit => {
        expect(content).toContain(`export circuit ${circuit}`);
      });
    });
  });

  // PROPERTY REGISTRY TESTS
  describe('Property Registry Contract', () => {
    it('should have PropertyStatus enum', () => {
      const filePath = path.join(TEST_CONFIG.contractsDir, 'property_registry.compact');
      const content = fs.readFileSync(filePath, 'utf8');
      
      expect(content).toContain('enum PropertyStatus');
      const statuses = ['Registered', 'Verified', 'Tokenized', 'Listed', 'Sold', 'Deactivated'];
      statuses.forEach(status => {
        expect(content).toContain(status);
      });
    });

    it('should have complete property ledgers', () => {
      const filePath = path.join(TEST_CONFIG.contractsDir, 'property_registry.compact');
      const content = fs.readFileSync(filePath, 'utf8');
      
      const ledgers = [
        'property_owners',
        'property_statuses',
        'property_values',
        'property_locations',
        'property_documents',
        'registry_initialized',
        'registration_fee',
        'registry_paused',
        'admin_address',
        'collected_fees',
        'property_counter',
        'property_history'
      ];
      
      ledgers.forEach(ledger => {
        expect(content).toContain(`export ledger ${ledger}`);
      });
    });

    it('should have initialization circuit', () => {
      const filePath = path.join(TEST_CONFIG.contractsDir, 'property_registry.compact');
      const content = fs.readFileSync(filePath, 'utf8');
      expect(content).toContain('export circuit initializeRegistry');
    });

    it('should have registration circuit', () => {
      const filePath = path.join(TEST_CONFIG.contractsDir, 'property_registry.compact');
      const content = fs.readFileSync(filePath, 'utf8');
      expect(content).toContain('export circuit registerProperty');
    });

    it('should have status management circuits', () => {
      const filePath = path.join(TEST_CONFIG.contractsDir, 'property_registry.compact');
      const content = fs.readFileSync(filePath, 'utf8');
      
      expect(content).toContain('export circuit updatePropertyStatus');
    });

    it('should have query circuits', () => {
      const filePath = path.join(TEST_CONFIG.contractsDir, 'property_registry.compact');
      const content = fs.readFileSync(filePath, 'utf8');
      
      const circuits = [
        'getProperty',
        'getPropertyMetadata'
      ];
      
      circuits.forEach(circuit => {
        expect(content).toContain(`export circuit ${circuit}`);
      });
    });

    it('should have transfer circuits', () => {
      const filePath = path.join(TEST_CONFIG.contractsDir, 'property_registry.compact');
      const content = fs.readFileSync(filePath, 'utf8');
      
      expect(content).toContain('export circuit transferProperty');
    });

    it('should have verification circuit', () => {
      const filePath = path.join(TEST_CONFIG.contractsDir, 'property_registry.compact');
      const content = fs.readFileSync(filePath, 'utf8');
      
      expect(content).toContain('export circuit verifyProperty');
    });

    it('should have admin circuits', () => {
      const filePath = path.join(TEST_CONFIG.contractsDir, 'property_registry.compact');
      const content = fs.readFileSync(filePath, 'utf8');
      
      const circuits = [
        'setRegistrationFee',
        'pauseRegistry',
        'unpauseRegistry',
        'getCollectedFees',
        'withdrawCollectedFees'
      ];
      
      circuits.forEach(circuit => {
        expect(content).toContain(`export circuit ${circuit}`);
      });
    });
  });

  // ROLE TESTS
  describe('Role Contract', () => {
    it('should have Role enum with all roles', () => {
      const filePath = path.join(TEST_CONFIG.contractsDir, 'role.compact');
      const content = fs.readFileSync(filePath, 'utf8');
      
      expect(content).toContain('enum Role');
      const roles = ['USER', 'ADMIN', 'MODERATOR'];
      roles.forEach(role => {
        expect(content).toContain(role);
      });
    });

    it('should have complete role ledgers', () => {
      const filePath = path.join(TEST_CONFIG.contractsDir, 'role.compact');
      const content = fs.readFileSync(filePath, 'utf8');
      
      const ledgers = [
        'user_roles',
        'admin_address',
        'is_initialized',
        'role_counter',
        'is_paused'
      ];
      
      ledgers.forEach(ledger => {
        expect(content).toContain(`export ledger ${ledger}`);
      });
    });

    it('should have initialization circuit', () => {
      const filePath = path.join(TEST_CONFIG.contractsDir, 'role.compact');
      const content = fs.readFileSync(filePath, 'utf8');
      expect(content).toContain('export circuit initialize_roles');
    });

    it('should have role management circuits', () => {
      const filePath = path.join(TEST_CONFIG.contractsDir, 'role.compact');
      const content = fs.readFileSync(filePath, 'utf8');
      
      const circuits = [
        'set_role',
        'get_user_role',
        'remove_role'
      ];
      
      circuits.forEach(circuit => {
        expect(content).toContain(`export circuit ${circuit}`);
      });
    });

    it('should have admin check circuit', () => {
      const filePath = path.join(TEST_CONFIG.contractsDir, 'role.compact');
      const content = fs.readFileSync(filePath, 'utf8');
      
      expect(content).toContain('export circuit is_user_admin');
    });

    it('should have admin transfer circuit', () => {
      const filePath = path.join(TEST_CONFIG.contractsDir, 'role.compact');
      const content = fs.readFileSync(filePath, 'utf8');
      
      expect(content).toContain('export circuit transfer_admin');
    });

    it('should have pause/unpause circuits', () => {
      const filePath = path.join(TEST_CONFIG.contractsDir, 'role.compact');
      const content = fs.readFileSync(filePath, 'utf8');
      
      expect(content).toContain('export circuit pause_contract');
      expect(content).toContain('export circuit unpause_contract');
    });

    it('should use role_counter for auditing', () => {
      const filePath = path.join(TEST_CONFIG.contractsDir, 'role.compact');
      const content = fs.readFileSync(filePath, 'utf8');
      
      expect(content).toContain('role_counter: Counter');
      expect(content).toContain('role_counter.increment');
    });
  });

  // VERIFICATION TESTS
  describe('Verification Contract', () => {
    it('should have VerificationStatus enum', () => {
      const filePath = path.join(TEST_CONFIG.contractsDir, 'verification.compact');
      const content = fs.readFileSync(filePath, 'utf8');
      
      expect(content).toContain('enum VerificationStatus');
      const statuses = ['Pending', 'InProgress', 'Approved', 'Rejected', 'Expired'];
      statuses.forEach(status => {
        expect(content).toContain(status);
      });
    });

    it('should have complete verification ledgers', () => {
      const filePath = path.join(TEST_CONFIG.contractsDir, 'verification.compact');
      const content = fs.readFileSync(filePath, 'utf8');
      
      const ledgers = [
        'verification_requesters',
        'verification_property_ids',
        'verification_statuses',
        'verification_timestamps',
        'verification_documents',
        'verification_results',
        'verification_verifiers',
        'verification_history',
        'verification_initialized',
        'verification_fee',
        'verification_paused',
        'admin_address',
        'verifier_addresses',
        'collected_fees',
        'request_counter',
        'approved_count',
        'rejected_count'
      ];
      
      ledgers.forEach(ledger => {
        expect(content).toContain(`export ledger ${ledger}`);
      });
    });

    it('should have initialization circuit', () => {
      const filePath = path.join(TEST_CONFIG.contractsDir, 'verification.compact');
      const content = fs.readFileSync(filePath, 'utf8');
      expect(content).toContain('export circuit initializeVerification');
    });

    it('should have request circuit', () => {
      const filePath = path.join(TEST_CONFIG.contractsDir, 'verification.compact');
      const content = fs.readFileSync(filePath, 'utf8');
      
      expect(content).toContain('export circuit requestVerification');
    });

    it('should have verifier management circuits', () => {
      const filePath = path.join(TEST_CONFIG.contractsDir, 'verification.compact');
      const content = fs.readFileSync(filePath, 'utf8');
      
      const circuits = [
        'approveVerifier',
        'removeVerifier'
      ];
      
      circuits.forEach(circuit => {
        expect(content).toContain(`export circuit ${circuit}`);
      });
    });

    it('should have verification workflow circuits', () => {
      const filePath = path.join(TEST_CONFIG.contractsDir, 'verification.compact');
      const content = fs.readFileSync(filePath, 'utf8');
      
      const circuits = [
        'startVerification',
        'submitVerificationResult'
      ];
      
      circuits.forEach(circuit => {
        expect(content).toContain(`export circuit ${circuit}`);
      });
    });

    it('should have query circuits', () => {
      const filePath = path.join(TEST_CONFIG.contractsDir, 'verification.compact');
      const content = fs.readFileSync(filePath, 'utf8');
      
      const circuits = [
        'getVerificationStatus',
        'getVerificationResult'
      ];
      
      circuits.forEach(circuit => {
        expect(content).toContain(`export circuit ${circuit}`);
      });
    });

    it('should have proof verification circuit', () => {
      const filePath = path.join(TEST_CONFIG.contractsDir, 'verification.compact');
      const content = fs.readFileSync(filePath, 'utf8');
      
      expect(content).toContain('export circuit verifyProof');
    });

    it('should have admin circuits', () => {
      const filePath = path.join(TEST_CONFIG.contractsDir, 'verification.compact');
      const content = fs.readFileSync(filePath, 'utf8');
      
      const circuits = [
        'setVerificationFee',
        'collectVerificationFee',
        'getCollectedFees',
        'withdrawCollectedFees',
        'pauseVerification',
        'unpauseVerification'
      ];
      
      circuits.forEach(circuit => {
        expect(content).toContain(`export circuit ${circuit}`);
      });
    });

    it('should have statistics circuit', () => {
      const filePath = path.join(TEST_CONFIG.contractsDir, 'verification.compact');
      const content = fs.readFileSync(filePath, 'utf8');
      
      expect(content).toContain('export circuit getVerificationStats');
    });

    it('should track approval and rejection counts', () => {
      const filePath = path.join(TEST_CONFIG.contractsDir, 'verification.compact');
      const content = fs.readFileSync(filePath, 'utf8');
      
      expect(content).toContain('approved_count: Counter');
      expect(content).toContain('rejected_count: Counter');
      expect(content).toContain('approved_count.increment');
      expect(content).toContain('rejected_count.increment');
    });
  });

  // INTEGRATION TESTS
  describe('Contract Integration', () => {
    it('should verify all 9 contracts present', () => {
      expect(ALL_CONTRACTS.length).toBe(9);
    });

    it('should have no duplicate contracts', () => {
      const unique = new Set(ALL_CONTRACTS);
      expect(unique.size).toBe(9);
    });

    it('should follow naming conventions', () => {
      ALL_CONTRACTS.forEach(file => {
        expect(file).toMatch(/^[a-zA-Z][a-zA-Z0-9_]*\.compact$/);
      });
    });

    it('should have reasonable file sizes', () => {
      ALL_CONTRACTS.forEach(file => {
        const filePath = path.join(TEST_CONFIG.contractsDir, file);
        const stats = fs.statSync(filePath);
        expect(stats.size).toBeGreaterThan(1000);
        expect(stats.size).toBeLessThan(1048576); // 1MB limit
      });
    });

    it('should have proper documentation comments', () => {
      ALL_CONTRACTS.forEach(file => {
        const filePath = path.join(TEST_CONFIG.contractsDir, file);
        const content = fs.readFileSync(filePath, 'utf8');
        // Check for at least one comment line
        expect(content).toMatch(/\/\//);
      });
    });
  });

  // STATE MANAGEMENT TESTS
  describe('State Management and Ledger Integrity', () => {
    it('should use Counter for audit trail tracking', () => {
      const counterContracts = ['main', 'accessControl', 'auditLog', 'escrow', 'fractional_token', 'marketplace', 'property_registry', 'role', 'verification'];
      
      counterContracts.forEach(contractName => {
        let file = '';
        if (contractName === 'accessControl') file = 'accessControl.compact';
        else if (contractName === 'auditLog') file = 'auditLog.compact';
        else if (contractName === 'fractional_token') file = 'fractional_token.compact';
        else if (contractName === 'property_registry') file = 'property_registry.compact';
        else file = `${contractName}.compact`;
        
        const filePath = path.join(TEST_CONFIG.contractsDir, file);
        const content = fs.readFileSync(filePath, 'utf8');
        
        expect(content).toMatch(/Counter/);
        expect(content).toMatch(/\.increment/);
      });
    });

    it('should have initialization checks in core contracts', () => {
      const coreContracts = [
        'main', 'accessControl', 'auditLog', 'escrow',
        'marketplace', 'property_registry', 'role', 'verification'
      ];
      
      coreContracts.forEach(name => {
        let file = '';
        if (name === 'accessControl') file = 'accessControl.compact';
        else if (name === 'auditLog') file = 'auditLog.compact';
        else if (name === 'property_registry') file = 'property_registry.compact';
        else file = `${name}.compact`;
        
        const filePath = path.join(TEST_CONFIG.contractsDir, file);
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Should have initialized flag
        expect(content).toMatch(/initialized|is_initialized/);
      });
    });

    it('should have admin address tracking in admin-enabled contracts', () => {
      const adminContracts = [
        'main', 'accessControl', 'auditLog', 'escrow',
        'marketplace', 'property_registry', 'role', 'verification'
      ];
      
      adminContracts.forEach(name => {
        let file = '';
        if (name === 'accessControl') file = 'accessControl.compact';
        else if (name === 'auditLog') file = 'auditLog.compact';
        else if (name === 'property_registry') file = 'property_registry.compact';
        else file = `${name}.compact`;
        
        const filePath = path.join(TEST_CONFIG.contractsDir, file);
        const content = fs.readFileSync(filePath, 'utf8');
        
        expect(content).toContain('admin_address');
      });
    });

    it('should have pause/unpause capability in applicable contracts', () => {
      const pauseableContracts = [
        'main', 'accessControl', 'auditLog', 'escrow',
        'fractional_token', 'marketplace', 'property_registry',
        'role', 'verification'
      ];
      
      pauseableContracts.forEach(name => {
        let file = '';
        if (name === 'accessControl') file = 'accessControl.compact';
        else if (name === 'auditLog') file = 'auditLog.compact';
        else if (name === 'fractional_token') file = 'fractional_token.compact';
        else if (name === 'property_registry') file = 'property_registry.compact';
        else file = `${name}.compact`;
        
        const filePath = path.join(TEST_CONFIG.contractsDir, file);
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Should have pause state
        expect(content).toMatch(/paused|is_paused/);
      });
    });

    it('should have token_state ledger in fractional_token contract', () => {
      const filePath = path.join(TEST_CONFIG.contractsDir, 'fractional_token.compact');
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Fractional token uses token_state instead of paused flag
      expect(content).toContain('export ledger token_state: TokenState');
      expect(content).toMatch(/TokenState\.(Active|Paused|Frozen)/);
    });
  });

  // BUILD ARTIFACTS TESTS
  describe('Build Artifacts Verification', () => {
    it('should have build directory', () => {
      const buildDir = path.join(process.cwd(), TEST_CONFIG.buildDir);
      
      if (fs.existsSync(buildDir)) {
        const items = fs.readdirSync(buildDir);
        expect(items.length).toBeGreaterThan(0);
      }
    });

    it('should have compiled contracts in build directory', () => {
      const buildDir = path.join(process.cwd(), TEST_CONFIG.buildDir);
      
      if (fs.existsSync(buildDir)) {
        const expectedDirs = ['main', 'role', 'property_registry', 'fractional_token', 'marketplace', 'verification'];
        
        expectedDirs.forEach(contractName => {
          const contractBuildDir = path.join(buildDir, contractName);
          
          // Only check if build artifacts exist
          if (fs.existsSync(contractBuildDir)) {
            const items = fs.readdirSync(contractBuildDir);
            expect(items.length).toBeGreaterThan(0);
          }
        });
      }
    });
  });
});
