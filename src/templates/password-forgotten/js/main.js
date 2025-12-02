import { currentLanguage } from "./language.js";

function showNotification(message, type) {
    const notification = document.getElementById('notification');
    if (!notification) return console.warn('notification element not found');
    notification.textContent = message;
    notification.className = `notification ${type} show`;
    setTimeout(() => notification.classList.remove('show'), 3000);
}

document.getElementById('password-reset-form').addEventListener('submit', function (e) {
    e.preventDefault();
    const email = document.getElementById('reset-email').value.trim();

    if (!validateEmail(email)) {
        showNotification('Please, send a valid email', 'error');
        return;
    }

    showNotification('Sending request...', 'success');
    console.log('[forgot] sending POST /api/forgot-password', { email, language: currentLanguage });

    fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, language: currentLanguage })
    })
    .then(async response => {
        if (!response.ok) {
            const errMsg = data.error || data.message || data._text || `HTTP ${response.status}`;
            showNotification(errMsg, 'error');
            throw new Error(errMsg);
        }

        showNotification(`Link sent to ${email}`, 'success');
    })
    .catch(err => {
        console.error('[forgot] fetch error', err);
        showNotification(err.message || 'Something went wrong, try again', 'error');
    });
});

function validateEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}
