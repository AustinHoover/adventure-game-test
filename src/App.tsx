import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Explore from './pages/Explore';
import Load from './pages/Load';
import NewGame from './pages/NewGame';
import AppPage from './pages/App';
import { SaveProvider } from './contexts/SaveContext';
import { ensureDirectory } from './utils/fileOperations';
import './App.css';

function App() {
  useEffect(() => {
    // Initialize app directories when the app starts
    const initializeApp = async () => {
      try {
        // Ensure the saves directory exists
        await ensureDirectory('saves');
        console.log('App directories initialized successfully');
      } catch (error) {
        console.error('Failed to initialize app directories:', error);
      }
    };

    initializeApp();
  }, []);

  return (
    <SaveProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/load" element={<Load />} />
            <Route path="/newgame" element={<NewGame />} />
            <Route path="/app" element={<AppPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </SaveProvider>
  );
}

export default App; 