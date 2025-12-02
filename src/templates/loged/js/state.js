export const state = {
    currentLanguage: navigator.language.startsWith("pt") ? "pt" : "en",
    currentUser: null,
    allTasks: [],
    currentDate: new Date()
};
