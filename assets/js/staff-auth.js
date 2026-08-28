/**
 * staff-auth.js
 * Handles authentication for the Staff POS system.
 */

document.addEventListener('DOMContentLoaded', async () => {
    // If on login page and already logged in, redirect to POS
    if (window.location.pathname.includes('login')) {
        const session = await validateAdminSession();
        if (session && session.status === 'success') {
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
                // Reuse existing adminLogin from api.js
                const response = await adminLogin(email, password);
                
                if (response.status === 'success') {
                    // Set session
                    sessionStorage.setItem('adminToken', response.token);
                    sessionStorage.setItem('adminRole', response.role);
                    sessionStorage.setItem('adminEmail', response.email);
                    
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

// Helper for POS page to enforce auth
async function requireStaffAuth() {
    const session = await validateAdminSession();
    if (!session || session.status !== 'success') {
        window.location.href = 'staff-login.html';
        return null;
    }
    return session;
}

// Global Page Transition Loading Spinner with BFCache & Back-Button Protection
function getGlobalLoader() {
    let overlay = document.getElementById('global-page-loader');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'global-page-loader';
        overlay.innerHTML = '<div class="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary"></div>';
        overlay.className = 'fixed inset-0 bg-white/80 z-[9999] flex items-center justify-center pointer-events-none opacity-0 transition-opacity duration-200';
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
        }, 200);
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
    // Safety auto-dismiss in case navigation is cancelled or delayed
    setTimeout(hideGlobalLoader, 2000);
}

// Reset on pageshow (handles browser Back/Forward bfcache)
window.addEventListener('pageshow', (event) => {
    hideGlobalLoader();
});
window.addEventListener('load', hideGlobalLoader);
document.addEventListener('DOMContentLoaded', () => {
    hideGlobalLoader();

    // Attach smooth loading indicator on links without breaking normal navigation
    document.querySelectorAll('a[href]').forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            // Ignore anchor hashes, javascript links, or modified clicks (ctrl/cmd/shift)
            if (href && !href.startsWith('#') && !href.startsWith('javascript:') && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
                showGlobalLoader();
            }
        });
    });
});
