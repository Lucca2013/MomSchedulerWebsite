import { state } from "./state.js";
import { translations } from "./language.js";
import * as api from "./fetch.js";
import { notify, error } from "./notifications.js";
import { updateCalendarTaskHighlights } from "./calendar.js";

export function renderTaskList() {
    const container = document.getElementById("lista-tarefas");
    const t = translations[state.currentLanguage];

    console.log("[renderTaskList] state.allTasks snapshot:", JSON.parse(JSON.stringify(state.allTasks)));

    const tasks = state.allTasks.filter(tk => tk.user_id == state.currentUser?.id);
    const total = tasks.length;
    const completed = tasks.filter(tk => tk.concluded).length;

    const countEl = document.getElementById("task-count");
    if (countEl) countEl.textContent = `${completed}/${total}`;

    if (!tasks.length) {
        container.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-clipboard-list"></i>
            <p>${t.emptyState}</p>
        </div>`;
        return;
    }

    const sorted = [
        ...tasks.filter(tk => !tk.concluded && tk.prioridade === "alta"),
        ...tasks.filter(tk => !tk.concluded && tk.prioridade === "media"),
        ...tasks.filter(tk => !tk.concluded && tk.prioridade === "baixa"),
        ...tasks.filter(tk => tk.concluded)
    ];

    let html = sorted
        .map(task => {
            const titulo = task.titulo ?? task.title ?? "";
            const descricao = task.descricao ?? task.description ?? "";
            const horario = task.horario ?? task.date ?? null;
            const prioridade = task.prioridade ?? task.priority ?? "baixa";
            const concluded = !!task.concluded;

            return `
            <li class="${concluded ? "completed" : ""}" data-task-id="${task.id}">
                <div class="task-priority priority-${prioridade}">
                    ${t.priority[prioridade]}
                </div>

                <div class="task-title">${titulo}</div>
                <div class="task-description">${descricao}</div>

                <div class="task-date">
                    <i class="far fa-calendar-alt"></i>
                    ${horario ? new Date(horario).toLocaleString() : ""}
                </div>

                <div class="task-actions">
                    <button class="btn btn-complete" data-id="${task.id}">
                        <i class="fas fa-${concluded ? "check-circle" : "check"}"></i>
                        ${concluded ? t.completedButton : t.completeButton}
                    </button>

                    <button class="btn btn-delete" data-id="${task.id}">
                        <i class="fas fa-trash"></i> ${t.deleteButton}
                    </button>
                </div>
            </li>
            `;
        })
        .join("");

    container.innerHTML = html;

    if (!container._hasDelegate) {
        container.addEventListener("click", (ev) => {
            const deleteBtn = ev.target.closest?.(".btn-delete");
            if (deleteBtn) {
                const id = Number(deleteBtn.dataset.id);
                console.log("[click] delete clicked id:", id);
                handleDelete(id);
                return;
            }

            const completeBtn = ev.target.closest?.(".btn-complete");
            if (completeBtn) {
                const id = Number(completeBtn.dataset.id);
                console.log("[click] complete clicked id:", id);
                handleComplete(id);
                return;
            }
        });

        container._hasDelegate = true;
    }
}


export async function handleAdd(e) {
    e.preventDefault();

    const title = document.getElementById("input-title").value;
    const description = document.getElementById("input-desc").value;
    const date = document.getElementById("input-date").value;
    const priority = document.getElementById("input-priority").value;

    if (!title || !description || !date) return;

    try {
        const task = await api.createTask({
            title: title,
            description: description,
            date: date,
            priority: priority
        });

        state.allTasks.push(task);
        renderTaskList();
        updateCalendarTaskHighlights();

        document.getElementById("form-agendamento").reset();
        notify(translations[state.currentLanguage].successAdd);
    } catch {
        error();
    }
}

async function handleDelete(id) {
    try {
        api.deleteTask(id);
        state.allTasks = state.allTasks.filter(t => t.id != id);
        renderTaskList();
        updateCalendarTaskHighlights();
        notify(translations[state.currentLanguage].successDelete);
    } catch {
        error();
    }
}

async function handleComplete(id) {
    try {
        api.completeTask(id);
        state.allTasks = state.allTasks.map(t =>
            t.id == id ? { ...t, concluded: true } : t
        );
        renderTaskList();
        updateCalendarTaskHighlights();
        notify(translations[state.currentLanguage].successComplete);
    } catch {
        error();
    }
}
