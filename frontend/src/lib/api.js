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

export function mediaUrl(key) {
	// /api/media/*key
	if(!key) return "";
	if(key.startsWith("/api/media/")) return key.split("/").map(encodeURIComponent).join("/");

	return `/api/media/${key.split("/").map(encodeURIComponent).join("/")}`;

}


// https://domain.com/api/media/image.png
// s3://domina.org/bucket/folder/image.png


export const statusLabels = {
	available: "Свободен",
	rented: "Арендованный", 
	lost: "Потерянный", 
	maintenance: "В монте",
}

export function formatMoney(value) {
	return new Intl.NumberFormat("ru-RU").format(value || 0);
}

