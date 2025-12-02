import { currentLanguage } from "./language.js";
import { translations } from "./language.js";
import applyLanguage from "./language.js";

const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');

const tokenVerificationDiv = document.getElementById("token-verification");
const passwordResetForm = document.getElementById("password-reset-form");

async function initializeTokenLogic() {
    const t = translations[currentLanguage];

    if (token) {
        const res = await fetch(`/api/validate-reset-token/${token}`);

        if (!res.ok) {
            tokenVerificationDiv.textContent = currentLanguage == "pt" ? "Token Inválido, o token deve ter expirado" : "Invalid Token, the token must be expired"
            tokenVerificationDiv.className = "message error";
            return;
        }

        tokenVerificationDiv.classList.add("hidden");
        passwordResetForm.classList.remove("hidden");

        const successMessage = document.createElement("div");
        successMessage.className = "message success";
        successMessage.textContent = t.tokenFoundSuccess;
        passwordResetForm.parentNode.insertBefore(successMessage, passwordResetForm);
    } else {
        tokenVerificationDiv.textContent = t.tokenNotFound;
        tokenVerificationDiv.className = "message error";
    }
}

function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
    input.setAttribute('type', type);
}

document.getElementById("new-password").addEventListener("input", function (e) {
    const t = translations[currentLanguage];
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
        t.strength0,
        t.strength1,
        t.strength2,
        t.strength3,
        t.strength4
    ];
    strengthText.textContent = t.strengthPrefix + strengthMessages[strength];
    strengthText.style.color = ["#ff5252", "#ff9800", "#ffc107", "#8bc34a", "#4caf50"][strength];
});

document.getElementById("confirm-password").addEventListener("input", function (e) {
    const t = translations[currentLanguage];
    const password = document.getElementById("new-password").value;
    const confirmPassword = e.target.value;
    const matchIndicator = document.getElementById("password-match");

    if (confirmPassword === "") {
        matchIndicator.textContent = "";
        return;
    }

    if (password === confirmPassword) {
        matchIndicator.textContent = t.matchSuccess;
        matchIndicator.style.color = "#4caf50";
    } else {
        matchIndicator.textContent = t.matchError;
        matchIndicator.style.color = "#ff5252";
    }
});

passwordResetForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const t = translations[currentLanguage];

    const newPassword = document.getElementById("new-password").value;
    const confirmPassword = document.getElementById("confirm-password").value;
    const submitButton = this.querySelector("button");

    if (newPassword !== confirmPassword) {
        alert(t.passwordMismatchAlert);
        return;
    }

    if (newPassword.length < 8) {
        alert(t.passwordLengthAlert);
        return;
    }

    submitButton.textContent = t.processingButton;
    submitButton.disabled = true;

    setTimeout(() => {
        fetch('/api/reset-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token, newPassword })
        })
            .then(response => {
                if (response.ok) {
                    alert(t.resetSuccessAlert);
                    setTimeout(() => {
                        window.location.href = "/";
                    }, 2000);
                } else {
                    alert(t.resetFailureAlert);
                    submitButton.textContent = t.resetButton;
                    submitButton.disabled = false;
                }
            })
            .catch(() => {
                alert(t.resetFailureAlert);
                submitButton.textContent = t.resetButton;
                submitButton.disabled = false;
            });
    }, 2000);
});

document.getElementById("confirm-password-eye").addEventListener('click', () => {
    togglePassword("confirm-password");
});

document.getElementById("new-password-eye").addEventListener('click', () => {
    togglePassword("new-password");
});

document.addEventListener("DOMContentLoaded", () => {
    applyLanguage(currentLanguage);
    initializeTokenLogic();
});