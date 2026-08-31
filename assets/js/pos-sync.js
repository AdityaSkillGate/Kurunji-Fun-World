/**
 * pos-sync.js
 * Offline Billing & Cloud Auto-Sync Backup Manager for Kurunji Fun World Staff POS
 */

var POSOfflineSync = (function () {
    const QUEUE_KEY = 'kurunji_offline_bills_queue';
    let isSyncing = false;

    function getQueue() {
        try {
            return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
        } catch (e) {
            return [];
        }
    }

    function saveQueue(queue) {
        try {
            localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
        } catch (e) {
            console.error("Error saving offline queue", e);
        }
        renderSyncBadge();
    }

    function generateOfflineId(prefix) {
        return prefix + "-OFF-" + Date.now() + "-" + Math.floor(1000 + Math.random() * 9000);
    }

    function enqueue(action, payload, tempResult) {
        const queue = getQueue();
        const offlineItem = {
            id: tempResult.billId || tempResult.transaction || generateOfflineId("B"),
            action: action,
            payload: payload,
            result: tempResult,
            createdAt: new Date().toISOString(),
            retryCount: 0
        };
        queue.push(offlineItem);
        saveQueue(queue);
        console.log("Offline bill queued for sync:", offlineItem.id);
        
        // Try background sync if possible
        if (navigator.onLine) {
            setTimeout(syncNow, 1000);
        }
        return offlineItem;
    }

    async function syncNow() {
        if (isSyncing) return;
        const queue = getQueue();
        if (queue.length === 0) {
            renderSyncBadge();
            return;
        }

        if (!navigator.onLine) {
            console.log("Currently offline. Sync will resume when online.");
            renderSyncBadge();
            return;
        }

        isSyncing = true;
        renderSyncBadge(true);
        console.log(`Starting cloud sync for ${queue.length} offline bills...`);

        const remainingQueue = [];
        let syncedCount = 0;

        for (let i = 0; i < queue.length; i++) {
            const item = queue[i];
            try {
                if (typeof APPS_SCRIPT_URL === 'undefined' || APPS_SCRIPT_URL === 'YOUR_APPS_SCRIPT_URL_HERE') {
                    // Mock sync
                    await new Promise(r => setTimeout(r, 400));
                    syncedCount++;
                    continue;
                }

                // Append token
                if (typeof getAuthToken === 'function' && !item.payload.token) {
                    item.payload.token = getAuthToken();
                }

                const response = await fetch(APPS_SCRIPT_URL + '?action=' + item.action, {
                    method: 'POST',
                    body: JSON.stringify(item.payload),
                    headers: { 'Content-Type': 'text/plain;charset=utf-8' }
                });

                const res = await response.json();
                if (res && res.status === 'success') {
                    syncedCount++;
                    console.log(`✓ Successfully synced offline bill ${item.id} -> Cloud: ${res.billId || res.transaction}`);
                } else {
                    item.retryCount = (item.retryCount || 0) + 1;
                    if (item.retryCount < 5) remainingQueue.push(item);
                }
            } catch (err) {
                console.warn(`Sync failed for ${item.id}, will retry later:`, err.message);
                item.retryCount = (item.retryCount || 0) + 1;
                remainingQueue.push(item);
                break; // Stop iteration if connection failed
            }
        }

        saveQueue(remainingQueue);
        isSyncing = false;
        renderSyncBadge();

        if (syncedCount > 0) {
            showToast(`✓ Synced ${syncedCount} offline bills to Cloud Google Sheets!`);
        }
    }

    function showToast(msg) {
        let toast = document.getElementById('pos-sync-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'pos-sync-toast';
            toast.className = 'fixed bottom-5 right-5 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl z-[9999] text-sm font-semibold flex items-center gap-2 border border-slate-700 transition-all duration-300 transform translate-y-20 opacity-0';
            document.body.appendChild(toast);
        }
        toast.innerHTML = `<span class="material-symbols-outlined text-green-400 text-base">cloud_done</span> ${msg}`;
        toast.classList.remove('translate-y-20', 'opacity-0');
        setTimeout(() => {
            toast.classList.add('translate-y-20', 'opacity-0');
        }, 4000);
    }

    function renderSyncBadge(syncing = false) {
        const queue = getQueue();
        const count = queue.length;
        
        let badge = document.getElementById('offline-sync-badge');
        if (!badge) {
            // Find header to inject
            const headerRight = document.querySelector('header .flex.items-center.gap-3') || document.querySelector('header .flex.items-center.gap-4');
            if (headerRight) {
                badge = document.createElement('div');
                badge.id = 'offline-sync-badge';
                badge.className = 'flex items-center text-xs font-semibold';
                headerRight.prepend(badge);
            }
        }

        if (!badge) return;

        if (syncing) {
            badge.innerHTML = `
                <div class="flex items-center gap-1.5 bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2.5 py-1 rounded-full animate-pulse">
                    <span class="material-symbols-outlined text-xs animate-spin">sync</span>
                    <span class="hidden sm:inline">Syncing Cloud...</span>
                </div>
            `;
        } else if (count > 0) {
            badge.innerHTML = `
                <button onclick="POSOfflineSync.syncNow()" class="flex items-center gap-1.5 bg-amber-500 text-slate-950 font-bold px-2.5 py-1 rounded-full hover:bg-amber-400 shadow-md transition-all text-[11px]" title="Click to sync ${count} offline bills">
                    <span class="material-symbols-outlined text-xs">cloud_upload</span>
                    <span>${count} Offline</span>
                    <span class="bg-slate-900/20 px-1 rounded text-[10px]">Sync</span>
                </button>
            `;
        } else {
            const isOnline = navigator.onLine;
            badge.innerHTML = `
                <div class="flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold ${isOnline ? 'text-green-400' : 'text-amber-400'} opacity-80" title="${isOnline ? 'Cloud Connected' : 'Offline Mode Active'}">
                    <span class="w-2 h-2 rounded-full ${isOnline ? 'bg-green-400' : 'bg-amber-400'}"></span>
                    <span class="hidden md:inline">${isOnline ? 'Online' : 'Offline'}</span>
                </div>
            `;
        }
    }

    function init() {
        window.addEventListener('online', () => {
            console.log("Internet connection restored.");
            renderSyncBadge();
            syncNow();
        });
        window.addEventListener('offline', () => {
            console.log("Internet connection lost. Switched to offline mode.");
            renderSyncBadge();
        });

        // Periodic sync attempt every 30 seconds
        setInterval(() => {
            if (navigator.onLine && getQueue().length > 0) {
                syncNow();
            }
        }, 30000);

        document.addEventListener('DOMContentLoaded', () => {
            renderSyncBadge();
            if (navigator.onLine && getQueue().length > 0) {
                setTimeout(syncNow, 2000);
            }
        });
    }

    init();

    return {
        getQueue,
        enqueue,
        syncNow,
        generateOfflineId,
        renderSyncBadge
    };
})();
