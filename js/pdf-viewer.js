const PDF_URL = `./assets/resume.pdf?t=${Date.now()}`;
const FALLBACK_IMG = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiMxMTI1MjIiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM4QUI0QTUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiPlJlc3VtZSBQcmV2aWV3PC90ZXh0Pjwvc3ZnPg==';

export default async function initPdfViewer() {
    const container = document.getElementById('pdf-container');
    const prevBtn = document.getElementById('pdf-prev');
    const nextBtn = document.getElementById('pdf-next');
    const pageIndicator = document.getElementById('pdf-page-indicator');

    if (!container) return;

    if (prevBtn) prevBtn.style.display = 'none';
    if (nextBtn) nextBtn.style.display = 'none';
    if (pageIndicator) pageIndicator.style.display = 'none';

    container.innerHTML = `
        <div class="relative w-full h-full min-h-[300px] flex flex-col items-center justify-center bg-surface rounded-xl overflow-hidden border border-secondary/30 group">
            <img src="./assets/images/resume-preview.jpg" alt="Resume Preview" class="w-full h-full object-cover opacity-30 group-hover:opacity-40 transition-opacity duration-300" onerror="this.src='${FALLBACK_IMG}'">
            <div class="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                <svg class="w-12 h-12 text-primary mb-4 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                <h3 class="text-lg font-display font-bold text-text-primary mb-4">Resume.pdf</h3>
                <a href="${PDF_URL}" target="_blank" rel="noopener noreferrer" class="bg-primary hover:bg-accent text-background hover:text-surface px-6 py-2 rounded-lg font-medium transition-colors duration-200 shadow-lg flex items-center gap-2">
                    <span>Open PDF</span>
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                </a>
            </div>
        </div>
    `;
}