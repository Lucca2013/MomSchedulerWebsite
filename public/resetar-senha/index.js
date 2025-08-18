        // Obter token da URL
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');

        const tokenVerificationDiv = document.getElementById("token-verification");
        const passwordResetForm = document.getElementById("password-reset-form");

        if (token) {
            console.log("Token recebido:", token);

            tokenVerificationDiv.classList.add("hidden");
            passwordResetForm.classList.remove("hidden");

            const successMessage = document.createElement("div");
            successMessage.className = "message success";
            successMessage.textContent = "Token verificado com sucesso! Por favor, defina sua nova senha.";
            passwordResetForm.parentNode.insertBefore(successMessage, passwordResetForm);
        } else {
            console.error("Token não encontrado na URL");
            tokenVerificationDiv.textContent = "❌ Token não encontrado. Por favor, use o link enviado por e-mail.";
            tokenVerificationDiv.className = "message error";
        }

        function togglePassword(inputId) {
            const input = document.getElementById(inputId);
            const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
            input.setAttribute('type', type);
        }

        document.getElementById("new-password").addEventListener("input", function (e) {
            const password = e.target.value;
            const strengthMeter = document.getElementById("password-strength-meter");
            const strengthText = document.getElementById("password-strength-text");

            let strength = 0;
            if (password.length >= 8) strength++;
            if (/[A-Z]/.test(password)) strength++;
            if (/[0-9]/.test(password)) strength++;
            if (/[^A-Za-z0-9]/.test(password)) strength++;

            strengthMeter.className = "strength-meter strength-" + strength;

            const strengthMessages = [
                "Muito fraca",
                "Fraca",
                "Média",
                "Forte",
                "Muito forte"
            ];
            strengthText.textContent = "Força: " + strengthMessages[strength];
            strengthText.style.color = ["#ff5252", "#ff9800", "#ffc107", "#8bc34a", "#4caf50"][strength];
        });

        document.getElementById("confirm-password").addEventListener("input", function (e) {
            const password = document.getElementById("new-password").value;
            const confirmPassword = e.target.value;
            const matchIndicator = document.getElementById("password-match");

            if (confirmPassword === "") {
                matchIndicator.textContent = "";
                return;
            }

            if (password === confirmPassword) {
                matchIndicator.textContent = "✔️ As senhas coincidem";
                matchIndicator.style.color = "#4caf50";
            } else {
                matchIndicator.textContent = "❌ As senhas não coincidem";
                matchIndicator.style.color = "#ff5252";
            }
        });

        passwordResetForm.addEventListener("submit", function (e) {
            e.preventDefault();

            const newPassword = document.getElementById("new-password").value;
            const confirmPassword = document.getElementById("confirm-password").value;

            if (newPassword !== confirmPassword) {
                alert("As senhas não coincidem. Por favor, verifique novamente.");
                return;
            }

            if (newPassword.length < 8) {
                alert("A senha deve ter pelo menos 8 caracteres.");
                return;
            }

            const submitButton = this.querySelector("button");
            submitButton.textContent = "Processando...";
            submitButton.disabled = true;

            setTimeout(() => {
                fetch('/reset-password', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ token, newPassword })
                })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            alert("✅ Senha redefinida com sucesso! Você será redirecionado para o login.");
                            setTimeout(() => {
                                window.location.href = "/";
                            }, 2000);
                        } else {
                            alert("❌ Falha ao redefinir a senha. O token pode ter expirado ou ser inválido.");
                            submitButton.textContent = "Redefinir Senha";
                        }
                    });
            }, 2000);
        });