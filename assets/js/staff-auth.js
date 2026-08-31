/**
 * staff-auth.js
 * Instant 0ms Authentication & Page Transitions for Kurunji Fun World Staff POS
 */

// Immediate unhide on DOMContentLoaded if authenticated token exists in storage
(function initFastAuth() {
    let token = sessionStorage.getItem('adminToken') || localStorage.getItem('adminToken');
    if (!token && window.location.protocol === 'file:') {
        token = 'dev_pos_token';
        sessionStorage.setItem('adminToken', token);
        localStorage.setItem('adminToken', token);
    }
    if (token) {
        // Mark session active immediately
        document.documentElement.classList.add('staff-authenticated');
    }
})();

document.addEventListener('DOMContentLoaded', async () => {
    // If on login page and already logged in, redirect to POS
    if (window.location.pathname.includes('login')) {
        const token = sessionStorage.getItem('adminToken') || localStorage.getItem('adminToken');
        if (token) {
            window.location.href = 'staff-pos.html';
            return;
        }
    }
    
    const loginForm = document.getElementById('staff-login-form');
    if (loginForm) {
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
            spinner.classList.remove('hidden');
            spinner.classList.add('animate-spin');
            errBox.classList.add('hidden');
            
            try {
                const response = await adminLogin(email, password);
                
                if (response.status === 'success') {
                    // Set session in both sessionStorage & localStorage
                    sessionStorage.setItem('adminToken', response.token);
                    sessionStorage.setItem('adminRole', response.role);
                    sessionStorage.setItem('adminEmail', response.email);
                    sessionStorage.setItem('last_auth_validation_time', Date.now().toString());

                    localStorage.setItem('adminToken', response.token);
                    localStorage.setItem('adminRole', response.role);
                    localStorage.setItem('adminEmail', response.email);
                    
                    // Redirect to POS
                    window.location.href = 'staff-pos.html';
                } else {
                    errText.textContent = response.message || "Invalid credentials.";
                    errBox.classList.remove('hidden');
                }
            } catch (error) {
                console.error("Login error:", error);
                errText.textContent = "Connection error. Please try again.";
                errBox.classList.remove('hidden');
            } finally {
                btn.disabled = false;
                spinner.classList.add('hidden');
                spinner.classList.remove('animate-spin');
            }
        });
    }
});

// Helper for POS pages to enforce auth with INSTANT 0ms resolution
async function requireStaffAuth() {
    let token = sessionStorage.getItem('adminToken') || localStorage.getItem('adminToken');
    let role = sessionStorage.getItem('adminRole') || localStorage.getItem('adminRole') || 'Staff';
    let email = sessionStorage.getItem('adminEmail') || localStorage.getItem('adminEmail') || 'counter@kurunjifunworld.com';

    // Seamless fallback for local file:// testing
    if (!token && window.location.protocol === 'file:') {
        token = 'dev_local_token';
        sessionStorage.setItem('adminToken', token);
        localStorage.setItem('adminToken', token);
    }

    if (!token) {
        window.location.href = 'staff-login.html';
        return null;
    }

    // Immediately unhide body (0ms instant render - NO BLANK WHITE SCREEN!)
    const appBody = document.getElementById('app-body');
    if (appBody) {
        appBody.classList.remove('hidden');
    }

    const session = { status: 'success', token, role, email };

    // Background silent token check every 10 minutes (does not delay or block UI)
    const lastValidated = parseInt(sessionStorage.getItem('last_auth_validation_time') || '0');
    if (Date.now() - lastValidated > 600000 && navigator.onLine && window.location.protocol !== 'file:' && !token.startsWith('dev_')) {
        if (typeof validateAdminSession === 'function') {
            validateAdminSession().then(res => {
                if (res && res.status === 'success') {
                    sessionStorage.setItem('last_auth_validation_time', Date.now().toString());
                } else if (res && res.status === 'error') {
                    sessionStorage.clear();
                    localStorage.removeItem('adminToken');
                    window.location.href = 'staff-login.html';
                }
            }).catch(() => {});
        }
    }

    return session;
}

// Global Page Transition Loading Spinner with Fast Auto-Dismiss
function getGlobalLoader() {
    let overlay = document.getElementById('global-page-loader');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'global-page-loader';
        overlay.innerHTML = `
            <div class="bg-slate-900/90 backdrop-blur-sm text-white px-5 py-4 rounded-2xl flex items-center gap-3 shadow-2xl border border-slate-700">
                <div class="animate-spin rounded-full h-7 w-7 border-t-2 border-b-2 border-primary"></div>
                <div class="font-bold text-sm tracking-wide">Loading...</div>
            </div>
        `;
        overlay.className = 'fixed inset-0 bg-slate-900/30 backdrop-blur-[2px] z-[9999] flex items-center justify-center pointer-events-none opacity-0 transition-opacity duration-150';
        overlay.style.display = 'none';
        document.body.appendChild(overlay);
    }
    return overlay;
}

function hideGlobalLoader() {
    const overlay = document.getElementById('global-page-loader');
    if (overlay) {
        overlay.classList.add('opacity-0');
        overlay.classList.add('pointer-events-none');
        overlay.classList.remove('opacity-100');
        overlay.classList.remove('pointer-events-auto');
        setTimeout(() => {
            if (overlay && overlay.classList.contains('opacity-0')) {
                overlay.style.display = 'none';
            }
        }, 150);
    }
}

function showGlobalLoader() {
    const overlay = getGlobalLoader();
    overlay.style.display = 'flex';
    requestAnimationFrame(() => {
        overlay.classList.remove('opacity-0');
        overlay.classList.remove('pointer-events-none');
        overlay.classList.add('opacity-100');
        overlay.classList.add('pointer-events-auto');
    });
    // Safety auto-dismiss in case navigation is instantaneous or cancelled
    setTimeout(hideGlobalLoader, 800);
}

// Reset on pageshow (handles browser Back/Forward bfcache)
window.addEventListener('pageshow', hideGlobalLoader);
window.addEventListener('load', hideGlobalLoader);
document.addEventListener('DOMContentLoaded', () => {
    hideGlobalLoader();

    // Attach smooth loading indicator on links without breaking normal navigation
    document.querySelectorAll('a[href]').forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href && !href.startsWith('#') && !href.startsWith('javascript:') && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
                showGlobalLoader();
            }
        });
    });
});
