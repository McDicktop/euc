export async function api(path, options = {}) {
	const res = await fetch(path, options);
	if (res.status === 204) return null;

	const data = await res.json().catch(() => {});
	if (!res.ok) {
		const details = data.details?.map((item) => item.message).join('; ');
		throw new Error(details || data.error || data.message || `Ошибка запроса: ${res.status}`);
	}

	return data;
}

