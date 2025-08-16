document.addEventListener('DOMContentLoaded', () => {
    fetch('/auth/status', {
        credentials: 'include'
    })
        .then(response => response.json())
        .then(data => {
            if (!data.authenticated) {
                window.location.href = '/';
            } else {
                document.body.style.display = 'flex';
            }
        })
        .catch(error => {
            console.error('Erro ao verificar login:', error);
            window.location.href = '/';
        });
});