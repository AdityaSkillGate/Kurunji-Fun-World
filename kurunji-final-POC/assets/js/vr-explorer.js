/**
 * Kurunji Fun World - VR Theme Explorer Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    // Ensure KurunjiData is loaded
    if (typeof window.KurunjiData === 'undefined') {
        console.error("KurunjiData not found!");
        return;
    }

    const data = window.KurunjiData;
    const themes = data.vrThemes.filter(t => t.status === 'active');
    const TOTAL_THEMES_EXPECTED = 40;

    // DOM Elements
    const gridContainer = document.getElementById('vr-grid');
    const filtersContainer = document.getElementById('vr-filters');
    const searchInput = document.getElementById('vr-search');
    const featuredSpotlight = document.getElementById('featured-spotlight');
    const remainingCountEl = document.getElementById('remaining-count');

    // State
    let currentFilter = 'all';
    let searchQuery = '';

    // Update Placeholder Count
    if (remainingCountEl) {
        let remaining = TOTAL_THEMES_EXPECTED - themes.length;
        remainingCountEl.textContent = remaining > 0 ? remaining : 0;
    }

    // Dynamic Filter Generation
    function generateFilters() {
        // Extract unique categories
        const categories = new Set();
        themes.forEach(theme => {
            if (theme.category) categories.add(theme.category);
        });

        const sortedCategories = Array.from(categories).sort();

        sortedCategories.forEach(cat => {
            const btn = document.createElement('button');
            btn.setAttribute('data-filter', cat);
            btn.className = "px-6 py-2.5 rounded-full font-bold transition-all bg-white/10 text-surface-variant hover:bg-white/20 border border-transparent";
            btn.textContent = cat;
            filtersContainer.appendChild(btn);
        });

        // Add Event Listeners to all buttons (including 'All Themes' which is hardcoded)
        const allBtns = filtersContainer.querySelectorAll('button');
        allBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                currentFilter = e.target.getAttribute('data-filter');
                
                // Update active state
                allBtns.forEach(b => {
                    if (b.getAttribute('data-filter') === currentFilter) {
                        b.className = "px-6 py-2.5 rounded-full font-bold transition-all bg-primary-fixed text-charcoal-premium shadow-md";
                    } else {
                        b.className = "px-6 py-2.5 rounded-full font-bold transition-all bg-white/10 text-surface-variant hover:bg-white/20 border border-transparent";
                    }
                });

                renderGrid();
            });
        });
    }

    function getGradientClass(index) {
        const gradients = [
            'from-indigo-600 to-purple-600',
            'from-blue-600 to-cyan-500',
            'from-fuchsia-600 to-pink-500',
            'from-teal-500 to-emerald-500'
        ];
        return gradients[index % gradients.length];
    }

    function createFeaturedSpotlight() {
        const featured = themes.filter(t => t.featured);
        if (featured.length === 0) return;
        
        // Pick random featured theme
        const theme = featured[Math.floor(Math.random() * featured.length)];
        
        featuredSpotlight.classList.remove('hidden');
        featuredSpotlight.innerHTML = `
            <div class="relative w-full h-[300px] md:h-[400px] rounded-[32px] overflow-hidden bg-gradient-to-br from-indigo-900 to-purple-900 border border-white/10 group flex items-center justify-center">
                <!-- Abstract VR grid -->
                <div class="absolute inset-0 opacity-20" style="background-image: linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px); background-size: 40px 40px;"></div>
                
                <span class="material-symbols-outlined text-white/20 text-[150px] absolute right-10 bottom-10 group-hover:scale-110 transition-transform duration-700">vrpano</span>
                
                <div class="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent p-8 md:p-14 flex flex-col justify-center">
                    <span class="inline-block bg-primary-fixed text-charcoal-premium text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4 w-max shadow-[0_0_15px_rgba(74,215,242,0.5)]">
                        Featured Theme
                    </span>
                    <h3 class="text-4xl md:text-6xl font-display-lg text-white font-bold mb-4 drop-shadow-lg">${theme.name}</h3>
                    <p class="text-surface-variant text-lg md:text-xl max-w-xl mb-8">${theme.shortDescription}</p>
                </div>
            </div>
        `;
    }

    function createCardHTML(theme, index) {
        const gradient = getGradientClass(index);
        
        return `
            <div class="bg-white/5 rounded-3xl overflow-hidden backdrop-blur-sm border border-white/10 hover:border-primary-fixed/50 transition-all duration-300 group flex flex-col">
                <div class="relative h-48 bg-gradient-to-br ${gradient} flex items-center justify-center overflow-hidden">
                    <span class="material-symbols-outlined text-white/30 text-7xl group-hover:scale-125 transition-transform duration-500">vrpano</span>
                    <div class="absolute bottom-4 left-4">
                        <span class="bg-black/50 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-full border border-white/20 uppercase tracking-widest">
                            ${theme.category}
                        </span>
                    </div>
                </div>
                <div class="p-6 flex flex-col flex-grow">
                    <h3 class="text-xl font-bold text-white mb-2 line-clamp-1">${theme.name}</h3>
                    <p class="text-surface-variant text-sm flex-grow mb-6">${theme.shortDescription}</p>
                </div>
            </div>
        `;
    }

    function renderGrid() {
        let items = [...themes];

        if (currentFilter !== 'all') {
            items = items.filter(t => t.category === currentFilter);
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            items = items.filter(item => {
                return item.name.toLowerCase().includes(query) || 
                       (item.shortDescription && item.shortDescription.toLowerCase().includes(query));
            });
        }

        if (items.length === 0) {
            gridContainer.innerHTML = `
                <div class="col-span-full py-20 text-center flex flex-col items-center">
                    <span class="material-symbols-outlined text-6xl text-white/20 mb-4">search_off</span>
                    <h3 class="text-2xl font-bold text-white mb-2">No themes found</h3>
                    <p class="text-surface-variant">Try adjusting your filters or search term.</p>
                </div>
            `;
        } else {
            gridContainer.innerHTML = items.map((item, index) => createCardHTML(item, index)).join('');
        }
    }

    // Search input handler
    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        renderGrid();
    });

    // Initialize
    generateFilters();
    createFeaturedSpotlight();
    renderGrid();
});
