<script>
	import { auth } from '$lib/stores/auth';
	import { logout } from '$lib/auth/auth';

	import { onMount } from 'svelte';
	import { SvelteURLSearchParams } from 'svelte/reactivity';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	import { api } from '$lib/api';

	import ListingCard from '$lib/components/ListingCard.svelte';
	import ListingForm from '$lib/components/ListingForm.svelte';
	import NumberFilters from '$lib/components/filters/NumberFilters.svelte';
	import EnumFilters from '$lib/components/filters/EnumFilters.svelte';
	import BooleanFilters from '$lib/components/filters/BooleanFilters.svelte';

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

	let filtersLoading = false;
	let openEnumKey = null;

	// $: if (selectedCategory !== undefined) {
	// 	loadFilters();
	// }

	let loadSeq = 0;
	let filtersSeq = 0;

	$: numberFilters = filters.filter((f) => f.type === 'number');
	$: booleanFilters = filters.filter((f) => f.type === 'boolean');
	$: enumFilters = filters.filter((f) => f.type === 'enum');

	const toggleEnumDropdown = (key) => {
		openEnumKey = openEnumKey === key ? null : key;
	};

	const closeDropdowns = () => {
		openEnumKey = null;
	};

	async function load(pageArg = 1) {
		const requestId = ++loadSeq; // 1
		loading = true;
		error = '';

		try {
			const data = await api(`http://localhost:3000/api/pmvs?${buildQuery(pageArg)}`);

			if (requestId !== loadSeq) return;
			// 1 === 1

			listings = data.items;
			pagination = data.pagination;
		} catch (err) {
			if (requestId !== loadSeq) return;
			error = err.message;
		} finally {
			loading = false;
		}
	}

	// - loadSeq = 2

	// load #1
	// 	- reqId = 1
	// 	- await ~3s
	// 	- +

	// load #2
	// 	- reqId = 2
	// 	- await ~1s
	// 	- +

	async function loadFilters(slug) {
		const requestId = ++filtersSeq;

		filters = [];
		filterQueryObj = {};

		if (!slug) {
			filtersLoading = false;
			return;
		}

		filtersLoading = true;

		try {
			const categoryBySlug = await api(`http://localhost:3000/api/categories/slug/${slug}`);

			if (requestId !== filtersSeq) return;

			filters = buildFilters(categoryBySlug?.attributes ?? []);
		} catch (error) {
			if (requestId !== filtersSeq) return;
			console.error('Ошибка загрузки фильтров:', error);
		} finally {
			filtersLoading = false;
		}
	}

	function selectCategory(slug) {
		if (selectedCategory === slug) return;

		openEnumKey = null;
		filterQueryObj = {};
		selectedCategory = slug;

		loadFilters(slug);
		load(1);
	}

	function buildFilters(attributes) {
		return attributes.reduce((acc, item) => {
			const { attribute, min: itemMin, max: itemMax } = item;

			if (!attribute.filterable) return acc;

			const base = {
				type: attribute.type,
				key: attribute.key,
				label: attribute.label
			};

			switch (attribute.type) {
				case 'boolean':
					acc.push({ ...base, value: null });
					break;

				case 'enum':
					acc.push({
						...base,
						options: attribute.options ?? [],
						selected: []
					});
					break;

				case 'number': {
					const initialMin = attribute.min ?? itemMin;
					const initialMax = attribute.max ?? itemMax;

					acc.push({
						...base,
						unit: attribute.unit,
						baseMin: initialMin,
						baseMax: initialMax,
						min: initialMin,
						max: initialMax
					});
					break;
				}
			}

			return acc;
		}, []);
	}

	// const clamp = (val, min, max) => Math.min(куы, max);
	const clamp = (val, lo, hi) => {
		let res = val;

		if (lo !== null && lo !== undefined) res = Math.max(res, lo);
		if ((hi !== null) & (hi !== undefined)) res = Math.min(res, hi);

		return res;
	};

	const handleFilter = (filter) => {
		const { key, type } = filter;

		if (type === 'boolean') {
			if (filter.value !== null) {
				filterQueryObj = { ...filterQueryObj, [key]: filter.value };
			} else {
				const { [key]: _, ...rest } = filterQueryObj;
				filterQueryObj = rest;
			}
			return;
		}

		if (type === 'enum') {
			if (filter.selected.length > 0) {
				filterQueryObj = { ...filterQueryObj, [key]: filter.selected };
			} else {
				const { [key]: _, ...rest } = filterQueryObj;
				filterQueryObj = rest;
			}
			return;
		}

		if (type === 'number') {
			const { baseMin, baseMax } = filter;

			let min = typeof filter.min === 'number' && !Number.isNaN(filter.min) ? filter.min : baseMin;
			let max = typeof filter.max === 'number' && !Number.isNaN(filter.max) ? filter.max : baseMax;

			min = clamp(min, baseMin, baseMax);
			max = clamp(max, baseMin, baseMax);
			if (min > max) max = min;

			filters = filters.map((item) => (item.key === key ? { ...item, min, max } : item));

			if (min === baseMin && max === baseMax) {
				const { [key]: _, ...rest } = filterQueryObj;
				filterQueryObj = rest;
			} else if (min === max) {
				filterQueryObj = { ...filterQueryObj, [key]: min };
			} else {
				filterQueryObj = { ...filterQueryObj, [key]: { min, max } };
			}
		}
	};

	function buildQuery(page) {
		const query = new SvelteURLSearchParams({
			page: String(page),
			limit: '14',
			isActive: 'true'
		});

		if (selectedCategory) {
			query.set('category', selectedCategory);
		} else {
			return query;
		}

		for (const [key, value] of Object.entries(filterQueryObj)) {
			if (value === null || value === undefined || value === '') continue;

			// 1. Тип enum (массив выбранных значений)
			if (Array.isArray(value)) {
				for (const item of value) {
					if (item !== null && item !== undefined && item !== '') {
						query.append(`attr.${key}`, String(item));
					}
				}
			}

			// 2. Тип number с диапазоном { min, max }
			else if (typeof value === 'object') {
				if (value.min !== undefined && value.min !== null && value.min !== '') {
					query.set(`attr.${key}.gte`, String(value.min));
				}
				if (value.max !== undefined && value.max !== null && value.max !== '') {
					query.set(`attr.${key}.lte`, String(value.max));
				}
			}

			// 3. Тип boolean (true / false) и точное совпадение number (min === max)
			else if (
				typeof value === 'boolean' ||
				typeof value === 'number' ||
				typeof value === 'string' // ?????? наверное нужно убрать
			) {
				query.set(`attr.${key}`, String(value));
			}
		}

		return query;
	}

	async function applyFilter() {
		openEnumKey = null;
		await load(1);
	}

	const resetFilter = async () => {
		openEnumKey = null;
		filterQueryObj = {};

		filters = filters.map((filter) => {
			if (filter.type === 'boolean') {
				return { ...filter, value: null };
			}
			if (filter.type === 'enum') {
				return { ...filter, selected: [] };
			}
			return {
				...filter,
				min: filter.baseMin,
				max: filter.baseMax
			};
		});

		await load(1);
	};

	async function created() {
		showCreate = false;
		notice = 'Объявление опубликовано';
		await load(1);
		setTimeout(() => {
			notice = '';
		}, 3000);
	}

	async function handleLogout() {
		try {
			await logout();
		} catch (err) {
			error = err.message;
		}
	}

	onMount(async () => {
		try {
			categories = await api('http://localhost:3000/api/categories');
		} catch (e) {
			error = e.message;
		}

		await load();
	});
</script>

<svelte:window on:click={closeDropdowns} />
<header
	class="relative z-10 flex h-20 items-center justify-between border-b border-gray-200 text-sm"
>
	<a class="text-lg font-semibold" href="/">
		<span>Native Wheels</span>
	</a>

	<nav class="flex items-center gap-8 text-sm font-medium">
		<a href="#catalog">Каталог</a>
		<a href="/admin">Админ</a>

		<!-- <button
			class="cursor-pointer"
			on:click={() => {
				showCreate = true;
			}}>Разместить объявление</button
		>] -->

		{#if $auth.isInitializing}
			<span>Загрузка сессии..</span>
		{:else if $auth.isAuthenticated}
			<button
				class="cursor-pointer"
				on:click={() => {
					showCreate = true;
				}}>Разместить объявление</button
			>
			<span>{$auth.user?.name ?? $auth.user?.email}</span>
			<button class="cursor-pointer" on:click={handleLogout}>Выйти</button>
		{:else}
				<a href="/signin">Войти</a>
				<a href="/signup">Регистрация</a>
		{/if}
	</nav>
</header>

<main>
	{#if showCreate && $auth.isAuthenticated}
		<div class="mx-auto">
			<ListingForm
				{categories}
				onCreated={created}
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
		{#if selectedCategory && filters.length > 0}
			<div class="flex flex-col gap-6">
				<NumberFilters {numberFilters} {handleFilter} />
				<EnumFilters {enumFilters} {openEnumKey} {handleFilter} {toggleEnumDropdown} />
				<BooleanFilters {booleanFilters} {handleFilter} />
			</div>

			<div class="mt-6 flex gap-4">
				<button
					class="w-60 cursor-pointer rounded-lg bg-blue-300 py-2 font-medium text-neutral-100 duration-200 hover:bg-blue-500"
					on:click={applyFilter}
				>
					ПОКАЗАТЬ
				</button>
				<button
					class="w-60 cursor-pointer rounded-lg bg-blue-300 py-2 font-medium text-neutral-100 duration-200 hover:bg-blue-500"
					on:click={resetFilter}
				>
					ОЧИСТИТЬ
				</button>
			</div>
		{/if}

		<div class="mb-11 flex items-center justify-between gap-8">
			<div class="">
				<h2 class="text-base font-bold text-gray-800">Каталог</h2>
			</div>

			<div class="flex flex-wrap justify-end gap-2">
				<button
					class="rounded-full px-4 py-2 transition cursor-pointer"
					class:border-gray-800={!selectedCategory}
					class:bg-gray-800={!selectedCategory}
					class:text-white={!selectedCategory}
					class:border-gray-300={selectedCategory}
					class:bg-gray-50={selectedCategory}
					class:text-gray-800={selectedCategory}
					on:click={() => {
						selectCategory('');
					}}
				>
					Все
				</button>

				{#each categories.filter((item) => item.isActive) as item (item.slug)}
					<button
						class="rounded-full px-4 py-2 transition cursor-pointer"
						class:border-gray-800={selectedCategory === item.slug}
						class:bg-gray-800={selectedCategory === item.slug}
						class:text-white={selectedCategory === item.slug}
						class:border-gray-300={selectedCategory !== item.slug}
						class:bg-gray-50={selectedCategory !== item.slug}
						class:text-gray-800={selectedCategory !== item.slug}
						on:click={async () => {
							selectCategory(item.slug);
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
