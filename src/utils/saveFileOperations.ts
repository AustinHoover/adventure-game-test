import { SaveFile, Character, CharacterRegistry, MapRegistry, GameMap, Location } from '../game/interfaces';
import { writeFile, readFile, fileExists, ensureDirectory, readDirectory, isDirectory, deleteDirectory } from './fileOperations';
import { generateTown } from '../game/mapgen';

/**
 * Save file operations utility functions
 * These functions handle creating, saving, and loading save files
 */

const SAVES_DIRECTORY = 'saves';
const SAVE_FILE_EXTENSION = '.json';
const MAPS_DIRECTORY = 'maps';

/**
 * Save a map to a separate JSON file
 * @param saveName - The name of the save file
 * @param mapId - The ID of the map
 * @param gameMap - The GameMap object
 * @param locations - The array of Location objects
 * @returns Promise that resolves when the map is saved successfully
 */
export const saveMapFile = async (
  saveName: string, 
  mapId: number, 
  gameMap: GameMap, 
  locations: Location[]
): Promise<void> => {
  const saveFolderPath = `${SAVES_DIRECTORY}/${saveName}`;
  const mapsFolderPath = `${saveFolderPath}/${MAPS_DIRECTORY}`;
  const fileName = `map${mapId}${SAVE_FILE_EXTENSION}`;
  const filePath = `${mapsFolderPath}/${fileName}`;
  
  try {
    // Ensure the maps folder exists
    await ensureDirectory(mapsFolderPath);
    
    const mapData = {
      gameMap,
      locations
    };
    
    const jsonContent = JSON.stringify(mapData, null, 2);
    await writeFile(filePath, jsonContent);
    console.log(`Map file saved successfully: ${filePath}`);
  } catch (error) {
    console.error('Failed to save map file:', error);
    throw new Error(`Failed to save map file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Load a map from a separate JSON file
 * @param saveName - The name of the save file
 * @param mapId - The ID of the map
 * @returns Promise that resolves to the map data object
 */
export const loadMapFile = async (
  saveName: string, 
  mapId: number
): Promise<{ gameMap: GameMap; locations: Location[] }> => {
  const saveFolderPath = `${SAVES_DIRECTORY}/${saveName}`;
  const mapsFolderPath = `${saveFolderPath}/${MAPS_DIRECTORY}`;
  const fileName = `map${mapId}${SAVE_FILE_EXTENSION}`;
  const filePath = `${mapsFolderPath}/${fileName}`;
  
  try {
    const jsonContent = await readFile(filePath);
    const mapData = JSON.parse(jsonContent);
    
    return {
      gameMap: mapData.gameMap,
      locations: mapData.locations
    };
  } catch (error) {
    console.error('Failed to load map file:', error);
    throw new Error(`Failed to load map file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Check if a map file exists
 * @param saveName - The name of the save file
 * @param mapId - The ID of the map
 * @returns Promise that resolves to true if the map file exists
 */
export const mapFileExists = async (saveName: string, mapId: number): Promise<boolean> => {
  const saveFolderPath = `${SAVES_DIRECTORY}/${saveName}`;
  const mapsFolderPath = `${saveFolderPath}/${MAPS_DIRECTORY}`;
  const fileName = `map${mapId}${SAVE_FILE_EXTENSION}`;
  const filePath = `${mapsFolderPath}/${fileName}`;
  
  return await fileExists(filePath);
};

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

  // Create initial player character
  const playerCharacter: Character = {
    id: 1, // First character gets ID 1
    name: 'Player',
    location: 1, // Start at first road location
    unitId: 1, // First unit gets ID 1
    mapId: 2 // Start on town map (ID 2)
  };

  // Create character registry with the player character
  const characterRegistry: CharacterRegistry = {
    characters: new Map([[playerCharacter.id, playerCharacter]])
  };

  // Create initial map registry with town
  const { gameMap, locations } = generateTown();
  const mapRegistry: MapRegistry = {
    mapFiles: new Map([[gameMap.id, `map${gameMap.id}${SAVE_FILE_EXTENSION}`]])
  };

  const saveFile: SaveFile = {
    name,
    lastOpened: now,
    version,
    createdAt: now,
    characterRegistry,
    playerCharacterId: playerCharacter.id,
    mapRegistry
  };

  return saveFile;
};

/**
 * Save a save file to disk
 * @param saveFile - The SaveFile object to save
 * @returns Promise that resolves when the file is saved successfully
 */
export const saveSaveFile = async (saveFile: SaveFile): Promise<void> => {
  const saveFolderPath = `${SAVES_DIRECTORY}/${saveFile.name}`;
  const fileName = `save${SAVE_FILE_EXTENSION}`;
  const filePath = `${saveFolderPath}/${fileName}`;
  
  try {
    // Ensure the save folder exists
    await ensureDirectory(saveFolderPath);
    
    // Convert Maps to objects for JSON serialization
    const serializableSaveFile = {
      ...saveFile,
      characterRegistry: {
        characters: Object.fromEntries(saveFile.characterRegistry.characters)
      },
      mapRegistry: {
        mapFiles: Object.fromEntries(saveFile.mapRegistry.mapFiles)
      }
    };
    
    const jsonContent = JSON.stringify(serializableSaveFile, null, 2);
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
  const saveFolderPath = `${SAVES_DIRECTORY}/${name}`;
  const fileName = `save${SAVE_FILE_EXTENSION}`;
  const filePath = `${saveFolderPath}/${fileName}`;
  
  try {
    const jsonContent = await readFile(filePath);
    const parsedData = JSON.parse(jsonContent);
    
    // Convert object back to Map for character registry
    // Convert string keys back to numbers for character IDs
    const characterEntries: [number, Character][] = Object.entries(parsedData.characterRegistry.characters).map(([key, value]) => [
      parseInt(key, 10), // Convert string key back to number
      value as Character
    ]);

    // Convert object back to Map for map registry
    // Convert string keys back to numbers for map IDs
    const mapFileEntries: [number, string][] = Object.entries(parsedData.mapRegistry.mapFiles).map(([key, value]) => [
      parseInt(key, 10), // Convert string key back to number
      value as string
    ]);
    
    const saveFile: SaveFile = {
      ...parsedData,
      playerCharacterId: typeof parsedData.playerCharacterId === 'string' 
        ? parseInt(parsedData.playerCharacterId, 10) 
        : parsedData.playerCharacterId,
      characterRegistry: {
        characters: new Map(characterEntries)
      },
      mapRegistry: {
        mapFiles: new Map(mapFileEntries)
      }
    };
    
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
  const saveFolderPath = `${SAVES_DIRECTORY}/${name}`;
  const fileName = `save${SAVE_FILE_EXTENSION}`;
  const filePath = `${saveFolderPath}/${fileName}`;
  
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
    
    // Read all items in the saves directory
    const items = await readDirectory(SAVES_DIRECTORY);
    
    // Filter for directories (folders) and check if they contain a save.json file
    const saveFolders: string[] = [];
    
    for (const item of items) {
      const folderPath = `${SAVES_DIRECTORY}/${item}`;
      const saveFilePath = `${folderPath}/save${SAVE_FILE_EXTENSION}`;
      
      try {
        // Check if this item is a directory
        const itemIsDirectory = await isDirectory(folderPath);
        if (!itemIsDirectory) {
          continue; // Skip non-directory items
        }
        
        // Check if the directory contains a save.json file
        const hasSaveFile = await fileExists(saveFilePath);
        if (hasSaveFile) {
          saveFolders.push(item);
        }
      } catch (error) {
        // Skip items that can't be accessed or don't have the save file
        console.warn(`Skipping invalid save folder: ${item}`, error);
      }
    }
    
    return saveFolders;
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
  
  // Save the initial map data
  const { gameMap, locations } = generateTown();
  await saveMapFile(name, gameMap.id, gameMap, locations);
  
  return saveFile;
};

/**
 * Delete a save file
 * @param name - The name of the save file to delete
 * @returns Promise that resolves when the file is deleted successfully
 */
export const deleteSaveFile = async (name: string): Promise<void> => {
  const saveFolderPath = `${SAVES_DIRECTORY}/${name}`;
  
  try {
    await deleteDirectory(saveFolderPath);
    console.log(`Save file deleted successfully: ${saveFolderPath}`);
  } catch (error) {
    console.error('Failed to delete save file:', error);
    throw new Error(`Failed to delete save file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}; 