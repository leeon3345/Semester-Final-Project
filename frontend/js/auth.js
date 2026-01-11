// js/auth.js

// Import required functions from the API module
import { fetchData, saveAuthToken, getAuthToken, clearAuthAndRedirect as apiClearAuth } from './api.js';

// Key for storing the full user object
const CURRENT_USER_KEY = 'currentUser';

// --- Function to clear ALL local user data (Token + User Details) ---
function clearAuthAndRedirect() {
    apiClearAuth(); // Clear the token and redirect (from api.js)
    localStorage.removeItem(CURRENT_USER_KEY); // Clear the user details
}

// --- Helper function to retrieve full user details ---
async function fetchAndStoreUserDetails(userId) {
    try {
        // GET /600/users/:id endpoint is protected and requires Auth Token
        const userDetails = await fetchData(`/600/users/${userId}`, { method: 'GET' });
        
        // Store the full details (including username) in localStorage
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userDetails));
        console.log("User details saved:", userDetails);
        
    } catch(error) {
        console.error("Failed to fetch full user details. Token might be invalid.", error);
        alert('Warning: Login successful, but profile details failed to load. Try logging in again.');
        throw error; 
    }
}


// --- Login Logic ---
async function handleLogin() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    if (!email || !password) {
        alert('Please enter both email and password.');
        return;
    }

    try {
        // 1. POST /login (Get Token and User ID)
        const data = await fetchData('/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });

        saveAuthToken(data.accessToken); 
        
        const userId = data.user.id;
        
        // 2. FETCH and STORE full user details
        await fetchAndStoreUserDetails(userId); 
        
        // 3. Redirect
        window.location.href = 'schedule-list.html'; 

    } catch (error) {
        alert('Login failed: ' + error.message);
        console.error('Login error:', error);
    }
}

// --- Register Logic ---
async function handleRegister() {
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const username = document.getElementById('reg-username').value;

    if (!email || !password || !username) {
        alert('Please complete all fields.');
        return;
    }

    try {
        // 1. POST /register (Creates user, gets Token and User ID)
        const data = await fetchData('/register', {
            method: 'POST',
            body: JSON.stringify({ email, password, username })
        });

        saveAuthToken(data.accessToken); 
        
        const userId = data.user.id;
        
        // 2. FETCH and STORE full user details immediately after registration
        await fetchAndStoreUserDetails(userId); 

        // 3. Redirect
        window.location.href = 'schedule-list.html'; 

    } catch (error) {
        alert('Registration failed: ' + error.message);
        console.error('Register error:', error);
    }
}

// Export functions to be globally accessible from HTML's onclick attributes
window.handleLogin = handleLogin;
window.clearAuthAndRedirect = clearAuthAndRedirect; // For the "Log Out" button

// --- Event Listeners & Page Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    // 1. Redirect logged-in users away from auth pages
    if (getAuthToken() && 
        (window.location.pathname.includes('login.html') || 
         window.location.pathname.includes('register.html'))) {
        window.location.href = 'schedule-list.html';
        return; // Stop further script execution
    }

    // 2. Attach listener specifically for the registration form
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', (event) => {
            event.preventDefault(); // Prevent default form submission (page reload)
            handleRegister();       // Call the registration logic
        });
    }
});