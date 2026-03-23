export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || `http://${import.meta.env.VITE_SERVER_IP}:8080`;

function resolveUrl(path: string) {
    if (path.startsWith("http://") || path.startsWith("https://")) {
        return path;
    }
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    return `${API_BASE_URL}${normalizedPath}`;
}

export async function apiFetch(url: string, options?: RequestInit) {
    const token = localStorage.getItem("token");
    const headers = new Headers(options?.headers || {});
    if (token) {
        headers.set("Authorization", `Bearer ${token}`);
    }

    const res = await fetch(resolveUrl(url), { ...options, headers });

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
