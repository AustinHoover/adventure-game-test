import { CharacterRegistry } from './character-interfaces';
import { MapRegistry } from './map-interfaces';
import { GameMap, Location } from './map-interfaces';
import { incrementGameTime } from '../../utils/timeManager';
import { loadMapFile } from '../../utils/saveFileOperations';

/**
 * This is the state of the game as loaded into memory.
 * It is a central store of all game data that is tracked outside the main react state.
 */
export interface GameState {
  name: string;
  lastOpened: string; // ISO 8601 date string
  version: string; // Game version when save was created
  createdAt: string; // ISO 8601 date string when save was first created
  characterRegistry: CharacterRegistry; // Registry of all characters in the game
  playerCharacterId: number; // ID of the player's character
  mapRegistry: MapRegistry; // Registry of all maps in the game
  gameTime: number; // Current in-game time in minutes since midnight (0-1439)
}

/**
 * GameStateStore manages the game state outside of React's data flow.
 * It uses a subscription pattern to notify React components of state changes.
 */
export class GameStateStore {
  private currentSave: GameState | null = null;
  private mapCache = new Map<number, { gameMap: GameMap; locations: Location[] }>();
  private listeners = new Set<() => void>();

  // Subscribe to state changes
  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  // Notify all listeners of state changes
  public notify() {
    this.listeners.forEach(listener => listener());
  }

  // Get current state snapshot
  getSnapshot(): GameState | null {
    return this.currentSave;
  }

  // Check if a save is loaded
  get isSaveLoaded(): boolean {
    return this.currentSave !== null;
  }

  // Set the current save
  setCurrentSave(save: GameState | null) {
    this.currentSave = save;
    this.notify();
  }

  // Update player currency
  updatePlayerCurrency(amount: number) {
    if (this.currentSave) {
      const playerCharacter = this.currentSave.characterRegistry.characters.get(this.currentSave.playerCharacterId);
      if (playerCharacter) {
        const newCurrency = Math.max(0, playerCharacter.inventory.currency + amount);
        playerCharacter.inventory.currency = newCurrency;
        
        // Create a new save object to trigger updates
        this.currentSave = { ...this.currentSave };
        this.notify();
      }
    }
  }

  // Advance game time
  advanceGameTime(minutes: number) {
    if (this.currentSave) {
      // Get the player character for simulation effects
      const playerCharacter = this.currentSave.characterRegistry.characters.get(this.currentSave.playerCharacterId);
      
      // Use the centralized time management system
      const newTime = incrementGameTime(this.currentSave.gameTime, minutes, playerCharacter);
      
      this.currentSave = {
        ...this.currentSave,
        gameTime: newTime
      };
      this.notify();
    }
  }

  // Get current game time
  getCurrentGameTime(): number {
    return this.currentSave?.gameTime || 360; // Default to 6:00 AM if no save
  }

  // Get current time as string
  getCurrentTimeString(): string {
    const time = this.getCurrentGameTime();
    const hours = Math.floor(time / 60);
    const minutes = time % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  // Get map info
  async getMapInfo(mapId: number): Promise<{ name: string; id: number } | null> {
    if (!this.currentSave) return null;
    
    try {
      const mapData = await loadMapFile(this.currentSave.name, mapId);
      return {
        name: mapData.gameMap.name,
        id: mapData.gameMap.id
      };
    } catch (error) {
      console.error(`Failed to load map info for map ${mapId}:`, error);
      return null;
    }
  }

  emit() {
    this.notify();
  }
}

// Create a singleton instance
export const gameStateStore = new GameStateStore();
