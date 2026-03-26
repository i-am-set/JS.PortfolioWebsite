export async function initSkills() {
    const container = document.getElementById('skills-container');
    if (!container) return;

    try {
        const response = await fetch('./data/skills.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const skillsData = await response.json();
        if (!Array.isArray(skillsData)) throw new Error("Invalid data format");

        renderSkills(skillsData, container);
    } catch (error) {
        console.error('Failed to load skills:', error);
        container.innerHTML = `<div class="col-span-full text-red-400 text-sm">Failed to load skills data.</div>`;
    }
}

function renderSkills(skillsData, container) {
    container.innerHTML = ''; // Clear skeletons

    skillsData.forEach(category => {
        const itemsHtml = category.items.map(item =>
            `<span class="px-4 py-2 bg-surface/50 backdrop-blur-sm border border-secondary/50 rounded-lg text-sm font-medium text-text-primary shadow-sm hover:border-primary hover:text-accent hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(64,138,113,0.15)] transition-all duration-300 cursor-default">${item}</span>`
        ).join('');

        const categoryHtml = `
            <div class="flex flex-col stagger-item">
                <h3 class="text-xl font-display font-bold text-accent mb-5 border-b border-secondary/30 pb-3 flex items-center gap-3">
                    <span class="w-2 h-2 rounded-full bg-primary"></span>
                    ${category.category}
                </h3>
                <div class="flex flex-wrap gap-3">
                    ${itemsHtml}
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', categoryHtml);
    });
}