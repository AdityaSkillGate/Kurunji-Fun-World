
function normalizeAndDeduplicateTransactions(list) {
    if (!Array.isArray(list)) return [];
    
    const payToPoints = {
        1500: 1800,
        1000: 1150,
        500: 500,
        3000: 3800
    };

    const seenMap = new Map();
    const result = [];

    // First pass: fill in missing points or card numbers
    list.forEach(tx => {
        const amt = parseFloat(tx.amount) || 0;
        let pts = parseFloat(tx.points) || 0;
        
        if (tx.type && tx.type.includes('Recharge')) {
            if (!pts && amt > 0) {
                pts = payToPoints[amt] || amt;
                tx.points = pts;
            }
        }

        // Deduplication key: if two rows are created for same customer, amount, and within same 10-second window
        // e.g. B-GF-REC-xxx and TXN-xxx
        const dateKey = String(tx.date || '').split('T')[0];
        const timeKey = String(tx.time || '').substring(0, 5); // hh:mm
        const custKey = tx.customerPhone || tx.customerName || 'guest';
        const typeKey = (tx.type || '').includes('Recharge') ? 'REC' : (tx.type || '');
        const dedupeKey = `${dateKey}_${timeKey}_${custKey}_${amt}_${typeKey}`;

        if (seenMap.has(dedupeKey)) {
            // Merge metadata into the existing record
            const existing = seenMap.get(dedupeKey);
            if (!existing.cardNumber && tx.cardNumber) existing.cardNumber = tx.cardNumber;
            if ((!existing.points || existing.points === 0) && tx.points > 0) existing.points = tx.points;
            if (existing.id && existing.id.startsWith('TXN-') && tx.id && tx.id.startsWith('B-')) {
                existing.id = tx.id; // Prefer standard B-GF-REC- ID
            }
        } else {
            seenMap.set(dedupeKey, tx);
            result.push(tx);
        }
    });

    return result;
}

function formatDisplayDate(dateVal) {
    if (!dateVal) return "-";
    let str = String(dateVal).trim();
    if (str.includes("T")) {
        const d = new Date(str);
        if (!isNaN(d.getTime())) {
            if (d.getFullYear() < 1970) return "-";
            return d.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
        }
    }
    return str;
}

function formatDisplayTime(timeVal) {
    if (!timeVal) return "-";
    let str = String(timeVal).trim();
    if (str.includes("1899-12-30") || str.includes("T")) {
        const d = new Date(str);
        if (!isNaN(d.getTime())) {
            return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
        }
    }
    return str;
}

﻿/**
 * pos-history.js
 * Logic for Staff Transaction History Module
 */

let allTransactions = [];
let currentSession = null;

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Enforce Auth
    currentSession = await requireStaffAuth();
    if (!currentSession) return;
    
    const appBody = document.getElementById('app-body');
    if (appBody) appBody.classList.remove('hidden');

    // 2. Load History
    await loadHistory();

    const shareReportBtn = document.getElementById('share-owner-report-btn');
    if (shareReportBtn) {
        shareReportBtn.addEventListener('click', () => {
            const timeFilterVal = document.getElementById('time-filter')?.value || 'all';
            let label = "All Time";
            if (timeFilterVal === 'today') label = `Today (${new Date().toLocaleDateString('en-IN')})`;
            else if (timeFilterVal === 'week') label = "This Week (Last 7 Days)";
            else if (timeFilterVal === 'month') label = "This Month (Last 30 Days)";
            
            const currentFiltered = getCurrentFilteredTransactions();
            if (typeof POSShare !== 'undefined' && POSShare.shareFilteredSummaryToOwner) {
                POSShare.shareFilteredSummaryToOwner(currentFiltered, label);
            }
        });
    }


    // 3. Bind Search and Filter Inputs
    const searchInput = document.getElementById('search-input');
    const quickSearchInput = document.getElementById('quick-search-input');

    if (searchInput) {
        searchInput.addEventListener('input', () => {
            if (quickSearchInput) quickSearchInput.value = searchInput.value;
            applyFilters();
        });
    }

    if (quickSearchInput) {
        quickSearchInput.addEventListener('input', () => {
            if (searchInput) searchInput.value = quickSearchInput.value;
            applyFilters();
        });
    }

    document.getElementById('time-filter').addEventListener('change', applyFilters);
    document.getElementById('staff-filter').addEventListener('change', (e) => {
        if (e.target.value === 'me') setStaffTab('me');
        else if (e.target.value === 'all') setStaffTab('all');
        else applyFilters();
    });
    document.getElementById('status-filter').addEventListener('change', applyFilters);
    
    document.querySelectorAll('.type-filter').forEach(cb => {
        cb.addEventListener('change', (e) => {
            if (e.target.value === "ALL") {
                if (e.target.checked) {
                    document.querySelectorAll('.type-filter').forEach(c => { if(c !== e.target) c.checked = false; });
                }
            } else {
                if (e.target.checked) {
                    const allCb = document.querySelector('.type-filter[value="ALL"]');
                    if (allCb) allCb.checked = false;
                }
            }
            applyFilters();
        });
    });

    
    // Bind Staff Quick Toggle Tabs
    const tabMyBills = document.getElementById('tab-my-bills');
    const tabAllBills = document.getElementById('tab-all-bills');
    const staffSelect = document.getElementById('staff-filter');

    if (currentSession && currentSession.email) {
        const myName = currentSession.email.split('@')[0];
        const tabLabel = document.getElementById('tab-my-bills-label');
        if (tabLabel) tabLabel.textContent = `My Bills (${myName})`;
    }

    function setStaffTab(mode) {
        if (mode === 'me') {
            if (tabMyBills) {
                tabMyBills.className = "px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 bg-white text-slate-900 shadow-sm";
            }
            if (tabAllBills) {
                tabAllBills.className = "px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 text-slate-600 hover:text-slate-900 hover:bg-white/50";
            }
            if (staffSelect) staffSelect.value = 'me';
        } else {
            if (tabAllBills) {
                tabAllBills.className = "px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 bg-white text-slate-900 shadow-sm";
            }
            if (tabMyBills) {
                tabMyBills.className = "px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 text-slate-600 hover:text-slate-900 hover:bg-white/50";
            }
            if (staffSelect) staffSelect.value = 'all';
        }
        applyFilters();
    }
    window.setStaffTab = setStaffTab;

    if (tabMyBills) tabMyBills.addEventListener('click', () => setStaffTab('me'));
    if (tabAllBills) tabAllBills.addEventListener('click', () => setStaffTab('all'));

    // 4. Mobile Filter Drawer Handlers
    const mobileFilterBtn = document.getElementById('mobile-filter-btn');
    const closeFilterBtn = document.getElementById('close-filter-btn');
    const filterBackdrop = document.getElementById('filter-backdrop');
    const filterSidebar = document.getElementById('filter-sidebar');
    const applyFiltersBtn = document.getElementById('apply-filters-btn');
    const resetFiltersBtn = document.getElementById('reset-filters-btn');

    function openMobileFilters() {
        if (filterSidebar) {
            filterSidebar.classList.remove('-translate-x-full');
            filterSidebar.classList.add('translate-x-0');
        }
        if (filterBackdrop) filterBackdrop.classList.remove('hidden');
    }

    function closeMobileFilters() {
        if (filterSidebar) {
            filterSidebar.classList.add('-translate-x-full');
            filterSidebar.classList.remove('translate-x-0');
        }
        if (filterBackdrop) filterBackdrop.classList.add('hidden');
    }

    if (mobileFilterBtn) mobileFilterBtn.addEventListener('click', openMobileFilters);
    if (closeFilterBtn) closeFilterBtn.addEventListener('click', closeMobileFilters);
    if (filterBackdrop) filterBackdrop.addEventListener('click', closeMobileFilters);
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', () => {
            applyFilters();
            closeMobileFilters();
        });
    }
    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', () => {
            if (searchInput) searchInput.value = '';
            if (quickSearchInput) quickSearchInput.value = '';
            document.getElementById('time-filter').value = 'all';
            document.getElementById('staff-filter').value = 'all';
            document.getElementById('status-filter').value = 'ALL';
            document.querySelectorAll('.type-filter').forEach(cb => {
                cb.checked = (cb.value === 'ALL');
            });
            applyFilters();
            closeMobileFilters();
        });
    }
});


function populateStaffOptions(transactions) {
    const staffSelect = document.getElementById('staff-filter');
    if (!staffSelect || !Array.isArray(transactions)) return;
    
    const staffSet = new Set();
    transactions.forEach(t => {
        if (t.staff && t.staff.trim()) staffSet.add(t.staff.trim());
    });

    const currentVal = staffSelect.value;
    let html = '<option value="all">All Staff</option><option value="me">My Transactions</option>';
    
    staffSet.forEach(s => {
        const sName = s.includes('@') ? s.split('@')[0] : s;
        html += `<option value="${s}">${sName} (${s})</option>`;
    });

    staffSelect.innerHTML = html;
    staffSelect.value = currentVal;
}

async function loadHistory() {
    const loading = document.getElementById('loading-history');
    const container = document.getElementById('table-container');
    
    try {
        const response = await fetchTransactionHistory();
        if (response && response.status === 'success' && Array.isArray(response.history) && response.history.length > 0) {
            allTransactions = response.history;
            populateStaffOptions(allTransactions);
            if (loading) loading.classList.add('hidden');
            if (container) container.classList.remove('hidden');
            applyFilters();
            return;
        }

        // If response succeeded but empty, or offline fallback
        const offlineQueue = JSON.parse(localStorage.getItem('kurunji_offline_bills_queue') || '[]');
        if (response && response.status === 'success' && Array.isArray(response.history)) {
            allTransactions = response.history.concat(normalizeAndDeduplicateTransactions(offlineQueue));
        } else {
            allTransactions = normalizeAndDeduplicateTransactions(offlineQueue);
        }

        populateStaffOptions(allTransactions);
        if (loading) loading.classList.add('hidden');
        if (container) container.classList.remove('hidden');
        applyFilters();
    } catch (e) {
        console.warn("loadHistory network fetch error, using local queue fallback:", e);
        const offlineQueue = JSON.parse(localStorage.getItem('kurunji_offline_bills_queue') || '[]');
        allTransactions = normalizeAndDeduplicateTransactions(offlineQueue);
        populateStaffOptions(allTransactions);
        if (loading) loading.classList.add('hidden');
        if (container) container.classList.remove('hidden');
        applyFilters();
    }
}

function applyFilters() {
    const searchEl = document.getElementById('search-input') || document.getElementById('quick-search-input');
    const searchStr = searchEl ? searchEl.value.toLowerCase().trim() : '';
    const timeFilter = document.getElementById('time-filter').value;
    const staffFilter = document.getElementById('staff-filter').value;
    const statusFilter = document.getElementById('status-filter').value;
    
    const typeFilters = Array.from(document.querySelectorAll('.type-filter:checked')).map(cb => cb.value);
    const filterAllTypes = typeFilters.includes("ALL") || typeFilters.length === 0;

    const todayStr = new Date().toLocaleDateString('en-US');

    // Update active filter indicator on mobile
    const activeDot = document.getElementById('active-filter-dot');
    if (activeDot) {
        const hasCustomFilters = timeFilter !== 'today' || staffFilter !== 'me' || statusFilter !== 'ALL' || !filterAllTypes;
        if (hasCustomFilters) {
            activeDot.classList.remove('hidden');
        } else {
            activeDot.classList.add('hidden');
        }
    }

    const filtered = allTransactions.filter(txn => {
        // 1. Search (ID, Phone, Name, Card)
        if (searchStr) {
            const idMatch = txn.id && txn.id.toLowerCase().includes(searchStr);
            const nameMatch = txn.customerName && txn.customerName.toLowerCase().includes(searchStr);
            const phoneMatch = txn.customerPhone && String(txn.customerPhone).includes(searchStr);
            const cardMatch = txn.cardNumber && String(txn.cardNumber).includes(searchStr);
            if (!idMatch && !nameMatch && !phoneMatch && !cardMatch) return false;
        }
        
        // 2. Timeframe
        if (timeFilter === 'today') {
            const todayISO = new Date().toLocaleDateString('en-CA');
            const txnDateClean = String(txn.date || '').split('T')[0].trim();
            const txDateObj = new Date(txn.date);
            const isToday = (txnDateClean === todayISO) || 
                            (!isNaN(txDateObj.getTime()) && txDateObj.toLocaleDateString('en-CA') === todayISO);
            if (!isToday) return false;
        } else if (timeFilter === 'yesterday') {
            const yDate = new Date();
            yDate.setDate(yDate.getDate() - 1);
            const yISO = yDate.toLocaleDateString('en-CA');
            const txnDateClean = String(txn.date || '').split('T')[0].trim();
            const txDateObj = new Date(txn.date);
            const isYesterday = (txnDateClean === yISO) || 
                                (!isNaN(txDateObj.getTime()) && txDateObj.toLocaleDateString('en-CA') === yISO);
            if (!isYesterday) return false;
        } else if (timeFilter === 'week') {
            const txDate = new Date(txn.date);
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            sevenDaysAgo.setHours(0,0,0,0);
            if (!isNaN(txDate.getTime()) && txDate < sevenDaysAgo) {
                return false;
            }
        } else if (timeFilter === 'month') {
            const txDate = new Date(txn.date);
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            thirtyDaysAgo.setHours(0,0,0,0);
            if (!isNaN(txDate.getTime()) && txDate < thirtyDaysAgo) {
                return false;
            }
        }
        
        // 3. Staff
        if (staffFilter === 'me' && currentSession) {
            const myEmail = (currentSession.email || '').toLowerCase().trim();
            const myName = myEmail.split('@')[0];
            const txnStaff = (txn.staff || '').toLowerCase().trim();
            const txnStaffName = txnStaff.split('@')[0];
            if (txnStaff !== myEmail && txnStaffName !== myName && !txnStaff.includes(myName)) {
                return false;
            }
        } else if (staffFilter && staffFilter !== 'all' && staffFilter !== 'me') {
            const target = staffFilter.toLowerCase().trim();
            const txnStaff = (txn.staff || '').toLowerCase().trim();
            if (txnStaff !== target && !txnStaff.includes(target)) {
                return false;
            }
        }
        
        // 4. Type
        if (!filterAllTypes && !typeFilters.includes(txn.type)) return false;
        
        // 5. Status
        if (statusFilter !== 'ALL' && txn.status !== statusFilter) return false;
        
        return true;
    });
    
    latestFilteredList = filtered;
    renderTable(filtered);
}

function renderTable(data) {
    const tbody = document.getElementById('history-tbody');
    const cardsContainer = document.getElementById('history-cards');
    const noRes = document.getElementById('no-results');
    const resultCount = document.getElementById('result-count');
    
    if (resultCount) resultCount.textContent = data.length;
    
    if (tbody) tbody.innerHTML = '';
    if (cardsContainer) cardsContainer.innerHTML = '';
    
    if (data.length === 0) {
        if (noRes) noRes.classList.remove('hidden');
    } else {
        if (noRes) noRes.classList.add('hidden');
        
        data.forEach(txn => {
            // Format Status Badge
            let statusBadge = `<span class="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider">${txn.status}</span>`;
            if (txn.status === 'COMPLETED') statusBadge = `<span class="bg-green-100 text-green-700 px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider">COMPLETED</span>`;
            if (txn.status === 'CHECKED_IN') statusBadge = `<span class="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider">CHECKED IN</span>`;
            if (txn.status === 'CANCELLED' || txn.status === 'REFUNDED') statusBadge = `<span class="bg-red-100 text-red-700 px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider">${txn.status}</span>`;
            
            // Format Type Colors
            let typeColor = "text-slate-600";
            let typeBg = "bg-slate-50 border-slate-200";
            if (txn.type === "First Floor") {
                typeColor = "text-orange-600";
                typeBg = "bg-orange-50 border-orange-200";
            } else if (txn.type === "Outdoor") {
                typeColor = "text-green-600";
                typeBg = "bg-green-50 border-green-200";
            } else if (txn.type.includes("Recharge")) {
                typeColor = "text-blue-600";
                typeBg = "bg-blue-50 border-blue-200";
            } else if (txn.type.includes("Usage")) {
                typeColor = "text-teal-600";
                typeBg = "bg-teal-50 border-teal-200";
            } else if (txn.type.includes("Add-on")) {
                typeColor = "text-pink-600";
                typeBg = "bg-pink-50 border-pink-200";
            }

            let custDisplay = `<div class="font-bold text-slate-800 text-sm">${txn.customerName || 'Walk-in Guest'}</div>`;
            if (txn.customerPhone) custDisplay += `<div class="text-xs text-slate-400 font-mono">${txn.customerPhone}</div>`;
            if (txn.cardNumber) custDisplay += `<div class="text-xs text-slate-400 font-mono">Card: ${txn.cardNumber}</div>`;
            
            let amtDisplay = txn.amount > 0 ? `₹${parseFloat(txn.amount).toLocaleString('en-IN')}` : '-';
            let ptsDisplay = txn.points > 0 ? `●${txn.points} pts` : '';

            // Action Button
            const actionBtnHtml = txn.status === 'COMPLETED' ? 
                `<button onclick="openRefundModal('${txn.id}', '${txn.type}', ${txn.amount}, ${txn.points}, '${(txn.customerName || '').replace(/'/g, "\\'")}', '${(txn.cardNumber || '').replace(/'/g, "\\'")}')" class="text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded text-xs font-bold transition-colors">REVERSE</button>` : 
                `<span class="text-slate-300 text-xs">-</span>`;

            // 1. Desktop Table Row
            if (tbody) {
                const tr = document.createElement('tr');
                tr.className = "hover:bg-slate-50 transition-colors";
                tr.innerHTML = `
                    <td class="py-3 px-4">
                        <div class="font-bold text-slate-800 text-xs">${formatDisplayTime(txn.time)}</div>
                        <div class="text-[11px] text-slate-400">${formatDisplayDate(txn.date)}</div>
                    </td>
                    <td class="py-3 px-4 font-mono text-xs text-slate-600 font-semibold">${txn.id}</td>
                    <td class="py-3 px-4">${custDisplay}</td>
                    <td class="py-3 px-4 font-bold ${typeColor} text-xs uppercase tracking-wide">${txn.type}</td>
                    <td class="py-3 px-4 text-right font-bold text-slate-900">${amtDisplay}</td>
                    <td class="py-3 px-4 text-right font-bold text-blue-700 text-xs">${ptsDisplay || '-'}</td>
                    <td class="py-3 px-4 text-xs text-slate-500 max-w-[120px] truncate" title="${txn.staff}">${txn.staff ? txn.staff.split('@')[0] : '-'}</td>
                    <td class="py-3 px-4">${statusBadge}</td>
                    <td class="py-3 px-4 text-right">${actionBtnHtml}</td>
                `;
                tbody.appendChild(tr);
            }

            // 2. Mobile Responsive Card
            if (cardsContainer) {
                const card = document.createElement('div');
                card.className = "bg-white rounded-xl p-4 shadow-sm border border-slate-200 flex flex-col gap-2.5";
                
                let mobilePtsHtml = ptsDisplay ? `<span class="text-xs font-bold text-blue-700">${ptsDisplay}</span>` : '';
                
                card.innerHTML = `
                    <div class="flex items-center justify-between">
                        <span class="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">${txn.id}</span>
                        ${statusBadge}
                    </div>
                    <div class="flex justify-between items-start pt-1">
                        <div>
                            <div class="font-bold text-sm text-slate-800">${txn.customerName || 'Walk-in Guest'}</div>
                            ${txn.customerPhone ? `<div class="text-xs text-slate-400 font-mono">${txn.customerPhone}</div>` : ''}
                            ${txn.cardNumber ? `<div class="text-xs text-slate-400 font-mono">Card: ${txn.cardNumber}</div>` : ''}
                        </div>
                        <div class="text-right">
                            <div class="font-bold text-base text-slate-900">${amtDisplay}</div>
                            ${mobilePtsHtml}
                        </div>
                    </div>
                    <div class="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                        <span class="font-bold ${typeColor} uppercase tracking-wide text-xs px-2 py-0.5 rounded border ${typeBg}">${txn.type}</span>
                        <span class="text-slate-400 text-[11px]">${formatDisplayDate(txn.date)} ${formatDisplayTime(txn.time)}</span>
                    </div>
                    <div class="flex items-center justify-between text-xs text-slate-500 pt-1">
                        <span class="truncate text-[11px]"><span class="text-slate-400">Staff:</span> ${txn.staff ? txn.staff.split('@')[0] : '-'}</span>
                        <div>${actionBtnHtml}</div>
                    </div>
                `;
                cardsContainer.appendChild(card);
            }
        });
    }
}

// --- Refund / Reversal Logic ---
function openRefundModal(id, type, amount, points, custName, cardNo) {
    document.getElementById('refund-txn-id').value = id;
    document.getElementById('refund-txn-type').value = type;
    
    document.getElementById('refund-display-id').textContent = id;
    
    let amtDisplay = [];
    if (amount > 0) amtDisplay.push(`₹${amount}`);
    if (points > 0) amtDisplay.push(`●${points}`);
    document.getElementById('refund-display-amt').textContent = amtDisplay.join(' / ');
    
    let cDisp = custName;
    if (cardNo) cDisp += ` (Card: ${cardNo})`;
    document.getElementById('refund-display-cust').textContent = cDisp;
    
    document.getElementById('refund-reason').value = "";
    document.getElementById('auth-email').value = "";
    document.getElementById('auth-pass').value = "";
    document.getElementById('refund-error').classList.add('hidden');
    
    document.getElementById('refund-modal').classList.remove('hidden');
}

document.getElementById('refund-cancel-btn').addEventListener('click', () => {
    document.getElementById('refund-modal').classList.add('hidden');
});

document.getElementById('refund-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('refund-submit-btn');
    const errBox = document.getElementById('refund-error');
    errBox.classList.add('hidden');
    
    btn.disabled = true;
    btn.innerHTML = '<span class="material-symbols-outlined animate-spin text-base">progress_activity</span> Processing...';
    
    const payload = {
        transactionId: document.getElementById('refund-txn-id').value,
        type: document.getElementById('refund-txn-type').value,
        reason: document.getElementById('refund-reason').value,
        authEmail: document.getElementById('auth-email').value,
        authPass: document.getElementById('auth-pass').value
    };
    
    try {
        const res = await processRefundRequest(payload);
        if (res && res.status === 'success') {
            document.getElementById('refund-modal').classList.add('hidden');
            await loadHistory();

    const shareReportBtn = document.getElementById('share-owner-report-btn');
    if (shareReportBtn) {
        shareReportBtn.addEventListener('click', () => {
            const timeFilterVal = document.getElementById('time-filter')?.value || 'all';
            let label = "All Time";
            if (timeFilterVal === 'today') label = `Today (${new Date().toLocaleDateString('en-IN')})`;
            else if (timeFilterVal === 'week') label = "This Week (Last 7 Days)";
            else if (timeFilterVal === 'month') label = "This Month (Last 30 Days)";
            
            const currentFiltered = getCurrentFilteredTransactions();
            if (typeof POSShare !== 'undefined' && POSShare.shareFilteredSummaryToOwner) {
                POSShare.shareFilteredSummaryToOwner(currentFiltered, label);
            }
        });
    }

        } else {
            throw new Error((res && res.message) || "Failed to process reversal");
        }
    } catch (err) {
        errBox.textContent = err.message;
        errBox.classList.remove('hidden');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<span>Authorize Reversal</span>';
    }
});


let latestFilteredList = [];

function getCurrentFilteredTransactions() {
    return latestFilteredList.length > 0 ? latestFilteredList : allTransactions;
}

window.setTimeframeQuickFilter = function(tf) {
    const timeSelect = document.getElementById('time-filter');
    if (timeSelect) timeSelect.value = tf;

    const pills = ['all', 'today', 'week', 'month'];
    pills.forEach(p => {
        const btn = document.getElementById('pill-time-' + p);
        if (btn) {
            if (p === tf) {
                btn.className = "px-2.5 py-1.5 rounded-lg transition-all bg-white text-primary shadow-sm font-bold";
            } else {
                btn.className = "px-2.5 py-1.5 rounded-lg transition-all text-slate-600 hover:text-slate-900 hover:bg-white/50 font-bold";
            }
        }
    });

    applyFilters();
};
