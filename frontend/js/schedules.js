// js/schedules.js
import { fetchData, checkAuthAndRedirect, clearAuthAndRedirect } from './api.js';

// 1. Authentication Check
//checkAuthAndRedirect();

const schedulesContainer = document.getElementById('schedulesContainer');
const logoutBtn = document.getElementById('logoutBtn');

// --- Rendering and Deletion Functions ---

/**
 * Renders all schedules in HTML cards.
 * @param {Array} schedules - List of schedule objects from the API.
 */
function renderSchedules(schedules) {
    schedulesContainer.innerHTML = ''; // Clear the container
    
    if (schedules.length === 0) {
        schedulesContainer.innerHTML = '<p class="info-msg">You have no saved schedules. Click "Create New Schedule (+)" to start!</p>';
        return;
    }

    schedules.forEach(schedule => {
        const card = document.createElement('div');
        card.className = 'schedule-card';
        card.innerHTML = `
            <h3>${schedule.title}</h3>
            <p><strong>Dates:</strong> ${schedule.startDate} to ${schedule.endDate}</p>
            <p class="cost-summary"><strong>Total Cost:</strong> $${schedule.totalCost.toFixed(2)}</p>
            <button class="delete-btn btn-danger" data-id="${schedule.id}">Delete</button>
        `;
        schedulesContainer.appendChild(card);
    });
    
    // Attach event listeners to the delete buttons
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', handleDeleteSchedule);
    });
}

/**
 * Loads the user's schedules from the API.
 */
async function loadSchedules() {
    schedulesContainer.innerHTML = '<p id="loading-msg">Loading your schedules...</p>';
    
    try {
        // GET /600/schedules will filter results based on the logged-in user's token.
        const schedules = await fetchData('/600/schedules', { method: 'GET' });
        renderSchedules(schedules);
        
    } catch (error) {
        schedulesContainer.innerHTML = `<p class="error-msg">Error loading schedules: ${error.message}</p>`;
        console.error('Error fetching schedules:', error);
    }
}

/**
 * Handles the deletion of a saved schedule.
 * @param {Event} event - The click event.
 */
async function handleDeleteSchedule(event) {
    const scheduleId = event.target.dataset.id;
    if (!confirm('Are you sure you want to delete this schedule?')) {
        return;
    }

    event.target.disabled = true;
    event.target.textContent = 'Deleting...';

    try {
        // DELETE /600/schedules/:id (requires Auth Token)
        await fetchData(`/600/schedules/${scheduleId}`, { method: 'DELETE' });

        // Remove the card from the DOM immediately
        event.target.closest('.schedule-card').remove(); 
        
        // If the container is now empty, re-load to show the "no saved schedules" message
        if (schedulesContainer.children.length === 0) {
            loadSchedules();
        }

    } catch (error) {
        alert('Error deleting schedule: ' + error.message);
        event.target.disabled = false;
        event.target.textContent = 'Delete';
        console.error('Delete error:', error);
    }
}

// --- Initialization and Listeners ---

document.addEventListener('DOMContentLoaded', () => {
    loadSchedules(); // Initial data load
    
    // Log Out Button
    logoutBtn.addEventListener('click', () => {
        clearAuthAndRedirect();
    });
});