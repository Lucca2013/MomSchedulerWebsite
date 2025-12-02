const translations = {
    pt: {
        pageTitle: "MomScheduler",
        headerTitle: "MomScheduler",
        headerSubtitle: "Acesse sua conta para gerenciar suas tarefas",
        
        recoveryPageTitle: "Recuperação de Senha - Sistema de Tarefas",
        recoverHeaderTitle: "Recuperar Senha",
        recoverHeaderSubtitle: "Redefina sua senha em poucos passos",
        
        emailLabel: "E-mail cadastrado",
        emailPlaceholder: "seuemail@exemplo.com",
        
        sendRecoveryLinkButton: "Enviar Link de Recuperação",
        
        instructionsTitle: "Instruções",
        instruction1: "Informe o e-mail associado à sua conta",
        instruction2: "Enviaremos um link para redefinir sua senha",
        instruction3: "Verifique sua caixa de entrada e spam",
        instruction4: "O link expira em 1 hora por segurança",
        
        backToLoginText: "Voltar para o login",

        successNotification: "Link de recuperação enviado! Verifique seu e-mail.",
        errorNotification: "Erro ao enviar o link. Tente novamente.",
    },
    en: {
        pageTitle: "MomScheduler",
        headerTitle: "MomScheduler",
        headerSubtitle: "Access your account to manage your tasks",

        recoveryPageTitle: "Password Recovery - Task System",
        recoverHeaderTitle: "Recover Password",
        recoverHeaderSubtitle: "Reset your password in a few steps",

        emailLabel: "Registered E-mail",
        emailPlaceholder: "youremail@example.com",
        
        sendRecoveryLinkButton: "Send Recovery Link",
        
        instructionsTitle: "Instructions",
        instruction1: "Enter the email associated with your account",
        instruction2: "We will send a link to reset your password",
        instruction3: "Check your inbox and spam folder",
        instruction4: "The link expires in 1 hour for security",

        backToLoginText: "Back to login",

        successNotification: "Recovery link sent! Check your email.",
        errorNotification: "Error sending link. Please try again.",
    }
};

export let currentLanguage = navigator.language.startsWith("pt") ? "pt" : "en";

function applyLanguage(lang) {
    currentLanguage = lang;
    const t = translations[lang];

    const pageTitleElement = document.querySelector('title');
    if (pageTitleElement && t.recoveryPageTitle) {
        pageTitleElement.textContent = t.recoveryPageTitle;
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
}

document.addEventListener("DOMContentLoaded", () => {
    applyLanguage(currentLanguage);
});