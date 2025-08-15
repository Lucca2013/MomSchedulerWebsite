document.addEventListener('DOMContentLoaded', () => {
    fetch('/auth/status', {
        credentials: 'include'
    })
        .then(response => response.json())
        .then(data => {
            if (!data.authenticated) {
                // Não está logado - voltar para login
                window.location.href = '/';
            } else {
                // Mostrar dashboard
                document.body.style.display = 'flex';
            }
        })
        .catch(error => {
            console.error('Erro ao verificar login:', error);
            window.location.href = '/';
        });
});