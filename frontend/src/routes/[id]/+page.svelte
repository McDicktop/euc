<script>
	import { onMount } from 'svelte';
	import { api } from '$lib/api';
	import { page } from '$app/stores';
	import { mediaUrl } from '$lib/api';
	import {
		Zap,
		BatteryFull,
		Plug,
		Gauge,
		Weight,
		Diameter,
		Check,
		X,
		Shield,
		Wallet,
		MapPin,
		UserCircle
	} from '@lucide/svelte';

	const id = $page.params.id;
	// console.log(id);

	let pmv = {};
	let attributes = [];
	let error = '';
	let imageFailed = false;
	let activeImg = null;

	const iconMap = {
		power: { component: Zap, color: 'orange' },
		capacity: { component: BatteryFull, color: 'green' },
		voltage: { component: Plug, color: 'brown' },
		weight: { component: Weight, color: 'blue' },
		maxSpeed: { component: Gauge, color: 'red' },
		wheel: { component: Diameter, color: 'purple' }
	};

	async function showUserPMVs(id) {
		const pmvs = await api(`http://localhost:3000/api/pmvs/user/${id}`);

		console.log(pmvs);
	}

	onMount(async () => {
		try {
			pmv = await api(`http://localhost:3000/api/pmvs/${id}`);
			attributes = await api(`http://localhost:3000/api/attributes`);
			activeImg = pmv?.images?.coverKey || pmv?.images?.gallery[0] || null;
		} catch (e) {
			error = e.message;
		}

		// await load();
	});
</script>

<main>
	<!-- {#if pmv.name}
		<p class="w-[1046px] mx-auto text-2xl font-semibold pt-2 pb-3">{pmv.name}</p>
	{/if} -->
	<div class="mt-6"></div>

	<article class="grid grid-cols-[458px_458px] gap-6 justify-center">
		<div class="flex flex-col gap-4">
			{#if pmv.images?.coverKey && !imageFailed}
				<img
					class="w-full object-cover aspect-square border border-gray-200 rounded-xl"
					src={mediaUrl(activeImg)}
					alt="imgBig"
				/>
			{:else}
				<div
					class="w-full aspect-video bg-gray-100 flex items-center justify-center text-gray-400 border border-gray-200 rounded-xl"
				>
					Фото нет
				</div>
			{/if}

			{#if pmv.images?.gallery?.length}
				<div class="flex flex gap-3">
					{#each [pmv.images.coverKey, ...pmv.images.gallery] as thumb, ind}
						<button
							onclick={() => (activeImg = thumb)}
							class={`cursor-pointer border rounded-lg duration-200 ${activeImg === thumb ? 'border-gray-400' : 'border-gray-200 hover:opacity-80'}`}
						>
							<img
								class="size-20 object-contain rounded-lg"
								src={mediaUrl(thumb)}
								alt={`img_${ind}`}
								onerror={() => (imageFailed = true)}
							/>
						</button>
					{/each}
				</div>
			{:else}
				<div
					class="w-20 h-full bg-gray-100 flex items-center justify-center text-xs text-gray-400 rounded-lg"
				>
					Фото нет
				</div>
			{/if}

			<button
				class="bg-gray-300 rounded-xl py-3 cursor-pointer hover:bg-gray-400 text-gray-800 hover:text-black duration-200"
			>
				<span class="font-semibold text-xl">Арендовать</span>
			</button>
		</div>

		<div class="flex flex-col gap-4">
			{#if pmv.name}
				<p class="text-2xl font-semibold">{pmv.name}</p>
			{/if}

			{#if pmv.description}
				<p class="text-gray-600">
					{pmv.description || 'Описание пока не добавлено'}
				</p>
			{/if}

			<div class="flex gap-10">
				<div class="flex flex-col items-center border border-gray-200 rounded-xl w-full">
					<span class="font-medium text-lg rounded-t-xl bg-gray-200 w-full text-center py-1"
						>Аренда:</span
					>

					<div class="flex items-center gap-2 px-3 py-1">
						<Wallet class="size-6 stroke-2 text-green-600" />

						<div class="flex flex-col">
							{#if pmv.defaultPricePerHour !== null}
								<span class="">
									{pmv.defaultPricePerHour} ₽/час
								</span>
							{/if}
							{#if pmv.defaultPricePerDay !== null}
								<span class="">
									{pmv.defaultPricePerDay} ₽/день
								</span>
							{/if}
						</div>
					</div>
				</div>

				<div class="flex flex-col items-center border border-gray-200 rounded-xl w-full">
					<span class="font-medium text-lg rounded-t-xl bg-gray-200 w-full text-center py-1"
						>Залог:</span
					>

					<div class="flex items-center justify-center gap-2 px-3 py-1 flex-1">
						<Shield class="size-6 stroke-2 text-orange-700" />
						{#if pmv.deposit !== null}
							<span class="">
								{pmv.deposit} ₽
							</span>
						{/if}
					</div>
				</div>
			</div>

			<div class="bg-gray-100 rounded-xl w-full h-80"></div>

			<div class="flex flex-col flex-wrap gap-2 border border-gray-200 p-4 rounded-xl">
				<span class="font-semibold">Характеристики:</span>
				{#if pmv.details && attributes.length}
					{#each Object.entries(pmv.details) as [key, value]}
						{const { label, unit } = attributes.find((item) => item.key === key)}

						{@const iconObj = iconMap[key]}

						<span class="flex items-center gap-1 text-gray-700 text-xs">
							{#if iconObj}
								{@const IconComponent = iconObj.component}
								<IconComponent class="size-4 stroke-2" color={iconObj.color} />
								{value}
								{unit || ''}
							{:else if typeof value === 'boolean'}
								{@const BooleanIcon = value ? Check : X}

								<BooleanIcon class="size-4 stroke-2" color={value ? 'green' : 'red'} />
								{label}
							{:else}
								{label} - {value}
								{unit ?? ''}
							{/if}
						</span>
					{/each}
				{/if}
			</div>
		</div>
	</article>
</main>
