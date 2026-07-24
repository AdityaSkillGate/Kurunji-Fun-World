document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('gallery-grid');
    const filterContainer = document.getElementById('gallery-filter');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const closeLightboxBtn = document.getElementById('close-lightbox');
    const prevBtn = document.getElementById('lightbox-prev');
    const nextBtn = document.getElementById('lightbox-next');
    const view360Btn = document.getElementById('lightbox-360-btn');

    // Define categories
    const categories = ['All', 'Attractions', 'Family Fun', 'Kids', 'Inside the Park'];
    let activeCategory = 'All';

    let currentImageIndex = 0;
    let filteredData = [...galleryData];

    // Render Filters
    function renderFilters() {
        if (!filterContainer) return;
        filterContainer.innerHTML = '';
        categories.forEach(category => {
            const btn = document.createElement('button');
            if (category === activeCategory) {
                btn.className = 'px-6 py-2 rounded-full bg-primary text-white text-sm font-bold shadow-md transition-all whitespace-nowrap';
            } else {
                btn.className = 'px-6 py-2 rounded-full bg-surface-container hover:bg-primary-container/30 text-on-surface text-sm font-semibold transition-all whitespace-nowrap';
            }
            btn.textContent = category;
            btn.addEventListener('click', () => {
                activeCategory = category;
                renderFilters();
                renderGallery();
            });
            filterContainer.appendChild(btn);
        });
    }

    // Render Gallery (Masonry CSS will handle the layout)
    function renderGallery() {
        if (!grid) return;
        grid.innerHTML = '';
        
        filteredData = activeCategory === 'All' 
            ? galleryData 
            : galleryData.filter(item => item.categories.includes(activeCategory));

        if (filteredData.length === 0) {
            grid.innerHTML = '<p class="col-span-full text-center text-on-surface-variant py-12">No images found for this category.</p>';
            return;
        }

        filteredData.forEach((item, index) => {
            const wrapper = document.createElement('div');
            wrapper.className = 'relative group rounded-[1.5rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer mb-6 inline-block w-full break-inside-avoid';
            
            const img = document.createElement('img');
            img.src = item.url;
            img.alt = item.alt;
            img.loading = 'lazy';
            img.className = 'w-full h-auto transform group-hover:scale-105 transition-transform duration-700 block';

            const overlay = document.createElement('div');
            overlay.className = 'absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center';
            overlay.innerHTML = '<span class="material-symbols-outlined text-white text-4xl transform scale-50 group-hover:scale-100 transition-transform duration-300">fullscreen</span>';

            wrapper.appendChild(img);
            wrapper.appendChild(overlay);

            if (item.has360) {
                const badge = document.createElement('div');
                badge.className = 'absolute top-3 right-3 bg-black/50 backdrop-blur-md px-2 py-1 rounded-full flex items-center gap-1 border border-white/20 z-10 pointer-events-none shadow-sm';
                badge.innerHTML = '<span class="material-symbols-outlined text-[12px] text-white">360</span><span class="text-[8px] font-bold text-white uppercase tracking-wider">360°</span>';
                wrapper.appendChild(badge);
            }

            wrapper.addEventListener('click', () => openLightbox(index));
            grid.appendChild(wrapper);
        });
    }

    // Lightbox Logic
    function openLightbox(index) {
        if (!lightbox) return;
        currentImageIndex = index;
        updateLightboxContent();
        
        lightbox.classList.remove('opacity-0', 'pointer-events-none');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        if (!lightbox) return;
        lightbox.classList.add('opacity-0', 'pointer-events-none');
        document.body.style.overflow = '';
    }

    function updateLightboxContent() {
        const item = filteredData[currentImageIndex];
        lightboxImg.src = item.url;
        lightboxImg.alt = item.alt;
        lightboxCaption.textContent = item.alt;
        
        if (item.has360 && view360Btn) {
            view360Btn.classList.remove('hidden');
            view360Btn.classList.add('flex');
        } else if (view360Btn) {
            view360Btn.classList.add('hidden');
            view360Btn.classList.remove('flex');
        }
    }

    function nextImage(e) {
        if (e) e.stopPropagation();
        currentImageIndex = (currentImageIndex + 1) % filteredData.length;
        updateLightboxContent();
    }

    function prevImage(e) {
        if (e) e.stopPropagation();
        currentImageIndex = (currentImageIndex - 1 + filteredData.length) % filteredData.length;
        updateLightboxContent();
    }

    // Event Listeners for Lightbox
    if (closeLightboxBtn) closeLightboxBtn.addEventListener('click', closeLightbox);
    if (nextBtn) nextBtn.addEventListener('click', nextImage);
    if (prevBtn) prevBtn.addEventListener('click', prevImage);
    
    // Close on backdrop click
    if (lightbox) {
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox || e.target.classList.contains('absolute') && e.target.classList.contains('inset-0')) {
                closeLightbox();
            }
        });
    }

    // Keyboard Navigation
    document.addEventListener('keydown', (e) => {
        if (lightbox && !lightbox.classList.contains('opacity-0')) {
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowRight') nextImage();
            if (e.key === 'ArrowLeft') prevImage();
        }
    });

    // Touch Swipe Support
    let touchStartX = 0;
    let touchEndX = 0;

    if (lightbox) {
        lightbox.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        lightbox.addEventListener('touchend', e => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });
    }

    function handleSwipe() {
        const minSwipeDistance = 50;
        if (touchEndX < touchStartX - minSwipeDistance) nextImage();
        if (touchEndX > touchStartX + minSwipeDistance) prevImage();
    }

    // Initialize
    if (typeof galleryData !== 'undefined') {
        renderFilters();
        renderGallery();
    }
});
