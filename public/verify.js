document.addEventListener('DOMContentLoaded', () => {
  fetch('/auth/status', {
    credentials: 'include' // IMPORTANTE: envia cookies
  })
    .then(response => response.json())
    .then(data => {
      if (data.authenticated) {
        // Usuário já está logado - redirecionar
        window.location.href = '/loged/index.html';
      } else {
        // Mostrar formulário de login normalmente
        document.body.style.display = 'flex';
      }
    })
    .catch(error => {
      console.error('Erro ao verificar login:', error);
      document.body.style.display = 'flex';
    });
});