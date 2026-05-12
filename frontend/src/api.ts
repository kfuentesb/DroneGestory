// Si estamos en desarrollo (local), usa localhost:8080
// Si estamos en producción (servidor), usa la variable del .env
export const API_BASE_URL = import.meta.env.DEV 
    ? 'http://localhost:8080' 
    : (import.meta.env.VITE_API_BASE_URL || `http://${import.meta.env.VITE_SERVER_IP}:8080`);

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
    const isLoginRequest = url.includes("/api/login");
    const isAuditLogDownload = url.includes("/api/audit-log/download");

    // Errores globales de infraestructura/permisos
    if (!isLoginRequest && !isAuditLogDownload) {
        if (res.status === 403) { window.location.href = "/403"; return; }
    if (res.status === 401) { window.location.href = "/login"; return; }
        if (res.status === 404) { window.location.href = "/404"; return; }
    }

    if (!res.ok) {
        // CAPTURA EL TEXTO ANTES DE INTENTAR PARSEARLO COMO JSON
        const errorText = await res.text();
        console.error("Error del servidor (Cuerpo):", errorText);

        let message = "Error en la petición";
        try {
            const errorBody = JSON.parse(errorText);
            if (errorBody?.message) {
                message = errorBody.message;
            } else if (errorBody?.error) {
                message = errorBody.error;
            } else if (errorBody?.fields && typeof errorBody.fields === "object") {
                const fieldMessages = Object.entries(errorBody.fields)
                    .map(([field, msg]) => `${field}: ${msg}`)
                    .join("; ");
                if (fieldMessages) {
                    message = `Errores de validación: ${fieldMessages}`;
                }
            }
        } catch (e) {
            if (errorText) {
                message = errorText;
            }
        }

        const error: any = new Error(message);
        error.status = res.status;
        throw error;
    }

    return res;
}

export async function apiFetchRaw(url: string, options?: RequestInit) {
    const token = localStorage.getItem("token");
    const headers = new Headers(options?.headers || {});
    if (token) {
        headers.set("Authorization", `Bearer ${token}`);
    }

    return fetch(resolveUrl(url), { ...options, headers });
}
