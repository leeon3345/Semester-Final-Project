// frontend/js/auth.js

import { fetchData, saveAuthToken, getAuthToken, clearAuthAndRedirect as apiClearAuth } from './api.js';
import { navigate } from './navigation.js';

const CURRENT_USER_KEY = 'currentUser';

function clearAuthAndRedirect() {
    apiClearAuth();
    localStorage.removeItem(CURRENT_USER_KEY);
}

async function fetchAndStoreUserDetails(userId) {
    try {
        const userDetails = await fetchData(`/600/users/${userId}`, { method: 'GET' });
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userDetails));
        console.log("User details saved:", userDetails);
    } catch(error) {
        console.error("Failed to fetch full user details. Token might be invalid.", error);
        alert('Warning: Login successful, but profile details failed to load. Try logging in again.');
        throw error; 
    }
}

async function handleLogin() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    if (!email || !password) {
        alert('Please enter both email and password.');
        return;
    }

    try {
        const data = await fetchData('/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });

        saveAuthToken(data.accessToken); 
        
        const userId = data.user.id;
        await fetchAndStoreUserDetails(userId); 
        
        // [MODIFIED] Use navigate
        navigate('schedule-list.html'); 

    } catch (error) {
        alert('Login failed: ' + error.message);
        console.error('Login error:', error);
    }
}

async function handleRegister() {
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const username = document.getElementById('reg-username').value;

    if (!email || !password || !username) {
        alert('Please complete all fields.');
        return;
    }

    try {
        const data = await fetchData('/register', {
            method: 'POST',
            body: JSON.stringify({ email, password, username })
        });

        saveAuthToken(data.accessToken); 
        
        const userId = data.user.id;
        await fetchAndStoreUserDetails(userId); 

        // [MODIFIED] Use navigate
        navigate('schedule-list.html'); 

    } catch (error) {
        alert('Registration failed: ' + error.message);
        console.error('Register error:', error);
    }
}

window.handleLogin = handleLogin;
window.clearAuthAndRedirect = clearAuthAndRedirect;

document.addEventListener('DOMContentLoaded', () => {
    if (getAuthToken() && 
        (window.location.pathname.includes('login.html') || 
         window.location.pathname.includes('register.html'))) {
        window.location.href = 'schedule-list.html';
        return;
    }

    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', (event) => {
            event.preventDefault();
            handleRegister();
        });
    }
});