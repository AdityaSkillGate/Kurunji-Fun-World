/**
 * Kurunji Fun World - Park Explorer Logic
 * Handles the rendering, filtering, and searching of attractions in the UI.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Ensure KurunjiData is loaded
    if (typeof window.KurunjiData === 'undefined') {
        console.error("KurunjiData not found! Make sure park-data.js is loaded before explorer.js.");
        return;
    }

    const data = window.KurunjiData;
    
    // DOM Elements
    const gridContainer = document.getElementById('attractions-grid');
    const emptyState = document.getElementById('empty-state');
    const searchInput = document.getElementById('explorer-search');
    
    const mainTabs = document.querySelectorAll('#explorer-tabs button');
    const indoorSubTabsContainer = document.getElementById('indoor-sub-tabs');
    const subTabs = document.querySelectorAll('#explorer-subtabs button');

    // State
    let currentFilter = 'all'; // all, indoor, outdoor, vr
    let currentSubFilter = 'all-indoor'; // all-indoor, ground, first
    let searchQuery = '';

    // Initialize Counters
    const countIndoor = document.getElementById('count-indoor'); if (countIndoor) countIndoor.textContent = data.metadata.indoorCount;
    const countOutdoor = document.getElementById('count-outdoor'); if (countOutdoor) countOutdoor.textContent = data.metadata.outdoorCount;
    // VR is dynamic but we have 6 confirmed, let's keep "40+" as requested by design

    /**
     * Map category to Material Icon
     */
    function getCategoryIcon(category) {
        const mapping = {
            'Relaxation': 'weekend',
            'Interactive': 'touch_app',
            'Arcade': 'sports_esports',
            'Sports': 'sports_basketball',
            'Claw': 'precision_manufacturing',
            'Kids': 'child_care',
            'Kids Play': 'toys',
            'Shooter': 'my_location',
            'VR': 'vrpano',
            'Simulator': 'flight_takeoff',
            'Racing': 'two_wheeler',
            'Active': 'fitness_center',
            'Thrill': 'air',
            'Challenge': 'sports_gymnastics'
        };
        return mapping[category] || 'local_play';
    }

    /**
     * Generate a gradient background class based on ID or index
     */
    function getGradientClass(index) {
        const gradients = [
            'from-cyan-500 to-blue-500',
            'from-purple-500 to-pink-500',
            'from-orange-400 to-red-500',
            'from-green-400 to-emerald-600',
            'from-teal-400 to-cyan-600',
            'from-indigo-500 to-purple-600'
        ];
        return gradients[index % gradients.length];
    }

    /**
     * Create the HTML for a single attraction card
     */
    function createCardHTML(attraction, index) {
        // We don't have real images yet, so we create a beautiful placeholder
        const gradient = getGradientClass(index);
        const icon = getCategoryIcon(attraction.category);
        
        let statusBadge = '';
        if (attraction.status === 'coming-soon') {
            statusBadge = `<div class="absolute top-4 right-4 bg-tertiary-container text-on-tertiary-container text-xs font-bold px-3 py-1 rounded-full shadow-lg border border-white/20">Coming Soon</div>`;
        } else if (attraction.featured) {
            statusBadge = `<div class="absolute top-4 right-4 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1 border border-white/20"><span class="material-symbols-outlined text-[14px]">star</span> Featured</div>`;
        }

        return `
            <div class="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-outline-variant/20 flex flex-col group">
                <!-- Image/Placeholder Area -->
                <div class="relative h-48 bg-gray-200 flex items-center justify-center overflow-hidden" 
                     style="background-image: url('${attraction.images && attraction.images.length > 0 ? attraction.images[0] : 'https://placehold.co/600x400/004d40/FFFFFF.png?text=Preview'}'); background-size: cover; background-position: center;">
                    <div class="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors"></div>
                    ${(!attraction.images || attraction.images.length === 0) ? `<span class="material-symbols-outlined text-white/80 text-6xl group-hover:scale-110 transition-transform duration-500 drop-shadow-md">${icon}</span>` : ''}
                    ${statusBadge}
                    
                    <!-- Floor Badge -->
                    <div class="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/60 to-transparent pt-8 pb-3 px-4">
                        <span class="text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                            <span class="material-symbols-outlined text-[16px]">${attraction.type === 'indoor' ? 'roofing' : (attraction.type === 'outdoor' ? 'park' : 'vrpano')}</span>
                            ${attraction.floor === 'ground' ? 'Ground Floor' : (attraction.floor === 'first' ? 'First Floor' : (attraction.type === 'vr' ? 'VR Arena' : 'Outdoor'))}
                        </span>
                    </div>
                </div>
                
                <!-- Content Area -->
                <div class="p-5 flex flex-col flex-grow">
                    <div class="flex justify-between items-start mb-2">
                        <h3 class="text-lg font-bold text-on-surface line-clamp-1">${attraction.name}</h3>
                    </div>
                    
                    <span class="inline-block bg-surface-container text-on-surface-variant text-[11px] font-bold px-2 py-1 rounded uppercase tracking-wide mb-3 w-max">
                        ${attraction.category}
                    </span>
                    
                    <p class="text-on-surface-variant text-sm flex-grow line-clamp-2 mb-4">
                        ${attraction.shortDescription}
                    </p>
                    
                    ${attraction.slug === 'vr-360' ? 
                        `<a href="vr-360.html" class="w-full mt-auto py-2.5 rounded-lg border border-primary text-primary font-bold hover:bg-primary hover:text-white transition-colors flex items-center justify-center gap-2">Explore <span class="material-symbols-outlined text-[18px]">arrow_forward</span></a>` 
                        : 
                        `<a href="attraction-${attraction.slug}.html" class="w-full mt-auto py-2.5 rounded-lg border border-primary text-primary font-bold hover:bg-primary hover:text-white transition-colors flex items-center justify-center gap-2">Explore <span class="material-symbols-outlined text-[18px]">arrow_forward</span></a>`
                    }
                </div>
            </div>
        `;
    }

    /**
     * Create HTML for VR Theme card
     */
    function createVRCardHTML(theme, index) {
        const gradient = getGradientClass(index + 3); // shift gradient
        return `
            <div class="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-outline-variant/20 flex flex-col group">
                <div class="relative h-48 bg-gradient-to-br ${gradient} flex items-center justify-center overflow-hidden">
                    <span class="material-symbols-outlined text-white/50 text-6xl group-hover:scale-110 transition-transform duration-500">vrpano</span>
                    <div class="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/60 to-transparent pt-8 pb-3 px-4">
                        <span class="text-white text-xs font-bold uppercase tracking-wider">VR Experience</span>
                    </div>
                </div>
                <div class="p-5 flex flex-col flex-grow">
                    <h3 class="text-lg font-bold text-on-surface mb-2">${theme.name}</h3>
                    <p class="text-on-surface-variant text-sm flex-grow mb-4">Step into an immersive 360 virtual reality adventure.</p>
                    <a href="vr-360.html" class="w-full mt-auto py-2.5 rounded-lg bg-primary/10 text-primary font-bold hover:bg-primary hover:text-white transition-colors flex items-center justify-center gap-2">
                        View Theme
                    </a>
                </div>
            </div>
        `;
    }

    /**
     * Filter and Render Function
     */
    function renderAttractions() {
        let items = [];
        let isVRMode = false;

        if (currentFilter === 'vr') {
            isVRMode = true;
            items = data.vrThemes.filter(t => t.status === 'active');
        } else {
            items = data.attractions.filter(a => a.status === 'active'); // only show active

            // Apply Main Filter
            if (currentFilter === 'indoor') {
                items = items.filter(a => a.type === 'indoor');
                
                // Apply Sub Filter
                if (currentSubFilter === 'ground') {
                    items = items.filter(a => a.floor === 'ground');
                } else if (currentSubFilter === 'first') {
                    items = items.filter(a => a.floor === 'first');
                }
            } else if (currentFilter === 'outdoor') {
                items = items.filter(a => a.type === 'outdoor');
            }
            // If 'all', keep all
        }

        // Apply Search
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            items = items.filter(item => {
                const nameMatch = item.name.toLowerCase().includes(query);
                const descMatch = item.shortDescription ? item.shortDescription.toLowerCase().includes(query) : false;
                return nameMatch || descMatch;
            });
        }

        // Render to DOM
        if (items.length === 0) {
            gridContainer.innerHTML = '';
            emptyState.classList.remove('hidden');
            emptyState.classList.add('flex');
        } else {
            emptyState.classList.add('hidden');
            emptyState.classList.remove('flex');
            
            gridContainer.innerHTML = items.map((item, index) => {
                return isVRMode ? createVRCardHTML(item, index) : createCardHTML(item, index);
            }).join('');
        }
    }

    /**
     * Handle Main Tab Clicks
     */
    mainTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            const filter = e.target.getAttribute('data-filter');
            currentFilter = filter;

            // Reset sub filter when switching main tabs
            currentSubFilter = 'all-indoor';
            updateSubTabsActiveState();

            // Update Active State of Main Tabs
            mainTabs.forEach(btn => {
                if (btn.getAttribute('data-filter') === filter) {
                    btn.className = "px-6 py-2 rounded-full font-bold transition-all bg-primary text-white shadow-md";
                } else {
                    btn.className = "px-6 py-2 rounded-full font-bold transition-all bg-white text-on-surface-variant hover:bg-surface-container shadow-sm border border-outline-variant/30";
                }
            });

            // Toggle Sub-tabs visibility
            if (filter === 'indoor') {
                indoorSubTabsContainer.classList.remove('hidden');
            } else {
                indoorSubTabsContainer.classList.add('hidden');
            }

            renderAttractions();
        });
    });

    /**
     * Handle Sub Tab Clicks
     */
    subTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            currentSubFilter = e.target.getAttribute('data-subfilter');
            updateSubTabsActiveState();
            renderAttractions();
        });
    });

    function updateSubTabsActiveState() {
        subTabs.forEach(btn => {
            if (btn.getAttribute('data-subfilter') === currentSubFilter) {
                btn.className = "px-4 py-1.5 rounded-full text-sm font-bold transition-all bg-primary/20 text-primary";
            } else {
                btn.className = "px-4 py-1.5 rounded-full text-sm font-bold transition-all text-on-surface-variant hover:bg-surface-container border border-transparent";
            }
        });
    }

    /**
     * Handle Search Input
     */
    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        renderAttractions();
    });

    // Initial Render
    renderAttractions();

    // --- Coming Soon System (Phase 9) ---
    const comingSoonGrid = document.getElementById('coming-soon-grid');
    if (comingSoonGrid) {
        const comingSoonItems = data.attractions.filter(a => a.status === 'coming-soon');
        if (comingSoonItems.length === 0) {
            document.getElementById('coming-soon').classList.add('hidden');
        } else {
            comingSoonGrid.innerHTML = comingSoonItems.map((item, index) => {
                const gradient = getGradientClass(index + 5);
                const icon = getCategoryIcon(item.category);
                
                let imageContent = '';
                if (item.images && item.images.length > 0) {
                    imageContent = `
                        <img src="${item.images[0]}" alt="${item.name}" class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                        <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    `;
                } else {
                    imageContent = `
                        <div class="absolute inset-0 bg-gradient-to-br ${gradient}"></div>
                        <span class="material-symbols-outlined text-white/40 text-6xl relative z-10">${icon}</span>
                    `;
                }

                return `
                    <div class="bg-white rounded-2xl overflow-hidden shadow-md border border-outline-variant/30 flex flex-col group opacity-90 hover:opacity-100 transition-all">
                        <div class="relative h-48 flex items-center justify-center grayscale-[20%] overflow-hidden">
                            ${imageContent}
                            <div class="absolute top-4 right-4 bg-black/70 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg border border-white/20 uppercase tracking-widest flex items-center gap-1 z-20 backdrop-blur-sm">
                                <span class="material-symbols-outlined text-[14px]">lock_clock</span> Coming Soon
                            </div>
                        </div>
                        <div class="p-6 flex flex-col flex-grow items-center text-center">
                            <h3 class="text-xl font-bold text-on-surface mb-2">${item.name}</h3>
                            <p class="text-on-surface-variant text-sm flex-grow mb-6">${item.shortDescription}</p>
                            <button class="notify-btn w-full py-3 rounded-xl bg-surface-container-high text-primary font-bold hover:bg-primary hover:text-white transition-colors flex items-center justify-center gap-2 border border-outline-variant/20 shadow-sm" data-id="${item.id}" data-name="${item.name}">
                                <span class="material-symbols-outlined text-sm">notifications_active</span> Notify Me
                            </button>
                        </div>
                    </div>
                `;
            }).join('');

            // Attach event listeners for Notify Me buttons
            document.querySelectorAll('.notify-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = e.currentTarget.getAttribute('data-id');
                    const name = e.currentTarget.getAttribute('data-name');
                    openNotifyModal(id, name);
                });
            });
        }
    }

    // Modal Logic
    const notifyModal = document.getElementById('notify-modal');
    const closeNotifyBtn = document.getElementById('close-notify-modal');
    const notifyOverlay = document.getElementById('notify-overlay');
    const notifyForm = document.getElementById('notify-form');
    
    function openNotifyModal(id, name) {
        if(!notifyModal) return;
        document.getElementById('notify-attraction-id').value = id;
        document.getElementById('notify-attraction-name').textContent = name;
        
        notifyModal.classList.remove('opacity-0', 'pointer-events-none');
        notifyModal.querySelector('.relative').classList.remove('scale-95');
        document.body.style.overflow = 'hidden';
    }

    function closeNotifyModal() {
        if(!notifyModal) return;
        notifyModal.classList.add('opacity-0', 'pointer-events-none');
        notifyModal.querySelector('.relative').classList.add('scale-95');
        document.body.style.overflow = '';
        document.getElementById('notify-feedback').classList.add('hidden');
        notifyForm.reset();
    }

    if(closeNotifyBtn) closeNotifyBtn.addEventListener('click', closeNotifyModal);
    if(notifyOverlay) notifyOverlay.addEventListener('click', closeNotifyModal);

    if(notifyForm) {
        notifyForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const submitBtn = document.getElementById('notify-submit');
            const feedback = document.getElementById('notify-feedback');
            
            // UI Loading state
            submitBtn.innerHTML = '<span class="material-symbols-outlined animate-spin">refresh</span> Submitting...';
            submitBtn.disabled = true;
            submitBtn.classList.add('opacity-70');

            const payload = {
                action: 'submitInterest',
                name: document.getElementById('notify-name').value,
                phone: document.getElementById('notify-phone').value,
                email: document.getElementById('notify-email').value,
                attraction: document.getElementById('notify-attraction-name').textContent
            };

            // Real APPS SCRIPT URL goes here. Using a fetch mock for design phase.
            // fetch('https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec', {
            //     method: 'POST',
            //     mode: 'no-cors', // Because Apps Script often requires no-cors without proper setup
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify(payload)
            // }).then(...)
            
            setTimeout(() => {
                feedback.textContent = 'Thanks! We will notify you when it opens.';
                feedback.className = 'rounded-xl p-4 text-sm font-bold mt-4 bg-secondary-container text-on-secondary-container block';
                submitBtn.innerHTML = '<span class="material-symbols-outlined">check</span> Success';
                
                setTimeout(() => {
                    closeNotifyModal();
                    submitBtn.innerHTML = 'Notify Me';
                    submitBtn.disabled = false;
                    submitBtn.classList.remove('opacity-70');
                }, 2000);
            }, 800);
        });
    }

});

