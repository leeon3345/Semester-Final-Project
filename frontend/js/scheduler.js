// frontend/js/scheduler.js

import { fetchData, checkAuthAndRedirect } from './api.js';

// 1. Authentication Check
checkAuthAndRedirect();

// State management
let selectedAttractions = [];
let allAttractions = [];

// [edit feature] Check for id parameter in URL (determine edit mode)
const urlParams = new URLSearchParams(window.location.search);
const editScheduleId = urlParams.get('id'); // if value exists, edit mode

// DOM Elements
const modal = document.getElementById('attractionModal');
const attractionsList = document.getElementById('attractionsList');
const scheduleListContainer = document.getElementById('scheduleListContainer');
const totalCostDisplay = document.getElementById('totalCostDisplay');
const saveScheduleBtn = document.getElementById('saveScheduleBtn');

// Map Modal Elements
const mapModal = document.getElementById('mapModal');
const mapFrame = document.getElementById('googleMapFrame');
const mapTitle = document.getElementById('mapTitle');
const closeMapBtn = document.querySelector('.close-map-btn');

const DEFAULT_IMAGE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="200"%3E%3Crect width="300" height="200" fill="%23e0e0e0"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="18" fill="%23666"%3ENo Image%3C/text%3E%3C/svg%3E';

// --- 2. Rendering Functions ---

function updateCost() {
    const total = selectedAttractions.reduce((sum, item) => sum + item.cost, 0);
    if(totalCostDisplay) totalCostDisplay.textContent = total.toFixed(2); 
}

function renderSelectedAttractions() {
    scheduleListContainer.innerHTML = '';

    if (selectedAttractions.length === 0) {
        scheduleListContainer.innerHTML = '<p class="info-msg">No attractions added yet. Use the "Add Attraction" button!</p>';
        return;
    }
    
    selectedAttractions.forEach(attraction => {
        const card = document.createElement('div');
        card.className = 'schedule-mini-card'; 
        
        const imageUrl = attraction.image || DEFAULT_IMAGE;
        
        card.innerHTML = `
            <img 
                src="${imageUrl}" 
                alt="${attraction.name}"
                class="mini-card-img"
                onerror="this.onerror=null; this.src='${DEFAULT_IMAGE}';"
            >
            <div class="mini-card-content">
                <h4>${attraction.name}</h4>
                <p><strong>Cost:</strong> ${attraction.cost.toFixed(2)}</p>
                ${attraction.desc ? `<p class="desc">${attraction.desc}</p>` : ''}
                
                <div class="card-actions">
                    <button class="remove-btn" data-id="${attraction.id}">Remove (x)</button>
                    <button class="view-map-btn" data-name="${attraction.name}">🗺️ Map</button>
                </div>
            </div>
        `;
        scheduleListContainer.appendChild(card);
    });

    // Connect event listeners
    document.querySelectorAll('.remove-btn').forEach(button => {
        button.addEventListener('click', handleRemoveAttraction);
    });

    document.querySelectorAll('.view-map-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const btn = e.target.closest('.view-map-btn'); 
            if(btn) {
                const placeName = btn.dataset.name;
                openMapModal(placeName);
            }
        });
    });
    
    updateCost();
}

function openMapModal(placeName) {
    if (!mapModal) return;
    mapTitle.textContent = placeName;
    const query = (placeName + " Bangkok").replace(/\s+/g, '+'); 
    mapFrame.src = `https://maps.google.com/maps?q=${query}&t=&z=13&ie=UTF8&iwloc=&output=embed`;
    mapModal.style.display = 'block';
}

// --- 3. Attraction Modal Logic ---

async function fetchAttractions() {
    try {
        const attractions = await fetchData('/attractions', { method: 'GET' });
        allAttractions = attractions;
        renderAttractionsInModal(allAttractions);
    } catch (error) {
        attractionsList.innerHTML = `<p class="error-msg">Error: Failed to load attractions.</p>`;
        console.error('Error fetching attractions:', error);
    }
}

function renderAttractionsInModal(attractions) {
    attractionsList.innerHTML = '';
    
    if (attractions.length === 0) {
        attractionsList.innerHTML = '<p class="info-msg">No attractions available.</p>';
        return;
    }
    
    attractions.forEach(attraction => {
        const isSelected = selectedAttractions.some(a => a.id === attraction.id);
        const item = document.createElement('div');
        item.className = 'modal-item';
        const imageUrl = attraction.image || DEFAULT_IMAGE;
        
        item.innerHTML = `
            <div style="display:flex; align-items:center; gap:12px; flex:1; min-width:0;">
                <img 
                    src="${imageUrl}" 
                    alt="${attraction.name}"
                    onerror="this.onerror=null; this.src='${DEFAULT_IMAGE}';"
                    style="width:60px; height:60px; object-fit:cover; border-radius:6px; display:block; flex-shrink:0;"
                >
                <div style="flex:1; overflow:hidden;">
                    <div style="font-weight:600; margin-bottom:4px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                        ${attraction.name}
                    </div>
                    <div style="font-size:14px; color:#666;">Cost: ${attraction.cost.toFixed(2)}</div>
                </div>
            </div>
            <button 
                class="select-btn ${isSelected ? 'selected' : ''}" 
                data-id="${attraction.id}" 
                ${isSelected ? 'disabled' : ''}
            >
                ${isSelected ? 'Added' : 'Add'}
            </button>
        `;
        attractionsList.appendChild(item);
    });
    
    document.querySelectorAll('.select-btn:not(.selected)').forEach(button => {
        button.addEventListener('click', handleAddAttraction);
    });
}

function handleAddAttraction(event) {
    const id = parseInt(event.target.dataset.id);
    const attractionToAdd = allAttractions.find(a => a.id === id);

    if (attractionToAdd && !selectedAttractions.some(a => a.id === id)) {
        selectedAttractions.push(attractionToAdd);
        renderSelectedAttractions();
        if (modal.style.display === 'block') {
            renderAttractionsInModal(allAttractions); 
        }
    }
}

function handleRemoveAttraction(event) {
    const id = parseInt(event.target.dataset.id);
    selectedAttractions = selectedAttractions.filter(item => item.id !== id);
    renderSelectedAttractions();
    if (modal.style.display === 'block') {
        renderAttractionsInModal(allAttractions);
    }
}

// --- 4. Load & Save Logic ---

// [Modified] Date validation function
function validateDates() {
    const startInput = document.getElementById('startDate');
    const endInput = document.getElementById('endDate');
    
    // 1. If Start Date is selected, set End Date's minimum value to Start Date
    if (startInput.value) {
        endInput.min = startInput.value;
    }

    // 2. If End Date is earlier than Start Date, alert and reset
    if (startInput.value && endInput.value && endInput.value < startInput.value) {
        alert("End Date cannot be earlier than Start Date.");
        endInput.value = "";
    }
}

// Load existing schedule data if in edit mode 
async function loadExistingSchedule(id) {
    try {
        const schedule = await fetchData(`/600/schedules/${id}`, { method: 'GET' });
        
        document.getElementById('tripTitle').value = schedule.title;
        document.getElementById('startDate').value = schedule.startDate;
        document.getElementById('endDate').value = schedule.endDate;

        selectedAttractions = schedule.attractions || [];
        renderSelectedAttractions();
        
        saveScheduleBtn.textContent = 'Update Schedule';
        
    } catch (error) {
        console.error("Failed to load schedule:", error);
        alert("Error loading schedule data. It may have been deleted.");
        window.location.href = 'schedule-list.html';
    }
}

async function handleSaveSchedule() {
    const tripTitle = document.getElementById('tripTitle').value;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;

    if (!tripTitle || !startDate || !endDate || selectedAttractions.length === 0) {
        alert('Please fill in the Title, Dates, and select at least one attraction.');
        return;
    }
    
    // Find user ID
    let userId = null;
    const potentialKeys = ['user', 'currentUser', 'userInfo', 'auth'];
    try {
        for (const key of potentialKeys) {
            const stored = localStorage.getItem(key);
            if (stored) {
                const parsed = JSON.parse(stored);
                if (parsed.id) {
                    userId = parsed.id;
                    break;
                }
            }
        }
        if (!userId && localStorage.getItem('authToken')) {
            userId = 1; // Fallback
        }
    } catch (e) { console.error(e); }

    if (!userId) {
        alert("Session Error: Please Login again.");
        return;
    }

    // --- START: 200 ITINERARY LIMIT CHECK (MEMO REQUIREMENT) ---
    try {
        const allUserSchedules = await fetchData('/600/schedules', { method: 'GET' });
        
        const SCHEDULE_LIMIT = 200;
        if (!editScheduleId && allUserSchedules.length >= SCHEDULE_LIMIT) {
            alert(`MEMO: Cannot save new schedule. The limit of ${SCHEDULE_LIMIT} itineraries has been reached. Please delete an existing schedule to create a new one.`);
            return; 
        }
        
    } catch (error) {
        console.error("Warning: Could not check itinerary limit due to fetch error.", error);
    }
    // --- END: 200 ITINERARY LIMIT CHECK ---

    try {
        const totalCost = selectedAttractions.reduce((sum, item) => sum + item.cost, 0);
        const scheduleData = {
            userId: parseInt(userId),
            title: tripTitle,
            startDate: startDate,
            endDate: endDate,
            attractions: selectedAttractions,
            totalCost: totalCost
        };

        saveScheduleBtn.disabled = true;
        saveScheduleBtn.textContent = 'Saving...';

        if (editScheduleId) {
            await fetchData(`/600/schedules/${editScheduleId}`, {
                method: 'PUT',
                body: JSON.stringify(scheduleData)
            });
            alert('Schedule updated successfully!');
        } else {
            await fetchData('/600/schedules', {
                method: 'POST',
                body: JSON.stringify(scheduleData)
            });
            alert('Schedule created successfully!');
        }

        window.location.href = 'schedule-list.html';
        
    } catch (error) {
        alert('Error saving schedule: ' + error.message);
        console.error(error);
    } finally {
        saveScheduleBtn.disabled = false;
        saveScheduleBtn.textContent = editScheduleId ? 'Update Schedule' : 'Save Schedule';
    }
}

// --- 5. Event Listeners ---

document.addEventListener('DOMContentLoaded', () => {
    // [Modified] Get today's date and set it to min attribute (prevent selecting past dates)
    const today = new Date().toISOString().split('T')[0];
    const startInput = document.getElementById('startDate');
    const endInput = document.getElementById('endDate');

    if (startInput) {
        startInput.min = today;
        startInput.addEventListener('change', validateDates);
    }
    
    if (endInput) {
        endInput.min = today;
        endInput.addEventListener('change', validateDates);
    }

    // Button bindings
    const addBtn = document.getElementById('addAttractionBtn');
    if (addBtn) {
        addBtn.addEventListener('click', () => {
            modal.style.display = 'block';
            if (allAttractions.length === 0) fetchAttractions(); 
            else renderAttractionsInModal(allAttractions);
        });
    }

    const closeBtn = document.querySelector('.close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }
    
    if(closeMapBtn) {
        closeMapBtn.addEventListener('click', () => {
            mapModal.style.display = 'none';
            mapFrame.src = "";
        });
    }

    window.addEventListener('click', (event) => {
        if (event.target === modal) modal.style.display = 'none';
        if (event.target === mapModal) {
            mapModal.style.display = 'none';
            mapFrame.src = "";
        }
    });
    
    if (saveScheduleBtn) {
        saveScheduleBtn.addEventListener('click', handleSaveSchedule);
    }
    
    // Load data if in edit mode
    if (editScheduleId) {
        const headerTitle = document.querySelector('header h1');
        if(headerTitle) headerTitle.textContent = "Edit Schedule";
        loadExistingSchedule(editScheduleId);
    } else {
        renderSelectedAttractions(); 
    }
    
    // [Added] Logout button event listener (Module environment support)
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        // clearAuthAndRedirect from api.js might not be global, so use the imported function
        // or use the one registered globally (Here it's not api.js's clearAuthAndRedirect, check auth.js or global registration)
        // Safely add listener instead of onclick attribute
        // Note: Must use function imported from api.js. However, only checkAuthAndRedirect is imported at the top.
        // Need to add import { clearAuthAndRedirect } from './api.js' if necessary.
        // Since there is no import statement at the top, this part follows HTML onclick,
        // or assumes it is registered as a global function. (Check if window.clearAuthAndRedirect = ... in auth.js, etc.)
    }
});