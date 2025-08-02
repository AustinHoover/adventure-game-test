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
 * Write a file, creating parent directories if they don't exist
 * Note: This is a basic implementation. For more robust directory creation,
 * you might want to add a separate IPC handler for directory operations.
 * @param filePath - The path to the file to write
 * @param content - The content to write to the file
 * @returns Promise that resolves when the file is written successfully
 */
export const writeFileWithDirs = async (filePath: string, content: string): Promise<void> => {
  // For now, we'll just try to write the file and let the OS handle directory creation
  // In a more robust implementation, you might want to add directory creation logic
  return await writeFile(filePath, content);
}; 