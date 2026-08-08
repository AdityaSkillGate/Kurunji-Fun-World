/**
 * Kurunji Fun World - Data-Driven Photo + Video System
 */

document.addEventListener('DOMContentLoaded', () => {
    if (typeof window.KurunjiData === 'undefined') {
        console.error("KurunjiData not found!");
        return;
    }

    const grid = document.getElementById('gallery-grid');
    const filterContainer = document.getElementById('gallery-filter');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const closeLightboxBtn = document.getElementById('close-lightbox');
    const prevBtn = document.getElementById('lightbox-prev');
    const nextBtn = document.getElementById('lightbox-next');
    const exploreBtn = document.getElementById('lightbox-explore-btn');
    const view360Btn = document.getElementById('lightbox-360-btn');

    // Lightbox Video Container
    let lightboxVideo = null;
    const imgContainer = lightboxImg.parentElement;

    // 1. Extract Media from Attractions
    let mediaItems = [];
    const attractions = window.KurunjiData.helpers.getAllActive();

    attractions.forEach(attraction => {
        // Semantic alt base
        const altBase = `${attraction.name} - ${attraction.category}`;

        // Photos
        if (attraction.images && attraction.images.length > 0) {
            attraction.images.forEach((url, index) => {
                mediaItems.push({
                    type: 'photo',
                    url: url,
                    alt: `Photo of ${altBase} (${index + 1})`,
                    attraction: attraction
                });
            });
        }

        // Videos
        if (attraction.videos && attraction.videos.length > 0) {
            attraction.videos.forEach((url, index) => {
                mediaItems.push({
                    type: 'video',
                    url: url, // Assuming direct video URL for now
                    alt: `Video of ${altBase} (${index + 1})`,
                    attraction: attraction
                });
            });
        }
    });

    // 2. Filter Categories
    const categories = ['All', 'Indoor', 'Outdoor', 'VR', 'Ground Floor', 'First Floor', 'Videos', '360'];
    let activeCategory = 'All';
    let filteredData = [...mediaItems];
    let currentImageIndex = 0;

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

    // 3. Filter Logic
    function renderGallery() {
        if (!grid) return;
        grid.innerHTML = '';

        filteredData = mediaItems.filter(item => {
            if (activeCategory === 'All') return true;
            if (activeCategory === 'Videos') return item.type === 'video';
            if (activeCategory === '360') return item.attraction.slug === 'vr-360' || (item.attraction.panorama && item.attraction.panorama !== "");
            if (activeCategory === 'Indoor') return item.attraction.type === 'indoor';
            if (activeCategory === 'Outdoor') return item.attraction.type === 'outdoor';
            if (activeCategory === 'VR') return item.attraction.type === 'vr';
            if (activeCategory === 'Ground Floor') return item.attraction.floor === 'ground';
            if (activeCategory === 'First Floor') return item.attraction.floor === 'first';
            return true;
        });

        if (filteredData.length === 0) {
            grid.innerHTML = '<p class="col-span-full text-center text-on-surface-variant py-12">No media found for this category.</p>';
            return;
        }

        filteredData.forEach((item, index) => {
            const wrapper = document.createElement('div');
            wrapper.className = 'relative group rounded-[1.5rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer mb-6 inline-block w-full break-inside-avoid bg-black/5';
            
            // Thumbnail (For videos, if we have a thumbnail we'd use it, otherwise use a placeholder or the video tag itself. Here we'll use a placeholder for video if URL is not image)
            let thumbUrl = item.url;
            if (item.type === 'video') {
                thumbUrl = 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=600&auto=format&fit=crop'; // Placeholder for video thumb
            }

            const img = document.createElement('img');
            img.src = thumbUrl;
            img.alt = item.alt;
            img.loading = 'lazy';
            
            // Responsive sizing trick for masonry
            // We can append a responsive parameter if using a CDN, but for now just let masonry handle width
            img.className = 'w-full h-auto transform group-hover:scale-105 transition-transform duration-700 block';

            const overlay = document.createElement('div');
            overlay.className = 'absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center';
            const icon = item.type === 'video' ? 'play_circle' : 'fullscreen';
            overlay.innerHTML = `<span class="material-symbols-outlined text-white text-5xl transform scale-50 group-hover:scale-100 transition-transform duration-300">${icon}</span>`;

            wrapper.appendChild(img);
            wrapper.appendChild(overlay);

            // Badges
            if (item.attraction.slug === 'vr-360') {
                const badge = document.createElement('div');
                badge.className = 'absolute top-3 right-3 bg-black/50 backdrop-blur-md px-2 py-1 rounded-full flex items-center gap-1 border border-white/20 z-10 pointer-events-none shadow-sm';
                badge.innerHTML = '<span class="material-symbols-outlined text-[12px] text-white">360</span><span class="text-[8px] font-bold text-white uppercase tracking-wider">360°</span>';
                wrapper.appendChild(badge);
            }

            wrapper.addEventListener('click', () => openLightbox(index));
            grid.appendChild(wrapper);
        });
    }

    // 4. Lightbox Logic
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
        
        // Pause video if playing
        if (lightboxVideo) {
            lightboxVideo.remove();
            lightboxVideo = null;
        }
    }

    function updateLightboxContent() {
        const item = filteredData[currentImageIndex];
        
        // Clean up previous video
        if (lightboxVideo) {
            lightboxVideo.remove();
            lightboxVideo = null;
        }

        if (item.type === 'video') {
            lightboxImg.classList.add('hidden');
            
            lightboxVideo = document.createElement('video');
            lightboxVideo.src = item.url;
            lightboxVideo.controls = true;
            lightboxVideo.autoplay = true;
            lightboxVideo.className = 'max-h-[85vh] max-w-full object-contain mx-auto rounded-lg shadow-2xl';
            imgContainer.insertBefore(lightboxVideo, lightboxImg);
        } else {
            lightboxImg.classList.remove('hidden');
            lightboxImg.src = item.url;
            lightboxImg.alt = item.alt;
        }

        lightboxCaption.textContent = item.alt;
        
        // Update Explore Button
        if (exploreBtn) {
            exploreBtn.href = `attraction.html?slug=${item.attraction.slug}`;
        }
        
        // 360 Button
        if (view360Btn) {
            if (item.attraction.slug === 'vr-360' || item.attraction.panorama) {
                view360Btn.classList.remove('hidden');
                view360Btn.classList.add('flex');
            } else {
                view360Btn.classList.add('hidden');
                view360Btn.classList.remove('flex');
            }
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

    // 5. Events
    if (closeLightboxBtn) closeLightboxBtn.addEventListener('click', closeLightbox);
    if (nextBtn) nextBtn.addEventListener('click', nextImage);
    if (prevBtn) prevBtn.addEventListener('click', prevImage);
    
    // Close on backdrop click
    if (lightbox) {
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox || (e.target.classList.contains('absolute') && e.target.classList.contains('inset-0'))) {
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
    renderFilters();
    renderGallery();
});
