<script>
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { mediaUrl, api } from '$lib/api';
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

	// States
	let pmv = null;
	let pmvLoading = true;
	let pmvError = '';

	let attributes = [];
	let attrsLoading = true;
	let attrsError = '';

	let selectedImg = null;
	let failedImgs = {};

	// const iconMap = {
	// 	power: { component: Zap, color: 'orange' },
	// 	capacity: { component: BatteryFull, color: 'green' },
	// 	voltage: { component: Plug, color: 'brown' },
	// 	weight: { component: Weight, color: 'blue' },
	// 	maxSpeed: { component: Gauge, color: 'red' },
	// 	wheel: { component: Diameter, color: 'purple' }
	// };

	// async function showUserPMVs(id) {
	// 	const pmvs = await api(`http://localhost:3000/api/pmvs/user/${id}`);

	// 	console.log(pmvs);
	// }

	onMount(() => {
		const controller = new AbortController();
		const { signal } = controller;

		api(`/api/pmvs/${id}`, { signal })
			.then((data) => (pmv = data))
			.catch((e) => {
				if (e.name !== 'AbortError') pmvError = e.message || 'Не удалось загрузить объявление';
			})
			.finally(() => {
				if (!signal.aborted) pmvLoading = false;
			});

		api(`/api/attributes`, { signal })
			.then((data) => (attributes = data))
			.catch((e) => {
				if (e.name !== 'AbortError') pmvError = e.message || 'Не удалось загрузить характеристики';
			})
			.finally(() => {
				if (!signal.aborted) attrsLoading = false;
			});

		return () => controller.abort();
	});

	$: images = [...new Set([pmv?.images?.coverKey, ...(pmv?.images?.gallery ?? [])])].filter(
		Boolean
	);
	$: activeImg = selectedImg ?? images[0] ?? null;
	$: attrMap = Object.fromEntries(attributes.map((attr) => [attr.key, attr]));
	$: specs = Object.entries(pmv?.details ?? {}).map(([key, value]) => ({
		key,
		value,
		label: attrMap[key]?.label ?? key,
		unit: attrMap[key]?.unit ?? ''
	}));

	const markFailed = (src) => (failedImgs = { ...failedImgs, [src]: true });

	const iconMap = {
		power: { component: Zap, color: 'orange' },
		capacity: { component: BatteryFull, color: 'green' },
		voltage: { component: Plug, color: 'brown' },
		weight: { component: Weight, color: 'blue' },
		maxSpeed: { component: Gauge, color: 'red' },
		wheel: { component: Diameter, color: 'purple' }
	};
</script>

<main>
	<!-- {#if pmv.name}
		<p class="w-[1046px] mx-auto text-2xl font-semibold pt-2 pb-3">{pmv.name}</p>
	{/if} -->
	<div class="mt-6"></div>

	{#if pmvLoading}
		<p class="text-center text-gray-400">Загрузка...</p>
	{:else if pmvError}
		<p class="text-center text-red-500">{pmvError}</p>
	{:else if pmv}
		<article class="grid grid-cols-[458px_458px] gap-6 justify-center">
			<div class="flex flex-col gap-4">
				{#if activeImg && !failedImgs[activeImg]}
					<img
						class="w-full object-cover aspect-square border border-gray-200 rounded-xl"
						src={mediaUrl(activeImg)}
						alt="imgBig"
						on:error={() => markFailed(activeImg)}
					/>
				{:else}
					<div
						class="w-full aspect-video bg-gray-100 flex items-center justify-center text-gray-400 border border-gray-200 rounded-xl"
					>
						Фото нет
					</div>
				{/if}

				{#if images.length > 1}
					<div class="flex flex gap-3">
						{#each images as thumb, i (thumb)}
							<button
								on:click={() => (selectedImg = thumb)}
								class={`cursor-pointer border rounded-lg duration-200 ${activeImg === thumb ? 'border-gray-400' : 'border-gray-200 hover:opacity-80'}`}
							>
								<img
									class="size-20 object-contain rounded-lg"
									src={mediaUrl(thumb)}
									alt={`img_${i}`}
									on:error={() => markFailed(thumb)}
								/>
							</button>
						{/each}
					</div>
				{/if}

				<button
					class="bg-gray-300 rounded-xl py-3 cursor-pointer hover:bg-gray-400 text-gray-800 hover:text-black duration-200"
				>
					<span class="font-semibold text-xl">Арендовать</span>
				</button>
			</div>

			<div class="flex flex-col gap-4">
				<p class="text-2xl font-semibold">{pmv.name}</p>

				<p class="text-gray-600">
					{pmv.description || 'Описание пока не добавлено'}
				</p>

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

					{#if attrsLoading}
						<p class="text-center text-xs text-gray-400">Загрузка...</p>
					{:else}
						{#if attrsError}
							<p class="text-center text-xs text-red-500">{attrsError}</p>
						{/if}

						{#if pmv.details && attributes.length}
							{#each specs as {key, value, label, unit} (key)}
								{@const icon = iconMap[key]}
								<span class="flex items-center gap-1 text-gray-700 text-xs">
									{#if icon}
										{@const IconComponent = icon.component}
										<IconComponent class="size-4 stroke-2" color={icon.color} />
										{value} {unit || ''}
									{:else if typeof value === 'boolean'}
										<!-- {@const BooleanIcon = value ? Check : X}
										<BooleanIcon class="size-4 stroke-2" color={value ? 'green' : 'red'} /> -->

										<svelte:component this={value ? Check : X} class="size-4 stroke-2" color={value ? 'green' : 'red'} />
										{label}
									{:else}
										{label} - {value} {unit ?? ''}
									{/if}
								</span>
							{/each}
						{/if}
					{/if}
				</div>
			</div>
		</article>
	{/if}
</main>
