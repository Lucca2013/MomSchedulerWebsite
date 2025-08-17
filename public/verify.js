document.addEventListener('DOMContentLoaded', () => {
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