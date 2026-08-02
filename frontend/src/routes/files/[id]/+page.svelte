<script>
	import { goto } from '$app/navigation';
	import { auth } from '$lib/stores/auth';
	import { page } from '$app/stores';
	import { apiJson } from '$lib/api/http';

	const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';

	let file = null;
	let isLoading = true;
	let errorMessage = '';
	let loadedId = null;

	$: if (!$auth.isInitializing && $page.params.id !== loadedId) {
		loadedId = $page.params.id;
		loadFile(loadedId);
	}

	async function loadFile(id) {
		isLoading = false;
		errorMessage = '';
		file = null;

		if (!$auth.isAuthenticated) {
			goto('/signin');
			return;
		}

		try {
			file = await apiJson(`/api/media/files/${id}`);
		} catch (e) {
			errorMessage =
				e.status === 404 ? 'Фото не найдено' : e.message || 'Не удалось загрузить фото';
		} finally {
			isLoading = false;
		}
	}
</script>

<svelte:head>
	<title>Фото</title>
</svelte:head>

<div class="max-w-2xl mx-auto mt-12 px-6 pb-12">
	{#if isLoading}
		<div class="text-center text-gray-500">Загрузка...</div>
	{:else if errorMessage}
		<div class="text-center text-red-500">{errorMessage}</div>
	{:else if file}
		<img
			src={`${API_BASE_URL}/api/media/${file.key}`}
			alt={file.key}
			class="w-full rounded-xl border border-gray-200"
		/>

		<dl class="mt-4 text-sm text-gray-500 space-y-1">
			<div>
				<dt class="inline font-medium text-gray-700">Размер:</dt>
				<dd class="inline">{(file.size / 1024).toFixed(1)} КБ</dd>
			</div>

            <div>
				<dt class="inline font-medium text-gray-700">Изменено:</dt>
				<dd class="inline">{new Date(file.lastModified).toLocaleString()}</dd>
			</div>


            <div>
				<dt class="inline font-medium text-gray-700">Ключ:</dt>
				<dd class="inline">{file.key}</dd>
			</div>
		</dl>
	{/if}
</div>
