/**
 * File operations utility functions for Electron
 * These functions provide a convenient interface to the file system operations
 * exposed through the Electron IPC bridge.
 */

/**
 * Read a file and return its contents as a string
 * @param filePath - The path to the file to read
 * @returns Promise that resolves to the file contents or rejects with an error
 */
export const readFile = async (filePath: string): Promise<string> => {
  const result = await window.electronAPI.readFile(filePath);
  if (result.success && result.data !== undefined) {
    return result.data;
  } else {
    throw new Error(result.error || 'Failed to read file');
  }
};

/**
 * Write a string to a file
 * @param filePath - The path to the file to write
 * @param content - The content to write to the file
 * @returns Promise that resolves when the file is written successfully
 */
export const writeFile = async (filePath: string, content: string): Promise<void> => {
  const result = await window.electronAPI.writeFile(filePath, content);
  if (!result.success) {
    throw new Error(result.error || 'Failed to write file');
  }
};

/**
 * Check if a file exists
 * @param filePath - The path to the file to check
 * @returns Promise that resolves to true if the file exists, false otherwise
 */
export const fileExists = async (filePath: string): Promise<boolean> => {
  const result = await window.electronAPI.fileExists(filePath);
  if (result.success) {
    return result.exists;
  } else {
    throw new Error('Failed to check file existence');
  }
};

/**
 * Read a file if it exists, or return null if it doesn't
 * @param filePath - The path to the file to read
 * @returns Promise that resolves to the file contents or null if the file doesn't exist
 */
export const readFileIfExists = async (filePath: string): Promise<string | null> => {
  const exists = await fileExists(filePath);
  if (exists) {
    return await readFile(filePath);
  }
  return null;
};

/**
 * Ensure a directory exists, creating it if necessary
 * @param dirPath - The path to the directory to ensure exists
 * @returns Promise that resolves when the directory is ensured to exist
 */
export const ensureDirectory = async (dirPath: string): Promise<void> => {
  const result = await window.electronAPI.ensureDirectory(dirPath);
  if (!result.success) {
    throw new Error(result.error || 'Failed to ensure directory exists');
  }
};

/**
 * Read the contents of a directory
 * @param dirPath - The path to the directory to read
 * @returns Promise that resolves to an array of file names in the directory
 */
export const readDirectory = async (dirPath: string): Promise<string[]> => {
  const result = await window.electronAPI.readDirectory(dirPath);
  if (result.success && result.files) {
    return result.files;
  } else {
    throw new Error(result.error || 'Failed to read directory');
  }
};

/**
 * Check if a path is a directory
 * @param path - The path to check
 * @returns Promise that resolves to true if the path is a directory
 */
export const isDirectory = async (path: string): Promise<boolean> => {
  const result = await window.electronAPI.isDirectory(path);
  if (result.success && result.isDirectory !== undefined) {
    return result.isDirectory;
  } else {
    throw new Error(result.error || 'Failed to check if path is directory');
  }
};

/**
 * Delete a directory and all its contents
 * @param dirPath - The path to the directory to delete
 * @returns Promise that resolves when the directory is deleted successfully
 */
export const deleteDirectory = async (dirPath: string): Promise<void> => {
  const result = await window.electronAPI.deleteDirectory(dirPath);
  if (!result.success) {
    throw new Error(result.error || 'Failed to delete directory');
  }
};

/**
 * Write a file, creating parent directories if they don't exist
 * @param filePath - The path to the file to write
 * @param content - The content to write to the file
 * @returns Promise that resolves when the file is written successfully
 */
export const writeFileWithDirs = async (filePath: string, content: string): Promise<void> => {
  // Extract the directory path from the file path
  const dirPath = filePath.substring(0, filePath.lastIndexOf('/') + 1);
  
  // Ensure the directory exists
  await ensureDirectory(dirPath);
  
  // Write the file
  return await writeFile(filePath, content);
}; 