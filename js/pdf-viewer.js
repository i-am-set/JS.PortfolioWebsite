import * as pdfjsLib from 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.min.mjs';

// Set the worker source to match the CDN version
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.mjs';

const PDF_URL = './assets/resume.pdf';

let pdfDoc = null;
let pageNum = 1;
let pageIsRendering = false;
let pageNumIsPending = null;

export default async function initPdfViewer() {
    const canvas = document.getElementById('pdf-canvas');
    const container = document.getElementById('pdf-container');
    const prevBtn = document.getElementById('pdf-prev');
    const nextBtn = document.getElementById('pdf-next');
    const pageIndicator = document.getElementById('pdf-page-indicator');

    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');

    const renderPage = async (num) => {
        pageIsRendering = true;

        try {
            const page = await pdfDoc.getPage(num);

            // Calculate scale to fit the container width (with a small padding margin)
            const containerWidth = container.clientWidth - 32;
            const unscaledViewport = page.getViewport({ scale: 1.0 });

            // Determine scale, but cap it so it doesn't get massively oversized on ultrawide screens
            const calculatedScale = containerWidth / unscaledViewport.width;
            const finalScale = Math.min(calculatedScale, 1.5);

            const viewport = page.getViewport({ scale: finalScale });

            canvas.height = viewport.height;
            canvas.width = viewport.width;

            const renderCtx = {
                canvasContext: ctx,
                viewport: viewport
            };

            await page.render(renderCtx).promise;

            pageIsRendering = false;

            // If another page rendering is pending, render it now
            if (pageNumIsPending !== null) {
                renderPage(pageNumIsPending);
                pageNumIsPending = null;
            }
        } catch (error) {
            console.error('[PDF Viewer] Error rendering page:', error);
            pageIsRendering = false;
        }

        // Update UI
        pageIndicator.textContent = `Page ${num} of ${pdfDoc.numPages}`;
        if (prevBtn) prevBtn.disabled = num <= 1;
        if (nextBtn) nextBtn.disabled = num >= pdfDoc.numPages;
    };

    const queueRenderPage = (num) => {
        if (pageIsRendering) {
            pageNumIsPending = num;
        } else {
            renderPage(num);
        }
    };

    const onPrevPage = () => {
        if (pageNum <= 1) return;
        pageNum--;
        queueRenderPage(pageNum);
    };

    const onNextPage = () => {
        if (pageNum >= pdfDoc.numPages) return;
        pageNum++;
        queueRenderPage(pageNum);
    };

    // Attach Event Listeners
    if (prevBtn) prevBtn.addEventListener('click', onPrevPage);
    if (nextBtn) nextBtn.addEventListener('click', onNextPage);

    // Handle Window Resize (Debounced)
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            if (pdfDoc) {
                queueRenderPage(pageNum);
            }
        }, 200);
    });

    // Fetch and Load the PDF Document
    try {
        pdfDoc = await pdfjsLib.getDocument(PDF_URL).promise;
        renderPage(pageNum);
    } catch (error) {
        console.error('[PDF Viewer] Error loading PDF document:', error);
        pageIndicator.textContent = 'Error';
        container.innerHTML = `
            <div class="flex flex-col items-center justify-center text-center p-8">
                <svg class="w-12 h-12 text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                <h3 class="text-lg font-bold text-text-primary mb-2">Failed to load PDF</h3>
                <p class="text-text-muted text-sm">Please ensure the file exists at <code>./assets/resume.pdf</code></p>
            </div>
        `;
    }
}