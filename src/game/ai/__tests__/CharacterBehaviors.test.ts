import {
  CanMoveDirectionNode,
  MoveDirectionNode,
  IsAtLocationNode,
  TimeElapsedNode,
  WaitNode,
  BackAndForthMovementNode,
  createBackAndForthMovement
} from '../CharacterBehaviors';
import { BehaviorStatus, BehaviorContext } from '../BehaviorTree';
import { Character } from '../../interface/character';
import { GameMap, Location } from '../../interface/map';
import { GameState } from '../../interface/gamestate';

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
    level: 1,
    experience: 0,
    raceId: 'human',
    maxHp: 100,
    currentHp: 100,
    attack: 10
  };

  const mockLocation1: Location = {
    id: 1,
    name: 'Location A',
    type: 1,
    visible: true,
    discovered: true,
    exit: false,
    showName: true,
    north: 2,
    objects: []
  };

  const mockLocation2: Location = {
    id: 2,
    name: 'Location B',
    type: 1,
    visible: true,
    discovered: true,
    exit: false,
    showName: true,
    south: 1,
    objects: []
  };

  const mockMap: GameMap = {
    id: 1,
    name: 'Test Map',
    characterIds: [1],
    locations: [mockLocation1, mockLocation2]
  };

  return {
    name: 'Test Game',
    lastOpened: new Date().toISOString(),
    version: '1.0.0',
    createdAt: new Date().toISOString(),
    characterRegistry: {
      characters: new Map([[1, mockCharacter]])
    },
    playerCharacterId: 1,
    mapRegistry: {
      mapFiles: new Map(),
      cachedMaps: new Map([[1, mockMap]])
    },
    worldState: {
      gameTime: 360
    }
  } as GameState;
}

describe('CharacterBehaviors', () => {
  let mockGameState: GameState;
  let mockContext: BehaviorContext;

  beforeEach(() => {
    mockGameState = createMockGameState();
    mockContext = {
      characterId: 1,
      gameState: mockGameState,
      currentTime: Date.now()
    };
  });

  describe('CanMoveDirectionNode', () => {
    it('should succeed when character can move in the specified direction', () => {
      const node = new CanMoveDirectionNode('north');
      const result = node.execute(mockContext);
      
      expect(result).toBe(BehaviorStatus.SUCCESS);
      expect(node.getStatus()).toBe(BehaviorStatus.SUCCESS);
    });

    it('should fail when character cannot move in the specified direction', () => {
      const node = new CanMoveDirectionNode('east');
      const result = node.execute(mockContext);
      
      expect(result).toBe(BehaviorStatus.FAILURE);
      expect(node.getStatus()).toBe(BehaviorStatus.FAILURE);
    });

    it('should fail when character does not exist', () => {
      const invalidContext: BehaviorContext = {
        characterId: 999,
        gameState: mockGameState,
        currentTime: Date.now()
      };

      const node = new CanMoveDirectionNode('north');
      const result = node.execute(invalidContext);
      
      expect(result).toBe(BehaviorStatus.FAILURE);
    });
  });

  describe('MoveDirectionNode', () => {
    it('should move character to adjacent location and succeed', () => {
      const node = new MoveDirectionNode('north');
      const character = mockGameState.characterRegistry.characters.get(1)!;
      const initialLocation = character.location;
      
      const result = node.execute(mockContext);
      
      expect(result).toBe(BehaviorStatus.SUCCESS);
      expect(character.location).toBe(2); // Should move to location 2
      expect(character.location).not.toBe(initialLocation);
    });

    it('should fail when character cannot move in the specified direction', () => {
      const node = new MoveDirectionNode('east');
      const character = mockGameState.characterRegistry.characters.get(1)!;
      const initialLocation = character.location;
      
      const result = node.execute(mockContext);
      
      expect(result).toBe(BehaviorStatus.FAILURE);
      expect(character.location).toBe(initialLocation); // Should not move
    });
  });

  describe('IsAtLocationNode', () => {
    it('should succeed when character is at the target location', () => {
      const node = new IsAtLocationNode(1);
      const result = node.execute(mockContext);
      
      expect(result).toBe(BehaviorStatus.SUCCESS);
      expect(node.getStatus()).toBe(BehaviorStatus.SUCCESS);
    });

    it('should fail when character is not at the target location', () => {
      const node = new IsAtLocationNode(2);
      const result = node.execute(mockContext);
      
      expect(result).toBe(BehaviorStatus.FAILURE);
      expect(node.getStatus()).toBe(BehaviorStatus.FAILURE);
    });
  });

  describe('TimeElapsedNode', () => {
    it('should succeed when enough time has passed', () => {
      const node = new TimeElapsedNode(100);
      const result = node.execute(mockContext);
      
      expect(result).toBe(BehaviorStatus.SUCCESS);
      expect(node.getStatus()).toBe(BehaviorStatus.SUCCESS);
    });

    it('should fail when not enough time has passed', () => {
      const node = new TimeElapsedNode(1000);

      //execute once to set the last action time
      node.execute(mockContext);

      //execute again to check if it fails
      const result = node.execute(mockContext);
      
      expect(result).toBe(BehaviorStatus.FAILURE);
      expect(node.getStatus()).toBe(BehaviorStatus.FAILURE);
    });

    it('should reset last action time on reset', () => {
      const node = new TimeElapsedNode(100);
      node.execute(mockContext); // Should succeed
      
      node.reset();
      const result = node.execute(mockContext); // Should succeed again
      
      expect(result).toBe(BehaviorStatus.SUCCESS);
    });
  });

  describe('WaitNode', () => {
    it('should return running initially', () => {
      const node = new WaitNode(100);
      const result = node.execute(mockContext);
      
      expect(result).toBe(BehaviorStatus.RUNNING);
      expect(node.getStatus()).toBe(BehaviorStatus.RUNNING);
    });

    it('should return running until wait time has elapsed', () => {
      const node = new WaitNode(100);
      
      // First execution should start waiting
      let result = node.execute(mockContext);
      expect(result).toBe(BehaviorStatus.RUNNING);
      
      // Simulate time passing by updating context
      const futureContext: BehaviorContext = {
        ...mockContext,
        currentTime: mockContext.currentTime + 50 // Half the wait time
      };
      
      result = node.execute(futureContext);
      expect(result).toBe(BehaviorStatus.RUNNING);
      
      // After full wait time, should succeed
      const finalContext: BehaviorContext = {
        ...mockContext,
        currentTime: mockContext.currentTime + 100 // Full wait time
      };
      
      result = node.execute(finalContext);
      expect(result).toBe(BehaviorStatus.SUCCESS);
    });

    it('should reset waiting state on reset', () => {
      const node = new WaitNode(100);
      node.execute(mockContext); // Start waiting
      
      node.reset();
      const result = node.execute(mockContext); // Should start waiting again
      
      expect(result).toBe(BehaviorStatus.RUNNING);
    });
  });

  describe('BackAndForthMovementNode', () => {
    it('should create a behavior tree with the correct structure', () => {
      const node = new BackAndForthMovementNode(1, 2, 'north', 500);
      
      expect(node.getName()).toBe('BackAndForthMovement');
      expect(node.getStatus()).toBe(BehaviorStatus.FAILURE);
    });

    it('should execute successfully', () => {
      const node = new BackAndForthMovementNode(1, 2, 'north', 100);
      const result = node.execute(mockContext);
      
      // Should be running as it's a repeating behavior
      expect(result).toBe(BehaviorStatus.RUNNING);
      expect(node.getStatus()).toBe(BehaviorStatus.RUNNING);
    });

    it('should reset properly', () => {
      const node = new BackAndForthMovementNode(1, 2, 'north', 100);
      node.execute(mockContext);
      
      node.reset();
      expect(node.getStatus()).toBe(BehaviorStatus.FAILURE);
    });
  });

  describe('createBackAndForthMovement', () => {
    it('should create a back and forth movement behavior', () => {
      const behavior = createBackAndForthMovement(1, 2, 'north', 500);
      
      expect(behavior).toBeInstanceOf(BackAndForthMovementNode);
      expect(behavior.getName()).toBe('BackAndForthMovement');
    });
  });

  describe('Integration Tests', () => {
    it('should execute a complete back and forth movement cycle', () => {
      const behavior = createBackAndForthMovement(1, 2, 'north', 50);
      const character = mockGameState.characterRegistry.characters.get(1)!;
      
      // Start at location 1
      expect(character.location).toBe(1);
      
      // Execute behavior - should move to location 2
      let result = behavior.execute(mockContext);
      expect(result).toBe(BehaviorStatus.RUNNING);
      expect(character.location).toBe(2);
      
      // Wait a bit and execute again - should move back to location 1
      const futureContext: BehaviorContext = {
        ...mockContext,
        currentTime: mockContext.currentTime + 100
      };
      
      result = behavior.execute(futureContext);
      expect(result).toBe(BehaviorStatus.RUNNING);
      expect(character.location).toBe(1);
    });

    it('should handle invalid movement gracefully', () => {
      const behavior = createBackAndForthMovement(1, 3, 'east', 50); // Invalid direction
      const character = mockGameState.characterRegistry.characters.get(1)!;
      
      // Should fail gracefully when trying to move in invalid direction
      const result = behavior.execute(mockContext);
      expect(result).toBe(BehaviorStatus.FAILURE);
      expect(character.location).toBe(1); // Should not move
    });
  });
});
