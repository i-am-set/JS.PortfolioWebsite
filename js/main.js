import { initProjects } from './projects.js?v=4';
import { initSkills } from './skills.js?v=4';
import { initExperience } from './experience.js?v=4';
import initAnalytics from './analytics.js?v=4';
import { initConsent } from './consent.js?v=4';

console.log('[App] Initializing Bento Dashboard v4...');

async function initApp() {
    await initMeta();
    initProjects();
    initSkills();
    initExperience();

    initAnalytics();
    initConsent();

    setupClock();
    setupModalSystem();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

async function initMeta() {
    try {
        const response = await fetch('./data/meta.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const meta = await response.json();
        document.title = `${meta.name} - ${meta.tagline}`;

        const navLogo = document.getElementById('nav-logo');
        const heroName = document.getElementById('hero-name');
        const heroTagline = document.getElementById('hero-tagline');
        const aboutBio = document.getElementById('about-bio');

        if (navLogo) navLogo.textContent = meta.name;
        if (heroName) heroName.textContent = meta.name;
        if (heroTagline) heroTagline.textContent = meta.tagline;
        if (aboutBio) aboutBio.textContent = meta.bio;

        const socialsContainer = document.getElementById('hero-socials');
        if (socialsContainer && meta.links) {
            socialsContainer.innerHTML = '';

            const iconBtnClass = "w-10 h-10 rounded-full border border-secondary/50 flex items-center justify-center text-text-muted transition-all duration-300 hover:bg-primary hover:text-background hover:border-primary hover:scale-110 shrink-0 cursor-pointer";

            if (meta.links.github) {
                socialsContainer.insertAdjacentHTML('beforeend', `
                    <a href="${meta.links.github}" target="_blank" rel="noopener noreferrer" class="${iconBtnClass}" title="GitHub">
                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd"></path></svg>
                    </a>
                `);
            }
            if (meta.links.linkedin) {
                socialsContainer.insertAdjacentHTML('beforeend', `
                    <a href="${meta.links.linkedin}" target="_blank" rel="noopener noreferrer" class="${iconBtnClass}" title="LinkedIn">
                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                    </a>
                `);
            }
            if (meta.links.email) {
                socialsContainer.insertAdjacentHTML('beforeend', `
                    <button id="copy-email-btn" data-email="${meta.links.email}" class="${iconBtnClass}" title="Copy Email">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                    </button>
                `);
                document.getElementById('copy-email-btn').addEventListener('click', function () {
                    navigator.clipboard.writeText(this.getAttribute('data-email')).then(() => {
                        showToast('Email copied to clipboard!');
                    });
                });
            }
        }
    } catch (error) {
        console.error('[Meta] Error initializing meta data:', error);
    }
}

function setupClock() {
    const timeEl = document.getElementById('local-time');
    const dateEl = document.getElementById('local-date');

    if (!timeEl || !dateEl) {
        console.warn('[Clock] Elements not found. Check HTML IDs.');
        return;
    }

    function updateTime() {
        const now = new Date();
        timeEl.textContent = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
        dateEl.textContent = now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
    }

    updateTime();
    setInterval(updateTime, 1000);
}

function setupModalSystem() {
    const modal = document.getElementById('global-modal');
    const closeBtn = document.getElementById('modal-close');
    const titleEl = document.getElementById('modal-title');
    const bodyEl = document.getElementById('modal-body');

    if (!modal || !closeBtn || !titleEl || !bodyEl) {
        console.warn('[Modal] Elements not found. Check HTML IDs.');
        return;
    }

    const modalContent = modal.querySelector('.transform');

    document.addEventListener('openModal', (e) => {
        const { title, content } = e.detail;
        titleEl.textContent = title;
        bodyEl.innerHTML = content;

        modal.classList.remove('opacity-0', 'pointer-events-none');
        modal.classList.add('opacity-100', 'pointer-events-auto');

        if (modalContent) {
            modalContent.classList.remove('scale-95');
            modalContent.classList.add('scale-100');
        }

        document.body.style.overflow = 'hidden';
    });

    function closeModal() {
        modal.classList.remove('opacity-100', 'pointer-events-auto');
        modal.classList.add('opacity-0', 'pointer-events-none');

        if (modalContent) {
            modalContent.classList.remove('scale-100');
            modalContent.classList.add('scale-95');
        }

        setTimeout(() => { bodyEl.innerHTML = ''; }, 300);
        document.body.style.overflow = '';
    }

    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('opacity-100')) closeModal();
    });
}

export function showToast(message) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'bg-primary/90 backdrop-blur-md border border-accent/20 text-background px-6 py-3 rounded-full shadow-lg font-medium text-sm transform translate-y-10 opacity-0 transition-all duration-300 ease-out';
    toast.textContent = message;

    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.remove('translate-y-10', 'opacity-0'));

    setTimeout(() => {
        toast.classList.add('translate-y-10', 'opacity-0');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}