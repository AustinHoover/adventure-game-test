import type { GameEvent } from '../interface/event';
import type { Character } from '../interface/character';
import { CombatUnitService } from '../interface/combatunit.service';
import { GameState } from '../interface/gamestate';

export interface EventContext {
  currentSave: GameState;
  playerCharacter: Character;
  navigate: (path: string, options?: any) => void;
  addMessage: (message: string, type: 'info' | 'success' | 'warning' | 'error') => void;
  setIsNavigatingToCombat: (value: boolean) => void;
}

export class EventDefinitions {
  private static instance: EventDefinitions;
  private combatService: CombatUnitService;

  private constructor() {
    this.combatService = CombatUnitService.getInstance();
  }

  public static getInstance(): EventDefinitions {
    if (!EventDefinitions.instance) {
      EventDefinitions.instance = new EventDefinitions();
    }
    return EventDefinitions.instance;
  }

  public getCombatEvents(context: EventContext): GameEvent[] {
    return [
      {
        id: 'combat_goblin_encounter',
        name: 'Goblin Ambush',
        description: 'A group of goblins ambushes you from the shadows',
        message: 'Hostile goblins emerge from the shadows! Prepare for battle!',
        type: 'combat',
        weight: 3,
        callback: () => this.handleCombatEncounter(context, 'goblin')
      },
      {
        id: 'combat_bandit_encounter',
        name: 'Bandit Attack',
        description: 'Desperate bandits attempt to rob you',
        message: 'Bandits block your path, weapons drawn!',
        type: 'combat',
        weight: 2,
        callback: () => this.handleCombatEncounter(context, 'bandit')
      },
      {
        id: 'combat_wild_beast',
        name: 'Wild Beast',
        description: 'A territorial wild beast attacks',
        message: 'A fierce beast charges at you!',
        type: 'combat',
        weight: 2,
        callback: () => this.handleCombatEncounter(context, 'beast')
      }
    ];
  }

  public getExplorationEvents(context: EventContext): GameEvent[] {
    return [
      {
        id: 'exploration_peaceful_clearing',
        name: 'Peaceful Clearing',
        description: 'You discover a peaceful clearing and rest briefly',
        message: 'You discover a peaceful clearing and rest briefly. Your spirits are lifted.',
        type: 'exploration',
        weight: 4,
        callback: () => this.handleSafeExploration(context)
      },
      {
        id: 'exploration_old_path',
        name: 'Old Path',
        description: 'You find an old path that leads nowhere interesting',
        message: 'You find an old path that leads nowhere interesting, but you make good progress.',
        type: 'exploration',
        weight: 3,
        callback: () => this.handleSafeExploration(context)
      },
      {
        id: 'exploration_friendly_travelers',
        name: 'Friendly Travelers',
        description: 'You encounter friendly travelers heading the opposite direction',
        message: 'You encounter friendly travelers heading the opposite direction. They share some local knowledge.',
        type: 'exploration',
        weight: 2,
        callback: () => this.handleSafeExploration(context)
      }
    ];
  }

  public getMinorEvents(context: EventContext): GameEvent[] {
    return [
      {
        id: 'minor_found_coins',
        name: 'Found Coins',
        description: 'You find a few coins dropped by previous travelers',
        message: 'You find a few coins dropped by previous travelers. (+5 currency)',
        type: 'minor',
        weight: 2,
        callback: () => this.handleMinorEvent(context, 'coins')
      },
      {
        id: 'minor_useful_herbs',
        name: 'Useful Herbs',
        description: 'You discover some useful herbs along the path',
        message: 'You discover some useful herbs along the path. These could be valuable.',
        type: 'minor',
        weight: 2,
        callback: () => this.handleMinorEvent(context, 'herbs')
      },
      {
        id: 'minor_old_signpost',
        name: 'Old Signpost',
        description: 'An old signpost gives you insight into the local area',
        message: 'An old signpost gives you insight into the local area. You feel more confident about your surroundings.',
        type: 'minor',
        weight: 1,
        callback: () => this.handleMinorEvent(context, 'signpost')
      }
    ];
  }

  public getNothingEvents(context: EventContext): GameEvent[] {
    return [
      {
        id: 'nothing_quiet_path',
        name: 'Quiet Path',
        description: 'The path ahead is quiet and empty',
        message: 'The path ahead is quiet and empty. Time passes peacefully as you travel.',
        type: 'nothing',
        weight: 1,
        callback: () => this.handleNothingEvent(context)
      },
      {
        id: 'nothing_uneventful_journey',
        name: 'Uneventful Journey',
        description: 'The journey is uneventful but you make good progress',
        message: 'The journey is uneventful but you make good progress. Sometimes quiet travel is a blessing.',
        type: 'nothing',
        weight: 1,
        callback: () => this.handleNothingEvent(context)
      }
    ];
  }

  public getAllEvents(context: EventContext): GameEvent[] {
    return [
      ...this.getCombatEvents(context),
      ...this.getExplorationEvents(context),
      ...this.getMinorEvents(context),
      ...this.getNothingEvents(context)
    ];
  }

  private async handleCombatEncounter(context: EventContext, enemyType: string): Promise<void> {
    const { playerCharacter, navigate, setIsNavigatingToCombat } = context;
    
    // Generate 1-3 enemies based on random chance
    const enemyCount = Math.floor(Math.random() * 3) + 1;
    const enemies: Character[] = [];

    for (let i = 0; i < enemyCount; i++) {
      // Generate enemy combat units using the service
      const combatUnits = this.combatService.generateRandomEncounter(playerCharacter.level, 1);
      
      if (combatUnits.length > 0) {
        const combatUnit = combatUnits[0];
        
        // Convert combat unit back to character format for navigation
        const enemyCharacter: Character = {
          id: -(Date.now() + i), // Negative ID for generated enemies
          name: combatUnit.name,
          location: playerCharacter.location,
          unitId: 0,
          mapId: playerCharacter.mapId,
          shopPools: [],
          inventory: { items: [], currency: 0 },
          level: combatUnit.level,
          experience: 0,
          raceId: combatUnit.raceId,
          maxHp: combatUnit.maxHp,
          currentHp: combatUnit.currentHp,
          attack: combatUnit.attack
        };
        
        enemies.push(enemyCharacter);
      }
    }

    if (enemies.length > 0) {
      // Disable explore button during navigation
      setIsNavigatingToCombat(true);
      
      // Navigate to combat with enemy data
      setTimeout(() => {
        navigate('/combat', { state: { enemyCharacters: enemies } });
      }, 1500);
    }
  }

  private handleSafeExploration(context: EventContext): void {
    // Safe exploration events don't need special handling
    // The message is already displayed
    // Heal the player by 5 HP, but do not exceed maxHp
    const healAmount = 5;
    const { playerCharacter, addMessage } = context;
    const newHp = Math.min(playerCharacter.currentHp + healAmount, playerCharacter.maxHp);
    const actualHealed = newHp - playerCharacter.currentHp;
    playerCharacter.currentHp = newHp;
    if (actualHealed > 0) {
      addMessage(`You feel refreshed and recover ${actualHealed} HP.`, 'success');
    }
  }

  private handleMinorEvent(context: EventContext, eventType: string): void {
    // Minor events could have additional effects here
    if (eventType === 'coins') {
      // Give the player 5 currency for finding coins
      const currencyGain = 5;
      const playerCharacter = context.currentSave.characterRegistry.characters.get(context.currentSave.playerCharacterId);
      if (playerCharacter) {
        playerCharacter.inventory.currency += currencyGain;
      }
      context.addMessage(`You found ${currencyGain} coins! (+${currencyGain} currency)`, 'success');
    }
  }

  private handleNothingEvent(context: EventContext): void {
    // Nothing events don't need special handling
    // The message is already displayed
  }
}
