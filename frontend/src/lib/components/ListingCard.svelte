<!-- <script>
	export let item = null;

	const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';

	// /folder/id.ext
	function photoIdFromKey(key) {
		const filename = key.split('/').pop();
		return filename.replace(/\.[^/.]+$/, '');
	}

	function photoUrl(key) {
		return `${API_BASE_URL}${key}`;
	}
</script>

<main>
	{console.log(item)}
	<img src="" alt="" />
</main> -->

<script>
	import { formatMoney, statusLabels, mediaUrl } from '$lib/api';

	export let item;

	let imageFailed = false;
</script>

<article
	class="overflow-hidden rounded-xl border border-line bg-paper transition duration-200 hover:scale-105"
>
	<div class="relative h-64 overflow-hidden">
		{#if item.images?.coverKey && !imageFailed}
			<img
				class="size-full object-cover"
				src={mediaUrl(item.images.coverKey)}
				alt={item.name}
				onerror={() => (imageFailed = true)}
			/>
		{:else}
			<div class="size-full bg-gray-100">Фото нет</div>
		{/if}

		<span
			class="absolute top-4 left-4 flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-medium text-black"
		>
			{statusLabels[item.status] || item.status}
		</span>
	</div>

	<div class="p-6">
		<div class="text-xs font-bold tracking-[0.16em] uppercase">
			{item.category?.name || 'Транспорт'}
		</div>
		<h3 class="my-2 font-medium text-lg tracking-[-0.04em]">
			{item.name}
		</h3>
		<p class="line-clamp-2 h-10 text-sm leading-relaxed text-gray-800">
			{item.description || 'Описание пока не добавлено'}
		</p>

		<div class="my-4 flex flex-wrap gap-1.5">
			<!-- details -->
			{#if item.details?.brand}
				<span class="rounded-lg border border-gray-100 bg-gray-100 px-2 py-1 text-xs">
					{item.details?.brand}
				</span>
			{/if}

			{#if item.details?.maxSpeed}
				<span class="rounded-lg border border-gray-100 bg-gray-100 px-2 py-1 text-xs">
					{item.details?.maxSpeed}
				</span>
			{/if}

			{#if item.mileage !== null}
				<span class="rounded-lg border border-gray-100 bg-gray-100 px-2 py-1 text-xs">
					{item.mileage}
				</span>
			{/if}

			<!-- прочие details -->
		</div>

		<div clas="flex items-end justify-between border-t border-gray-100 pt-4">
			<strong class="text-xl">
				{formatMoney(item.defaultPricePerHour)} р
				<small class="text-xs font-medium text-gray-700">/ час</small>
			</strong>

			{#if item.defaultPricePerDay}
				<span class="text-xs font-medium text-gray-700">
					{formatMoney(item.defaultPricePerDay)} р / день 
				</span>
			{/if}
		</div>
	</div>
</article>
