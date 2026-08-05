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
});
