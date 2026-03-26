export async function initProjects() {
    const container = document.getElementById('projects-container');
    if (!container) return;

    try {
        const response = await fetch('./data/projects.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const projects = await response.json();
        if (!Array.isArray(projects)) throw new Error("Invalid data format");

        renderProjects(projects, container);
    } catch (error) {
        console.error('Failed to load projects:', error);
        renderError(container);
    }
}

function renderProjects(projects, container) {
    container.innerHTML = '';

    projects.forEach(project => {
        const tagsHtml = project.technologies.map(tech =>
            `<span class="px-3 py-1 text-xs font-medium bg-secondary/30 text-accent rounded-full border border-secondary/50 backdrop-blur-sm">${tech}</span>`
        ).join('');

        let linksHtml = '';
        if (project.repoUrl) {
            linksHtml += `<a href="${project.repoUrl}" target="_blank" rel="noopener noreferrer" class="text-sm font-medium text-primary hover:text-accent transition-colors duration-300 flex items-center gap-1">GitHub Repo <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg></a>`;
        }
        if (project.liveUrl) {
            linksHtml += `<a href="${project.liveUrl}" target="_blank" rel="noopener noreferrer" class="text-sm font-medium text-primary hover:text-accent transition-colors duration-300 flex items-center gap-1">Live Demo <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg></a>`;
        }

        const cardHtml = `
            <div class="card flex flex-col h-full overflow-hidden p-0 stagger-item group">
                <div class="h-48 w-full overflow-hidden bg-background relative">
                    <div class="absolute inset-0 bg-primary/10 group-hover:bg-transparent transition-colors duration-500 z-10"></div>
                    <img src="${project.imageUrl}" alt="${project.title} screenshot" loading="lazy" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiMxMTI1MjIiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZmlsbD0iIzhhYjRhNSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiPkltYWdlIE5vdCBGb3VuZDwvdGV4dD48L3N2Zz4='">
                </div>
                <div class="p-6 flex flex-col flex-grow relative z-20">
                    <h3 class="text-xl font-display font-bold text-text-primary mb-3 group-hover:text-accent transition-colors duration-300">${project.title}</h3>
                    <p class="text-text-muted text-sm mb-6 flex-grow leading-relaxed">${project.description}</p>
                    <div class="flex flex-wrap gap-2 mb-6">
                        ${tagsHtml}
                    </div>
                    <div class="flex flex-wrap items-center gap-6 mt-auto pt-5 border-t border-secondary/30">
                        ${linksHtml}
                    </div>
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', cardHtml);
    });
}

function renderError(container) {
    container.innerHTML = `
        <div class="col-span-full flex flex-col items-center justify-center p-8 bg-surface/50 backdrop-blur-sm border border-red-900/50 rounded-xl text-center">
            <svg class="w-12 h-12 text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            <h3 class="text-lg font-bold text-text-primary mb-2">Failed to load projects</h3>
            <p class="text-text-muted mb-4">There was an error fetching the project data.</p>
            <button id="retry-projects-btn" class="btn-ghost text-sm px-4 py-2">Retry</button>
        </div>
    `;

    document.getElementById('retry-projects-btn').addEventListener('click', () => {
        container.innerHTML = '<div class="col-span-full text-center text-text-muted animate-pulse">Retrying...</div>';
        initProjects();
    });
}