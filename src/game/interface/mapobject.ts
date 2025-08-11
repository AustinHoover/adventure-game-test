import { MapObject, MapObjectCallback } from './map';
import { GameState } from './gamestate';

/**
 * Executes the callback function for a map object if one exists
 * @param mapObject The map object to interact with
 * @param gameState The current game state
 * @param additionalData Any additional data to pass to the callback
 * @returns Promise that resolves when the callback completes
 */
export async function executeMapObjectCallback(
  mapObject: MapObject,
  gameState: GameState,
  additionalData: any = {}
): Promise<void> {
  if (!mapObject.callback) {
    console.log(`No callback defined for ${mapObject.name}`);
    return;
  }

  try {
    // Merge the object's data with any additional data passed in
    const callbackData = { ...mapObject.data, ...additionalData };
    
    // Execute the callback
    await mapObject.callback(gameState, mapObject, callbackData);
    
    console.log(`Successfully executed callback for ${mapObject.name}`);
  } catch (error) {
    console.error(`Error executing callback for ${mapObject.name}:`, error);
  }
}

/**
 * Checks if a map object has a callback function
 * @param mapObject The map object to check
 * @returns True if the object has a callback, false otherwise
 */
export function hasMapObjectCallback(mapObject: MapObject): boolean {
  return typeof mapObject.callback === 'function';
}

/**
 * Gets a description of what a map object's callback does
 * @param mapObject The map object to describe
 * @returns A string description of the callback's purpose, or null if no callback
 */
export function getMapObjectCallbackDescription(mapObject: MapObject): string | null {
  if (!mapObject.callback) {
    return null;
  }

  // You could extend this to provide more specific descriptions based on object type
  switch (mapObject.type) {
    case 'furniture':
      return 'Interact with this furniture';
    case 'resource':
      return 'Harvest this resource';
    case 'mechanical':
      return 'Activate this mechanism';
    case 'container':
      return 'Open this container';
    case 'decoration':
      return 'Examine this decoration';
    default:
      return 'Interact with this object';
  }
}
