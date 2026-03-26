export async function initProjects() {
    const widget = document.getElementById('bento-projects');
    if (!widget) {
        console.warn('[Projects] Widget not found. Check HTML ID.');
        return;
    }

    try {
        const response = await fetch('./data/projects.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const projects = await response.json();

        if (projects.length > 0) {
            const bgEl = document.getElementById('projects-bg');
            const subEl = document.getElementById('projects-subtitle');

            requestAnimationFrame(() => {
                if (bgEl) bgEl.style.backgroundImage = `url('${projects[0].imageUrl}')`;
                if (subEl) subEl.textContent = `${projects.length} Projects Available`;
            });
        }

        widget.addEventListener('click', () => {
            document.dispatchEvent(new CustomEvent('openModal', {
                detail: {
                    title: 'Featured Projects',
                    content: generateProjectsHtml(projects)
                }
            }));
        });

    } catch (error) {
        console.error('Failed to load projects:', error);
        const subEl = document.getElementById('projects-subtitle');
        if (subEl) {
            requestAnimationFrame(() => {
                subEl.textContent = 'Error loading projects';
            });
        }
    }
}

function generateProjectsHtml(projects) {
    return `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            ${projects.map(project => `
                <div class="bg-background/50 border border-secondary/30 rounded-2xl overflow-hidden flex flex-col gpu-accel">
                    <div class="h-48 w-full overflow-hidden bg-surface relative shrink-0">
                        <img src="${project.imageUrl}" alt="${project.title}" loading="lazy" class="w-full h-full object-cover" onerror="this.style.display='none'">
                    </div>
                    <div class="p-6 flex flex-col flex-grow">
                        <h3 class="text-xl font-display font-bold text-text-primary mb-2">${project.title}</h3>
                        <p class="text-text-muted text-sm mb-4 flex-grow">${project.description}</p>
                        <div class="flex flex-wrap gap-2 mb-6">
                            ${project.technologies.map(tech => `<span class="px-2 py-1 text-xs font-medium bg-secondary/30 text-accent rounded-md border border-secondary/50">${tech}</span>`).join('')}
                        </div>
                        <div class="flex gap-4 mt-auto pt-4 border-t border-secondary/30">
                            ${project.repoUrl ? `<a href="${project.repoUrl}" target="_blank" rel="noopener noreferrer" class="text-sm font-medium text-primary hover:text-accent transition-colors">GitHub &rarr;</a>` : ''}
                            ${project.liveUrl ? `<a href="${project.liveUrl}" target="_blank" rel="noopener noreferrer" class="text-sm font-medium text-primary hover:text-accent transition-colors">Live Demo &rarr;</a>` : ''}
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}