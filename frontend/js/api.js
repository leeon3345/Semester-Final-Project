/**
 * API Configuration
 * ------------------
 * This file handles all server communication.
 * All team members should use the 'fetchData' function instead of the raw 'fetch'.
 */

// 1. Backend Server URL
// If you are using Live Server for frontend, keep this localhost URL.
const BASE_URL = "http://localhost:3000";

/**
 * 2. Common Fetch Wrapper
 * Use this function to send requests to the server.
 * It automatically handles the Base URL and Content-Type.
 * * @param {string} endpoint - API Endpoint (e.g., "/attractions", "/login")
 * @param {object} options - Fetch options (method, body, etc.)
 * @returns {Promise<any>} - JSON response from the server
 */
async function fetchData(endpoint, options = {}) {
    // Basic Headers
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers // Merge with custom headers if any
    };

    /** * TODO: [Leader] Authorization Token Logic will be added here later.
     * When Login is implemented, the token will be automatically attached.
     * * const token = localStorage.getItem('token');
     * if (token) {
     * headers['Authorization'] = `Bearer ${token}`;
     * }
     */

    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            ...options,
            headers // Apply headers
        });

        if (!response.ok) {
            throw new Error(`HTTP Error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("API Request Failed:", error);
        throw error;
    }
}

// Example Usage (For Teammates):
// fetchData('/attractions');
// fetchData('/schedules', { method: 'POST', body: JSON.stringify(data) });