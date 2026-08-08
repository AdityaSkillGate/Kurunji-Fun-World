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
 * Fetch approved feedbacks for the public website
 */
async function fetchPublicFeedbacks() {
    if (APPS_SCRIPT_URL === "YOUR_APPS_SCRIPT_URL_HERE") {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({ feedbacks: [
                    { guest: "Ananya R.", rating: 5, comments: "Absolutely the best thing to do in Kodai with kids! We spent 4 hours here and still didn't finish everything. The zip-line is surprisingly thrilling.", date: "Oct 24, 2024" },
                    { guest: "Vikram S.", rating: 5, comments: "Great escape from the rain. The VR arena is top-notch. Clean, professional staff, and very well maintained indoor environment.", date: "Oct 23, 2024" },
                    { guest: "Meera T.", rating: 5, comments: "Highly recommend the group packages! We came here for a team outing and the competitive arcade games were an absolute blast.", date: "Oct 22, 2024" }
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

/**
 * Fetch all attractions
 */
async function fetchAttractions() {
    if (APPS_SCRIPT_URL === "YOUR_APPS_SCRIPT_URL_HERE") {
        return new Promise(resolve => {
            setTimeout(() => {
                const mockAttractions = [
                    // Ground Floor (20)
                    { id: "A-01", name: "Massage Chair", slug: "massage-chair", type: "Indoor", floor: "Ground Floor", category: "Relaxation", description: "Relax with a mountain view.", status: "Active" },
                    { id: "A-02", name: "Play With Me", slug: "play-with-me", type: "Indoor", floor: "Ground Floor", category: "Interactive", description: "Fun interactive experience.", status: "Active" },
                    { id: "A-03", name: "Boxer", slug: "boxer", type: "Indoor", floor: "Ground Floor", category: "Games", description: "Test your punching strength.", status: "Active" },
                    { id: "A-04", name: "Down the Clown", slug: "down-the-clown", type: "Indoor", floor: "Ground Floor", category: "Games", description: "Classic carnival throwing game.", status: "Active" },
                    { id: "A-05", name: "Basketball", slug: "basketball", type: "Indoor", floor: "Ground Floor", category: "Games", description: "Shoot hoops and set high scores.", status: "Active" },
                    { id: "A-06", name: "Pink Love", slug: "pink-love", type: "Indoor", floor: "Ground Floor", category: "Games", description: "Try to win a cute plushie.", status: "Active" },
                    { id: "A-07", name: "Space Catcher", slug: "space-catcher", type: "Indoor", floor: "Ground Floor", category: "Games", description: "Space-themed prize catcher.", status: "Active" },
                    { id: "A-08", name: "Snail Times", slug: "snail-times", type: "Indoor", floor: "Ground Floor", category: "Kids", description: "Gentle fun for the little ones.", status: "Active" },
                    { id: "A-09", name: "Big Boss", slug: "big-boss", type: "Indoor", floor: "Ground Floor", category: "Interactive", description: "Take charge and play like a boss.", status: "Active" },
                    { id: "A-10", name: "Passion Blasting", slug: "passion-blasting", type: "Indoor", floor: "Ground Floor", category: "Games", description: "Intense arcade shooting action.", status: "Active" },
                    { id: "A-11", name: "VR 360", slug: "vr-360", type: "Indoor", floor: "Ground Floor", category: "Interactive", description: "Immersive 360 virtual reality experiences with 40+ themes.", status: "Active" },
                    { id: "A-12", name: "Rescue", slug: "rescue", type: "Indoor", floor: "Ground Floor", category: "Games", description: "Save the day in this action game.", status: "Active" },
                    { id: "A-13", name: "Crazy Ball", slug: "crazy-ball", type: "Indoor", floor: "Ground Floor", category: "Interactive", description: "Fast-paced ball action.", status: "Active" },
                    { id: "A-14", name: "Wave Riders", slug: "wave-riders", type: "Indoor", floor: "Ground Floor", category: "Interactive", description: "Ride the digital waves.", status: "Active" },
                    { id: "A-15", name: "VR 4 Seater", slug: "vr-4-seater", type: "Indoor", floor: "Ground Floor", category: "Interactive", description: "Group virtual reality adventure.", status: "Active" },
                    { id: "A-16", name: "Ace Shooter", slug: "ace-shooter", type: "Indoor", floor: "Ground Floor", category: "Games", description: "Show off your marksmanship.", status: "Active" },
                    { id: "A-17", name: "Crusin Blast", slug: "crusin-blast", type: "Indoor", floor: "Ground Floor", category: "Games", description: "High-speed arcade racing.", status: "Active" },
                    { id: "A-18", name: "Super Moto", slug: "super-moto", type: "Indoor", floor: "Ground Floor", category: "Games", description: "Motorcycle racing simulator.", status: "Active" },
                    { id: "A-19", name: "Power Hockey", slug: "power-hockey", type: "Indoor", floor: "Ground Floor", category: "Games", description: "Air hockey with a competitive edge.", status: "Active" },
                    { id: "A-20", name: "Horse Ride", slug: "horse-ride", type: "Indoor", floor: "Ground Floor", category: "Kids", description: "Classic horse riding fun for kids.", status: "Active" },
                    
                    // First Floor (3)
                    { id: "B-01", name: "Ball Pool", slug: "ball-pool", type: "Indoor", floor: "First Floor", category: "Kids", description: "Dive into a massive sea of colorful balls.", status: "Active" },
                    { id: "B-02", name: "Trampoline", slug: "trampoline", type: "Indoor", floor: "First Floor", category: "Family", description: "Bounce to your heart's content.", status: "Active" },
                    { id: "B-03", name: "Ninja", slug: "ninja", type: "Indoor", floor: "First Floor", category: "Family", description: "Test your agility on the Ninja course.", status: "Active" },
                    
                    // Outdoor (8)
                    { id: "C-01", name: "Crazy Roller", slug: "crazy-roller", type: "Outdoor", floor: "Outdoor", category: "Family", description: "A dizzying, exciting rolling experience.", status: "Active" },
                    { id: "C-02", name: "360 Cycle Ride", slug: "360-cycle-ride", type: "Outdoor", floor: "Outdoor", category: "Family", description: "Pedal your way to a full 360 loop.", status: "Active" },
                    { id: "C-03", name: "Human Gyro 360", slug: "human-gyro-360", type: "Outdoor", floor: "Outdoor", category: "Family", description: "Experience astronaut training gravity.", status: "Active" },
                    { id: "C-04", name: "Bull Ride", slug: "bull-ride", type: "Outdoor", floor: "Outdoor", category: "Family", description: "Hold on tight and beat the mechanical bull.", status: "Active" },
                    { id: "C-05", name: "Bungee Trampoline", slug: "bungee-trampoline", type: "Outdoor", floor: "Outdoor", category: "Family", description: "Jump higher than ever safely harnessed.", status: "Active" },
                    { id: "C-06", name: "Zero Gravity", slug: "zero-gravity", type: "Outdoor", floor: "Outdoor", category: "Family", description: "Defy gravity on this intense ride.", status: "Active" },
                    { id: "C-07", name: "Rocket Ejecter", slug: "rocket-ejecter", type: "Outdoor", floor: "Outdoor", category: "Family", description: "Launch straight up into the Kodaikanal sky.", status: "Active" },
                    { id: "C-08", name: "MeltDown", slug: "meltdown", type: "Outdoor", floor: "Outdoor", category: "Family", description: "Jump and duck to survive the sweeping arms.", status: "Active" },
                    
                    // Upcoming placeholders
                    { id: "C-09", name: "Zipline", slug: "zipline", type: "Outdoor", floor: "Outdoor", category: "Family", description: "Fly across the park with stunning views.", status: "Coming Soon" },
                    { id: "A-21", name: "Indoor Roller Coaster", slug: "indoor-roller-coaster", type: "Indoor", floor: "Ground Floor", category: "Family", description: "The ultimate indoor thrill ride.", status: "Coming Soon" }
                ];
                resolve({ attractions: mockAttractions });
            }, 500);
        });
    }

    try {
        const response = await fetch(APPS_SCRIPT_URL + '?action=fetchAttractions', { cache: 'no-store' });
        return await response.json();
    } catch (error) {
        console.error("Error:", error);
        return { attractions: [] };
    }
}

/**
 * Fetch a single attraction by slug
 */
async function fetchAttraction(slug) {
    const data = await fetchAttractions();
    const attraction = data.attractions.find(a => a.slug === slug);
    return attraction || null;
}

/**
 * Fetch VR Themes
 */
async function fetchVRThemes() {
    if (APPS_SCRIPT_URL === "YOUR_APPS_SCRIPT_URL_HERE") {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({ themes: [
                    { id: "VR-01", name: "Lost in Space", status: "Active" },
                    { id: "VR-02", name: "Tyrannosaurus Kingdom", status: "Active" },
                    { id: "VR-03", name: "Snow Valley Coaster", status: "Active" },
                    { id: "VR-04", name: "Solar System Tourism", status: "Active" },
                    { id: "VR-05", name: "Ocean Adventure", status: "Active" },
                    { id: "VR-06", name: "Train", status: "Active" }
                ]});
            }, 300);
        });
    }

    try {
        const response = await fetch(APPS_SCRIPT_URL + '?action=fetchVRThemes', { cache: 'no-store' });
        return await response.json();
    } catch (error) {
        console.error("Error:", error);
        return { themes: [] };
    }
}
