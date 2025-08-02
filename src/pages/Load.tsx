import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSaveFileList, loadSaveFile, deleteSaveFile } from '../utils/saveFileOperations';
import { useSave } from '../contexts/SaveContext';
import './Landing.css';

function Load() {
  const [saveFiles, setSaveFiles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
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

  const handleDeleteClick = (saveName: string) => {
    setDeleteConfirm(saveName);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;
    
    try {
      setDeleting(true);
      await deleteSaveFile(deleteConfirm);
      console.log(`Deleted save file: ${deleteConfirm}`);
      
      // Refresh the save file list
      await loadSaveFiles();
      
      // Clear the confirmation
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Failed to delete save file:', error);
      setError(`Failed to delete save file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm(null);
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
                       <div key={saveName} style={{ 
                         display: 'flex', 
                         gap: '0.5rem', 
                         marginBottom: '0.5rem',
                         alignItems: 'center'
                       }}>
                         <button
                           className="menu-button load-button"
                           onClick={() => handleLoadSave(saveName)}
                           style={{ flex: 1 }}
                         >
                           {saveName}
                         </button>
                         <button
                           className="menu-button"
                           onClick={() => handleDeleteClick(saveName)}
                           style={{
                             backgroundColor: '#ff6b6b',
                             color: 'white',
                             padding: '0.5rem 1rem',
                             fontSize: '0.9rem',
                             minWidth: 'auto'
                           }}
                         >
                           Delete
                         </button>
                       </div>
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

       {/* Delete Confirmation Modal */}
       {deleteConfirm && (
         <div style={{
           position: 'fixed',
           top: 0,
           left: 0,
           right: 0,
           bottom: 0,
           backgroundColor: 'rgba(0, 0, 0, 0.8)',
           display: 'flex',
           justifyContent: 'center',
           alignItems: 'center',
           zIndex: 1000
         }}>
           <div style={{
             background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
             padding: '2rem',
             borderRadius: '15px',
             maxWidth: '400px',
             width: '90%',
             textAlign: 'center',
             boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
           }}>
             <h3 style={{ 
               color: 'white', 
               marginBottom: '1rem',
               fontSize: '1.3rem'
             }}>
               Delete Save File
             </h3>
             <p style={{ 
               color: 'white', 
               marginBottom: '2rem',
               fontSize: '1rem',
               lineHeight: '1.5'
             }}>
               Are you sure you want to delete "{deleteConfirm}"? This action cannot be undone.
             </p>
             <div style={{ 
               display: 'flex', 
               gap: '1rem',
               justifyContent: 'center'
             }}>
               <button
                 className="menu-button"
                 onClick={handleDeleteCancel}
                 disabled={deleting}
                 style={{
                   backgroundColor: '#6c757d',
                   color: 'white',
                   padding: '0.75rem 1.5rem'
                 }}
               >
                 Cancel
               </button>
               <button
                 className="menu-button"
                 onClick={handleDeleteConfirm}
                 disabled={deleting}
                 style={{
                   backgroundColor: '#dc3545',
                   color: 'white',
                   padding: '0.75rem 1.5rem'
                 }}
               >
                 {deleting ? 'Deleting...' : 'Delete'}
               </button>
             </div>
           </div>
         </div>
       )}
     </div>
   );
 }

export default Load; 