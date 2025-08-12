import { ConditionNode, BehaviorContext, BehaviorStatus } from '../BehaviorTree';
import { Location } from '../../interface/map';
import { Character } from '../../interface/character';

/**
 * Condition node that checks if there are threats detected in the character's area
 */
export class IsThreatDetectedConditionNode extends ConditionNode {
  constructor() {
    super('Is Threat Detected');
  }

  execute(context: BehaviorContext): BehaviorStatus {
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

    // Check for other characters at the same location
    const charactersAtLocation = context.gameState.characterRegistry.characters.values()
      .filter((otherChar: Character) => 
        otherChar.id !== character.id && 
        otherChar.mapId === character.mapId && 
        otherChar.location === character.location
      );

    // For now, consider any other character as a potential threat
    // In a real implementation, this would check character relationships, 
    // combat stats, faction alignment, etc.
    if (charactersAtLocation.length > 0) {
      return BehaviorStatus.SUCCESS; // Threat detected
    }

    return BehaviorStatus.FAILURE; // No threat detected
  }
}
