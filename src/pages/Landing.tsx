import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Map from '../components/Map';
import { GameMap, Location } from '../game/interfaces';
import './Landing.css';

function Landing() {
  const [appVersion, setAppVersion] = useState<string>('');
  const [appName, setAppName] = useState<string>('');
  const navigate = useNavigate();

  // Sample game data
  const sampleLocations: Location[] = [
    { id: 1, name: "Starting Point", type: 1, visible: true, discovered: true, north: 2, east: 3 },
    { id: 2, name: "Northern Cave", type: 2, visible: true, discovered: false, south: 1, east: 4 },
    { id: 3, name: "Eastern Forest", type: 3, visible: true, discovered: true, west: 1, north: 4, east: 5 },
    { id: 4, name: "Crossroads", type: 1, visible: true, discovered: false, south: 3, west: 2, north: 6 },
    { id: 5, name: "Hidden Temple", type: 4, visible: false, discovered: false, west: 3 },
    { id: 6, name: "Mountain Peak", type: 5, visible: true, discovered: false, south: 4 }
  ];

  const sampleGameMap: GameMap = {
    id: 1,
    locations: [1, 2, 3, 4, 5, 6]
  };

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

  const handleGetStarted = () => {
    // Navigate to the main app or another page
    navigate('/app');
  };

  return (
    <div className="Landing">
      <div className="landing-container">
        {/* Game Map Component */}
        <Map gameMap={sampleGameMap} locations={sampleLocations} />
      </div>
    </div>
  );
}

export default Landing; 