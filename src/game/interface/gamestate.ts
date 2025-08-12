import { CharacterRegistry } from './character';
import { MapRegistry } from './map';
import { GameMap, Location } from './map';
import { incrementGameTime } from '../sim/timeManager';
import { loadMapFile } from '../../utils/saveFileOperations';
import { BehaviorTreeService } from '../ai/BehaviorTreeService';

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

  /**
   * State of the world
   */
  worldState: WorldState;
}


/**
 * State of the world
 */
export interface WorldState {
  /**
   * Current in-game time in minutes since midnight (0-1439)
   */
  gameTime: number;
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

  /**
   * Centralized simulation function that advances time and runs game logic.
   * This is the ONLY way to advance time in the game - all time changes must go through this method.
   * 
   * @param minutes - Number of minutes to simulate
   * @returns The new game time after simulation
   */
  simulate(minutes: number): number {
    if (!this.currentSave) {
      throw new Error('Cannot simulate: No save file loaded');
    }

    if (minutes <= 0) {
      throw new Error('Cannot simulate: Minutes must be positive');
    }

    const playerCharacter = this.currentSave.characterRegistry.characters.get(this.currentSave.playerCharacterId);
    if (!playerCharacter) {
      throw new Error('Cannot simulate: Player character not found');
    }
    
    // Use the centralized time management system
    const newTime = incrementGameTime(this.currentSave.worldState.gameTime, minutes, playerCharacter);
    
    // Update the save with the new time
    this.currentSave = {
      ...this.currentSave,
      worldState: {
        ...this.currentSave.worldState,
        gameTime: newTime
      }
    };

    // Simulate AI characters with behavior trees on the player's current map
    const behaviorTreeService = BehaviorTreeService.getInstance();
    behaviorTreeService.simulateCharactersOnMap(playerCharacter.mapId, this.currentSave, newTime);

    // Notify listeners of the state change
    this.notify();
    
    return newTime;
  }

  emit() {
    this.notify();
  }
}

// Create a singleton instance
export const gameStateStore = new GameStateStore();
