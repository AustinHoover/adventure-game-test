import React, { useCallback, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { Character } from '../game/interface/character';
import ButtonGrid from '../components/ButtonGrid';

interface LocationState {
  playerCharacter?: Character;
}

function Inventory() {
  const navigate = useNavigate();
  const location = useLocation();
  const { playerCharacter } = (location.state as LocationState) || {};

  // Keyboard to grid position mapping (QWERTY layout)
  // Grid is 6 columns x 3 rows
  const keyboardMapping: Record<string, { row: number; col: number }> = {
    // Row 0: Q W E R T Y
    'q': { row: 0, col: 0 },
    'w': { row: 0, col: 1 },
    'e': { row: 0, col: 2 },
    'r': { row: 0, col: 3 },
    't': { row: 0, col: 4 },
    'y': { row: 0, col: 5 },
    // Row 1: A S D F G H
    'a': { row: 1, col: 0 },
    's': { row: 1, col: 1 },
    'd': { row: 1, col: 2 },
    'f': { row: 1, col: 3 },
    'g': { row: 1, col: 4 },
    'h': { row: 1, col: 5 },
    // Row 2: Z X C V B N
    'z': { row: 2, col: 0 },
    'x': { row: 2, col: 1 },
    'c': { row: 2, col: 2 },
    'v': { row: 2, col: 3 },
    'b': { row: 2, col: 4 },
    'n': { row: 2, col: 5 },
  };

  const handleBack = () => {
    navigate('/explore');
  };

  // Create button items array with useMemo to avoid recreation on every render
  const buttonItems = useMemo(() => [
    {
      callback: handleBack,
      coordinates: { row: 0, col: 0 },
      text: "Back to Explore"
    }
  ], []);

  // Keyboard event handler
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    const key = event.key.toLowerCase();
    const gridPosition = keyboardMapping[key];
    
    if (!gridPosition) {
      return; // Key not mapped to any grid position
    }

    // Find the button item at this grid position
    const buttonItem = buttonItems.find(item => 
      item.coordinates && 
      item.coordinates.row === gridPosition.row && 
      item.coordinates.col === gridPosition.col
    );

    // Execute the button's callback if it exists and is enabled
    if (buttonItem && buttonItem.callback) {
      event.preventDefault(); // Prevent default browser behavior
      buttonItem.callback();
      console.log(`Keyboard shortcut: ${key.toUpperCase()} pressed - executed button at row ${gridPosition.row}, col ${gridPosition.col}: "${buttonItem.text}"`);
    }
  }, [keyboardMapping, buttonItems]);

  // Add keyboard event listener
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      handleKeyPress(event);
    };

    // Add event listener when component mounts
    window.addEventListener('keydown', handleKeyDown);

    // Cleanup event listener when component unmounts
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyPress]);

  if (!playerCharacter) {
    return (
      <div style={{
        padding: '2rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#2a2a2a',
        color: 'white'
      }}>
        <h1>Inventory</h1>
        <p style={{ color: '#ff6b6b', marginBottom: '2rem' }}>No character data available</p>
        <ButtonGrid items={buttonItems} />
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
      backgroundColor: '#2a2a2a',
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
                  <div style={{ fontSize: '0.85rem', color: '#888', marginTop: '0.25rem' }}>
                    Material: {item.material}
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
      
      <ButtonGrid items={buttonItems} />
    </div>
  );
}

export default Inventory;
