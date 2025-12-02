import { state } from "./state.js";
import { translations } from "./language.js";

const grid = document.getElementById("calendar-grid");
const label = document.getElementById("current-month-year");

export function renderCalendar() {
    const calendarGrid = document.getElementById('calendar-grid');

    const t = translations[state.currentLanguage];

    const date = state.currentDate;
    const year = date.getFullYear();
    const month = date.getMonth();
    const today = new Date();

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    label.textContent = `${t.months[month]} ${year}`;

    calendarGrid.innerHTML = "";

    t.weekdays.forEach(w => {
        const el = document.createElement("div");
        el.classList.add("day-name");
        el.textContent = w;
        calendarGrid.appendChild(el);
    });

    for (let i = 0; i < firstDay; i++) {
        const day = document.createElement("div");
        day.classList.add("day", "other-month");
        day.textContent = daysInPrevMonth - firstDay + i + 1;
        calendarGrid.appendChild(day);
    }

    for (let i = 1; i <= daysInMonth; i++) {
        const day = document.createElement("div");
        day.classList.add("day", "current-month");
        day.textContent = i;
        day.dataset.date = `${year}-${month + 1}-${i}`;

        if (
            i === today.getDate() &&
            month === today.getMonth() &&
            year === today.getFullYear()
        ) {
            day.classList.add("current-day");
        }

        calendarGrid.appendChild(day);
    }

    const cells = 42;
    const used = firstDay + daysInMonth;
    for (let i = 1; i <= cells - used; i++) {
        const day = document.createElement("div");
        day.classList.add("day", "other-month");
        day.textContent = i;
        calendarGrid.appendChild(day);
    }

    const userTasks = filterTasksByUser(state.allTasks);

    document.querySelectorAll(".day").forEach(day => {
        day.addEventListener("mouseover", () =>
            showCalendarTasks(day, userTasks)
        );
        day.addEventListener("mouseout", () =>
            [...day.querySelectorAll(".tasks-container-tooltip")].forEach(el =>
                el.remove()
            )
        );
    });
}

export function updateCalendarTaskHighlights() {
    const tasks = state.allTasks.filter(
        t => t.user_id == state.currentUser?.id && !t.concluded
    );

    document.querySelectorAll(".day.has-task").forEach(d =>
        d.classList.remove("has-task")
    );

    const year = state.currentDate.getFullYear();
    const month = state.currentDate.getMonth();

    const days = document.querySelectorAll(".day.current-month");

    tasks.forEach(task => {
        if (task.concluded) return;

        const d = getTaskDate(task);
        if (!d) return;

        if (d.getFullYear() === year && d.getMonth() === month) {
            const dayNum = d.getDate();
            [...days].forEach(el => {
                if (parseInt(el.textContent) === dayNum) {
                    el.classList.add("has-task");
                }
            });
        }
    });
}

export function showCalendarTasks(dayElement, tasks) {
    [...dayElement.querySelectorAll(".tasks-container-tooltip")].forEach(el =>
        el.remove()
    );

    const dateStr = dayElement.dataset.date;
    if (!dateStr) return;

    const [year, month, day] = dateStr.split("-").map(Number);
    const isoDate = new Date(year, month - 1, day)
        .toISOString()
        .split("T")[0];

    const tasksForDay = tasks.filter(task => {
        const d = getTaskDate(task);
        return d && d.toISOString().split("T")[0] === isoDate;
    });

    if (!tasksForDay.length) return;

    const tooltip = document.createElement("div");
    tooltip.classList.add("tasks-container-tooltip");

    tasksForDay.forEach(task => {
        const info = document.createElement("div");
        info.classList.add("task-info");
        info.innerHTML = `
            <strong>${task.title}</strong>
            <p>${task.desc}</p>
            <span class="priority-${task.priority}">
                ${translations[currentLanguage].priority[task.priority]}
            </span>
        `;
        tooltip.appendChild(info);
    });

    dayElement.appendChild(tooltip);
}

function filterTasksByUser(all) {
    if (!state.currentUser) return [];
    return all.filter(t => String(getTaskUserId(t)) == String(state.currentUser.id));
}

function getTaskUserId(task) {
    return task.user_id;
}

function getTaskDate(task) {
    return task.date ? new Date(task.date) : null;
}

export function previousMonth() {
    state.currentDate.setMonth(state.currentDate.getMonth() - 1);
    renderCalendar();
}

export function nextMonth() {
    state.currentDate.setMonth(state.currentDate.getMonth() + 1);
    renderCalendar();
}
