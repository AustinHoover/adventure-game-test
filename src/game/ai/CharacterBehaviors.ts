import { 
  ActionNode, 
  ConditionNode, 
  BehaviorStatus, 
  BehaviorContext,
  SequenceNode,
  SelectorNode,
  InverterNode,
  RepeaterNode,
  BehaviorNode
} from './BehaviorTree';
import { Character } from '../interface/character';
import { GameMap, Location } from '../interface/map';
import { GameState } from '../interface/gamestate';

/**
 * Condition node that checks if a character can move in a specific direction
 */
export class CanMoveDirectionNode extends ConditionNode {
  private direction: 'north' | 'east' | 'south' | 'west';

  constructor(direction: 'north' | 'east' | 'south' | 'west') {
    super(`CanMove${direction.charAt(0).toUpperCase() + direction.slice(1)}`);
    this.direction = direction;
  }

  execute(context: BehaviorContext): BehaviorStatus {
    const gameState = context.gameState as GameState;
    const character = gameState.characterRegistry.characters.get(context.characterId);
    
    if (!character) {
      this.status = BehaviorStatus.FAILURE;
      return BehaviorStatus.FAILURE;
    }

    const map = this.getCharacterMap(gameState, character);
    if (!map) {
      this.status = BehaviorStatus.FAILURE;
      return BehaviorStatus.FAILURE;
    }

    const currentLocation = map.locations.find(loc => loc.id === character.location);
    if (!currentLocation) {
      this.status = BehaviorStatus.FAILURE;
      return BehaviorStatus.FAILURE;
    }

    const adjacentLocationId = currentLocation[this.direction];
    if (adjacentLocationId === undefined) {
      this.status = BehaviorStatus.FAILURE;
      return BehaviorStatus.FAILURE;
    }

    const adjacentLocation = map.locations.find(loc => loc.id === adjacentLocationId);
    if (!adjacentLocation) {
      this.status = BehaviorStatus.FAILURE;
      return BehaviorStatus.FAILURE;
    }

    this.status = BehaviorStatus.SUCCESS;
    return BehaviorStatus.SUCCESS;
  }

  private getCharacterMap(gameState: GameState, character: Character): GameMap | null {
    return gameState.mapRegistry.cachedMaps.get(character.mapId) || null;
  }
}

/**
 * Action node that moves a character in a specific direction
 */
export class MoveDirectionNode extends ActionNode {
  private direction: 'north' | 'east' | 'south' | 'west';

  constructor(direction: 'north' | 'east' | 'south' | 'west') {
    super(`Move${direction.charAt(0).toUpperCase() + direction.slice(1)}`);
    this.direction = direction;
  }

  execute(context: BehaviorContext): BehaviorStatus {
    const gameState = context.gameState as GameState;
    const character = gameState.characterRegistry.characters.get(context.characterId);
    
    if (!character) {
      this.status = BehaviorStatus.FAILURE;
      return BehaviorStatus.FAILURE;
    }

    const map = this.getCharacterMap(gameState, character);
    if (!map) {
      this.status = BehaviorStatus.FAILURE;
      return BehaviorStatus.FAILURE;
    }

    const currentLocation = map.locations.find(loc => loc.id === character.location);
    if (!currentLocation) {
      this.status = BehaviorStatus.FAILURE;
      return BehaviorStatus.FAILURE;
    }

    const adjacentLocationId = currentLocation[this.direction];
    if (adjacentLocationId === undefined) {
      this.status = BehaviorStatus.FAILURE;
      return BehaviorStatus.FAILURE;
    }

    // Move the character to the adjacent location
    character.location = adjacentLocationId;
    
    this.status = BehaviorStatus.SUCCESS;
    return BehaviorStatus.SUCCESS;
  }

  private getCharacterMap(gameState: GameState, character: Character): GameMap | null {
    return gameState.mapRegistry.cachedMaps.get(character.mapId) || null;
  }
}

/**
 * Condition node that checks if a character is at a specific location
 */
export class IsAtLocationNode extends ConditionNode {
  private targetLocationId: number;

  constructor(targetLocationId: number) {
    super(`IsAtLocation${targetLocationId}`);
    this.targetLocationId = targetLocationId;
  }

  execute(context: BehaviorContext): BehaviorStatus {
    const gameState = context.gameState as GameState;
    const character = gameState.characterRegistry.characters.get(context.characterId);
    
    if (!character) {
      this.status = BehaviorStatus.FAILURE;
      return BehaviorStatus.FAILURE;
    }

    if (character.location === this.targetLocationId) {
      this.status = BehaviorStatus.SUCCESS;
      return BehaviorStatus.SUCCESS;
    }

    this.status = BehaviorStatus.FAILURE;
    return BehaviorStatus.FAILURE;
  }
}

/**
 * Condition node that checks if enough time has passed since the last action
 */
export class TimeElapsedNode extends ConditionNode {
  private requiredTime: number;
  private lastActionTime: number = 0;

  constructor(requiredTime: number) {
    super(`TimeElapsed${requiredTime}ms`);
    this.requiredTime = requiredTime;
  }

  execute(context: BehaviorContext): BehaviorStatus {
    const currentTime = context.currentTime;
    
    if (currentTime - this.lastActionTime >= this.requiredTime) {
      this.lastActionTime = currentTime;
      this.status = BehaviorStatus.SUCCESS;
      return BehaviorStatus.SUCCESS;
    }

    this.status = BehaviorStatus.FAILURE;
    return BehaviorStatus.FAILURE;
  }

  reset(): void {
    super.reset();
    this.lastActionTime = 0;
  }
}

/**
 * Action node that waits for a specified amount of time
 */
export class WaitNode extends ActionNode {
  private waitTime: number;
  private startTime: number = 0;
  private isWaiting: boolean = false;

  constructor(waitTime: number) {
    super(`Wait${waitTime}ms`);
    this.waitTime = waitTime;
  }

  execute(context: BehaviorContext): BehaviorStatus {
    const currentTime = context.currentTime;
    
    if (!this.isWaiting) {
      this.startTime = currentTime;
      this.isWaiting = true;
      this.status = BehaviorStatus.RUNNING;
      return BehaviorStatus.RUNNING;
    }

    if (currentTime - this.startTime >= this.waitTime) {
      this.isWaiting = false;
      this.status = BehaviorStatus.SUCCESS;
      return BehaviorStatus.SUCCESS;
    }

    this.status = BehaviorStatus.RUNNING;
    return BehaviorStatus.RUNNING;
  }

  reset(): void {
    super.reset();
    this.isWaiting = false;
    this.startTime = 0;
  }
}

/**
 * Composite behavior for moving back and forth between two adjacent locations
 */
export class BackAndForthMovementNode extends SequenceNode {
  private locationA: number;
  private locationB: number;
  private directionAtoB: 'north' | 'east' | 'south' | 'west';
  private directionBtoA: 'north' | 'east' | 'south' | 'west';

  constructor(
    locationA: number, 
    locationB: number, 
    directionAtoB: 'north' | 'east' | 'south' | 'west',
    waitTime: number = 1000
  ) {
    super('BackAndForthMovement', []);
    
    this.locationA = locationA;
    this.locationB = locationB;
    this.directionAtoB = directionAtoB;
    this.directionBtoA = this.getOppositeDirection(directionAtoB);

    // Build the behavior tree for back and forth movement
    const moveToB = new SequenceNode('MoveToB', [
      new CanMoveDirectionNode(this.directionAtoB),
      new MoveDirectionNode(this.directionAtoB),
      new WaitNode(waitTime)
    ]);

    const moveToA = new SequenceNode('MoveToA', [
      new CanMoveDirectionNode(this.directionBtoA),
      new MoveDirectionNode(this.directionBtoA),
      new WaitNode(waitTime)
    ]);

    // Create a repeating sequence: move to B, then move to A, repeat
    const movementCycle = new SequenceNode('MovementCycle', [moveToB, moveToA]);
    
    // Add the movement cycle as a child and make it repeat infinitely
    this.addChild(new RepeaterNode('RepeatMovement', movementCycle, -1));
  }

  private getOppositeDirection(direction: 'north' | 'east' | 'south' | 'west'): 'north' | 'east' | 'south' | 'west' {
    switch (direction) {
      case 'north': return 'south';
      case 'east': return 'west';
      case 'south': return 'north';
      case 'west': return 'east';
    }
  }
}

/**
 * Factory function to create a back-and-forth movement behavior
 */
export function createBackAndForthMovement(
  locationA: number,
  locationB: number,
  directionAtoB: 'north' | 'east' | 'south' | 'west',
  waitTime: number = 1000
): BackAndForthMovementNode {
  return new BackAndForthMovementNode(locationA, locationB, directionAtoB, waitTime);
}

/**
 * Factory function to create a simple patrol behavior between multiple locations
 */
export function createPatrolBehavior(
  locations: number[],
  waitTime: number = 1000
): BehaviorNode {
  if (locations.length < 2) {
    throw new Error('Patrol behavior requires at least 2 locations');
  }

  const patrolSequence = new SequenceNode('PatrolSequence', []);
  
  for (let i = 0; i < locations.length; i++) {
    const currentLocation = locations[i];
    const nextLocation = locations[(i + 1) % locations.length];
    
    // Find the direction to the next location
    const direction = findDirectionBetweenLocations(currentLocation, nextLocation);
    if (direction) {
      const moveToNext = new SequenceNode(`MoveTo${nextLocation}`, [
        new CanMoveDirectionNode(direction),
        new MoveDirectionNode(direction),
        new WaitNode(waitTime)
      ]);
      patrolSequence.addChild(moveToNext);
    }
  }

  // Make the patrol repeat infinitely
  return new RepeaterNode('RepeatPatrol', patrolSequence, -1);
}

/**
 * Helper function to determine the direction between two adjacent locations
 * This is a simplified version - in a real implementation, you'd need to
 * analyze the actual map structure to determine valid connections
 */
function findDirectionBetweenLocations(
  fromLocation: number, 
  toLocation: number
): 'north' | 'east' | 'south' | 'west' | null {
  // This is a placeholder implementation
  // In reality, you'd need to check the actual map connections
  // For now, we'll assume a simple grid layout
  return 'north'; // Default direction
}
