import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Destinations from '../components/Destinations';
import MessageLog, { LogMessage } from '../components/MessageLog';
import { TicketSystem } from '../utils/ticketSystem';
import { useSave } from '../contexts/SaveContext';
import { EventDefinitions } from '../game/gen/events';
import type { GameEvent } from '../game/interface/event-interfaces';
import type { Character } from '../game/interface/character-interfaces';
import './Landing.css';

function Journey() {
  const navigate = useNavigate();
  const { currentSave, updatePlayerCurrency, setCurrentSave } = useSave();
  const [messages, setMessages] = useState<LogMessage[]>([]);
  const [isNavigatingToCombat, setIsNavigatingToCombat] = useState(false);

  // Create event system for explore actions
  const eventDefinitions = useMemo(() => EventDefinitions.getInstance(), []);
  
  const addMessage = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    const newMessage: LogMessage = {
      id: Date.now().toString(),
      message,
      timestamp: new Date(),
      type
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const createEventContext = () => {
    if (!currentSave) {
      return null;
    }

    const playerCharacter = currentSave.characterRegistry.characters.get(currentSave.playerCharacterId);
    if (!playerCharacter) {
      return null;
    }

    return {
      playerCharacter,
      navigate,
      addMessage,
      setIsNavigatingToCombat,
      updatePlayerCurrency
    };
  };

  const handleDestinationClick = (destinationName: string, mapId?: number) => {
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

      const eventContext = createEventContext();
      if (!eventContext) {
        addMessage('Unable to create event context!', 'error');
        return;
      }

      // Get all available events and create a ticket system for random selection
      const allEvents = eventDefinitions.getAllEvents(eventContext);
      const ticketSystem = new TicketSystem<GameEvent>();
      
      // Add each event with its weight to the ticket system
      allEvents.forEach(event => {
        ticketSystem.addOption(event, event.weight);
      });

      // Select a random event
      const selectedEvent = ticketSystem.selectRandom();
      if (selectedEvent) {
        // Display the event message
        addMessage(selectedEvent.message, selectedEvent.type === 'combat' ? 'warning' : 'info');
        
        // Execute the event callback
        try {
          selectedEvent.callback();
        } catch (error) {
          console.error('Error executing event callback:', error);
          addMessage('Something unexpected happened during the event!', 'error');
        }
      } else {
        addMessage('You continue your exploration...', 'info');
      }
    } else if (mapId !== undefined) {
      // Handle map navigation
      if (!currentSave) {
        addMessage('No save file loaded! Cannot navigate.', 'error');
        return;
      }

      const playerCharacter = currentSave.characterRegistry.characters.get(currentSave.playerCharacterId);
      if (!playerCharacter) {
        addMessage('Player character not found! Cannot navigate.', 'error');
        return;
      }

      // Update player's map ID and location
      playerCharacter.mapId = mapId;
      playerCharacter.location = 1; // Start at first location on the new map

      // Update the save file through the context
      setCurrentSave({ ...currentSave });

      addMessage(`Traveling to ${destinationName}...`, 'info');
      
      // Navigate to the explore page
      navigate('/explore');
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
          
          <Destinations onDestinationClick={handleDestinationClick} disabled={isNavigatingToCombat} />
          
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
