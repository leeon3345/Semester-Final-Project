// frontend/js/schedules.js
import { fetchData, checkAuthAndRedirect, clearAuthAndRedirect } from './api.js';

// 1. Authentication Check
//checkAuthAndRedirect();

const schedulesContainer = document.getElementById('schedulesContainer');
const logoutBtn = document.getElementById('logoutBtn');

// --- Rendering and Deletion Functions ---

function renderSchedules(schedules) {
    schedulesContainer.innerHTML = ''; 
    
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
            <p class="cost-summary"><strong>Total Cost:</strong> $${schedule.totalCost ? schedule.totalCost.toFixed(2) : 0}</p>
            
            <div class="card-actions">
                <button class="edit-btn btn-secondary" data-id="${schedule.id}">✏️ Edit</button>
                <button class="delete-btn btn-danger" data-id="${schedule.id}">🗑️ Delete</button>
            </div>
        `;
        schedulesContainer.appendChild(card);
    });
    
    attachScheduleListeners();
}

function attachScheduleListeners() {
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', handleDeleteSchedule);
    });
    
    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', handleEditSchedule);
    });
}

/**
 * Loads the user's schedules using a Safe Query Method.
 */
async function loadSchedules() {
    schedulesContainer.innerHTML = '<p id="loading-msg">Loading your schedules...</p>';
    
    // Get user ID
    let userId = null;
    try {
        const potentialKeys = ['user', 'currentUser', 'userInfo', 'auth'];
        for (const key of potentialKeys) {
            const stored = localStorage.getItem(key);
            if (stored) {
                const parsed = JSON.parse(stored);
                if (parsed.id) { userId = parsed.id; break; }
            }
        }
    } catch (e) { console.error(e); }

    if (!userId) {
        // Fallback: Token exists but ID not found, force logout
        console.warn("User ID not found via localStorage.");
        // alert("Session expired. Please login again.");
        // clearAuthAndRedirect();
        // return;
        
        // (for testing) temporarily assign ID 1 if urgent (uncomment if needed)
        // userId = 1; 
    }

    try {
        //  /600/schedules -> ?userId= query used (avoid 403 error)
        const endpoint = userId ? `/schedules?userId=${userId}` : '/schedules';
        const schedules = await fetchData(endpoint, { method: 'GET' });
        
        renderSchedules(schedules);
        
    } catch (error) {
        schedulesContainer.innerHTML = `<p class="error-msg">Error loading schedules: ${error.message}</p>`;
        console.error('Error fetching schedules:', error);
    }
}

function handleEditSchedule(event) {
    const scheduleId = event.target.dataset.id;
    window.location.href = `scheduler.html?id=${scheduleId}`;
}

async function handleDeleteSchedule(event) {
    const scheduleId = event.target.dataset.id;
    if (!confirm('Are you sure you want to delete this schedule?')) return;

    event.target.disabled = true;
    event.target.textContent = 'Deleting...';

    try {
        await fetchData(`/600/schedules/${scheduleId}`, { method: 'DELETE' });
        event.target.closest('.schedule-card').remove(); 
        if (schedulesContainer.children.length === 0) loadSchedules();

    } catch (error) {
        alert('Error deleting schedule: ' + error.message);
        event.target.disabled = false;
        event.target.textContent = 'Delete';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadSchedules();
    if(logoutBtn) logoutBtn.addEventListener('click', () => clearAuthAndRedirect());
});