import { auth } from "$lib/stores/auth";
import { apiJson, refreshAccessToken } from "./http";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';

async function publicRequest(path, body) {
    const res = await fetch(`${API_BASE_URL}${path}`, {
        method: "POST",
        credentials: "include",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(body)
    });

    const data = await res.json().catch(() => ({}));

    if(!res.ok) {
        const error = new Error(data.message || "Request failed");
        error.code = data.error;
        error.details = data.details;
        error.status = res.status;

        throw error;
    }

    return data;
}

export function signUp(payload) {
    return publicRequest("/api/auth/signup", payload);
}

export async function signIn(email, password) {
    const data = await publicRequest("/api/auth/signin", {email, password});

    auth.setSession(data.user, data.accessToken);

    return data;
}

export async function logout() {
    try {
        await apiJson("/api/auth/logout", { method: "POST" });
    } finally {
        auth.clear();
    }
}

export function restoreSession() {
    return refreshAccessToken();
}