// frontend/js/schedules.js
import { fetchData, checkAuthAndRedirect, clearAuthAndRedirect } from './api.js';

// 1. Authentication Check
checkAuthAndRedirect();

const schedulesContainer = document.getElementById('schedulesContainer');
const logoutBtn = document.getElementById('logoutBtn');

// --- Rendering and Deletion Functions ---

/**
 * Renders all schedules in HTML cards, including Edit and Delete buttons.
 * @param {Array} schedules - List of schedule objects from the API.
 */
function renderSchedules(schedules) {
    schedulesContainer.innerHTML = ''; 
    
    if (schedules.length === 0) {
        schedulesContainer.innerHTML = '<p class="info-msg">You have no saved schedules. Click "Create New Schedule (+)" to start!</p>';
        return;
    }

    schedules.forEach(schedule => {
        const card = document.createElement('div');
        card.className = 'schedule-card';
        // Use a wrapper for buttons to allow flex layout via CSS
        card.innerHTML = `
            <h3>${schedule.title}</h3>
            <p><strong>Dates:</strong> ${schedule.startDate} to ${schedule.endDate}</p>
            <p class="cost-summary"><strong>Total Cost:</strong> $${schedule.totalCost.toFixed(2)}</p>
            
            <div class="card-actions">
                <button class="edit-btn btn-secondary" data-id="${schedule.id}">✏️ Edit</button>
                
                <button class="delete-btn btn-danger" data-id="${schedule.id}">🗑️ Delete</button>
            </div>
        `;
        schedulesContainer.appendChild(card);
    });
    
    // Attach event listeners to the buttons
    attachScheduleListeners();
}

/**
 * Attaches event listeners to the dynamically created Edit and Delete buttons.
 */
function attachScheduleListeners() {
    // 1. Attach Delete listener
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', handleDeleteSchedule);
    });
    
    // 2. NEW: Attach Edit listener
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

    // [수정된 부분] /600/schedules 대신 ?userId= 쿼리 사용 (403 에러 방지)
    try {
        const endpoint = userId ? `/schedules?userId=${userId}` : '/schedules';
        const schedules = await fetchData(endpoint, { method: 'GET' });
        
        renderSchedules(schedules);
        
    } catch (error) {
        schedulesContainer.innerHTML = `<p class="error-msg">Error loading schedules: ${error.message}</p>`;
        console.error('Error fetching schedules:', error);
    }
}
/**
 * Handles the click event for the Edit button.
 * Redirects to the scheduler page with the schedule ID for editing.
 * @param {Event} event - The click event.
 */
function handleEditSchedule(event) {
    const scheduleId = event.target.dataset.id;
    // Redirect to scheduler.html, passing the ID as a URL query parameter
    window.location.href = `scheduler.html?id=${scheduleId}`;
}


/**
 * Handles the deletion of a saved schedule.
 * @param {Event} event - The click event.
 */
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