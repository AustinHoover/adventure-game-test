import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { Character } from '../game/interface/character';
import { useGame } from '../contexts/GameContext';

interface LocationState {
  selectedCharacter?: Character;
}

function Interaction() {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedCharacter } = (location.state as LocationState) || {};
  const { currentSave } = useGame();
  const playerCharacter = currentSave?.characterRegistry.characters.get(currentSave.playerCharacterId);

  const handleBack = () => {
    navigate('/explore'); // Navigate back to the explore page
  };

  const handleOpenShop = () => {
    console.log('Opening shop for:', selectedCharacter?.name);
    navigate('/shop', { state: { selectedCharacter, playerCharacter } });
  };

  const hasShop = selectedCharacter && selectedCharacter.shopPools && selectedCharacter.shopPools.length > 0;

  return (
    <div className="interaction-container" style={{
      padding: '2rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#1a1a1a',
      color: 'white'
    }}>
      <h1>Character Interaction</h1>
      
      {selectedCharacter ? (
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2>Interacting with: {selectedCharacter.name}</h2>
          <p>Character ID: {selectedCharacter.id}</p>
          <p>Location: {selectedCharacter.location}</p>
          {hasShop && (
            <p style={{ color: '#4CAF50', fontWeight: 'bold' }}>
              This character has a shop! ({selectedCharacter.shopPools.join(', ')})
            </p>
          )}
        </div>
      ) : (
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <p style={{ color: '#ff6b6b' }}>No character selected</p>
        </div>
      )}

      {hasShop && (
        <button
          onClick={handleOpenShop}
          style={{
            marginBottom: '1rem',
            padding: '0.75rem 1.5rem',
            fontSize: '1rem',
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'background-color 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1976D2'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2196F3'}
        >
          🛒 Open Shop
        </button>
      )}
      
      <button
        onClick={handleBack}
        style={{
          marginTop: '2rem',
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

export default Interaction;
