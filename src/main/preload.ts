import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  getAppName: () => ipcRenderer.invoke('get-app-name'),
  // File system operations
  readFile: (filePath: string) => ipcRenderer.invoke('read-file', filePath),
  writeFile: (filePath: string, content: string) => ipcRenderer.invoke('write-file', filePath, content),
  fileExists: (filePath: string) => ipcRenderer.invoke('file-exists', filePath),
  ensureDirectory: (dirPath: string) => ipcRenderer.invoke('ensure-directory', dirPath),
  readDirectory: (dirPath: string) => ipcRenderer.invoke('read-directory', dirPath),
  isDirectory: (path: string) => ipcRenderer.invoke('is-directory', path),
});

// TypeScript declarations for the exposed API
declare global {
  interface Window {
    electronAPI: {
      getAppVersion: () => Promise<string>;
      getAppName: () => Promise<string>;
      // File system operations
      readFile: (filePath: string) => Promise<{ success: boolean; data?: string; error?: string }>;
      writeFile: (filePath: string, content: string) => Promise<{ success: boolean; error?: string }>;
      fileExists: (filePath: string) => Promise<{ success: boolean; exists: boolean }>;
      ensureDirectory: (dirPath: string) => Promise<{ success: boolean; error?: string }>;
      readDirectory: (dirPath: string) => Promise<{ success: boolean; files?: string[]; error?: string }>;
      isDirectory: (path: string) => Promise<{ success: boolean; isDirectory?: boolean; error?: string }>;
    };
  }
} 