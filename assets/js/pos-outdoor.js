/**
 * assets/js/pos-outdoor.js
 * Outdoor POS Single-Page Billing with Item-Level Adult & Child Member Selection
 * Kurunji Fun World Staff POS
 */

let cart = [];
let pendingAttraction = null;
let pendingAdultQty = 1;
let pendingChildQty = 0;
let appliedCoupon = null;
let appliedDiscount = 0;
let appliedBonus = 0;

document.addEventListener('DOMContentLoaded', () => {
    // Fast local auth check
    const session = requireStaffAuth();
    if (!session) return;

    // Load Attractions Grid
    loadAttractions();

    // Clear Cart button
    const clearBtn = document.getElementById('clear-cart-btn');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            cart = [];
            appliedCoupon = null;
            appliedDiscount = 0;
            appliedBonus = 0;
            updateCartUI();
        });
    }

    // Modal Qty Add & Cancel
    const modalAdd = document.getElementById('modal-qty-add');
    if (modalAdd) modalAdd.addEventListener('click', confirmAddToCard);

    const modalCancel = document.getElementById('modal-qty-cancel');
    if (modalCancel) {
        modalCancel.addEventListener('click', () => {
            const qm = document.getElementById('qty-modal');
            if (qm) qm.classList.add('hidden');
            pendingAttraction = null;
        });
    }

    // Review Modal Buttons
    const reviewBtn = document.getElementById('complete-btn') || document.getElementById('confirm-btn');
    if (reviewBtn) reviewBtn.addEventListener('click', processBilling);

    const reviewConfirm = document.getElementById('review-confirm-btn');
    if (reviewConfirm) reviewConfirm.addEventListener('click', executeOrder);

    const reviewCancel = document.getElementById('review-cancel-btn');
    if (reviewCancel) {
        reviewCancel.addEventListener('click', () => {
            const rm = document.getElementById('review-modal');
            if (rm) rm.classList.add('hidden');
        });
    }

    // Payment Radio Styling
    document.querySelectorAll('.payment-radio-card').forEach(card => {
        card.addEventListener('click', function() {
            const r = this.querySelector('input[type="radio"]');
            if (r) r.checked = true;
        });
    });

    // Coupon Apply
    const applyBtn = document.getElementById('apply-coupon-btn');
    if (applyBtn) {
        applyBtn.addEventListener('click', applyCoupon);
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

    // New Transaction button
    const newTxnBtn = document.getElementById('new-txn-btn');
    if (newTxnBtn) {
        newTxnBtn.addEventListener('click', () => {
            location.reload();
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

/**
 * Open Modal to choose Adult & Child Tickets for this specific ride
 */
function openQtyModal(attr, price) {
    pendingAttraction = {
        id: attr.AttractionID,
        name: attr.Name,
        price: price
    };
    
    // Check if this ride is already in cart to prefill
    const existing = cart.find(item => item.id === attr.AttractionID);
    if (existing) {
        pendingAdultQty = existing.adultQty || 0;
        pendingChildQty = existing.childQty || 0;
    } else {
        pendingAdultQty = 1;
        pendingChildQty = 0;
    }
    
    const titleEl = document.getElementById('qty-modal-title');
    const priceEl = document.getElementById('qty-modal-price');
    const adultRateEl = document.getElementById('modal-adult-rate');
    const childRateEl = document.getElementById('modal-child-rate');
    const adultInput = document.getElementById('modal-adult-input');
    const childInput = document.getElementById('modal-child-input');
    const qm = document.getElementById('qty-modal');
    
    if (titleEl) titleEl.textContent = attr.Name;
    if (priceEl) priceEl.textContent = `₹${price} / visitor`;
    if (adultRateEl) adultRateEl.textContent = `₹${price} each`;
    if (childRateEl) childRateEl.textContent = `₹${price} each`;
    if (adultInput) adultInput.value = pendingAdultQty;
    if (childInput) childInput.value = pendingChildQty;
    
    updateModalTotalsPreview();
    if (qm) qm.classList.remove('hidden');
}

/**
 * Adjust Adult or Child count inside the ride modal
 */
function updateModalQty(type, delta) {
    if (type === 'adult') {
        let val = pendingAdultQty + delta;
        if (val < 0) val = 0;
        if (val > 50) val = 50;
        pendingAdultQty = val;
        const el = document.getElementById('modal-adult-input');
        if (el) el.value = pendingAdultQty;
    } else if (type === 'child') {
        let val = pendingChildQty + delta;
        if (val < 0) val = 0;
        if (val > 50) val = 50;
        pendingChildQty = val;
        const el = document.getElementById('modal-child-input');
        if (el) el.value = pendingChildQty;
    }
    updateModalTotalsPreview();
}

function updateModalTotalsPreview() {
    if (!pendingAttraction) return;
    const totalTickets = pendingAdultQty + pendingChildQty;
    const subtotal = totalTickets * pendingAttraction.price;
    
    const ticketsEl = document.getElementById('modal-total-tickets');
    const subtotalEl = document.getElementById('modal-subtotal-price');
    const addBtn = document.getElementById('modal-qty-add');
    
    if (ticketsEl) ticketsEl.textContent = `${totalTickets} ticket${totalTickets === 1 ? '' : 's'} (${pendingAdultQty}A / ${pendingChildQty}C)`;
    if (subtotalEl) subtotalEl.textContent = `₹${subtotal}`;
    
    if (addBtn) {
        if (totalTickets <= 0) {
            addBtn.disabled = true;
            addBtn.classList.add('opacity-50', 'cursor-not-allowed');
        } else {
            addBtn.disabled = false;
            addBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        }
    }
}

/**
 * Add / Update the selected ride in Cart with adult/child breakdown
 */
function confirmAddToCard() {
    if (!pendingAttraction) return;
    const totalTickets = pendingAdultQty + pendingChildQty;
    if (totalTickets <= 0) return;
    
    const existingIdx = cart.findIndex(item => item.id === pendingAttraction.id);
    if (existingIdx >= 0) {
        cart[existingIdx].adultQty = pendingAdultQty;
        cart[existingIdx].childQty = pendingChildQty;
        cart[existingIdx].qty = totalTickets;
        cart[existingIdx].total = totalTickets * pendingAttraction.price;
    } else {
        cart.push({
            id: pendingAttraction.id,
            name: pendingAttraction.name,
            price: pendingAttraction.price,
            adultQty: pendingAdultQty,
            childQty: pendingChildQty,
            qty: totalTickets,
            total: totalTickets * pendingAttraction.price
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
    let totalAdults = 0;
    let totalChildren = 0;
    
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
            totalAdults += (item.adultQty || 0);
            totalChildren += (item.childQty || 0);

            let breakdownParts = [];
            if (item.adultQty > 0) breakdownParts.push(`${item.adultQty} Adult${item.adultQty > 1 ? 's' : ''}`);
            if (item.childQty > 0) breakdownParts.push(`${item.childQty} Child${item.childQty > 1 ? 'ren' : ''}`);
            const breakdownStr = breakdownParts.join(', ');

            if (container) {
                const div = document.createElement('div');
                div.className = "bg-slate-50/80 p-3 rounded-xl border border-slate-200/80 flex justify-between items-center hover:border-slate-300 transition-colors";
                div.innerHTML = `
                    <div class="cursor-pointer" onclick="openQtyModal({AttractionID: '${item.id}', Name: '${item.name.replace(/'/g, "\'")}'}, ${item.price})">
                        <div class="font-bold text-slate-800 text-xs sm:text-sm leading-tight hover:text-primary transition-colors">${item.name}</div>
                        <div class="text-[11px] text-slate-500 mt-0.5 font-medium">
                            <span class="bg-blue-100/70 text-blue-700 font-bold px-1.5 py-0.5 rounded text-[10px] mr-1">${breakdownStr}</span>
                            <span>(${item.qty} x ₹${item.price})</span>
                        </div>
                    </div>
                    <div class="flex items-center gap-3">
                        <div class="font-bold text-primary text-sm sm:text-base">₹${item.total}</div>
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

/**
 * Review Modal displaying exact calculated Demographics and items
 */
function processBilling() {
    if (cart.length === 0) return;
    
    let totalCost = cart.reduce((sum, item) => sum + item.total, 0);
    let finalPay = Math.max(0, totalCost - appliedDiscount);
    let totalAdults = cart.reduce((sum, item) => sum + (item.adultQty || 0), 0);
    let totalChildren = cart.reduce((sum, item) => sum + (item.childQty || 0), 0);
    let totalVisitors = totalAdults + totalChildren;

    let discountBlock = '';
    if (appliedDiscount > 0) {
        discountBlock = `<div class="flex justify-between text-green-600 font-semibold mb-2 text-sm"><span>Discount</span><span>-₹${appliedDiscount}</span></div>`;
    }
    
    let itemsHtml = '';
    cart.forEach(item => {
        let breakdown = [];
        if (item.adultQty > 0) breakdown.push(`${item.adultQty}A`);
        if (item.childQty > 0) breakdown.push(`${item.childQty}C`);
        itemsHtml += `<div class="flex justify-between text-slate-700 font-medium mb-1.5 text-xs sm:text-sm">
            <span>${item.name} <strong class="text-slate-500 text-xs">(${breakdown.join(', ')})</strong></span>
            <span class="font-bold">₹${item.total}</span>
        </div>`;
    });
    
    const customerName = document.getElementById('cust-name') ? document.getElementById('cust-name').value.trim() : "";
    const phone = document.getElementById('cust-phone') ? document.getElementById('cust-phone').value.trim() : "";

    const content = `
        <div class="space-y-3.5">
            <div class="bg-green-50/80 border border-green-200/80 p-3.5 rounded-xl text-xs sm:text-sm">
                <div class="flex justify-between text-slate-700 mb-1">
                    <span>Customer</span>
                    <strong class="text-slate-900">${customerName || "Walk-in Guest"}</strong>
                </div>
                ${phone ? `<div class="flex justify-between text-slate-700 mb-1"><span>Mobile</span><strong class="font-mono text-slate-900">+91 ${phone}</strong></div>` : ''}
                <div style="margin:12px;" class="flex justify-between text-emerald-800 font-bold border-t border-green-200/80 pt-1.5 mt-1.5">
                    <span>Total Members</span>
                    <span>${totalVisitors} Visitors (${totalAdults} Adults, ${totalChildren} Children)</span>
                </div>
            </div>

            <div class="bg-slate-50 border border-slate-200 p-3.5 rounded-xl">
                <div class="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Selected Rides Breakdown</div>
                ${itemsHtml}
                <div class="flex justify-between text-slate-700 font-medium mt-2 pt-2 border-t border-slate-200 text-xs sm:text-sm">
                    <span>Subtotal</span>
                    <span>₹${totalCost}</span>
                </div>
                ${discountBlock}
                <div class="flex justify-between text-base sm:text-lg font-bold text-slate-900 border-t border-slate-200 mt-2 pt-2">
                    <span>Total Payable</span>
                    <span class="text-primary font-black">₹${finalPay}</span>
                </div>
            </div>
        </div>
    `;
    
    const rc = document.getElementById('review-content');
    const rm = document.getElementById('review-modal');
    if (rc) rc.innerHTML = content;
    if (rm) rm.classList.remove('hidden');
}

/**
 * Execute Order & send exact adult/child counts to Backend
 */
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
    
    // Exact calculated demographics from all chosen ride tickets
    const totalAdults = cart.reduce((sum, item) => sum + (item.adultQty || 0), 0);
    const totalChildren = cart.reduce((sum, item) => sum + (item.childQty || 0), 0);
    
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
            adultCount: totalAdults,
            childCount: totalChildren
        };
        
        const response = await processOutdoorBilling(payload);
        
        if (response && response.status === 'success') {
            const rm = document.getElementById('review-modal');
            if (rm) rm.classList.add('hidden');
            showReceipt(response, paymentMethod, totalAdults, totalChildren);
        } else {
            throw new Error(response ? response.message || "Transaction failed" : "Transaction failed");
        }
    } catch (e) {
        if (errBox) {
            errBox.textContent = e.message;
            errBox.classList.remove('hidden');
        }
        if (btn) btn.disabled = false;
        if (confirmBtn) {
            confirmBtn.disabled = false;
            confirmBtn.innerHTML = `<span>Confirm &amp; Bill</span> <span class="material-symbols-outlined text-base animate-spin hidden" id="review-spinner">progress_activity</span>`;
        }
    } finally {
        if (spinner) {
            spinner.classList.add('hidden');
            spinner.classList.remove('animate-spin');
        }
    }
}

function showReceipt(response, paymentMethod, totalAdults = 1, totalChildren = 0) {
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
    setT('receipt-bill', response.billId || response.bookingId || response.transaction || 'B-OUT-' + Date.now());
    
    let subtotal = cart.reduce((sum, item) => sum + item.total, 0);
    let finalPay = Math.max(0, subtotal - appliedDiscount);
    setT('receipt-total', `₹${finalPay}`);
    setT('receipt-mode', paymentMethod);
    
    // Inject clean item breakdown into receipt modal
    const itemsContainer = document.getElementById('receipt-items');
    if (itemsContainer) {
        itemsContainer.innerHTML = '';
        cart.forEach(item => {
            let breakdown = [];
            if (item.adultQty > 0) breakdown.push(`${item.adultQty} Adult(s)`);
            if (item.childQty > 0) breakdown.push(`${item.childQty} Child(ren)`);

            const row = document.createElement('div');
            row.className = "flex justify-between text-xs py-0.5 text-slate-700";
            row.innerHTML = `
                <span>${item.name} (${breakdown.join(', ')})</span>
                <span class="font-bold">₹${item.total}</span>
            `;
            itemsContainer.appendChild(row);
        });

        // Demographics summary row
        const demoRow = document.createElement('div');
        demoRow.className = "flex justify-between text-[11px] font-bold text-slate-500 pt-1 border-t border-slate-100";
        demoRow.innerHTML = `
            <span>Total Visitors</span>
            <span>${totalAdults + totalChildren} (${totalAdults}A / ${totalChildren}C)</span>
        `;
        itemsContainer.appendChild(demoRow);
    }
    
    // Generate QR Code for check-in
    const qrImg = document.getElementById('receipt-qr');
    const qrContainer = document.getElementById('qr-container');
    const billId = response.billId || response.bookingId || response.transaction || 'B-OUT-' + Date.now();
    
    if (qrImg) {
        qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(billId)}`;
        if (qrContainer) qrContainer.classList.remove('hidden');
    }
    
    const modal = document.getElementById('receipt-modal');
    if (modal) modal.classList.remove('hidden');
}

async function applyCoupon() {
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
}

window.closeReceiptModal = function() {
    const modal = document.getElementById('receipt-modal');
    if (modal) modal.classList.add('hidden');
};



window.executeOrder = executeOrder;

// Global window exports for HTML onclick handlers
window.processBilling = processBilling;
window.handleOutdoorSubmit = processBilling;
window.executeOrder = executeOrder;
window.openQtyModal = openQtyModal;
window.updateModalQty = updateModalQty;
window.confirmAddToCard = confirmAddToCard;
window.removeFromCart = removeFromCart;
window.applyCoupon = applyCoupon;
