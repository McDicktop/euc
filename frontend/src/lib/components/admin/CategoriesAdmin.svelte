<script>
	import { onMount } from 'svelte';
	import { api, json } from '$lib/api';
	import { Plus } from '@lucide/svelte';

	let categories = [];
	let attributes = [];
	let form = null;
	let selected = {};
	let error = '';
	let loading = true;
	let saving = false;

	async function load() {
		loading = true;

		try {
			[categories, attributes] = await Promise.all([
				api('/api/categories'),
				api('/api/attributes')
			]);
		} catch (err) {
			error = err.message;
		} finally {
			loading = false;
		}
	}

	async function edit(item) {
		error = '';

		try {
			const full = await api(`/api/categories/${item._id}`);
			form = { ...full, parent: full.parent?._id || full.parent || '' };
			selected = {};

			for (const entry of full.attributes || []) {
				selected[entry.attribute._id] = {
					enabled: true,
					required: entry.required,
					min: entry.min || '',
					max: entry.max || ''
				};
			}
		} catch (err) {
			error = err.message;
		}
	}

	function create() {
		form = { name: '', slug: '', parent: '', isActive: true };
		selected = {};
	}




	function setting(id) {
		if(!selected[id]) {
			selected[id] = {
				enabled: false,
				required: false,
				min: "",
				max: ""
			}
		}

		return selected[id]
	}


	// selected = {
	// 	10901902901934908: {
	// 		enabled: false,
	// 		required: false,
	// 		min: "",
	// 		max: ""
	// 	},
	// }

	function toggle(id, checked) {
		selected = { ...selected, [id]: { ...setting(id), enabled: checked}}
	}

	async function save() {
		saving = true;
		error = '';

		try {
			const configured = attributes
				.filter((a) => selected[a._id]?.enabled)
				.map((a, order) => ({
					attribute: a._id,
					required: Boolean(selected[a._id].required),
					min: selected[a._id].min === '' ? null : Number(selected[a._id].min),
					max: selected[a._id].max === '' ? null : Number(selected[a._id].max),
					order
				}));

			const body = {
				name: form.name,
				slug: form.slug || undefined,
				parent: form.parent || null,
				isActive: form.isActive,
				attributes: configured
			};

			await api(
				form._id ? `/api/categories/${form._id}` : '/api/categories',
				json(form._id ? 'PATCH' : 'POST', body)
			);

			form = null;
			await load();
		} catch (e) {
			error = e.message;
		} finally {
			saving = false;
		}
	}

	async function remove(item) {
		if (!confirm(`Удалить категорию "${item.name}"?`)) return;

		try {
			await api(`/api/categories/${item._id}`, {
				method: 'DELETE'
			});
		} catch (e) {
			error = e.message;
		}
	}

	onMount(load);
</script>

<section class="px-[4vw] pt-9 pb-20 max-sm:px-4 max-sm:pt-6">
	<div class="mb-5 flex min-h-11 items-center justify-between">
		<p class="m-0 text-xs text-gray-700">
			{categories.length} категорий в каталоге
		</p>

		<button
			class="min-h-10 flex items-center gap-2 rounded-xl bg-gray-800 text-white px-5 font-bold"
			on:click={create}
		>
			<Plus class="size-3.5" />
			Новая категория
		</button>
	</div>

	{#if error}
		<div
			class="my-5 rounded-lg border border-red-500 bg-red-500 text-white px-4 py-2.5 text-sm text-white"
		>
			{error}
		</div>
	{/if}

	{#if loading}
		<div class="my-12 text-center text-gray-500 text-sm">Загрузка категорий...</div>
	{/if}

	<div class="grid grid-cols-3 gap-5 max-lg:grid-cols-2 max-sm:grid-cols-1">
		{#each categories as item (item._id)}
			<article class="flex flex-col gap-7 rounded-xl border border-gray-200 bg-gray-100 p-6">
				<div class="">
					<span class="text-[10px] tracking-[.1em] uppercase">
						{item.isActive ? 'Активна' : 'Скрыта'}
					</span>
					<h3 class="my-2 text-base font-medium">
						{item.name}
					</h3>
					<code class="rounded bg-gray-200 px-2 py-1 text-[10px]">/{item.slug}</code>
					<p class="text-[11px] mb-0 mt-4 text-gray-800">
						{item.attributes?.length || 0} характеристик
					</p>
				</div>

				<div
					class="flex gap-3 items-center justify-end [&_button]:border [&_button]:border-gray-300 [&_button]:bg-gray-200 [&_button]:rounded-xl [&_button]:px-3 [&_button]:py-1.5 [&_button]:text-[11px]"
				>
					<button on:click={() => edit(item)}>Изменить</button>
					<button on:click={() => remove(item)}>Удалить</button>
				</div>
			</article>
		{/each}
	</div>
</section>

{#if form}
	<div class="fixed inset-0 z-50 grid place-items-center overflow-auto bg-gray-800/40 p-6">
		<section
			class="max-h-[calc(100vh-3rem] w-full max-w-3xl overflow-y-auto rounded-xl bg-white p-7 shadow-2xl"
		>
			<div class="mb-9 flex justify-between gap-5">
				<div>
					<span class="text-sm font-semibold tracking-[0.16rem] text-gray-800 uppercase">
						{form._id ? 'Редактивароние категории' : 'Создание категории'}
					</span>
					<h2 class="mt-2 text-2xl font-medium">
						{form.name || 'Без названия'}
					</h2>
				</div>

				<button
					class="grid size-10 place-items-center rounded-full border border-gray-100 bg-white text-2xl"
					on:click={() => (form = null)}
				>
					x
				</button>
			</div>

			<form
				class="[&_input]:w-full [&_input]:rounded-lg [&_input]:border [&_input]:border-gray-200 [&_input]:p-3 [&_input]:focus:border-blue-500 [&_select]:w-full [&_select]:rounded-lg [&_select]:border [&_select]:border-gray-200 [&_select]:bg-gray-100 [&_select]:p-3"
				on:submit|preventDefault={save}
			>
				<!-- Форма категории -->
				<div class="grid grid-cols-2 gap-5 max-sm:grid-cols-1">
					<label class="flex flex-col gap-2">
						<span class="text-xs font-medium">Название</span>
						<input bind:value={form.name} required />
					</label>

					<label class="flex flex-col gap-2">
						<span class="text-xs font-medium">Slug</span>
						<input bind:value={form.slug} placeholder="e-scooter.." />
					</label>

					<label class="flex flex-col gap-2">
						<span class="text-xs font-medium">Родительская категория</span>
						<select bind:value={form.parent}>
							<option value="">Без родителя</option>
							{#each categories.filter((c) => c._id !== form._id) as category (category._id)}
								<option value={category._id}>{category.name}</option>
							{/each}
						</select>
					</label>

					<label class="flex min-h-11 gap-2">
						<input type="checkbox" class="size-[18px]! w-[18px]!" bind:checked={form.isActive} />
						<span class="text-xs font-medium">Категория активна</span>
					</label>
				</div>

				<div class="mt-8 border-t border-gray-200 pt-6">
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
				</div>

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
						{saving ? 'Сохраняем....' : 'Сохранить'}
					</button>
				</div>
			</form>
		</section>
	</div>
{/if}
