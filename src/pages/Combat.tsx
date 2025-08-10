import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import CharacterRoster from '../components/CharacterRoster';
import MessageLog, { LogMessage } from '../components/MessageLog';
import ButtonGrid from '../components/ButtonGrid';
import { useGame } from '../contexts/GameContext';
import { CombatUnitService, CombatUnit } from '../game/interface/combat-unit-service';
import type { Character } from '../game/interface/character-interfaces';
import './Combat.css';

interface LocationState {
  enemyCharacters?: Character[];
}

function Combat() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentSave, setCurrentSave } = useGame();
  const [messages, setMessages] = useState<LogMessage[]>([]);
  const [playerUnits, setPlayerUnits] = useState<CombatUnit[]>([]);
  const [enemyUnits, setEnemyUnits] = useState<CombatUnit[]>([]);
  const [combatService] = useState(() => CombatUnitService.getInstance());
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [selectedPlayerUnit, setSelectedPlayerUnit] = useState<CombatUnit | null>(null);
  const [selectedEnemyUnit, setSelectedEnemyUnit] = useState<CombatUnit | null>(null);
  const [targetingMode, setTargetingMode] = useState(false);
  const [actingEnemyId, setActingEnemyId] = useState<number | null>(null);

  const addMessage = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    const newMessage: LogMessage = {
      id: Date.now().toString(),
      message,
      timestamp: new Date(),
      type
    };
    setMessages(prev => [...prev, newMessage]);
  };



  // Keyboard targeting functionality
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isPlayerTurn || targetingMode) return;
      
      if (event.key === 'Tab') {
        event.preventDefault();
        const aliveEnemies = enemyUnits.filter(unit => unit.isAlive);
        if (aliveEnemies.length === 0) return;
        
        if (event.shiftKey) {
          // Shift+Tab: Previous target
          if (!selectedEnemyUnit) {
            setSelectedEnemyUnit(aliveEnemies[aliveEnemies.length - 1]);
          } else {
            const currentIndex = aliveEnemies.findIndex(enemy => enemy.id === selectedEnemyUnit.id);
            const newIndex = currentIndex <= 0 ? aliveEnemies.length - 1 : currentIndex - 1;
            setSelectedEnemyUnit(aliveEnemies[newIndex]);
          }
        } else {
          // Tab: Next target
          if (!selectedEnemyUnit) {
            setSelectedEnemyUnit(aliveEnemies[0]);
          } else {
            const currentIndex = aliveEnemies.findIndex(enemy => enemy.id === selectedEnemyUnit.id);
            const newIndex = currentIndex >= aliveEnemies.length - 1 ? 0 : currentIndex + 1;
            setSelectedEnemyUnit(aliveEnemies[newIndex]);
          }
        }
        
        if (selectedEnemyUnit) {
          addMessage(`Target: ${selectedEnemyUnit.name}`, 'info');
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlayerTurn, targetingMode, enemyUnits, selectedEnemyUnit, addMessage]);

  // Initialize combat with real character data
  useEffect(() => {
    if (!currentSave) {
      addMessage('No save file found! Returning to journey.', 'error');
      setTimeout(() => navigate('/journey'), 2000);
      return;
    }

    // Get player character
    const playerCharacter = currentSave.characterRegistry.characters.get(currentSave.playerCharacterId);
    if (!playerCharacter) {
      addMessage('Player character not found! Returning to journey.', 'error');
      setTimeout(() => navigate('/journey'), 2000);
      return;
    }

    // Create player combat unit
    const playerCombatUnit = combatService.createCombatUnitFromCharacter(playerCharacter, true);
    setPlayerUnits([playerCombatUnit]);
    setSelectedPlayerUnit(playerCombatUnit);

    // Get enemy characters from location state or generate random encounter
    const { enemyCharacters } = (location.state as LocationState) || {};
    let enemies: CombatUnit[] = [];

    if (enemyCharacters && enemyCharacters.length > 0) {
      // Use provided enemy characters
      enemies = combatService.createCombatUnitsFromCharacters(enemyCharacters, false);
      addMessage(`Combat encounter: ${enemyCharacters.map(e => e.name).join(', ')}!`, 'warning');
    } else {
      // Generate random encounter based on player level
      enemies = combatService.generateRandomEncounter(playerCharacter.level, Math.floor(Math.random() * 3) + 1);
      if (enemies.length > 0) {
        addMessage(`Random encounter: ${enemies.map(e => e.name).join(', ')}!`, 'warning');
      } else {
        addMessage('No suitable enemies found for your level. Returning to journey.', 'info');
        setTimeout(() => navigate('/journey'), 2000);
        return;
      }
    }

    setEnemyUnits(enemies);
    if (enemies.length > 0) {
      setSelectedEnemyUnit(enemies[0]);
    }

    addMessage('Combat encounter started! Select your actions.', 'info');
  }, [currentSave, location.state, navigate, combatService]);

  // Combat action functions
  const performAttack = () => {
    if (!selectedPlayerUnit || !selectedEnemyUnit || !selectedPlayerUnit.isAlive || !selectedEnemyUnit.isAlive) {
      addMessage('Invalid attack: select valid units!', 'error');
      return;
    }

    const damage = combatService.calculateDamage(selectedPlayerUnit, selectedEnemyUnit);
    const updatedEnemy = combatService.applyDamage(selectedEnemyUnit, damage);
    
    // Update enemy units
    setEnemyUnits(prev => prev.map(unit => 
      unit.id === selectedEnemyUnit.id ? updatedEnemy : unit
    ));
    
    // Update selected enemy unit to reflect damage
    setSelectedEnemyUnit(updatedEnemy);
    
    addMessage(`${selectedPlayerUnit.name} attacks ${selectedEnemyUnit.name} for ${damage} damage!`, 'info');
    
    if (!updatedEnemy.isAlive) {
      addMessage(`${updatedEnemy.name} has been defeated!`, 'success');
    }
    
    // Check if combat is over
    const updatedEnemies = enemyUnits.map(unit => 
      unit.id === selectedEnemyUnit.id ? updatedEnemy : unit
    );
    
    const combatResult = combatService.isCombatOver(playerUnits, updatedEnemies);
    if (combatResult.isOver) {
      handleCombatEnd(combatResult.playerWon);
      return;
    }
    
    // Switch to enemy turn
    setIsPlayerTurn(false);
    // Use the current enemy units state, which will have the most up-to-date alive status
    setTimeout(() => {
      setEnemyUnits(currentEnemies => {
        performEnemyActions(currentEnemies);
        return currentEnemies; // Return unchanged since we're just reading the state
      });
    }, 1000);
  };

  const performDefend = () => {
    if (!selectedPlayerUnit || !selectedPlayerUnit.isAlive) {
      addMessage('Invalid defend: select a valid player unit!', 'error');
      return;
    }
    
    addMessage(`${selectedPlayerUnit.name} takes a defensive stance!`, 'warning');
    // TODO: Implement defense bonus for next turn
    
    setIsPlayerTurn(false);
    setTimeout(() => {
      setEnemyUnits(currentEnemies => {
        performEnemyActions(currentEnemies);
        return currentEnemies; // Return unchanged since we're just reading the state
      });
    }, 1000);
  };

  const performEnemyActions = (currentEnemyUnits: CombatUnit[]) => {
    const aliveEnemies = currentEnemyUnits.filter(unit => unit.isAlive);
    const alivePlayers = playerUnits.filter(unit => unit.isAlive);
    
    if (aliveEnemies.length === 0 || alivePlayers.length === 0) return;
    
    aliveEnemies.forEach((enemy, index) => {
      // Set the acting enemy ID to show visual feedback
      setTimeout(() => {
        setActingEnemyId(enemy.id);
        addMessage(`🎯 ${enemy.name} is preparing to attack...`, 'warning');
      }, index * 1200);
      
      // Perform the actual attack after a delay
      setTimeout(() => {
        const randomPlayer = alivePlayers[Math.floor(Math.random() * alivePlayers.length)];
        const damage = combatService.calculateDamage(enemy, randomPlayer);
        const updatedPlayer = combatService.applyDamage(randomPlayer, damage);
        
        setPlayerUnits(prev => prev.map(unit => 
          unit.id === randomPlayer.id ? updatedPlayer : unit
        ));
        
        // Update selected player unit if it was the one attacked
        if (selectedPlayerUnit && randomPlayer.id === selectedPlayerUnit.id) {
          setSelectedPlayerUnit(updatedPlayer);
        }
        
        addMessage(`⚔️ ${enemy.name} attacks ${randomPlayer.name} for ${damage} damage!`, 'error');
        
        if (!updatedPlayer.isAlive) {
          addMessage(`💀 ${updatedPlayer.name} has been knocked out!`, 'error');
        }
        
        // Clear the acting enemy ID after the attack
        setActingEnemyId(null);
        
        // Check if this was the last enemy action
        if (index === aliveEnemies.length - 1) {
          setTimeout(() => {
            const updatedPlayers = playerUnits.map(unit => 
              unit.id === randomPlayer.id ? updatedPlayer : unit
            );
            
            const combatResult = combatService.isCombatOver(updatedPlayers, currentEnemyUnits);
            if (combatResult.isOver) {
              handleCombatEnd(combatResult.playerWon);
            } else {
              setIsPlayerTurn(true);
              setActingEnemyId(null); // Clear acting enemy when player turn starts
            }
          }, 800);
        }
      }, (index * 1200) + 800);
    });
  };

  const handleCombatEnd = (playerWon: boolean) => {
    setActingEnemyId(null); // Clear acting enemy when combat ends
    
    if (playerWon) {
      const defeatedEnemies = enemyUnits.filter(unit => !unit.isAlive);
      const experienceGained = combatService.calculateExperienceGain(defeatedEnemies);
      const moneyGained = combatService.calculateMoneyGain(defeatedEnemies);
      
      addMessage(`Victory! You gained ${experienceGained} experience points and ${moneyGained} coins!`, 'success');
      
      // Update player character in save (preserving current HP from combat)
      if (currentSave && selectedPlayerUnit) {
        const playerCharacter = currentSave.characterRegistry.characters.get(currentSave.playerCharacterId);
        if (playerCharacter) {
          const updatedCharacter = combatService.updateCharacterAfterCombat(
            playerCharacter, 
            selectedPlayerUnit, 
            experienceGained
          );
          
          // Add money rewards to player's inventory
          const finalUpdatedCharacter: Character = {
            ...updatedCharacter,
            inventory: {
              ...updatedCharacter.inventory,
              currency: updatedCharacter.inventory.currency + moneyGained
            }
          };
          
          const updatedCharacters = new Map(currentSave.characterRegistry.characters);
          updatedCharacters.set(currentSave.playerCharacterId, finalUpdatedCharacter);
          
          const updatedSave = {
            ...currentSave,
            characterRegistry: {
              ...currentSave.characterRegistry,
              characters: updatedCharacters
            }
          };
          
          setCurrentSave(updatedSave);
          
          if (finalUpdatedCharacter.level > playerCharacter.level) {
            addMessage(`Level up! You are now level ${finalUpdatedCharacter.level}!`, 'success');
          }
        }
      }
      
      setTimeout(() => navigate('/explore'), 3000);
    } else {
      // Handle defeat - apply death penalty
      addMessage('Defeat! You have been knocked out...', 'error');
      
      if (currentSave && selectedPlayerUnit) {
        const playerCharacter = currentSave.characterRegistry.characters.get(currentSave.playerCharacterId);
        if (playerCharacter) {
          // Death penalty: restore to full HP but lose 100 currency
          const currencyPenalty = 100;
          const newCurrency = Math.max(0, playerCharacter.inventory.currency - currencyPenalty);
          const currencyLost = playerCharacter.inventory.currency - newCurrency;
          
          const updatedCharacter: Character = {
            ...playerCharacter,
            currentHp: playerCharacter.maxHp, // Restore to full HP
            inventory: {
              ...playerCharacter.inventory,
              currency: newCurrency
            }
          };
          
          const updatedCharacters = new Map(currentSave.characterRegistry.characters);
          updatedCharacters.set(currentSave.playerCharacterId, updatedCharacter);
          
          const updatedSave = {
            ...currentSave,
            characterRegistry: {
              ...currentSave.characterRegistry,
              characters: updatedCharacters
            }
          };
          
          setCurrentSave(updatedSave);
          
          addMessage(`You wake up with your wounds tended, but ${currencyLost} coins are missing from your purse...`, 'warning');
          if (currencyLost < currencyPenalty) {
            addMessage(`You didn't have enough coins to pay the full penalty!`, 'error');
          }
        }
      }
      
      setTimeout(() => navigate('/explore'), 3000);
    }
  };

  const startTargeting = () => {
    setTargetingMode(true);
    addMessage('Targeting mode: Click on an enemy or press Tab to cycle targets', 'info');
  };

  const cancelTargeting = () => {
    setTargetingMode(false);
    addMessage('Targeting cancelled', 'info');
  };

  const attemptFlee = () => {
    const fleeChance = Math.random();
    if (fleeChance > 0.5) {
      addMessage('Successfully fled from combat!', 'warning');
      setActingEnemyId(null); // Clear acting enemy when fleeing
      
      // Save current HP when fleeing successfully
      if (currentSave && selectedPlayerUnit) {
        const playerCharacter = currentSave.characterRegistry.characters.get(currentSave.playerCharacterId);
        if (playerCharacter) {
          const updatedCharacter: Character = {
            ...playerCharacter,
            currentHp: selectedPlayerUnit.currentHp // Preserve HP from combat
          };
          
          const updatedCharacters = new Map(currentSave.characterRegistry.characters);
          updatedCharacters.set(currentSave.playerCharacterId, updatedCharacter);
          
          const updatedSave = {
            ...currentSave,
            characterRegistry: {
              ...currentSave.characterRegistry,
              characters: updatedCharacters
            }
          };
          
          setCurrentSave(updatedSave);
        }
      }
      
      setTimeout(() => navigate('/explore'), 1000);
    } else {
      addMessage('Failed to flee! The enemies block your escape!', 'error');
      setIsPlayerTurn(false);
      setTimeout(() => {
        setEnemyUnits(currentEnemies => {
          performEnemyActions(currentEnemies);
          return currentEnemies; // Return unchanged since we're just reading the state
        });
      }, 1000);
    }
  };

  // ButtonGrid items for combat actions
  const buttonGridItems = [
    {
      callback: performAttack,
      coordinates: { row: 0, col: 0 },
      text: 'Attack',
      disabled: !isPlayerTurn || !selectedPlayerUnit?.isAlive || !selectedEnemyUnit?.isAlive
    },
    {
      callback: performDefend,
      coordinates: { row: 0, col: 1 },
      text: 'Defend',
      disabled: !isPlayerTurn || !selectedPlayerUnit?.isAlive
    },
    {
      callback: () => addMessage('Item use not yet implemented!', 'info'),
      coordinates: { row: 0, col: 2 },
      text: 'Use Item',
      disabled: !isPlayerTurn || !selectedPlayerUnit?.isAlive
    },
    {
      callback: attemptFlee,
      coordinates: { row: 0, col: 3 },
      text: 'Flee',
      disabled: !isPlayerTurn
    },
    {
      callback: targetingMode ? cancelTargeting : startTargeting,
      coordinates: { row: 1, col: 0 },
      text: targetingMode ? 'Cancel Target' : 'Target Enemy',
      disabled: !isPlayerTurn
    },
    {
      callback: () => navigate('/journey'),
      coordinates: { row: 1, col: 1 },
      text: 'Forfeit',
      disabled: false
    }
  ];

  return (
    <div className="Combat">
      <div className="combat-container">
        <div className="combat-header">
          <h1 className="combat-title">Combat</h1>
        </div>
        
                <div className="combat-content">
          <div className="combat-left-panel">
            <CharacterRoster 
              title="Your Party"
              characters={playerUnits}
              rosterType="player"
              onAction={(action: string) => {
                addMessage(`Player action: ${action}`, 'info');
              }}
              showActions={isPlayerTurn}
            />
            
            {/* Combat Status */}
            <div style={{ 
              marginTop: '10px', 
              padding: '10px', 
              backgroundColor: isPlayerTurn ? '#1a4d1a' : '#4d1a1a', 
              borderRadius: '5px',
              textAlign: 'center',
              border: targetingMode ? '2px solid #ffd700' : 'none'
            }}>
              <div style={{ color: 'white', fontSize: '0.9rem' }}>
                {isPlayerTurn ? '🗡️ Your Turn' : '⚔️ Enemy Turn'}
                {targetingMode && <span style={{ color: '#ffd700' }}> 🎯 TARGETING</span>}
              </div>
              {selectedPlayerUnit && (
                <div style={{ color: '#ccc', fontSize: '0.8rem' }}>
                  Selected: {selectedPlayerUnit.name}
                </div>
              )}
              {selectedEnemyUnit && (
                <div style={{ 
                  color: targetingMode ? '#ffd700' : '#ccc', 
                  fontSize: '0.8rem',
                  fontWeight: targetingMode ? 'bold' : 'normal'
                }}>
                  Target: {selectedEnemyUnit.name}
                  {targetingMode && <span> (Click to confirm)</span>}
                </div>
              )}
              {!selectedEnemyUnit && isPlayerTurn && (
                <div style={{ color: '#ff6b6b', fontSize: '0.8rem' }}>
                  No target selected - Press Tab or click "Target Enemy"
                </div>
              )}
              {!isPlayerTurn && actingEnemyId && (
                <div style={{ 
                  color: '#ff6b35', 
                  fontSize: '0.8rem',
                  fontWeight: 'bold',
                  animation: 'acting-pulse 1.2s ease-in-out infinite'
                }}>
                  🎯 {enemyUnits.find(u => u.id === actingEnemyId)?.name} is acting...
                </div>
              )}
              {isPlayerTurn && (
                <div style={{ color: '#aaa', fontSize: '0.7rem', marginTop: '5px' }}>
                  Tab: Cycle targets • Click enemies • Target button
                </div>
              )}
            </div>
          </div>
          
          <div className="combat-center-panel">
            <MessageLog messages={messages} maxMessages={100} />
          </div>
          
          <div className="combat-right-panel">
            <CharacterRoster 
              title="Enemies"
              characters={enemyUnits}
              rosterType="enemy"
              onAction={(action: string) => {
                addMessage(`Enemy action: ${action}`, 'error');
              }}
              onCharacterClick={(character) => {
                // Only allow targeting alive enemies
                const combatUnit = character as CombatUnit;
                if (combatUnit.isAlive) {
                  setSelectedEnemyUnit(combatUnit);
                  if (targetingMode) {
                    setTargetingMode(false);
                    addMessage(`Target acquired: ${combatUnit.name}`, 'success');
                  } else {
                    addMessage(`Target changed to ${combatUnit.name}`, 'info');
                  }
                }
              }}
              selectedCharacterId={selectedEnemyUnit?.id}
              targetingMode={targetingMode}
              actingEnemyId={actingEnemyId}
            />
          </div>
        </div>
         
         <div className="combat-button-section">
           <ButtonGrid items={buttonGridItems} />
         </div>
       </div>
     </div>
   );
}

export default Combat;
