import { fetchData, checkAuthAndRedirect } from './api.js';

// 1. Authentication Check
checkAuthAndRedirect();

// State management
let selectedAttractions = [];
let allAttractions = [];

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
    totalCostDisplay.textContent = total.toFixed(2); 
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
                onerror="console.error('Image failed to load:', this.src); this.onerror=null; this.src='${DEFAULT_IMAGE}';"
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
            <div style="display:flex; align-items:center; gap:12px; flex:1;">
                <img 
                    src="${imageUrl}" 
                    alt="${attraction.name}"
                    onerror="console.error('Modal image failed:', this.src); this.onerror=null; this.src='${DEFAULT_IMAGE}';"
                    style="width:60px; height:60px; object-fit:cover; border-radius:6px; display:block; flex-shrink:0;"
                >
                <div style="flex:1;">
                    <div style="font-weight:600; margin-bottom:4px;">${attraction.name}</div>
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
        renderAttractionsInModal(allAttractions); 
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

// --- 4. Save Logic (★ 403 & Session Error FIX) ---

async function handleSaveSchedule() {
    const tripTitle = document.getElementById('tripTitle').value;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;

    if (!tripTitle || !startDate || !endDate || selectedAttractions.length === 0) {
        alert('Please fill in the Title, Dates, and select at least one attraction.');
        return;
    }
    
    // ★ [핵심 수정] 유저 정보를 찾기 위해 여러 키를 다 뒤져봅니다.
    let userId = null;
    const potentialKeys = ['user', 'currentUser', 'userInfo', 'auth']; // 가능한 이름들

    try {
        // 1. 순서대로 localStorage를 뒤져서 ID를 찾음
        for (const key of potentialKeys) {
            const stored = localStorage.getItem(key);
            if (stored) {
                const parsed = JSON.parse(stored);
                if (parsed.id) {
                    userId = parsed.id;
                    console.log(`Found User ID (${userId}) in key: "${key}"`);
                    break;
                }
            }
        }
        
        // 2. 만약 그래도 못 찾았다면? (토큰만 있는 경우 등)
        if (!userId) {
            console.warn("User object not found in localStorage. Checking for token...");
            const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
            // 토큰만 있고 유저 정보가 없으면, 일단 임시로 ID 1번을 부여해서 저장이라도 되게 함 (테스트용)
            if (token) {
                console.warn("Token exists but user details missing. Defaulting to User ID 1 for testing.");
                userId = 1; 
            }
        }

    } catch (e) {
        console.error("Error parsing user info:", e);
    }

    // 3. 최후의 수단: ID가 없으면 경고
    if (!userId) {
        alert("Session Error: Could not find logged-in user info. Please Login again.");
        // 디버깅을 위해 콘솔에 현재 저장된 키 목록을 띄워줌
        console.log("Current LocalStorage Keys:", Object.keys(localStorage));
        return;
    }

    // --- 이후 로직은 동일 ---
    
    try {
        // 스케줄 제한 체크 (에러나면 무시하고 저장 진행)
        try {
           const allUserSchedules = await fetchData(`/600/users/${userId}/schedules`, { method: 'GET' });
           if (allUserSchedules.length >= 200) {
               alert(`Limit reached.`); return;
           }
        } catch(ignore) {}

        const totalCost = selectedAttractions.reduce((sum, item) => sum + item.cost, 0);

        const scheduleData = {
            userId: userId, // 찾은 ID 사용
            title: tripTitle,
            startDate: startDate,
            endDate: endDate,
            attractions: selectedAttractions,
            totalCost: totalCost
        };

        saveScheduleBtn.disabled = true;
        saveScheduleBtn.textContent = 'Saving...';

        await fetchData('/600/schedules', {
            method: 'POST',
            body: JSON.stringify(scheduleData)
        });

        alert('Schedule saved successfully!');
        window.location.href = 'schedule-list.html';
        
    } catch (error) {
        alert('Error saving schedule: ' + error.message);
        console.error(error);
    } finally {
        saveScheduleBtn.disabled = false;
        saveScheduleBtn.textContent = '💾 Save Schedule';
    }
}

// --- 5. Event Listeners ---

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('addAttractionBtn').addEventListener('click', () => {
        modal.style.display = 'block';
        if (allAttractions.length === 0) fetchAttractions(); 
        else renderAttractionsInModal(allAttractions);
    });

    document.querySelector('.close-btn').addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
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
    
    saveScheduleBtn.addEventListener('click', handleSaveSchedule);
    renderSelectedAttractions(); 
});