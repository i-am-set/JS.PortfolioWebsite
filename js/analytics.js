let hasInitialized = false;
const API_BASE = 'https://sethgran.my.id';

export default function init() {
    document.addEventListener('consentUpdated', handleConsentUpdate);
}

function handleConsentUpdate(event) {
    const prefs = event.detail;

    if (prefs && prefs.analytics) {
        if (!hasInitialized) {
            hasInitialized = true;
            setTimeout(incrementView, 1500);
        } else {
            fetchViewCount();
        }
    } else {
        updateViewDisplay('0');
    }
}

async function incrementView() {
    try {
        const response = await fetch(`${API_BASE}/api/views/increment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            keepalive: true
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        updateViewDisplay(data.count);

    } catch (error) {
        console.error('[Analytics] API Error:', error);
        updateViewDisplay('API Error');
    }
}

async function fetchViewCount() {
    try {
        const response = await fetch(`${API_BASE}/api/views`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        if (data && typeof data.count === 'number') {
            updateViewDisplay(data.count);
        }
    } catch (error) {
        console.error('[Analytics] API Error:', error);
        updateViewDisplay('API Error');
    }
}

function updateViewDisplay(value) {
    const displayElement = document.getElementById('view-count');
    if (displayElement) {
        requestAnimationFrame(() => {
            displayElement.textContent = `Views: ${typeof value === 'number' ? value.toLocaleString() : value}`;
        });
    }
}