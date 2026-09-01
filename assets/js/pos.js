/**
 * assets/js/pos.js
 * POS Dashboard & Shift Management for Kurunji Fun World
 */

function initDashboard() {
    // Check staff auth
    const session = requireStaffAuth();
    if (!session) return;

    // Display Staff Header Info
    const staffNameEl = document.getElementById('staff-name') || document.getElementById('staff-name-mobile');
    const staffRoleEl = document.getElementById('staff-role');
    const staffBadge = document.getElementById('staff-email-badge');

    if (staffNameEl && session.email) {
        staffNameEl.textContent = session.email.split('@')[0].toUpperCase();
    }
    if (staffRoleEl && session.role) {
        staffRoleEl.textContent = session.role === 'SUPER_ADMIN' ? 'Administrator' : (session.role === 'MANAGER' ? 'Manager' : 'Counter Staff');
    }
    if (staffBadge && session.email) {
        staffBadge.textContent = session.email.split('@')[0].toUpperCase();
    }

    // Set today's date formatted nicely
    const dateEl = document.getElementById('current-date');
    if (dateEl) {
        dateEl.textContent = new Date().toLocaleDateString('en-IN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    // Render from session cache immediately if available
    try {
        const cached = sessionStorage.getItem('cached_history_data');
        if (cached) {
            const hist = JSON.parse(cached);
            if (Array.isArray(hist) && hist.length > 0) {
                if (typeof POSShare !== 'undefined') {
                    POSShare.cachedAllTransactions = hist;
                }
                computeAndRenderStats(hist);
                if (typeof POSShare !== 'undefined' && POSShare.switchDashboardReportPeriod) {
                    POSShare.switchDashboardReportPeriod(POSShare.currentSelectedPeriod || 'today');
                }
            }
        }
    } catch(e) {}

    // Initialize Live Dashboard Stats & Reports
    loadDashboardStats();

    // Setup Refresh Button if present
    const refreshBtn = document.getElementById('refresh-stats-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            sessionStorage.removeItem('cached_history_data');
            loadDashboardStats(true);
        });
    }
}

// Ensure execution
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDashboard);
} else {
    initDashboard();
}

async function loadDashboardStats(forceRefresh = false) {
    try {
        const todayIST = new Date().toLocaleDateString('en-CA'); // 'yyyy-MM-dd'
        
        // Fetch all recent transactions
        let res = null;
        try {
            res = await fetchTransactionHistory({ limit: 200 });
        } catch (apiErr) {
            console.warn("fetchTransactionHistory failed, checking local sync queue:", apiErr);
        }

        let history = (res && res.status === "success" && Array.isArray(res.history)) ? res.history : [];

        // If online returned empty or failed, merge offline queue items
        if (typeof POSOfflineSync !== 'undefined') {
            const queue = POSOfflineSync.getQueue ? POSOfflineSync.getQueue() : [];
            queue.forEach(qItem => {
                const p = qItem.payload || {};
                const r = qItem.result || {};
                const id = qItem.id || r.billId || 'OFF-' + Date.now();
                if (!history.find(h => h.id === id)) {
                    history.unshift({
                        id: id,
                        date: qItem.createdAt || todayIST,
                        time: new Date(qItem.createdAt || Date.now()).toLocaleTimeString('en-US'),
                        customerName: p.customerName || 'Offline Guest',
                        customerPhone: p.phone || '',
                        type: qItem.action ? qItem.action.replace('process', '') : 'Billing',
                        amount: r.total || p.total || 0,
                        points: r.balance || 0,
                        adultCount: p.adultCount || 1,
                        childCount: p.childCount || 0,
                        status: 'COMPLETED',
                        paymentMethod: p.paymentMethod || 'Cash',
                        cardNumber: p.cardNumber || ''
                    });
                }
            });
        }

        // Cache in session
        try {
            sessionStorage.setItem('cached_history_data', JSON.stringify(history));
        } catch(e) {}

        // Cache history for POSShare multi-period reports
        if (typeof POSShare !== 'undefined') {
            POSShare.cachedAllTransactions = history;
        }

        computeAndRenderStats(history);

        // Update the Owner Report Widget
        if (typeof POSShare !== 'undefined' && POSShare.switchDashboardReportPeriod) {
            POSShare.switchDashboardReportPeriod(POSShare.currentSelectedPeriod || 'today');
        }
    } catch (e) {
        console.error("Dashboard stats error:", e);
    }
}

function computeAndRenderStats(history) {
    const todayIST = new Date().toLocaleDateString('en-CA');
    const todayTxns = (typeof POSShare !== 'undefined' && POSShare.filterTransactionsByPeriod) 
        ? POSShare.filterTransactionsByPeriod(history, 'today')
        : history.filter(tx => String(tx.date || '').includes(todayIST));

    let visitors = 0;
    let transactions = 0;
    let revenue = 0;
    let rechargeRevenue = 0;
    const distinctCards = new Set();

    todayTxns.forEach(tx => {
        const txId = String(tx.id || "");
        const isCompleted = tx.status === "COMPLETED" || tx.status === "CHECKED_IN" || !tx.status;
        if (!isCompleted) return;

        transactions++;
        const amt = parseFloat(tx.amount) || 0;
        revenue += amt;

        // Demographic / Visitor calculations
        const adultCount = parseInt(tx.adultCount) || 0;
        const childCount = parseInt(tx.childCount) || 0;
        if (adultCount > 0 || childCount > 0) {
            visitors += (adultCount + childCount);
        } else if (txId.startsWith("B-FF") || txId.startsWith("B-OUT")) {
            visitors += 1;
        }

        // Card & Recharge calculations
        if (tx.cardNumber) distinctCards.add(tx.cardNumber);
        if (tx.type === "Ground Floor Recharge" || txId.startsWith("B-GF-REC") || tx.type === "Recharge") {
            rechargeRevenue += amt;
            if (tx.cardNumber) distinctCards.add(tx.cardNumber);
        }
    });

    const statsData = {
        visitors: visitors > 0 ? visitors.toString() : (transactions > 0 ? transactions.toString() : "0"),
        transactions: transactions.toString(),
        revenue: "₹" + revenue.toLocaleString("en-IN"),
        wallets: distinctCards.size > 0 ? distinctCards.size.toString() : (rechargeRevenue > 0 ? "Active" : "0"),
        recharges: "₹" + rechargeRevenue.toLocaleString("en-IN")
    };

    renderStats(statsData);
}

function renderStats(stats) {
    const setEl = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
    };

    setEl("stat-transactions", stats.transactions);
    setEl("stat-revenue", stats.revenue);
    setEl("stat-wallets", stats.wallets);
    setEl("stat-recharges", stats.recharges);
    setEl("stat-visitors", stats.visitors);
}
