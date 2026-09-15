<script>
	import { goto } from '$app/navigation';
	import { auth } from '$lib/stores/auth';
	import { apiJson } from '$lib/api/http';

	const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';

	let files = [];
	let isLoading = true;
	let errorMessage = '';
	let hasLoaded = false; // ожидание пользователя

	$: if (!$auth.isInitializing && !hasLoaded) {
		hasLoaded = true;
		loadFiles();
	}

	async function loadFiles() {
		if (!$auth.isAuthenticated) {
			goto('/signin');
			return;
		}

		try {
			// files = await apiJson('/api/media/files');
			const res = await apiJson('/api/media/files');
			files = res.files;
		} catch (e) {
			console.log(e);
			errorMessage = e.message || 'Не удалось загрузить фото';
		} finally {
			isLoading = false;
		}
	}

	// /folder/id.ext
	function photoIdFromKey(key) {
		const filename = key.split('/').pop();
		return filename.replace(/\.[^/.]+$/, '');
	}

	function photoUrl(key) {
		return `${API_BASE_URL}/api/media/${key}`;
	}
</script>

<svelte:head>
	<title>Файлы</title>
</svelte:head>

<div class="max-w-5xl mx-auto mt-12 px-6 pb-12">
	<h1 class="text-xl font-semibold text-gray-900 mb-6">Файлы</h1>

	{#if isLoading}
		<p class="text-gray-500">Загрузка...</p>
	{:else if errorMessage}
		<p class="text-red-500 text-sm">{errorMessage}</p>
	{:else if files.length === 0}
		<p class="text-gray-500">Файлов нет.</p>
	{:else}
		<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
			{#each files as file (file.key)}
				<a
					href={`/files/${photoIdFromKey(file.key)}`}
					class="group block aspect-square overflow-hidden rounded-xl border border-gray-200 bg-gray-100"
				>
					<img
						src={photoUrl(file.key)}
						alt={file.key}
						loading="lazy"
						class="w-full h-full object-cover group-hover:scale-105 duration-200 transition-transform"
					/>
				</a>
			{/each}
		</div>
	{/if}
</div>
