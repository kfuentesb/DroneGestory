export async function apiFetch(url: string, options?: RequestInit) {
    const token = localStorage.getItem("token");
    const headers = new Headers(options?.headers || {});
    if (token) {
        headers.set("Authorization", `Bearer ${token}`);
    }

    const res = await fetch(url, { ...options, headers });

    // Errores globales de infraestructura/permisos
    if (res.status === 403) { window.location.href = "/403"; return; }
    if (res.status === 401) { window.location.href = "/auth/login"; return; }
    if (res.status === 404) { window.location.href = "/404"; return; }

    if (!res.ok) {
        const errorBody = await res.json().catch(() => ({})); 
        
        const error: any = new Error(errorBody.message || "Error en la petición");
        error.status = res.status;
        error.data = errorBody;
        
        throw error;
    }

    return res;
}