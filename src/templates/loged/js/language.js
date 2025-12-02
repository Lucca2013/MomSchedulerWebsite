import { state } from "./state.js";
import { renderTaskList } from "./tasks.js";
import { renderCalendar, updateCalendarTaskHighlights } from "./calendar.js";

export const translations = {
    pt: {
        title: "Sistema de Tarefas",
        titleLabel: "Título",
        descriptionLabel: "Descrição",
        dateLabel: "Data",
        priorityLabel: "Prioridade",
        addTask: "Adicionar Tarefa",
        tasksTitle: "Tarefas Agendadas",
        deleteButton: "Excluir",
        completeButton: "Concluir",
        completedButton: "Concluído",
        emptyState: "Nenhuma tarefa agendada. Adicione uma nova tarefa acima!",
        priority: { alta: "Alta", media: "Média", baixa: "Baixa" },
        successAdd: "Tarefa adicionada com sucesso!",
        successDelete: "Tarefa excluída com sucesso!",
        successComplete: "Tarefa marcada como concluída!",
        errorGeneral: "Erro ao processar a solicitação. Tente novamente.",
        loading: "Carregando tarefas...",
        weekdays: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"],
        months: ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"],
        logout: "Sair",
        headerDesc: "Organize suas tarefas com título, descrição e data de conclusão",
        taskCountSuffix: "tarefas",
        placeholderTitle: "Nome da tarefa",
        placeholderDesc: "Detalhes da tarefa",
        modalTitle: "Confirmação de Saída",
        modalMessage: "Tem certeza de que deseja sair da sua conta?",
        modalCancel: "Cancelar",
        modalConfirm: "Confirmar",
        priorityOptions: { alta: "Alta", media: "Média", baixa: "Baixa" },
    },
    en: {
        title: "Task System",
        titleLabel: "Title",
        descriptionLabel: "Description",
        dateLabel: "Date",
        priorityLabel: "Priority",
        addTask: "Add Task",
        tasksTitle: "Scheduled Tasks",
        deleteButton: "Delete",
        completeButton: "Complete",
        completedButton: "Completed",
        emptyState: "No tasks scheduled. Add a new task above!",
        priority: { alta: "High", media: "Medium", baixa: "Low" },
        successAdd: "Task added successfully!",
        successDelete: "Task deleted successfully!",
        successComplete: "Task marked as completed!",
        errorGeneral: "Error processing request. Please try again.",
        loading: "Loading tasks...",
        weekdays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
        logout: "Logout",
        headerDesc: "Organize your tasks with title, description, and completion date",
        taskCountSuffix: "tasks",
        placeholderTitle: "Task Name",
        placeholderDesc: "Task Details",
        modalTitle: "Logout Confirmation",
        modalMessage: "Are you sure you want to log out of your account?",
        modalCancel: "Cancel",
        modalConfirm: "Confirm",
        priorityOptions: { alta: "High", media: "Medium", baixa: "Low" }
    }
};

export function applyLanguage(lang) {
    state.currentLanguage = lang;

    const t = translations[lang];
    document.title = t.title;

    // Tradução dos campos do formulário (EXISTENTE)
    document.getElementById("title-label").textContent = t.titleLabel;
    document.getElementById("description-label").textContent = t.descriptionLabel;
    document.getElementById("date-label").textContent = t.dateLabel;
    document.getElementById("priority-label").textContent = t.priorityLabel;
    
    // Tradução dos Placeholders (NOVO)
    document.getElementById("input-title").placeholder = t.placeholderTitle;
    document.getElementById("input-desc").placeholder = t.placeholderDesc;

    // Tradução do botão de logout e descrição do header (NOVO)
    document.querySelector(".logout-btn span").textContent = t.logout;
    document.querySelector("header p").textContent = t.headerDesc;
    
    // Tradução do botão de submit (EXISTENTE)
    document.getElementById("add-task-text").textContent = t.addTask;
    
    // Tradução do título da lista de tarefas (EXISTENTE)
    document.getElementById("tasks-title").innerHTML = `<i class="fas fa-list-check"></i> ${t.tasksTitle}`;

    // Tradução do sufixo do contador (Você precisaria de um elemento wrapper aqui, ex: id="task-count-suffix")
    // Se a estrutura for "<span>0</span> tarefas", você precisa atualizar o texto "tarefas" fora do span.
    // Para simplificar, vou assumir que você adicionou um span de ID "task-count-suffix" após o span do contador.
    // Se não for o caso, esta parte pode ser mais complicada sem mudar o HTML.
    // Exemplo **SE** você adicionar `<span id="task-count-suffix">tarefas</span>`
    // document.getElementById("task-count-suffix").textContent = t.taskCountSuffix;
    
    // Tradução das opções do SELECT de Prioridade (NOVO)
    const prioritySelect = document.getElementById("input-priority");
    [...prioritySelect.options].forEach(option => {
        option.textContent = t.priorityOptions[option.value];
    });

    // Tradução do Modal de Logout (NOVO - você precisaria adicionar os IDs no HTML)
    // Exemplo, se você adicionar IDs:
    // document.getElementById("modal-title").textContent = t.modalTitle;
    // document.getElementById("modal-message").textContent = t.modalMessage;
    // document.getElementById("modal-cancel-btn").textContent = t.modalCancel;
    // document.getElementById("modal-confirm-btn").textContent = t.modalConfirm;


    // ... (chamadas existentes)
    renderTaskList();
    renderCalendar();
    updateCalendarTaskHighlights();
}
