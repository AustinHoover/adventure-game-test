import { ActionNode, BehaviorContext, BehaviorStatus } from '../BehaviorTree';
import { Location } from '../../interface/map';

/**
 * Action node that handles character patrolling between specified locations
 */
export class PatrolActionNode extends ActionNode {
  private currentPatrolIndex: number = 0;
  private lastMoveTime: number = 0;
  private moveCooldown: number = 1000; // 1 second cooldown between moves

  constructor(
    private patrolPoints: number[],
    private waitTime: number
  ) {
    super('Patrol Action');
  }

  execute(context: BehaviorContext): BehaviorStatus {
    if (this.patrolPoints.length === 0) {
      return BehaviorStatus.FAILURE;
    }

    const currentTime = context.currentTime;
    
    // Check if we should wait before moving
    if (currentTime - this.lastMoveTime < this.moveCooldown) {
      return BehaviorStatus.RUNNING;
    }

    // Get current character
    const character = context.gameState.characterRegistry.characters.get(context.characterId);
    if (!character) {
      return BehaviorStatus.FAILURE;
    }

    // Get current map
    const map = context.gameState.mapRegistry.cachedMaps.get(character.mapId);
    if (!map) {
      return BehaviorStatus.FAILURE;
    }

    // Get current target location
    const targetLocationId = this.patrolPoints[this.currentPatrolIndex];
    const targetLocation = map.locations.find((loc: Location) => loc.id === targetLocationId);
    
    if (!targetLocation) {
      return BehaviorStatus.FAILURE;
    }

    // If we're already at the target location, move to next patrol point
    if (character.location === targetLocationId) {
      this.currentPatrolIndex = (this.currentPatrolIndex + 1) % this.patrolPoints.length;
      this.lastMoveTime = currentTime;
      return BehaviorStatus.SUCCESS;
    }

    // Check if target location is accessible from current location
    const currentLocation = map.locations.find((loc: Location) => loc.id === character.location);
    if (!currentLocation) {
      return BehaviorStatus.FAILURE;
    }

    // Simple pathfinding - check if locations are adjacent
    if (this.areLocationsAdjacent(currentLocation, targetLocation)) {
      // Move to target location
      character.location = targetLocationId;
      this.lastMoveTime = currentTime;
      return BehaviorStatus.SUCCESS;
    }

    // If not adjacent, try to find a path (simplified for now)
    // For now, just return running to indicate we're working on it
    return BehaviorStatus.RUNNING;
  }

  private areLocationsAdjacent(loc1: any, loc2: any): boolean {
    return loc1.north === loc2.id || 
           loc1.east === loc2.id || 
           loc1.south === loc2.id || 
           loc1.west === loc2.id;
  }

  reset(): void {
    super.reset();
    this.currentPatrolIndex = 0;
    this.lastMoveTime = 0;
  }
}
