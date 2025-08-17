document.addEventListener('DOMContentLoaded', function () {
        const logoutBtn = document.getElementById('logout-btn');

        if (logoutBtn) {
            logoutBtn.addEventListener('click', function () {
                fetch('/logout', {
                    method: 'POST',
                    credentials: 'include' 
                })
                .then(response => {
                    if (response.ok) {
                        window.location.href = '/';
                    } else {
                        console.error('Erro ao realizar logout');
                    }
                })
                .catch(error => {
                    console.error('Erro ao realizar logout:', error);
                });
            });
        } else {
            console.error('Botão de logout não encontrado!');
        }
    });