// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent('react')
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock Electron API for tests
Object.defineProperty(window, 'electronAPI', {
  value: {
    getAppVersion: jest.fn().mockResolvedValue('1.0.0'),
    getAppName: jest.fn().mockResolvedValue('Adventure Game Test'),
  },
  writable: true,
});

// Mock react-router-dom for tests
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));
