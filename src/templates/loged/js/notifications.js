import { state } from "./state.js";
import { translations } from "./language.js";

const notification = document.getElementById("notification");

export function notify(msg, success = true) {
    notification.textContent = msg;
    notification.className = `notification ${success ? "success" : "error"} show`;
    setTimeout(() => notification.classList.remove("show"), 3000);
}

export function error(msg = translations[state.currentLanguage].errorGeneral) {
    notify(msg, false);
}
