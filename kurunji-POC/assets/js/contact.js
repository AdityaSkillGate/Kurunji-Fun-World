document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('enquiry-form');
    const successState = document.getElementById('form-success-state');
    const errorState = document.getElementById('form-error-state');
    const submitBtn = document.getElementById('submit-btn');
    const resetBtn = document.getElementById('reset-form-btn');

    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        let isValid = true;
        
        // Fields
        const name = document.getElementById('name');
        const phone = document.getElementById('phone');
        const email = document.getElementById('email');
        const type = document.getElementById('type');
        const message = document.getElementById('message');
        
        // Errors
        const nameError = document.getElementById('name-error');
        const phoneError = document.getElementById('phone-error');
        const typeError = document.getElementById('type-error');
        const messageError = document.getElementById('message-error');

        // Reset errors
        [nameError, phoneError, typeError, messageError].forEach(err => err.classList.add('hidden'));
        [name, phone, type, message].forEach(field => field.classList.remove('border-error'));
        errorState.classList.add('hidden');

        // Validation
        if (!name.value.trim()) {
            nameError.classList.remove('hidden');
            name.classList.add('border-error');
            isValid = false;
        }

        if (!phone.value.trim() || phone.value.length < 8) {
            phoneError.classList.remove('hidden');
            phone.classList.add('border-error');
            isValid = false;
        }

        if (!type.value) {
            typeError.classList.remove('hidden');
            type.classList.add('border-error');
            isValid = false;
        }

        if (!message.value.trim()) {
            messageError.classList.remove('hidden');
            message.classList.add('border-error');
            isValid = false;
        }

        if (isValid) {
            // Setup Loading State
            const originalBtnHtml = submitBtn.innerHTML;
            submitBtn.innerHTML = '<span class="material-symbols-outlined animate-spin">progress_activity</span> <span>Submitting...</span>';
            submitBtn.disabled = true;
            submitBtn.classList.add('opacity-80', 'cursor-not-allowed');

            try {
                // Check if api is loaded
                if (typeof submitEnquiry !== 'function') {
                    throw new Error("API not loaded");
                }

                // Submit to backend via api.js
                await submitEnquiry({
                    name: name.value.trim(),
                    phone: phone.value.trim(),
                    email: email.value.trim(),
                    enquiryType: type.value,
                    message: message.value.trim()
                });

                // Show Success
                form.classList.add('hidden');
                successState.classList.remove('hidden');
                successState.classList.add('flex');
            } catch (err) {
                console.error("Enquiry submission failed:", err);
                errorState.classList.remove('hidden');
            } finally {
                // Restore button state
                submitBtn.innerHTML = originalBtnHtml;
                submitBtn.disabled = false;
                submitBtn.classList.remove('opacity-80', 'cursor-not-allowed');
            }
        }
    });

    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            form.reset();
            
            // Hide success, show form
            successState.classList.add('hidden');
            successState.classList.remove('flex');
            form.classList.remove('hidden');
            
            // Clear any error states just in case
            const inputs = form.querySelectorAll('input, select, textarea');
            inputs.forEach(input => input.classList.remove('border-error'));
            const errors = form.querySelectorAll('.text-error.text-xs');
            errors.forEach(error => error.classList.add('hidden'));
            errorState.classList.add('hidden');
        });
    }
});
