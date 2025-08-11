import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Map from '../components/Explore/GameMapVisualizer';
import { GameMap, Location } from '../game/interface/map-interfaces';
import { generateTestArea } from '../game/gen/map/mapgen';
import './Landing.css';

function Landing() {
  const [appVersion, setAppVersion] = useState<string>('');
  const [appName, setAppName] = useState<string>('');
  const navigate = useNavigate();

  // Generate test area
  useEffect(() => {
    // Get app information from Electron main process
    const getAppInfo = async () => {
      try {
        if (window.electronAPI) {
          const version = await window.electronAPI.getAppVersion();
          const name = await window.electronAPI.getAppName();
          setAppVersion(version);
          setAppName(name);
        }
      } catch (error) {
        console.error('Error getting app info:', error);
      }
    };

    getAppInfo();
  }, []);

  const handleStart = () => {
    // Navigate to the new game page
    navigate('/newgame');
  };

  const handleLoad = () => {
    // Navigate to the load page (blank for now)
    navigate('/load');
  };

  return (
    <div className="Landing">
      <div className="landing-container">
        {/* Game Map Component */}
        
        {/* Main Menu */}
        <div className="main-menu">
          <div className="menu-container">
            <h2 className="menu-title">Adventure Game</h2>
            <div className="menu-buttons">
              <button className="menu-button start-button" onClick={handleStart}>
                Start
              </button>
              <button className="menu-button load-button" onClick={handleLoad}>
                Load
              </button>
            </div>
            <div className="app-info">
              <div className="app-name">{appName}</div>
              <div className="app-version">Version {appVersion}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Landing; 