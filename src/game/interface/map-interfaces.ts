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

}

export interface GameMap {
  id: number;
  name: string; // Name of the map/town
  locations: number[];
  characterIds: number[]; // List of character IDs present in this map
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
  cachedMaps: Map<number, { gameMap: GameMap; locations: Location[] }>;
}
