export async function initSkills() {
    const widget = document.getElementById('bento-skills');
    const summaryContainer = document.getElementById('skills-summary');

    if (!widget || !summaryContainer) {
        console.warn('[Skills] Widget not found. Check HTML ID.');
        return;
    }

    try {
        const response = await fetch('./data/skills.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const skillsData = await response.json();

        const allSkills = skillsData.flatMap(cat => cat.items).slice(0, 8);

        requestAnimationFrame(() => {
            summaryContainer.innerHTML = allSkills.map(skill =>
                `<span class="px-3 py-1 bg-background/50 border border-secondary/30 rounded-lg text-xs text-text-muted whitespace-nowrap">${skill}</span>`
            ).join('') + `<span class="px-3 py-1 bg-primary/10 border border-primary/30 rounded-lg text-xs text-primary whitespace-nowrap">+ More</span>`;
        });

        widget.addEventListener('click', () => {
            document.dispatchEvent(new CustomEvent('openModal', {
                detail: {
                    title: 'Technical Skills',
                    content: generateSkillsHtml(skillsData)
                }
            }));
        });

    } catch (error) {
        console.error('Failed to load skills:', error);
        requestAnimationFrame(() => {
            summaryContainer.innerHTML = `<span class="text-red-400 text-sm">Error loading data</span>`;
        });
    }
}

function generateSkillsHtml(skillsData) {
    return `
        <div class="space-y-8">
            ${skillsData.map(category => `
                <div>
                    <h3 class="text-lg font-display font-bold text-accent mb-4 border-b border-secondary/30 pb-2 flex items-center gap-2">
                        <span class="w-2 h-2 rounded-full bg-primary gpu-accel"></span>
                        ${category.category}
                    </h3>
                    <div class="flex flex-wrap gap-3">
                        ${category.items.map(item => `
                            <span class="px-4 py-2 bg-surface border border-secondary/50 rounded-xl text-sm font-medium text-text-primary shadow-sm">${item}</span>
                        `).join('')}
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}