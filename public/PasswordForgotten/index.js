function showNotification(message, type) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type} show`;

    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

document.getElementById('password-reset-form').addEventListener('submit', function (e) {
    e.preventDefault();

    const email = document.getElementById('reset-email').value;

    if (!validateEmail(email)) {
        showNotification('Por favor, insira um e-mail válido', 'error');
        return;
    }

    showNotification('Enviando solicitação... aguarde', 'success');

    fetch('/PasswordForgotten', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => {
                throw new Error(err.error || 'Erro ao enviar solicitação');
            });
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            showNotification(`Link de recuperação enviado para ${email}`, 'success');
        } else {
            showNotification(data.error || 'Ocorreu um erro inesperado', 'error');
        }
    })
    .catch(error => {
        showNotification(error.message || 'Erro na conexão com o servidor', 'error');
    });
});

function validateEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}