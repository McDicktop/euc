<script>
	import { onMount } from 'svelte';
	import { api, json, formatMoney, statusLabels, mediaUrl } from '$lib/api';
	import { Image, Pencil, Trash } from '@lucide/svelte';

	let items = [];
	let total = 0;
	let loading = true;
	let error = '';
	let search = '';

	let editing = null;
	let saving = false;

	$: filtered = items.filter((item) => item.name.toLowerCase().includes(search.toLowerCase()));

	async function load(limit = 100) {
		loading = true;

		try {
			const data = await api(`http://localhost:3000/api/pmvs?limit=${limit}`);
			items = data.items;
			total = data.pagination.total;
		} catch (e) {
			error = e.message;
		} finally {
			loading = false;
		}
	}

	async function save() {
		saving = true;
		error = '';

		try {
			const body = {
				name: editing.name,
				description: editing.description,
				defaultPricePerHour: Number(editing.defaultPricePerHour),
				defaultPricePerDay: editing.defaultPricePerDay
					? Number(editing.defaultPricePerDay)
					: undefined,
				deposit: editing.deposit === '' ? undefined : Number(editing.deposit),
				isActive: editing.isActive,
				mileage: Number(editing.mileage)
			};

			Object.keys(body).forEach((key) => {
				if (body[key] === undefined) {
					delete body[key];
				}
			});

			await api(`/api/pmvs/${editing._id}`, json('PATCH', body));
			editing = null;
			await load();
		} catch (e) {
			error = e.message;
		} finally {
			saving = false;
		}
	}

	async function remove(item) {
		if (!confirm(`Удалить объявление "${item.name}"?`)) return;

		try {
			await api(`/api/pmvs/${item._id}`, { method: 'DELETE' });
			await load();
		} catch (e) {
			error = e.message;
		}
	}

	onMount(load);
</script>

<section class="px-[4vw] pt-9 pb-20 max-sm:px-4 max-sm:pt-6">
	<div class="mb-6 grid grid-cols-3 gap-4 max-sm:grid-cols-1">
		<div>
			<span class="text-xs text-gray-800">Всего объявлений:</span>
			<strong class="text-base font-medium">{total}</strong>
		</div>

		<div>
			<span class="text-xs text-gray-800">Видны на сайте:</span>
			<strong class="text-base font-medium">
				{items.filter((item) => item.isActive).length}
			</strong>
		</div>

		<div>
			<span class="text-xs text-gray-800">Готовы к аренде:</span>
			<strong class="text-base font-medium">
				{items.filter((item) => item.isActive && item.status === 'available').length}
			</strong>
		</div>
	</div>

	<!-- Объявление -->
	<div class="overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
		<div
			class="flex items-center justify-between gap-5 border-b border-gray-200 px-6 py-5 max-sm:flex-col max-sm:items-stretch"
		>
			<h2 class="mb-1 font-display text-lg font-semibold">Все объявления</h2>

			<input
				type="text"
				bind:value={search}
				placeholder="Поиск по названию..."
				class="w-60 rounded-lg border border-gray-300 bg-white px-3.5 py-2 outline-none focus:border-blue-500 max-sm:w-full"
			/>
		</div>

		{#if error}
			<div
				class="my-5 mx-10 rounded-lg border border-red-500 bg-red-500 px-4 py-3 text-sm text-white"
			>
				{error}
			</div>
		{/if}

		{#if loading}
			<div class="p-9 text-center text-[#718078]">Загрузка объявлений...</div>
		{:else}
			<div class="overflow-x-auto">
				<table
					class="w-full border-collapse text-xs [&_th]:bg-gray-50 [&_th]:px-5 [&_th]:py-3 [&_th]:text-left [&_th]:text-[10px] [&_th]:uppercase [&_td]:border-t [&_td]:border-gray-100 [&_td]:px-5 [&_td]:py-3"
				>
					<thead>
						<tr>
							<th>Объявление</th>
							<th>Категория</th>
							<th>Цена</th>
							<th>Статус</th>
							<th>Видимость</th>
							<th></th>
						</tr>
					</thead>
					<tbody>
						{#each filtered as item (item._id)}
							<tr>
								<td>
									<div class="flex min-w-52 items-center gap-3">
										{#if item.images?.coverKey}
											<img
												src={mediaUrl(item.images?.coverKey)}
												class="size-11 rounded-md object-cover"
												alt=""
											/>
										{:else}
											<span class="grid size-11 place-items-center rounded-md bg-gray-200">
												<Image class="size-5.5 text-gray-500" />
											</span>
										{/if}

										<strong>{item.name}</strong>
									</div>
								</td>

								<td>{item.category?.name || '-'}</td>
								<td>
									<strong class="text-nowrap">{formatMoney(item.defaultPricePerHour)}р / час</strong
									>
								</td>
								<td>
									<span
										class={`whitespace-nowrap rounded-full px-2 py-1 text-[10px] font-bold ${['maintenance', 'archived'].includes(item.status) ? 'bg-yellow-100 text-orange-600' : 'bg-green-100 text-green-700'}`}
									>
										{statusLabels[item.status]}
									</span>
								</td>

								<td>
									<span
										class={`whitespace-nowrap text-[10px] font-bold ${item.isActive ? 'text-green-600' : 'text-gray-500'}`}
									>
										• {item.isActive ? 'Опубликовано' : 'Скрыто'}
									</span>
								</td>

								<td>
									<div class="flex gap-3">
										<button
											class="p-1.5 bg-gray-200/80 rounded-lg hover:opacity-50"
											on:click={() => 
                                                (editing = { ...item })
                                            }
										>
											<Pencil class="size-2.5" />
										</button>
										<button
											class="p-1.5 bg-red-500 text-white rounded-lg hover:opacity-50"
											on:click={() => remove(item)}
										>
											<Trash class="size-2.5" />
										</button>
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</div>
</section>


<!-- ВОПРОС: овшцшвшцовшоцшовц -->


{#if editing}
	<div class="fixed inset-0 z-50 grid place-items-center overflow-auto bg-gray-800/40 p-6">
		<section
			class="max-h-[calc(100vh-3rem] w-full max-w-3xl overflow-y-auto rounded-xl bg-white p-7 shadow-2xl"
		>
			<div class="mb-9 flex justify-between gap-5">
				<div>
					<span class="text-sm font-semibold tracking-[0.16rem] text-gray-800 uppercase">
						Редактирование
					</span>
					<h2 class="mt-2 text-2xl font-medium">
						{editing.name}
					</h2>
				</div>

				<button
					class="grid size-10 place-items-center rounded-full border border-gray-100 bg-white text-2xl"
					on:click={() => (editing = null)}
				>
					x
				</button>
			</div>

			<form
				class="[&_input]:w-full [&_input]:rounded-lg [&_input]:border [&_input]:border-gray-200 [&_input]:p-3 [&_input]:focus:border-blue-500 [&_select]:w-full [&_select]:rounded-lg [&_select]:border [&_select]:border-gray-200 [&_select]:bg-gray-100 [&_select]:p-3 [&_textarea]:w-full [&_textarea]:rounded-lg [&_textarea]:border [&_textarea]:border-gray-200 [&_textarea]:bg-gray-50 [&_textarea]:p-3"
				on:submit|preventDefault={save}
			>
				<!-- Форма категории -->
				<div class="grid grid-cols-2 gap-5 max-sm:grid-cols-1">
					<label class="flex flex-col gap-2">
						<span class="text-xs font-medium">Название</span>
						<input bind:value={editing.name} required minlength="4"/>
					</label>

					<label class="flex flex-col gap-2">
						<span class="text-xs font-medium">Описание</span>
						<textarea bind:value={editing.description} rows="4" required></textarea>
					</label>

                    <label class="flex flex-col gap-2">
						<span class="text-xs font-medium">Цена за час</span>
						<input type="number" bind:value={editing.defaultPricePerHour} required min="1"/>
					</label>

                    <label class="flex flex-col gap-2">
						<span class="text-xs font-medium">Цена за день</span>
						<input type="number" bind:value={editing.defaultPricePerDay} min="1"/>
					</label>

                    <label class="flex flex-col gap-2">
						<span class="text-xs font-medium">Залог</span>
						<input type="number" bind:value={editing.deposit} min="0"/>
					</label>

                    <label class="flex flex-col gap-2">
						<span class="text-xs font-medium">Пробег</span>
						<input type="number" bind:value={editing.mileage} required min="0"/>
					</label>

                    <label class="flex flex-col gap-2">
						<span class="text-xs font-medium">Серийный номер</span>
						<input bind:value={editing.serialNumber} minlength="8" required/>
					</label>

                    <label class="flex flex-col gap-2">
						<span class="text-xs font-medium">Статус</span>
						<select bind:value={editing.status}>
                            {#each Object.entries(statusLabels) as [value, label] (value)}
                                <select {value}>{label}</select>
                            {/each}
                        </select>
					</label>
                
                    <label class="flex min-h-11 gap-2">
						<input type="checkbox" class="size-[18px]! w-[18px]!" bind:checked={editing.isActive}>
						<span class="text-xs font-medium">Показывать объявление на сайте</span>
					</label>
				</div>

				<!-- <div class="mt-8 border-t border-gray-200 pt-6">
					<div class="mb-4">
						<h3 class="mb-1 font-display text-lg font-semibold">Характеристики категории</h3>
						<p class="m-0 text-xs text-gray-600">Выберите поля, которые появятся в форме объявления</p>
					</div>

					{#each attributes.filter((a) => !a.deprecated) as attr (attr._id)}
						<div class="flex min-h-14 items-center gap-3 border-tborder-gray-200 max-sm:flex-wrap max-sm:py-3">
							<label class="mr-auto flex min-w-56 items-center gap-2.5">
								<input 
									type="checkbox" 
									checked={setting(attr._id).enabled}
									on:change={(event) => toggle(attr._id, event.currentTarget.checked)}
								>
								<strong class="whitespace-nowrap">{attr.label}</strong>
								<code class="mt-1 block p-0 whitespace-nowrap text-[10px] text-gray-600">
									{attr.key}-{attr.type}
								</code>
							</label>


							{#if setting(attr._id).enabled}
								<label class="mr-auto flex min-w-56 items-center gap-2.5">
									<input 
										type="checkbox" 
										bind:checked={selected[attr._id].required}
									>	
									Обязательное
								</label>

								{#if attr.type === "number"}
									<input type="number" placeholder="min" bind:value={selected[attr._id].min} class="w-16 rounded-md border border-gray-200 p-2 text-[11px]">
									<input type="number" placeholder="max" bind:value={selected[attr._id].max} class="w-16 rounded-md border border-gray-200 p-2 text-[11px]">
								{/if}
							{/if}
						</div>
					{/each}
				</div> -->

				{#if error}
					<div
						class="my-5 rounded-lg border border-red-500 bg-red-500 text-white px-4 py-2.5 text-sm"
					>
						{error}
					</div>
				{/if}

				<div class="mt-7 flex justify-end items-center gap-2.5">
					<button
						type="button"
						class="min-h-11 rounded-lg bg-gray-100 px-5 font-medium"
						on:click={() => (editing = null)}
					>
						Отмена
					</button>

					<button
						type="submit"
						class="min-h-11 rounded-lg bg-gray-800 text-white px-5 font-medium"
						disabled={saving}
					>
						{saving ? 'Сохраняем....' : 'Сохранить'}
					</button>
				</div>
			</form>
		</section>
	</div>
{/if}
