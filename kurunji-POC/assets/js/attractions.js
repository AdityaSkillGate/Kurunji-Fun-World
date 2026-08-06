document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('attractions-grid');
    const filterContainer = document.getElementById('attractions-filter');
    const modal = document.getElementById('attraction-modal');
    const modalContent = document.getElementById('modal-content-container');
    const closeModalBtn = document.getElementById('close-modal');

    // Extract unique categories (including 'All')
    const categories = ['All', ...new Set(attractionsData.map(a => a.category))];

    // Initialize state
    let activeCategory = 'All';

    // Render Filters
    function renderFilters() {
        if (!filterContainer) return;
        filterContainer.innerHTML = '';
        categories.forEach(category => {
            const btn = document.createElement('button');
            
            // Apply styling classes based on active state
            if (category === activeCategory) {
                btn.className = 'px-6 py-2 rounded-full bg-primary text-white text-sm font-bold shadow-md transition-all whitespace-nowrap';
            } else {
                btn.className = 'px-6 py-2 rounded-full bg-surface-container hover:bg-primary-container/30 text-on-surface text-sm font-semibold transition-all whitespace-nowrap';
            }
            
            btn.textContent = category;
            btn.addEventListener('click', () => {
                activeCategory = category;
                renderFilters();
                renderCards();
            });
            filterContainer.appendChild(btn);
        });
    }

    // Render Attraction Cards
    function renderCards() {
        if (!grid) return;
        grid.innerHTML = '';
        
        const filtered = activeCategory === 'All' 
            ? attractionsData 
            : attractionsData.filter(a => a.category === activeCategory);

        if (filtered.length === 0) {
            grid.innerHTML = '<p class="col-span-full text-center text-on-surface-variant py-12">No attractions found for this category.</p>';
            return;
        }

        filtered.forEach(attraction => {
            // Determine category color tag based on category
            let catColorClass = 'bg-primary/20 text-primary-fixed';
            if(attraction.category === 'Kids') catColorClass = 'bg-tertiary-container/50 text-tertiary-fixed';
            if(attraction.category === 'Interactive') catColorClass = 'bg-secondary/20 text-secondary-fixed';
            if(attraction.category === 'Family') catColorClass = 'bg-primary/20 text-primary-fixed';

            const card = document.createElement('div');
            card.className = 'group relative rounded-[2rem] overflow-hidden bg-white shadow-md hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer border border-outline-variant/30 h-full';
            
            let html = `
                <div class="relative h-64 overflow-hidden">
                    <div class="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-700" style="background-image: url('${attraction.image}')" alt="${attraction.name}"></div>
                    ${attraction.has360 ? `
                        <div class="absolute top-4 right-4 bg-black/50 backdrop-blur-md px-2 py-1 rounded-full flex items-center gap-1 border border-white/20 shadow-sm">
                            <span class="material-symbols-outlined text-[12px] text-white">360</span>
                            <span class="text-[8px] font-bold text-white uppercase tracking-wider">360°</span>
                        </div>
                    ` : ''}
                </div>
                <div class="p-6 flex flex-col flex-grow">
                    <span class="${catColorClass} px-3 py-1 rounded-full text-[10px] uppercase font-bold mb-3 self-start border border-current/10">${attraction.category}</span>
                    <h3 class="font-headline-sm text-headline-sm text-on-surface mb-2">${attraction.name}</h3>
                    <p class="text-on-surface-variant text-sm mb-6 flex-grow">${attraction.shortDescription}</p>
                    
                    <button class="w-full py-3 rounded-xl bg-surface-container-low text-primary font-bold group-hover:bg-primary group-hover:text-white transition-colors flex items-center justify-center gap-2">
                        View Details <span class="material-symbols-outlined text-sm">arrow_forward</span>
                    </button>
                </div>
            `;
            
            card.innerHTML = html;
            card.addEventListener('click', () => openModal(attraction));
            grid.appendChild(card);
        });
    }

    // Open Modal
    function openModal(attraction) {
        if (!modal || !modalContent) return;
        
        let html = `
            <div class="w-full h-64 md:h-80 bg-cover bg-center" style="background-image: url('${attraction.image}')"></div>
            <div class="p-8">
                <div class="flex flex-wrap items-center justify-between gap-4 mb-4">
                    <h2 class="font-headline-md text-headline-md text-on-surface">${attraction.name}</h2>
                    <span class="bg-surface-container px-3 py-1 rounded-full text-xs font-bold text-on-surface-variant flex items-center gap-1">
                        <span class="material-symbols-outlined text-[14px]">info</span>
                        ${attraction.suitability}
                    </span>
                </div>
                
                <p class="text-on-surface-variant text-body-lg mb-8 leading-relaxed">
                    ${attraction.fullDescription}
                </p>
                
                <div class="flex flex-col sm:flex-row gap-4 border-t border-outline-variant/30 pt-6 mt-auto">
                    ${attraction.has360 ? `
                        <a href="index.html#360-tour" class="flex-1 py-4 rounded-xl bg-charcoal-premium text-white font-bold hover:bg-black transition-colors flex items-center justify-center gap-2 text-center">
                            <span class="material-symbols-outlined">360</span> View in 360°
                        </a>
                    ` : ''}
                    <a href="index.html#plan" class="flex-1 py-4 rounded-xl bg-primary text-white font-bold btn-primary-gradient hover:scale-105 transition-transform flex items-center justify-center gap-2 text-center">
                        Plan Your Visit
                    </a>
                </div>
            </div>
        `;
        
        modalContent.innerHTML = html;
        modal.classList.remove('opacity-0', 'pointer-events-none');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    // Close Modal
    function closeModalFunc() {
        if (!modal) return;
        modal.classList.add('opacity-0', 'pointer-events-none');
        document.body.style.overflow = '';
    }

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeModalFunc);
    }

    // Close on backdrop click
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModalFunc();
            }
        });
    }

    // Initialize
    if (typeof attractionsData !== 'undefined') {
        renderFilters();
        renderCards();
    }
});
