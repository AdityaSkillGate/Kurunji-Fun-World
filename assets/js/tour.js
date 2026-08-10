/**
 * Kurunji Fun World - Multi-Location 360 Tour Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    if (typeof window.KurunjiData === 'undefined' || !window.KurunjiData.panoramas) {
        console.error("KurunjiData or panoramas not found!");
        return;
    }

    const panoramas = window.KurunjiData.panoramas;
    let activeLocationId = panoramas[0].id; // Default to first

    // DOM Elements
    const tabsContainer = document.getElementById('tour-tabs');
    const iframe = document.getElementById('tour-iframe');
    const loader = document.getElementById('tour-loader');
    const locName = document.getElementById('loc-name');
    const locDesc = document.getElementById('loc-desc');
    const btnFullscreen = document.getElementById('btn-fullscreen');
    const viewerContainer = iframe.parentElement;

    // Check URL hash for direct linking (e.g. tour.html#outdoor)
    const hash = window.location.hash.replace('#', '');
    if (hash) {
        const found = panoramas.find(p => p.id.toLowerCase() === hash || p.name.toLowerCase().includes(hash));
        if (found) {
            activeLocationId = found.id;
        }
    }

    // 1. Render Tabs
    function renderTabs() {
        tabsContainer.innerHTML = panoramas.map(pano => {
            const isActive = pano.id === activeLocationId;
            const activeClass = isActive 
                ? "bg-white border-b-2 border-primary text-primary font-bold shadow-sm" 
                : "text-on-surface-variant hover:bg-white/50 hover:text-on-surface font-medium border-b-2 border-transparent";
            
            return `
                <button data-id="${pano.id}" class="px-6 py-4 transition-all whitespace-nowrap ${activeClass}">
                    ${pano.name}
                </button>
            `;
        }).join('');

        // Attach listeners
        tabsContainer.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                if (id !== activeLocationId) {
                    activeLocationId = id;
                    loadLocation();
                    renderTabs(); // Re-render to update active classes
                }
            });
        });
    }

    // 2. Load Location
    function loadLocation() {
        const pano = panoramas.find(p => p.id === activeLocationId);
        if (!pano) return;

        // Update Text
        locName.textContent = pano.name;
        locDesc.textContent = pano.description;

        // Show Loader & Hide iframe
        loader.classList.remove('opacity-0', 'pointer-events-none');
        iframe.classList.remove('opacity-100');
        iframe.classList.add('opacity-0');

        // Update Iframe Source
        iframe.src = pano.source;

        // When iframe loads, hide loader
        iframe.onload = () => {
            setTimeout(() => {
                loader.classList.add('opacity-0', 'pointer-events-none');
                iframe.classList.remove('opacity-0');
                iframe.classList.add('opacity-100');
            }, 500); // slight delay for smooth transition
        };
    }

    // 3. Fullscreen Logic
    btnFullscreen.addEventListener('click', () => {
        if (!document.fullscreenElement) {
            if (viewerContainer.requestFullscreen) {
                viewerContainer.requestFullscreen();
            } else if (viewerContainer.webkitRequestFullscreen) { /* Safari */
                viewerContainer.webkitRequestFullscreen();
            } else if (viewerContainer.msRequestFullscreen) { /* IE11 */
                viewerContainer.msRequestFullscreen();
            }
            btnFullscreen.querySelector('.material-symbols-outlined').textContent = 'fullscreen_exit';
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) { /* Safari */
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) { /* IE11 */
                document.msExitFullscreen();
            }
            btnFullscreen.querySelector('.material-symbols-outlined').textContent = 'fullscreen';
        }
    });

    // Update button icon if exit fullscreen via Esc key
    document.addEventListener('fullscreenchange', () => {
        if (!document.fullscreenElement) {
            btnFullscreen.querySelector('.material-symbols-outlined').textContent = 'fullscreen';
        }
    });

    // Initialize
    renderTabs();
    loadLocation();
});
