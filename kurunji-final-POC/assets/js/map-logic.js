/**
 * Kurunji Fun World - Interactive Park Map Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    if (typeof window.KurunjiData === 'undefined' || !window.KurunjiData.maps) {
        console.error("KurunjiData or maps not found!");
        return;
    }

    const data = window.KurunjiData;
    const maps = data.maps;
    let activeMapId = maps[0].id; // Default to Ground Floor

    // DOM Elements
    const sidebar = document.getElementById('map-sidebar');
    const mapContainer = document.getElementById('map-container');
    const placeholderTitle = document.getElementById('placeholder-title');
    const hotspotsLayer = document.getElementById('hotspots-layer');
    
    // Modal Elements
    const modal = document.getElementById('hotspot-modal');
    const closeModalBtn = document.getElementById('close-modal');
    const modalIcon = document.getElementById('modal-icon');
    const modalCategory = document.getElementById('modal-category');
    const modalTitle = document.getElementById('modal-title');
    const modalDesc = document.getElementById('modal-desc');
    const btnDetails = document.getElementById('modal-btn-details');
    const btn360 = document.getElementById('modal-btn-360');

    // 1. Render Sidebar Navigation
    function renderSidebar() {
        sidebar.innerHTML = maps.map(m => {
            const isActive = m.id === activeMapId;
            const bgClass = isActive ? "bg-primary text-white shadow-lg" : "bg-white text-on-surface hover:bg-surface-container border border-outline-variant/20";
            const iconClass = isActive ? "text-white" : "text-primary";
            const statsClass = isActive ? "text-white/80" : "text-on-surface-variant";

            return `
                <button data-id="${m.id}" class="w-full text-left p-4 md:p-5 rounded-2xl transition-all duration-300 flex items-center justify-between group ${bgClass}">
                    <div>
                        <h3 class="font-bold text-lg pointer-events-none">${m.name}</h3>
                        <p class="text-sm pointer-events-none ${statsClass}">${m.stats}</p>
                    </div>
                    <div class="w-10 h-10 rounded-full flex items-center justify-center bg-black/5 pointer-events-none">
                        <span class="material-symbols-outlined ${iconClass} pointer-events-none">map</span>
                    </div>
                </button>
            `;
        }).join('');

        // Attach listeners
        sidebar.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                if (id !== activeMapId) {
                    activeMapId = id;
                    closeModal(); // Close any open modal
                    renderSidebar(); // Update active states
                    loadMap();
                }
            });
        });
    }

    // 2. Load Active Map Data
    function loadMap() {
        const currentMap = maps.find(m => m.id === activeMapId);
        if (!currentMap) return;

        // Update Placeholder UI
        placeholderTitle.textContent = currentMap.name;
        
        // Update gradient background (remove old ones, add new ones)
        mapContainer.className = `relative w-full aspect-square md:aspect-[4/3] rounded-[24px] overflow-hidden transition-all duration-500 ${currentMap.imagePlaceholder}`;

        // Render Hotspots
        renderHotspots(currentMap.zones);
    }

    // 3. Render Clickable Hotspots
    function renderHotspots(zones) {
        hotspotsLayer.innerHTML = ''; // Clear previous

        if (!zones || zones.length === 0) return;

        // Make layer interactive
        hotspotsLayer.classList.remove('pointer-events-none');
        hotspotsLayer.classList.add('pointer-events-auto');

        zones.forEach(zone => {
            // Find attraction details
            const attraction = data.attractions.find(a => a.id === zone.attractionId);
            if (!attraction) return;

            // Create pin
            const pin = document.createElement('button');
            pin.className = "absolute w-12 h-12 -ml-6 -mt-12 flex items-center justify-center group z-10 transition-transform hover:scale-110 hover:z-20";
            pin.style.left = `${zone.x}%`;
            pin.style.top = `${zone.y}%`;
            pin.setAttribute('aria-label', `View ${attraction.name}`);

            // Pin HTML (Ripple + Icon)
            pin.innerHTML = `
                <div class="absolute inset-0 bg-primary/30 rounded-full animate-ping"></div>
                <div class="relative w-8 h-8 bg-white rounded-full shadow-lg border-2 border-primary flex items-center justify-center">
                    <span class="material-symbols-outlined text-[16px] text-primary">location_on</span>
                </div>
                
                <!-- Tooltip on hover -->
                <div class="absolute top-full mt-2 bg-black/80 backdrop-blur-sm text-white text-xs font-bold py-1 px-3 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    ${attraction.name}
                </div>
            `;

            // Click Event -> Open Modal
            pin.addEventListener('click', (e) => {
                // Prevent event bubbling if necessary
                e.stopPropagation(); 
                openModal(attraction);
            });

            hotspotsLayer.appendChild(pin);
        });
    }

    // 4. Modal Logic
    function openModal(attraction) {
        // Populate Data
        modalTitle.textContent = attraction.name;
        modalCategory.textContent = attraction.category;
        modalDesc.textContent = attraction.shortDescription;
        
        // Icon based on type
        if (attraction.type === 'vr') modalIcon.textContent = 'vrpano';
        else if (attraction.type === 'outdoor') modalIcon.textContent = 'park';
        else modalIcon.textContent = 'attractions';

        // Update Links
        btnDetails.href = `attraction.html?slug=${attraction.slug}`;
        
        if (attraction.slug === 'vr-360') {
            btn360.href = 'vr-360.html';
            btn360.classList.remove('hidden');
        } else {
            btn360.classList.add('hidden');
        }

        // Slide Up
        modal.classList.remove('translate-y-full');
        modal.classList.add('translate-y-0');
        modal.classList.add('pointer-events-auto');
    }

    function closeModal() {
        modal.classList.add('translate-y-full');
        modal.classList.remove('translate-y-0');
        modal.classList.remove('pointer-events-auto');
    }

    closeModalBtn.addEventListener('click', closeModal);

    // Initialize
    renderSidebar();
    loadMap();
});
