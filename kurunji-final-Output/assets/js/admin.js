document.addEventListener('DOMContentLoaded', () => {
    // Initial Load
    switchTab('feedbacks');
    
    // Set up event listeners for filters/search
    document.getElementById('fb-search').addEventListener('input', debounce(() => { fbState.page = 1; loadFeedbacks(); }, 500));
    document.getElementById('fb-status-filter').addEventListener('change', () => { fbState.page = 1; loadFeedbacks(); });
    document.getElementById('fb-prev').addEventListener('click', () => { if(fbState.page > 1) { fbState.page--; loadFeedbacks(); }});
    document.getElementById('fb-next').addEventListener('click', () => { if(fbState.hasMore) { fbState.page++; loadFeedbacks(); }});

    document.getElementById('eq-search').addEventListener('input', debounce(() => { eqState.page = 1; loadEnquiries(); }, 500));
    document.getElementById('eq-status-filter').addEventListener('change', () => { eqState.page = 1; loadEnquiries(); });
    document.getElementById('eq-prev').addEventListener('click', () => { if(eqState.page > 1) { eqState.page--; loadEnquiries(); }});
    document.getElementById('eq-next').addEventListener('click', () => { if(eqState.hasMore) { eqState.page++; loadEnquiries(); }});

    // Clock
    setInterval(() => {
        const d = new Date();
        document.getElementById('session-time').innerText = d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'});
    }, 1000);
});

// Routing
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    
    if(sidebar.classList.contains('-translate-x-full')) {
        sidebar.classList.remove('-translate-x-full');
        overlay.classList.remove('hidden');
        // Small delay to allow display:block to apply before animating opacity
        setTimeout(() => overlay.classList.remove('opacity-0'), 10);
    } else {
        sidebar.classList.add('-translate-x-full');
        overlay.classList.add('opacity-0');
        setTimeout(() => overlay.classList.add('hidden'), 300);
    }
}

function switchTab(tabId) {
    // Hide sidebar on mobile when switching tabs
    const sidebar = document.getElementById('sidebar');
    if(window.innerWidth < 768 && !sidebar.classList.contains('-translate-x-full')) {
        toggleSidebar();
    }
    
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.sidebar-link').forEach(el => {
        el.classList.remove('active', 'bg-surface', 'text-primary');
        el.classList.add('text-white', 'hover:bg-white/10');
    });

    document.getElementById('view-' + tabId).classList.add('active');
    const activeBtn = document.getElementById('tab-btn-' + tabId);
    activeBtn.classList.remove('text-white', 'hover:bg-white/10');
    activeBtn.classList.add('active', 'bg-surface', 'text-primary');

    // Title update
    const titles = {
        'feedbacks': 'Feedbacks Management',
        'enquiries': 'Group Enquiries',
        'analytics': 'Analytics & Settings',
        'cms': 'Website Content Management'
    };
    document.getElementById('page-title').innerText = titles[tabId];

    // Load data
    if (tabId === 'feedbacks') loadFeedbacks();
    if (tabId === 'enquiries') loadEnquiries();
    if (tabId === 'analytics') loadAnalytics();
    if (tabId === 'cms') loadCMS();
}

// Utility
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => { clearTimeout(timeout); func(...args); };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function getStatusBadge(status) {
    const s = status.toUpperCase();
    if (s === 'PENDING' || s === 'NEW') return `<span class="bg-yellow-100 text-yellow-800 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">${s}</span>`;
    if (s === 'APPROVED' || s === 'RESOLVED') return `<span class="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">${s}</span>`;
    if (s === 'REJECTED') return `<span class="bg-red-100 text-red-800 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">${s}</span>`;
    if (s === 'CONTACTED') return `<span class="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">${s}</span>`;
    return `<span class="bg-gray-100 text-gray-800 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">${s}</span>`;
}

// Sync Status Helper
function updateSyncStatus(isSuccess) {
    const topText = document.querySelector('header span.text-sm.font-bold');
    const topDot = document.querySelector('header .w-3.h-3.rounded-full');
    const sideText = document.querySelector('#sidebar .bg-black\\/20 span.text-xs.font-bold');
    const sideDot = document.querySelector('#sidebar .w-2.h-2.rounded-full');
    const sideTime = document.getElementById('sync-time');

    if(isSuccess) {
        if(topText) topText.innerText = "Google Sheets DB Sync: Active";
        if(topText) topText.className = "text-sm font-bold text-[#006e25]";
        if(topDot) topDot.className = "w-3 h-3 rounded-full bg-[#5fa14f]";
        if(sideText) sideText.innerText = "Google Sheets Sync";
        if(sideText) sideText.className = "text-xs font-bold text-white";
        if(sideDot) sideDot.className = "w-2 h-2 rounded-full bg-green-400 animate-pulse";
        if(sideTime) sideTime.innerText = "Last update: Just now";
    } else {
        if(topText) topText.innerText = "Google Sheets DB Sync: Failed";
        if(topText) topText.className = "text-sm font-bold text-red-600";
        if(topDot) topDot.className = "w-3 h-3 rounded-full bg-red-500";
        if(sideText) sideText.innerText = "Sync Failed";
        if(sideText) sideText.className = "text-xs font-bold text-red-400";
        if(sideDot) sideDot.className = "w-2 h-2 rounded-full bg-red-500";
        if(sideTime) sideTime.innerText = "Check App Script URL";
    }
}

// ==========================================
// FEEDBACKS VIEW
// ==========================================
let fbState = { page: 1, hasMore: false, total: 0 };

async function loadFeedbacks() {
    const tbody = document.getElementById('fb-table-body');
    tbody.innerHTML = '<tr><td colspan="7" class="text-center py-8"><span class="material-symbols-outlined animate-spin text-primary text-3xl">progress_activity</span></td></tr>';
    
    try {
        const search = document.getElementById('fb-search').value;
        const status = document.getElementById('fb-status-filter').value;
        
        const data = await fetchAdminFeedbacks({ search, status }, fbState.page);
        fbState.hasMore = data.hasMore;
        fbState.total = data.total;
        
        tbody.innerHTML = '';
        if (data.feedbacks.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center py-8 text-on-surface-variant">No feedbacks found.</td></tr>';
        } else {
            data.feedbacks.forEach(f => {
                const stars = '★'.repeat(f.rating) + '☆'.repeat(5 - f.rating);
                tbody.innerHTML += `
                    <tr class="hover:bg-surface/50 transition-colors">
                        <td class="px-6 py-4 font-semibold">${f.id}</td>
                        <td class="px-6 py-4 text-on-surface-variant">${f.date}</td>
                        <td class="px-6 py-4">
                            <p class="font-bold">${f.guest}</p>
                            <p class="text-[10px] text-on-surface-variant">${f.phone} ${f.email || ''}</p>
                        </td>
                        <td class="px-6 py-4 text-yellow-500 text-xs">${stars}</td>
                        <td class="px-6 py-4"><p class="truncate max-w-xs" title="${f.comments}">${f.comments}</p></td>
                        <td class="px-6 py-4 text-center">${getStatusBadge(f.status)}</td>
                        <td class="px-6 py-4 text-right no-print">
                            <select onchange="handleFbStatusChange('${f.id}', this.value)" class="text-xs bg-surface border border-outline-variant rounded py-1 px-2 focus:ring-1 focus:ring-primary outline-none">
                                <option value="" disabled selected>Action</option>
                                <option value="APPROVED">Approve</option>
                                <option value="REJECTED">Reject</option>
                            </select>
                        </td>
                    </tr>
                `;
            });
        }
        
        // Update pagination info
        const start = (fbState.page - 1) * 10 + (data.feedbacks.length > 0 ? 1 : 0);
        const end = start + data.feedbacks.length - (data.feedbacks.length > 0 ? 1 : 0);
        document.getElementById('fb-page-info').innerText = `Showing ${start} to ${end} of ${fbState.total} entries`;
        document.getElementById('fb-prev').disabled = fbState.page === 1;
        document.getElementById('fb-next').disabled = !fbState.hasMore;

        // Populate mock top cards (in reality, another API call might fetch these)
        document.getElementById('fb-total').innerText = "1,284";
        document.getElementById('fb-pending').innerText = "42";
        document.getElementById('fb-enquiries').innerText = "315";
        document.getElementById('fb-rating').innerText = "4.8";
        
        updateSyncStatus(true);

    } catch (e) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center py-8 text-error">Failed to load data.</td></tr>';
        updateSyncStatus(false);
    }
}

async function handleFbStatusChange(id, newStatus) {
    if(!newStatus) return;
    try {
        await updateFeedbackStatus(id, newStatus);
        loadFeedbacks(); // refresh
    } catch (e) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center py-8 text-error">Failed to load data. Ensure Google Apps Script URL is correct.</td></tr>';
        console.error("Error loading feedbacks:", e);
    }
}

// ==========================================
// ENQUIRIES VIEW
// ==========================================
let eqState = { page: 1, hasMore: false, total: 0 };

async function loadEnquiries() {
    const tbody = document.getElementById('eq-table-body');
    tbody.innerHTML = '<tr><td colspan="7" class="text-center py-8"><span class="material-symbols-outlined animate-spin text-primary text-3xl">progress_activity</span></td></tr>';
    
    try {
        const search = document.getElementById('eq-search').value;
        const status = document.getElementById('eq-status-filter').value;
        
        const data = await fetchAdminEnquiries({ search, status }, eqState.page);
        eqState.hasMore = data.hasMore;
        eqState.total = data.total;
        
        tbody.innerHTML = '';
        if (data.enquiries.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center py-8 text-on-surface-variant">No enquiries found.</td></tr>';
        } else {
            data.enquiries.forEach(e => {
                tbody.innerHTML += `
                    <tr class="hover:bg-surface/50 transition-colors">
                        <td class="px-6 py-4 font-semibold">${e.id}</td>
                        <td class="px-6 py-4 text-on-surface-variant">${e.date}</td>
                        <td class="px-6 py-4">
                            <p class="font-bold">${e.name}</p>
                            <p class="text-[10px] text-on-surface-variant">${e.phone} • ${e.email}</p>
                        </td>
                        <td class="px-6 py-4 font-semibold text-primary text-xs">${e.type}</td>
                        <td class="px-6 py-4"><p class="truncate max-w-xs" title="${e.message}">${e.message}</p></td>
                        <td class="px-6 py-4 text-center">${getStatusBadge(e.status)}</td>
                        <td class="px-6 py-4 text-right no-print">
                            <select onchange="handleEqStatusChange('${e.id}', this.value)" class="text-xs bg-surface border border-outline-variant rounded py-1 px-2 focus:ring-1 focus:ring-primary outline-none">
                                <option value="" disabled selected>Action</option>
                                <option value="CONTACTED">Mark Contacted</option>
                                <option value="RESOLVED">Mark Resolved</option>
                            </select>
                        </td>
                    </tr>
                `;
            });
        }
        
        const start = (eqState.page - 1) * 10 + (data.enquiries.length > 0 ? 1 : 0);
        const end = start + data.enquiries.length - (data.enquiries.length > 0 ? 1 : 0);
        document.getElementById('eq-page-info').innerText = `Showing ${start} to ${end} of ${eqState.total} entries`;
        document.getElementById('eq-prev').disabled = eqState.page === 1;
        document.getElementById('eq-next').disabled = !eqState.hasMore;

        updateSyncStatus(true);

    } catch (e) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center py-8 text-error">Failed to load data.</td></tr>';
        updateSyncStatus(false);
    }
}

async function handleEqStatusChange(id, newStatus) {
    if(!newStatus) return;
    try {
        await updateEnquiryStatus(id, newStatus);
        loadEnquiries(); // refresh
    } catch (e) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center py-8 text-error">Failed to load data. Ensure Google Apps Script URL is correct.</td></tr>';
        console.error("Error loading enquiries:", e);
    }
}


// ==========================================
// ANALYTICS VIEW
// ==========================================
let demoChart = null;
let trendChart = null;
let _allFeedbacks = null;

document.addEventListener('DOMContentLoaded', () => {
    const dateFilter = document.getElementById('analytics-date-filter');
    if (dateFilter) {
        dateFilter.addEventListener('change', () => {
            loadAnalytics();
        });
    }
});

async function loadAnalytics() {
    try {
        if (!_allFeedbacks) {
            const res = await fetchAdminFeedbacks({status: 'All'}, 1);
            _allFeedbacks = res.feedbacks;
        }
        
        const filterVal = document.getElementById('analytics-date-filter').value;
        const filtered = filterFeedbacksByDate(_allFeedbacks, filterVal);
        
        let total = filtered.length;
        let sumRating = 0, sumHours = 0, sumIndoor = 0, sumOutdoor = 0, sumVr = 0, sumClean = 0, sumStaff = 0, sumValue = 0;
        let cHours = 0, cIndoor = 0, cOutdoor = 0, cVr = 0, cClean = 0, cStaff = 0, cValue = 0;
        
        let visitTypes = { 'Family': 0, 'Friends': 0, 'School Group': 0, 'Corporate Team': 0, 'Tourist': 0 };
        let favCounts = {};
        
        filtered.forEach(f => {
            sumRating += parseFloat(f.rating || 0);
            
            if (f.hours) {
                let h = parseFloat(f.hours.replace('+', ''));
                if(!isNaN(h)) {
                    sumHours += h;
                    cHours++;
                }
            }

            if(f.visitType && visitTypes[f.visitType] !== undefined) {
                visitTypes[f.visitType]++;
            } else if (f.visitType) {
                visitTypes['Other'] = (visitTypes['Other'] || 0) + 1;
            }

            if(f.indoorRating) { sumIndoor += parseFloat(f.indoorRating); cIndoor++; }
            if(f.outdoorRating) { sumOutdoor += parseFloat(f.outdoorRating); cOutdoor++; }
            if(f.vrRating) { sumVr += parseFloat(f.vrRating); cVr++; }
            if(f.cleanlinessRating) { sumClean += parseFloat(f.cleanlinessRating); cClean++; }
            if(f.staffRating) { sumStaff += parseFloat(f.staffRating); cStaff++; }
            if(f.valueRating) { sumValue += parseFloat(f.valueRating); cValue++; }

            if(f.favorites) {
                const favs = f.favorites.split(',').map(s=>s.trim()).filter(Boolean);
                favs.forEach(fv => {
                    favCounts[fv] = (favCounts[fv] || 0) + 1;
                });
            }
        });
        
        let avgRating = total > 0 ? (sumRating / total).toFixed(1) : "0.0";
        let avgHours = cHours > 0 ? (sumHours / cHours).toFixed(1) : "0.0";
        
        document.getElementById('dash-total-feedback').innerText = total;
        document.getElementById('dash-avg-rating').innerText = avgRating;
        document.getElementById('dash-avg-hours').innerText = avgHours;
        
        const sortedFavs = Object.entries(favCounts).sort((a,b)=>b[1]-a[1]);
        if(sortedFavs.length > 0) {
            document.getElementById('dash-top-attraction').innerText = sortedFavs[0][0];
            document.getElementById('pop-1').innerText = sortedFavs[0][0];
            document.getElementById('pop-2').innerText = sortedFavs.length > 1 ? sortedFavs[1][0] : '--';
            document.getElementById('pop-3').innerText = sortedFavs.length > 2 ? sortedFavs[2][0] : '--';
        } else {
            document.getElementById('dash-top-attraction').innerText = '--';
            document.getElementById('pop-1').innerText = '--';
            document.getElementById('pop-2').innerText = '--';
            document.getElementById('pop-3').innerText = '--';
        }

        const updateBar = (id, sum, c) => {
            let avg = c > 0 ? (sum / c) : 0;
            document.getElementById('sat-'+id).innerText = avg.toFixed(1);
            document.getElementById('bar-'+id).style.width = (avg / 5 * 100) + '%';
        };
        updateBar('indoor', sumIndoor, cIndoor);
        updateBar('outdoor', sumOutdoor, cOutdoor);
        updateBar('vr', sumVr, cVr);
        updateBar('clean', sumClean, cClean);
        updateBar('staff', sumStaff, cStaff);
        updateBar('value', sumValue, cValue);

        renderDemographics(visitTypes);
        renderTrend(filtered, filterVal);
        
        updateSyncStatus(true);
    } catch (e) {
        console.error("Dashboard failed to load", e);
        updateSyncStatus(false);
    }
}

function filterFeedbacksByDate(feedbacks, filterVal) {
    if (filterVal === 'all') return feedbacks;
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return feedbacks.filter(f => {
        if (!f.date) return false;
        const d = new Date(f.date);
        if (isNaN(d)) return false;
        
        if (filterVal === 'today') {
            return d >= today;
        } else if (filterVal === '7days') {
            const last7 = new Date(now);
            last7.setDate(now.getDate() - 7);
            return d >= last7;
        } else if (filterVal === '30days') {
            const last30 = new Date(now);
            last30.setDate(now.getDate() - 30);
            return d >= last30;
        } else if (filterVal === 'thismonth') {
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        } else if (filterVal === 'thisyear') {
            return d.getFullYear() === now.getFullYear();
        }
        return true;
    });
}

function renderDemographics(data) {
    const ctx = document.getElementById('demographicsChart');
    if (!ctx) return;
    if (demoChart) demoChart.destroy();
    
    const labels = Object.keys(data);
    const values = Object.values(data);
    
    demoChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: ['#006878', '#00b7d1', '#80f98b', '#6E00FF', '#FFA500', '#FF6384'],
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'right', labels: { usePointStyle: true, boxWidth: 8, font: { family: "'Work Sans', sans-serif", size: 11 } } }
            },
            cutout: '70%'
        }
    });
}

function renderTrend(feedbacks, filterVal) {
    const ctx = document.getElementById('trendChart');
    if (!ctx) return;
    if (trendChart) trendChart.destroy();
    
    // Group feedbacks by date
    let datesMap = {};
    feedbacks.forEach(f => {
        if(!f.date) return;
        const d = new Date(f.date);
        if(isNaN(d)) return;
        
        let key = d.toLocaleDateString('en-US', {month: 'short', day: 'numeric'});
        if(filterVal === 'all' || filterVal === 'thisyear') {
            key = d.toLocaleDateString('en-US', {month: 'short'}); // aggregate by month
        }
        datesMap[key] = (datesMap[key] || 0) + 1;
    });
    
    const labels = Object.keys(datesMap);
    const dataArray = Object.values(datesMap);
    
    trendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels.length > 0 ? labels : ['No Data'],
            datasets: [{
                label: 'Feedbacks',
                data: dataArray.length > 0 ? dataArray : [0],
                borderColor: '#006878',
                backgroundColor: 'rgba(0, 104, 120, 0.1)',
                borderWidth: 2,
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#00b7d1',
                pointRadius: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { font: { family: "'Work Sans', sans-serif", size: 10 } } },
                x: { grid: { display: false }, ticks: { font: { family: "'Work Sans', sans-serif", size: 10 } } }
            }
        }
    });
}

// ==========================================
// EXPORT CSV
// ==========================================
async function exportCSV(type) {
    let data = [];
    if (type === 'feedbacks') {
        const res = await fetchAdminFeedbacks({ status: 'All' }, 1); // Mock grabbing first page or ideally all
        data = res.feedbacks;
    } else {
        const res = await fetchAdminEnquiries({ status: 'All' }, 1);
        data = res.enquiries;
    }

    if (!data || data.length === 0) return alert("No data to export");

    const headers = Object.keys(data[0]);
    const csvRows = [];
    
    csvRows.push(headers.join(','));
    
    for (const row of data) {
        const values = headers.map(header => {
            const escaped = ('' + row[header]).replace(/"/g, '""');
            return `"${escaped}"`;
        });
        csvRows.push(values.join(','));
    }

    const csvData = csvRows.join('\n');
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `${type}_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// ==========================================
// CMS VIEW
// ==========================================
async function loadCMS() {
    try {
        const data = await fetchCMSData(); // from api.js
        if(data) {
            if(data.heroTitle) document.getElementById('cms-hero-title').value = data.heroTitle;
            if(data.heroSubtitle) document.getElementById('cms-hero-subtitle').value = data.heroSubtitle;
            if(data.alertBanner) document.getElementById('cms-alert-banner').value = data.alertBanner;
            if(data.seoTitle) document.getElementById('cms-seo-title').value = data.seoTitle;
            if(data.seoDesc) document.getElementById('cms-seo-desc').value = data.seoDesc;
            if(data.aboutIntro) document.getElementById('cms-about-intro').value = data.aboutIntro;
            if(data.hours) document.getElementById('cms-hours').value = data.hours;
        }
        updateSyncStatus(true);
    } catch (e) {
        console.error("Failed to load CMS data", e);
        updateSyncStatus(false);
    }
}

async function saveCMS() {
    const btn = event.currentTarget;
    const originalText = btn.innerHTML;
    btn.innerHTML = `<span class="material-symbols-outlined text-sm animate-spin">progress_activity</span> Saving...`;
    
    const payload = {
        heroTitle: document.getElementById('cms-hero-title').value,
        heroSubtitle: document.getElementById('cms-hero-subtitle').value,
        alertBanner: document.getElementById('cms-alert-banner').value,
        seoTitle: document.getElementById('cms-seo-title').value,
        seoDesc: document.getElementById('cms-seo-desc').value,
        aboutIntro: document.getElementById('cms-about-intro').value,
        hours: document.getElementById('cms-hours').value
    };

    try {
        await updateCMSContent(payload); // from api.js
        setTimeout(() => {
            btn.innerHTML = `<span class="material-symbols-outlined text-sm">check</span> Saved!`;
            setTimeout(() => btn.innerHTML = originalText, 2000);
        }, 500); // Simulate network
    } catch (e) {
        alert("Failed to save changes");
        btn.innerHTML = originalText;
    }
}
