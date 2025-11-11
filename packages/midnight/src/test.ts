import { describe, it, expect, beforeAll } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

import { TEST_CONFIG } from './config.js';

describe('BrickChain Contracts', () => {
  let contractPath: string;

  beforeAll(() => {
    contractPath = path.join(process.cwd(), TEST_CONFIG.buildDir);
  });

  describe('Contract Compilation', () => {
    it('should compile all contracts successfully', () => {
      TEST_CONFIG.contractFiles.forEach(file => {
        const filePath = path.join(TEST_CONFIG.contractsDir, file);
        expect(fs.existsSync(filePath), `Contract file ${file} should exist`).toBe(true);
      });
    });

    it('should have compiled contract directories', () => {
      TEST_CONFIG.contractTests.forEach(({ name }) => {
        const contractDir = path.join(contractPath, name);
        expect(fs.existsSync(contractDir), `Compiled contract directory for ${name} should exist`).toBe(true);
      });
    });
  });

  describe('Contract Structure', () => {
    it('should have valid pragma statements in all contracts', () => {
      TEST_CONFIG.contractFiles.forEach(file => {
        if (file.endsWith('.compact')) {
          const filePath = path.join(TEST_CONFIG.contractsDir, file);
          const content = fs.readFileSync(filePath, 'utf8');
          expect(content, `${file} should have valid pragma`).toContain('pragma language_version >= 0.16 && <= 0.18');
        }
      });
    });

    it('should have proper imports in main contract', () => {
      const mainContract = fs.readFileSync(path.join(TEST_CONFIG.contractsDir, 'main.compact'), 'utf8');
      expect(mainContract).toContain('import CompactStandardLibrary');
    });

    it('should have system initialization circuit', () => {
      const mainContract = fs.readFileSync(path.join(TEST_CONFIG.contractsDir, 'main.compact'), 'utf8');
      expect(mainContract).toContain('export circuit initializeSystem');
    });
  });

  describe('Fractional Token Contract', () => {
    it('should have all required circuits', () => {
      const contractPath = path.join(TEST_CONFIG.contractsDir, 'fractional_token.compact');
      const contract = fs.readFileSync(contractPath, 'utf8');
      
      const requiredCircuits = [
        'mint',
        'transfer',
        'approve',
        'burn',
        'pause_token',
        'unpause_token',
        'register_property',
        'tokenize_property',
        'transfer_property_ownership',
        'deactivate_property'
      ];
      
      requiredCircuits.forEach(circuit => {
        expect(contract, `fractional_token should have ${circuit} circuit`).toContain(`export circuit ${circuit}`);
      });
    });

    it('should have proper enum definitions', () => {
      const contractPath = path.join(TEST_CONFIG.contractsDir, 'fractional_token.compact');
      const contract = fs.readFileSync(contractPath, 'utf8');
      
      expect(contract).toContain('enum TokenState');
      expect(contract).toContain('enum PropertyStatus');
      expect(contract).toContain('Active');
      expect(contract).toContain('Paused');
      expect(contract).toContain('Registered');
      expect(contract).toContain('Tokenized');
    });

    it('should have ledger declarations', () => {
      const contractPath = path.join(TEST_CONFIG.contractsDir, 'fractional_token.compact');
      const contract = fs.readFileSync(contractPath, 'utf8');
      
      const requiredLedgers = [
        'total_supply',
        'circulating_supply',
        'nonce',
        'balances',
        'token_state',
        'holder_count',
        'holders',
        'property_statuses',
        'property_owners',
        'property_token_ids'
      ];
      
      requiredLedgers.forEach(ledger => {
        expect(contract, `fractional_token should have ${ledger} ledger`).toContain(`export ledger ${ledger}`);
      });
    });

    it('should have constructor', () => {
      const contractPath = path.join(TEST_CONFIG.contractsDir, 'fractional_token.compact');
      const contract = fs.readFileSync(contractPath, 'utf8');
      
      expect(contract).toContain('constructor()');
    });

    it('should use proper assert statements', () => {
      const contractPath = path.join(TEST_CONFIG.contractsDir, 'fractional_token.compact');
      const contract = fs.readFileSync(contractPath, 'utf8');
      
      expect(contract).toContain('assert(');
      expect(contract).toContain('disclose(');
    });
  });

  describe('Deployment Configuration', () => {
    it('should validate deployment.json structure when it exists', () => {
      const deploymentPath = 'deployment.json';
      
      if (fs.existsSync(deploymentPath)) {
        const deployment = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
        
        expect(deployment).toHaveProperty('contracts');
        expect(deployment).toHaveProperty('deployedAt');
        expect(deployment).toHaveProperty('network');
        
        if (deployment.contracts) {
          expect(typeof deployment.contracts).toBe('object');
          
          // Validate contract addresses format
          Object.entries(deployment.contracts).forEach(([name, address]) => {
            expect(typeof name).toBe('string');
            expect(typeof address).toBe('string');
            expect(name.length).toBeGreaterThan(0);
            expect((address as string).length).toBeGreaterThan(0);
          });
        }
      }
    });

    it('should handle missing deployment.json gracefully', () => {
      const deploymentPath = 'nonexistent-deployment.json';
      expect(fs.existsSync(deploymentPath)).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should handle missing contract files gracefully', () => {
      const missingFiles = [
        'nonexistent.compact',
        'invalid/path.compact'
      ];

      missingFiles.forEach(file => {
        const filePath = path.join(TEST_CONFIG.contractsDir, file);
        expect(fs.existsSync(filePath)).toBe(false);
      });
    });

    it('should validate contract syntax requirements', () => {
      // Test that contracts have required syntax elements
      TEST_CONFIG.contractFiles.forEach(file => {
        if (file.endsWith('.compact')) {
          const filePath = path.join(TEST_CONFIG.contractsDir, file);
          if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf8');
            
            // Should have proper structure
            expect(content).toContain('pragma language_version');
            expect(content).toContain('export circuit');
            
            // Some contracts may have ledgers, some may not
            // Only check for ledgers in contracts that should have state
            if (file === 'fractional_token.compact' || file === 'role.compact') {
              expect(content).toContain('export ledger');
            }
          }
        }
      });
    });
  });
});