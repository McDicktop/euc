<script>
	import { auth } from '$lib/stores/auth';
	import { logout, restoreSession } from '$lib/auth/auth';

	import { onMount } from 'svelte';
	import { SvelteURLSearchParams } from 'svelte/reactivity';
	import { goto } from '$app/navigation';

	import { page } from '$app/stores';

	import { api } from '$lib/api';
	import ListingCard from '$lib/components/ListingCard.svelte';
	import ListingForm from '$lib/components/ListingForm.svelte';

	let categories = [];
	let listings = [];
	let pagination = { page: 1, pages: 1, total: 0 };

	let selectedCategory = '';
	let showCreate = false;
	let loading = true;
	let error = '';
	let notice = '';

	let filters = [];
	let filterQueryObj = {};

	async function load(pageArg = 1) {
		loading = true;
		error = '';

		const searchParams = $page.url.searchParams;

		let urlParamsObject = {};
		try {
			urlParamsObject = Object.fromEntries(searchParams);
		} catch (parseError) {
			console.warn('Не удалось распарсить параметры URL:', parseError);
		}
		// console.log(urlParamsObject);

		// НУЖНО ПРОВЕРИТЬ urlParamsObject

		urlParamsObject.page = String(pageArg);
		urlParamsObject.limit = '14';
		urlParamsObject.isActive = true;

		if (selectedCategory) {
			urlParamsObject.category = selectedCategory;
			const catByslug = await api(`http://localhost:3000/api/categories/slug/${selectedCategory}`);

			filters = catByslug?.attributes
				.map((attr) => {
					if (!attr.attribute.filterable) return false;

					// Определяем эталонные значения из базы
					const dbMin = attr.attribute.min || attr.min;
					const dbMax = attr.attribute.max || attr.max;

					return {
						label: attr.attribute.label,
						key: attr.attribute.key,
						// Текущие значения в инпутах (изначально равны базовым)
						min: dbMin,
						max: dbMax,
						// Жёсткие границы из базы для валидации
						baseMin: dbMin,
						baseMax: dbMax
					};
				})
				.filter(Boolean);

			console.log(filters);
		}

		try {
			// const query = new SvelteURLSearchParams({
			// 	page: String(pageArg),
			// 	limit: '14',
			// 	isActive: 'true'
			// });

			const query = new SvelteURLSearchParams(urlParamsObject);

			// if (selectedCategory) query.set('category', selectedCategory);

			const data = await api(`http://localhost:3000/api/pmvs?${query}`);
			listings = data.items;
			pagination = data.pagination;
		} catch (err) {
			error = err.message;
		} finally {
			loading = false;
		}
	}

	async function created() {
		showCreate = false;
		notice = 'Объявление опубликовано';
		await load(1);
		setTimeout(() => {
			notice = '';
		}, 3000);
	}

	const updateFilterQuery = (filter) => {
		
		if (filter.min < filter.baseMin) {
			filter.min = filter.baseMin;
		} else if (filter.min > filter.baseMax) {
			filter.min = filter.baseMax;
		}

	
		if (filter.max > filter.baseMax) {
			filter.max = filter.baseMax;
		} else if (filter.max < filter.baseMin) {
			filter.max = filter.baseMin;
		}

	
		if (filter.min > filter.max) {			
			filter.min = filter.baseMin;
			filter.max = filter.baseMax;
		}

		// Триггерим реактивность в Svelte, чтобы инпуты визуально обновились при сбросе
		filters = filters;

	
		filterQueryObj[filter.key] = { min: filter.min, max: filter.max };
	};

	onMount(async () => {
		try {
			categories = await api('http://localhost:3000/api/categories');

			restoreSession();
			console.log('USER', $auth.user);
		} catch (e) {
			error = e.message;
		}

		await load();
	});
</script>

<header
	class="relative z-10 flex h-20 items-center justify-between border-b border-gray-200 text-sm"
>
	<a class="text-lg font-semibold" href="/">
		<span>Native Wheels</span>
	</a>

	<nav class="flex items-center gap-8 text-sm font-medium">
		<a href="#catalog">Каталог</a>
		<a href="/admin">Админ</a>

		<button
			class=""
			on:click={() => {
				showCreate = true;
			}}>Разместить объявление</button
		>
	</nav>
</header>

<main>
	{#if showCreate}
		<div class="mx-auto">
			<ListingForm
				{categories}
				onCreate={created}
				onCancel={() => {
					showCreate = false;
				}}
			/>
		</div>
	{/if}

	<section>
		<div class="flex items-center gap-2 text-black">
			<span class="text-lg font-bold">{pagination.total}</span>
			<span class="text-base">объявлений в каталоге</span>
		</div>
	</section>

	<section class="mx-auto max-w-[1440px] px-[5vw] pt-24 pb-28">
		<section class="flex flex-wrap gap-6">
			{#each filters as filter (filter.label)}
				<div class="flex flex-col gap-2 items-center px-2 py-1 border border-gray-300 rounded-xl">
					<span class="text-sm font-semibold text-gray-700">
						{filter.label}
					</span>

					<div class="flex items-center gap-2">
						<label class="flex items-center gap-1.5 text-xs text-gray-500">
							<span>min</span>
							<input
								type="number"
								bind:value={filter.min}
								min={filter.baseMin}
								max={filter.baseMax}
								placeholder="Мин"
								class="w-20 rounded-lg border border-gray-300 px-1 py-1 text-sm text-gray-900 outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
								on:change={() => updateFilterQuery(filter)}
							/>
						</label>

						<label class="flex items-center gap-1.5 text-xs text-gray-500">
							<span>max</span>
							<input
								type="number"
								bind:value={filter.max}
								min={filter.baseMin}
								max={filter.baseMax}
								placeholder="Макс"
								class="w-20 rounded-lg border border-gray-300 px-1 py-1 text-sm text-gray-900 outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
								on:change={() => updateFilterQuery(filter)}
							/>
						</label>
					</div>
				</div>
			{/each}
		</section>

		<div class="mb-11 flex items-center justify-between gap-8">
			<div class="">
				<h2 class="text-base font-bold text-gray-800">Каталог</h2>
			</div>

			<div class="flex flex-wrap justify-end gap-2">
				<button
					class="rounded-full px-4 py-2 transition"
					class:border-gray-800={!selectedCategory}
					class:bg-gray-800={!selectedCategory}
					class:text-white={!selectedCategory}
					class:border-gray-300={selectedCategory}
					class:bg-gray-50={selectedCategory}
					class:text-gray-800={selectedCategory}
					on:click={() => {
						selectedCategory = '';
						load(1);
					}}
				>
					Все
				</button>

				{#each categories.filter((item) => item.isActive) as item (item.slug)}
					<button
						class="rounded-full px-4 py-2 transition"
						class:border-gray-800={selectedCategory === item.slug}
						class:bg-gray-800={selectedCategory === item.slug}
						class:text-white={selectedCategory === item.slug}
						class:border-gray-300={selectedCategory !== item.slug}
						class:bg-gray-50={selectedCategory !== item.slug}
						class:text-gray-800={selectedCategory !== item.slug}
						on:click={() => {
							selectedCategory = item.slug;
							load(1);
						}}
					>
						{item.name}
					</button>
				{/each}
			</div>
		</div>

		{#if error}
			<div class="my-5 rounded-lg border border-red-400 bg-red-200 px-4 py-2.5 text-red-600">
				{error}
			</div>
		{/if}

		{#if loading}
			<div class="grid grid-cols-3 gap-6">
				{#each Array(6) as _}
					<div class="h-[0px] animate-pulse rounded-xl bg-gray-100"></div>
				{/each}
			</div>
		{:else if listings.length}
			<div class="grid grid-cols-3 gap-6">
				{#each listings as item (item._id)}
					<button class="cursor-pointer" on:click={() => goto(`/${item._id}`)}>
						<ListingCard {item} />
					</button>
				{/each}
			</div>

			{#if pagination.pages > 1}
				<div class="mt-12 flex items-center justify-center gap-5">
					<button
						class="rounded-md border bg-white border-gray-300 px-4 py-2 disabled:opacity-60"
						disabled={pagination.page <= 1}
						on:click={() => load(pagination.page - 1)}
					>
						Назад
					</button>
					<span>{pagination.page}/{pagination.pages}</span>
					<button
						class="rounded-md border bg-white border-gray-300 px-4 py-2 disabled:opacity-60"
						disabled={pagination.page >= pagination.pages}
						on:click={() => load(pagination.page + 1)}
					>
						Вперед
					</button>
				</div>
			{/if}
		{:else}
			<span class="mt-2 text-sm font-medium mx-auto w-fit block text-gray-500"
				>Здесь пока пусто, создайте первое объявление</span
			>
		{/if}
	</section>
</main>

<footer class="flex items-center justify-between">
	<a class="text-lg font-semibold" href="/">
		<span>Native Wheels</span>
	</a>

	<a href="/admin" class="text-sm font-medium">Управление каталогом</a>
</footer>

{#if notice}
	<div class="fixed right-6 top-6 z-30 rounded-lg bg-green-600 px-5 py-2 text-white shadow-2xl">
		{notice}
	</div>
{/if}
