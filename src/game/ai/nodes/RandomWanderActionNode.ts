import { ActionNode, BehaviorContext, BehaviorStatus } from '../BehaviorTree';
import { Location } from '../../interface/map';

/**
 * Action node that makes a character wander randomly to adjacent locations
 */
export class RandomWanderActionNode extends ActionNode {
  private lastMoveTime: number = 0;
  private moveCooldown: number = 5000; // 5 second cooldown between random moves
  private wanderRadius: number = 2; // Maximum distance to wander from starting position

  constructor() {
    super('Random Wander');
  }

  execute(context: BehaviorContext): BehaviorStatus {
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

    // Get current location
    const currentLocation = map.locations.find((loc: Location) => loc.id === character.location);
    if (!currentLocation) {
      return BehaviorStatus.FAILURE;
    }

    // Find all adjacent locations
    const adjacentLocations: number[] = [];
    if (currentLocation.north !== undefined) adjacentLocations.push(currentLocation.north);
    if (currentLocation.east !== undefined) adjacentLocations.push(currentLocation.east);
    if (currentLocation.south !== undefined) adjacentLocations.push(currentLocation.south);
    if (currentLocation.west !== undefined) adjacentLocations.push(currentLocation.west);

    if (adjacentLocations.length === 0) {
      return BehaviorStatus.FAILURE; // No adjacent locations to move to
    }

    // Pick a random adjacent location
    const randomIndex = Math.floor(Math.random() * adjacentLocations.length);
    const targetLocationId = adjacentLocations[randomIndex];

    // Move to the random location
    character.location = targetLocationId;
    this.lastMoveTime = currentTime;

    return BehaviorStatus.SUCCESS;
  }

  reset(): void {
    super.reset();
    this.lastMoveTime = 0;
  }
}
