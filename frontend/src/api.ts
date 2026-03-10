export async function apiFetch(url: string, options?: RequestInit) {
    const res = await fetch(url, options)

    if (res.status === 403) {
        window.location.href = "/403";
        return;
    }

    if (res.status === 404) {
        window.location.href = "/404";
        return;
    }

    if (!res.ok) {
        throw new Error("API error");
    }

    return res;
}