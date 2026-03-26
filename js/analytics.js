let hasInitialized = false;

// If running locally, point to the server.js backend. 
// Once you host your server.js online, replace this with your live URL (e.g., 'https://my-api.onrender.com')
const API_BASE = (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost')
    ? 'http://localhost:3001'
    : '';

export default function init() {
    document.addEventListener('consentUpdated', handleConsentUpdate);
}

function handleConsentUpdate(event) {
    const prefs = event.detail;

    if (prefs && prefs.analytics) {
        if (!hasInitialized) {
            hasInitialized = true;
            incrementView();
        } else {
            fetchViewCount();
        }
    } else {
        updateViewDisplay('0');
    }
}

function getSafeLocalViews() {
    // This fixes the bug on your desktop where the counter got stuck/corrupted
    let localViews = parseInt(localStorage.getItem('portfolio_local_views'));
    if (isNaN(localViews) || localViews < 0) {
        localViews = 0;
    }
    return localViews;
}

async function incrementView() {
    try {
        // Try to hit the real backend server
        const response = await fetch(`${API_BASE}/api/views/increment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        updateViewDisplay(data.count);

    } catch (error) {
        // Fallback to Local Storage if the Node API isn't running or reachable
        let localViews = getSafeLocalViews();
        localViews++;
        localStorage.setItem('portfolio_local_views', localViews);
        updateViewDisplay(localViews);
    }
}

async function fetchViewCount() {
    try {
        // Try to hit the real backend server
        const response = await fetch(`${API_BASE}/api/views`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        if (data && typeof data.count === 'number') {
            updateViewDisplay(data.count);
        }
    } catch (error) {
        // Fallback to Local Storage if the Node API isn't running or reachable
        let localViews = getSafeLocalViews();
        updateViewDisplay(localViews);
    }
}

function updateViewDisplay(value) {
    const displayElement = document.getElementById('view-count');
    if (displayElement) {
        displayElement.textContent = `Views: ${value.toLocaleString()}`;
    }
}