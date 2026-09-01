/**
 * assets/js/staff-auth.js
 * Clean Staff Authentication & Session Guard for Kurunji Fun World POS
 */

// Global logout function
window.staffLogout = function() {
    sessionStorage.removeItem('adminToken');
    sessionStorage.removeItem('adminRole');
    sessionStorage.removeItem('adminEmail');
    sessionStorage.removeItem('last_auth_validation_time');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminRole');
    localStorage.removeItem('adminEmail');
    window.location.href = 'staff-login.html';
};

document.addEventListener('DOMContentLoaded', () => {
    // If on login page
    const loginForm = document.getElementById('staff-login-form');
    if (loginForm) {
        // If already logged in with a real token, check if we should auto-continue
        const token = sessionStorage.getItem('adminToken') || localStorage.getItem('adminToken');
        if (token && token.startsWith('TKN-')) {
            // Valid token exists, offer fast continue or stay on login
        }

        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const btn = document.getElementById('login-btn');
            const spinner = document.getElementById('login-spinner');
            const errBox = document.getElementById('login-error');
            const errText = document.getElementById('login-error-text');
            
            // UI Loading state
            btn.disabled = true;
            if (spinner) {
                spinner.classList.remove('hidden');
                spinner.classList.add('animate-spin');
            }
            if (errBox) errBox.classList.add('hidden');
            
            try {
                const response = await adminLogin(email, password);
                
                if (response && response.status === 'success') {
                    // Set session in both sessionStorage & localStorage
                    sessionStorage.setItem('adminToken', response.token);
                    sessionStorage.setItem('adminRole', response.role || 'COUNTER_STAFF');
                    sessionStorage.setItem('adminEmail', response.email || email);
                    sessionStorage.setItem('last_auth_validation_time', Date.now().toString());

                    localStorage.setItem('adminToken', response.token);
                    localStorage.setItem('adminRole', response.role || 'COUNTER_STAFF');
                    localStorage.setItem('adminEmail', response.email || email);
                    
                    // Redirect to POS Dashboard
                    window.location.href = 'staff-pos.html';
                } else {
                    if (errText) errText.textContent = (response && response.message) ? response.message : "Invalid credentials.";
                    if (errBox) errBox.classList.remove('hidden');
                }
            } catch (error) {
                console.error("Login error:", error);
                if (errText) errText.textContent = "Connection error. Please check internet connection.";
                if (errBox) errBox.classList.remove('hidden');
            } finally {
                btn.disabled = false;
                if (spinner) {
                    spinner.classList.add('hidden');
                    spinner.classList.remove('animate-spin');
                }
            }
        });
    }

    // Attach logout handlers to any logout buttons on the page
    document.querySelectorAll('[data-action="logout"], #logout-btn, .logout-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            staffLogout();
        });
    });
});

/**
 * Guard function for POS pages: requires active staff session
 */
function requireStaffAuth() {
    let token = sessionStorage.getItem('adminToken') || localStorage.getItem('adminToken');
    let role = sessionStorage.getItem('adminRole') || localStorage.getItem('adminRole') || 'COUNTER_STAFF';
    let email = sessionStorage.getItem('adminEmail') || localStorage.getItem('adminEmail') || 'staff@exmail.com';

    if (!token) {
        window.location.href = 'staff-login.html';
        return null;
    }

    // Show body content smoothly
    const appBody = document.getElementById('app-body');
    if (appBody) {
        appBody.classList.remove('hidden', 'opacity-0');
        appBody.classList.add('opacity-100');
    }
    document.documentElement.classList.add('staff-authenticated');

    // Update staff email badge
    const staffBadge = document.getElementById('staff-email-badge');
    if (staffBadge && email) {
        staffBadge.textContent = email.split('@')[0].toUpperCase();
    }

    return { token, role, email };
}
