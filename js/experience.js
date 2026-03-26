export async function initExperience() {
    const container = document.getElementById('experience-container');
    if (!container) return;

    try {
        const response = await fetch('./data/experience.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const experienceData = await response.json();
        if (!Array.isArray(experienceData)) throw new Error("Invalid data format");

        renderExperience(experienceData, container);
    } catch (error) {
        console.error('Failed to load experience:', error);
        container.innerHTML = `<div class="text-red-400 text-sm">Failed to load experience data.</div>`;
    }
}

function renderExperience(experienceData, container) {
    container.innerHTML = '';

    experienceData.forEach(job => {
        const highlightsHtml = job.highlights.map(highlight =>
            `<li class="text-text-muted text-base leading-relaxed relative before:content-['▹'] before:absolute before:-left-5 before:text-primary">${highlight}</li>`
        ).join('');

        const jobHtml = `
            <div class="relative group">
                <!-- Timeline Dot (Adjusted for mobile padding) -->
                <div class="absolute -left-[33px] md:-left-[41px] top-1.5 h-4 w-4 rounded-full bg-surface border-2 border-primary group-hover:bg-primary transition-colors duration-300"></div>
                
                <div class="flex flex-col sm:flex-row sm:items-baseline sm:justify-between mb-2">
                    <h3 class="text-xl font-display font-bold text-text-primary">${job.role}</h3>
                    <span class="text-sm font-medium text-primary font-mono mt-1 sm:mt-0">${job.period}</span>
                </div>
                <h4 class="text-lg font-medium text-accent mb-4">${job.company}</h4>
                
                ${job.description ? `<p class="text-text-muted mb-4">${job.description}</p>` : ''}
                
                <ul class="space-y-2 pl-5">
                    ${highlightsHtml}
                </ul>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', jobHtml);
    });
}