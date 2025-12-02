const notification = document.getElementById('notification');
const loginContainer = document.getElementById('login-container');
const registerContainer = document.getElementById('register-container');
const showLoginBtn = document.getElementById('show-login');
const showRegisterBtn = document.getElementById('show-register');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');

const loginPassword = document.getElementById('login-password');
const loginPasswordToggle = document.getElementById('login-password-toggle');
const registerPassword = document.getElementById('register-password');
const registerPasswordToggle = document.getElementById('register-password-toggle');
const registerConfirm = document.getElementById('register-confirm');
const registerConfirmToggle = document.getElementById('register-confirm-toggle');

function showNotification(message, isSuccess = true) {
    notification.textContent = message;
    notification.className = `notification ${isSuccess ? 'success' : 'error'} show`;

    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

showRegisterBtn.addEventListener('click', () => {
    loginContainer.classList.remove('active');
    registerContainer.classList.add('active');
});

showLoginBtn.addEventListener('click', () => {
    registerContainer.classList.remove('active');
    loginContainer.classList.add('active');
});

function togglePasswordVisibility(passwordInput, toggleIcon) {
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.classList.remove('fa-eye');
        toggleIcon.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        toggleIcon.classList.remove('fa-eye-slash');
        toggleIcon.classList.add('fa-eye');
    }
}

loginPasswordToggle.addEventListener('click', () => togglePasswordVisibility(loginPassword, loginPasswordToggle));
registerPasswordToggle.addEventListener('click', () => togglePasswordVisibility(registerPassword, registerPasswordToggle));
registerConfirmToggle.addEventListener('click', () => togglePasswordVisibility(registerConfirm, registerConfirmToggle));

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    if (!email || !password) {
        showNotification('Por favor, preencha todos os campos', false);
        return;
    } else {
        loginList = {
            email: email,
            password: password
        };
    }
    console.log(loginList);

    try {
        const response = await fetch('api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginList)
        });

        if (response.ok) {
            showNotification('Login realizado com sucesso!', true);
            setTimeout(() => {
                location.reload();
            }, 1000);
        } else {
            if (response.status === 401) {
                showNotification('E-mail ou senha inválidos', false);
            } else {
                showNotification('Erro ao realizar login, resposta do back not ok', false);
            }
        }
    } catch (error) {
        showNotification('Erro ao realizar login', false);
    }

});

registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;

    const RegistroList = {
        username: name,
        email: email,
        password: password
    };

    try {
        const response = await fetch('api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(RegistroList)
        });

        if (response.ok) {
            showNotification('Registro realizado com sucesso!', true);
            registerContainer.classList.remove('active');
            loginContainer.classList.add('active');

        } else {
            showNotification('Erro ao realizar registro, resposta do back not ok', false);
        }
    } catch (error) {
        showNotification(`Erro ao realizar registro: ${error.message}`, false);
    }
});

document.querySelectorAll('.social-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        showNotification('Login social selecionado', true);
    });
});