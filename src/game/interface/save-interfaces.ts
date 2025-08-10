import { CharacterRegistry } from './character-interfaces';
import { MapRegistry } from './map-interfaces';

export interface SaveFile {
  name: string;
  lastOpened: string; // ISO 8601 date string
  version: string; // Game version when save was created
  createdAt: string; // ISO 8601 date string when save was first created
  characterRegistry: CharacterRegistry; // Registry of all characters in the game
  playerCharacterId: number; // ID of the player's character
  mapRegistry: MapRegistry; // Registry of all maps in the game
  gameTime: number; // Current in-game time in minutes since midnight (0-1439)
}
