import { initProjects } from './projects.js?v=11';
import { initSkills } from './skills.js?v=11';
import { initExperience } from './experience.js?v=11';
import initAnalytics from './analytics.js?v=11';
import { initConsent } from './consent.js?v=11';

console.log('[App] Initializing Bento Dashboard v11...');

const CACHE_BUSTER = Date.now();

async function initApp() {
    await initMeta();
    initProjects();
    initSkills();
    initExperience();

    initAnalytics();
    initConsent();

    setupClock();
    setupModalSystem();
    
    const resumeLink = document.getElementById('resume-link');
    if (resumeLink) {
        resumeLink.href = `./assets/resume.pdf?t=${CACHE_BUSTER}`;
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

async function initMeta() {
    try {
        const response = await fetch(`./data/meta.json?t=${CACHE_BUSTER}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const meta = await response.json();
        document.title = `${meta.name} - ${meta.tagline}`;

        const navLogo = document.getElementById('nav-logo');
        const heroName = document.getElementById('hero-name');
        const heroTagline = document.getElementById('hero-tagline');
        const aboutBio = document.getElementById('about-bio');

        const heroPhoneLink = document.getElementById('hero-phone-link');
        const heroEmailLink = document.getElementById('hero-email-link');
        const heroGithubLink = document.getElementById('hero-github-link');
        const heroLinkedinLink = document.getElementById('hero-linkedin-link');

        if (navLogo) navLogo.textContent = meta.name;
        if (heroName) heroName.textContent = meta.name;
        if (heroTagline) heroTagline.textContent = meta.tagline;

        if (aboutBio && meta.bio) {
            const formattedBio = meta.bio.replace(/\\n/g, '\n');
            const paragraphs = formattedBio.split('\n').filter(p => p.trim() !== '');
            aboutBio.innerHTML = paragraphs.map(p => `<p class="indent-6 mb-3 last:mb-0">${p.trim()}</p>`).join('');
        }

        if (heroPhoneLink) {
            heroPhoneLink.addEventListener('click', (e) => {
                e.preventDefault();
                navigator.clipboard.writeText('(678) 444-5543').then(() => {
                    showToast('Phone number copied to clipboard!');
                });
            });
        }

        if (meta.links) {
            if (heroEmailLink && meta.links.email) {
                heroEmailLink.textContent = meta.links.email;
                heroEmailLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    navigator.clipboard.writeText(meta.links.email).then(() => {
                        showToast('Email copied to clipboard!');
                    });
                });
            }

            if (heroGithubLink && meta.links.github) {
                heroGithubLink.href = meta.links.github;
                const ghUsername = meta.links.github.replace(/\/$/, '').split('/').pop();
                heroGithubLink.textContent = ghUsername || 'GitHub';
            }

            if (heroLinkedinLink && meta.links.linkedin) {
                heroLinkedinLink.href = meta.links.linkedin;
                const liUsername = meta.links.linkedin.replace(/\/$/, '').split('/').pop();
                heroLinkedinLink.textContent = liUsername || 'LinkedIn';
            }
        }
    } catch (error) {
        console.error('[Meta] Error initializing meta data:', error);
    }
}

function setupClock() {
    const myTimeEl = document.getElementById('my-time');
    const myDateEl = document.getElementById('my-date');
    const localTimeEl = document.getElementById('local-time');
    const localDateEl = document.getElementById('local-date');

    if (!myTimeEl || !myDateEl || !localTimeEl || !localDateEl) {
        console.warn('[Clock] Elements not found. Check HTML IDs.');
        return;
    }

    let lastMyTime, lastMyDate, lastLocalTime, lastLocalDate;

    function updateTime() {
        const now = new Date();

        const newMyTime = now.toLocaleTimeString('en-US', { timeZone: 'America/New_York', hour: 'numeric', minute: '2-digit', hour12: true });
        const newMyDate = now.toLocaleDateString('en-US', { timeZone: 'America/New_York', weekday: 'short', month: 'short', day: 'numeric' });

        const newLocalTime = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
        const newLocalDate = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

        if (newMyTime !== lastMyTime) {
            myTimeEl.textContent = newMyTime;
            lastMyTime = newMyTime;
        }
        if (newMyDate !== lastMyDate) {
            myDateEl.textContent = newMyDate;
            lastMyDate = newMyDate;
        }
        if (newLocalTime !== lastLocalTime) {
            localTimeEl.textContent = newLocalTime;
            lastLocalTime = newLocalTime;
        }
        if (newLocalDate !== lastLocalDate) {
            localDateEl.textContent = newLocalDate;
            lastLocalDate = newLocalDate;
        }
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