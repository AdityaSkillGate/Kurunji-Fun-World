/**
 * pos-usage.js
 * Logic for Ground Floor Point Redemption POS Module (Multi-Game)
 */

let adultQty = 1;
let childQty = 0;

function updateDemographics(type, change) {
    if (type === 'adult') {
        let n = adultQty + change;
        if (n >= 0 && n <= 50) adultQty = n;
        const el = document.getElementById('adult-count');
        if (el) el.value = adultQty;
    } else {
        let n = childQty + change;
        if (n >= 0 && n <= 50) childQty = n;
        const el = document.getElementById('child-count');
        if (el) el.value = childQty;
    }
}

function validateDemographics() {
    const a = parseInt(document.getElementById('adult-count')?.value || 0) || 0;
    const c = parseInt(document.getElementById('child-count')?.value || 0) || 0;
    adultQty = a < 0 ? 0 : a;
    childQty = c < 0 ? 0 : c;
    const aEl = document.getElementById('adult-count');
    const cEl = document.getElementById('child-count');
    if (aEl) aEl.value = adultQty;
    if (cEl) cEl.value = childQty;
}

let currentWallet = null;
let currentCustomerId = null;
let currentBalance = 0;
let cart = []; // Array of { attractionId, name, price, quantity, total }
let appliedCoupon = null;
let appliedDiscount = 0;
let appliedBonus = 0;
let pendingAttraction = null;
let pendingQty = 1;

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Enforce Auth
    const session = await requireStaffAuth();
    if (!session) return;
    
    const appBody = document.getElementById('app-body');
    if (appBody) appBody.classList.remove('hidden');

    // 2. Load Attractions
    loadAttractions();

    // 3. UI Handlers
    function onEl(id, evt, fn) {
        const el = document.getElementById(id);
        if (el) el.addEventListener(evt, fn);
    }

    onEl('load-wallet-btn', 'click', loadWallet);
    const cInput = document.getElementById('card-number-input');
    if (cInput) {
        cInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') loadWallet();
        });
    }

    onEl('confirm-btn', 'click', processMultiUsage);
    onEl('review-cancel-btn', 'click', () => {
        const rm = document.getElementById('review-modal');
        if (rm) rm.classList.add('hidden');
    });
    onEl('review-confirm-btn', 'click', executeOrder);
    onEl('clear-cart-btn', 'click', () => {
        if (confirm("Clear all items from this transaction?")) {
            cart = [];
            updateCartUI();
        }
    });

    // Qty Modal Handlers
    onEl('modal-qty-minus', 'click', () => updatePendingQty(-1));
    onEl('modal-qty-plus', 'click', () => updatePendingQty(1));
    onEl('modal-qty-cancel', 'click', () => {
        const qm = document.getElementById('qty-modal');
        if (qm) qm.classList.add('hidden');
        pendingAttraction = null;
    });
    onEl('modal-qty-add', 'click', confirmAddToCard);
});

async function loadAttractions() {
    const grid = document.getElementById('attraction-grid');
    const loading = document.getElementById('loading-games') || document.getElementById('loading-attractions');
    
    try {
        const response = await fetchGroundFloorAttractions();
        if (loading) loading.classList.add('hidden');
        
        if (grid && response && response.attractions && response.attractions.length > 0) {
            grid.innerHTML = '';
            response.attractions.forEach(attr => {
                const card = document.createElement('div');
                const hasPrice = attr.PointsPerPerson !== null && attr.PointsPerPerson !== "";
                const price = parseFloat(attr.PointsPerPerson) || 0;
                
                if (hasPrice) {
                    card.className = "bg-white border-2 border-slate-200 hover:border-primary rounded-xl p-3 sm:p-3.5 cursor-pointer shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-28 sm:h-32 active:scale-95 select-none group";
                    card.onclick = () => openQtyModal(attr, price);
                    card.innerHTML = `
                        <div class="font-bold text-slate-800 text-xs sm:text-sm line-clamp-2 group-hover:text-primary transition-colors">${attr.Name}</div>
                        <div class="flex justify-between items-end mt-1">
                            <div class="text-primary font-black bg-blue-50 py-0.5 px-2 rounded-lg text-xs sm:text-sm">
                                ${price} pts
                            </div>
                            <span class="material-symbols-outlined text-primary/70 group-hover:text-primary text-xl">add_circle</span>
                        </div>
                    `;
                } else {
                    card.className = "bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col justify-between h-28 opacity-50";
                    card.innerHTML = `
                        <div class="font-bold text-slate-400 text-xs line-clamp-2">${attr.Name}</div>
                        <div class="text-slate-400 text-[10px] mt-1">Not Configured</div>
                    `;
                }
                grid.appendChild(card);
            });
        }
    } catch (e) {
        console.error(e);
        if (loading) loading.textContent = "Error loading games.";
    }
}

async function loadWallet() {
    const cardInput = document.getElementById('card-number-input');
    const cardNumber = cardInput ? cardInput.value.trim().toUpperCase() : "";
    const errorBox = document.getElementById('wallet-error');
    const btn = document.getElementById('load-wallet-btn');
    const spinner = document.getElementById('load-spinner');
    
    if (errorBox) errorBox.classList.add('hidden');
    if (!cardNumber) return;
    
    if (btn) btn.disabled = true;
    if (spinner) { spinner.classList.remove('hidden'); spinner.classList.add('animate-spin'); }
    
    try {
        const response = await fetchWalletDetails(cardNumber);
        
        if (response && response.status === 'success') {
            currentWallet = response.walletId || cardNumber;
            currentCustomerId = response.customerId || "";
            currentBalance = parseFloat(response.balance) || 0;
            
            const balEl = document.getElementById('current-balance');
            const statEl = document.getElementById('wallet-status');
            const detEl = document.getElementById('wallet-details');
            const overlay = document.getElementById('attraction-overlay');
            const usageSec = document.getElementById('usage-section');
            
            if (balEl) balEl.textContent = `${currentBalance} pts`;
            if (statEl) statEl.textContent = response.statusText || "ACTIVE";
            if (detEl) detEl.classList.remove('hidden');
            
            // Unlock UI
            if (overlay) overlay.classList.add('hidden');
            if (usageSec) usageSec.classList.remove('pointer-events-none', 'opacity-50');
            
            // Reset Cart
            cart = [];
            updateCartUI();
        } else {
            throw new Error(response ? response.message || "Card not found." : "Card not found.");
        }
    } catch (e) {
        if (errorBox) {
            errorBox.textContent = e.message;
            errorBox.classList.remove('hidden');
        }
    } finally {
        if (btn) btn.disabled = false;
        if (spinner) {
            spinner.classList.add('hidden');
            spinner.classList.remove('animate-spin');
        }
    }
}

function openQtyModal(attr, price) {
    if (!currentWallet) {
        alert("Please load a card first!");
        return;
    }
    
    pendingAttraction = {
        attractionId: attr.AttractionID,
        name: attr.Name,
        price: price
    };
    pendingQty = 1;
    
    const titleEl = document.getElementById('qty-modal-title');
    const priceEl = document.getElementById('qty-modal-price');
    const inputEl = document.getElementById('modal-qty-input');
    const qm = document.getElementById('qty-modal');
    
    if (titleEl) titleEl.textContent = attr.Name;
    if (priceEl) priceEl.textContent = `${price} pts / person`;
    if (inputEl) inputEl.value = pendingQty;
    if (qm) qm.classList.remove('hidden');
}

function updatePendingQty(change) {
    let newQty = pendingQty + change;
    if (newQty >= 1 && newQty <= 20) {
        pendingQty = newQty;
        const el = document.getElementById('modal-qty-input');
        if (el) el.value = pendingQty;
    }
}

function confirmAddToCard() {
    if (!pendingAttraction) return;
    
    const existingIndex = cart.findIndex(item => item.attractionId === pendingAttraction.attractionId);
    if (existingIndex > -1) {
        cart[existingIndex].quantity += pendingQty;
        cart[existingIndex].total = cart[existingIndex].quantity * cart[existingIndex].price;
    } else {
        cart.push({
            attractionId: pendingAttraction.attractionId,
            name: pendingAttraction.name,
            price: pendingAttraction.price,
            quantity: pendingQty,
            total: pendingQty * pendingAttraction.price
        });
    }
    
    const qm = document.getElementById('qty-modal');
    if (qm) qm.classList.add('hidden');
    pendingAttraction = null;
    
    updateCartUI();
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartUI();
}

function updateCartUI() {
    const container = document.getElementById('cart-items');
    const emptyMsg = document.getElementById('empty-cart-msg');
    const clearBtn = document.getElementById('clear-cart-btn');
    const confirmBtn = document.getElementById('confirm-btn');
    const costDisplay = document.getElementById('total-cost');
    const remDisplay = document.getElementById('remaining-balance');
    const errorBox = document.getElementById('cart-error');
    
    if (container) {
        Array.from(container.children).forEach(child => {
            if (child.id !== 'empty-cart-msg') child.remove();
        });
    }
    
    let totalCost = 0;
    
    if (cart.length === 0) {
        if (container && emptyMsg) {
            container.appendChild(emptyMsg);
            emptyMsg.classList.remove('hidden');
        }
        if (clearBtn) clearBtn.classList.add('hidden');
        if (confirmBtn) {
            confirmBtn.disabled = true;
            confirmBtn.classList.add('opacity-50', 'cursor-not-allowed');
        }
    } else {
        if (emptyMsg) emptyMsg.classList.add('hidden');
        if (clearBtn) clearBtn.classList.remove('hidden');
        
        cart.forEach((item, index) => {
            totalCost += item.total;
            if (container) {
                const itemEl = document.createElement('div');
                itemEl.className = "bg-slate-50/80 p-3 rounded-xl border border-slate-200/80 flex justify-between items-center";
                itemEl.innerHTML = `
                    <div>
                        <div class="font-bold text-slate-800 text-xs sm:text-sm leading-tight">${item.name}</div>
                        <div class="text-[11px] text-slate-500 mt-0.5">${item.quantity} x ${item.price} pts</div>
                    </div>
                    <div class="flex items-center gap-3">
                        <div class="font-bold text-slate-700 text-sm">${item.total} pts</div>
                        <button type="button" class="text-slate-400 hover:text-red-500 p-1 transition-colors" onclick="removeFromCart(${index})" title="Remove">
                            <span class="material-symbols-outlined text-base">delete</span>
                        </button>
                    </div>
                `;
                container.appendChild(itemEl);
            }
        });
        
        if (confirmBtn) {
            confirmBtn.disabled = false;
            confirmBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        }
    }
    
    const finalCost = Math.max(0, totalCost - appliedDiscount);
    const rem = currentBalance - finalCost;
    
    if (costDisplay) costDisplay.textContent = `-${finalCost} pts`;
    if (remDisplay) remDisplay.textContent = `${rem} pts`;
    
    if (rem < 0) {
        if (remDisplay) remDisplay.className = "text-red-600 font-black text-lg";
        if (errorBox) {
            errorBox.textContent = `Insufficient Balance! (Need ${Math.abs(rem)} more pts)`;
            errorBox.classList.remove('hidden');
        }
        if (confirmBtn) {
            confirmBtn.disabled = true;
            confirmBtn.classList.add('opacity-50', 'cursor-not-allowed');
        }
    } else {
        if (remDisplay) remDisplay.className = "text-blue-700 font-black text-lg";
        if (errorBox) errorBox.classList.add('hidden');
    }
}

async function processMultiUsage() {
    if (cart.length === 0) return;
    
    const totalPoints = cart.reduce((sum, item) => sum + item.total, 0);
    const finalPoints = Math.max(0, totalPoints - appliedDiscount);
    
    if (currentBalance < finalPoints) {
        alert("Insufficient Balance!");
        return;
    }
    
    const btn = document.getElementById('confirm-btn');
    const spinner = document.getElementById('process-spinner');
    
    if (btn) btn.disabled = true;
    if (spinner) { spinner.classList.remove('hidden'); spinner.classList.add('animate-spin'); }
    
    const payload = {
        walletId: currentWallet,
        customerId: currentCustomerId,
        games: cart.map(item => ({
            attractionId: item.attractionId,
            name: item.name,
            pointsPerPerson: item.price,
            playersCount: item.quantity,
            totalPoints: item.total
        })),
        totalPoints: finalPoints,
        adultCount: adultQty,
        childCount: childQty
    };
    
    try {
        const response = await processMultiGameUsage(payload);
        
        if (response && response.status === 'success') {
            showResultModal(true, response);
        } else {
            throw new Error(response ? response.message || "Redemption failed." : "Redemption failed.");
        }
    } catch (e) {
        showResultModal(false, { message: e.message });
    } finally {
        if (btn) btn.disabled = false;
        if (spinner) {
            spinner.classList.add('hidden');
            spinner.classList.remove('animate-spin');
        }
    }
}

function showResultModal(isSuccess, data) {
    const modal = document.getElementById('result-modal');
    const content = document.getElementById('result-modal-content');
    
    if (!modal || !content) return;
    
    if (isSuccess) {
        let itemsHtml = '';
        cart.forEach(item => {
            itemsHtml += `
                <div class="flex justify-between text-xs py-1 border-b border-dashed border-slate-200">
                    <span>${item.name} (x${item.quantity})</span>
                    <span class="font-bold">${item.total} pts</span>
                </div>
            `;
        });
        
        content.innerHTML = `
            <div class="bg-green-600 text-white p-5 flex flex-col items-center">
                <span class="material-symbols-outlined text-4xl mb-1">check_circle</span>
                <h3 class="text-lg font-bold">Games Approved!</h3>
                <p class="text-xs text-green-100 mt-0.5">Points successfully deducted</p>
            </div>
            
            <div class="p-5 space-y-3 text-sm">
                <div class="space-y-1">
                    ${itemsHtml}
                </div>
                
                <div class="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5 text-xs">
                    <div class="flex justify-between">
                        <span class="text-slate-500">Points Deducted:</span>
                        <span class="font-bold text-red-600">-${data.totalPoints || cart.reduce((s, i) => s + i.total, 0)} pts</span>
                    </div>
                    <div class="flex justify-between border-t border-slate-200 pt-1 text-sm font-bold">
                        <span class="text-slate-700">Remaining Balance:</span>
                        <span class="text-blue-700">${data.remainingBalance !== undefined ? data.remainingBalance : (currentBalance - cart.reduce((s, i) => s + i.total, 0))} pts</span>
                    </div>
                </div>
            </div>
            
            <div class="p-3.5 bg-slate-50 border-t border-slate-200 flex gap-2">
                <a href="staff-pos.html" class="flex-1 bg-slate-800 hover:bg-slate-900 text-white font-bold py-2.5 rounded-xl text-center text-xs shadow transition-colors flex items-center justify-center gap-1">
                    <span class="material-symbols-outlined text-sm">home</span> Dashboard
                </a>
                <button type="button" onclick="location.reload()" class="flex-1 bg-primary hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-center text-xs shadow transition-colors flex items-center justify-center gap-1">
                    <span class="material-symbols-outlined text-sm">add_circle</span> Next Card
                </button>
            </div>
        `;
    } else {
        content.innerHTML = `
            <div class="bg-red-600 text-white p-5 flex flex-col items-center">
                <span class="material-symbols-outlined text-4xl mb-1">cancel</span>
                <h3 class="text-lg font-bold">Deduction Failed</h3>
            </div>
            <div class="p-5 text-center text-slate-700 text-sm">
                <p class="font-semibold text-red-600 mb-2">${data.message}</p>
                <p class="text-xs text-slate-500">Please check card balance or try again.</p>
            </div>
            <div class="p-3.5 bg-slate-50 border-t border-slate-200">
                <button type="button" onclick="document.getElementById('result-modal').classList.add('hidden')" class="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-2.5 rounded-xl text-xs">Dismiss</button>
            </div>
        `;
    }
    
    modal.classList.remove('hidden');
}
