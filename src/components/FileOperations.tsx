import React, { useState } from 'react';
import { readFile, writeFile, fileExists } from '../utils/fileOperations';

const FileOperations: React.FC = () => {
  const [filePath, setFilePath] = useState('');
  const [fileContent, setFileContent] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReadFile = async () => {
    if (!filePath.trim()) {
      setResult('Please enter a file path');
      return;
    }

    setLoading(true);
    try {
      const content = await readFile(filePath);
      setFileContent(content);
      setResult(`Successfully read file: ${filePath}`);
    } catch (error) {
      setResult(`Error reading file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleWriteFile = async () => {
    if (!filePath.trim()) {
      setResult('Please enter a file path');
      return;
    }

    if (!fileContent.trim()) {
      setResult('Please enter content to write');
      return;
    }

    setLoading(true);
    try {
      await writeFile(filePath, fileContent);
      setResult(`Successfully wrote to file: ${filePath}`);
    } catch (error) {
      setResult(`Error writing file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckExists = async () => {
    if (!filePath.trim()) {
      setResult('Please enter a file path');
      return;
    }

    setLoading(true);
    try {
      const exists = await fileExists(filePath);
      setResult(`File ${filePath} ${exists ? 'exists' : 'does not exist'}`);
    } catch (error) {
      setResult(`Error checking file existence: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px' }}>
      <h2>File Operations Demo</h2>
      
      <div style={{ marginBottom: '15px' }}>
        <label htmlFor="filePath" style={{ display: 'block', marginBottom: '5px' }}>
          File Path:
        </label>
        <input
          id="filePath"
          type="text"
          value={filePath}
          onChange={(e) => setFilePath(e.target.value)}
          placeholder="Enter file path (e.g., C:\temp\test.txt)"
          style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
        />
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label htmlFor="fileContent" style={{ display: 'block', marginBottom: '5px' }}>
          File Content:
        </label>
        <textarea
          id="fileContent"
          value={fileContent}
          onChange={(e) => setFileContent(e.target.value)}
          placeholder="Enter content to write to file"
          style={{ width: '100%', height: '100px', padding: '8px', marginBottom: '10px' }}
        />
      </div>

      <div style={{ marginBottom: '15px' }}>
        <button
          onClick={handleReadFile}
          disabled={loading}
          style={{ marginRight: '10px', padding: '8px 16px' }}
        >
          Read File
        </button>
        <button
          onClick={handleWriteFile}
          disabled={loading}
          style={{ marginRight: '10px', padding: '8px 16px' }}
        >
          Write File
        </button>
        <button
          onClick={handleCheckExists}
          disabled={loading}
          style={{ padding: '8px 16px' }}
        >
          Check Exists
        </button>
      </div>

      {loading && <div style={{ marginBottom: '10px', color: 'blue' }}>Loading...</div>}
      
      {result && (
        <div style={{ 
          padding: '10px', 
          backgroundColor: result.includes('Error') ? '#ffebee' : '#e8f5e8',
          border: `1px solid ${result.includes('Error') ? '#f44336' : '#4caf50'}`,
          borderRadius: '4px'
        }}>
          {result}
        </div>
      )}

      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        <h3>Usage Examples:</h3>
        <ul>
          <li>Read a file: Enter a file path and click "Read File"</li>
          <li>Write a file: Enter a file path and content, then click "Write File"</li>
          <li>Check existence: Enter a file path and click "Check Exists"</li>
        </ul>
        <p><strong>Note:</strong> Make sure the file paths are valid and you have appropriate permissions.</p>
      </div>
    </div>
  );
};

export default FileOperations; 