import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Destinations from '../components/Destinations';
import MessageLog, { LogMessage } from '../components/MessageLog';
import { TicketSystem } from '../utils/ticketSystem';
import './Landing.css';

function Journey() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<LogMessage[]>([]);

  // Create ticket system for explore actions
  const exploreTicketSystem = useMemo(() => {
    const system = new TicketSystem<string>();
    system.addOption('test', 2); // 2 tickets for logging "test"
    system.addOption('timeout', 1); // 1 ticket for 1 second timeout
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

  const handleDestinationClick = (destinationName: string) => {
    if (destinationName === 'Explore') {
      const selectedAction = exploreTicketSystem.selectRandom();
      if (selectedAction) {
        if (selectedAction === 'test') {
          addMessage('Exploration test completed', 'info');
        } else if (selectedAction === 'timeout') {
          addMessage('Exploration timeout started', 'warning');
          setTimeout(() => {
            addMessage('Exploration timeout completed', 'success');
          }, 1000);
        }
      }
    }
  };

  const handleBack = () => {
    navigate('/explore');
  };

  const handleCombat = () => {
    navigate('/combat');
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
              onClick={handleCombat}
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
              Combat
            </button>
            
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
