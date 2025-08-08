import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CharacterRoster, { Character } from '../components/CharacterRoster';
import MessageLog, { LogMessage } from '../components/MessageLog';
import ButtonGrid from '../components/ButtonGrid';
import './Combat.css';

function Combat() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<LogMessage[]>([]);

  // Mock data for player and allies
  const playerCharacters: Character[] = [
    {
      id: 'player',
      name: 'Hero',
      health: 85,
      maxHealth: 100,
      level: 5,
      isPlayer: true,
      isAlive: true
    },
    {
      id: 'ally1',
      name: 'Mage',
      health: 60,
      maxHealth: 70,
      level: 4,
      isPlayer: false,
      isAlive: true
    },
    {
      id: 'ally2',
      name: 'Warrior',
      health: 95,
      maxHealth: 120,
      level: 4,
      isPlayer: false,
      isAlive: true
    }
  ];

  // Mock data for enemies
  const enemyCharacters: Character[] = [
    {
      id: 'enemy1',
      name: 'Goblin',
      health: 45,
      maxHealth: 60,
      level: 3,
      isPlayer: false,
      isAlive: true
    },
    {
      id: 'enemy2',
      name: 'Orc',
      health: 80,
      maxHealth: 100,
      level: 4,
      isPlayer: false,
      isAlive: true
    },
    {
      id: 'enemy3',
      name: 'Troll',
      health: 25,
      maxHealth: 150,
      level: 6,
      isPlayer: false,
      isAlive: true
    }
  ];

  const addMessage = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    const newMessage: LogMessage = {
      id: Date.now().toString(),
      message,
      timestamp: new Date(),
      type
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleBack = () => {
    navigate('/journey');
  };

  // Add initial combat message
  React.useEffect(() => {
    addMessage('Combat encounter started!', 'warning');
  }, []);

  // ButtonGrid items for combat actions
  const buttonGridItems = [
    {
      callback: () => addMessage('Quick Attack executed!', 'info'),
      coordinates: { row: 0, col: 0 },
      text: 'Quick Attack'
    },
    {
      callback: () => addMessage('Heavy Strike executed!', 'info'),
      coordinates: { row: 0, col: 1 },
      text: 'Heavy Strike'
    },
    {
      callback: () => addMessage('Defensive Stance activated!', 'warning'),
      coordinates: { row: 0, col: 2 },
      text: 'Defend'
    },
    {
      callback: () => addMessage('Special Ability used!', 'success'),
      coordinates: { row: 0, col: 3 },
      text: 'Special'
    },
    {
      callback: () => addMessage('Item used!', 'info'),
      coordinates: { row: 0, col: 4 },
      text: 'Use Item'
    },
    {
      callback: () => addMessage('Flee attempt!', 'warning'),
      coordinates: { row: 0, col: 5 },
      text: 'Flee'
    },
    {
      callback: () => addMessage('Auto-combat toggled!', 'info'),
      coordinates: { row: 1, col: 0 },
      text: 'Auto'
    },
    {
      callback: () => addMessage('Speed increased!', 'success'),
      coordinates: { row: 1, col: 1 },
      text: 'Speed Up'
    },
    {
      callback: () => addMessage('Pause combat!', 'warning'),
      coordinates: { row: 1, col: 2 },
      text: 'Pause'
    }
  ];

  return (
    <div className="Combat">
      <div className="combat-container">
        <div className="combat-header">
          <h1 className="combat-title">Combat</h1>
          <button
            onClick={handleBack}
            className="combat-back-button"
          >
            Back
          </button>
        </div>
        
        <div className="combat-content">
          <div className="combat-left-panel">
            <CharacterRoster 
              title="Your Party"
              characters={playerCharacters}
              rosterType="player"
              onAction={(action: string) => {
                addMessage(`Player action: ${action}`, 'info');
              }}
              showActions={true}
            />
          </div>
          
          <div className="combat-center-panel">
            <MessageLog messages={messages} maxMessages={100} />
          </div>
          
          <div className="combat-right-panel">
            <CharacterRoster 
              title="Enemies"
              characters={enemyCharacters}
              rosterType="enemy"
              onAction={(action: string) => {
                addMessage(`Enemy action: ${action}`, 'error');
              }}
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
