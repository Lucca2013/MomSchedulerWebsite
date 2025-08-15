document.addEventListener('DOMContentLoaded', () => {
  // Não verificar autenticação se já estiver na página de login
  if (window.location.pathname === '/') {
    document.body.style.display = 'flex';
    return;
  }

  fetch('/auth/status', {
    credentials: 'include'
  })
  .then(response => response.json())
  .then(data => {
    if (data.authenticated) {
      window.location.href = '/loged/index.html';
    } else {
      document.body.style.display = 'flex';
    }
  })
  .catch(error => {
    console.error('Erro ao verificar login:', error);
    document.body.style.display = 'flex';
  });
});