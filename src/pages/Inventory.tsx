import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { Character } from '../game/interface/character-interfaces';

interface LocationState {
  playerCharacter?: Character;
}

function Inventory() {
  const navigate = useNavigate();
  const location = useLocation();
  const { playerCharacter } = (location.state as LocationState) || {};

  const handleBack = () => {
    navigate('/explore');
  };

  if (!playerCharacter) {
    return (
      <div style={{
        padding: '2rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#1a1a1a',
        color: 'white'
      }}>
        <h1>Inventory</h1>
        <p style={{ color: '#ff6b6b', marginBottom: '2rem' }}>No character data available</p>
        <button
          onClick={handleBack}
          style={{
            padding: '0.75rem 1.5rem',
            fontSize: '1rem',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Back to Explore
        </button>
      </div>
    );
  }

  return (
    <div style={{
      padding: '2rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#1a1a1a',
      color: 'white'
    }}>
      <h1>{playerCharacter.name}'s Inventory</h1>
      
      <div style={{
        backgroundColor: '#2a2a2a',
        padding: '1.5rem',
        borderRadius: '8px',
        marginBottom: '2rem',
        minWidth: '400px'
      }}>
        <div style={{ marginBottom: '1rem' }}>
          <h3>Currency: {playerCharacter.inventory.currency} coins</h3>
        </div>
        
        <div>
          <h3>Items:</h3>
          {playerCharacter.inventory.items.length === 0 ? (
            <p style={{ color: '#999', fontStyle: 'italic' }}>No items in inventory</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {playerCharacter.inventory.items.map((item, index) => (
                <li key={index} style={{
                  backgroundColor: '#3a3a3a',
                  padding: '0.75rem',
                  marginBottom: '0.5rem',
                  borderRadius: '4px',
                  border: '1px solid #555'
                }}>
                  <div style={{ fontWeight: 'bold' }}>{item.name}</div>
                  <div style={{ fontSize: '0.9rem', color: '#ccc' }}>
                    Amount: {item.amount}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#aaa', marginTop: '0.25rem' }}>
                    {item.description}
                  </div>
                  {item.tags.length > 0 && (
                    <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.25rem' }}>
                      Tags: {item.tags.join(', ')}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      
      <button
        onClick={handleBack}
        style={{
          padding: '0.75rem 1.5rem',
          fontSize: '1rem',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          transition: 'background-color 0.2s ease'
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#45a049'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#4CAF50'}
      >
        Back to Explore
      </button>
    </div>
  );
}

export default Inventory;
