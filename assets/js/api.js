/**
 * Google Apps Script Integration for Kurunji Fun World
 * This file handles all fetching and data pushing to the Google Sheets backend.
 */

// Replace this with your deployed Google Apps Script Web App URL
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbycVRW_d0nUU1gEDIAnJPwZKsILI0bdRQ7R0ym_zyEjdW44EjgZEolpl3hy2l_YUj2R/exec";

// ==========================================
// AUTHENTICATION
// ==========================================

function getAuthToken() {
    return sessionStorage.getItem('adminToken') || '';
}

async function adminLogin(email, password) {
    if (APPS_SCRIPT_URL === "YOUR_APPS_SCRIPT_URL_HERE") {
        return new Promise(resolve => setTimeout(() => {
            if(email.includes('admin')) {
                resolve({ status: 'success', token: 'mock-token-123', role: 'SUPER_ADMIN', email: email });
            } else {
                resolve({ status: 'error', message: 'Invalid credentials' });
            }
        }, 1000));
    }
    
    const response = await fetch(APPS_SCRIPT_URL + '?action=loginAdmin', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
        headers: { 'Content-Type': 'text/plain;charset=utf-8' }
    });
    
    const clone = response.clone();
    try {
        return await response.json();
    } catch (e) {
        const text = await clone.text();
        console.error("HTML Response received instead of JSON:", text);
        throw new Error("Server returned an HTML error page. Check console for details.");
    }
}

async function logoutAdmin() {
    const token = getAuthToken();
    if(token) {
        if (APPS_SCRIPT_URL !== "YOUR_APPS_SCRIPT_URL_HERE") {
            try {
                await fetch(APPS_SCRIPT_URL + '?action=logoutAdmin', {
                    method: 'POST',
                    body: JSON.stringify({ token }),
                    headers: { 'Content-Type': 'text/plain;charset=utf-8' }
                });
            } catch(e) {}
        }
    }
    sessionStorage.removeItem('adminToken');
    sessionStorage.removeItem('adminRole');
    sessionStorage.removeItem('adminEmail');
}

async function validateAdminSession() {
    const token = getAuthToken();
    if(!token) return { status: 'error' };

    if (APPS_SCRIPT_URL === "YOUR_APPS_SCRIPT_URL_HERE") {
        return new Promise(resolve => setTimeout(() => resolve({ status: 'success', role: sessionStorage.getItem('adminRole') || 'SUPER_ADMIN', email: sessionStorage.getItem('adminEmail') }), 500));
    }
    
    try {
        const queryParams = new URLSearchParams({ action: 'validateAdminSession', token }).toString();
        const response = await fetch(APPS_SCRIPT_URL + '?' + queryParams, { cache: 'no-store' });
        return await response.json();
    } catch (e) {
        return { status: 'error' };
    }
}

async function requestResetOTP(email) {
    if (APPS_SCRIPT_URL === "YOUR_APPS_SCRIPT_URL_HERE") {
        return new Promise(resolve => setTimeout(() => resolve({ status: 'success' }), 1000));
    }
    
    const response = await fetch(APPS_SCRIPT_URL + '?action=requestOTP', {
        method: 'POST',
        body: JSON.stringify({ email }),
        headers: { 'Content-Type': 'text/plain;charset=utf-8' }
    });
    return await response.json();
}

async function resetPasswordWithOTP(email, otp, newPassword) {
    if (APPS_SCRIPT_URL === "YOUR_APPS_SCRIPT_URL_HERE") {
        return new Promise(resolve => setTimeout(() => resolve({ status: 'success' }), 1000));
    }
    
    const response = await fetch(APPS_SCRIPT_URL + '?action=resetPassword', {
        method: 'POST',
        body: JSON.stringify({ email, otp, newPassword }),
        headers: { 'Content-Type': 'text/plain;charset=utf-8' }
    });
    return await response.json();
}


// ==========================================
// PUBLIC ENDPOINTS
// ==========================================

async function submitFeedback(feedbackData) {
    if (APPS_SCRIPT_URL === "YOUR_APPS_SCRIPT_URL_HERE") {
        console.warn("Using mock API for submitFeedback.");
        return new Promise(resolve => setTimeout(() => resolve({ status: 'success' }), 1500));
    }
    try {
        const response = await fetch(APPS_SCRIPT_URL + '?action=submitFeedback', {
            method: 'POST',
            body: JSON.stringify(feedbackData),
            headers: { 'Content-Type': 'text/plain;charset=utf-8' }
        });
        if (!response.ok) throw new Error("Network response was not ok");
        return await response.json();
    } catch (error) {
        console.error("Error submitting feedback:", error);
        throw error;
    }
}

async function submitEnquiry(enquiryData) {
    if (APPS_SCRIPT_URL === "YOUR_APPS_SCRIPT_URL_HERE") {
        console.warn("Using mock API for submitEnquiry.");
        return new Promise(resolve => setTimeout(() => resolve({ status: 'success' }), 1000));
    }
    try {
        const response = await fetch(APPS_SCRIPT_URL + '?action=submitEnquiry', {
            method: 'POST',
            body: JSON.stringify(enquiryData),
            headers: { 'Content-Type': 'text/plain;charset=utf-8' }
        });
        if (!response.ok) throw new Error("Network response was not ok");
        return await response.json();
    } catch (error) {
        console.error("Error submitting enquiry:", error);
        throw error;
    }
}

async function fetchPublicFeedbacks() {
    if (APPS_SCRIPT_URL === "YOUR_APPS_SCRIPT_URL_HERE") {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({ feedbacks: [
                    { guest: "Ananya R.", rating: 5, comments: "Absolutely the best thing to do in Kodai with kids! We spent 4 hours here and still didn't finish everything. The zip-line is surprisingly thrilling.", date: "Oct 24, 2024" },
                    { guest: "Vikram S.", rating: 5, comments: "Great escape from the rain. The VR arena is top-notch. Clean, professional staff, and very well maintained indoor environment.", date: "Oct 23, 2024" }
                ]});
            }, 500);
        });
    }
    try {
        const queryParams = new URLSearchParams({ action: 'fetchPublicFeedbacks' }).toString();
        const response = await fetch(APPS_SCRIPT_URL + '?' + queryParams, { cache: 'no-store' });
        return await response.json();
    } catch (error) {
        console.error('Error fetching public feedbacks:', error);
        return { feedbacks: [] };
    }
}

async function fetchReviews(filters = {}, page = 1) {
    // Kept for backward compatibility if used anywhere on public pages
    return fetchPublicFeedbacks(); 
}


// ==========================================
// PROTECTED ADMIN ENDPOINTS
// ==========================================

async function fetchStatistics() {
    if (APPS_SCRIPT_URL === "YOUR_APPS_SCRIPT_URL_HERE") {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({
                    visitorsToday: 342, visitorsMonthly: 8450, averageRating: 4.8,
                    totalReviews: 1254, averageHoursSpent: "3.5", repeatVisitorRate: 28,
                    mostLovedCategory: "VR Arena",
                    demographics: { families: 45, tourists: 30, schoolGroups: 15, corporate: 10 },
                    historicalVisitors: [5000, 5200, 6100, 5800, 7200, 8450]
                });
            }, 600);
        });
    }
    try {
        const queryParams = new URLSearchParams({ action: 'fetchStatistics', token: getAuthToken() }).toString();
        const response = await fetch(APPS_SCRIPT_URL + '?' + queryParams, { cache: 'no-store' });
        const data = await response.json();
        if(data.status === 'error') throw new Error(data.message);
        return data;
    } catch (error) {
        throw error;
    }
}

async function fetchAdminFeedbacks(filters = {}, page = 1) {
    if (APPS_SCRIPT_URL === "YOUR_APPS_SCRIPT_URL_HERE") {
        return new Promise(resolve => {
            setTimeout(() => {
                const mockData = [
                    { id: "#F-9021", date: "Oct 24, 2024", guest: "Ravi Kumar", phone: "+91 98765 43210", rating: 5, comments: "Amazing experience at the roller coaster...", status: "PENDING" },
                    { id: "#F-9020", date: "Oct 23, 2024", guest: "Ananya S.", phone: "+91 99887 76655", rating: 4, comments: "The cafe menu could be more varied, but good...", status: "APPROVED" }
                ];
                let filtered = [...mockData];
                if (filters.status && filters.status !== 'All') filtered = filtered.filter(r => r.status === filters.status.toUpperCase());
                resolve({ feedbacks: filtered, total: filtered.length, hasMore: false });
            }, 600);
        });
    }

    try {
        const queryParams = new URLSearchParams({ action: 'fetchAdminFeedbacks', token: getAuthToken(), page, ...filters }).toString();
        const response = await fetch(APPS_SCRIPT_URL + '?' + queryParams, { cache: 'no-store' });
        const data = await response.json();
        if(data.status === 'error') throw new Error(data.message);
        return data;
    } catch (error) {
        throw error;
    }
}

async function updateFeedbackStatus(id, newStatus) {
    if (APPS_SCRIPT_URL === "YOUR_APPS_SCRIPT_URL_HERE") return new Promise(resolve => setTimeout(() => resolve({ success: true }), 500));
    try {
        const response = await fetch(APPS_SCRIPT_URL + '?action=updateFeedbackStatus', {
            method: 'POST',
            body: JSON.stringify({ id, status: newStatus, token: getAuthToken() }),
            headers: { 'Content-Type': 'text/plain;charset=utf-8' }
        });
        const data = await response.json();
        if(data.status === 'error') throw new Error(data.message);
        return data;
    } catch (error) {
        throw error;
    }
}

async function fetchAdminEnquiries(filters = {}, page = 1) {
    if (APPS_SCRIPT_URL === "YOUR_APPS_SCRIPT_URL_HERE") {
        return new Promise(resolve => {
            setTimeout(() => {
                const mockData = [
                    { id: "#E-105", date: "Oct 24, 2024", name: "TechCorp India", phone: "+91 98888 11111", email: "hr@techcorp.in", type: "Corporate Outing", message: "Looking to book for 50 employees.", status: "NEW" },
                ];
                let filtered = [...mockData];
                if (filters.status && filters.status !== 'All') filtered = filtered.filter(r => r.status === filters.status.toUpperCase());
                resolve({ enquiries: filtered, total: filtered.length, hasMore: false });
            }, 600);
        });
    }
    try {
        const queryParams = new URLSearchParams({ action: 'fetchAdminEnquiries', token: getAuthToken(), page, ...filters }).toString();
        const response = await fetch(APPS_SCRIPT_URL + '?' + queryParams, { cache: 'no-store' });
        const data = await response.json();
        if(data.status === 'error') throw new Error(data.message);
        return data;
    } catch (error) {
        throw error;
    }
}

async function updateEnquiryStatus(id, newStatus) {
    if (APPS_SCRIPT_URL === "YOUR_APPS_SCRIPT_URL_HERE") return new Promise(resolve => setTimeout(() => resolve({ success: true }), 500));
    try {
        const response = await fetch(APPS_SCRIPT_URL + '?action=updateEnquiryStatus', {
            method: 'POST',
            body: JSON.stringify({ id, status: newStatus, token: getAuthToken() }),
            headers: { 'Content-Type': 'text/plain;charset=utf-8' }
        });
        const data = await response.json();
        if(data.status === 'error') throw new Error(data.message);
        return data;
    } catch (error) {
        throw error;
    }
}

async function fetchCMSData() {
    if (APPS_SCRIPT_URL === "YOUR_APPS_SCRIPT_URL_HERE") {
        return new Promise(resolve => {
            setTimeout(() => {
                const stored = localStorage.getItem('mockCMSData');
                if(stored) return resolve(JSON.parse(stored));
                resolve({
                    heroTitle: "Experience the Magic of Kurunji",
                    heroSubtitle: "Unforgettable adventures await at Kodaikanal's premier amusement park.",
                    alertBanner: "Special Monsoon Offer: Get 20% off on all online bookings!",
                    seoTitle: "Kurunji Fun World | Kodaikanal",
                    seoDesc: "The best amusement park in Kodaikanal featuring VR arenas, 4D simulators, and family rides.",
                    aboutIntro: "Kurunji Fun World brings cutting-edge entertainment to the serene hills of Kodaikanal.",
                    hours: "Open Daily: 9:00 AM - 8:00 PM"
                });
            }, 600);
        });
    }
    try {
        // Technically fetchCMS is public so token isn't strictly required, but sending it doesn't hurt.
        const response = await fetch(APPS_SCRIPT_URL + '?action=fetchCMS', { cache: 'no-store' });
        return await response.json();
    } catch (error) {
        throw error;
    }
}

async function updateCMSContent(payload) {
    if (APPS_SCRIPT_URL === "YOUR_APPS_SCRIPT_URL_HERE") {
        return new Promise(resolve => {
            setTimeout(() => {
                localStorage.setItem('mockCMSData', JSON.stringify(payload));
                resolve({ success: true });
            }, 600);
        });
    }
    try {
        const response = await fetch(APPS_SCRIPT_URL + '?action=updateCMS', {
            method: 'POST',
            body: JSON.stringify({ payload, token: getAuthToken() }),
            headers: { 'Content-Type': 'text/plain;charset=utf-8' }
        });
        const data = await response.json();
        if(data.status === 'error') throw new Error(data.message);
        return data;
    } catch (error) {
        throw error;
    }
}

// ------------------------------------------
// ATTRACTIONS & VR (Keeping for completeness)
// ------------------------------------------
async function fetchAttractions() {
    try {
        const response = await fetch(APPS_SCRIPT_URL + '?action=fetchAttractions', { cache: 'no-store' });
        return await response.json();
    } catch (error) { return { attractions: [] }; }
}
async function fetchVRThemes() {
    try {
        const response = await fetch(APPS_SCRIPT_URL + '?action=fetchVRThemes', { cache: 'no-store' });
        return await response.json();
    } catch (error) { return { themes: [] }; }
}
