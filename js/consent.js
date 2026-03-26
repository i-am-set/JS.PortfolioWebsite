const COOKIE_NAME = 'portfolio_consent';
let currentPrefs = { necessary: true, analytics: false };

function getConsentCookie() {
    const match = document.cookie.match(new RegExp('(^| )' + COOKIE_NAME + '=([^;]+)'));
    if (match) {
        try { return JSON.parse(decodeURIComponent(match[2])); } catch (e) { return null; }
    }
    return null;
}

function setConsentCookie(prefs) {
    const value = encodeURIComponent(JSON.stringify(prefs));
    const date = new Date();
    date.setTime(date.getTime() + (180 * 24 * 60 * 60 * 1000));
    document.cookie = `${COOKIE_NAME}=${value}; expires=${date.toUTCString()}; path=/; SameSite=Strict`;
}

function fireConsentEvent(prefs) {
    document.dispatchEvent(new CustomEvent('consentUpdated', { detail: prefs }));
}

function handleConsent(prefs) {
    currentPrefs = prefs;
    setConsentCookie(prefs);
    fireConsentEvent(prefs);
    closeBanner();
}

function showBanner() {
    const container = document.getElementById('consent-container');
    if (!container || document.getElementById('consent-banner')) return;

    container.insertAdjacentHTML('beforeend', `
        <div id="consent-banner" class="fixed bottom-0 left-0 w-full bg-surface/95 backdrop-blur-md border-t border-secondary rounded-t-2xl p-4 md:p-6 z-50 translate-y-full transition-transform duration-500 ease-out flex flex-col md:flex-row items-center justify-between gap-4 shadow-[0_-4px_20px_rgba(0,0,0,0.3)]">
            <div class="text-sm text-text-muted max-w-3xl">
                <p>This site uses cookies to ensure basic functionality and to track page views. You can choose to opt-in to analytics. <a href="#privacy" class="text-primary hover:underline">Read more</a>.</p>
            </div>
            <div class="flex flex-wrap gap-3 shrink-0">
                <button id="cb-prefs" class="btn-ghost text-sm px-4 py-2">Preferences</button>
                <button id="cb-reject" class="btn-ghost text-sm px-4 py-2">Reject All</button>
                <button id="cb-accept" class="btn-primary text-sm px-4 py-2">Accept All</button>
            </div>
        </div>
    `);

    requestAnimationFrame(() => document.getElementById('consent-banner').classList.remove('translate-y-full'));

    document.getElementById('cb-accept').addEventListener('click', () => handleConsent({ necessary: true, analytics: true }));
    document.getElementById('cb-reject').addEventListener('click', () => handleConsent({ necessary: true, analytics: false }));
    document.getElementById('cb-prefs').addEventListener('click', showModal);
}

function closeBanner() {
    const banner = document.getElementById('consent-banner');
    if (banner) {
        banner.classList.add('translate-y-full');
        setTimeout(() => banner.remove(), 500);
    }
}

function showModal() {
    const saved = getConsentCookie();
    if (saved) currentPrefs = saved;

    const container = document.getElementById('consent-container');
    if (document.getElementById('consent-modal')) return;

    container.insertAdjacentHTML('beforeend', `
        <div id="consent-modal" class="fixed inset-0 bg-background/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4 opacity-0 transition-opacity duration-300">
            <div class="bg-surface border border-secondary rounded-xl w-full max-w-lg shadow-2xl transform scale-95 transition-transform duration-300" id="consent-modal-content">
                <div class="flex justify-between items-center p-6 border-b border-secondary">
                    <h3 class="text-xl font-display font-bold text-text-primary">Cookie Preferences</h3>
                    <button id="cm-close" class="text-text-muted hover:text-primary transition-colors">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
                <div class="p-6 space-y-6">
                    <div class="flex items-start justify-between gap-4">
                        <div>
                            <h4 class="text-text-primary font-medium mb-1">Strictly Necessary</h4>
                            <p class="text-sm text-text-muted">Required for the website to function and save your preferences. Cannot be disabled.</p>
                        </div>
                        <div class="relative inline-flex h-6 w-11 items-center rounded-full bg-primary opacity-50 cursor-not-allowed shrink-0">
                            <span class="inline-block h-4 w-4 translate-x-6 rounded-full bg-background"></span>
                        </div>
                    </div>
                    <div class="flex items-start justify-between gap-4">
                        <div>
                            <h4 class="text-text-primary font-medium mb-1">Analytics</h4>
                            <p class="text-sm text-text-muted">Allows the site to count page visits anonymously using a self-hosted API.</p>
                        </div>
                        <button id="cm-toggle-analytics" class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary ${currentPrefs.analytics ? 'bg-primary' : 'bg-secondary'} shrink-0">
                            <span class="inline-block h-4 w-4 transform rounded-full bg-text-primary transition-transform duration-200 ${currentPrefs.analytics ? 'translate-x-6' : 'translate-x-1'}"></span>
                        </button>
                    </div>
                </div>
                <div class="p-6 border-t border-secondary flex justify-end">
                    <button id="cm-save" class="btn-primary w-full sm:w-auto">Save Preferences</button>
                </div>
            </div>
        </div>
    `);

    const modal = document.getElementById('consent-modal');
    const content = document.getElementById('consent-modal-content');

    requestAnimationFrame(() => {
        modal.classList.remove('opacity-0');
        content.classList.remove('scale-95');
    });

    let tempAnalytics = currentPrefs.analytics;
    const toggleBtn = document.getElementById('cm-toggle-analytics');
    const toggleDot = toggleBtn.querySelector('span');

    toggleBtn.addEventListener('click', () => {
        tempAnalytics = !tempAnalytics;
        if (tempAnalytics) {
            toggleBtn.classList.replace('bg-secondary', 'bg-primary');
            toggleDot.classList.replace('translate-x-1', 'translate-x-6');
        } else {
            toggleBtn.classList.replace('bg-primary', 'bg-secondary');
            toggleDot.classList.replace('translate-x-6', 'translate-x-1');
        }
    });

    document.getElementById('cm-save').addEventListener('click', () => {
        handleConsent({ necessary: true, analytics: tempAnalytics });
        closeModal();
    });

    document.getElementById('cm-close').addEventListener('click', closeModal);
}

function closeModal() {
    const modal = document.getElementById('consent-modal');
    const content = document.getElementById('consent-modal-content');
    if (modal) {
        modal.classList.add('opacity-0');
        content.classList.add('scale-95');
        setTimeout(() => modal.remove(), 300);
    }
}

export function initConsent() {
    const saved = getConsentCookie();
    if (saved) {
        currentPrefs = saved;
        fireConsentEvent(currentPrefs);
    } else {
        showBanner();
    }

    const prefBtns = document.querySelectorAll('[data-consent-preferences]');
    prefBtns.forEach(btn => btn.addEventListener('click', showModal));
}