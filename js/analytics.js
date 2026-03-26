let hasInitialized = false;

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

async function incrementView() {
    try {
        const response = await fetch('/api/views/increment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        updateViewDisplay(data.count);

    } catch (error) {
        // Fallback to Local Storage if the Node API isn't running
        let localViews = parseInt(localStorage.getItem('portfolio_local_views') || '0');
        localViews++;
        localStorage.setItem('portfolio_local_views', localViews);
        updateViewDisplay(localViews);
    }
}

async function fetchViewCount() {
    try {
        const response = await fetch('/api/views');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        if (data && typeof data.count === 'number') {
            updateViewDisplay(data.count);
        }
    } catch (error) {
        // Fallback to Local Storage if the Node API isn't running
        let localViews = parseInt(localStorage.getItem('portfolio_local_views') || '0');
        updateViewDisplay(localViews);
    }
}

function updateViewDisplay(value) {
    const displayElement = document.getElementById('view-count');
    if (displayElement) {
        displayElement.textContent = `Views: ${value.toLocaleString()}`;
    }
}