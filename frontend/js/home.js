// js/home.js

import { clearAuthAndRedirect } from "./api.js";

// ---------- USER INFO HELPER ----------
function getLoggedInUser() {
  const possibleKeys = ['user', 'currentUser', 'userInfo', 'auth'];
  for (const key of possibleKeys) {
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.username) return parsed;
        if (parsed.email) return { ...parsed, username: parsed.email.split('@')[0] };
        if (parsed.name) return { ...parsed, username: parsed.name };
      } catch (e) {}
    }
  }
  return null;
}

function getAuthToken() {
  return localStorage.getItem('token') || localStorage.getItem('auth_token') || localStorage.getItem('authToken');
}

// ---------- GNB MENU (Drawer) ----------
function initDrawer() {
  const ham = document.getElementById('hamburger-btn');
  const drawer = document.getElementById('drawer');
  const drawerClose = document.getElementById('drawer-close');

  if (ham && drawer) ham.addEventListener('click', () => {
    drawer.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
  });
  
  if (drawerClose && drawer) drawerClose.addEventListener('click', () => {
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
  });

  // Close drawer when clicking outside
  document.addEventListener('click', (e) => {
    if (!drawer || !ham) return;
    if (!drawer.classList.contains('open')) return;
    
    const insideDrawer = drawer.contains(e.target);
    const clickedHam = ham.contains(e.target);
    
    if (!insideDrawer && !clickedHam) {
      drawer.classList.remove('open');
      drawer.setAttribute('aria-hidden', 'true');
    }
  });

  // Add auth check for protected menu links
  const protectedLinks = drawer ? drawer.querySelectorAll('a[href="schedule-list.html"], a[href="scheduler.html"]') : [];
  protectedLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const authToken = getAuthToken(); // Use the improved token retrieval function
      if (!authToken) {
        e.preventDefault();
        alert('Please log in to access this page.');
        window.location.href = 'login.html';
      }
    });
  });
}

// ---------- GNB HEADER ----------
function refreshGNBUser() {
  // ★ Use the improved user info retrieval function
  const currentUser = getLoggedInUser();
  const authToken = getAuthToken();
  const userSpan = document.getElementById('gnb-user');
  const drawerUser = document.getElementById('drawer-user'); // Also handle the user name inside the drawer

  // GNB user greeting
  if (userSpan) {
    userSpan.textContent = currentUser ? `Hello, ${currentUser.username}` : '';
  }
  
  //drawer user name
  if (drawerUser) {
    drawerUser.textContent = currentUser ? currentUser.username : 'Guest';
  }

  // Login / Logout button
  const btn = document.getElementById("auth-btn");
  if (btn) {
    if (authToken) { 
      btn.textContent = "Logout";
      btn.onclick = () => {
        clearAuthAndRedirect();
      };
    } else {
      btn.textContent = "Login";
      btn.onclick = () => window.location.href = "login.html";
    }
  }

  // Update drawer menu based on auth status
  updateDrawerMenuAuth(authToken);

  // Delete Account button
  const deleteBtn = document.getElementById("delete-account-btn");
  if (deleteBtn) {
    deleteBtn.style.display = (currentUser && authToken) ? "block" : "none";
    
  
    deleteBtn.onclick = async () => {
      if (!currentUser || !currentUser.id) {
          alert("User info error."); return;
      }
      if (!confirm("Are you sure? Your account will be permanently deleted.")) return;

      try {
        const res = await fetch(`http://localhost:3000/users/${currentUser.id}`, {
          method: "DELETE",
        });

        if (!res.ok) {
          alert("Error deleting account.");
          return;
        }

        clearAuthAndRedirect();
        alert("Your account has been deleted.");
      } catch (error) {
        console.error(error);
        alert("Failed to delete account.");
      }
    };
  }
}

// Update drawer menu items based on authentication
function updateDrawerMenuAuth(isLoggedIn) {
  const drawer = document.getElementById('drawer');
  if (!drawer) return;

  const protectedLinks = drawer.querySelectorAll('a[href="schedule-list.html"], a[href="scheduler.html"]');
  protectedLinks.forEach(link => {
    if (!isLoggedIn) {
      link.style.opacity = '0.5';
    //   link.style.pointerEvents = 'none'; // prevent clicks
      link.style.cursor = 'not-allowed';
    } else {
      link.style.opacity = '1';
      link.style.pointerEvents = 'auto';
      link.style.cursor = 'pointer';
    }
  });
}

// ---------- WEATHER ----------
const CITY_COORDS = { 
  "Bangkok": {lat:13.7563, lon:100.5018}, 
  "Seoul": {lat:37.5665, lon:126.9780} 
};

function getWeatherIcon(code) {
  if (code === 0) return '☀️';
  if (code >= 1 && code <= 3) return '☁️';
  if (code === 45 || code === 48) return '🌫️';
  if (code >= 51 && code <= 55) return '🌦️';
  if (code >= 61 && code <= 67) return '🌧️';
  if (code >= 71 && code <= 77) return '🌨️';
  if (code >= 80 && code <= 82) return '🌧️';
  if (code === 95 || code === 96 || code === 99) return '⛈️';
  return '🌡️';
}

async function fetchAndRenderWeather(city='Bangkok') {
  const tempEl = document.getElementById('weather-temp');
  const descEl = document.getElementById('weather-desc');
  const updatedEl = document.getElementById('weather-updated');
  const iconEl = document.getElementById('weather-icon');
  if (!tempEl) return;

  const coords = CITY_COORDS[city] || CITY_COORDS['Bangkok'];
  tempEl.textContent = 'Loading...';
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current_weather=true`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Weather fetch failed');
    const j = await res.json();
    if (!j.current_weather) throw new Error('No current weather');

    const w = j.current_weather;
    if(iconEl) iconEl.textContent = getWeatherIcon(w.weathercode);
    tempEl.textContent = `${Math.round(w.temperature)}°C`;
    if(descEl) descEl.textContent = `Wind ${Math.round(w.windspeed)} km/h`;
    if(updatedEl) updatedEl.textContent = `Updated: ${new Date().toLocaleTimeString()}`;
  } catch (e) {
    tempEl.textContent = '—';
    if(iconEl) iconEl.textContent = '';
    if(descEl) descEl.textContent = 'Unable to load weather';
    if(updatedEl) updatedEl.textContent = '';
    console.error(e);
  }
}

// ---------- CURRENCY ----------
async function convertCurrency(amount, from, to) {
  const resultEl = document.getElementById('ex-result');
  const errEl = document.getElementById('ex-error');
  if (!resultEl) return;
  resultEl.textContent = 'Converting...';
  if (errEl) errEl.style.display = 'none';
  try {
    const url = `https://api.frankfurter.app/latest?amount=${encodeURIComponent(amount)}&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Rate fetch failed');
    const j = await res.json();
    const converted = j.rates && j.rates[to];
    if (typeof converted === 'undefined') throw new Error('Rate not available');
    resultEl.innerHTML = `<strong>${Number(amount).toLocaleString()}</strong> ${from} = <strong>${Number(converted).toLocaleString(undefined,{maximumFractionDigits:4})}</strong> ${to}`;
  } catch (err) {
    console.error(err);
    resultEl.textContent = '';
    if (errEl) { errEl.style.display = 'block'; errEl.textContent = 'Unable to fetch exchange rates.'; }
  }
}

// ---------- SLIDESHOW ----------
let slideIndex = 0;

function showSlides() {
    const slides = document.getElementsByClassName("mySlides");
    if (!slides || slides.length === 0) return;

    for (let i = 0; i < slides.length; i++) {
        slides[i].classList.remove("active");
    }

    slideIndex++;
    if (slideIndex > slides.length) {
        slideIndex = 1;
    }

    slides[slideIndex - 1].classList.add("active");
    setTimeout(showSlides, 5000);
}

// ---------- Init function for pages ----------
function initPage() {
  initDrawer();
  refreshGNBUser();
  fetchAndRenderWeather('Bangkok');

  // Currency converter bindings
  const convertBtn = document.getElementById('ex-convert');
  const swapBtn = document.getElementById('ex-swap');
  
  if (convertBtn) {
    convertBtn.addEventListener('click', () => {
      const amt = Number(document.getElementById('ex-amount').value) || 0;
      const from = document.getElementById('ex-from').value;
      const to = document.getElementById('ex-to').value;
      convertCurrency(amt, from, to);
    });
  }
  
  if (swapBtn) {
    swapBtn.addEventListener('click', () => {
      const fromSelect = document.getElementById('ex-from');
      const toSelect = document.getElementById('ex-to');
      const tmp = fromSelect.value;
      fromSelect.value = toSelect.value;
      toSelect.value = tmp;
      if(convertBtn) convertBtn.click();
    });
  }
}

// ---------- INIT ----------
document.addEventListener("DOMContentLoaded", () => {
  initPage();
  showSlides();
});

window.initPage = initPage;