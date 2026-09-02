// handles dynamic rendering of reviews and filters on index.html

document.addEventListener("DOMContentLoaded", () => {
    let currentPage = 1;
    let isLoading = false;

    const grid = document.getElementById("dynamic-reviews-grid");
    const loadMoreBtn = document.getElementById("load-more-reviews");
    const searchInput = document.getElementById("review-search");
    const filterRating = document.getElementById("filter-rating");
    const filterVisitor = document.getElementById("filter-visitor");
    const filterHours = document.getElementById("filter-hours");

    // Load initial data
    if(grid) {
        loadStatistics();
        loadReviews();
    }

    // Event listeners
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener("click", () => {
            if (!isLoading) {
                currentPage++;
                loadReviews(true);
            }
        });
    }

    [searchInput, filterRating, filterVisitor, filterHours].forEach(el => {
        if(el) {
            el.addEventListener("change", () => {
                currentPage = 1;
                loadReviews(false);
            });
            if(el === searchInput) {
                el.addEventListener("keyup", (e) => {
                    if (e.key === "Enter") {
                        currentPage = 1;
                        loadReviews(false);
                    }
                });
            }
        }
    });

    async function loadStatistics() {
        try {
            const stats = await fetchStatistics();
            const avgEl = document.getElementById("stat-avg-rating");
            const totalEl = document.getElementById("stat-total-reviews");
            if (avgEl) avgEl.innerText = stats.averageRating.toFixed(1);
            if (totalEl) totalEl.innerText = stats.totalReviews.toLocaleString();
            
            // Homepage Preview Stats
            const pVisitors = document.getElementById("preview-visitors");
            const pRating = document.getElementById("preview-rating");
            const pCategory = document.getElementById("preview-category");
            const pRepeat = document.getElementById("preview-repeat");
            
            if (pVisitors) pVisitors.innerText = stats.visitorsMonthly.toLocaleString();
            if (pRating) pRating.innerText = stats.averageRating.toFixed(1);
            if (pCategory) pCategory.innerText = stats.mostLovedCategory;
            if (pRepeat) pRepeat.innerText = stats.repeatVisitorRate + '%';
        } catch (e) {
            console.error("Failed to load statistics");
        }
    }

    async function loadReviews(append = false) {
        if (isLoading) return;
        isLoading = true;

        if (!append) {
            grid.innerHTML = `<div class="col-span-1 md:col-span-3 text-center py-10">
                <span class="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
            </div>`;
            if (loadMoreBtn) loadMoreBtn.classList.add("hidden");
        } else {
            const btnText = loadMoreBtn.innerText;
            loadMoreBtn.innerHTML = '<span class="material-symbols-outlined animate-spin">progress_activity</span> Loading...';
            loadMoreBtn.dataset.originalText = btnText;
        }

        const filters = {
            search: searchInput ? searchInput.value : "",
            rating: filterRating ? filterRating.value : "all",
            visitorType: filterVisitor ? filterVisitor.value : "all",
            hours: filterHours ? filterHours.value : "all"
        };

        try {
            const result = await fetchReviews(filters, currentPage);
            
            if (!append) {
                grid.innerHTML = "";
            }

            if (result.reviews.length === 0 && !append) {
                grid.innerHTML = `<div class="col-span-1 md:col-span-3 text-center py-10 text-on-surface-variant bg-white rounded-3xl border border-outline-variant/20 shadow-sm">
                    <span class="material-symbols-outlined text-5xl mb-3 opacity-50">search_off</span>
                    <h3 class="font-bold text-xl mb-2">No reviews found</h3>
                    <p>Try adjusting your filters or search terms.</p>
                </div>`;
            } else {
                result.reviews.forEach(review => {
                    const stars = Array(5).fill(0).map((_, i) => 
                        `<span class="material-symbols-outlined text-lg ${i < review.rating ? 'text-tertiary' : 'text-outline-variant/30'}" style="font-variation-settings: 'FILL' ${i < review.rating ? 1 : 0}">star</span>`
                    ).join('');

                    const verifiedBadge = review.verified ? 
                        `<span class="bg-secondary/10 text-secondary text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 uppercase tracking-wider"><span class="material-symbols-outlined text-[12px]">verified</span> Verified</span>` : '';

                    let colorClass = "bg-primary-container";
                    if(review.type === "Tourist") colorClass = "bg-secondary-container";
                    else if(review.type === "Corporate") colorClass = "bg-tertiary-container";
                    
                    const avatarLetter = review.name.charAt(0).toUpperCase();

                    const html = `
                        <div class="bg-white p-8 rounded-3xl shadow-sm border border-outline-variant/20 hover:-translate-y-2 hover:shadow-xl transition-all duration-300 flex flex-col h-full animate-fade-in">
                            <div class="flex justify-between items-start mb-6">
                                <div class="flex gap-1">${stars}</div>
                                ${verifiedBadge}
                            </div>
                            <p class="font-body-lg text-on-surface-variant italic mb-8 flex-grow">"${review.text}"</p>
                            <div class="flex items-center justify-between border-t border-outline-variant/20 pt-6">
                                <div class="flex items-center gap-4">
                                    <div class="w-10 h-10 rounded-full ${colorClass} flex items-center justify-center text-white font-bold">${avatarLetter}</div>
                                    <div>
                                        <h5 class="font-bold text-on-surface text-sm">${review.name}</h5>
                                        <p class="text-[10px] uppercase tracking-wider text-on-surface-variant">${review.type} • ${review.hours} Hrs</p>
                                    </div>
                                </div>
                                <div class="text-[10px] text-outline-variant font-bold uppercase tracking-wider">${review.source || 'Website'}</div>
                            </div>
                        </div>
                    `;
                    grid.insertAdjacentHTML("beforeend", html);
                });
            }

            if (loadMoreBtn) {
                if (result.hasMore) {
                    loadMoreBtn.classList.remove("hidden");
                    if (append) loadMoreBtn.innerHTML = loadMoreBtn.dataset.originalText;
                } else {
                    loadMoreBtn.classList.add("hidden");
                }
            }
        } catch (e) {
            console.error(e);
            if (!append) {
                grid.innerHTML = `<div class="col-span-1 md:col-span-3 text-center py-10 text-error">
                    Failed to load reviews. Please try again later.
                </div>`;
            }
        } finally {
            isLoading = false;
        }
    }
});
