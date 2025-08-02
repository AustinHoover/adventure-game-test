import { SaveFile } from '../game/interfaces';
import { writeFile, readFile, fileExists, ensureDirectory, readDirectory } from './fileOperations';

/**
 * Save file operations utility functions
 * These functions handle creating, saving, and loading save files
 */

const SAVES_DIRECTORY = 'saves';
const SAVE_FILE_EXTENSION = '.json';

/**
 * Create a new save file with the given name
 * @param name - The name of the save file
 * @returns Promise that resolves to the created SaveFile object
 */
export const createSaveFile = async (name: string): Promise<SaveFile> => {
  const now = new Date().toISOString();
  
  // Get app version from Electron API
  let version = '1.0.0'; // Default version
  try {
    if (window.electronAPI) {
      version = await window.electronAPI.getAppVersion();
    }
  } catch (error) {
    console.warn('Could not get app version, using default:', error);
  }

  const saveFile: SaveFile = {
    name,
    lastOpened: now,
    version,
    createdAt: now
  };

  return saveFile;
};

/**
 * Save a save file to disk
 * @param saveFile - The SaveFile object to save
 * @returns Promise that resolves when the file is saved successfully
 */
export const saveSaveFile = async (saveFile: SaveFile): Promise<void> => {
  const fileName = `${saveFile.name}${SAVE_FILE_EXTENSION}`;
  const filePath = `${SAVES_DIRECTORY}/${fileName}`;
  
  try {
    // Ensure the saves directory exists
    await ensureDirectory(SAVES_DIRECTORY);
    
    const jsonContent = JSON.stringify(saveFile, null, 2);
    await writeFile(filePath, jsonContent);
    console.log(`Save file saved successfully: ${filePath}`);
  } catch (error) {
    console.error('Failed to save save file:', error);
    throw new Error(`Failed to save save file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Load a save file from disk
 * @param name - The name of the save file to load
 * @returns Promise that resolves to the SaveFile object
 */
export const loadSaveFile = async (name: string): Promise<SaveFile> => {
  const fileName = `${name}${SAVE_FILE_EXTENSION}`;
  const filePath = `${SAVES_DIRECTORY}/${fileName}`;
  
  try {
    const jsonContent = await readFile(filePath);
    const saveFile: SaveFile = JSON.parse(jsonContent);
    
    // Update the lastOpened timestamp
    saveFile.lastOpened = new Date().toISOString();
    
    // Save the updated file back to disk
    await saveSaveFile(saveFile);
    
    return saveFile;
  } catch (error) {
    console.error('Failed to load save file:', error);
    throw new Error(`Failed to load save file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Check if a save file exists
 * @param name - The name of the save file to check
 * @returns Promise that resolves to true if the save file exists
 */
export const saveFileExists = async (name: string): Promise<boolean> => {
  const fileName = `${name}${SAVE_FILE_EXTENSION}`;
  const filePath = `${SAVES_DIRECTORY}/${fileName}`;
  
  return await fileExists(filePath);
};

/**
 * Get a list of all available save files
 * @returns Promise that resolves to an array of save file names
 */
export const getSaveFileList = async (): Promise<string[]> => {
  try {
    // Ensure the saves directory exists
    await ensureDirectory(SAVES_DIRECTORY);
    
    // Read all files in the saves directory
    const files = await readDirectory(SAVES_DIRECTORY);
    
    // Filter for .json files and remove the .json extension
    const saveFiles = files
      .filter(file => file.endsWith(SAVE_FILE_EXTENSION))
      .map(file => file.replace(SAVE_FILE_EXTENSION, ''));
    
    return saveFiles;
  } catch (error) {
    console.error('Failed to get save file list:', error);
    return [];
  }
};

/**
 * Create a new save file and save it to disk
 * @param name - The name of the save file
 * @returns Promise that resolves to the created SaveFile object
 */
export const createAndSaveFile = async (name: string): Promise<SaveFile> => {
  const saveFile = await createSaveFile(name);
  await saveSaveFile(saveFile);
  return saveFile;
};

/**
 * Delete a save file
 * @param name - The name of the save file to delete
 * @returns Promise that resolves when the file is deleted successfully
 */
export const deleteSaveFile = async (name: string): Promise<void> => {
  // TODO: Implement delete functionality
  // This would require adding a delete file operation to the main process
  throw new Error('Delete functionality not yet implemented');
}; 