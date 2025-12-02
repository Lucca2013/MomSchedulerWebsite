import { applyLanguage } from "./language.js";
import { state } from "./state.js";
import * as api from "./fetch.js";
import { renderTaskList } from "./tasks.js";
import { renderCalendar, updateCalendarTaskHighlights, previousMonth, nextMonth } from "./calendar.js";
import { handleAdd } from "./tasks.js";
document.addEventListener("DOMContentLoaded", async () => {

    document.getElementById("prev-month").onclick = previousMonth;
    document.getElementById("next-month").onclick = nextMonth;

    document.getElementById("form-agendamento").onsubmit = handleAdd;

    document.getElementById("logout-btn").onclick = api.logout;
    
    try {
        const auth = await api.getAuth();
        state.currentUser = auth.user;

        state.allTasks = await api.getTasks();

        applyLanguage(state.currentLanguage);

        renderTaskList();
        renderCalendar();
        updateCalendarTaskHighlights();

    } catch (err) {
        console.error("Erro ao iniciar sistema:", err);
    }
});
