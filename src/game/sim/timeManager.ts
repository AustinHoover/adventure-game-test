import { Character } from '../interface/character';
import { runHourlySimulation, runPerMinuteSimulation } from './simulation';

/**
 * Centralized time management for the game.
 * 
 * IMPORTANT: This is the ONE main place to increment time - all time changes should go through this system.
 * 
 * USAGE:
 * - Import this function: import { incrementGameTime } from '../utils/timeManager';
 * - Call it whenever you need to advance time: incrementGameTime(currentTime, minutesToAdd, playerCharacter);
 * - The function automatically handles time wrapping (24-hour cycle) and simulation effects
 * 
 * EXAMPLES:
 * - Movement: incrementGameTime(currentTime, 5, playerCharacter); // 5 minutes for movement
 * - Waiting: incrementGameTime(currentTime, 5, playerCharacter); // 5 minutes for waiting
 * - Long rest: incrementGameTime(currentTime, 480, playerCharacter); // 8 hours for rest
 * 
 * DO NOT manually calculate time changes or modify gameTime directly!
 * Always use this function to ensure simulation effects are properly triggered.
 */

/**
 * Increments the game time by the specified number of minutes and runs simulation logic.
 * This is the centralized function for all time increments in the game.
 * 
 * @param currentTime - Current game time in minutes since midnight (0-1439)
 * @param minutesToAdd - Number of minutes to add to the current time
 * @param playerCharacter - The player character to apply simulation effects to
 * @returns The new game time in minutes since midnight
 */
export function incrementGameTime(
  currentTime: number, 
  minutesToAdd: number, 
  playerCharacter?: Character
): number {
  // Calculate new time, wrapping around at 24 hours (1440 minutes)
  const newTime = (currentTime + minutesToAdd) % 1440;
  
  // Run simulation logic if we have a player character
  if (playerCharacter) {
    runTimeSimulation(currentTime, newTime, playerCharacter);
  }
  
  return newTime;
}

/**
 * Runs simulation logic based on time changes.
 * This function is called every time the time increment function is called.
 * 
 * Current simulation effects:
 * - Player healing: 5 HP every hour until max HP is reached
 * - Per-minute effects: Various game logic that should run every minute
 * 
 * @param oldTime - Previous game time in minutes
 * @param newTime - New game time in minutes
 * @param playerCharacter - The player character to apply effects to
 */
function runTimeSimulation(
  oldTime: number, 
  newTime: number, 
  playerCharacter: Character
): void {
  // Calculate how many minutes we're advancing
  let minutesToSimulate = newTime - oldTime;
  
  // Handle midnight rollover
  if (minutesToSimulate < 0) {
    minutesToSimulate += 1440;
  }
  
  // Run per-minute simulation for each minute advanced
  for (let minute = 0; minute < minutesToSimulate; minute++) {
    const currentSimulatedTime = (oldTime + minute) % 1440;
    runPerMinuteSimulation(currentSimulatedTime, playerCharacter);
  }
  
  // Check if an hour has rolled over for hourly effects
  const oldHour = Math.floor(oldTime / 60);
  const newHour = Math.floor(newTime / 60);
  
  // Handle hour rollover (including midnight rollover)
  if (newHour !== oldHour || (oldTime > newTime && oldHour === 23 && newHour === 0)) {
    runHourlySimulation(newTime, playerCharacter);
  }
}

/**
 * Utility function to check if a time change crosses an hour boundary
 * 
 * @param oldTime - Previous game time in minutes
 * @param newTime - New game time in minutes
 * @returns True if an hour boundary was crossed
 */
export function hasHourRollover(oldTime: number, newTime: number): boolean {
  const oldHour = Math.floor(oldTime / 60);
  const newHour = Math.floor(newTime / 60);
  
  // Handle normal hour increment
  if (newHour !== oldHour) {
    return true;
  }
  
  // Handle midnight rollover (23:59 -> 00:00)
  if (oldTime > newTime && oldHour === 23 && newHour === 0) {
    return true;
  }
  
  return false;
}
