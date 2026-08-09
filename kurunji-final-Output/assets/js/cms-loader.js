/**
 * CMS Loader
 * Fetches dynamic content from Google Sheets via api.js and injects it into the DOM.
 */

document.addEventListener('DOMContentLoaded', async () => {
    // Show a small global loading indicator if desired
    // document.body.style.opacity = '0.9';

    try {
        // Ensure api.js is loaded first. If fetchCMSData is undefined, we wait a bit or throw.
        if (typeof fetchCMSData === 'undefined') {
            console.warn("api.js must be loaded before cms-loader.js");
            return;
        }

        const cmsData = await fetchCMSData();
        
        if (cmsData) {
            // Update SEO Tags
            if (cmsData.seoTitle) {
                document.title = cmsData.seoTitle;
            }
            if (cmsData.seoDesc) {
                let metaDesc = document.querySelector('meta[name="description"]');
                if (!metaDesc) {
                    metaDesc = document.createElement('meta');
                    metaDesc.name = "description";
                    document.head.appendChild(metaDesc);
                }
                metaDesc.content = cmsData.seoDesc;
            }

            // Map data to DOM elements with data-cms="..." attributes
            const elements = document.querySelectorAll('[data-cms]');
            elements.forEach(el => {
                const key = el.getAttribute('data-cms');
                if (cmsData[key]) {
                    // Check if it's an input/textarea vs normal HTML element
                    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                        el.value = cmsData[key];
                    } else {
                        // Support innerHTML for bold/italic if needed, but textContent is safer.
                        // We use innerHTML to allow basic formatting (like <br> or <strong>).
                        el.innerHTML = cmsData[key];
                    }
                }
            });
        }
    } catch (e) {
        console.error("Failed to load CMS content:", e);
    } finally {
        // Remove loading state
        // document.body.style.opacity = '1';
    }
});
