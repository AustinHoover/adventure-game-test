/**
 * Tests for validating that characters have behavior trees assigned to them
 * after loading from a save file.
 * 
 * This test suite validates the fix for a bug where behavior trees weren't being
 * associated with characters when loading from save files. The fix involved adding
 * a call to assignBehaviorTreesToCharacters() in the loadSaveFile function.
 * 
 * Since we can't serialize functions when saving, behavior trees must be reassigned
 * on load. This test ensures that logic works correctly.
 */

import { BehaviorTreeService } from '../BehaviorTreeService';
import { CharacterRegistryManager } from '../../interface/character';
import { GameState } from '../../interface/gamestate';
import { Character } from '../../interface/character';

describe('Behavior Tree Assignment on Save File Load', () => {
  // Note: This test suite focuses on testing the behavior tree assignment logic directly
  // rather than testing the full save file loading process. This approach is more reliable
  // and easier to maintain, while still validating the core functionality that was fixed.
  
  let behaviorTreeService: BehaviorTreeService;
  let registryManager: CharacterRegistryManager;

  beforeEach(() => {
    behaviorTreeService = BehaviorTreeService.getInstance();
    registryManager = CharacterRegistryManager.getInstance();
    
    // Clear any existing state
    behaviorTreeService.clear();
    registryManager.clear();
    
    // Set up default behavior trees
    behaviorTreeService.setupDefaultBehaviorTrees();
  });

  afterEach(() => {
    // Clear state
    behaviorTreeService.clear();
    registryManager.clear();
  });

  describe('Character Behavior Tree Assignment Logic', () => {
    it('should assign behavior trees to all non-player characters', () => {
      // Create test characters
      const playerCharacter: Character = {
        id: 1,
        name: 'Player',
        location: 1,
        unitId: 1,
        mapId: 2,
        shopPools: [],
        inventory: { items: [], currency: 0 },
        behaviorTreeId: undefined,
        level: 1,
        experience: 0,
        raceId: 'human',
        maxHp: 100,
        currentHp: 100,
        attack: 10
      };

      const guardCharacter: Character = {
        id: 2,
        name: 'Town Guard',
        location: 2,
        unitId: 2,
        mapId: 2,
        shopPools: [],
        inventory: { items: [], currency: 0 },
        behaviorTreeId: undefined,
        level: 1,
        experience: 0,
        raceId: 'human',
        maxHp: 100,
        currentHp: 100,
        attack: 15
      };

      const merchantCharacter: Character = {
        id: 3,
        name: 'Shop Merchant',
        location: 3,
        unitId: 3,
        mapId: 2,
        shopPools: ['weapons', 'armor'],
        inventory: { items: [], currency: 1000 },
        behaviorTreeId: undefined,
        level: 1,
        experience: 0,
        raceId: 'human',
        maxHp: 80,
        currentHp: 80,
        attack: 8
      };

      const npcCharacter: Character = {
        id: 4,
        name: 'Village NPC',
        location: 4,
        unitId: 4,
        mapId: 2,
        shopPools: [],
        inventory: { items: [], currency: 0 },
        behaviorTreeId: undefined,
        level: 1,
        experience: 0,
        raceId: 'human',
        maxHp: 60,
        currentHp: 60,
        attack: 5
      };

      // Add characters to registry
      registryManager.addCharacter(playerCharacter);
      registryManager.addCharacter(guardCharacter);
      registryManager.addCharacter(merchantCharacter);
      registryManager.addCharacter(npcCharacter);

      // Get all characters and assign behavior trees
      const allCharacters = registryManager.getAllCharacters();
      behaviorTreeService.assignBehaviorTreesToCharacters(allCharacters, 1); // player ID is 1

      // Verify behavior tree assignments
      const updatedGuard = registryManager.getCharacter(2);
      const updatedMerchant = registryManager.getCharacter(3);
      const updatedNPC = registryManager.getCharacter(4);
      const updatedPlayer = registryManager.getCharacter(1);

      // Player should not have a behavior tree
      expect(updatedPlayer?.behaviorTreeId).toBeUndefined();

      // Guard should have guard patrol behavior
      expect(updatedGuard?.behaviorTreeId).toBe('guard_patrol');

      // Merchant should have merchant behavior
      expect(updatedMerchant?.behaviorTreeId).toBe('merchant_behavior');

      // NPC should have idle behavior (default)
      expect(updatedNPC?.behaviorTreeId).toBe('idle_behavior');
    });

    it('should assign appropriate behavior trees based on character names', () => {
      // Create characters with specific names
      const guardCharacter: Character = {
        id: 1,
        name: 'Guard Captain',
        location: 1,
        unitId: 1,
        mapId: 2,
        shopPools: [],
        inventory: { items: [], currency: 0 },
        behaviorTreeId: undefined,
        level: 1,
        experience: 0,
        raceId: 'human',
        maxHp: 100,
        currentHp: 100,
        attack: 15
      };

      const merchantCharacter: Character = {
        id: 2,
        name: 'Weapon Merchant',
        location: 2,
        unitId: 2,
        mapId: 2,
        shopPools: ['weapons'],
        inventory: { items: [], currency: 500 },
        behaviorTreeId: undefined,
        level: 1,
        experience: 0,
        raceId: 'human',
        maxHp: 80,
        currentHp: 80,
        attack: 8
      };

      const patrolCharacter: Character = {
        id: 3,
        name: 'Patrol Officer',
        location: 3,
        unitId: 3,
        mapId: 2,
        shopPools: [],
        inventory: { items: [], currency: 0 },
        behaviorTreeId: undefined,
        level: 1,
        experience: 0,
        raceId: 'human',
        maxHp: 90,
        currentHp: 90,
        attack: 12
      };

      const regularNPC: Character = {
        id: 4,
        name: 'Farmer John',
        location: 4,
        unitId: 4,
        mapId: 2,
        shopPools: [],
        inventory: { items: [], currency: 0 },
        behaviorTreeId: undefined,
        level: 1,
        experience: 0,
        raceId: 'human',
        maxHp: 70,
        currentHp: 70,
        attack: 6
      };

      // Add characters to registry
      registryManager.addCharacter(guardCharacter);
      registryManager.addCharacter(merchantCharacter);
      registryManager.addCharacter(patrolCharacter);
      registryManager.addCharacter(regularNPC);

      // Assign behavior trees
      const allCharacters = registryManager.getAllCharacters();
      behaviorTreeService.assignBehaviorTreesToCharacters(allCharacters, 999); // Use non-existent player ID

      // Verify assignments
      const updatedGuard = registryManager.getCharacter(1);
      const updatedMerchant = registryManager.getCharacter(2);
      const updatedPatrol = registryManager.getCharacter(3);
      const updatedNPC = registryManager.getCharacter(4);

      expect(updatedGuard?.behaviorTreeId).toBe('guard_patrol');
      expect(updatedMerchant?.behaviorTreeId).toBe('merchant_behavior');
      expect(updatedPatrol?.behaviorTreeId).toBe('simple_patrol');
      expect(updatedNPC?.behaviorTreeId).toBe('idle_behavior');
    });

    it('should not overwrite existing behavior tree assignments', () => {
      // Create a character with a pre-assigned behavior tree
      const character: Character = {
        id: 1,
        name: 'Custom NPC',
        location: 1,
        unitId: 1,
        mapId: 2,
        shopPools: [],
        inventory: { items: [], currency: 0 },
        behaviorTreeId: 'custom_behavior', // Pre-assigned
        level: 1,
        experience: 0,
        raceId: 'human',
        maxHp: 100,
        currentHp: 100,
        attack: 10
      };

      registryManager.addCharacter(character);

      // Assign behavior trees (should skip this character)
      const allCharacters = registryManager.getAllCharacters();
      behaviorTreeService.assignBehaviorTreesToCharacters(allCharacters, 999);

      // The custom behavior tree should be preserved
      const updatedCharacter = registryManager.getCharacter(1);
      expect(updatedCharacter?.behaviorTreeId).toBe('custom_behavior');
    });

    it('should handle characters without behavior trees gracefully', () => {
      // Create a character without a behavior tree
      const character: Character = {
        id: 1,
        name: 'TestNPC',
        location: 1,
        unitId: 1,
        mapId: 2,
        shopPools: [],
        inventory: { items: [], currency: 0 },
        behaviorTreeId: undefined,
        level: 1,
        experience: 0,
        raceId: 'human',
        maxHp: 100,
        currentHp: 100,
        attack: 10
      };

      registryManager.addCharacter(character);

      // Assign behavior trees
      const allCharacters = registryManager.getAllCharacters();
      behaviorTreeService.assignBehaviorTreesToCharacters(allCharacters, 999);

      // The character should now have a behavior tree assigned
      const updatedCharacter = registryManager.getCharacter(1);
      expect(updatedCharacter?.behaviorTreeId).toBeDefined();
      expect(updatedCharacter?.behaviorTreeId).toBe('idle_behavior'); // Default behavior
    });

    it('should ensure all assigned behavior trees exist in the service', () => {
      // Create characters
      const guardCharacter: Character = {
        id: 1,
        name: 'Guard',
        location: 1,
        unitId: 1,
        mapId: 2,
        shopPools: [],
        inventory: { items: [], currency: 0 },
        behaviorTreeId: undefined,
        level: 1,
        experience: 0,
        raceId: 'human',
        maxHp: 100,
        currentHp: 100,
        attack: 15
      };

      const merchantCharacter: Character = {
        id: 2,
        name: 'Merchant',
        location: 2,
        unitId: 2,
        mapId: 2,
        shopPools: ['items'],
        inventory: { items: [], currency: 100 },
        behaviorTreeId: undefined,
        level: 1,
        experience: 0,
        raceId: 'human',
        maxHp: 80,
        currentHp: 80,
        attack: 8
      };

      registryManager.addCharacter(guardCharacter);
      registryManager.addCharacter(merchantCharacter);

      // Assign behavior trees
      const allCharacters = registryManager.getAllCharacters();
      behaviorTreeService.assignBehaviorTreesToCharacters(allCharacters, 999);

      // Verify that all assigned behavior trees exist in the service
      const updatedGuard = registryManager.getCharacter(1);
      const updatedMerchant = registryManager.getCharacter(2);

      if (updatedGuard?.behaviorTreeId) {
        const behaviorTree = behaviorTreeService.getBehaviorTree(updatedGuard.behaviorTreeId);
        expect(behaviorTree).toBeDefined();
        expect(behaviorTree).not.toBeNull();
      }

      if (updatedMerchant?.behaviorTreeId) {
        const behaviorTree = behaviorTreeService.getBehaviorTree(updatedMerchant.behaviorTreeId);
        expect(behaviorTree).toBeDefined();
        expect(behaviorTree).not.toBeNull();
      }
    });
  });

  describe('Behavior Tree Service State', () => {
    it('should have all required behavior trees registered', () => {
      // The service should have all the default behavior trees
      const registeredIds = behaviorTreeService.getRegisteredBehaviorTreeIds();
      expect(registeredIds).toContain('guard_patrol');
      expect(registeredIds).toContain('merchant_behavior');
      expect(registeredIds).toContain('idle_behavior');
      expect(registeredIds).toContain('simple_patrol');
      
      // Should have exactly 4 behavior trees
      expect(behaviorTreeService.getBehaviorTreeCount()).toBe(4);
    });

    it('should maintain behavior tree count after assignments', () => {
      const initialCount = behaviorTreeService.getBehaviorTreeCount();
      
      // Create and assign behavior trees to characters
      const character: Character = {
        id: 1,
        name: 'Test NPC',
        location: 1,
        unitId: 1,
        mapId: 2,
        shopPools: [],
        inventory: { items: [], currency: 0 },
        behaviorTreeId: undefined,
        level: 1,
        experience: 0,
        raceId: 'human',
        maxHp: 100,
        currentHp: 100,
        attack: 10
      };

      registryManager.addCharacter(character);
      const allCharacters = registryManager.getAllCharacters();
      behaviorTreeService.assignBehaviorTreesToCharacters(allCharacters, 999);

      // The count should remain the same (no new trees created)
      expect(behaviorTreeService.getBehaviorTreeCount()).toBe(initialCount);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle empty character arrays gracefully', () => {
      // Should not crash with empty array
      expect(() => {
        behaviorTreeService.assignBehaviorTreesToCharacters([], 1);
      }).not.toThrow();
    });

    it('should handle characters with invalid behavior tree IDs gracefully', () => {
      // Create a character with an invalid behavior tree ID
      const character: Character = {
        id: 1,
        name: 'Invalid NPC',
        location: 1,
        unitId: 1,
        mapId: 2,
        shopPools: [],
        inventory: { items: [], currency: 0 },
        behaviorTreeId: 'nonexistent_behavior',
        level: 1,
        experience: 0,
        raceId: 'human',
        maxHp: 100,
        currentHp: 100,
        attack: 10
      };

      registryManager.addCharacter(character);

      // Assign behavior trees (should skip this character due to existing assignment)
      const allCharacters = registryManager.getAllCharacters();
      behaviorTreeService.assignBehaviorTreesToCharacters(allCharacters, 999);

      // The invalid behavior tree should remain (not overwritten)
      const updatedCharacter = registryManager.getCharacter(1);
      expect(updatedCharacter?.behaviorTreeId).toBe('nonexistent_behavior');
    });

    it('should handle player character correctly', () => {
      // Create a player character
      const playerCharacter: Character = {
        id: 1,
        name: 'Player',
        location: 1,
        unitId: 1,
        mapId: 2,
        shopPools: [],
        inventory: { items: [], currency: 0 },
        behaviorTreeId: undefined,
        level: 1,
        experience: 0,
        raceId: 'human',
        maxHp: 100,
        currentHp: 100,
        attack: 10
      };

      registryManager.addCharacter(playerCharacter);

      // Assign behavior trees with this character as the player
      const allCharacters = registryManager.getAllCharacters();
      behaviorTreeService.assignBehaviorTreesToCharacters(allCharacters, 1); // player ID is 1

      // Player should not have a behavior tree assigned
      const updatedPlayer = registryManager.getCharacter(1);
      expect(updatedPlayer?.behaviorTreeId).toBeUndefined();
    });
  });
});
