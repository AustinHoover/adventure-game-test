import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Explore from './pages/Explore';
import Load from './pages/Load';
import NewGame from './pages/NewGame';
import AppPage from './pages/App';
import Journey from './pages/Journey';
import Combat from './pages/Combat';
import Interaction from './pages/Interaction';
import Inventory from './pages/Inventory';
import Shop from './pages/Shop';
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
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/journey" element={<Journey />} />
          <Route path="/combat" element={<Combat />} />
          <Route path="/interaction" element={<Interaction />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/load" element={<Load />} />
          <Route path="/newgame" element={<NewGame />} />
          <Route path="/app" element={<AppPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App; 