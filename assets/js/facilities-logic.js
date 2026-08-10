/**
 * Kurunji Fun World - Facilities Experience Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    if (typeof window.KurunjiData === 'undefined' || !window.KurunjiData.facilities) {
        console.error("KurunjiData or facilities not found!");
        return;
    }

    const grid = document.getElementById('facilities-grid');
    if (!grid) return;

    const facilities = window.KurunjiData.facilities;
    grid.innerHTML = ''; // Clear loading state

    facilities.forEach(facility => {
        const card = document.createElement('div');
        card.className = "bg-white p-8 md:p-10 rounded-[2rem] shadow-xl border border-outline-variant/10 flex flex-col items-start gap-4 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 relative overflow-hidden group";

        // Background decorative glow
        const glow = document.createElement('div');
        glow.className = "absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-bl-full z-0 group-hover:scale-110 transition-transform duration-500";
        card.appendChild(glow);

        // Content Wrapper for z-index
        const contentWrapper = document.createElement('div');
        contentWrapper.className = "relative z-10 flex flex-col h-full w-full";

        // Icon
        const iconWrapper = document.createElement('div');
        iconWrapper.className = "w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-white mb-6 shadow-md shadow-primary/20 group-hover:scale-110 transition-transform duration-300 shrink-0";
        iconWrapper.innerHTML = `<span class="material-symbols-outlined text-3xl">${facility.icon}</span>`;
        contentWrapper.appendChild(iconWrapper);

        // Title & Desc
        const title = document.createElement('h3');
        title.className = "font-headline-lg text-2xl text-on-surface mb-3 font-bold";
        title.textContent = facility.name;
        contentWrapper.appendChild(title);

        const desc = document.createElement('p');
        desc.className = "text-on-surface-variant text-lg flex-grow mb-6";
        desc.textContent = facility.description;
        contentWrapper.appendChild(desc);

        // Special 360 CTA for Parking
        if (facility.id === 'F-01' || facility.name.toLowerCase().includes('parking')) {
            const btnWrapper = document.createElement('div');
            btnWrapper.className = "mt-auto pt-4 w-full";
            
            const btn = document.createElement('a');
            btn.href = "tour.html#parking";
            btn.className = "inline-flex items-center justify-between w-full px-6 py-3 rounded-xl bg-surface-container-high text-primary font-bold hover:bg-primary hover:text-white transition-colors border border-outline-variant/20 group/btn";
            btn.innerHTML = `
                <span class="flex items-center gap-2"><span class="material-symbols-outlined text-sm">360</span> Parking 360°</span>
                <span class="material-symbols-outlined text-sm group-hover/btn:translate-x-1 transition-transform">arrow_forward</span>
            `;
            
            btnWrapper.appendChild(btn);
            contentWrapper.appendChild(btnWrapper);
        }

        card.appendChild(contentWrapper);
        grid.appendChild(card);
    });
});
