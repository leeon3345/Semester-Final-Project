// frontend/js/auth.test.js

import { saveAuthToken } from './api';
import { navigate } from './navigation';
import './auth.js'; 

// 1. Mocking api.js
jest.mock('./api.js', () => ({
  fetchData: jest.fn(),
  saveAuthToken: jest.fn(),
  getAuthToken: jest.fn(),
  clearAuthAndRedirect: jest.fn(),
}));

// 2. Mocking navigation.js
jest.mock('./navigation.js', () => ({
  navigate: jest.fn(),
}));

import { fetchData } from './api';

describe('Auth Module Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    document.body.innerHTML = `
      <input type="email" id="login-email" value="test@example.com" />
      <input type="password" id="login-password" value="password123" />
    `;
    window.alert = jest.fn();
  });

  test('handleLogin should save token and navigate on successful call', async () => {
    fetchData
      .mockResolvedValueOnce({ accessToken: 'fake-jwt-token', user: { id: 1 } }) 
      .mockResolvedValueOnce({ id: 1, email: 'test@example.com' }); 

    await window.handleLogin();

    expect(fetchData).toHaveBeenCalledWith('/login', expect.objectContaining({
      method: 'POST'
    }));

    const { saveAuthToken } = require('./api');
    expect(saveAuthToken).toHaveBeenCalledWith('fake-jwt-token');
    
    // [Check] Whether navigate is called
    expect(navigate).toHaveBeenCalledWith('schedule-list.html');
  });

  test('Should not call API if email or password is empty', async () => {
    document.getElementById('login-email').value = ''; 
    document.getElementById('login-password').value = '';

    await window.handleLogin();

    expect(window.alert).toHaveBeenCalledWith('Please enter both email and password.');
    expect(fetchData).not.toHaveBeenCalled();
  });
});