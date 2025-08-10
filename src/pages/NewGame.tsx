import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createAndSaveFile, saveFileExists } from '../utils/saveFileOperations';
import { useGame } from '../contexts/GameContext';
import './Landing.css';

function NewGame() {
  const [saveName, setSaveName] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setCurrentSave } = useGame();

  const handleBeginGame = async () => {
    if (!saveName.trim()) {
      setError('Please enter a save name');
      return;
    }
    
    // Clear any previous errors
    setError('');
    
    try {
      // Check if save file already exists
      const exists = await saveFileExists(saveName);
      if (exists) {
        setError('A save file with this name already exists');
        return;
      }
      
      // Create and save the new save file
      const saveFile = await createAndSaveFile(saveName);
      console.log('Created new save file:', saveFile);
      
      // Store the save file in memory
      setCurrentSave(saveFile);
      
      // Navigate to the explore page
      navigate('/explore');
    } catch (error) {
      console.error('Failed to create save file:', error);
      setError(`Failed to create save file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleBackToMenu = () => {
    navigate('/');
  };

  const handleSaveNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSaveName(e.target.value);
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  };

  return (
    <div className="Landing">
      <div className="landing-container">
        <div className="main-menu">
          <div className="menu-container">
            <h2 className="menu-title">New Game</h2>
            
            <div className="menu-content">
              <div style={{ marginBottom: '2rem' }}>
                <label htmlFor="saveName" style={{ 
                  display: 'block', 
                  color: 'white', 
                  marginBottom: '0.5rem',
                  fontSize: '1.1rem',
                  fontWeight: '500'
                }}>
                  Save Name:
                </label>
                <input
                  id="saveName"
                  type="text"
                  value={saveName}
                  onChange={handleSaveNameChange}
                  placeholder="Enter save name..."
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    fontSize: '1rem',
                    border: 'none',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    color: '#282c34',
                    boxSizing: 'border-box'
                  }}
                  maxLength={50}
                />
                {error && (
                  <div style={{ 
                    color: '#ff6b6b', 
                    fontSize: '0.9rem', 
                    marginTop: '0.5rem',
                    textAlign: 'left'
                  }}>
                    {error}
                  </div>
                )}
              </div>

              <div className="menu-buttons">
                <button 
                  className="menu-button start-button" 
                  onClick={handleBeginGame}
                  style={{ marginBottom: '1rem' }}
                >
                  Begin Game
                </button>
                <button 
                  className="menu-button" 
                  onClick={handleBackToMenu}
                >
                  Back to Menu
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NewGame; 