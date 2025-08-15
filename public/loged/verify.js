document.addEventListener('DOMContentLoaded', () => {
  // Verifica se já está na página de login
  if (window.location.pathname === '/') return;
  
  fetch('/auth/status', {
    credentials: 'include'
  })
  .then(response => response.json())
  .then(data => {
    if (!data.authenticated) {
      // Adiciona delay para evitar loop
      setTimeout(() => {
        window.location.href = '/';
      }, 500);
    } else {
      document.body.style.display = 'flex';
    }
  })
  .catch(error => {
    console.error('Erro ao verificar login:', error);
    setTimeout(() => {
      window.location.href = '/';
    }, 1000);
  });
});