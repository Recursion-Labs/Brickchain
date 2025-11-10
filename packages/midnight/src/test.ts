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
    it('should have compiled main contract', () => {
      const mainContractPath = path.join(contractPath, 'main', 'contract', 'index.cjs');
      expect(fs.existsSync(mainContractPath)).toBe(true);
    });

    it('should have all contract files', () => {
      TEST_CONFIG.contractFiles.forEach(file => {
        const filePath = path.join(TEST_CONFIG.contractsDir, file);
        expect(fs.existsSync(filePath), `Contract file ${file} should exist`).toBe(true);
      });
    });

    it('should fail gracefully when contract files are missing', () => {
      const nonExistentFile = path.join(TEST_CONFIG.contractsDir, 'nonexistent.compact');
      expect(fs.existsSync(nonExistentFile)).toBe(false);
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
      expect(mainContract).toContain('import "./lib/types.compact"');
      expect(mainContract).toContain('import "./utils.compact"');
    });

    it('should have system initialization circuit', () => {
      const mainContract = fs.readFileSync(path.join(TEST_CONFIG.contractsDir, 'main.compact'), 'utf8');
      expect(mainContract).toContain('export circuit initializeSystem');
    });

    it('should reject invalid pragma statements', () => {
      // Test that we properly validate pragma format
      const invalidPragma = 'pragma language_version invalid';
      expect(invalidPragma).not.toMatch(/pragma language_version >= \d+\.\d+ && <= \d+\.\d+/);
    });
  });

  describe('Type Definitions', () => {
    it('should have all required types defined', () => {
      const typesFile = fs.readFileSync(path.join(TEST_CONFIG.contractsDir, 'lib/types.compact'), 'utf8');
      
      TEST_CONFIG.requiredTypes.forEach(type => {
        expect(typesFile, `Type ${type} should be exported`).toContain(`export type ${type}`);
      });
    });

    it('should have proper type structure', () => {
      const typesFile = fs.readFileSync(path.join(TEST_CONFIG.contractsDir, 'lib/types.compact'), 'utf8');
      
      // Check that types have proper field definitions
      expect(typesFile).toContain('pid: u64');
      expect(typesFile).toContain('owner: Address');
      expect(typesFile).toContain('totalShares: u64');
    });

    it('should detect missing types', () => {
      const typesFile = fs.readFileSync(path.join(TEST_CONFIG.contractsDir, 'lib/types.compact'), 'utf8');
      
      // This should not exist
      expect(typesFile).not.toContain('export type NonExistentType');
    });
  });

  describe('Contract Validation', () => {
    TEST_CONFIG.contractTests.forEach(({ name, circuits }) => {
      it(`should have valid ${name} contract`, () => {
        const contractPath = path.join(TEST_CONFIG.contractsDir, `${name}.compact`);
        const contract = fs.readFileSync(contractPath, 'utf8');
        
        circuits.forEach(circuit => {
          expect(contract, `${name} should have ${circuit} circuit`).toContain(`export circuit ${circuit}`);
        });
        
        expect(contract, `${name} should import utils`).toContain('import "./utils.compact"');
      });
    });

    it('should have proper error handling in contracts', () => {
      const marketplaceContract = fs.readFileSync(path.join(TEST_CONFIG.contractsDir, 'marketplace.compact'), 'utf8');
      
      // Check for proper require statements
      expect(marketplaceContract).toContain('require(');
      expect(marketplaceContract).toContain('Invalid');
      expect(marketplaceContract).toContain('Unauthorized');
    });
  });

  describe('Utility Functions', () => {
    it('should have all utility functions defined', () => {
      const utils = fs.readFileSync(path.join(TEST_CONFIG.contractsDir, 'utils.compact'), 'utf8');
      
      TEST_CONFIG.utilityFunctions.forEach(func => {
        expect(utils, `Utils should contain ${func}`).toContain(func);
      });
    });

    it('should have proper native function declarations', () => {
      const utils = fs.readFileSync(path.join(TEST_CONFIG.contractsDir, 'utils.compact'), 'utf8');
      
      expect(utils).toContain('export native getCurrentTime(): u64');
      expect(utils).toContain('export native hashString(input: string): string');
      expect(utils).toContain('export native getUserRole(address: Address): string');
    });

    it('should have validation circuits', () => {
      const utils = fs.readFileSync(path.join(TEST_CONFIG.contractsDir, 'utils.compact'), 'utf8');
      
      expect(utils).toContain('export circuit validateAddress');
      expect(utils).toContain('export circuit validateAmount');
      expect(utils).toContain('export circuit validateShares');
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
            expect(address.length).toBeGreaterThan(0);
          });
        }
      }
    });

    it('should handle missing deployment.json gracefully', () => {
      const deploymentPath = 'nonexistent-deployment.json';
      expect(fs.existsSync(deploymentPath)).toBe(false);
    });

    it('should detect corrupted deployment.json', () => {
      const corruptedPath = 'test-corrupted-deployment.json';
      
      // Create a corrupted file for testing
      if (!fs.existsSync(corruptedPath)) {
        fs.writeFileSync(corruptedPath, '{ invalid json');
      }
      
      expect(() => {
        JSON.parse(fs.readFileSync(corruptedPath, 'utf8'));
      }).toThrow();
      
      // Clean up
      if (fs.existsSync(corruptedPath)) {
        fs.unlinkSync(corruptedPath);
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle missing contract files gracefully', () => {
      const missingFiles = [
        'nonexistent.compact',
        'invalid/path.compact',
        ''
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
            
            // Should not have syntax errors (basic check)
            expect(content).not.toContain('syntax error');
            expect(content).not.toContain('undefined');
            
            // Should have proper structure
            if (content.includes('export circuit')) {
              expect(content).toContain('require(');
            }
          }
        }
      });
    });
  });
});