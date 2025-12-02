// home.js - shared logic

// ---------- Drawer (hamburger slide-out) ----------
function initDrawer() {
  const ham = document.getElementById('hamburger-btn');
  const drawer = document.getElementById('drawer');
  const drawerClose = document.getElementById('drawer-close');

  ham && ham.addEventListener('click', ()=> drawer.classList.add('open'));
  drawerClose && drawerClose.addEventListener('click', ()=> drawer.classList.remove('open'));

  // close when clicking outside
  document.addEventListener('click', (e)=>{
    if (!drawer) return;
    const inside = drawer.contains(e.target) || (ham && ham.contains(e.target));
    if (!inside) drawer.classList.remove('open');
  });
}

// ---------- GNB username display ----------
function refreshGNBUser() {
  const username = localStorage.getItem('username');
  const userSpan = document.getElementById('gnb-user');
  if (userSpan) userSpan.textContent = username ? `Hello, ${username}` : '';
}

// ---------- WEATHER ----------
const CITY_COORDS = { "Bangkok":{lat:13.7563,lon:100.5018}, "Seoul":{lat:37.5665,lon:126.9780} };
async function fetchAndRenderWeather(city='Bangkok') {
  const tempEl = document.getElementById('weather-temp');
  const descEl = document.getElementById('weather-desc');
  const updatedEl = document.getElementById('weather-updated');
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
    tempEl.textContent = `${Math.round(w.temperature)}°C`;
    descEl.textContent = `Wind ${Math.round(w.windspeed)} km/h · WMO ${w.weathercode}`;
    updatedEl.textContent = `Updated: ${new Date().toLocaleTimeString()}`;
  } catch (e) {
    tempEl.textContent = '—';
    descEl.textContent = 'Unable to load weather';
    updatedEl.textContent = '';
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
showSlides();

function showSlides() {
    let slides = document.getElementsByClassName("mySlides");

    for (let i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }

    slideIndex++;

    if (slideIndex > slides.length) {
        slideIndex = 1;
    }

    slides[slideIndex - 1].style.display = "block";

    setTimeout(showSlides, 3000); // Change slide every 3 seconds
}



// ---------- Init function for pages ----------
function initPage() {
  initDrawer();
  refreshGNBUser();
}

// run on DOM ready
document.addEventListener('DOMContentLoaded', initPage);
