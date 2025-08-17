let taskDates = new Set();

const texts = {
    "pt": {
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
        priority: {
            alta: "Alta",
            media: "Média",
            baixa: "Baixa"
        },
        successAdd: "Tarefa adicionada com sucesso!",
        successDelete: "Tarefa excluída com sucesso!",
        successComplete: "Tarefa marcada como concluída!",
        errorGeneral: "Erro ao processar a solicitação. Tente novamente.",
        loading: "Carregando tarefas...",
        weekdays: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"],
        months: ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"]
    },
    "en": {
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
        priority: {
            alta: "High",
            media: "Medium",
            baixa: "Low"
        },
        successAdd: "Task added successfully!",
        successDelete: "Task deleted successfully!",
        successComplete: "Task marked as completed!",
        errorGeneral: "Error processing request. Please try again.",
        loading: "Loading tasks...",
        weekdays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    }
};

let currentLang = 'pt';
let tasks = [];
let currentDate = new Date();

let currentUser = null;

function getTaskUserId(task) {
    return task.user_id ?? task.userId ?? task.userid ?? task.user;
}
function filterTasksByUser(all) {
    if (!currentUser) return [];
    return all.filter(t => String(getTaskUserId(t)) == String(currentUser.id));
}
function getTaskDate(task) {
    const raw = task.horario_iso || task.horario || task.data || task.date;
    return raw ? new Date(raw) : null;
}

const btnPT = document.getElementById('btn-pt');
const btnEN = document.getElementById('btn-en');
const notification = document.getElementById('notification');
const loadingElement = document.getElementById('loading');
const calendarGrid = document.getElementById('calendar-grid');
const currentMonthYearEl = document.getElementById('current-month-year');
const prevMonthBtn = document.getElementById('prev-month');
const nextMonthBtn = document.getElementById('next-month');

function showNotification(message, isSuccess = true) {
    notification.textContent = message;
    notification.className = `notification ${isSuccess ? 'success' : 'error'} show`;

    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

function showError(message) {
    showNotification(message, false);
}

function applyLanguage(lang) {
    currentLang = lang;
    const t = texts[lang];

    document.title = t.title;
    document.getElementById('title-label').textContent = t.titleLabel;
    document.getElementById('description-label').textContent = t.descriptionLabel;
    document.getElementById('date-label').textContent = t.dateLabel;
    document.getElementById('priority-label').textContent = t.priorityLabel;
    document.getElementById('add-task-text').textContent = t.addTask;
    document.getElementById('tasks-title').innerHTML = `<i class="fas fa-list-check"></i> ${t.tasksTitle}`;

    btnPT.classList.toggle('active', lang === 'pt');
    btnEN.classList.toggle('active', lang === 'en');

    renderTasks(filterTasksByUser(tasks));
    renderCalendar();
    updateCalendarTasks(filterTasksByUser(tasks));

}

async function loadTasks() {
    try {
        loadingElement.style.display = 'flex';

        const auth = await fetch('/auth/status').then(r => r.json());
        currentUser = auth.user;

        const response = await fetch("/agendamentos");
        if (!response.ok) throw new Error('Erro ao carregar tarefas');

        tasks = await response.json();

        const onlyMine = filterTasksByUser(tasks);
        renderTasks(onlyMine);
        renderCalendar();
        updateCalendarTasks(onlyMine);

    } catch (error) {
        showError(texts[currentLang].errorGeneral);
        console.error('Erro ao carregar tarefas:', error);
    } finally {
        loadingElement.style.display = 'none';
    }
}


function renderTasks(tasksList = []) {
    const list = document.getElementById('lista-tarefas');
    const t = texts[currentLang];

    const totalTasks = tasksList.length;
    const completedTasks = tasksList.filter(task => task.concluded).length;
    document.getElementById('task-count').textContent = `${completedTasks}/${totalTasks}`;

    if (tasksList.length === 0) {
        list.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-clipboard-list"></i>
                    <p>${t.emptyState}</p>
                </div>`;
        return;
    }

    list.innerHTML = '';

    const buckets = { alta: [], media: [], baixa: [], done: [] };
    for (const task of tasksList) {
        if (task.concluded) buckets.done.push(task);
        else if (task.prioridade === 'alta') buckets.alta.push(task);
        else if (task.prioridade === 'media') buckets.media.push(task);
        else buckets.baixa.push(task);
    }

    const allSorted = [...buckets.alta, ...buckets.media, ...buckets.baixa, ...buckets.done];

    allSorted.forEach(task => {
        const li = document.createElement('li');
        if (task.concluded) li.classList.add('completed');

        const d = getTaskDate(task);
        const formattedDate = d
            ? d.toLocaleString(currentLang === 'pt' ? 'pt-BR' : 'en-US', {
                day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
            })
            : '-';

        li.innerHTML = `
                    <div class="task-priority priority-${task.prioridade}">${t.priority[task.prioridade]}</div>
                    <div class="task-title">${task.titulo}</div>
                    <div class="task-description">${task.descricao}</div>
                    <div class="task-date">
                    <i class="far fa-calendar-alt"></i>
                    ${formattedDate}
                    </div>
                    <div class="task-actions">
                    <button class="btn btn-complete" data-id="${task.id}">
                    <i class="fas fa-${task.concluded ? 'check-circle' : 'check'}"></i>
                    ${task.concluded ? t.completedButton : t.completeButton}
                    </button>
                    <button class="btn btn-delete" data-id="${task.id}">
                    <i class="fas fa-trash"></i>
                    ${t.deleteButton}
                    </button>
                    </div>
                `;
        list.appendChild(li);
    });

    document.querySelectorAll('.btn-delete').forEach(button => {
        button.addEventListener('click', (e) => {
            const id = e.currentTarget.dataset.id;
            deleteTask(id);
        });
    });

    document.querySelectorAll('.btn-complete').forEach(button => {
        button.addEventListener('click', (e) => {
            const id = e.currentTarget.dataset.id;
            toggleComplete(id);
        });
    });
}


function updateCalendarTasks(tasksList = []) {
    document.querySelectorAll('.day.has-task').forEach(day => day.classList.remove('has-task'));

    if (!tasksList.length) return;

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const calendarDays = document.querySelectorAll('.day.current-month');
    tasksList.forEach(task => {
        if (task.concluded) return;
        const d = getTaskDate(task);
        if (!d) return;
        if (d.getFullYear() === year && d.getMonth() === month) {
            const dayNum = d.getDate();
            calendarDays.forEach(el => {
                if (parseInt(el.textContent, 10) === dayNum) el.classList.add('has-task');
            });
        }
    });
}


function renderCalendar() {
    const t = texts[currentLang];
    const today = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
    const lastDayOfLastMonth = new Date(year, month, 0).getDate();

    currentMonthYearEl.textContent = `${t.months[month]} ${year}`;
    calendarGrid.innerHTML = '';

    t.weekdays.forEach(day => {
        const dayName = document.createElement('div');
        dayName.classList.add('day-name');
        dayName.textContent = day;
        calendarGrid.appendChild(dayName);
    });

    for (let i = 0; i < firstDayOfMonth; i++) {
        const day = document.createElement('div');
        day.classList.add('day', 'other-month');
        day.textContent = lastDayOfLastMonth - firstDayOfMonth + i + 1;
        calendarGrid.appendChild(day);
    }

    for (let i = 1; i <= lastDayOfMonth; i++) {
        const day = document.createElement('div');
        day.classList.add('day', 'current-month');
        day.textContent = i;
        day.dataset.date = `${year}-${month + 1}-${i}`; // sem padding funciona, pois parseamos depois

        if (i === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
            day.classList.add('current-day');
        }

        calendarGrid.appendChild(day);
    }

    const totalCells = 42;
    const remainingDays = totalCells - (firstDayOfMonth + lastDayOfMonth);
    for (let i = 1; i <= remainingDays; i++) {
        const day = document.createElement('div');
        day.classList.add('day', 'other-month');
        day.textContent = i;
        calendarGrid.appendChild(day);
    }

    const onlyMine = filterTasksByUser(tasks);
    document.querySelectorAll('.day').forEach(day => {
        day.addEventListener('mouseover', () => showCalendarTasks(day, onlyMine));
        day.addEventListener('mouseout', () => {
            const tooltips = day.querySelectorAll('.tasks-container-tooltip');
            tooltips.forEach(tooltip => tooltip.remove());
        });
    });
}


function goToPrevMonth() {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
}

function goToNextMonth() {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
}

async function addTask(e) {
    e.preventDefault();

    const title = document.getElementById('input-title').value;
    const description = document.getElementById('input-desc').value;
    const date = document.getElementById('input-date').value;
    const priority = document.getElementById('input-priority').value;

    if (!title || !description || !date) return;

    const newTask = {
        titulo: title,
        descricao: description,
        data: date,
        prioridade: priority
    };

    try {
        const response = await fetch("/agendar", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newTask)
        });

        if (!response.ok) {
            throw new Error('Erro ao adicionar tarefa');
        }

        const addedTask = await response.json();
        tasks.push(addedTask);
        const onlyMine = filterTasksByUser(tasks);
        renderTasks(onlyMine);
        renderCalendar();
        updateCalendarTasks(onlyMine);

        document.getElementById('form-agendamento').reset();

        showNotification(texts[currentLang].successAdd);

        const submitBtn = document.getElementById('submit-btn');
        submitBtn.innerHTML = `<i class="fas fa-check"></i> ${texts[currentLang].addTask}`;
        submitBtn.style.background = 'linear-gradient(to right, #00c853, #00e676)';

        setTimeout(() => {
            submitBtn.innerHTML = `<i class="fas fa-plus-circle"></i> ${texts[currentLang].addTask}`;
            submitBtn.style.background = 'linear-gradient(to right, #4A00E0, #8E2DE2)';
        }, 2000);

    } catch (error) {
        showError(texts[currentLang].errorGeneral);
        console.error('Erro ao adicionar tarefa:', error);
    }
}

async function deleteTask(id) {
    try {
        const response = await fetch(`/delete/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Erro ao excluir tarefa');
        }

        tasks = tasks.filter(task => task.id != id);
        const onlyMine = filterTasksByUser(tasks);
        renderTasks(onlyMine);
        updateCalendarTasks(onlyMine);

    } catch (error) {
        showError(texts[currentLang].errorGeneral);
        console.error('Erro ao excluir tarefa:', error);
    }
}

async function toggleComplete(id) {
    try {
        const response = await fetch(`/concluir/${id}`, {
            method: 'PUT'
        });

        if (!response.ok) {
            throw new Error('Erro ao atualizar tarefa');
        }

        tasks = tasks.map(task => {
            if (task.id == id) {
                return { ...task, concluded: true };
            }
            return task;
        });

        const onlyMine = filterTasksByUser(tasks);
        renderTasks(onlyMine);
        updateCalendarTasks(onlyMine);

        showNotification(texts[currentLang].successComplete);

    } catch (error) {
        showError(texts[currentLang].errorGeneral);
        console.error('Erro ao atualizar tarefa:', error);
    }
}

function showCalendarTasks(dayElement, tasksList = []) {
    const existing = dayElement.querySelectorAll('.tasks-container-tooltip');
    existing.forEach(el => el.remove());

    const dateStr = dayElement.dataset.date;
    if (!dateStr) return;

    const [year, month, day] = dateStr.split('-').map(Number);
    const target = new Date(year, month - 1, day).toISOString().split('T')[0];

    const tasksForThisDay = tasksList.filter(task => {
        const d = getTaskDate(task);
        if (!d) return false;
        return d.toISOString().split('T')[0] === target;
    });

    if (!tasksForThisDay.length) return;

    const container = document.createElement('div');
    container.classList.add('tasks-container-tooltip');

    tasksForThisDay.forEach((task, index) => {
        const info = document.createElement('div');
        info.classList.add('task-info');
        const priorityClass = `priority-${task.prioridade}`;

        info.innerHTML = `
            <strong>${task.titulo}</strong>
                <p>${task.descricao}</p>
            <span class="${priorityClass}">
                ${texts[currentLang].priority[task.prioridade]}
            </span>
        `;
        
        container.appendChild(info);
    });


    dayElement.appendChild(container);
}

document.addEventListener('DOMContentLoaded', () => {
    btnPT.addEventListener('click', () => applyLanguage('pt'));
    btnEN.addEventListener('click', () => applyLanguage('en'));
    document.getElementById('form-agendamento').addEventListener('submit', addTask);

    prevMonthBtn.addEventListener('click', goToPrevMonth);
    nextMonthBtn.addEventListener('click', goToNextMonth);

    const now = new Date();
    const minDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);

    document.getElementById('input-date').min = minDateTime;

    applyLanguage('pt');
    loadTasks();
});