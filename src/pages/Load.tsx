import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSaveFileList, loadSaveFile } from '../utils/saveFileOperations';
import { useSave } from '../contexts/SaveContext';
import './Landing.css';

function Load() {
  const [saveFiles, setSaveFiles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setCurrentSave } = useSave();

  useEffect(() => {
    loadSaveFiles();
  }, []);

  const loadSaveFiles = async () => {
    try {
      setLoading(true);
      const files = await getSaveFileList();
      setSaveFiles(files);
    } catch (error) {
      console.error('Failed to load save files:', error);
      setError('Failed to load save files');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadSave = async (saveName: string) => {
    try {
      // Load the save file (this will update the lastOpened timestamp)
      const saveFile = await loadSaveFile(saveName);
      console.log(`Loaded save file: ${saveName}`, saveFile);
      
      // Store the save file in memory
      setCurrentSave(saveFile);
      
      // Navigate to the explore page
      navigate('/explore');
    } catch (error) {
      console.error('Failed to load save file:', error);
      setError(`Failed to load save file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleBackToMenu = () => {
    navigate('/');
  };

  const handleRefresh = () => {
    loadSaveFiles();
  };

  return (
    <div className="Landing">
      <div className="landing-container">
        <div className="main-menu">
          <div className="menu-container">
            <h2 className="menu-title">Load Game</h2>
            
            <div className="menu-content">
              {loading ? (
                <div style={{ color: 'white', marginBottom: '2rem', textAlign: 'center' }}>
                  Loading save files...
                </div>
              ) : error ? (
                <div style={{ color: '#ff6b6b', marginBottom: '2rem', textAlign: 'center' }}>
                  {error}
                </div>
              ) : saveFiles.length === 0 ? (
                <div style={{ color: 'white', marginBottom: '2rem', textAlign: 'center' }}>
                  No save files found
                </div>
              ) : (
                <div style={{ marginBottom: '2rem' }}>
                  <div style={{ 
                    color: 'white', 
                    marginBottom: '1rem', 
                    textAlign: 'center',
                    fontSize: '1.1rem'
                  }}>
                    Select a save file to load:
                  </div>
                  <div className="menu-buttons">
                    {saveFiles.map((saveName) => (
                      <button
                        key={saveName}
                        className="menu-button load-button"
                        onClick={() => handleLoadSave(saveName)}
                        style={{ marginBottom: '0.5rem' }}
                      >
                        {saveName}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="menu-buttons">
                <button 
                  className="menu-button" 
                  onClick={handleRefresh}
                  style={{ marginBottom: '1rem' }}
                >
                  Refresh
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

export default Load; 