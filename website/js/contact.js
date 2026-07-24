document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('enquiry-form');
    const pendingState = document.getElementById('form-pending-state');
    const resetBtn = document.getElementById('reset-form-btn');

    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        let isValid = true;
        
        // Fields
        const name = document.getElementById('name');
        const phone = document.getElementById('phone');
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
            // Build WhatsApp Message
            const waNumber = '919751182000';
            const email = document.getElementById('email') ? document.getElementById('email').value.trim() : '';
            const emailText = email ? `\nEmail: ${email}` : '';
            const text = `Hello, I have an enquiry from the website.\n\nName: ${name.value.trim()}\nPhone: ${phone.value.trim()}${emailText}\nEnquiry Type: ${type.options[type.selectedIndex].text}\nMessage: ${message.value.trim()}`;
            const encodedText = encodeURIComponent(text);
            const waUrl = `https://wa.me/${waNumber}?text=${encodedText}`;
            
            // Redirect to WhatsApp
            window.open(waUrl, '_blank');

            // Reset form
            form.reset();
        }
    });

    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            form.reset();
            pendingState.classList.add('opacity-0', 'pointer-events-none');
            form.style.opacity = '1';
            form.style.pointerEvents = 'auto';
            
            // Clear any error states just in case
            const inputs = form.querySelectorAll('input, select, textarea');
            inputs.forEach(input => input.classList.remove('border-error'));
            const errors = form.querySelectorAll('.text-error.text-xs');
            errors.forEach(error => error.classList.add('hidden'));
        });
    }
});
