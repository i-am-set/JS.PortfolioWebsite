let hasInitialized = false;

export default function init() {
    // Listen for the custom consent event dispatched by consent.js
    document.addEventListener('consentUpdated', handleConsentUpdate);
}

function handleConsentUpdate(event) {
    const prefs = event.detail;

    if (prefs && prefs.analytics) {
        // Consent Granted: Inject script and track view
        injectAnalyticsScript();

        // Only increment once per page load to avoid spamming the API
        // if the user toggles preferences multiple times in one session.
        if (!hasInitialized) {
            hasInitialized = true;
            incrementView();
        } else {
            // If already initialized, just fetch the current count
            fetchViewCount();
        }
    } else {
        // Consent Denied: Do not track, do not load script, clear display
        removeAnalyticsScript();
        updateViewDisplay('—');
    }
}

function injectAnalyticsScript() {
    // Prevent duplicate injection
    if (document.getElementById('injected-analytics-script')) return;

    const script = document.createElement('script');
    script.id = 'injected-analytics-script';
    script.src = './js/view-counter-init.js';
    script.async = true;

    document.head.appendChild(script);
    console.log('[Analytics] Consent granted. Analytics script injected.');
}

function removeAnalyticsScript() {
    const script = document.getElementById('injected-analytics-script');
    if (script) {
        script.remove();
        console.log('[Analytics] Consent revoked. Analytics script removed from DOM.');
    }
}

async function incrementView() {
    try {
        const response = await fetch('/api/views/increment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        // Successfully incremented, now fetch the updated total
        await fetchViewCount();

    } catch (error) {
        console.warn('[Analytics] Failed to increment view count. (Expected if API is not running yet)', error);
        updateViewDisplay('—');
    }
}

async function fetchViewCount() {
    try {
        const response = await fetch('/api/views');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();

        if (data && typeof data.views === 'number') {
            updateViewDisplay(data.views.toLocaleString());
        }

    } catch (error) {
        console.warn('[Analytics] Failed to fetch view count. (Expected if API is not running yet)', error);
        updateViewDisplay('—');
    }
}

function updateViewDisplay(value) {
    const displayElement = document.getElementById('view-count');
    if (displayElement) {
        displayElement.textContent = `Views: ${value}`;
    }
}