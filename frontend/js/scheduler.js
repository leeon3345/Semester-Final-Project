// js/scheduler.js
import { fetchData, checkAuthAndRedirect } from './api.js';

// 1. Authentication Check
checkAuthAndRedirect();

// State management arrays
let selectedAttractions = [];
let allAttractions = []; // Stores all fetched attractions once

// DOM References
const modal = document.getElementById('attractionModal');
const attractionsList = document.getElementById('attractionsList');
const scheduleListContainer = document.getElementById('scheduleListContainer');
const totalCostDisplay = document.getElementById('totalCostDisplay');
const saveScheduleBtn = document.getElementById('saveScheduleBtn');


// --- 2. Rendering and Calculation Functions ---

/**
 * Recalculates and updates the total cost in the DOM.
 */
function updateCost() {
    // Calculate sum of 'cost' property for all selected attractions
    const total = selectedAttractions.reduce((sum, item) => sum + item.cost, 0);
    totalCostDisplay.textContent = total.toFixed(2); 
}

/**
 * Renders the list of selected attractions as cards on the main screen.
 */
function renderSelectedAttractions() {
    scheduleListContainer.innerHTML = '';

    if (selectedAttractions.length === 0) {
        scheduleListContainer.innerHTML = '<p class="info-msg">No attractions added yet. Use the "Add Attraction" button!</p>';
    }
    
    selectedAttractions.forEach(attraction => {
        const card = document.createElement('div');
        card.className = 'attraction-card';
        card.innerHTML = `
            <img src="${attraction.image}" alt="${attraction.name}">
            <div class="card-content">
                <h4>${attraction.name}</h4>
                <p>Cost: $${attraction.cost.toFixed(2)}</p>
                <button class="remove-btn" data-id="${attraction.id}">Remove (x)</button>
            </div>
        `;
        scheduleListContainer.appendChild(card);
    });

    // Attach event listeners to the new remove buttons
    document.querySelectorAll('.remove-btn').forEach(button => {
        button.addEventListener('click', handleRemoveAttraction);
    });
    
    updateCost();
}


// --- 3. Modal and Attraction Logic ---

/**
 * Fetches the list of attractions from the backend.
 */
async function fetchAttractions() {
    try {
        // GET /attractions
        const attractions = await fetchData('/attractions', { method: 'GET' });
        allAttractions = attractions;
        renderAttractionsInModal(allAttractions);
    } catch (error) {
        attractionsList.innerHTML = `<p class="error-msg">Error: Failed to load attractions.</p>`;
        console.error('Error fetching attractions:', error);
    }
}

/**
 * Renders the attraction list inside the modal popup.
 */
function renderAttractionsInModal(attractions) {
    attractionsList.innerHTML = '';
    attractions.forEach(attraction => {
        // Check if the attraction is already selected
        const isSelected = selectedAttractions.some(a => a.id === attraction.id);
        
        const item = document.createElement('div');
        item.className = 'modal-item';
        item.innerHTML = `
            <span>${attraction.name} (Cost: $${attraction.cost.toFixed(2)})</span>
            <button class="select-btn ${isSelected ? 'selected' : ''}" data-id="${attraction.id}" ${isSelected ? 'disabled' : ''}>
                ${isSelected ? 'Added' : 'Add'}
            </button>
        `;
        attractionsList.appendChild(item);
    });
    
    // Attach listeners only to active 'Add' buttons
    document.querySelectorAll('.select-btn:not(.selected)').forEach(button => {
        button.addEventListener('click', handleAddAttraction);
    });
}


/**
 * Handles adding an attraction from the modal list to the schedule.
 */
function handleAddAttraction(event) {
    const id = parseInt(event.target.dataset.id);
    const attractionToAdd = allAttractions.find(a => a.id === id);

    if (attractionToAdd && !selectedAttractions.some(a => a.id === id)) {
        selectedAttractions.push(attractionToAdd);
        renderSelectedAttractions(); // Update main view
        
        // Actualizamos la vista del modal para deshabilitar el botón recién agregado
        renderAttractionsInModal(allAttractions); 
    }
}

/**
 * Handles removing an attraction from the schedule list.
 */
function handleRemoveAttraction(event) {
    const id = parseInt(event.target.dataset.id);
    // Filter out the attraction to create the new state
    selectedAttractions = selectedAttractions.filter(item => item.id !== id);
    renderSelectedAttractions(); // Re-render the list and update cost
    
    // If the modal is open, re-render it to update the button status
    if (modal.style.display === 'block') {
        renderAttractionsInModal(allAttractions);
    }
}


// --- 4. Save Function ---

async function handleSaveSchedule() {
    const tripTitle = document.getElementById('tripTitle').value;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;

    if (!tripTitle || !startDate || !endDate || selectedAttractions.length === 0) {
        alert('Please fill in the Title, Dates, and select at least one attraction.');
        return;
    }

    // Get user ID for ownership
    const userJson = localStorage.getItem('currentUser');
    if (!userJson) {
        alert("Error: User not found. Please log in again.");
        return;
    }
    const user = JSON.parse(userJson);
    const userId = user.id;

    const totalCost = selectedAttractions.reduce((sum, item) => sum + item.cost, 0);

    const scheduleData = {
        title: tripTitle,
        startDate: startDate,
        endDate: endDate,
        totalCost: totalCost,
        attractions: selectedAttractions.map(a => a.id),
        userId: userId // Add the owner's ID
    };

    saveScheduleBtn.disabled = true;
    saveScheduleBtn.textContent = 'Saving...';

    try {
        // POST request to /schedules. The body now includes the required userId.
        await fetchData('/schedules', {
            method: 'POST',
            body: JSON.stringify(scheduleData)
        });

        alert('Schedule saved successfully!');
        window.location.href = 'schedule-list.html'; // Redirect upon success
        
    } catch (error) {
        alert('Error saving schedule: ' + error.message);
        console.error('Save error:', error);
    } finally {
        saveScheduleBtn.disabled = false;
        saveScheduleBtn.textContent = '💾 Save Schedule';
    }
}


// --- 5. Initialization and Event Listeners ---

document.addEventListener('DOMContentLoaded', () => {
    // 5a. "Add Attraction" button listener
    document.getElementById('addAttractionBtn').addEventListener('click', () => {
        modal.style.display = 'block';
        // Only fetch attractions if we haven't already
        if (allAttractions.length === 0) {
            fetchAttractions(); 
        } else {
            renderAttractionsInModal(allAttractions); // Just render with updated selection status
        }
    });

    // 5b. Close modal listeners (X button and click outside)
    document.querySelector('.close-btn').addEventListener('click', () => {
        modal.style.display = 'none';
    });
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    // 5c. "Save Schedule" listener
    saveScheduleBtn.addEventListener('click', handleSaveSchedule);
    
    // Initial render
    renderSelectedAttractions(); 
});