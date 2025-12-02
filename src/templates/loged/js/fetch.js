export async function getAuth() {
    return fetch("/api/auth/status").then(r => r.json());
}

export async function getTasks() {
    const r = await fetch("/api/appointments", { credentials: "include" });
    if (!r.ok) throw new Error(r);
    return r.json();
}

export async function createTask(data) {
    return fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    }).then(r => r.json());
}

export async function deleteTask(id) {
    await fetch(`/api/appointments/${id}`, { method: "DELETE" });
    return;
}

export async function completeTask(id) {
    await fetch(`/api/appointments/${id}`, { method: "PUT" });
    return;
}

export async function logout() {
    fetch("/api/logout", { method: "POST", credentials: "include"})
    setTimeout(() => {
        location.reload();
    }, 2000);
}