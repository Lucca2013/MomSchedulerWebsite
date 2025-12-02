const translations = {
    pt: {
        pageTitle: "MomScheduler",
        headerTitle: "MomScheduler",
        headerSubtitle: "Acesse sua conta para gerenciar suas tarefas",

        emailLabel: "E-mail",
        passwordLabel: "Senha",
        nameLabel: "Nome Completo",
        confirmPasswordLabel: "Confirme a Senha",
        loginButton: "Entrar",
        registerButton: "Criar Conta",

        emailPlaceholder: "seuemail@exemplo.com",
        loginPasswordPlaceholder: "Sua senha",
        createPasswordPlaceholder: "Crie uma senha forte",
        confirmPasswordPlaceholder: "Repita sua senha",
        namePlaceholder: "Seu nome completo",

        noAccountText: "Não tem uma conta?",
        registerLink: "Crie agora",
        forgotPasswordText: "Esqueceu a senha?",
        recoverPasswordLink: "Recupere agora",

        registerEmailLabel: "Email",
        registerEmailLabelInput: "seuemail@email.com",
        registerNameLabel: "Nome",
        registerNameLabelInput: "Registre o seu nome",
        registerPasswordLabel: "Senha",
        registerPasswordLabelInput: "Crie uma senha forte",
        registerConfirmPasswordLabel: "Confirme a Senha",
        registerConfirmPasswordLabelInput: "Repita sua senha",

        ConfirmRegister: "Criar Conta",
        alreadyAccountText: "Já tem uma conta?",
    },
    en: {
        pageTitle: "MomScheduler",
        headerTitle: "MomScheduler",
        headerSubtitle: "Access your account to manage your tasks",

        emailLabel: "Email",
        passwordLabel: "Password",
        nameLabel: "Full Name",
        confirmPasswordLabel: "Confirm Password",
        loginButton: "Login",
        registerButton: "Create Account",

        emailPlaceholder: "youremail@example.com",
        loginPasswordPlaceholder: "Your password",
        createPasswordPlaceholder: "Create a strong password",
        confirmPasswordPlaceholder: "Repeat your password",
        namePlaceholder: "Your full name",

        noAccountText: "Don't have an account?",
        registerLink: "Create now",
        hasAccountText: "Already have an account?",
        loginLink: "Log in",
        forgotPasswordText: "Forgot your password?",
        recoverPasswordLink: "Recover now",

        registerEmailLabel: "Email",
        registerEmailLabelInput: "youremail@email.com",
        registerNameLabel: "Name",
        registerNameLabelInput: "Your Name",
        registerPasswordLabel: "Password",
        registerPasswordLabelInput: "Create a strong password",
        registerConfirmPasswordLabel: "Confirm the passsword",
        registerConfirmPasswordLabelInput: "Repeat your password",

        alreadyAccountText: "Already have an account?",
        ConfirmRegister: "Create Account",
    }
};

let currentLanguage = navigator.language.startsWith("pt") ? "pt" : "en";

function applyLanguage(lang) {
    currentLanguage = lang;
    const t = translations[lang];

    const pageTitleElement = document.querySelector('title');
    if (pageTitleElement) {
        pageTitleElement.textContent = t.pageTitle;
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
document.addEventListener("DOMContentLoaded", applyLanguage(currentLanguage));