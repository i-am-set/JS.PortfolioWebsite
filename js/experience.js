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
            `<li class="text-text-muted text-base leading-relaxed relative before:content-['▹'] before:absolute before:-left-6 before:text-primary hover:text-text-primary transition-colors duration-300">${highlight}</li>`
        ).join('');

        const jobHtml = `
            <div class="flex gap-6 md:gap-8 group stagger-item relative">
                <!-- Timeline Line & Dot (Desktop) -->
                <div class="hidden md:flex flex-col items-center mt-1.5">
                    <div class="w-4 h-4 rounded-full bg-surface border-2 border-primary group-hover:bg-primary group-hover:shadow-[0_0_15px_rgba(64,138,113,0.6)] transition-all duration-300 shrink-0 z-10"></div>
                    <div class="w-0.5 h-full bg-secondary/30 mt-2 group-hover:bg-primary/50 transition-colors duration-300"></div>
                </div>
                
                <!-- Timeline Dot (Mobile) -->
                <div class="md:hidden absolute -left-[19px] top-2 w-3 h-3 rounded-full bg-surface border-2 border-primary group-hover:bg-primary transition-colors duration-300 z-10"></div>
                
                <!-- Content -->
                <div class="pb-12 w-full">
                    <div class="flex flex-col sm:flex-row sm:items-baseline sm:justify-between mb-2">
                        <h3 class="text-2xl font-display font-bold text-text-primary group-hover:text-accent transition-colors duration-300">${job.role}</h3>
                        <span class="text-sm font-medium text-primary font-mono mt-1 sm:mt-0 bg-primary/10 px-3 py-1 rounded-full border border-primary/20">${job.period}</span>
                    </div>
                    <h4 class="text-lg font-medium text-accent mb-5">${job.company}</h4>
                    
                    ${job.description ? `<p class="text-text-muted mb-5 leading-relaxed">${job.description}</p>` : ''}
                    
                    <ul class="space-y-3 pl-6">
                        ${highlightsHtml}
                    </ul>
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', jobHtml);
    });
}