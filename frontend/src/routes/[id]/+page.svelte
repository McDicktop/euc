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

		console.log(pmvs)
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
	{#if pmv.name}
		<p class="w-[1046px] mx-auto text-2xl font-semibold pt-2 pb-3">{pmv.name}</p>
	{/if}

	<article class="grid grid-cols-[80px_458px_458px] w-[1046px] gap-6 mx-auto justify-start">
		{#if pmv.images?.gallery?.length}
			<div class="flex flex-col gap-3">
				{#each [pmv.images.coverKey, ...pmv.images.gallery] as thumb, ind}
					<button
						onclick={() => (activeImg = thumb)}
						class={`cursor-pointer border rounded-lg duration-200 ${activeImg === thumb ? 'border-gray-800' : 'border-gray-200 hover:opacity-80'}`}
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

		{#if pmv.images?.coverKey && !imageFailed}
			<img
				class="w-full object-cover aspect-square border border-gray-200 rounded-xl"
				src={mediaUrl(activeImg)}
				alt='imgBig'
			/>
		{:else}
			<div
				class="w-full aspect-video bg-gray-100 flex items-center justify-center text-gray-400 border border-gray-200 rounded-xl"
			>
				Фото нет
			</div>
		{/if}

		<div class="flex flex-col gap-4">
			<p class="text-gray-600 leading-relaxed">
				{pmv.description || 'Описание пока не добавлено'}
			</p>

			<div class="flex justify-between">

				<div class="flex flex-col items-center rounded-xl w-24 py-1 bg-gray-200">
					<Shield class="size-6" />
					<span class="font-semibold">Залог:</span>
					{#if pmv.deposit !== null}
						<span class="text-sm">
							{pmv.deposit} ₽
						</span>
					{/if}
				</div>

				<div class="flex flex-col items-center rounded-xl w-24 py-1 bg-gray-200">
					<Wallet class="size-6" />
					<span class="font-semibold">Аренда:</span>

					{#if pmv.defaultPricePerHour !== null}
						<span class="text-sm">
							{pmv.defaultPricePerHour} ₽/час
						</span>
					{/if}
					{#if pmv.defaultPricePerDay !== null}
						<span class="text-sm">
							{pmv.defaultPricePerDay} ₽/день
						</span>
					{/if}
				</div>

				<div class="flex flex-col items-center rounded-xl w-24 py-1 bg-gray-200">
					<MapPin class="size-6" />
					<span class="font-semibold">Место:</span>
					{#if pmv.deposit !== null}
						<span class="text-sm">
							{pmv.deposit} ₽
						</span>
					{/if}
				</div>


				<button 
				class="border rounded-xl cursor-pointer flex flex-col items-center justify-center"
				onclick={ () => showUserPMVs(pmv.userId) }
				>
					<UserCircle class="size-6" />
					Все объявления пользователя
				</button>



			</div>

			<div class="flex flex-col flex-wrap gap-2 pt-2">
				<span class="font-semibold">Характеристики:</span>
				{#if pmv.details && attributes.length}
					{#each Object.entries(pmv.details) as [key, value]}
						{const { label, unit } = attributes.find((item) => item.key === key)}

						{@const iconObj = iconMap[key]}

						<span class="flex items-center gap-1 text-gray-700 text-sm">
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
				<!-- {#each pmv.details as attr, ind}
					<span class="flex items-center gap-1 text-gray-700 text-sm">
					</span>
				{/each} -->

				<!-- {#if pmv.details?.power}
					<span class="flex items-center gap-1 text-gray-700 text-sm">
						<Zap class="size-4 text-green-700 stroke-2" />
						{pmv.details.power} {attributes.filter((item) => item.key === "power")[0]?.unit}
					</span>
				{/if}
				{#if pmv.details?.capacity}
					<span class="flex items-center gap-1 text-gray-700 text-sm">
						<BatteryFull class="size-4 text-green-700 stroke-2" />
						{pmv.details?.capacity} W*H
					</span>
				{/if}
				{#if pmv.details?.voltage}
					<span class="flex items-center gap-1 text-gray-700 text-sm">
						<Plug class="size-4 text-green-700 stroke-2" />
						{pmv.details?.voltage} V
					</span>
				{/if}
				{#if pmv.details?.maxSpeed}
					<span class="flex items-center gap-1 text-gray-700 text-sm">
						<Gauge class="size-4 text-green-700 stroke-2" />
						{pmv.details?.maxSpeed} Km/H
					</span>
				{/if}
				{#if pmv.details?.tireDiameter}
					<span class="flex items-center gap-1 text-gray-700 text-sm">
						<Diameter class="size-4 text-green-700 stroke-2" />
						{pmv.details?.tireDiameter} ''
					</span>
				{/if}
				{#if pmv.details?.weight}
					<span class="flex items-center gap-1 text-gray-700 text-sm">
						<Weight class="size-4 text-green-700 stroke-2" />
						{pmv.details?.weight} Kg
					</span>
				{/if} -->

				<!-- {#if pmv.mileage !== null}
					<span class="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
						Пробег - {pmv.mileage} Km
					</span>
				{/if}

				{#if pmv.deposit !== null}
					<span class="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
						Залог - {pmv.deposit} ₽
					</span>
				{/if}
				{#if pmv.defaultPricePerHour !== null}
					<span class="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
						{pmv.defaultPricePerHour} ₽/час
					</span>
				{/if}
				{#if pmv.defaultPricePerDay !== null}
					<span class="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
						{pmv.defaultPricePerDay} ₽/день
					</span>
				{/if}

				<button class="w-full py-2 rounded-xl border border-gray-300" onclick={() => {}}>
					АРЕНДОВАТЬ
				</button> -->
			</div>
		</div>
	</article>
</main>
