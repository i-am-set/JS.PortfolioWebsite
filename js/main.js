import { initProjects } from './projects.js';
import { initSkills } from './skills.js';
import { initExperience } from './experience.js';
import initAnalytics from './analytics.js';

async function initApp() {
    console.log("[App] Initialization started...");

    // 1. Fetch Meta Data and Populate Shell
    await initMeta();

    // 2. Initialize Data Modules
    console.log("[App] Initializing data modules...");
    initProjects();
    initSkills();
    initExperience();

    // 3. Initialize Analytics (Listens for consent events)
    initAnalytics();

    // 4. Setup UI Interactions
    setupSmoothScrolling();
    setupIntersectionObserver();

    console.log("[App] Initialization complete.");
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

async function initMeta() {
    try {
        console.log("[Meta] Fetching meta.json...");
        const response = await fetch('./data/meta.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const meta = await response.json();
        console.log("[Meta] Data loaded successfully.");

        // Update Document Title
        document.title = `${meta.name} - ${meta.tagline}`;

        // Update Header & Footer
        const navLogo = document.getElementById('nav-logo');
        if (navLogo) navLogo.textContent = meta.name;
        
        const footerName = document.getElementById('footer-name');
        if (footerName) footerName.textContent = meta.name;

        // Update Hero Section
        const heroName = document.getElementById('hero-name');
        if (heroName) heroName.textContent = meta.name;

        const heroTagline = document.getElementById('hero-tagline');
        if (heroTagline) heroTagline.textContent = meta.tagline;

        const heroBio = document.getElementById('hero-bio');
        if (heroBio) heroBio.textContent = meta.bio;

        // Update Footer Links
        const footerLinksContainer = document.getElementById('footer-links');
        if (footerLinksContainer && meta.links) {
            footerLinksContainer.innerHTML = '';
            if (meta.links.github) {
                footerLinksContainer.insertAdjacentHTML('beforeend', `<a href="${meta.links.github}" target="_blank" rel="noopener noreferrer" class="text-text-muted hover:text-primary transition-colors">GitHub</a>`);
            }
            if (meta.links.linkedin) {
                footerLinksContainer.insertAdjacentHTML('beforeend', `<a href="${meta.links.linkedin}" target="_blank" rel="noopener noreferrer" class="text-text-muted hover:text-primary transition-colors">LinkedIn</a>`);
            }
            if (meta.links.email) {
                footerLinksContainer.insertAdjacentHTML('beforeend', `<a href="${meta.links.email}" class="text-text-muted hover:text-primary transition-colors">Email</a>`);
            }
        }

    } catch (error) {
        console.error('[Meta] Error initializing meta data:', error);
        console.warn('[Meta] Are you running via Live Server? Fetch API fails if opened directly from the file system (file:///).');
    }
}

function setupSmoothScrolling() {
    const navLinks = document.querySelectorAll('nav a[href^="#"], #hero-actions a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                // Offset for fixed header
                const headerOffset = 80;
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
    
    // Add base animation class to all sections
    sections.forEach(section => {
        section.classList.add('fade-in-section');
    });

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15 // Trigger when 15% of the section is visible
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                // Stop observing once it has faded in
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        observer.observe(section);
    });
}