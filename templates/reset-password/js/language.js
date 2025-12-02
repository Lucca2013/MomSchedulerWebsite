export const translations = {
    pt: {
        pageTitle: "MomScheduler",
        headerTitle: "MomScheduler",
        headerSubtitle: "Acesse sua conta para gerenciar suas tarefas",

        recoveryPageTitle: "Recuperação de Senha - Sistema de Tarefas",
        recoverHeaderTitle: "Recuperar Senha",
        recoverHeaderSubtitle: "Redefina sua senha em poucos passos",

        resetPageTitle: "Redefinir Senha",
        resetHeaderTitle: "Redefinir Senha",

        verifyingMessage: "Verificando seu link de redefinição...",
        tokenInvalidError: "O link de redefinição é inválido ou expirou. Tente novamente.",

        newPasswordLabel: "Nova Senha",
        confirmPasswordLabel: "Confirmar Nova Senha",
        newPasswordPlaceholder: "Digite sua nova senha",
        confirmPasswordPlaceholder: "Confirme sua nova senha",
        resetButton: "Redefinir Senha",

        passwordStrengthText: "Força da senha",
        strengthMatch: "As senhas coincidem",
        strengthMismatch: "As senhas não coincidem",
        strengthEmpty: "",

        footerText: "Voltar para a",
        footerLink: "home",

        tokenFoundSuccess: "Token verificado com sucesso! Por favor, defina sua nova senha.",
        tokenNotFound: "❌ Token não encontrado. Por favor, use o link enviado por e-mail.",

        strengthPrefix: "Força: ",
        strength0: "Muito fraca",
        strength1: "Fraca",
        strength2: "Média",
        strength3: "Forte",
        strength4: "Muito forte",

        matchSuccess: "✔️ As senhas coincidem",
        matchError: "❌ As senhas não coincidem",

        passwordMismatchAlert: "As senhas não coincidem. Por favor, verifique novamente.",
        passwordLengthAlert: "A senha deve ter pelo menos 8 caracteres.",
        processingButton: "Processando...",
        resetSuccessAlert: "✅ Senha redefinida com sucesso! Você será redirecionado para o login.",
        resetFailureAlert: "❌ Falha ao redefinir a senha. O token pode ter expirado ou ser inválido.",
        resetButton: "Redefinir Senha"

    },
    en: {
        pageTitle: "MomScheduler",
        headerTitle: "MomScheduler",
        headerSubtitle: "Access your account to manage your tasks",

        recoveryPageTitle: "Password Recovery - Task System",
        recoverHeaderTitle: "Recover Password",
        recoverHeaderSubtitle: "Reset your password in a few steps",

        resetPageTitle: "Reset Password",
        resetHeaderTitle: "Reset Password",

        verifyingMessage: "Verifying your reset link...",
        tokenInvalidError: "The reset link is invalid or expired. Please try again.",

        newPasswordLabel: "New Password",
        confirmPasswordLabel: "Confirm New Password",
        newPasswordPlaceholder: "Enter your new password",
        confirmPasswordPlaceholder: "Confirm your new password",
        resetButton: "Reset Password",

        passwordStrengthText: "Password strength",
        strengthMatch: "Passwords match",
        strengthMismatch: "Passwords do not match",
        strengthEmpty: "",

        footerText: "Back to",
        footerLink: "home",

        tokenFoundSuccess: "Token successfully verified! Please set your new password.",
        tokenNotFound: "❌ Token not found. Please use the link sent by email.",
        
        strengthPrefix: "Strength: ",
        strength0: "Very weak",
        strength1: "Weak",
        strength2: "Medium",
        strength3: "Strong",
        strength4: "Very strong",
        
        matchSuccess: "✔️ Passwords match",
        matchError: "❌ Passwords do not match",
        
        passwordMismatchAlert: "Passwords do not match. Please check again.",
        passwordLengthAlert: "The password must be at least 8 characters long.",
        processingButton: "Processing...",
        resetSuccessAlert: "✅ Password successfully reset! You will be redirected to login.",
        resetFailureAlert: "❌ Failed to reset password. The token may have expired or be invalid.",
        resetButton: "Reset Password"
    }
};

export let currentLanguage = navigator.language.startsWith("pt") ? "pt" : "en";

export default function applyLanguage(lang) {
    currentLanguage = lang;
    const t = translations[lang];

    const pageTitleElement = document.querySelector('title');
    if (pageTitleElement && t.resetPageTitle) {
        pageTitleElement.textContent = t.resetPageTitle;
    }

    document
        .querySelectorAll("[data-translate]")
        .forEach((element) => {
            const key = element.getAttribute("data-translate");
            const type = element.getAttribute("data-translate-type");
            const translation = t[key];

            if (translation) {
                if (type === "placeholder") {
                    element.setAttribute("placeholder", translation);
                } else {
                    element.textContent = translation;
                }
            }
        });

    const footerElement = document.getElementById('footer-text-container');
    const footerLinkElement = document.getElementById('footer-link');
    if (footerElement && footerLinkElement) {
        footerElement.textContent = t.footerText + " ";
        footerLinkElement.textContent = t.footerLink;
    }

    const verificationMessage = document.getElementById('token-verification');
    if (verificationMessage && t.verifyingMessage) {
        verificationMessage.textContent = t.verifyingMessage;
    }

}