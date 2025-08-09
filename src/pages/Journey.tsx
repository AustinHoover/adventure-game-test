import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Destinations from '../components/Destinations';
import MessageLog, { LogMessage } from '../components/MessageLog';
import { TicketSystem } from '../utils/ticketSystem';
import { useSave } from '../contexts/SaveContext';
import { CombatUnitService } from '../game/interface/combat-unit-service';
import type { Character } from '../game/interface/character-interfaces';
import './Landing.css';

function Journey() {
  const navigate = useNavigate();
  const { currentSave } = useSave();
  const [messages, setMessages] = useState<LogMessage[]>([]);
  const [combatService] = useState(() => CombatUnitService.getInstance());

  // Create ticket system for explore actions
  const exploreTicketSystem = useMemo(() => {
    const system = new TicketSystem<string>();
    system.addOption('combat', 3); // 3 tickets for combat encounter (30% chance)
    system.addOption('safe_exploration', 4); // 4 tickets for safe exploration (40% chance)
    system.addOption('minor_event', 2); // 2 tickets for minor events (20% chance)
    system.addOption('nothing', 1); // 1 ticket for nothing happening (10% chance)
    return system;
  }, []);

  const addMessage = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    const newMessage: LogMessage = {
      id: Date.now().toString(),
      message,
      timestamp: new Date(),
      type
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const generateCombatEncounter = (): Character[] => {
    if (!currentSave) {
      console.warn('No save file available for combat encounter generation');
      return [];
    }

    const playerCharacter = currentSave.characterRegistry.characters.get(currentSave.playerCharacterId);
    if (!playerCharacter) {
      console.warn('Player character not found for combat encounter generation');
      return [];
    }

    // Generate 1-3 enemies based on random chance
    const enemyCount = Math.floor(Math.random() * 3) + 1; // 1, 2, or 3 enemies
    const enemies: Character[] = [];

    for (let i = 0; i < enemyCount; i++) {
      // Generate enemy combat units using the service
      const combatUnits = combatService.generateRandomEncounter(playerCharacter.level, 1);
      
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

    return enemies;
  };

  const handleDestinationClick = (destinationName: string) => {
    if (destinationName === 'Explore') {
      if (!currentSave) {
        addMessage('No save file loaded! Cannot explore.', 'error');
        return;
      }

      const playerCharacter = currentSave.characterRegistry.characters.get(currentSave.playerCharacterId);
      if (!playerCharacter) {
        addMessage('Player character not found! Cannot explore.', 'error');
        return;
      }

      const selectedAction = exploreTicketSystem.selectRandom();
      if (selectedAction) {
        switch (selectedAction) {
          case 'combat': {
            const enemies = generateCombatEncounter();
            if (enemies.length > 0) {
              const enemyNames = enemies.map(e => e.name).join(', ');
              addMessage(`Hostile encounter: ${enemyNames}! Prepare for battle!`, 'warning');
              
              // Navigate to combat with enemy data
              setTimeout(() => {
                navigate('/combat', { state: { enemyCharacters: enemies } });
              }, 1500);
            } else {
              addMessage('You sense danger but find nothing...', 'info');
            }
            break;
          }
          
          case 'safe_exploration': {
            const explorationEvents = [
              'You discover a peaceful clearing and rest briefly.',
              'You find an old path that leads nowhere interesting.',
              'The journey is uneventful but you make good progress.',
              'You encounter friendly travelers heading the opposite direction.',
              'You spot interesting wildlife from a safe distance.'
            ];
            const randomEvent = explorationEvents[Math.floor(Math.random() * explorationEvents.length)];
            addMessage(randomEvent, 'success');
            break;
          }
          
          case 'minor_event': {
            const minorEvents = [
              'You find a few coins dropped by previous travelers. (+5 currency)',
              'You discover some useful herbs along the path.',
              'An old signpost gives you insight into the local area.',
              'You notice interesting tracks but decide not to follow them.',
              'A merchant caravan passes by in the distance.'
            ];
            const randomEvent = minorEvents[Math.floor(Math.random() * minorEvents.length)];
            addMessage(randomEvent, 'info');
            
            // If the event gives currency, we could update the player here
            if (randomEvent.includes('coins')) {
              // TODO: Could implement currency gain here
            }
            break;
          }
          
          case 'nothing': {
            const nothingEvents = [
              'The path ahead is quiet and empty.',
              'Nothing of interest catches your attention.',
              'Time passes peacefully as you travel.',
              'You continue your journey without incident.'
            ];
            const randomEvent = nothingEvents[Math.floor(Math.random() * nothingEvents.length)];
            addMessage(randomEvent, 'info');
            break;
          }
          
          default:
            addMessage('You continue your exploration...', 'info');
            break;
        }
      }
    }
  };

  const handleBack = () => {
    navigate('/explore');
  };



  return (
    <div className="Landing">
      <div className="landing-container">
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          gap: '2rem'
        }}>
          <h1 style={{ 
            color: 'white', 
            fontSize: '2.5rem', 
            margin: 0,
            textAlign: 'center'
          }}>
            Journey
          </h1>
          
          <Destinations onDestinationClick={handleDestinationClick} />
          
          <MessageLog messages={messages} />
          
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button
              onClick={handleBack}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                padding: '1rem 2rem',
                fontSize: '1.2rem',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '8px',
                cursor: 'pointer',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Journey;
