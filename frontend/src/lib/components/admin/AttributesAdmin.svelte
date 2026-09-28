<script>
	import { onMount } from 'svelte';
	import { api, json } from '$lib/api';
	import { Pencil, Trash } from '@lucide/svelte';

	const blank = {
		key: '',
		label: '',
		type: '',
		unit: '',
		optionsText: '',
		min: '',
		max: '',
		filterable: false,
		deprecated: false
	};

	const typeLabels = {
		string: 'Текст',
		number: 'Число',
		boolean: 'Да / Нет',
		enum: 'Один вариант',
		multi_enum: 'Несколько вариантов'
	};

	let items = [];
	let form = null;
	let error = '';
	let loading = true;
	let saving = false;

	async function load() {
		loading = true;
		try {
			items = await api('/api/attributes');
		} catch (err) {
			error = err.message;
		} finally {
			loading = false;
		}
	}

	function edit(item) {
		form = {
			...item,
			optionsText: (item.options || []).join(', '),
			unit: item.unit || '',
			min: item.min || '',
			max: item.max || ''
		};
	}

	async function save() {
        saving = true;
        error = "";

        try {
            const body = {
                key: form.key,
                label: form.label,
                type: form.type,
                unit: form.unit,
                filterable: form.filterable,
                deprecated: form.deprecated,
            }

            if(form.min !== "") body.min = Number(form.min);
            if(form.max !== "") body.max = Number(form.max);
            if(["enum", "multi_enum"].includes(form.type)) {
                body.options = form.optionsText.split(",").map(v => v.trim()).filter(Boolean);
            }

            await api(form._id ? `/api/attributes/${form._id}` : '/api/attributes', json(form._id ? "PATCH" : "POST", body))

            form = null;
            await load();

        } catch (e) {
            error = e.message;
        } finally {
            saving = false;
        }
    }

	async function remove(item) {
		if (!confirm(`Удалить атрибут "${item.label}"?`)) return;

		try {
			await api(`/api/attributes/${item._id}`, {
				method: 'DELETE'
			});
			await load();
		} catch (e) {
			error = e.message;
		}
	}

	onMount(load);
</script>

<section class="px-[4vw] pt-9 pb-20 max-sm:px-4 max-sm:pt-6">
	<div class="mb-5 flex min-h-11 items-center justify-between">
		<div>
			<p class="m-0 text-xs text-gray-800">
				{items.length} характеристик
			</p>
		</div>
		<button
			class="inline-flex min-h-11 items-center rounded-lg px-5 font-medium"
			on:click={() => (form = { ...blank })}
		>
			+ Новый атрибут
		</button>
	</div>

	{#if error}
		<div class="my-5 rounded-lg border border-red-500 bg-red-500 px-4 py-3 text-sm text-white">
			{error || 'Ошибка'}
		</div>
	{/if}

	{#if loading}
		<div class="p-9 text-center text-gray-400">Загрузка атрибутов...</div>
	{:else}
		<div class="overflow-x-auto">
			<table class="w-full border-collapse text-xs [&_th]:bg-gray-50 [&_th]:px-5 [&_th]:py-2 [&_th]:text-left [&_th]:text-[11px] [&_th]:uppercase [&_td]:border-t [&_td]:border-gray-200 [&_td]:px-5 [&_td]:py-2">
				<thead>
					<tr>
						<th>Название</th>
						<th>Ключ</th>
						<th>Тип</th>
						<th>Ограничения</th>
						<th>Фильтр</th>
						<th></th>
					</tr>
				</thead>

				<tbody>
					{#each items as item (item._id)}
						<tr class:opacity-55={item.deprecated}>
							<td class="flex gap-1">
								<strong>{item.label}</strong>
								{#if item.unit}
									<small class="mt-1 block text-gray-700">({item.unit})</small>
								{/if}
							</td>
							<td>
								<code class="rounded bg-gray-100 px-1.5 py-1 text-[11px]">
									{item.key}
								</code>
							</td>

							<td>{typeLabels[item.type]}</td>

						

							<td
								>{item.options?.join(',') ||
									([item.min, item.max].some((v) => v !== null)
										? `${item.min ?? '...'} - ${item.max ?? '...'}`
										: '-')}</td
							>

							<td>{item.filterable ? 'Да' : 'Нет'}</td>

							<td>
								<div class="flex gap-3">
									<button
										class="p-1.5 bg-gray-200/80 rounded-lg hover:opacity-50"
										on:click={() => edit(item)}
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
</section>

{#if form}
	<div class="fixed inset-0 z-50 grid place-items-center overflow-auto bg-gray-800/40 p-6">
		<section
			class="max-h-[calc(100vh-3rem] w-full max-w-3xl overflow-y-auto rounded-xl bg-white p-7 shadow-2xl"
		>
			<div class="mb-9 flex justify-between gap-5">
				<div>
					<span class="text-sm font-semibold tracking-[0.16rem] text-gray-800 uppercase">
						{form._id ? 'Редактивароние' : 'Создание'}
					</span>
					<h2 class="mt-2 text-2xl font-medium">
						{form._id ? form.label : 'Новый атрибут'}
					</h2>
				</div>

				<button
					class="grid size-10 place-items-center rounded-full border border-gray-100 bg-white text-2xl"
				>
					x
				</button>
			</div>

			<form class="" on:submit|preventDefault={save}>
				<!-- Форма атрибута -->

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
						on:click={() => (form = null)}
					>
						Отмена
					</button>

                    <button
						type="submit"
						class="min-h-11 rounded-lg bg-gray-800 text-white px-5 font-medium"
                        disabled={saving}
					>
						{saving ? "Сохраняем...." : "Сохранить"}
					</button>
				</div>
			</form>
		</section>
	</div>
{/if}
