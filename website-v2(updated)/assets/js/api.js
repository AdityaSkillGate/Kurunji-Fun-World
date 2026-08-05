/**
 * Google Apps Script Integration for Kurunji Fun World
 * This file handles all fetching and data pushing to the Google Sheets backend.
 */

// Replace this with your deployed Google Apps Script Web App URL
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz_t8Ehs_zTGul953q-uIRT0TOYQArl7Uv1x5dSQqcNlILAjrL_B2tX44NMq3h8fqB5/exec";

/**
 * Submit feedback data to the backend.
 * @param {Object} feedbackData - The state object from visit.html
 * @returns {Promise<Object>} - The response from the server
 */
async function submitFeedback(feedbackData) {
    if (APPS_SCRIPT_URL === "YOUR_APPS_SCRIPT_URL_HERE") {
        // Mock successful response for UI testing
        console.warn("Using mock API for submitFeedback. Set APPS_SCRIPT_URL to use live data.");
        return new Promise(resolve => setTimeout(() => resolve({ status: 'success' }), 1500));
    }

    try {
        const response = await fetch(APPS_SCRIPT_URL + '?action=submitFeedback', {
            method: 'POST',
            body: JSON.stringify(feedbackData),
            headers: {
                'Content-Type': 'text/plain;charset=utf-8', // Apps script requires text/plain for CORS sometimes
            }
        });
        
        if (!response.ok) throw new Error("Network response was not ok");
        return await response.json();
    } catch (error) {
        console.error("Error submitting feedback:", error);
        throw error;
    }
}

/**
 * Submit contact/enquiry data to the backend.
 * @param {Object} enquiryData - The form data
 * @returns {Promise<Object>}
 */
async function submitEnquiry(enquiryData) {
    if (APPS_SCRIPT_URL === "YOUR_APPS_SCRIPT_URL_HERE") {
        console.warn("Using mock API for submitEnquiry.");
        return new Promise(resolve => setTimeout(() => resolve({ status: 'success' }), 1000));
    }

    try {
        const response = await fetch(APPS_SCRIPT_URL + '?action=submitEnquiry', {
            method: 'POST',
            body: JSON.stringify(enquiryData),
            headers: {
                'Content-Type': 'text/plain;charset=utf-8',
            }
        });
        
        if (!response.ok) throw new Error("Network response was not ok");
        return await response.json();
    } catch (error) {
        console.error("Error submitting enquiry:", error);
        throw error;
    }
}

/**
 * Fetch reviews from the Google Sheet.
 * @param {Object} filters - Search and filter parameters
 * @param {number} page - For pagination (Load More)
 * @returns {Promise<Array>} - Array of review objects
 */
async function fetchReviews(filters = {}, page = 1) {
    if (APPS_SCRIPT_URL === "YOUR_APPS_SCRIPT_URL_HERE") {
        console.warn("Using mock API for fetchReviews.");
        return new Promise(resolve => {
            setTimeout(() => {
                const mockReviews = [
                    { name: "Ananya R.", type: "Family", hours: "4+", rating: 5, text: "Absolutely the best thing to do in Kodai with kids! We spent 4 hours here and still didn't finish everything. The zip-line is surprisingly thrilling.", verified: true, source: "Google Review" },
                    { name: "Vikram S.", type: "Tourist", hours: "2", rating: 5, text: "Great escape from the rain. The VR arena is top-notch. Clean, professional staff, and very well maintained indoor environment.", verified: true, source: "Google Review" },
                    { name: "Meera T.", type: "Corporate", hours: "3", rating: 4, text: "Highly recommend the group packages! We came here for a team outing and the competitive arcade games were an absolute blast.", verified: false, source: "Local Guide" },
                    { name: "Rohan D.", type: "Friends", hours: "4+", rating: 5, text: "The 4D simulator was insane! We loved every minute. Definitely coming back.", verified: true, source: "Google Review" },
                    { name: "Priya K.", type: "Family", hours: "3", rating: 4, text: "Good place for kids to spend a few hours safely while parents relax.", verified: true, source: "Website" },
                    { name: "Arjun M.", type: "Tourist", hours: "1", rating: 3, text: "A bit crowded on weekends, but the games are fun.", verified: false, source: "Google Review" }
                ];
                
                // Simulate simple filtering
                let filtered = [...mockReviews];
                if (filters.search) {
                    const s = filters.search.toLowerCase();
                    filtered = filtered.filter(r => r.text.toLowerCase().includes(s) || r.name.toLowerCase().includes(s));
                }
                if (filters.rating && filters.rating !== "all") {
                    filtered = filtered.filter(r => r.rating >= parseInt(filters.rating));
                }
                if (filters.visitorType && filters.visitorType !== "all") {
                    filtered = filtered.filter(r => r.type.toLowerCase() === filters.visitorType.toLowerCase());
                }
                if (filters.hours && filters.hours !== "all") {
                    filtered = filtered.filter(r => r.hours === filters.hours);
                }

                // Simulate pagination (3 per page)
                const start = (page - 1) * 3;
                const end = start + 3;
                resolve({
                    reviews: filtered.slice(start, end),
                    hasMore: end < filtered.length
                });
            }, 800);
        });
    }

    try {
        const queryParams = new URLSearchParams({
            action: 'fetchReviews',
            page: page,
            ...filters
        }).toString();

        const response = await fetch(APPS_SCRIPT_URL + '?' + queryParams, { cache: 'no-store' });
        if (!response.ok) throw new Error("Network response was not ok");
        return await response.json();
    } catch (error) {
        console.error("Error fetching reviews:", error);
        throw error; // Let UI handle error
    }
}

/**
 * Fetch top-level statistics.
 * @returns {Promise<Object>}
 */
async function fetchStatistics() {
    if (APPS_SCRIPT_URL === "YOUR_APPS_SCRIPT_URL_HERE") {
        console.warn("Using mock API for fetchStatistics.");
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({
                    visitorsToday: 342,
                    visitorsMonthly: 8450,
                    averageRating: 4.8,
                    totalReviews: 1254,
                    averageHoursSpent: "3.5",
                    repeatVisitorRate: 28,
                    mostLovedCategory: "VR Arena",
                    demographics: {
                        families: 45,
                        tourists: 30,
                        schoolGroups: 15,
                        corporate: 10
                    },
                    historicalVisitors: [5000, 5200, 6100, 5800, 7200, 8450]
                });
            }, 600);
        });
    }

    try {
        const response = await fetch(APPS_SCRIPT_URL + '?action=fetchStatistics', { cache: 'no-store' });
        if (!response.ok) throw new Error("Network response was not ok");
        return await response.json();
    } catch (error) {
        console.error("Error fetching statistics:", error);
        throw error;
    }
}

/**
 * Fetch all feedbacks for the Admin portal (includes pending/rejected)
 */
async function fetchAdminFeedbacks(filters = {}, page = 1) {
    if (APPS_SCRIPT_URL === "YOUR_APPS_SCRIPT_URL_HERE") {
        return new Promise(resolve => {
            setTimeout(() => {
                const mockData = [
                    { id: "#F-9021", date: "Oct 24, 2024", guest: "Ravi Kumar", phone: "+91 98765 43210", rating: 5, comments: "Amazing experience at the roller coaster...", status: "PENDING" },
                    { id: "#F-9020", date: "Oct 23, 2024", guest: "Ananya S.", phone: "+91 99887 76655", rating: 4, comments: "The cafe menu could be more varied, but good...", status: "APPROVED" },
                    { id: "#F-9019", date: "Oct 22, 2024", guest: "John Doe", phone: "+91 88776 65544", rating: 2, comments: "Too crowded and long lines.", status: "REJECTED" },
                    { id: "#F-9018", date: "Oct 21, 2024", guest: "Priya M.", phone: "+91 99881 12233", rating: 5, comments: "Kids loved the VR arena!", status: "PENDING" }
                ];
                
                let filtered = [...mockData];
                if (filters.search) {
                    const s = filters.search.toLowerCase();
                    filtered = filtered.filter(r => r.guest.toLowerCase().includes(s) || r.comments.toLowerCase().includes(s));
                }
                if (filters.status && filters.status !== 'All') {
                    filtered = filtered.filter(r => r.status === filters.status.toUpperCase());
                }

                const start = (page - 1) * 10;
                const end = start + 10;
                resolve({
                    feedbacks: filtered.slice(start, end),
                    total: filtered.length,
                    hasMore: end < filtered.length
                });
            }, 600);
        });
    }

    try {
        const queryParams = new URLSearchParams({ action: 'fetchAdminFeedbacks', page, ...filters }).toString();
        const response = await fetch(APPS_SCRIPT_URL + '?' + queryParams, { cache: 'no-store' });
        return await response.json();
    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
}

/**
 * Update Feedback Status (Approve/Reject)
 */
async function updateFeedbackStatus(id, newStatus) {
    if (APPS_SCRIPT_URL === "YOUR_APPS_SCRIPT_URL_HERE") {
        return new Promise(resolve => setTimeout(() => resolve({ success: true }), 500));
    }
    
    try {
        const response = await fetch(APPS_SCRIPT_URL + '?action=updateFeedbackStatus', {
            method: 'POST',
            body: JSON.stringify({ id, status: newStatus }),
            headers: { 'Content-Type': 'text/plain;charset=utf-8' }
        });
        return await response.json();
    } catch (error) {
        throw error;
    }
}

/**
 * Fetch Enquiries for Admin Portal
 */
async function fetchAdminEnquiries(filters = {}, page = 1) {
    if (APPS_SCRIPT_URL === "YOUR_APPS_SCRIPT_URL_HERE") {
        return new Promise(resolve => {
            setTimeout(() => {
                const mockData = [
                    { id: "#E-105", date: "Oct 24, 2024", name: "TechCorp India", phone: "+91 98888 11111", email: "hr@techcorp.in", type: "Corporate Outing", message: "Looking to book for 50 employees.", status: "NEW" },
                    { id: "#E-104", date: "Oct 23, 2024", name: "Suresh P", phone: "+91 99999 22222", email: "suresh@example.com", type: "Group Booking", message: "Discount for 15 family members?", status: "CONTACTED" },
                    { id: "#E-103", date: "Oct 20, 2024", name: "St. Marys School", phone: "+91 77777 33333", email: "principal@stmarys.edu", type: "School Trip", message: "Trip for 100 students in December.", status: "RESOLVED" }
                ];
                
                let filtered = [...mockData];
                if (filters.search) {
                    const s = filters.search.toLowerCase();
                    filtered = filtered.filter(r => r.name.toLowerCase().includes(s) || r.message.toLowerCase().includes(s));
                }
                if (filters.status && filters.status !== 'All') {
                    filtered = filtered.filter(r => r.status === filters.status.toUpperCase());
                }

                const start = (page - 1) * 10;
                const end = start + 10;
                resolve({
                    enquiries: filtered.slice(start, end),
                    total: filtered.length,
                    hasMore: end < filtered.length
                });
            }, 600);
        });
    }

    try {
        const queryParams = new URLSearchParams({ action: 'fetchAdminEnquiries', page, ...filters }).toString();
        const response = await fetch(APPS_SCRIPT_URL + '?' + queryParams, { cache: 'no-store' });
        return await response.json();
    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
}

/**
 * Update Enquiry Status
 */
async function updateEnquiryStatus(id, newStatus) {
    if (APPS_SCRIPT_URL === "YOUR_APPS_SCRIPT_URL_HERE") {
        return new Promise(resolve => setTimeout(() => resolve({ success: true }), 500));
    }
    
    try {
        const response = await fetch(APPS_SCRIPT_URL + '?action=updateEnquiryStatus', {
            method: 'POST',
            body: JSON.stringify({ id, status: newStatus }),
            headers: { 'Content-Type': 'text/plain;charset=utf-8' }
        });
        return await response.json();
    } catch (error) {
        throw error;
    }
}

/**
 * Fetch CMS Data
 */
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
                    hours: "Open Daily: 9:00 AM - 7:30 PM"
                });
            }, 600);
        });
    }

    try {
        const response = await fetch(APPS_SCRIPT_URL + '?action=fetchCMS', { cache: 'no-store' });
        return await response.json();
    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
}

/**
 * Update CMS Data
 */
async function updateCMSContent(data) {
    if (APPS_SCRIPT_URL === "YOUR_APPS_SCRIPT_URL_HERE") {
        return new Promise(resolve => {
            setTimeout(() => {
                localStorage.setItem('mockCMSData', JSON.stringify(data));
                resolve({ success: true });
            }, 600);
        });
    }

    try {
        const response = await fetch(APPS_SCRIPT_URL + '?action=updateCMS', {
            method: 'POST',
            body: JSON.stringify(data),
            headers: { 'Content-Type': 'text/plain;charset=utf-8' }
        });
        return await response.json();
    } catch (error) {
        throw error;
    }
}
