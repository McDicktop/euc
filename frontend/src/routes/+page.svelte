<script>
	import { onMount } from 'svelte';
	import { SvelteURLSearchParams } from 'svelte/reactivity';
	import { api } from '$lib/api';

	let categories = [];
	let listings = [];
	let pagination = { page: 1, pages: 1, total: 0 };

	let selectedCategory = '';
	let showCreate = false;
	let loading = true;
	let error = '';
	let notice = '';

	async function load(page = 1) {
		loading = true;
		error = '';

		try {
			const query = new SvelteURLSearchParams({
				page: String(page),
				limit: "14",
				isActive: "true"
			});

			if (selectedCategory) query.set('category', selectedCategory);

			console.log(`http://localhost:3000/api/pmvs`)
			// console.log(`http://localhost:3000/api/pmvs?${query}`)

			const data = await api(`http://localhost:3000/api/pmvs?${query}`);

			console.log(data)

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

	onMount(async () => {
		try {
			categories = await api('http://localhost:3000/api/categories');
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
		<div></div>
	{/if}

	<section>
		<div class="flex items-center gap-2 text-black">
			<span class="text-lg font-bold">{pagination.total}</span>
			<span class="text-base">объявлений в каталоге</span>
		</div>
	</section>

	<section class="mx-auto max-w-[1440px] px-[5vw] pt-24 pb-28">
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
					<!-- <ListingCard {item} /> -->
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