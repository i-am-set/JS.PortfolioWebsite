import { initProjects } from './projects.js';
import { initSkills } from './skills.js';
import { initExperience } from './experience.js';
import initAnalytics from './analytics.js';
import { initConsent } from './consent.js';

async function initApp() {
    await initMeta();
    initProjects();
    initSkills();
    initExperience();

    initAnalytics();
    initConsent();

    setupSmoothScrolling();
    setupIntersectionObserver();
    setupMobileMenu();
    setupParallax();
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
        if (navLogo) navLogo.textContent = meta.name;

        const footerName = document.getElementById('footer-name');
        if (footerName) footerName.textContent = meta.name;

        const heroName = document.getElementById('hero-name');
        if (heroName) heroName.textContent = meta.name;

        const heroTagline = document.getElementById('hero-tagline');
        if (heroTagline) heroTagline.textContent = meta.tagline;

        const heroBio = document.getElementById('hero-bio');
        if (heroBio) heroBio.textContent = meta.bio;

        const footerLinksContainer = document.getElementById('footer-links');
        if (footerLinksContainer && meta.links) {
            footerLinksContainer.innerHTML = '';
            if (meta.links.github) footerLinksContainer.insertAdjacentHTML('beforeend', `<a href="${meta.links.github}" target="_blank" rel="noopener noreferrer" class="text-text-muted hover:text-primary transition-colors duration-300">GitHub</a>`);
            if (meta.links.linkedin) footerLinksContainer.insertAdjacentHTML('beforeend', `<a href="${meta.links.linkedin}" target="_blank" rel="noopener noreferrer" class="text-text-muted hover:text-primary transition-colors duration-300">LinkedIn</a>`);

            if (meta.links.email) {
                footerLinksContainer.insertAdjacentHTML('beforeend', `<button id="copy-email-btn" data-email="${meta.links.email}" class="text-text-muted hover:text-primary transition-colors duration-300 cursor-pointer">Email</button>`);

                document.getElementById('copy-email-btn').addEventListener('click', function () {
                    const email = this.getAttribute('data-email');
                    navigator.clipboard.writeText(email).then(() => {
                        showToast('Email copied to clipboard!');
                    }).catch(err => {
                        console.error('Failed to copy email: ', err);
                        showToast('Failed to copy email.');
                    });
                });
            }
        }
    } catch (error) {
        console.error('[Meta] Error initializing meta data:', error);
    }
}

function showToast(message) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'bg-primary/90 backdrop-blur-md border border-accent/20 text-background px-6 py-3 rounded-full shadow-[0_8px_30px_rgba(64,138,113,0.3)] font-medium text-sm transform translate-y-10 opacity-0 transition-all duration-300 ease-out';
    toast.textContent = message;

    container.appendChild(toast);

    requestAnimationFrame(() => {
        toast.classList.remove('translate-y-10', 'opacity-0');
    });

    setTimeout(() => {
        toast.classList.add('translate-y-10', 'opacity-0');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function setupMobileMenu() {
    const btn = document.getElementById('mobile-menu-btn');
    const nav = document.getElementById('mobile-nav');
    const links = document.querySelectorAll('.mobile-link');

    if (btn && nav) {
        btn.addEventListener('click', () => {
            nav.classList.toggle('hidden');
            nav.classList.toggle('flex');
        });

        links.forEach(link => {
            link.addEventListener('click', () => {
                nav.classList.add('hidden');
                nav.classList.remove('flex');
            });
        });
    }
}

function setupSmoothScrolling() {
    const navLinks = document.querySelectorAll('nav a[href^="#"], #hero-actions a[href^="#"]');

    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                const headerOffset = 100;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

function setupIntersectionObserver() {
    const sections = document.querySelectorAll('section[data-page-section]');
    sections.forEach(section => section.classList.add('fade-in-section'));

    const observerOptions = { root: null, rootMargin: '0px', threshold: 0.1 };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Reveal parent section
                entry.target.classList.add('is-visible');

                // Stagger reveal children elements
                const staggerItems = entry.target.querySelectorAll('.stagger-item');
                staggerItems.forEach((item, index) => {
                    setTimeout(() => {
                        item.classList.add('is-visible');
                    }, index * 150); // 150ms delay between each item
                });

                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    sections.forEach(section => observer.observe(section));
}

function setupParallax() {
    const blobs = document.querySelectorAll('.parallax-blob');
    let ticking = false;

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const scrolled = window.scrollY;
                blobs.forEach((blob, index) => {
                    // Alternate directions for blobs
                    const speed = index % 2 === 0 ? 0.15 : -0.1;
                    blob.style.transform = `translateY(${scrolled * speed}px)`;
                });
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });
}