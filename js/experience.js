export async function initExperience() {
    const widget = document.getElementById('bento-experience');
    const summaryContainer = document.getElementById('experience-summary');
    if (!widget || !summaryContainer) return;

    try {
        const response = await fetch('./data/experience.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const experienceData = await response.json();

        if (experienceData.length > 0) {
            const latest = experienceData[0];
            summaryContainer.innerHTML = `
                <p class="text-text-primary font-medium text-base leading-tight mb-1">${latest.role}</p>
                <p class="text-accent text-sm">${latest.company.split('|')[0].trim()}</p>
                <p class="text-text-muted text-xs mt-2 font-mono">${latest.period}</p>
            `;
        }

        widget.addEventListener('click', () => {
            document.dispatchEvent(new CustomEvent('openModal', {
                detail: {
                    title: 'Experience Timeline',
                    content: generateExperienceHtml(experienceData)
                }
            }));
        });

    } catch (error) {
        console.error('Failed to load experience:', error);
        summaryContainer.innerHTML = `<span class="text-red-400 text-sm">Error loading data</span>`;
    }
}

function generateExperienceHtml(experienceData) {
    return `
        <div class="space-y-10 border-l-2 border-secondary/30 ml-3 md:ml-4">
            ${experienceData.map(job => `
                <div class="relative pl-6 md:pl-8">
                    <div class="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-surface border-2 border-primary z-10"></div>
                    
                    <div class="flex flex-col sm:flex-row sm:items-baseline sm:justify-between mb-1">
                        <h3 class="text-xl font-display font-bold text-text-primary">${job.role}</h3>
                        <span class="text-xs font-medium text-primary font-mono mt-1 sm:mt-0 bg-primary/10 px-2 py-1 rounded border border-primary/20">${job.period}</span>
                    </div>
                    <h4 class="text-base font-medium text-accent mb-4">${job.company}</h4>
                    
                    ${job.description ? `<p class="text-text-muted text-sm mb-4">${job.description}</p>` : ''}
                    
                    <ul class="space-y-2 pl-4">
                        ${job.highlights.map(highlight => `
                            <li class="text-text-muted text-sm leading-relaxed relative before:content-['▹'] before:absolute before:-left-5 before:text-primary">${highlight}</li>
                        `).join('')}
                    </ul>
                </div>
            `).join('')}
        </div>
    `;
}