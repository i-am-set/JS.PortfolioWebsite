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
            processView();
        } else {
            fetchViewCount();
        }
    } else {
        updateViewDisplay('DISABLED');
    }
}

async function processView() {
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' });
    const cookieName = `portfolio_daily_${today}`;
    const hasViewedToday = document.cookie.includes(`${cookieName}=true`);

    let isUnique = false;

    if (!hasViewedToday) {
        isUnique = true;
        
        const now = new Date();
        const tomorrow = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
        tomorrow.setHours(24, 0, 0, 0);
        
        document.cookie = `${cookieName}=true; expires=${tomorrow.toUTCString()}; path=/; SameSite=Strict`;
    }

    try {
        const response = await fetch(`${API_BASE}/api/views/increment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isUnique })
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
        if (value === 'DISABLED') {
            displayElement.textContent = 'Views: DISABLED';
            displayElement.classList.add('text-red-400', 'border-red-400/30', 'bg-red-400/10');
            displayElement.classList.remove('border-secondary/30', 'bg-surface/50');
        } else {
            displayElement.textContent = `Views: ${typeof value === 'number' ? value.toLocaleString() : value}`;
            displayElement.classList.remove('text-red-400', 'border-red-400/30', 'bg-red-400/10');
            displayElement.classList.add('border-secondary/30', 'bg-surface/50');
        }
    }
}
