<script>
	// ListingAdmin
	// CategoriesAdmin
	// AttributesAdmin

	import ListingsAdmin from '$lib/components/admin/ListingsAdmin.svelte';
	import CategoriesAdmin from '$lib/components/admin/CategoriesAdmin.svelte';
	import AttributesAdmin from '$lib/components/admin/AttributesAdmin.svelte';

	import { Home } from '@lucide/svelte';

	let section = 'listings';
	const sections = [
		['listings', 'Объявления'],
		['categories', 'Категории'],
		['attributes', 'Атрибуты']
	];
</script>

<div
	class="grid min-h-screen grid-cols-[245px_1fr] max-lg:grid-cols-[210px_1fr] max-sm:block bg-gray-50"
>
	<aside class="sticky top-0 flex h-screen flex-col bg-gray-50 px-5 py-7 text-gray-800">
		<div class="text-xl">Админка</div>

		<nav class="flex flex-col gap-1">
			{#each sections as item}
				<button
					class={`flex items-center cursor-pointer hover:opacity-50 gap-3 whitespace-nowrap rounded-lg border-0 px-3 py-2 text-left ${section === item[0] ? 'text-blue-500 bg-blue-50' : 'bg-tranparent text-gray-500'}`}
					onclick={() => {
						section = item[0];
					}}
				>
					{item[1]}
				</button>
			{/each}
		</nav>
	</aside>

	<main class="min-w-0">
		<header
			class="flex items-center justify-between min-h-30 border-b border-gray-100 px-[3vw] py-5 max-sm:min-h-24 max-sm:px-5"
		>
			<div class="text-sm text-gray-800/90 mt-1">
				Панель управления<span class="mx-1.5">·</span>
				<span 
					class="text-lg font-medium"
				>
					{sections.find((el) => el[0] === section)?.[1]}
				</span>
			</div>

			<a
				class="inline-flex items-center justify-center gap-1.5 rounded-lg border border-gray-200/50 bg-gray-100 px-5 py-1.5 font-medium hover:opacity-80"
				href="/"
			>
				<Home class="size-3.5" />
				На главную
			</a>
		</header>

		{#if section === "listing"}
			<ListingsAdmin />
		{:else if section === "categories"}
			<CategoriesAdmin />
		{:else}
			<AttributesAdmin />
		{/if}
	</main>
</div>
