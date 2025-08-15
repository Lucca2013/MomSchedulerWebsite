document.addEventListener('DOMContentLoaded', () => {
  const checkAuth = () => {
    fetch('/auth/status', {
      credentials: 'include'
    })
    .then(response => {
      if (response.status === 401) {
        throw new Error('Não autenticado');
      }
      return response.json();
    })
    .then(data => {
      if (!data.authenticated) {
        window.location.href = '/';
      } else {
        document.body.style.display = 'flex';
        // Força o carregamento das tarefas se não estiverem visíveis
        if (document.getElementById('lista-tarefas').children.length === 0) {
          setTimeout(() => {
            window.location.reload();
          }, 500);
        }
      }
    })
    .catch(error => {
      console.error('Erro ao verificar login:', error);
      window.location.href = '/';
    });
  };

  // Primeira verificação
  checkAuth();
  
  // Verificação adicional após 1 segundo
  setTimeout(checkAuth, 1000);
});