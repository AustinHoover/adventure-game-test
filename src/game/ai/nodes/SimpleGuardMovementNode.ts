import { ActionNode, BehaviorContext, BehaviorStatus } from '../BehaviorTree';
import { Location } from '../../interface/map';

/**
 * Simple guard movement node that moves left or right randomly when possible
 */
export class SimpleGuardMovementNode extends ActionNode {
  private lastMoveTime: number = 0;
  private moveCooldown: number = 3000; // 3 second cooldown between moves

  constructor() {
    super('Simple Guard Movement');
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

    // Find available movement directions (left/right priority)
    const availableDirections: { direction: string; locationId: number }[] = [];
    
    // Check west (left)
    if (currentLocation.west !== undefined) {
      availableDirections.push({ direction: 'west', locationId: currentLocation.west });
    }
    
    // Check east (right)
    if (currentLocation.east !== undefined) {
      availableDirections.push({ direction: 'east', locationId: currentLocation.east });
    }

    // If no left/right movement available, check north/south as fallback
    if (availableDirections.length === 0) {
      if (currentLocation.north !== undefined) {
        availableDirections.push({ direction: 'north', locationId: currentLocation.north });
      }
      if (currentLocation.south !== undefined) {
        availableDirections.push({ direction: 'south', locationId: currentLocation.south });
      }
    }

    if (availableDirections.length === 0) {
      return BehaviorStatus.FAILURE; // No movement possible
    }

    // Pick a random available direction
    const randomIndex = Math.floor(Math.random() * availableDirections.length);
    const selectedDirection = availableDirections[randomIndex];

    // Move to the selected location
    character.location = selectedDirection.locationId;
    this.lastMoveTime = currentTime;

    return BehaviorStatus.SUCCESS;
  }

  reset(): void {
    super.reset();
    this.lastMoveTime = 0;
  }
}
