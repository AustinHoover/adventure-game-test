import React from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';

function AppPage() {
  const navigate = useNavigate();

  const handleBackToLanding = () => {
    navigate('/');
  };

  return (
    <div className="AppPage">
      <header className="AppPage-header">
        <div className="header-content">
        </div>
      </header>
      
      <main className="AppPage-main">
        <div className="content-section">
        </div>
      </main>
    </div>
  );
}

export default AppPage; 