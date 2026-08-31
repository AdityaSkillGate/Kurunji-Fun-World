/**
 * assets/js/pos-share.js
 * Comprehensive POS Receipt Sharing, Thermal Printing, and Owner WhatsApp Reporting
 * Kurunji Fun World Staff POS
 */

const OWNER_WHATSAPP_NUMBER = "919751182000"; // +91 97511 82000

const POSShare = {
    currentSelectedPeriod: 'today',
    cachedAllTransactions: [],

    /**
     * Standard Thermal Print Handler (58mm / 80mm POS Printers)
     */
    printThermalReceipt() {
        window.print();
    },

    /**
     * Extracts active receipt data from the DOM
     */
    getActiveReceiptData() {
        const dateEl = document.getElementById('receipt-date');
        const billEl = document.getElementById('receipt-bill') || document.getElementById('receipt-txn');
        const totalEl = document.getElementById('receipt-total') || document.getElementById('receipt-pay');
        const modeEl = document.getElementById('receipt-mode');
        const cardEl = document.getElementById('receipt-card');
        const addedEl = document.getElementById('receipt-added');
        const balEl = document.getElementById('receipt-balance');
        const custNameEl = document.getElementById('cust-name');
        const custPhoneEl = document.getElementById('cust-phone');
        const adultEl = document.getElementById('adult-count');
        const childEl = document.getElementById('child-count');

        // Extract items
        const items = [];
        const itemsContainer = document.getElementById('receipt-items');
        if (itemsContainer) {
            itemsContainer.querySelectorAll('div').forEach(row => {
                const text = row.innerText.trim();
                if (text) items.push(text.replace(/\s+/g, ' '));
            });
        }

        // First floor specific rows
        const childRow = document.getElementById('receipt-child-row');
        const adultRow = document.getElementById('receipt-adult-row');
        if (childRow && childRow.style.display !== 'none' && childRow.innerText.trim()) {
            items.push(childRow.innerText.trim().replace(/\s+/g, ' '));
        }
        if (adultRow && adultRow.style.display !== 'none' && adultRow.innerText.trim()) {
            items.push(adultRow.innerText.trim().replace(/\s+/g, ' '));
        }

        return {
            date: dateEl ? dateEl.textContent.trim() : new Date().toLocaleString('en-IN'),
            billId: billEl ? billEl.textContent.trim() : 'B-' + Date.now(),
            total: totalEl ? totalEl.textContent.trim() : '₹0',
            mode: modeEl ? modeEl.textContent.trim() : 'Cash',
            card: cardEl ? cardEl.textContent.trim() : '',
            addedPoints: addedEl ? addedEl.textContent.trim() : '',
            balance: balEl ? balEl.textContent.trim() : '',
            customerName: custNameEl && custNameEl.value.trim() ? custNameEl.value.trim() : 'Walk-in Guest',
            customerPhone: custPhoneEl && custPhoneEl.value.trim() ? custPhoneEl.value.trim().replace(/[^0-9]/g, '') : '',
            adultCount: adultEl ? parseInt(adultEl.value) || 0 : 0,
            childCount: childEl ? parseInt(childEl.value) || 0 : 0,
            items: items
        };
    },

    /**
     * Formats Single Bill as a clean WhatsApp Text Receipt
     */
    formatBillAsText(billData) {
        const d = billData || this.getActiveReceiptData();
        
        let msg = `🎟️ *KURUNJI FUN WORLD — BILL RECEIPT*\n`;
        msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
        msg += `🧾 *Bill No:* ${d.billId}\n`;
        msg += `📅 *Date:* ${d.date}\n`;
        msg += `👤 *Customer:* ${d.customerName}\n`;
        if (d.customerPhone) msg += `📱 *Mobile:* +91 ${d.customerPhone}\n`;
        if (d.card) msg += `💳 *Card No:* ${d.card}\n`;
        if (d.adultCount > 0 || d.childCount > 0) {
            msg += `👥 *Visitors:* ${d.adultCount} Adult(s), ${d.childCount} Child(ren)\n`;
        }
        msg += `━━━━━━━━━━━━━━━━━━━━━\n`;

        if (d.items && d.items.length > 0) {
            msg += `🎡 *PURCHASED ITEMS / RIDES:*\n`;
            d.items.forEach(item => {
                msg += `• ${item}\n`;
            });
            msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
        }

        if (d.addedPoints) msg += `● *Points Added:* ${d.addedPoints}\n`;
        if (d.balance) msg += `💰 *Card Balance:* ${d.balance}\n`;
        msg += `💵 *TOTAL PAID:* *${d.total}*\n`;
        msg += `💳 *Payment Method:* ${d.mode}\n`;
        msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
        msg += `🌟 *Thank you for visiting Kurunji Fun World!*\n`;
        msg += `📍 *Location:* Salem - Namakkal Highway, Kurunji Fun World\n`;
        msg += `📞 *Helpdesk:* +91 97511 82000\n`;
        msg += `_Valid only for date of issue._`;

        return msg;
    },

    /**
     * Generates a Canvas Snapshot of the Receipt for Image Sharing/Download
     */
    async generateReceiptCanvas(billData) {
        const d = billData || this.getActiveReceiptData();
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        const width = 420;
        let estimatedHeight = 440 + (Math.max(1, d.items.length) * 28);
        if (d.card) estimatedHeight += 35;
        if (d.balance) estimatedHeight += 25;
        
        canvas.width = width * 2;
        canvas.height = estimatedHeight * 2;
        ctx.scale(2, 2);

        // Background
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, width, estimatedHeight);

        // Top Header Banner
        ctx.fillStyle = "#0f172a";
        ctx.fillRect(0, 0, width, 80);

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 18px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("KURUNJI FUN WORLD", width / 2, 32);

        ctx.fillStyle = "#38bdf8";
        ctx.font = "bold 11px sans-serif";
        ctx.fillText("OFFICIAL BILL RECEIPT", width / 2, 52);

        ctx.fillStyle = "#94a3b8";
        ctx.font = "10px sans-serif";
        ctx.fillText("Theme Park & Family Entertainment Zone", width / 2, 68);

        // Divider
        let y = 98;
        ctx.strokeStyle = "#e2e8f0";
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(20, y);
        ctx.lineTo(width - 20, y);
        ctx.stroke();
        ctx.setLineDash([]);

        // Meta Info
        y += 22;
        ctx.textAlign = "left";
        ctx.font = "11px sans-serif";
        ctx.fillStyle = "#64748b";
        ctx.fillText("Date & Time:", 24, y);
        ctx.textAlign = "right";
        ctx.fillStyle = "#1e293b";
        ctx.font = "bold 11px sans-serif";
        ctx.fillText(d.date, width - 24, y);

        y += 20;
        ctx.textAlign = "left";
        ctx.font = "11px sans-serif";
        ctx.fillStyle = "#64748b";
        ctx.fillText("Bill / Txn ID:", 24, y);
        ctx.textAlign = "right";
        ctx.fillStyle = "#0f172a";
        ctx.font = "bold 11px monospace";
        ctx.fillText(d.billId, width - 24, y);

        y += 20;
        ctx.textAlign = "left";
        ctx.font = "11px sans-serif";
        ctx.fillStyle = "#64748b";
        ctx.fillText("Customer:", 24, y);
        ctx.textAlign = "right";
        ctx.fillStyle = "#1e293b";
        ctx.font = "bold 11px sans-serif";
        ctx.fillText(d.customerName + (d.customerPhone ? ` (${d.customerPhone})` : ''), width - 24, y);

        if (d.card) {
            y += 20;
            ctx.textAlign = "left";
            ctx.fillStyle = "#64748b";
            ctx.fillText("Card Number:", 24, y);
            ctx.textAlign = "right";
            ctx.fillStyle = "#2563eb";
            ctx.font = "bold 12px monospace";
            ctx.fillText(d.card, width - 24, y);
        }

        // Items Section
        y += 16;
        ctx.strokeStyle = "#cbd5e1";
        ctx.beginPath();
        ctx.moveTo(20, y);
        ctx.lineTo(width - 20, y);
        ctx.stroke();

        y += 18;
        ctx.textAlign = "left";
        ctx.fillStyle = "#475569";
        ctx.font = "bold 11px sans-serif";
        ctx.fillText("PARTICULARS", 24, y);

        y += 8;
        ctx.strokeStyle = "#e2e8f0";
        ctx.beginPath();
        ctx.moveTo(20, y);
        ctx.lineTo(width - 20, y);
        ctx.stroke();

        if (d.items && d.items.length > 0) {
            d.items.forEach(item => {
                y += 22;
                ctx.textAlign = "left";
                ctx.fillStyle = "#1e293b";
                ctx.font = "11px sans-serif";
                ctx.fillText(item, 24, y, width - 48);
            });
        } else {
            y += 22;
            ctx.textAlign = "left";
            ctx.fillStyle = "#1e293b";
            ctx.font = "11px sans-serif";
            ctx.fillText("General Access / Service", 24, y);
        }

        // Totals
        y += 20;
        ctx.strokeStyle = "#0f172a";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(20, y);
        ctx.lineTo(width - 20, y);
        ctx.stroke();

        y += 24;
        ctx.textAlign = "left";
        ctx.font = "bold 14px sans-serif";
        ctx.fillStyle = "#0f172a";
        ctx.fillText("TOTAL PAID:", 24, y);
        ctx.textAlign = "right";
        ctx.font = "bold 17px sans-serif";
        ctx.fillStyle = "#2563eb";
        ctx.fillText(d.total, width - 24, y);

        y += 18;
        ctx.textAlign = "left";
        ctx.font = "11px sans-serif";
        ctx.fillStyle = "#64748b";
        ctx.fillText("Payment Mode: " + d.mode, 24, y);

        if (d.balance) {
            ctx.textAlign = "right";
            ctx.fillStyle = "#16a34a";
            ctx.font = "bold 11px sans-serif";
            ctx.fillText("Balance: " + d.balance, width - 24, y);
        }

        // Footer
        y += 28;
        ctx.textAlign = "center";
        ctx.font = "italic 10px sans-serif";
        ctx.fillStyle = "#94a3b8";
        ctx.fillText("Thank you for visiting Kurunji Fun World!", width / 2, y);
        y += 15;
        ctx.fillText("Support: +91 97511 82000 | Salem - Namakkal Highway", width / 2, y);

        return canvas;
    },

    /**
     * Download Receipt as Image (PNG)
     */
    async downloadReceiptImage(billData) {
        const canvas = await this.generateReceiptCanvas(billData);
        const link = document.createElement('a');
        const d = billData || this.getActiveReceiptData();
        link.download = `Receipt-${d.billId}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    },

    /**
     * Download Receipt as PDF
     */
    async downloadReceiptPDF(billData) {
        await this.downloadReceiptImage(billData);
    },

    /**
     * Interactive WhatsApp Share Dialog for Single Bill
     */
    openBillShareModal() {
        const d = this.getActiveReceiptData();
        let existingModal = document.getElementById('bill-share-dialog');
        if (existingModal) existingModal.remove();

        const phoneVal = d.customerPhone ? d.customerPhone : '';

        const modalHtml = `
        <div id="bill-share-dialog" class="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
            <div class="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col">
                <div style="background-color: #059669; color: #ffffff;" class="px-4 py-3.5 flex items-center justify-between shadow-md">
                    <div class="flex items-center gap-2">
                        <span class="material-symbols-outlined text-xl">chat</span>
                        <h3 class="font-bold text-sm sm:text-base">Share Bill on WhatsApp</h3>
                    </div>
                    <button type="button" onclick="document.getElementById('bill-share-dialog').remove()" class="text-white/80 hover:text-white bg-black/20 p-1 rounded-full flex items-center justify-center">
                        <span class="material-symbols-outlined text-lg">close</span>
                    </button>
                </div>

                <div class="p-4 space-y-3.5 text-xs sm:text-sm">
                    <div>
                        <label class="block text-xs font-semibold text-slate-700 mb-1">Customer Mobile Number</label>
                        <div class="flex">
                            <span class="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-slate-300 bg-slate-100 text-slate-600 font-bold text-xs">+91</span>
                            <input type="tel" id="share-phone-input" value="${phoneVal}" placeholder="10-digit number" maxlength="10" class="flex-1 rounded-r-xl border-slate-300 font-mono font-bold text-sm focus:border-emerald-500 focus:ring-emerald-500 py-2 px-3" />
                        </div>
                    </div>

                    <div class="space-y-2 pt-1">
                        <button type="button" id="share-text-wa-btn" style="background-color: #059669; color: #ffffff;" class="w-full hover:bg-emerald-700 font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow transition-colors">
                            <span class="material-symbols-outlined text-lg">chat</span>
                            <span>Share Formatted Text Bill</span>
                        </button>
                        
                        <button type="button" id="share-img-wa-btn" class="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 border border-slate-300 transition-colors">
                            <span class="material-symbols-outlined text-lg text-emerald-600">image</span>
                            <span>Download &amp; Share Image Bill</span>
                        </button>

                        <button type="button" id="share-owner-wa-btn" style="background-color: #fef3c7; color: #78350f; border: 1px solid #fcd34d;" class="w-full hover:bg-amber-100 font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors">
                            <span class="material-symbols-outlined text-lg text-amber-600">verified_user</span>
                            <span>Send to Owner (+91 97511 82000)</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);

        document.getElementById('share-text-wa-btn').onclick = () => {
            const rawPhone = document.getElementById('share-phone-input').value.trim().replace(/[^0-9]/g, '');
            const targetPhone = rawPhone.length === 10 ? '91' + rawPhone : (rawPhone || '');
            const text = POSShare.formatBillAsText(d);
            POSShare.sendWhatsApp(targetPhone, text);
            document.getElementById('bill-share-dialog').remove();
        };

        document.getElementById('share-img-wa-btn').onclick = async () => {
            await POSShare.downloadReceiptImage(d);
            const rawPhone = document.getElementById('share-phone-input').value.trim().replace(/[^0-9]/g, '');
            const targetPhone = rawPhone.length === 10 ? '91' + rawPhone : (rawPhone || '');
            const text = `🎟️ *Kurunji Fun World Receipt: ${d.billId} (${d.total})*\nAttached receipt image.`;
            POSShare.sendWhatsApp(targetPhone, text);
            document.getElementById('bill-share-dialog').remove();
        };

        document.getElementById('share-owner-wa-btn').onclick = () => {
            const text = POSShare.formatBillAsText(d);
            POSShare.sendWhatsApp(OWNER_WHATSAPP_NUMBER, text);
            document.getElementById('bill-share-dialog').remove();
        };
    },

    /**
     * Interactive Email Share Dialog for Single Bill
     */
    openEmailShareModal() {
        const d = this.getActiveReceiptData();
        let existingModal = document.getElementById('email-share-dialog');
        if (existingModal) existingModal.remove();

        const modalHtml = `
        <div id="email-share-dialog" class="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
            <div class="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col">
                <div style="background-color: #2563eb; color: #ffffff;" class="px-4 py-3.5 flex items-center justify-between shadow-md">
                    <div class="flex items-center gap-2">
                        <span class="material-symbols-outlined text-xl">mail</span>
                        <h3 class="font-bold text-sm sm:text-base">Email Receipt</h3>
                    </div>
                    <button type="button" onclick="document.getElementById('email-share-dialog').remove()" class="text-white/80 hover:text-white bg-black/20 p-1 rounded-full flex items-center justify-center">
                        <span class="material-symbols-outlined text-lg">close</span>
                    </button>
                </div>

                <div class="p-4 space-y-3.5 text-xs sm:text-sm">
                    <div>
                        <label class="block text-xs font-semibold text-slate-700 mb-1">Customer Email Address</label>
                        <input type="email" id="share-email-input" placeholder="customer@example.com" class="w-full rounded-xl border-slate-300 text-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3" />
                    </div>

                    <div class="space-y-2 pt-1">
                        <button type="button" id="send-email-btn" style="background-color: #2563eb; color: #ffffff;" class="w-full hover:bg-blue-700 font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow transition-colors">
                            <span class="material-symbols-outlined text-lg">send</span>
                            <span>Open Mail &amp; Send Receipt</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);

        document.getElementById('send-email-btn').onclick = () => {
            const email = document.getElementById('share-email-input').value.trim();
            const text = POSShare.formatBillAsText(d).replace(/\*/g, '').replace(/\n/g, '\r\n');
            const subject = encodeURIComponent(`Kurunji Fun World Receipt - Bill #${d.billId}`);
            const body = encodeURIComponent(text);
            window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
            document.getElementById('email-share-dialog').remove();
        };
    },

    /**
     * Send message via WhatsApp URL
     */
    sendWhatsApp(phone, message) {
        const cleanPhone = phone ? phone.replace(/[^0-9]/g, '') : '';
        const encodedText = encodeURIComponent(message);
        let waUrl = `https://api.whatsapp.com/send?text=${encodedText}`;
        if (cleanPhone) {
            waUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedText}`;
        }
        window.open(waUrl, '_blank');
    },

    // =========================================================================
    // MULTI-PERIOD BUSINESS REPORTING ENGINE (Owner WhatsApp: +91 97511 82000)
    // =========================================================================

    /**
     * Filter transactions by period: 'today', 'yesterday', 'week', 'month', 'all'
     */
    filterTransactionsByPeriod(transactions, period = 'today') {
        const now = new Date();
        const todayISO = now.toLocaleDateString('en-CA');
        
        const yesterday = new Date();
        yesterday.setDate(now.getDate() - 1);
        const yesterdayISO = yesterday.toLocaleDateString('en-CA');

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 7);

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(now.getDate() - 30);

        return (transactions || []).filter(tx => {
            if (!tx.date) return period === 'all';
            const rawDate = String(tx.date).split('T')[0].trim();
            const txDateObj = new Date(tx.date);

            if (period === 'today') {
                return rawDate === todayISO || new Date(tx.date).toLocaleDateString('en-CA') === todayISO;
            } else if (period === 'yesterday') {
                return rawDate === yesterdayISO;
            } else if (period === 'week') {
                return !isNaN(txDateObj.getTime()) && txDateObj >= sevenDaysAgo;
            } else if (period === 'month') {
                return !isNaN(txDateObj.getTime()) && txDateObj >= thirtyDaysAgo;
            }
            return true;
        });
    },

    /**
     * Compiles Business Summary from a list of transactions
     */
    compileSummary(transactions, filterLabel = "Today") {
        let totalRevenue = 0;
        let billCount = 0;
        let adultVisitors = 0;
        let childVisitors = 0;

        const depts = {
            "Ground Floor (Recharge)": { count: 0, revenue: 0 },
            "First Floor (Passes)": { count: 0, revenue: 0 },
            "Outdoor Rides": { count: 0, revenue: 0 },
            "Retail / Add-ons": { count: 0, revenue: 0 },
            "Game Points Usage": { count: 0, points: 0 }
        };

        const paymentModes = {
            "Cash": 0,
            "UPI": 0,
            "Card": 0,
            "Online / Other": 0
        };

        (transactions || []).forEach(tx => {
            const isCompleted = tx.status === "COMPLETED" || tx.status === "CHECKED_IN" || !tx.status;
            if (!isCompleted) return;

            const amt = parseFloat(tx.amount) || 0;
            const pts = parseFloat(tx.points) || 0;
            const mode = (tx.paymentMethod || tx.mode || 'Cash').toUpperCase();

            billCount++;
            totalRevenue += amt;

            // Demographics
            const adults = parseInt(tx.adultCount) || 0;
            const children = parseInt(tx.childCount) || 0;
            if (adults > 0 || children > 0) {
                adultVisitors += adults;
                childVisitors += children;
            } else if (tx.id && (tx.id.startsWith("B-FF") || tx.id.startsWith("B-OUT"))) {
                adultVisitors += 1;
            }

            // Department categorization
            const typeStr = String(tx.type || tx.id || '');
            if (typeStr.includes('Recharge') || typeStr.startsWith('B-GF-REC') || typeStr.startsWith('TXN-')) {
                depts["Ground Floor (Recharge)"].count++;
                depts["Ground Floor (Recharge)"].revenue += amt;
            } else if (typeStr.includes('First Floor') || typeStr.startsWith('B-FF')) {
                depts["First Floor (Passes)"].count++;
                depts["First Floor (Passes)"].revenue += amt;
            } else if (typeStr.includes('Outdoor') || typeStr.startsWith('B-OUT')) {
                depts["Outdoor Rides"].count++;
                depts["Outdoor Rides"].revenue += amt;
            } else if (typeStr.includes('Add-on') || typeStr.startsWith('B-ADD')) {
                depts["Retail / Add-ons"].count++;
                depts["Retail / Add-ons"].revenue += amt;
            } else if (typeStr.includes('Usage') || typeStr.startsWith('B-GF-USE')) {
                depts["Game Points Usage"].count++;
                depts["Game Points Usage"].points += pts;
            }

            // Payment Mode
            if (mode.includes('CASH')) paymentModes["Cash"] += amt;
            else if (mode.includes('UPI')) paymentModes["UPI"] += amt;
            else if (mode.includes('CARD')) paymentModes["Card"] += amt;
            else paymentModes["Online / Other"] += amt;
        });

        return {
            filterLabel,
            generatedAt: new Date().toLocaleString('en-IN'),
            totalRevenue,
            billCount,
            totalVisitors: adultVisitors + childVisitors,
            adultVisitors,
            childVisitors,
            depts,
            paymentModes
        };
    },

    /**
     * Formats Business Summary into an Executive WhatsApp Message for Owner
     */
    formatOwnerReportMessage(summary) {
        const s = summary;
        let msg = `📊 *KURUNJI FUN WORLD — BUSINESS REPORT*\n`;
        msg += `📅 *Period:* ${s.filterLabel}\n`;
        msg += `🕒 *Generated:* ${s.generatedAt}\n`;
        msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
        
        msg += `👥 *VISITOR ATTENDANCE:*\n`;
        msg += `• *Total Visitors:* ${s.totalVisitors > 0 ? s.totalVisitors : s.billCount}\n`;
        if (s.adultVisitors > 0 || s.childVisitors > 0) {
            msg += `• Adults: ${s.adultVisitors} | Children: ${s.childVisitors}\n`;
        }
        msg += `━━━━━━━━━━━━━━━━━━━━━\n`;

        msg += `💰 *COLLECTION BREAKDOWN:*\n`;
        Object.entries(s.depts).forEach(([dept, val]) => {
            if (val.revenue > 0) {
                msg += `• *${dept}:* ₹${val.revenue.toLocaleString('en-IN')} (${val.count} bills)\n`;
            } else if (val.points > 0) {
                msg += `• *${dept}:* ●${val.points} pts used (${val.count} txns)\n`;
            }
        });
        msg += `━━━━━━━━━━━━━━━━━━━━━\n`;

        msg += `💳 *PAYMENT MODES:*\n`;
        msg += `• 💵 *Cash:* ₹${s.paymentModes["Cash"].toLocaleString('en-IN')}\n`;
        msg += `• 📲 *UPI / QR:* ₹${s.paymentModes["UPI"].toLocaleString('en-IN')}\n`;
        msg += `• 💳 *Card:* ₹${s.paymentModes["Card"].toLocaleString('en-IN')}\n`;
        if (s.paymentModes["Online / Other"] > 0) {
            msg += `• 🌐 *Other:* ₹${s.paymentModes["Online / Other"].toLocaleString('en-IN')}\n`;
        }
        msg += `━━━━━━━━━━━━━━━━━━━━━\n`;

        msg += `⭐ *TOTAL REVENUE: ₹${s.totalRevenue.toLocaleString('en-IN')}*\n`;
        msg += `🧾 *Total Transactions:* ${s.billCount}\n`;
        msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
        msg += `_Kurunji Fun World Staff Billing System_`;

        return msg;
    },

    /**
     * Updates Dashboard Report Module UI when a timeframe is selected (Today, Yesterday, Week, Month)
     */
    async switchDashboardReportPeriod(period) {
        this.currentSelectedPeriod = period;

        // Highlight active tab
        ['today', 'yesterday', 'week', 'month'].forEach(p => {
            const tabBtn = document.getElementById(`report-tab-${p}`);
            if (tabBtn) {
                if (p === period) {
                    tabBtn.style.backgroundColor = '#ffffff';
                    tabBtn.style.color = '#065f46';
                    tabBtn.style.fontWeight = 'bold';
                    tabBtn.style.boxShadow = '0 2px 4px rgba(0,0,0,0.15)';
                } else {
                    tabBtn.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                    tabBtn.style.color = '#ffffff';
                    tabBtn.style.fontWeight = '500';
                    tabBtn.style.boxShadow = 'none';
                }
            }
        });

        // Fetch transactions if not already cached
        if (!this.cachedAllTransactions || this.cachedAllTransactions.length === 0) {
            try {
                const res = await fetchTransactionHistory();
                if (res && res.status === 'success') {
                    this.cachedAllTransactions = res.history || [];
                }
            } catch (e) {
                console.warn("Failed to fetch history for reports:", e);
            }
        }

        const filtered = this.filterTransactionsByPeriod(this.cachedAllTransactions, period);
        let periodLabel = "Today";
        if (period === 'yesterday') periodLabel = "Yesterday";
        else if (period === 'week') periodLabel = "This Week (Last 7 Days)";
        else if (period === 'month') periodLabel = "This Month (Last 30 Days)";

        const summary = this.compileSummary(filtered, periodLabel);

        // Update Dashboard Widget Preview
        const revEl = document.getElementById('report-preview-rev');
        const billsEl = document.getElementById('report-preview-bills');
        const visEl = document.getElementById('report-preview-vis');
        const cashEl = document.getElementById('report-preview-cash');
        const upiEl = document.getElementById('report-preview-upi');
        const cardEl = document.getElementById('report-preview-card');
        const labelEl = document.getElementById('report-preview-label');

        if (revEl) revEl.textContent = `₹${summary.totalRevenue.toLocaleString('en-IN')}`;
        if (billsEl) billsEl.textContent = `${summary.billCount} Bills`;
        if (visEl) visEl.textContent = `${summary.totalVisitors} Visitors (${summary.adultVisitors}A / ${summary.childVisitors}C)`;
        if (cashEl) cashEl.textContent = `₹${summary.paymentModes.Cash.toLocaleString('en-IN')}`;
        if (upiEl) upiEl.textContent = `₹${summary.paymentModes.UPI.toLocaleString('en-IN')}`;
        if (cardEl) cardEl.textContent = `₹${summary.paymentModes.Card.toLocaleString('en-IN')}`;
        if (labelEl) labelEl.textContent = periodLabel;
    },

    /**
     * Send the currently selected Dashboard period report to Owner WhatsApp
     */
    async sendCurrentDashboardReportToOwner() {
        const period = this.currentSelectedPeriod || 'today';
        if (!this.cachedAllTransactions || this.cachedAllTransactions.length === 0) {
            const res = await fetchTransactionHistory();
            if (res && res.status === 'success') {
                this.cachedAllTransactions = res.history || [];
            }
        }
        
        const filtered = this.filterTransactionsByPeriod(this.cachedAllTransactions, period);
        let periodLabel = "Today";
        if (period === 'yesterday') periodLabel = "Yesterday";
        else if (period === 'week') periodLabel = "This Week (Last 7 Days)";
        else if (period === 'month') periodLabel = "This Month (Last 30 Days)";

        const summary = this.compileSummary(filtered, periodLabel);
        const text = this.formatOwnerReportMessage(summary);
        this.sendWhatsApp(OWNER_WHATSAPP_NUMBER, text);
    },

    /**
     * Copy current report text to clipboard
     */
    async copyCurrentDashboardReport() {
        const period = this.currentSelectedPeriod || 'today';
        const filtered = this.filterTransactionsByPeriod(this.cachedAllTransactions, period);
        let periodLabel = period.toUpperCase();
        const summary = this.compileSummary(filtered, periodLabel);
        const text = this.formatOwnerReportMessage(summary).replace(/\*/g, '');
        
        try {
            await navigator.clipboard.writeText(text);
            alert("Report copied to clipboard! You can paste it in WhatsApp or SMS.");
        } catch (e) {
            prompt("Copy this report text:", text);
        }
    },

    /**
     * Share Custom Filtered Summary to Owner (+91 97511 82000)
     */
    shareFilteredSummaryToOwner(transactions, filterName = "Custom Period") {
        const summary = this.compileSummary(transactions, filterName);
        const text = this.formatOwnerReportMessage(summary);
        this.sendWhatsApp(OWNER_WHATSAPP_NUMBER, text);
    },

    /**
     * Auto-binds Receipt Modal Action Buttons (Print, PDF, WhatsApp, Email)
     */
    initReceiptButtons() {
        const printBtn = document.getElementById('print-btn');
        const pdfBtn = document.getElementById('pdf-btn');
        const waBtn = document.getElementById('wa-btn');
        const emailBtn = document.getElementById('email-btn');

        if (printBtn) printBtn.onclick = () => this.printThermalReceipt();
        if (pdfBtn) pdfBtn.onclick = () => this.downloadReceiptPDF();
        if (waBtn) waBtn.onclick = () => this.openBillShareModal();
        if (emailBtn) emailBtn.onclick = () => this.openEmailShareModal();
    }
};

// Auto initialize receipt buttons and dashboard reports
document.addEventListener('DOMContentLoaded', () => {
    POSShare.initReceiptButtons();
    if (document.getElementById('report-tab-today')) {
        POSShare.switchDashboardReportPeriod('today');
    }
});
