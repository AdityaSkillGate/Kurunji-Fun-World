/**
 * pos-recharge.js
 * Logic for Ground Floor Wallet Recharge POS Module (Unified Single Page)
 */

let adultQty = 1;
let childQty = 0;
let selectedPackage = null;
let appliedCoupon = null;
let appliedDiscount = 0;
let appliedBonus = 0;

function updateDemographics(type, change) {
    if (type === 'adult') {
        let n = (parseInt(document.getElementById('adult-count')?.value || 1) || 0) + change;
        if (n >= 0 && n <= 50) {
            adultQty = n;
            const el = document.getElementById('adult-count');
            if (el) el.value = adultQty;
        }
    } else {
        let n = (parseInt(document.getElementById('child-count')?.value || 0) || 0) + change;
        if (n >= 0 && n <= 50) {
            childQty = n;
            const el = document.getElementById('child-count');
            if (el) el.value = childQty;
        }
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

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Enforce Auth
    const session = await requireStaffAuth();
    if (!session) return;
    
    const appBody = document.getElementById('app-body');
    if (appBody) appBody.classList.remove('hidden');

    // 2. Load Packages
    loadPackages();

    // 3. UI Handlers
    function onEl(id, evt, fn) {
        const el = document.getElementById(id);
        if (el) el.addEventListener(evt, fn);
    }

    const genCard = () => {
        const c = document.getElementById('card-number');
        if (c) c.value = "KF-" + Math.floor(100000 + Math.random() * 900000);
    };
    onEl('generate-card-btn', 'click', genCard);
    onEl('auto-card-btn', 'click', genCard);

    onEl('complete-btn', 'click', handleRechargeSubmit);
    onEl('confirm-btn', 'click', handleRechargeSubmit);
    onEl('review-cancel-btn', 'click', () => {
        const m = document.getElementById('review-modal');
        if (m) m.classList.add('hidden');
    });
    onEl('review-confirm-btn', 'click', executeOrder);
    
    onEl('print-btn', 'click', () => window.print());
    onEl('new-txn-btn', 'click', () => window.location.reload());

    // Generate initial card number if empty
    const cardInput = document.getElementById('card-number');
    if (cardInput && !cardInput.value) {
        genCard();
    }

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
                return;
            }
            
            if (msgBox) {
                msgBox.textContent = "Checking...";
                msgBox.className = "text-xs font-bold mt-1 text-slate-500";
                msgBox.classList.remove('hidden');
            }
            
            const currentSubtotal = selectedPackage ? parseFloat(selectedPackage.PayAmount) : 0;
            try {
                const res = await validateCoupon(code, currentSubtotal, "GROUND_FLOOR_RECHARGE", "ALL", "", false);
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

async function loadPackages() {
    const grid = document.getElementById('package-grid');
    const loading = document.getElementById('loading-packages');
    
    try {
        const response = await fetchRechargePackages();
        if (loading) loading.classList.add('hidden');
        
        if (grid && response && response.packages && response.packages.length > 0) {
            grid.innerHTML = '';
            response.packages.sort((a, b) => a.PayAmount - b.PayAmount);
            
            response.packages.forEach(pkg => {
                const card = document.createElement('div');
                card.className = "bg-white border-2 border-slate-200 hover:border-primary rounded-xl p-3 sm:p-4 cursor-pointer shadow-sm hover:shadow-md transition-all flex flex-col justify-between select-none group";
                card.onclick = () => selectPackage(pkg, card);
                
                card.innerHTML = `
                    <div class="mb-2">
                        <div class="text-slate-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider">Pay</div>
                        <div class="text-xl sm:text-2xl font-black text-slate-800 group-hover:text-primary transition-colors">₹${pkg.PayAmount}</div>
                    </div>
                    <div class="bg-blue-50/80 rounded-lg p-2 group-hover:bg-blue-100/80 transition-colors">
                        <div class="flex justify-between items-center text-xs font-bold text-primary">
                            <span>Get</span>
                            <span>${pkg.TotalPoints} pts</span>
                        </div>
                        <div class="flex justify-between items-center text-[10px] text-green-600 font-semibold mt-0.5">
                            <span>Bonus</span>
                            <span>+${pkg.BonusPoints} pts</span>
                        </div>
                    </div>
                `;
                grid.appendChild(card);
            });
        }
    } catch (e) {
        console.error(e);
        if (loading) loading.textContent = "Error loading packages.";
    }
}

function selectPackage(pkg, cardElement) {
    selectedPackage = pkg;
    
    // Clear selection on all cards
    document.querySelectorAll('#package-grid > div').forEach(el => {
        el.classList.remove('border-primary', 'bg-blue-50/50', 'ring-2', 'ring-primary/40', 'shadow-md');
        el.classList.add('border-slate-200');
    });
    
    // Highlight ONLY the chosen card
    if (cardElement) {
        cardElement.classList.remove('border-slate-200');
        cardElement.classList.add('border-primary', 'bg-blue-50/50', 'ring-2', 'ring-primary/40', 'shadow-md');
    }
    
    // Enable Review Order button!
    const completeBtn = document.getElementById('complete-btn') || document.getElementById('confirm-btn');
    if (completeBtn) {
        completeBtn.disabled = false;
        completeBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    }
    
    const errBox = document.getElementById('error-msg');
    if (errBox) errBox.classList.add('hidden');
}

function handleRechargeSubmit() {
    if (!selectedPackage) {
        const errBox = document.getElementById('error-msg');
        if (errBox) {
            errBox.textContent = "Please tap a recharge package to select it.";
            errBox.classList.remove('hidden');
        }
        return;
    }
    
    const errBox = document.getElementById('error-msg');
    if (errBox) errBox.classList.add('hidden');
    
    const cardInput = document.getElementById('card-number');
    const nameInput = document.getElementById('cust-name');
    const phoneInput = document.getElementById('cust-phone');
    
    const cardNumber = cardInput ? cardInput.value.trim() : "";
    const customerName = nameInput ? nameInput.value.trim() : "";
    const phone = phoneInput ? phoneInput.value.trim() : "";
    
    if (!cardNumber) {
        if (errBox) {
            errBox.textContent = "Card number is required.";
            errBox.classList.remove('hidden');
        }
        return;
    }
    
    const payAmount = parseFloat(selectedPackage.PayAmount);
    const totalPoints = parseFloat(selectedPackage.TotalPoints);
    const finalPay = Math.max(0, payAmount - appliedDiscount);
    const finalPoints = totalPoints + appliedBonus;
    
    let discountBlock = '';
    if (appliedDiscount > 0) {
        discountBlock = `<div class="flex justify-between text-green-600 font-semibold mb-1 text-sm"><span>Discount</span><span>-₹${appliedDiscount}</span></div>`;
    }
    if (appliedBonus > 0) {
        discountBlock += `<div class="flex justify-between text-green-600 font-semibold mb-1 text-sm"><span>Bonus Points</span><span>+●${appliedBonus}</span></div>`;
    }
    
    const content = `
        <div class="space-y-4">
            <div class="bg-blue-50 border border-blue-100 p-4 rounded-xl">
                <div class="text-sm font-bold text-blue-800 mb-2">Ground Floor Recharge Details</div>
                <div class="flex justify-between text-slate-700 font-medium mb-1 text-sm">
                    <span>Card Number</span>
                    <span class="font-mono font-bold text-slate-900">${cardNumber}</span>
                </div>
                <div class="flex justify-between text-slate-700 font-medium mb-1 text-sm">
                    <span>Customer</span>
                    <span>${customerName || "Walk-in Guest"}</span>
                </div>
                <div class="flex justify-between text-slate-700 font-medium mt-2 pt-2 border-t border-blue-200 text-sm">
                    <span>Package Amount</span>
                    <span>₹${payAmount}</span>
                </div>
                ${discountBlock}
                <div class="flex justify-between text-lg font-bold text-slate-900 border-t border-blue-200 mt-2 pt-2">
                    <span>Payable Amount</span>
                    <span class="text-primary">₹${finalPay}</span>
                </div>
                <div class="flex justify-between text-base font-bold text-blue-700 mt-1">
                    <span>Points to Credit</span>
                    <span>● ${finalPoints} pts</span>
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
    if (!selectedPackage) return;
    
    const errBox = document.getElementById('error-msg');
    if (errBox) errBox.classList.add('hidden');
    
    const cardInput = document.getElementById('card-number');
    const nameInput = document.getElementById('cust-name');
    const phoneInput = document.getElementById('cust-phone');
    const emailInput = document.getElementById('cust-email');
    const paymentRadio = document.querySelector('input[name="payment-method"]:checked');
    
    const cardNumber = cardInput ? cardInput.value.trim() : "";
    const customerName = nameInput ? nameInput.value.trim() : "Walk-in Guest";
    const mobile = phoneInput ? phoneInput.value.trim() : "";
    const email = emailInput ? emailInput.value.trim() : "";
    const paymentMethod = paymentRadio ? paymentRadio.value : 'Cash';
    
    const btn = document.getElementById('review-confirm-btn');
    const completeBtn = document.getElementById('complete-btn');
    const spinner = document.getElementById('processing-spinner');
    
    if (btn) btn.disabled = true;
    if (completeBtn) completeBtn.disabled = true;
    if (spinner) { spinner.classList.remove('hidden'); spinner.classList.add('animate-spin'); }
    
    try {
        const payload = {
            package: selectedPackage,
            cardNumber,
            customerName,
            couponCode: document.getElementById("coupon-code") ? document.getElementById("coupon-code").value.trim().toUpperCase() : "",
            phone: mobile,
            email,
            paymentMethod,
            adultCount: adultQty,
            childCount: childQty
        };
        
        const response = await processRecharge(payload);
        
        if (response && response.status === 'success') {
            const rm = document.getElementById('review-modal');
            if (rm) rm.classList.add('hidden');
            showReceipt(response, payload);
        } else {
            throw new Error(response ? response.message || "Transaction failed" : "Transaction failed");
        }
    } catch (e) {
        if (errBox) {
            errBox.textContent = e.message;
            errBox.classList.remove('hidden');
        }
        if (btn) btn.disabled = false;
        if (completeBtn) completeBtn.disabled = false;
    } finally {
        if (spinner) {
            spinner.classList.add('hidden');
            spinner.classList.remove('animate-spin');
        }
    }
}

function showReceipt(response, payload) {
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
    setT('receipt-txn', response.transaction || response.billId || 'TXN-' + Date.now());
    setT('receipt-card', response.cardNumber || payload.cardNumber);
    setT('receipt-pay', `₹${payload.package.PayAmount}`);
    setT('receipt-mode', payload.paymentMethod);
    setT('receipt-added', `${payload.package.TotalPoints} pts`);
    setT('receipt-balance', `${response.balance || payload.package.TotalPoints} pts`);
    
    const modal = document.getElementById('receipt-modal');
    if (modal) modal.classList.remove('hidden');
}

window.closeReceiptModal = function() {
    const modal = document.getElementById('receipt-modal');
    if (modal) modal.classList.add('hidden');
};
