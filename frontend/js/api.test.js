// frontend/js/api.test.js

import { fetchData, saveAuthToken, getAuthToken } from './api';
import { navigate } from './navigation';

// 1. Mocking localStorage
const localStorageMock = (function() {
  let store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => { store[key] = value.toString(); }),
    removeItem: jest.fn(key => { delete store[key]; }),
    clear: jest.fn(() => { store = {}; })
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// 2. Mocking fetch
global.fetch = jest.fn();

// 3. Mocking navigate
jest.mock('./navigation', () => ({
  navigate: jest.fn(),
}));

describe('API Module Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
  });

  test('saveAuthToken should save the token to localStorage', () => {
    saveAuthToken('fake-token');
    expect(localStorage.setItem).toHaveBeenCalledWith('authToken', 'fake-token');
  });

  test('getAuthToken should retrieve the token from localStorage', () => {
    localStorage.setItem('authToken', 'test-token');
    const token = getAuthToken();
    expect(token).toBe('test-token');
  });

  test('fetchData should send a request to the correct URL with an Authorization header', async () => {
    localStorage.setItem('authToken', 'access-token-123');
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ data: 'success' }),
    });

    const response = await fetchData('/test-endpoint');

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/test-endpoint',
      expect.objectContaining({
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer access-token-123'
        }
      })
    );
    expect(response).toEqual({ data: 'success' });
  });

  test('fetchData should handle logout on a 401 error', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});

    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      text: async () => 'Unauthorized',
    });

    await expect(fetchData('/protected')).rejects.toThrow('Access unauthorized');
    
    expect(localStorage.removeItem).toHaveBeenCalledWith('authToken');
    
    // [Check] Whether navigate is called
    expect(navigate).toHaveBeenCalledWith('index.html');
  });
});