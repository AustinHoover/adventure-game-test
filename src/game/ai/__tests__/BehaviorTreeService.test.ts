import { BehaviorTreeService } from '../BehaviorTreeService';
import { BehaviorTreeFactory } from '../BehaviorTreeFactory';
import { Character } from '../../interface/character';
import { GameState } from '../../interface/gamestate';
import { BehaviorStatus } from '../BehaviorTree';

// Mock game state for testing
function createMockGameState(): GameState {
  const mockCharacter: Character = {
    id: 1,
    name: 'TestCharacter',
    location: 1,
    unitId: 1,
    mapId: 1,
    shopPools: [],
    inventory: { items: [], currency: 0 },
    behaviorTreeId: 'test_behavior',
    level: 1,
    experience: 0,
    raceId: 'human',
    maxHp: 100,
    currentHp: 100,
    attack: 10
  };

  return {
    name: 'Test Game',
    lastOpened: new Date().toISOString(),
    version: '1.0.0',
    createdAt: new Date().toISOString(),
    characterRegistry: {
      characters: new Map([[1, mockCharacter]])
    },
    playerCharacterId: 999, // Use a different ID so the test character isn't the player
    mapRegistry: {
      mapFiles: new Map(),
      cachedMaps: new Map()
    },
    worldState: {
      gameTime: 360
    }
  } as GameState;
}

describe('BehaviorTreeService', () => {
  let service: BehaviorTreeService;
  let mockGameState: GameState;

  beforeEach(() => {
    service = BehaviorTreeService.getInstance();
    service.clear(); // Clear any existing state
    mockGameState = createMockGameState();
  });

  afterEach(() => {
    service.clear();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = BehaviorTreeService.getInstance();
      const instance2 = BehaviorTreeService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('Behavior Tree Registration', () => {
    it('should register and retrieve behavior trees', () => {
      const behaviorTree = BehaviorTreeFactory.createIdleBehavior();
      
      service.registerBehaviorTree('test_tree', behaviorTree);
      
      expect(service.getBehaviorTree('test_tree')).toBe(behaviorTree);
      expect(service.getBehaviorTreeCount()).toBe(1);
    });

    it('should handle multiple behavior trees', () => {
      const tree1 = BehaviorTreeFactory.createIdleBehavior();
      const tree2 = BehaviorTreeFactory.createMerchantBehavior();
      
      service.registerBehaviorTree('tree1', tree1);
      service.registerBehaviorTree('tree2', tree2);
      
      expect(service.getBehaviorTreeCount()).toBe(2);
      expect(service.getRegisteredBehaviorTreeIds()).toContain('tree1');
      expect(service.getRegisteredBehaviorTreeIds()).toContain('tree2');
    });

    it('should remove behavior trees', () => {
      const behaviorTree = BehaviorTreeFactory.createIdleBehavior();
      service.registerBehaviorTree('test_tree', behaviorTree);
      
      expect(service.removeBehaviorTree('test_tree')).toBe(true);
      expect(service.getBehaviorTreeCount()).toBe(0);
      expect(service.getBehaviorTree('test_tree')).toBeUndefined();
    });
  });

  describe('Character Simulation', () => {
    it('should simulate characters with behavior trees on a map', () => {
      // Register a behavior tree
      const behaviorTree = BehaviorTreeFactory.createIdleBehavior();
      service.registerBehaviorTree('test_behavior', behaviorTree);
      
      // Mock console.debug to capture logs
      const consoleSpy = jest.spyOn(console, 'debug').mockImplementation();
      
      // Simulate characters on map 1
      service.simulateCharactersOnMap(1, mockGameState, 360);
      
      // Should have called console.debug for the character
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });

    it('should handle characters without behavior trees', () => {
      // Create a character without a behavior tree
      const characterWithoutBehavior: Character = {
        ...mockGameState.characterRegistry.characters.get(1)!,
        behaviorTreeId: undefined
      };
      
      const newGameState = {
        ...mockGameState,
        characterRegistry: {
          characters: new Map([[1, characterWithoutBehavior]])
        }
      };
      
      // Mock console.debug to capture logs
      const consoleSpy = jest.spyOn(console, 'debug').mockImplementation();
      
      // Simulate characters on map 1
      service.simulateCharactersOnMap(1, newGameState, 360);
      
      // Should not have called console.debug since no behavior tree
      expect(consoleSpy).not.toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });

    it('should handle missing behavior trees gracefully', () => {
      // Create a character with a non-existent behavior tree
      const characterWithMissingBehavior: Character = {
        ...mockGameState.characterRegistry.characters.get(1)!,
        behaviorTreeId: 'non_existent_tree',
        id: 2, // Use a different ID so it's not the player
        mapId: 1 // Ensure it's on the map we're simulating
      };
      
      const newGameState = {
        ...mockGameState,
        characterRegistry: {
          characters: new Map([
            [1, mockGameState.characterRegistry.characters.get(1)!], // Keep original character
            [2, characterWithMissingBehavior] // Add the problematic character
          ])
        }
      };
      
      // Mock console.warn to capture warnings
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      // Simulate characters on map 1
      service.simulateCharactersOnMap(1, newGameState, 360);
      
      // Should have warned about missing behavior tree
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('has behavior tree ID non_existent_tree but no such tree exists')
      );
      
      consoleSpy.mockRestore();
    });
  });

  describe('Map Filtering', () => {
    it('should only simulate characters on the specified map', () => {
      // Create characters on different maps
      const characterOnMap1: Character = {
        ...mockGameState.characterRegistry.characters.get(1)!,
        mapId: 1,
        behaviorTreeId: 'test_behavior',
        id: 1 // Ensure this character has the right ID
      };
      
      const characterOnMap2: Character = {
        ...mockGameState.characterRegistry.characters.get(1)!,
        id: 2,
        mapId: 2,
        behaviorTreeId: 'test_behavior'
      };
      
      const newGameState = {
        ...mockGameState,
        characterRegistry: {
          characters: new Map([
            [1, characterOnMap1],
            [2, characterOnMap2]
          ])
        }
      };
      
      // Register behavior tree
      const behaviorTree = BehaviorTreeFactory.createIdleBehavior();
      service.registerBehaviorTree('test_behavior', behaviorTree);
      
      // Mock console.debug to capture logs
      const consoleSpy = jest.spyOn(console, 'debug').mockImplementation();
      
      // Simulate only on map 1
      service.simulateCharactersOnMap(1, newGameState, 360);
      
      // Should only have called console.debug once (for character on map 1)
      expect(consoleSpy).toHaveBeenCalledTimes(1);
      
      consoleSpy.mockRestore();
    });
  });
});

