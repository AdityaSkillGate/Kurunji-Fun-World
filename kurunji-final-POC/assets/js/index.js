document.addEventListener('DOMContentLoaded', async () => {
    // Fetch and populate stats dynamically for the home page
    if (typeof fetchStatistics === 'function') {
        try {
            const stats = await fetchStatistics();
            if (stats) {
                const visitorsEl = document.getElementById('preview-visitors');
                const ratingEl = document.getElementById('preview-rating');
                const categoryEl = document.getElementById('preview-category');
                const repeatEl = document.getElementById('preview-repeat');
                
                if (visitorsEl && stats.visitorsMonthly) visitorsEl.innerText = stats.visitorsMonthly;
                if (ratingEl && stats.averageRating) ratingEl.innerText = stats.averageRating;
                if (categoryEl && stats.mostLovedCategory) categoryEl.innerText = stats.mostLovedCategory;
                if (repeatEl && stats.repeatVisitorRate) repeatEl.innerText = stats.repeatVisitorRate + '%';
            }
        } catch (error) {
            console.error("Failed to load home page statistics:", error);
        }
    }

    // Fetch and populate public feedbacks
    if (typeof fetchPublicFeedbacks === 'function') {
        try {
            const data = await fetchPublicFeedbacks();
            if (data && data.feedbacks && data.feedbacks.length > 0) {
            const reviewsContainer = document.getElementById('reviews-container');
            if (reviewsContainer) {
                reviewsContainer.innerHTML = ''; // clear static reviews
                // Pad with default reviews if we have less than 3
                const defaultReviews = [
                    { guest: "Ananya R.", rating: 5, comments: "Absolutely the best thing to do in Kodai with kids! We spent 4 hours here and still didn't finish everything. The zip-line is surprisingly thrilling.", initial: 'A' },
                    { guest: "Vikram S.", rating: 5, comments: "Great escape from the rain. The VR arena is top-notch. Clean, professional staff, and very well maintained indoor environment.", initial: 'V' },
                    { guest: "Meera T.", rating: 5, comments: "Highly recommend the group packages! We came here for a team outing and the competitive arcade games were an absolute blast.", initial: 'M' }
                ];

                // Fetch up to 10 latest reviews
                let displayReviews = data.feedbacks ? data.feedbacks.slice(0, 10) : [];
                while (displayReviews.length < 3) {
                    displayReviews.push(defaultReviews[displayReviews.length]);
                }

                displayReviews.forEach(r => {
                    const initial = r.initial || (r.guest ? r.guest.charAt(0).toUpperCase() : 'G');
                    const commentText = r.comments ? r.comments : "Wonderful experience! Highly recommended to everyone visiting Kodaikanal.";
                    
                    let starsHtml = '';
                    const rating = parseInt(r.rating) || 5;
                    for(let i=0; i<5; i++) {
                        if(i < rating) starsHtml += `<span class="material-symbols-outlined text-lg" style="font-variation-settings: 'FILL' 1">star</span>`;
                        else starsHtml += `<span class="material-symbols-outlined text-lg">star</span>`;
                    }

                    const card = document.createElement('div');
                    card.className = "flex-none w-full md:w-[calc(33.333%-1.33rem)] snap-center bg-white p-8 rounded-3xl shadow-md border border-outline-variant/10 hover:-translate-y-2 hover:shadow-xl transition-all duration-300";
                    card.innerHTML = `
                        <div class="flex gap-1 text-tertiary mb-6">
                            ${starsHtml}
                        </div>
                        <p class="font-body-lg text-on-surface-variant italic mb-8">"${commentText}"</p>
                        <div class="flex items-center gap-4 border-t border-outline-variant/20 pt-6">
                            <div class="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center text-primary font-bold text-xl">${initial}</div>
                            <div>
                            <h5 class="font-bold text-on-surface">${r.guest || 'Guest'}</h5>
                            <p class="text-xs text-on-surface-variant">Verified Visitor</p>
                            </div>
                        </div>
                    `;
                    reviewsContainer.appendChild(card);
                });

                // Scroll arrows logic
                const prevBtn = document.getElementById('reviews-prev');
                const nextBtn = document.getElementById('reviews-next');
                
                if (prevBtn && nextBtn) {
                    prevBtn.addEventListener('click', () => {
                        reviewsContainer.scrollBy({ left: -reviewsContainer.offsetWidth / 1.5, behavior: 'smooth' });
                    });
                    nextBtn.addEventListener('click', () => {
                        reviewsContainer.scrollBy({ left: reviewsContainer.offsetWidth / 1.5, behavior: 'smooth' });
                    });
                }
            }
            }
        } catch(e) {
            console.error("Failed to load public feedbacks", e);
        }
    }

    // Attraction Filtering
    const filterBtns = document.querySelectorAll('.filter-btn');
    const attractionCards = document.querySelectorAll('.attraction-card');

    if (filterBtns.length > 0 && attractionCards.length > 0) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove active classes
                filterBtns.forEach(b => {
                    b.classList.remove('bg-primary', 'text-white', 'font-bold', 'active');
                    b.classList.add('bg-surface-container', 'text-on-surface', 'font-semibold');
                });
                
                // Add active class to clicked
                btn.classList.add('bg-primary', 'text-white', 'font-bold', 'active');
                btn.classList.remove('bg-surface-container', 'text-on-surface', 'font-semibold');

                const filterValue = btn.getAttribute('data-filter');

                attractionCards.forEach(card => {
                    if (filterValue === 'all' || card.getAttribute('data-category') === filterValue) {
                        card.style.display = 'block';
                        card.style.animation = 'fadeIn 0.5s ease forwards';
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });
    }
});
