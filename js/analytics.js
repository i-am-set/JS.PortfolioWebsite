let hasInitialized = false;
let analyticsEnabled = false;

const API_BASE = 'https://sethgran.my.id';

export default function init() {
    document.addEventListener('consentUpdated', handleConsentUpdate);
    setupDropdownLogic();
}

function setupDropdownLogic() {
    const container = document.getElementById('view-stats-container');
    const details = document.getElementById('view-details');
    
    if (!container || !details) return;

    container.addEventListener('click', (e) => {
        e.stopPropagation();
        const isExpanded = details.classList.contains('opacity-100');
        if (isExpanded) {
            closeDropdown(details);
        } else {
            openDropdown(details);
        }
    });

    document.addEventListener('click', (e) => {
        if (!container.contains(e.target)) {
            closeDropdown(details);
        }
    });

    container.addEventListener('mouseenter', () => {
        if (window.innerWidth >= 768) openDropdown(details);
    });

    container.addEventListener('mouseleave', () => {
        if (window.innerWidth >= 768) closeDropdown(details);
    });
}

function openDropdown(el) {
    el.classList.add('opacity-100', 'pointer-events-auto', 'translate-y-0');
    el.classList.remove('opacity-0', 'pointer-events-none', 'translate-y-[-10px]');
}

function closeDropdown(el) {
    el.classList.remove('opacity-100', 'pointer-events-auto', 'translate-y-0');
    el.classList.add('opacity-0', 'pointer-events-none', 'translate-y-[-10px]');
}

function handleConsentUpdate(event) {
    const prefs = event.detail;

    if (prefs && prefs.analytics) {
        analyticsEnabled = true;
        if (!hasInitialized) {
            hasInitialized = true;
            trackEvent('page');
        } else {
            fetchViewCount();
        }
    } else {
        analyticsEnabled = false;
        updateViewDisplay('DISABLED');
    }
}

export async function trackEvent(type = 'page') {
    if (!analyticsEnabled) return;

    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' });
    const dailyCookie = `portfolio_daily_${type}_${today}`;
    const allTimeCookie = `portfolio_visited_${type}`;

    const hasDaily = document.cookie.includes(`${dailyCookie}=true`);
    const hasAllTime = document.cookie.includes(`${allTimeCookie}=true`);

    let isNewVisitor = false;
    let isReturningVisitor = false;
    let isDailyUnique = false;

    if (!hasAllTime) {
        isNewVisitor = true;
        isDailyUnique = true;
        
        const tenYears = new Date();
        tenYears.setFullYear(tenYears.getFullYear() + 10);
        document.cookie = `${allTimeCookie}=true; expires=${tenYears.toUTCString()}; path=/; SameSite=Strict`;
    } else if (!hasDaily) {
        isReturningVisitor = true;
        isDailyUnique = true;
    }

    if (!hasDaily) {
        const now = new Date();
        const tomorrow = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
        tomorrow.setHours(24, 0, 0, 0);
        document.cookie = `${dailyCookie}=true; expires=${tomorrow.toUTCString()}; path=/; SameSite=Strict`;
    }

    try {
        const response = await fetch(`${API_BASE}/api/views/increment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type, isNewVisitor, isReturningVisitor, isDailyUnique })
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        
        if (type === 'page') {
            updateViewDisplay(data);
        }
    } catch (error) {
        console.error(`[Analytics] API Error for ${type}:`, error);
        if (type === 'page') updateViewDisplay('API Error');
    }
}

async function fetchViewCount() {
    try {
        const response = await fetch(`${API_BASE}/api/views`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        if (data && typeof data.allTimeVisitors === 'number') {
            updateViewDisplay(data);
        }
    } catch (error) {
        console.error('[Analytics] API Error:', error);
        updateViewDisplay('API Error');
    }
}

function updateViewDisplay(data) {
    const displayElement = document.getElementById('view-count');
    const detailsElement = document.getElementById('view-details');
    
    if (!displayElement) return;

    if (data === 'DISABLED' || data === 'API Error') {
        displayElement.textContent = `Views: ${data}`;
        displayElement.classList.add('text-red-400', 'border-red-400/30', 'bg-red-400/10');
        displayElement.classList.remove('border-secondary/30', 'bg-surface/50');
        if (detailsElement) {
            detailsElement.innerHTML = `<div class="text-xs text-red-400 text-center">${data === 'DISABLED' ? 'Analytics Disabled' : 'Failed to load data'}</div>`;
        }
    } else {
        const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' });
        const dailyStats = data.daily[today] || { visitors: 0, new: 0, returning: 0, raw: 0, countries: {} };
        
        // Calculate top country today
        let topCountryToday = 'N/A';
        if (dailyStats.countries && Object.keys(dailyStats.countries).length > 0) {
            topCountryToday = Object.entries(dailyStats.countries).sort((a, b) => b[1] - a[1])[0][0];
        }

        // Calculate top 5 regions all-time
        let topRegionsHtml = '<div class="text-xs text-text-muted italic">Not enough data</div>';
        if (data.countries && Object.keys(data.countries).length > 0) {
            const sortedCountries = Object.entries(data.countries).sort((a, b) => b[1] - a[1]);
            const top5 = sortedCountries.slice(0, 5);
            
            topRegionsHtml = top5.map((item, index) => 
                `<div class="flex justify-between text-xs"><span class="text-text-muted">#${index + 1} ${item[0]}</span> <span class="text-accent font-medium">${item[1].toLocaleString()}</span></div>`
            ).join('');
        }
        
        displayElement.textContent = `Views: ${data.allTimeVisitors.toLocaleString()}`;
        displayElement.classList.remove('text-red-400', 'border-red-400/30', 'bg-red-400/10');
        displayElement.classList.add('border-secondary/30', 'bg-surface/50');

        if (detailsElement) {
            detailsElement.innerHTML = `
                <div class="text-xs font-bold text-text-primary border-b border-secondary/30 pb-2 mb-1">Page Traffic Today</div>
                <div class="flex justify-between text-xs"><span class="text-text-muted">Visitors Today:</span> <span class="text-accent font-medium">${dailyStats.visitors.toLocaleString()}</span></div>
                <div class="flex justify-between text-xs"><span class="text-text-muted">New Today:</span> <span class="text-accent font-medium">${dailyStats.new.toLocaleString()}</span></div>
                <div class="flex justify-between text-xs"><span class="text-text-muted">Returning Today:</span> <span class="text-accent font-medium">${dailyStats.returning.toLocaleString()}</span></div>
                <div class="flex justify-between text-xs"><span class="text-text-muted">Top Region Today:</span> <span class="text-accent font-medium">${topCountryToday}</span></div>
                
                <div class="text-xs font-bold text-text-primary border-b border-secondary/30 pb-2 mt-3 mb-1">All-Time Stats</div>
                <div class="flex justify-between text-xs"><span class="text-text-muted">Total Visitors:</span> <span class="text-primary font-medium">${data.allTimeVisitors.toLocaleString()}</span></div>
                <div class="flex justify-between text-xs"><span class="text-text-muted">Total Returning:</span> <span class="text-primary font-medium">${data.allTimeReturning.toLocaleString()}</span></div>
                <div class="flex justify-between text-xs"><span class="text-text-muted">Total Page Loads:</span> <span class="text-primary font-medium">${data.totalRaw.toLocaleString()}</span></div>
                
                <div class="text-xs font-bold text-text-primary border-b border-secondary/30 pb-2 mt-3 mb-1">Top Regions (All-Time)</div>
                ${topRegionsHtml}
            `;
        }
    }
}
