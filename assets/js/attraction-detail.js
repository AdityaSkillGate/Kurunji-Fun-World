/**
 * Kurunji Fun World - Dynamic Attraction Detail Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const errorState = document.getElementById('error-state');
    const detailContent = document.getElementById('detail-content');
    
    // Check data availability
    if (typeof window.KurunjiData === 'undefined') {
        console.error("KurunjiData is missing!");
        showError();
        return;
    }

    const data = window.KurunjiData;
    
    // Get Slug
    const params = new URLSearchParams(window.location.search);
    const slug = window.CURRENT_ATTRACTION_SLUG || params.get('slug');

    if (!slug) {
        showError();
        return;
    }

    const attraction = data.helpers.getAttractionBySlug(slug);

    if (!attraction) {
        showError();
        return;
    }

    // Populate Data
    populateDetails(attraction);
    populateRelated(attraction);

    // Show Content
    detailContent.classList.remove('hidden');
    // small delay for transition
    setTimeout(() => {
        detailContent.classList.remove('opacity-0');
    }, 50);

    function showError() {
        errorState.classList.remove('hidden');
        errorState.classList.add('flex');
    }

    function getCategoryIcon(category) {
        const mapping = {
            'Relaxation': 'weekend', 'Interactive': 'touch_app', 'Arcade': 'sports_esports',
            'Sports': 'sports_basketball', 'Claw': 'precision_manufacturing', 'Kids': 'child_care',
            'Kids Play': 'toys', 'Shooter': 'my_location', 'VR': 'vrpano',
            'Simulator': 'flight_takeoff', 'Racing': 'two_wheeler', 'Active': 'fitness_center',
            'Thrill': 'air', 'Challenge': 'sports_gymnastics'
        };
        return mapping[category] || 'local_play';
    }

    function populateDetails(attr) {
        document.getElementById('bread-name').textContent = attr.name;
        document.getElementById('detail-name').textContent = attr.name;
        document.getElementById('detail-desc').textContent = attr.description;
        document.getElementById('hero-icon').textContent = getCategoryIcon(attr.category);
        const heroBg = document.getElementById('hero-bg');
        if (attr.images && attr.images.length > 0) {
            heroBg.style.backgroundImage = `url('${attr.images[0]}')`;
            heroBg.style.backgroundSize = 'cover';
            heroBg.style.backgroundPosition = 'center';
            heroBg.classList.remove('bg-gradient-to-br', 'from-primary-container', 'to-primary');
            document.getElementById('hero-icon').style.display = 'none';
        } else {
            heroBg.style.backgroundImage = `url('https://placehold.co/1200x600/004d40/FFFFFF.png?text=Background')`;
            heroBg.style.backgroundSize = 'cover';
            heroBg.style.backgroundPosition = 'center';
            heroBg.classList.remove('bg-gradient-to-br', 'from-primary-container', 'to-primary');
            document.getElementById('hero-icon').style.display = 'none';
        }
        

        // Badges
        const badgeContainer = document.getElementById('badge-container');
        let typeText = attr.type === 'indoor' ? 'Indoor Experience' : (attr.type === 'outdoor' ? 'Outdoor Experience' : 'VR Experience');
        let floorText = attr.floor === 'ground' ? 'Ground Floor' : (attr.floor === 'first' ? 'First Floor' : (attr.type === 'vr' ? 'VR Arena' : 'Outdoor Area'));
        
        badgeContainer.innerHTML = `
            <span class="bg-white/20 backdrop-blur-md text-white border border-white/30 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                <span class="material-symbols-outlined text-[14px]">${attr.type === 'indoor' ? 'roofing' : (attr.type === 'outdoor' ? 'park' : 'vrpano')}</span> ${typeText}
            </span>
            <span class="bg-white/20 backdrop-blur-md text-white border border-white/30 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                <span class="material-symbols-outlined text-[14px]">layers</span> ${floorText}
            </span>
            <span class="bg-primary text-white border border-primary text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                ${attr.category}
            </span>
        `;

        if (attr.status === 'coming-soon') {
            badgeContainer.innerHTML += `<span class="bg-tertiary-container text-on-tertiary-container text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Coming Soon</span>`;
        }

        // 360 Button
        if (attr.panorama) {
            const btn360 = document.getElementById('btn-360');
            btn360.classList.remove('hidden');
            btn360.classList.add('flex');
            btn360.onclick = () => window.open(attr.panorama, '_blank');
        }

        // Media
        const mediaGrid = document.getElementById('media-grid');
        const mediaEmpty = document.getElementById('media-empty');

        if (attr.images && attr.images.length > 0) {
            mediaEmpty.classList.add('hidden');
            mediaGrid.classList.remove('hidden');
            
            mediaGrid.innerHTML = attr.images.slice(0, 4).map(img => `
                <div class="rounded-xl overflow-hidden aspect-video bg-surface-container">
                    <img src="${img}" alt="${attr.name}" class="w-full h-full object-cover" />
                </div>
            `).join('');
        } else {
            // Empty state stays visible
        }
    }

    function populateRelated(currentAttr) {
        const relatedGrid = document.getElementById('related-grid');
        
        // Find related: Same floor or same type, excluding current, limit to 4
        let related = data.attractions.filter(a => 
            a.id !== currentAttr.id && 
            a.status === 'active' && 
            (a.floor === currentAttr.floor || a.type === currentAttr.type)
        );

        // Shuffle and pick 4
        related = related.sort(() => 0.5 - Math.random()).slice(0, 4);

        if (related.length === 0) {
            document.querySelector('#related-grid').parentElement.parentElement.classList.add('hidden');
            return;
        }

        const gradients = [
            'from-cyan-500 to-blue-500', 'from-purple-500 to-pink-500',
            'from-orange-400 to-red-500', 'from-green-400 to-emerald-600'
        ];

        relatedGrid.innerHTML = related.map((item, index) => {
            const grad = gradients[index % gradients.length];
            const icon = getCategoryIcon(item.category);
            return `
                <a href="attraction-${item.slug}.html" class="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-outline-variant/20 flex flex-col group block cursor-pointer">
                    <div class="relative h-32 bg-gradient-to-br ${grad} flex items-center justify-center">
                        <span class="material-symbols-outlined text-white/50 text-5xl group-hover:scale-110 transition-transform">${icon}</span>
                    </div>
                    <div class="p-4">
                        <h3 class="font-bold text-on-surface line-clamp-1 mb-1">${item.name}</h3>
                        <p class="text-xs text-on-surface-variant line-clamp-1">${item.shortDescription}</p>
                    </div>
                </a>
            `;
        }).join('');
    }
});
