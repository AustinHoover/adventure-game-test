import { Character } from '../interface/character';

/**
 * Core simulation system that runs once per in-game minute.
 * This file contains all the logic that should execute every minute during time simulation.
 */

/**
 * Runs the core simulation logic for a single minute at the specified game time.
 * This function is called once per minute during time simulation.
 * 
 * @param currentTime - Current game time in minutes since midnight (0-1439)
 * @param playerCharacter - The player character to apply simulation effects to
 */
export function runPerMinuteSimulation(currentTime: number, playerCharacter: Character): void {
  // HP regeneration every 5 minutes
  if (playerCharacter.currentHp < playerCharacter.maxHp) {
    if (currentTime % 5 === 0) {
      const regenAmount = Math.min(1, playerCharacter.maxHp - playerCharacter.currentHp);
      if (regenAmount > 0) {
        playerCharacter.currentHp += regenAmount;
        console.log(`HP regeneration: +${regenAmount} HP (${playerCharacter.currentHp}/${playerCharacter.maxHp})`);
      }
    }
  }
  
  // Experience gain from exploration every 15 minutes
  if (currentTime % 15 === 0) {
    const expGain = 1;
    playerCharacter.experience += expGain;
    console.log(`Exploration experience: +${expGain} XP (${playerCharacter.experience} total)`);
    
    // Check for level up
    const currentLevel = Math.floor(playerCharacter.experience / 100) + 1;
    if (currentLevel > playerCharacter.level) {
      const oldLevel = playerCharacter.level;
      playerCharacter.level = currentLevel;
      playerCharacter.maxHp += 5;
      playerCharacter.attack += 2;
      console.log(`Level up! ${playerCharacter.name} reached level ${currentLevel}!`);
      console.log(`Max HP increased to ${playerCharacter.maxHp}, Attack increased to ${playerCharacter.attack}`);
    }
  }
  
  // Log simulation activity every 10 minutes to avoid spam
  if (currentTime % 10 === 0) {
    console.log(`Per-minute simulation running at ${Math.floor(currentTime / 60)}:${(currentTime % 60).toString().padStart(2, '0')}`);
  }
}

/**
 * Runs hourly simulation effects when hour boundaries are crossed.
 * This function is called once per hour during time simulation.
 * 
 * @param currentTime - Current game time in minutes
 * @param playerCharacter - The player character to apply effects to
 */
export function runHourlySimulation(currentTime: number, playerCharacter: Character): void {
  const hour = Math.floor(currentTime / 60);
  
  // Heal the player 5 HP until they reach max HP
  if (playerCharacter.currentHp < playerCharacter.maxHp) {
    const healAmount = Math.min(5, playerCharacter.maxHp - playerCharacter.currentHp);
    playerCharacter.currentHp += healAmount;
    
    console.log(`Hourly simulation: ${playerCharacter.name} healed ${healAmount} HP at hour ${hour}:00`);
    console.log(`Current HP: ${playerCharacter.currentHp}/${playerCharacter.maxHp}`);
  }
  
  // Add other hourly effects here
  // Examples:
  // - Daily quests reset
  // - Shop inventory refresh
  // - Weather changes
  // - NPC schedules
}

/**
 * Future simulation effects that could be added:
 * 
 * Character Status Effects:
 * - Poison/disease progression
 * - Fatigue accumulation
 * - Hunger and thirst increase
 * - Temperature effects
 * 
 * Environmental Changes:
 * - Weather patterns
 * - Day/night cycle effects
 * - Seasonal changes
 * - Resource respawning
 * 
 * NPC Behaviors:
 * - Movement patterns
 * - Schedule changes
 * - Mood fluctuations
 * - Relationship dynamics
 * 
 * World Events:
 * - Random encounters
 * - Dynamic quest generation
 * - Economic fluctuations
 * - Political changes
 */
