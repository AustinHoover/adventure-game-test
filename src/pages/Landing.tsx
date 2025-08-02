import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Landing.css';

function Landing() {
  const [appVersion, setAppVersion] = useState<string>('');
  const [appName, setAppName] = useState<string>('');
  const navigate = useNavigate();

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
        
      </div>
    </div>
  );
}

export default Landing; 