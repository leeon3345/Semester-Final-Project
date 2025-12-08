// frontend/js/schedules.js
import { fetchData, checkAuthAndRedirect, clearAuthAndRedirect } from './api.js';

// 1. Authentication Check
checkAuthAndRedirect();

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
        
        // [Modified] Applied Card View HTML structure (Added icons, etc.)
        card.innerHTML = `
            <div>
                <h3>${schedule.title}</h3>
                <p>🗓️ ${schedule.startDate} ~ ${schedule.endDate}</p>
                <p class="cost-summary">💰 Total: ${schedule.totalCost ? schedule.totalCost.toLocaleString() : 0} KRW</p>
            </div>
            
            <div class="card-actions">
                <button class="edit-btn" data-id="${schedule.id}">✏️ Edit</button>
                <button class="delete-btn" data-id="${schedule.id}">🗑️ Delete</button>
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

    try {
        // [Maintained] Query method to prevent 403 error
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

    const btn = event.target;
    btn.disabled = true;
    btn.textContent = 'Deleting...';

    try {
        await fetchData(`/600/schedules/${scheduleId}`, { method: 'DELETE' });
        btn.closest('.schedule-card').remove(); 
        
        // Display message if all cards are deleted
        if (schedulesContainer.children.length === 0) {
            schedulesContainer.innerHTML = '<p class="info-msg">You have no saved schedules. Click "Create New Schedule (+)" to start!</p>';
        }

    } catch (error) {
        alert('Error deleting schedule: ' + error.message);
        btn.disabled = false;
        btn.textContent = '🗑️ Delete';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadSchedules();
    if(logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            clearAuthAndRedirect();
        });
    }
});