<script>
	import { goto } from '$app/navigation';
	import { auth } from '$lib/stores/auth';
	import { apiJson } from '$lib/api/http';

	const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';

	let cards = [];
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
			// const res = await apiJson('/api/media/files');
			cards = await apiJson('/api/pmv');
			console.log(cards);
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
		return `${API_BASE_URL}${key}`;
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
	{:else if cards.length === 0}
		<p class="text-gray-500">No cards</p>
	{:else}
		<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
			{#each cards as card (card._id)}
				<a
					href={`/files/${photoIdFromKey(card.coverKey)}`}
					class="group block rounded-xl border border-gray-200 bg-gray-100 p-4"
				>
					<div class="flex flex-col gap-2 items-center justify-center">
						<img
							src={photoUrl(card.coverKey)}
							alt={card._id}
							loading="lazy"
							class="w-full h-full object-cover group-hover:scale-105 duration-200 transition-transform aspect-square"
						/>
						<p>{card.name}</p>
					</div>
				</a>
			{/each}
		</div>
	{/if}
</div>
