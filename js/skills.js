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
            `<span class="px-4 py-2 bg-background border border-secondary rounded-md text-sm font-medium text-text-primary shadow-sm hover:border-primary hover:text-primary transition-colors cursor-default">${item}</span>`
        ).join('');

        const categoryHtml = `
            <div class="flex flex-col">
                <h3 class="text-lg font-display font-bold text-accent mb-4 border-b border-secondary pb-2">${category.category}</h3>
                <div class="flex flex-wrap gap-3">
                    ${itemsHtml}
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', categoryHtml);
    });
}