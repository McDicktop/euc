<script>
	import { onMount } from 'svelte';
	import { api } from '$lib/api';
	import { page } from '$app/stores';
	import { mediaUrl } from '$lib/api';

	const id = $page.params.id;

	console.log(id);

	let pmv = {};
	let error = '';
	let imageFailed = false;

	onMount(async () => {
		try {
			pmv = await api(`http://localhost:3000/api/pmvs/${id}`);
			console.log(pmv);
		} catch (e) {
			error = e.message;
		}

		// await load();
	});
</script>

<main>
	<article
		class="overflow-hidden rounded-xl border border-line bg-paper transition duration-200 hover:scale-105"
	>
		<div class="relative h-64 overflow-hidden">
			{#if pmv.images?.coverKey && !imageFailed}
				<img
					class="size-full object-cover"
					src={mediaUrl(pmv.images.coverKey)}
					alt={pmv.name}
					onerror={() => (imageFailed = true)}
				/>
			{:else}
				<div class="size-full bg-gray-100">Фото нет</div>
			{/if}

			<span
				class="absolute top-4 left-4 flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-medium text-black"
			>
				<!-- {statusLabels[pmv.status] || pmv.status} -->
			</span>
		</div>

		<div class="p-6">
			<div class="text-xs font-bold tracking-[0.16em] uppercase">
				{pmv.category?.name || 'Транспорт'}
			</div>
			<h3 class="my-2 font-medium text-lg tracking-[-0.04em]">
				{pmv.name}
			</h3>
			<p class="line-clamp-2 h-10 text-sm leading-relaxed text-gray-800">
				{pmv.description || 'Описание пока не добавлено'}
			</p>

			<div class="my-4 flex flex-wrap gap-1.5">
				<!-- details -->
				{#if pmv.details?.brand}
					<span class="rounded-lg border border-gray-100 bg-gray-100 px-2 py-1 text-xs">
						{pmv.details?.brand}
					</span>
				{/if}

				{#if pmv.details?.maxSpeed}
					<span class="rounded-lg border border-gray-100 bg-gray-100 px-2 py-1 text-xs">
						{pmv.details?.maxSpeed}
					</span>
				{/if}

				{#if pmv.mileage !== null}
					<span class="rounded-lg border border-gray-100 bg-gray-100 px-2 py-1 text-xs">
						{pmv.mileage}
					</span>
				{/if}

				<!-- прочие details -->
			</div>


		</div>
	</article>
</main>
