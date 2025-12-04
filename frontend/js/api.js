/**
 * API Configuration
 * ------------------
 */

// 1. Backend Server URL
const BASE_URL = "http://localhost:3000";

// 2. Key for storing the Auth Token in localStorage
const AUTH_TOKEN_KEY = 'authToken';

// 3. Key for storing the full user object
const CURRENT_USER_KEY = 'currentUser'; 

// --- Utility Functions for Token Management ---

export function saveAuthToken(token) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function getAuthToken() {
    return localStorage.getItem(AUTH_TOKEN_KEY);
}

/**
 * Clears the authentication token, user details, and redirects to the login page.
 */
export function clearAuthAndRedirect() {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(CURRENT_USER_KEY); // Elimina los detalles del usuario
    window.location.href = 'index.html'; 
}

/**
 * Checks if a user is logged in. If not, redirects them.
 */
export function checkAuthAndRedirect() {
    if (!getAuthToken()) {
        console.warn('Authentication required. Redirecting to login.');
        clearAuthAndRedirect();
        return false;
    }
    return true;
}

// --- Core Fetch Wrapper ---

export async function fetchData(endpoint, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers 
    };

    // Attach Authorization header if a token exists
    const token = getAuthToken();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            ...options,
            headers
        });

        // Handle 401 Unauthorized errors
        if (response.status === 401) {
             console.error("401 Unauthorized: Token either expired or invalid.");
             clearAuthAndRedirect(); 
             throw new Error("Access unauthorized. Please log in again.");
        }

        if (!response.ok) {
            let errorText = await response.text();
            try {
                const errorJson = JSON.parse(errorText);
                errorText = errorJson.message || errorText;
            } catch (e) { }
            throw new Error(`HTTP Error! status: ${response.status} - ${errorText}`);
        }

        if (response.status === 204) {
            return {};
        }

        return await response.json();
    } catch (error) {
        console.error("API Request Failed:", error);
        throw error;
    }
}