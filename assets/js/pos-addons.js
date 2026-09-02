/**
 * pos-addons.js
 * Logic for Retail & F&B Add-ons POS Module (Unified Single Page)
 */

let cart = []; // Array of { id, name, category, price, taxRate, qty, total }
let appliedCoupon = null;
let appliedDiscount = 0;
let appliedBonus = 0;
let pendingProduct = null;
let pendingQty = 1;

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Enforce Auth
    const session = await requireStaffAuth();
    if (!session) return;
    
    const appBody = document.getElementById('app-body');
    if (appBody) appBody.classList.remove('hidden');

    // 2. Load Products
    loadProducts();

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
        pendingProduct = null;
    });
    onEl('modal-qty-add', 'click', confirmAddToCart);
    
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
                const res = await validateCoupon(code, subtotal, "SPECIFIC_PRODUCT", "ALL", "", false);
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

async function loadProducts() {
    const grid = document.getElementById('product-grid');
    const loading = document.getElementById('loading-products') || document.getElementById('loading-items');
    
    try {
        const response = await fetchAddons();
        if (loading) loading.classList.add('hidden');
        
        if (grid && response && response.addons && response.addons.length > 0) {
            grid.innerHTML = '';
            response.addons.forEach(prod => {
                const card = document.createElement('div');
                const hasPrice = prod.Price !== null && prod.Price !== "";
                const price = parseFloat(prod.Price) || 0;
                const taxRate = parseFloat(prod.TaxRate) || 0;
                const totalDisplay = price + (price * taxRate / 100);
                
                if (hasPrice) {
                    card.className = "bg-white border-2 border-slate-200 hover:border-primary rounded-xl p-3 sm:p-3.5 cursor-pointer shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-28 sm:h-32 active:scale-95 select-none group";
                    card.onclick = () => openQtyModal(prod, price, taxRate);
                    card.innerHTML = `
                        <div>
                            <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">${prod.Category || 'Retail'}</div>
                            <div class="font-bold text-slate-800 text-xs sm:text-sm line-clamp-1 group-hover:text-primary transition-colors">${prod.Name}</div>
                        </div>
                        <div class="flex justify-between items-end mt-1">
                            <div class="text-primary font-black bg-blue-50 py-0.5 px-2 rounded-lg text-xs sm:text-sm">
                                ₹${totalDisplay}
                            </div>
                            <span class="material-symbols-outlined text-primary/70 group-hover:text-primary text-xl">add_circle</span>
                        </div>
                    `;
                }
                grid.appendChild(card);
            });
        }
    } catch (e) {
        console.error(e);
        if (loading) loading.textContent = "Error loading products.";
    }
}

function openQtyModal(prod, price, taxRate) {
    pendingProduct = {
        id: prod.ProductID,
        name: prod.Name,
        category: prod.Category,
        price: price,
        taxRate: taxRate
    };
    pendingQty = 1;
    
    const titleEl = document.getElementById('qty-modal-title');
    const priceEl = document.getElementById('qty-modal-price');
    const inputEl = document.getElementById('modal-qty-input');
    const qm = document.getElementById('qty-modal');
    
    if (titleEl) titleEl.textContent = prod.Name;
    if (priceEl) priceEl.textContent = `₹${price + (price * taxRate / 100)} / item`;
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

function confirmAddToCart() {
    if (!pendingProduct) return;
    
    const totalUnit = pendingProduct.price + (pendingProduct.price * pendingProduct.taxRate / 100);
    const existingIdx = cart.findIndex(item => item.id === pendingProduct.id);
    
    if (existingIdx >= 0) {
        cart[existingIdx].qty += pendingQty;
        cart[existingIdx].total = cart[existingIdx].qty * totalUnit;
    } else {
        cart.push({
            id: pendingProduct.id,
            name: pendingProduct.name,
            category: pendingProduct.category,
            price: totalUnit,
            taxRate: pendingProduct.taxRate,
            qty: pendingQty,
            total: pendingQty * totalUnit
        });
    }
    
    const qm = document.getElementById('qty-modal');
    if (qm) qm.classList.add('hidden');
    pendingProduct = null;
    
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
            <div class="bg-purple-50 border border-purple-100 p-4 rounded-xl">
                <div class="text-sm font-bold text-purple-800 mb-2">Retail &amp; Add-ons Order</div>
                ${itemsHtml}
                <div class="flex justify-between text-slate-700 font-medium mt-2 pt-2 border-t border-purple-200 text-sm">
                    <span>Subtotal</span>
                    <span>₹${totalCost}</span>
                </div>
                ${discountBlock}
                <div class="flex justify-between text-xl font-bold text-slate-900 border-t border-purple-200 mt-2 pt-2">
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
    
    if (btn) btn.disabled = true;
    if (confirmBtn) confirmBtn.disabled = true;
    if (spinner) { spinner.classList.remove('hidden'); spinner.classList.add('animate-spin'); }
    
    try {
        const payload = {
            items: cart,
            paymentMethod,
            customerName: customerName || "Walk-in Guest",
            couponCode: document.getElementById("coupon-code") ? document.getElementById("coupon-code").value.trim().toUpperCase() : "",
            phone
        };
        
        const response = await processAddonsBilling(payload);
        
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
    setT('receipt-bill', response.billId || 'B-ADD-' + Date.now());
    
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
        const qrData = response.billId || 'B-ADD-' + Date.now();
        qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrData)}`;
    }
    
    const modal = document.getElementById('receipt-modal');
    if (modal) modal.classList.remove('hidden');
}

window.closeReceiptModal = function() {
    const modal = document.getElementById('receipt-modal');
    if (modal) modal.classList.add('hidden');
};
