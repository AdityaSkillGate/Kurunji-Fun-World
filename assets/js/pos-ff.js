/**
 * pos-ff.js
 * Logic for First Floor Direct Billing POS Module (Unified Single Page)
 */

let childPrice = 599;
let adultPrice = 899;
let childQty = 0;
let adultQty = 0;
let grandTotal = 0;
let appliedCoupon = null;
let appliedDiscount = 0;
let appliedBonus = 0;

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Enforce Auth
    const session = await requireStaffAuth();
    if (!session) return;
    
    const appBody = document.getElementById('app-body');
    if (appBody) appBody.classList.remove('hidden');

    // 2. Load Pricing
    loadPricing();

    // 3. UI Event Listeners
    function onEl(id, evt, fn) {
        const el = document.getElementById(id);
        if (el) el.addEventListener(evt, fn);
    }

    onEl('complete-btn', 'click', handleBillingSubmit);
    onEl('confirm-btn', 'click', handleBillingSubmit);
    onEl('review-cancel-btn', 'click', () => {
        const m = document.getElementById('review-modal');
        if (m) m.classList.add('hidden');
    });
    onEl('review-confirm-btn', 'click', executeOrder);
    
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

    // Coupon Apply Logic
    const applyBtn = document.getElementById('apply-coupon-btn');
    if (applyBtn) {
        applyBtn.addEventListener('click', async () => {
            const codeInput = document.getElementById('coupon-code');
            const msgBox = document.getElementById('coupon-msg');
            const code = codeInput ? codeInput.value.trim().toUpperCase() : "";
            
            if (!code) {
                if (msgBox) {
                    msgBox.textContent = "Enter a code";
                    msgBox.className = "text-xs font-bold mt-1.5 text-red-600";
                    msgBox.classList.remove('hidden');
                }
                appliedCoupon = null;
                appliedDiscount = 0;
                appliedBonus = 0;
                updateTotals();
                return;
            }
            
            if (msgBox) {
                msgBox.textContent = "Checking...";
                msgBox.className = "text-xs font-bold mt-1.5 text-slate-500";
                msgBox.classList.remove('hidden');
            }
            
            const subtotal = (childQty * childPrice) + (adultQty * adultPrice);
            try {
                const res = await validateCoupon(code, subtotal, "FIRST_FLOOR", "ALL", "", false);
                if (res && res.status === 'success' && res.coupon && res.coupon.valid) {
                    appliedCoupon = res.coupon;
                    appliedDiscount = res.coupon.discount || 0;
                    appliedBonus = res.coupon.bonusPoints || 0;
                    
                    let msg = "Applied!";
                    if (appliedDiscount > 0) msg += ` -₹${appliedDiscount}`;
                    if (appliedBonus > 0) msg += ` +${appliedBonus} pts`;
                    
                    if (msgBox) {
                        msgBox.textContent = msg;
                        msgBox.className = "text-xs font-bold mt-1.5 text-green-600";
                    }
                } else {
                    appliedCoupon = null;
                    appliedDiscount = 0;
                    appliedBonus = 0;
                    if (msgBox) {
                        msgBox.textContent = res ? res.message || "Invalid coupon" : "Invalid coupon";
                        msgBox.className = "text-xs font-bold mt-1.5 text-red-600";
                    }
                }
                updateTotals();
            } catch (e) {
                if (msgBox) {
                    msgBox.textContent = "Error validating";
                    msgBox.className = "text-xs font-bold mt-1.5 text-red-600";
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

async function loadPricing() {
    const loading = document.getElementById('loading-pricing');
    const selection = document.getElementById('ticket-selection');
    
    try {
        const response = await fetchFirstFloorPricing();
        if (response && response.status === 'success' && response.pricing) {
            childPrice = parseFloat(response.pricing.childPrice) || 599;
            adultPrice = parseFloat(response.pricing.adultPrice) || 899;
            
            const cpEl = document.getElementById('child-price-display');
            const apEl = document.getElementById('adult-price-display');
            const actEl = document.getElementById('ff-activities');
            
            if (cpEl) cpEl.textContent = `₹${childPrice}`;
            if (apEl) apEl.textContent = `₹${adultPrice}`;
            if (actEl && response.pricing.activities) actEl.textContent = `Includes: ${response.pricing.activities}`;
        }
    } catch (e) {
        console.warn("Using default pricing:", e);
    } finally {
        if (loading) loading.classList.add('hidden');
        if (selection) selection.classList.remove('hidden');
        updateTotals();
    }
}

function updateQty(type, change) {
    if (type === 'child') {
        let n = childQty + change;
        if (n >= 0 && n <= 50) childQty = n;
        const el = document.getElementById('child-qty');
        if (el) el.value = childQty;
    } else {
        let n = adultQty + change;
        if (n >= 0 && n <= 50) adultQty = n;
        const el = document.getElementById('adult-qty');
        if (el) el.value = adultQty;
    }
    updateTotals();
}

function updateTotals() {
    const cTotal = childQty * childPrice;
    const aTotal = adultQty * adultPrice;
    const subtotal = cTotal + aTotal;
    grandTotal = Math.max(0, subtotal - appliedDiscount);
    
    const setT = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
    };

    setT('summary-child-qty', childQty);
    setT('summary-child-total', `₹${cTotal}`);
    setT('summary-adult-qty', adultQty);
    setT('summary-adult-total', `₹${aTotal}`);
    setT('subtotal-display', `₹${subtotal}`);
    setT('summary-subtotal', `₹${subtotal}`);
    setT('grand-total-display', `₹${grandTotal}`);
    
    const completeBtn = document.getElementById('complete-btn') || document.getElementById('confirm-btn');
    const reviewConfirmBtn = document.getElementById('review-confirm-btn');
    
    if (subtotal > 0) {
        if (completeBtn) {
            completeBtn.disabled = false;
            completeBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        }
        if (reviewConfirmBtn) {
            reviewConfirmBtn.disabled = false;
            reviewConfirmBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        }
    } else {
        if (completeBtn) {
            completeBtn.disabled = true;
            completeBtn.classList.add('opacity-50', 'cursor-not-allowed');
        }
        if (reviewConfirmBtn) {
            reviewConfirmBtn.disabled = true;
            reviewConfirmBtn.classList.add('opacity-50', 'cursor-not-allowed');
        }
    }
}

function handleBillingSubmit() {
    const subtotal = (childQty * childPrice) + (adultQty * adultPrice);
    if (subtotal === 0) return;
    
    grandTotal = Math.max(0, subtotal - appliedDiscount);
    
    let discountBlock = '';
    if (appliedDiscount > 0) {
        discountBlock = `<div class="flex justify-between text-green-600 font-semibold mb-2 text-sm"><span>Discount</span><span>-₹${appliedDiscount}</span></div>`;
    }
    
    const content = `
        <div class="space-y-4">
            <div class="bg-orange-50 border border-orange-100 p-4 rounded-xl">
                <div class="text-sm font-bold text-orange-800 mb-2">First Floor Access Tickets</div>
                <div class="flex justify-between text-slate-700 font-medium mb-1 text-sm">
                    <span>Child Tickets (${childQty})</span>
                    <span>₹${childQty * childPrice}</span>
                </div>
                <div class="flex justify-between text-slate-700 font-medium mb-1 text-sm">
                    <span>Adult Tickets (${adultQty})</span>
                    <span>₹${adultQty * adultPrice}</span>
                </div>
                <div class="flex justify-between text-slate-700 font-medium mt-2 pt-2 border-t border-orange-200 text-sm">
                    <span>Subtotal</span>
                    <span>₹${subtotal}</span>
                </div>
                ${discountBlock}
                <div class="flex justify-between text-xl font-bold text-slate-900 border-t border-orange-200 mt-2 pt-2">
                    <span>Total Payable</span>
                    <span class="text-primary">₹${grandTotal}</span>
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
    if (childQty === 0 && adultQty === 0) return;
    
    const errBox = document.getElementById('cart-error') || document.getElementById('error-msg');
    if (errBox) errBox.classList.add('hidden');
    
    const btn = document.getElementById('review-confirm-btn');
    const completeBtn = document.getElementById('complete-btn');
    const spinner = document.getElementById('processing-spinner');
    const reviewSpinner = document.getElementById('review-spinner');
    
    const paymentRadio = document.querySelector('input[name="payment-method"]:checked');
    const paymentMethod = paymentRadio ? paymentRadio.value : 'Cash';
    const customerName = document.getElementById('cust-name') ? document.getElementById('cust-name').value.trim() : "";
    const phone = document.getElementById('cust-phone') ? document.getElementById('cust-phone').value.trim() : "";
    const couponCode = document.getElementById("coupon-code") ? document.getElementById("coupon-code").value.trim().toUpperCase() : "";
    
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = `<span>Processing Bill...</span> <span class="material-symbols-outlined text-base animate-spin">progress_activity</span>`;
    }
    if (completeBtn) completeBtn.disabled = true;
    if (spinner) { spinner.classList.remove('hidden'); spinner.classList.add('animate-spin'); }
    if (reviewSpinner) { reviewSpinner.classList.remove('hidden'); }
    
    try {
        const payload = {
            childQty,
            adultQty,
            paymentMethod,
            customerName: customerName || "Walk-in Customer",
            phone,
            couponCode,
            discount: appliedDiscount
        };
        
        const response = await processFirstFloorBilling(payload);
        
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
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = `<span>Confirm &amp; Bill</span> <span class="material-symbols-outlined text-base animate-spin hidden" id="review-spinner">progress_activity</span>`;
        }
        if (completeBtn) completeBtn.disabled = false;
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
    setT('receipt-bill', response.billId || 'B-FF-' + Date.now());
    setT('receipt-c-qty', childQty);
    setT('receipt-c-total', `₹${childQty * childPrice}`);
    setT('receipt-a-qty', adultQty);
    setT('receipt-a-total', `₹${adultQty * adultPrice}`);
    setT('receipt-total', `₹${response.total || grandTotal}`);
    setT('receipt-mode', mode);
    
    const childRow = document.getElementById('receipt-child-row');
    const adultRow = document.getElementById('receipt-adult-row');
    if (childRow) childRow.style.display = childQty > 0 ? 'flex' : 'none';
    if (adultRow) adultRow.style.display = adultQty > 0 ? 'flex' : 'none';
    
    const qrContainer = document.getElementById('qr-container');
    if (qrContainer) qrContainer.classList.remove('hidden');

    const qrImg = document.getElementById('receipt-qr');
    if (qrImg) {
        const qrData = response.billId || 'B-FF-' + Date.now();
        qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrData)}`;
    }
    
    const modal = document.getElementById('receipt-modal');
    if (modal) modal.classList.remove('hidden');
}

window.closeReceiptModal = function() {
    const modal = document.getElementById('receipt-modal');
    if (modal) modal.classList.add('hidden');
};


// Expose globally for HTML onclick handlers
window.handleBillingSubmit = handleBillingSubmit;
window.executeOrder = executeOrder;
window.updateQty = updateQty;
window.applyCoupon = applyCoupon;
