import { get } from 'svelte/store';
import { auth } from '$lib/stores/auth';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';

let refreshPromise = null;

export function refreshAccessToken() {
	if (!refreshPromise) {
		refreshPromise = fetch(`${API_BASE_URL}/api/auth/refresh`, {
			method: 'POST',
			credentials: 'include'
		})
			.then(async (res) => {
				if (!res.ok) {
					auth.clear();
					return null;
				}

				const data = await res.json();
				auth.setAccessToken(data.accessToken);

				return data.accessToken;
			})
			.catch(() => {
				auth.clear();
				return null;
			})
			.finally(() => {
				refreshPromise = null;
			});
	}

	return refreshPromise;
}

export async function apiFetch(path, options = {}) {
	const { accessToken } = get(auth);   // ????????????????

	const doFetch = (token) =>
		fetch(`${API_BASE_URL}${path}`, {
			...options,
			credentials: 'include',
			headers: {
				...(options.body ? { 'Content-Type': 'application/json' } : {}),
				...(token ? { Authorization: `Bearer ${token}` } : {}),
				...options.headers
			}
		});

    let res = await doFetch(accessToken);

    if(res.status === 401) {
        const newToken = await refreshAccessToken();

        if(newToken) {
            res = await doFetch(newToken);
        }
    }

    return res;
}

// Хелпер поверх apiFetch, парсит JSON и бросает error с деталями бэкенда при неуспехе наверх 
export async function apiJson(path, options = {}) {
    const res = await apiFetch(path, options);
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