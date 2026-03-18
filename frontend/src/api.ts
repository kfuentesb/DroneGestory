export async function apiFetch(url: string, options?: RequestInit) {
    const token = localStorage.getItem("token");
    const headers = new Headers(options?.headers || {});
    if (token) {
        headers.set("Authorization", `Bearer ${token}`);
    }

    const res = await fetch(url, { ...options, headers })

    if (res.status === 403) {
        window.location.href = "/403";
        return;
    }

    if (res.status === 401) {
        window.location.href = "/auth/login";
        return;
    }

    if (res.status === 404) {
        window.location.href = "/404";
        return;
    }

    if (!res.ok) {
        console.error(`HTTP Error ${res.status}: ${res.statusText}`);
        throw new Error("API error");
    }

    return res;
}
