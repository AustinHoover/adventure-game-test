import { GameState } from './gamestate';

export interface MapObject {
  id: string;
  name: string;
  description: string;
  type: MapObjectType;
  locationId: number; // ID of the map node this object belongs to
  position: { x: number; y: number }; // Position within the map node
  visible: boolean;
  interactable: boolean;
  data: MapObjectData;
  callback?: MapObjectCallback; // Optional callback function for custom behavior
}

export enum MapObjectType {
  FURNITURE = 'furniture',
  RESOURCE = 'resource',
  MECHANICAL = 'mechanical',
  DECORATION = 'decoration',
  CONTAINER = 'container'
}

export interface MapObjectData {
  [key: string]: any;
}

// Callback function type for map objects
export type MapObjectCallback = (gameState: GameState, data: any) => void | Promise<void>;

// Specific data interfaces for different object types
export interface FurnitureData extends MapObjectData {
  material: string;
  condition: 'pristine' | 'good' | 'worn' | 'damaged' | 'broken';
  comfort?: number; // For beds, chairs, etc.
  storageCapacity?: number; // For chests, wardrobes, etc.
  craftingType?: string; // For crafting stations
}

export interface ResourceData extends MapObjectData {
  resourceType: string;
  quantity: number;
  maxQuantity: number;
  respawnTime?: number; // Time in seconds before resource respawns
  quality: 'poor' | 'normal' | 'good' | 'excellent';
  harvestMethod: string; // e.g., "mining", "chopping", "gathering"
}

export interface MechanicalData extends MapObjectData {
  mechanismType: string; // e.g., "switch", "lever", "pressure_plate"
  isActivated: boolean;
  activationRequirements?: string[]; // Items or conditions needed
  effects: string[]; // What happens when activated
  cooldown?: number; // Time before can be used again
}

export interface DecorationData extends MapObjectData {
  aestheticValue: number;
  theme: string; // e.g., "rustic", "elegant", "mystical"
  seasonal?: boolean; // Whether it changes with seasons
}

export interface ContainerData extends MapObjectData {
  containerType: string; // e.g., "chest", "barrel", "sack"
  lockLevel: number; // 0 = unlocked, higher = harder to pick
  trapLevel: number; // 0 = no trap, higher = more dangerous
  contents: string[]; // IDs of items that might be found
  lootTable?: string; // Reference to a loot table
}

export interface Location {
  id: number;
  name: string;
  type: number;
  visible: boolean;
  discovered: boolean;
  exit: boolean;
  showName: boolean; // Whether to show the location name on the map

  //north-adjacent neighbor
  north?: number;
  //east-adjacent neighbor
  east?: number;
  //south-adjacent neighbor
  south?: number;
  //west-adjacent neighbor
  west?: number;

  /**
   * Objects at this location
   */
  objects: MapObject[];

}

export interface GameMap {
  id: number;
  name: string; // Name of the map/town
  characterIds: number[]; // List of character IDs present in this map

  /**
   * The locations in the map
   */
  locations: Location[];
}

/**
 * Registry storing all map data
 */
export interface MapRegistry {

  /**
   * Map of map ID to filename (e.g., "map1.json")
   */
  mapFiles: Map<number, string>;

  /**
   * The memory-only cache of loaded maps
   */
  cachedMaps: Map<number, GameMap>;
}
