/**
 * pos-outdoor.js
 * Logic for Outdoor Direct Billing POS Module (Unified Single Page)
 */

let cart = []; // Array of { id, name, price, qty, total }
let appliedCoupon = null;
let appliedDiscount = 0;
let appliedBonus = 0;
let pendingAttraction = null;
let pendingQty = 1;

function updateDemographics(type, change) {
    if (type === 'adult') {
        let n = (parseInt(document.getElementById('adult-count')?.value || 1) || 0) + change;
        if (n >= 0 && n <= 50) {
            const el = document.getElementById('adult-count');
            if (el) el.value = n;
        }
    } else {
        let n = (parseInt(document.getElementById('child-count')?.value || 0) || 0) + change;
        if (n >= 0 && n <= 50) {
            const el = document.getElementById('child-count');
            if (el) el.value = n;
        }
    }
}

function validateDemographics() {
    const aEl = document.getElementById('adult-count');
    const cEl = document.getElementById('child-count');
    if (aEl) {
        let val = parseInt(aEl.value) || 0;
        if (val < 0) val = 0;
        aEl.value = val;
    }
    if (cEl) {
        let val = parseInt(cEl.value) || 0;
        if (val < 0) val = 0;
        cEl.value = val;
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Enforce Auth
    const session = await requireStaffAuth();
    if (!session) return;
    
    const appBody = document.getElementById('app-body');
    if (appBody) appBody.classList.remove('hidden');

    // 2. Load Attractions Instantly
    loadAttractions();

    // 3. UI Handlers
    function onEl(id, evt, fn) {
        const el = document.getElementById(id);
        if (el) el.addEventListener(evt, fn);
    }

    onEl('confirm-btn', 'click', processBilling);
    onEl('complete-btn', 'click', processBilling);
    onEl('review-cancel-btn', 'click', () => {
        const m = document.getElementById('review-modal');
        if (m) m.classList.add('hidden');
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
    
    onEl('print-btn', 'click', () => window.print());
    onEl('new-txn-btn', 'click', () => window.location.reload());

    // Payment Method Selection
    document.querySelectorAll('.payment-method-card').forEach(card => {
        card.addEventListener('click', function() {
            if (this.querySelector('input[disabled]')) return;
            document.querySelectorAll('.payment-method-card').forEach(c => {
                c.classList.remove('border-primary', 'bg-blue-50/70', 'text-primary');
                c.classList.add('border-slate-200', 'text-slate-700');
                const radio = c.querySelector('input[type="radio"]');
                if (radio) radio.checked = false;
            });
            this.classList.remove('border-slate-200', 'text-slate-700');
            this.classList.add('border-primary', 'bg-blue-50/70', 'text-primary');
            const r = this.querySelector('input[type="radio"]');
            if (r) r.checked = true;
        });
    });

    // Coupon Apply
    const applyBtn = document.getElementById('apply-coupon-btn');
    if (applyBtn) {
        applyBtn.addEventListener('click', async () => {
            const codeInput = document.getElementById('coupon-code');
            const msgBox = document.getElementById('coupon-msg');
            const code = codeInput ? codeInput.value.trim().toUpperCase() : "";
            
            if (!code) {
                if (msgBox) {
                    msgBox.textContent = "Enter a code";
                    msgBox.className = "text-xs font-bold mt-1 text-red-600";
                    msgBox.classList.remove('hidden');
                }
                appliedCoupon = null;
                appliedDiscount = 0;
                appliedBonus = 0;
                updateCartUI();
                return;
            }
            
            if (msgBox) {
                msgBox.textContent = "Checking...";
                msgBox.className = "text-xs font-bold mt-1 text-slate-500";
                msgBox.classList.remove('hidden');
            }
            
            const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
            try {
                const res = await validateCoupon(code, subtotal, "OUTDOOR", "ALL", "", false);
                if (res && res.status === 'success' && res.coupon && res.coupon.valid) {
                    appliedCoupon = res.coupon;
                    appliedDiscount = res.coupon.discount || 0;
                    appliedBonus = res.coupon.bonusPoints || 0;
                    
                    let msg = "Applied!";
                    if (appliedDiscount > 0) msg += ` -₹${appliedDiscount}`;
                    if (appliedBonus > 0) msg += ` +${appliedBonus} pts`;
                    
                    if (msgBox) {
                        msgBox.textContent = msg;
                        msgBox.className = "text-xs font-bold mt-1 text-green-600";
                    }
                } else {
                    appliedCoupon = null;
                    appliedDiscount = 0;
                    appliedBonus = 0;
                    if (msgBox) {
                        msgBox.textContent = res ? res.message || "Invalid coupon" : "Invalid coupon";
                        msgBox.className = "text-xs font-bold mt-1 text-red-600";
                    }
                }
                updateCartUI();
            } catch (e) {
                if (msgBox) {
                    msgBox.textContent = "Error validating";
                    msgBox.className = "text-xs font-bold mt-1 text-red-600";
                }
            }
        });
    }

    // Customer Lookup
    const phoneInput = document.getElementById('cust-phone');
    if (phoneInput) {
        phoneInput.addEventListener('blur', async () => {
            const phone = phoneInput.value.trim();
            if (phone.length >= 10) {
                try {
                    const res = await fetchCustomerByPhone(phone);
                    if (res && res.status === 'success' && res.customer) {
                        const nameInput = document.getElementById('cust-name');
                        if (nameInput && !nameInput.value) {
                            nameInput.value = res.customer.name;
                        }
                    }
                } catch (e) {}
            }
        });
    }
});

async function loadAttractions() {
    const grid = document.getElementById('attraction-grid');
    const loading = document.getElementById('loading-attractions') || document.getElementById('loading-games');
    
    try {
        const response = await fetchOutdoorPricing();
        if (loading) loading.classList.add('hidden');
        
        if (grid && response && response.attractions && response.attractions.length > 0) {
            grid.innerHTML = '';
            response.attractions.forEach(attr => {
                const card = document.createElement('div');
                const hasPrice = attr.Price !== null && attr.Price !== "";
                const price = parseFloat(attr.Price) || 0;
                
                if (hasPrice) {
                    card.className = "bg-white border-2 border-slate-200 hover:border-primary rounded-xl p-3 sm:p-3.5 cursor-pointer shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-28 sm:h-32 active:scale-95 select-none group";
                    card.onclick = () => openQtyModal(attr, price);
                    card.innerHTML = `
                        <div class="font-bold text-slate-800 text-xs sm:text-sm line-clamp-2 group-hover:text-primary transition-colors">${attr.Name}</div>
                        <div class="flex justify-between items-end mt-1">
                            <div class="text-primary font-black bg-blue-50 py-0.5 px-2 rounded-lg text-xs sm:text-sm">
                                ₹${price}
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
        if (loading) loading.textContent = "Error loading attractions.";
    }
}

function openQtyModal(attr, price) {
    pendingAttraction = {
        id: attr.AttractionID,
        name: attr.Name,
        price: price
    };
    pendingQty = 1;
    
    const titleEl = document.getElementById('qty-modal-title');
    const priceEl = document.getElementById('qty-modal-price');
    const inputEl = document.getElementById('modal-qty-input');
    const qm = document.getElementById('qty-modal');
    
    if (titleEl) titleEl.textContent = attr.Name;
    if (priceEl) priceEl.textContent = `₹${price} / visitor`;
    if (inputEl) inputEl.value = pendingQty;
    if (qm) qm.classList.remove('hidden');
}

function updatePendingQty(change) {
    let newQty = pendingQty + change;
    if (newQty >= 1 && newQty <= 50) {
        pendingQty = newQty;
        const el = document.getElementById('modal-qty-input');
        if (el) el.value = pendingQty;
    }
}

function confirmAddToCard() {
    if (!pendingAttraction) return;
    
    const existingIdx = cart.findIndex(item => item.id === pendingAttraction.id);
    if (existingIdx >= 0) {
        cart[existingIdx].qty += pendingQty;
        cart[existingIdx].total = cart[existingIdx].qty * cart[existingIdx].price;
    } else {
        cart.push({
            id: pendingAttraction.id,
            name: pendingAttraction.name,
            price: pendingAttraction.price,
            qty: pendingQty,
            total: pendingQty * pendingAttraction.price
        });
    }
    
    const qm = document.getElementById('qty-modal');
    if (qm) qm.classList.add('hidden');
    pendingAttraction = null;
    
    updateCartUI();
}

function removeFromCart(idx) {
    cart.splice(idx, 1);
    updateCartUI();
}

function updateCartUI() {
    const container = document.getElementById('cart-items');
    const emptyMsg = document.getElementById('empty-cart-msg');
    const clearBtn = document.getElementById('clear-cart-btn');
    const confirmBtn = document.getElementById('confirm-btn') || document.getElementById('complete-btn');
    
    if (container) {
        Array.from(container.children).forEach(child => { if (child.id !== 'empty-cart-msg') child.remove(); });
    }
    
    let totalCost = 0;
    
    if (cart.length === 0) {
        if (container && emptyMsg) { container.appendChild(emptyMsg); emptyMsg.classList.remove('hidden'); }
        if (clearBtn) clearBtn.classList.add('hidden');
        if (confirmBtn) {
            confirmBtn.disabled = true;
            confirmBtn.classList.add('opacity-50', 'cursor-not-allowed');
        }
    } else {
        if (emptyMsg) emptyMsg.classList.add('hidden');
        if (clearBtn) clearBtn.classList.remove('hidden');
        
        cart.forEach((item, idx) => {
            totalCost += item.total;
            if (container) {
                const div = document.createElement('div');
                div.className = "bg-slate-50/80 p-3 rounded-xl border border-slate-200/80 flex justify-between items-center";
                div.innerHTML = `
                    <div>
                        <div class="font-bold text-slate-800 text-xs sm:text-sm leading-tight">${item.name}</div>
                        <div class="text-[11px] text-slate-500 mt-0.5">${item.qty} x ₹${item.price}</div>
                    </div>
                    <div class="flex items-center gap-3">
                        <div class="font-bold text-primary text-sm">₹${item.total}</div>
                        <button type="button" class="text-slate-400 hover:text-red-500 p-1 transition-colors" onclick="removeFromCart(${idx})" title="Remove">
                            <span class="material-symbols-outlined text-base">delete</span>
                        </button>
                    </div>
                `;
                container.appendChild(div);
            }
        });
        
        if (confirmBtn) {
            confirmBtn.disabled = false;
            confirmBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        }
    }
    
    const finalTotal = Math.max(0, totalCost - appliedDiscount);
    const tcEl = document.getElementById('total-cost');
    if (tcEl) tcEl.textContent = `₹${finalTotal}`;
}

function processBilling() {
    if (cart.length === 0) return;
    
    let totalCost = cart.reduce((sum, item) => sum + item.total, 0);
    let finalPay = Math.max(0, totalCost - appliedDiscount);
    let discountBlock = '';
    
    if (appliedDiscount > 0) {
        discountBlock = `<div class="flex justify-between text-green-600 font-semibold mb-2 text-sm"><span>Discount</span><span>-₹${appliedDiscount}</span></div>`;
    }
    
    let itemsHtml = '';
    cart.forEach(item => {
        itemsHtml += `<div class="flex justify-between text-slate-700 font-medium mb-1 text-sm">
            <span>${item.name} (x${item.qty})</span>
            <span>₹${item.total}</span>
        </div>`;
    });
    
    const content = `
        <div class="space-y-4">
            <div class="bg-green-50 border border-green-100 p-4 rounded-xl">
                <div class="text-sm font-bold text-green-800 mb-2">Outdoor Games Order</div>
                ${itemsHtml}
                <div class="flex justify-between text-slate-700 font-medium mt-2 pt-2 border-t border-green-200 text-sm">
                    <span>Subtotal</span>
                    <span>₹${totalCost}</span>
                </div>
                ${discountBlock}
                <div class="flex justify-between text-xl font-bold text-slate-900 border-t border-green-200 mt-2 pt-2">
                    <span>Total Payable</span>
                    <span class="text-primary">₹${finalPay}</span>
                </div>
            </div>
        </div>
    `;
    
    const rc = document.getElementById('review-content');
    const rm = document.getElementById('review-modal');
    if (rc) rc.innerHTML = content;
    if (rm) rm.classList.remove('hidden');
}

async function executeOrder() {
    if (cart.length === 0) return;
    
    const errBox = document.getElementById('cart-error');
    if (errBox) errBox.classList.add('hidden');
    
    const btn = document.getElementById('review-confirm-btn');
    const confirmBtn = document.getElementById('confirm-btn') || document.getElementById('complete-btn');
    const spinner = document.getElementById('review-spinner') || document.getElementById('process-spinner');
    
    const paymentRadio = document.querySelector('input[name="payment-method"]:checked');
    const paymentMethod = paymentRadio ? paymentRadio.value : 'Cash';
    const customerName = document.getElementById('cust-name') ? document.getElementById('cust-name').value.trim() : "Walk-in Guest";
    const phone = document.getElementById('cust-phone') ? document.getElementById('cust-phone').value.trim() : "";
    const adultCount = parseInt(document.getElementById('adult-count')?.value || 1) || 1;
    const childCount = parseInt(document.getElementById('child-count')?.value || 0) || 0;
    
    if (btn) btn.disabled = true;
    if (confirmBtn) confirmBtn.disabled = true;
    if (spinner) { spinner.classList.remove('hidden'); spinner.classList.add('animate-spin'); }
    
    try {
        const payload = {
            items: cart,
            paymentMethod,
            customerName: customerName || "Walk-in Guest",
            couponCode: document.getElementById("coupon-code") ? document.getElementById("coupon-code").value.trim().toUpperCase() : "",
            phone,
            adultCount,
            childCount
        };
        
        const response = await processOutdoorBilling(payload);
        
        if (response && response.status === 'success') {
            const rm = document.getElementById('review-modal');
            if (rm) rm.classList.add('hidden');
            showReceipt(response, paymentMethod);
        } else {
            throw new Error(response ? response.message || "Transaction failed" : "Transaction failed");
        }
    } catch (e) {
        if (errBox) {
            errBox.textContent = e.message;
            errBox.classList.remove('hidden');
        }
        if (btn) btn.disabled = false;
        if (confirmBtn) confirmBtn.disabled = false;
    } finally {
        if (spinner) {
            spinner.classList.add('hidden');
            spinner.classList.remove('animate-spin');
        }
    }
}

function showReceipt(response, mode) {
    const offBadge = document.getElementById('receipt-offline-badge');
    if (offBadge) {
        if (response && response.offline) offBadge.classList.remove('hidden');
        else offBadge.classList.add('hidden');
    }
    
    const setT = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
    };

    setT('receipt-date', new Date().toLocaleString('en-IN'));
    setT('receipt-bill', response.billId || 'B-OUT-' + Date.now());
    
    const itemsContainer = document.getElementById('receipt-items');
    if (itemsContainer) {
        itemsContainer.innerHTML = '';
        const items = response.items || cart;
        items.forEach(item => {
            const div = document.createElement('div');
            div.className = "flex justify-between font-semibold text-slate-800 text-xs";
            div.innerHTML = `
                <span>${item.name} <span class="text-slate-500 font-normal">x${item.qty}</span></span>
                <span>₹${item.total || (item.price * item.qty)}</span>
            `;
            itemsContainer.appendChild(div);
        });
    }
    
    setT('receipt-total', `₹${response.total || cart.reduce((s, i) => s + i.total, 0)}`);
    setT('receipt-mode', mode);
    
    const qrImg = document.getElementById('receipt-qr');
    if (qrImg) {
        const qrData = response.billId || 'B-OUT-' + Date.now();
        qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrData)}`;
    }
    
    const modal = document.getElementById('receipt-modal');
    if (modal) modal.classList.remove('hidden');
}

window.closeReceiptModal = function() {
    const modal = document.getElementById('receipt-modal');
    if (modal) modal.classList.add('hidden');
};
