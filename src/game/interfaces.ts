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
  locations: number[];
  characterIds: number[]; // List of character IDs present in this map
}

export interface MapRegistry {
  maps: Map<number, GameMap>; // Map of map ID to GameMap
  locations: Map<number, Location[]>; // Map of map ID to array of locations
}

export interface SaveFile {
  name: string;
  lastOpened: string; // ISO 8601 date string
  version: string; // Game version when save was created
  createdAt: string; // ISO 8601 date string when save was first created
  characterRegistry: CharacterRegistry; // Registry of all characters in the game
  playerCharacterId: number; // ID of the player's character
  mapRegistry: MapRegistry; // Registry of all maps in the game
}

export interface Character {
  id: number;
  name: string;
  location: number;
  unitId: number;
  mapId: number; // ID of the map the character is currently on
}

export interface CharacterRegistry {
  characters: Map<number, Character>;
} 