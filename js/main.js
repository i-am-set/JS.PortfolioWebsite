import { initProjects } from './projects.js?v=11';
import { initSkills } from './skills.js?v=11';
import { initExperience } from './experience.js?v=11';
import initAnalytics from './analytics.js?v=11';
import { initConsent } from './consent.js?v=11';

console.log('[App] Initializing Bento Dashboard v11...');

const runIdle = window.requestIdleCallback || ((cb) => setTimeout(cb, 1));

async function initApp() {
    await initMeta();

    initProjects();
    initSkills();
    initExperience();
    setupClock();
    setupModalSystem();

    runIdle(() => {
        initAnalytics();
        initConsent();
        neutralizeColorCycling();
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

function neutralizeColorCycling() {
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.attributeName === 'style') {
                const el = mutation.target;
                if (el.style.backgroundColor && (el.closest('#bento-experience') || el.closest('#bento-projects'))) {
                    el.style.backgroundColor = '';
                }
            }
        });
    });

    const expWidget = document.getElementById('bento-experience');
    const projWidget = document.getElementById('bento-projects');

    if (expWidget) observer.observe(expWidget, { attributes: true, subtree: true });
    if (projWidget) observer.observe(projWidget, { attributes: true, subtree: true });
}

async function initMeta() {
    try {
        const response = await fetch('./data/meta.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const meta = await response.json();
        document.title = `${meta.name} - ${meta.tagline}`;

        const elements = {
            navLogo: document.getElementById('nav-logo'),
            heroName: document.getElementById('hero-name'),
            heroTagline: document.getElementById('hero-tagline'),
            aboutBio: document.getElementById('about-bio'),
            heroPhoneLink: document.getElementById('hero-phone-link'),
            heroEmailLink: document.getElementById('hero-email-link'),
            heroGithubLink: document.getElementById('hero-github-link'),
            heroLinkedinLink: document.getElementById('hero-linkedin-link')
        };

        if (elements.navLogo) elements.navLogo.textContent = meta.name;
        if (elements.heroName) elements.heroName.textContent = meta.name;
        if (elements.heroTagline) elements.heroTagline.textContent = meta.tagline;

        if (elements.aboutBio && meta.bio) {
            const formattedBio = meta.bio.replace(/\\n/g, '\n');
            const paragraphs = formattedBio.split('\n').filter(p => p.trim() !== '');

            const fragment = document.createDocumentFragment();
            paragraphs.forEach(p => {
                const pEl = document.createElement('p');
                pEl.className = 'indent-6 mb-3 last:mb-0';
                pEl.textContent = p.trim();
                fragment.appendChild(pEl);
            });
            elements.aboutBio.innerHTML = '';
            elements.aboutBio.appendChild(fragment);
        }

        if (elements.heroPhoneLink) {
            elements.heroPhoneLink.addEventListener('click', (e) => {
                e.preventDefault();
                navigator.clipboard.writeText('(678) 444-5543').then(() => showToast('Phone number copied to clipboard!'));
            });
        }

        if (meta.links) {
            if (elements.heroEmailLink && meta.links.email) {
                elements.heroEmailLink.textContent = meta.links.email;
                elements.heroEmailLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    navigator.clipboard.writeText(meta.links.email).then(() => showToast('Email copied to clipboard!'));
                });
            }

            if (elements.heroGithubLink && meta.links.github) {
                elements.heroGithubLink.href = meta.links.github;
                elements.heroGithubLink.textContent = meta.links.github.replace(/\/$/, '').split('/').pop() || 'GitHub';
            }

            if (elements.heroLinkedinLink && meta.links.linkedin) {
                elements.heroLinkedinLink.href = meta.links.linkedin;
                elements.heroLinkedinLink.textContent = meta.links.linkedin.replace(/\/$/, '').split('/').pop() || 'LinkedIn';
            }
        }
    } catch (error) {
        console.error('[Meta] Error initializing meta data:', error);
    }
}

function setupClock() {
    const els = {
        myTime: document.getElementById('my-time'),
        myDate: document.getElementById('my-date'),
        localTime: document.getElementById('local-time'),
        localDate: document.getElementById('local-date')
    };

    if (!els.myTime || !els.myDate || !els.localTime || !els.localDate) return;

    let lastState = {};

    function updateTime() {
        const now = new Date();

        const state = {
            myTime: now.toLocaleTimeString('en-US', { timeZone: 'America/New_York', hour: 'numeric', minute: '2-digit', hour12: true }),
            myDate: now.toLocaleDateString('en-US', { timeZone: 'America/New_York', weekday: 'short', month: 'short', day: 'numeric' }),
            localTime: now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
            localDate: now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
        };

        requestAnimationFrame(() => {
            if (state.myTime !== lastState.myTime) els.myTime.textContent = state.myTime;
            if (state.myDate !== lastState.myDate) els.myDate.textContent = state.myDate;
            if (state.localTime !== lastState.localTime) els.localTime.textContent = state.localTime;
            if (state.localDate !== lastState.localDate) els.localDate.textContent = state.localDate;
            lastState = state;
        });
    }

    updateTime();
    setTimeout(function loop() {
        updateTime();
        setTimeout(loop, 1000 - (Date.now() % 1000));
    }, 1000 - (Date.now() % 1000));
}

function setupModalSystem() {
    const modal = document.getElementById('global-modal');
    const closeBtn = document.getElementById('modal-close');
    const titleEl = document.getElementById('modal-title');
    const bodyEl = document.getElementById('modal-body');

    if (!modal || !closeBtn || !titleEl || !bodyEl) return;

    const modalContent = modal.querySelector('.transform');

    document.addEventListener('openModal', (e) => {
        const { title, content } = e.detail;
        titleEl.textContent = title;
        bodyEl.innerHTML = content;

        requestAnimationFrame(() => {
            modal.classList.remove('opacity-0', 'pointer-events-none');
            modal.classList.add('opacity-100', 'pointer-events-auto');
            if (modalContent) {
                modalContent.classList.remove('scale-95');
                modalContent.classList.add('scale-100');
            }
            document.body.style.overflow = 'hidden';
        });
    });

    function closeModal() {
        requestAnimationFrame(() => {
            modal.classList.remove('opacity-100', 'pointer-events-auto');
            modal.classList.add('opacity-0', 'pointer-events-none');
            if (modalContent) {
                modalContent.classList.remove('scale-100');
                modalContent.classList.add('scale-95');
            }
            document.body.style.overflow = '';
        });
        setTimeout(() => { bodyEl.innerHTML = ''; }, 300);
    }

    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modal.classList.contains('opacity-100')) closeModal(); });
}

export function showToast(message) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'bg-primary/90 backdrop-blur-md border border-accent/20 text-background px-6 py-3 rounded-full shadow-lg font-medium text-sm transform translate-y-10 opacity-0 transition-all duration-300 ease-out will-change-transform';
    toast.textContent = message;

    container.appendChild(toast);

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            toast.classList.remove('translate-y-10', 'opacity-0');
        });
    });

    setTimeout(() => {
        toast.classList.add('translate-y-10', 'opacity-0');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}