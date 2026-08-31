/**
 * pos.js
 * Logic for the Staff POS Dashboard
 */

document.addEventListener("DOMContentLoaded", async () => {
    // 1. Enforce Authentication
    const session = await requireStaffAuth();
    if (!session) return;
    
    // Unhide body once authenticated
    const appBody = document.getElementById("app-body");
    if (appBody) appBody.classList.remove("hidden");

    // 2. Set UI Elements (with null guards so we never crash)
    const staffNameEl = document.getElementById("staff-name");
    const staffRoleEl = document.getElementById("staff-role");
    const staffNameMobileEl = document.getElementById("staff-name-mobile");
    const currentDateEl = document.getElementById("current-date");
    const logoutBtn = document.getElementById("logout-btn");

    const displayName = session.email ? session.email.split("@")[0].toUpperCase() : "STAFF";
    const displayRole = session.role || "Staff";

    if (staffNameEl) staffNameEl.textContent = displayName;
    if (staffRoleEl) staffRoleEl.textContent = displayRole;
    if (staffNameMobileEl) staffNameMobileEl.textContent = displayName;

    // Set Date in IST
    const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
    if (currentDateEl) currentDateEl.textContent = new Date().toLocaleDateString("en-IN", options);

    // 3. Logout Handler
    if (logoutBtn) {
        logoutBtn.addEventListener("click", async () => {
            if (confirm("Are you sure you want to log out?")) {
                await logoutAdmin();
                window.location.href = "staff-login.html";
            }
        });
    }

    // 4. Load Real Data from History with Session Cache
    async function loadDashboardStats() {
        const statIds = ["stat-visitors", "stat-transactions", "stat-revenue", "stat-wallets", "stat-recharges"];
        statIds.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.textContent = "...";
        });

        try {
            const todayIST = new Date().toLocaleDateString('en-CA'); // 'yyyy-MM-dd' in local IST timezone
            const cacheKey = 'pos_dashboard_stats_' + todayIST;
            const cached = sessionStorage.getItem(cacheKey);
            const cachedTime = sessionStorage.getItem(cacheKey + '_time');
            
            // If cached within last 45 seconds, render immediately
            if (cached && cachedTime && (Date.now() - parseInt(cachedTime)) < 45000) {
                renderStats(JSON.parse(cached));
                return;
            }

            const res = await fetchTransactionHistory({ startDate: todayIST, endDate: todayIST });
            if (res && res.status === "success" && Array.isArray(res.history)) {
                let visitors = 0;
                let transactions = 0;
                let revenue = 0;
                let rechargeRevenue = 0;
                const distinctCards = new Set();

                res.history.forEach(tx => {
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
                    if (tx.cardNumber) {
                        distinctCards.add(tx.cardNumber);
                    }
                    if (tx.type === "Ground Floor Recharge" || txId.startsWith("B-GF-REC")) {
                        rechargeRevenue += amt;
                        if (tx.cardNumber) distinctCards.add(tx.cardNumber);
                    }
                });

                const statsData = {
                    visitors: visitors > 0 ? visitors + "+" : (transactions > 0 ? transactions + "+" : "0"),
                    transactions: transactions,
                    revenue: "₹" + revenue.toLocaleString("en-IN"),
                    wallets: distinctCards.size > 0 ? distinctCards.size : (rechargeRevenue > 0 ? "Active" : "0"),
                    recharges: "₹" + rechargeRevenue.toLocaleString("en-IN")
                };

                // Cache calculated stats
                sessionStorage.setItem(cacheKey, JSON.stringify(statsData));
                sessionStorage.setItem(cacheKey + '_time', Date.now().toString());

                renderStats(statsData);
                if (typeof POSShare !== 'undefined') {
                    POSShare.cachedAllTransactions = res.history;
                    POSShare.switchDashboardReportPeriod(POSShare.currentSelectedPeriod || 'today');
                }
            } else {
                statIds.forEach(id => {
                    const el = document.getElementById(id);
                    if (el) el.textContent = "-";
                });
            }
        } catch (e) {
            console.error("Dashboard stats error:", e);
            statIds.forEach(id => {
                const el = document.getElementById(id);
                if (el) el.textContent = "-";
            });
        }
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

    loadDashboardStats();
});
