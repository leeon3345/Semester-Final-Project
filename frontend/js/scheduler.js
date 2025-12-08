// frontend/js/scheduler.js

import { fetchData, checkAuthAndRedirect, clearAuthAndRedirect } from './api.js';

// 1. Authentication Check
checkAuthAndRedirect();

// State management
let selectedAttractions = [];
let allAttractions = [];

// [edit feature] Check for id parameter in URL
const urlParams = new URLSearchParams(window.location.search);
const editScheduleId = urlParams.get('id'); 

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
        scheduleListContainer.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #64748b; background: #f8fafc; border-radius: 12px; border: 2px dashed #e2e8f0;">
                <p style="font-size: 1.1rem; margin-bottom: 10px;">No attractions added yet.</p>
                <p style="font-size: 0.9rem;">Click the "Add Attraction" button above to start planning!</p>
            </div>
        `;
        return;
    }
    
    selectedAttractions.forEach(attraction => {
        const card = document.createElement('div');
        card.className = 'schedule-mini-card'; 
        
        const imageUrl = attraction.image || DEFAULT_IMAGE;
        
        // [수정] 카드 뷰 HTML 구조 개선
        card.innerHTML = `
            <img 
                src="${imageUrl}" 
                alt="${attraction.name}"
                class="mini-card-img"
                onerror="this.onerror=null; this.src='${DEFAULT_IMAGE}';"
            >
            <div class="mini-card-content">
                <h4>${attraction.name}</h4>
                <p>💰 ${attraction.cost.toLocaleString()} KRW</p>
                <div class="desc">${attraction.desc || 'No description available.'}</div>
                
                <div class="card-actions">
                    <button class="view-map-btn" data-name="${attraction.name}">
                        🗺️ Map
                    </button>
                    <button class="remove-btn" data-id="${attraction.id}" title="Remove">
                        🗑️
                    </button>
                </div>
            </div>
        `;
        scheduleListContainer.appendChild(card);
    });

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
                    style="width:50px; height:50px; object-fit:cover; border-radius:8px; display:block; flex-shrink:0;"
                >
                <div style="flex:1; overflow:hidden;">
                    <div style="font-weight:600; margin-bottom:2px; font-size:0.95rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                        ${attraction.name}
                    </div>
                    <div style="font-size:13px; color:#64748b;">💰 ${attraction.cost.toLocaleString()}</div>
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

function validateDates() {
    const startInput = document.getElementById('startDate');
    const endInput = document.getElementById('endDate');
    
    if (startInput.value) {
        endInput.min = startInput.value;
    }

    if (startInput.value && endInput.value && endInput.value < startInput.value) {
        alert("End Date cannot be earlier than Start Date.");
        endInput.value = "";
    }
}

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
            userId = 1; 
        }
    } catch (e) { console.error(e); }

    if (!userId) {
        alert("Session Error: Please Login again.");
        return;
    }

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
    
    if (editScheduleId) {
        const headerTitle = document.querySelector('header h1');
        if(headerTitle) headerTitle.textContent = "Edit Schedule";
        loadExistingSchedule(editScheduleId);
    } else {
        renderSelectedAttractions(); 
    }
    
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            clearAuthAndRedirect();
        });
    }
});