<script>
	import { api } from '$lib/api';

	export let categories = [];
	export let onCreated = () => {};
	export let onCancel = () => {};

	const empty = {
		name: '',
		description: '',
		category: '',
		defaultPricePerHour: '',
		defaultPricePerDay: '',
		deposit: '',
		serialNumber: '',
		mileage: 0
	};

	let form = { ...empty };
	let category = null;
	let details = {};
	let files = [];
	let loadingCategory = false;
	let submitting = false;
	let error = '';

    async function selectCategory(event) {
        category = null;
        details = {};

        if(!form.category) return;

        loadingCategory = true;

        try {
            category = await api(`/api/categories/slug/${form.category}`);
        } catch(err) {
            error = err.message;
        } finally {
            loadingCategory = false;
        }
    }

    function updateFiles(event) {
        files = Array.from(event.target.files || []);

        if(files.some((file) => file.size > 3 * 1024 * 1024)) {
            error = "Каждое фото должно быть не больше 3 МБ"
        } else {
            error = "";
        }
    }

    function normalizeDetail(attr, value) {
        if(attr.value === "number") {
            return value === "" ? undefined : Number(value);
        }
        if(attr.value === "boolean") {
            return Boolean(value);
        }
        if(attr.value === "multi_enum") {
            return value || [];
        }

        return value === "" ? undefined : value;
    }

    async function submit() {
        error = "";

        if(!files.length) {
            error = "Добавьте хотя бы 1 файл";
            return;
        }
        if(files.some((file) => file.size > 3 * 1024 * 1024)) return;

        submitting = true;

        try {
            const payload = new FormData();
            const slug = `listing-${Date.now().toString(36)}`;
            payload.set('slug', slug);
            payload.set('name', form.name);
            payload.set('description', form.description);
            payload.set('category', category._id);
            payload.set('defaultPricePerHour', form.defaultPricePerHour);
            if(form.defaultPricePerDay !== "") {
                payload.set('defaultPricePerDay', form.defaultPricePerDay);
            }
            if(form.deposit !== "") {
                payload.set('deposit', form.deposit);
            }
            
            payload.set('serialNumber', form.serialNumber);
            payload.set('mileage', form.mileage);
            payload.set('isActive', "true");
            payload.set('status', "available");
            payload.set('userId', "6a5348463641d97dc24e72c3");

            const cleanDetails = {};
            for( const item of categories.attributes || []) {
                const attr = item.attribute;
                const value = normalizeDetail(
                    attribute,
                    details[attr.key]
                );

                if(value !== undefined) cleanDetails[attr.key] = value;
            }

            payload.set('details', JSON.stringify(cleanDetails));

            files.forEach((file) => payload.append("images", file, file.name));

            await api("/api/pmvs", {method: "POST", body: payload});

            form = {...empty};
            category = null;
            details = {};
            files = [];
            await onCreated();

        } catch (e) {
            error = e.message;
        } finally {
            submitting = false;
        }
    }
</script>

<div class="fixed inset-0 z-50 w-screen h-screen bg-gray-50/10 backdrop-blur-sm px-[5vw]">
	<div
		class="max-w-[1440px] p-4 rounded-2xl border border-gray-100 bg-white shadow-xl relative top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
	>
		<div class="mb-9 flex flex-col justify-between gap-2">
			<h2 class="text-sm font-bold tracking-[0.16em] text-gray-800 uppercase">Новое объявление</h2>
			<span class="text-xs font-medium text-gray-700"
				>Заполните основные данные - характеристики появятся после выбора категории</span
			>
		</div>

		<button
			class="grid size-10 shrink-0 absolute top-2 right-2 text-black font-bold rounded-full"
			type="button"
			onclick={async () => {
                form = {...empty};
                await onCancel();
            }}
			aria-label="Закрыть"
		>
			X
		</button>

		<form
			onsubmit={(event) => {
				event.preventDefault();
				submit();
			}}
			class="[&_input]:w-full [&_input]:rounded-lg [&_input]:border [&_input]:border-gray-200 [&_input]:bg-gray-50 [&_input]:px-3.5 [&_input]:py-2 [&_input]:outline-none [&_input]:focus:ring-2 [&_input]:focus:ring-gray-300 [&_select]:w-full [&_select]:rounded-lg [&_select]:border [&_select]:border-gray-200 [&_select]:bg-gray-50 [&_select]:px-3.5 [&_select]:py-2 [&_textarea]:w-full [&_textarea]:rounded-lg [&_textarea]:border [&_textarea]:border-gray-200 [&_textarea]:bg-gray-50 [&_textarea]:px-3.5 [&_textarea]:py-2"
		>
			<div class="grid grid-cols-2 gap-5 max-sm:grid-cols-1">
				<label for="col-span-2 flex flex-col gap-2 max-sm:col-span-1">
					<span class="text-xs font-semibold">Название</span>
					<input
						bind:value={form.name}
						minlength="4"
						maxlength="100"
						placeholder="Например, Inmotion"
						required
					/>
				</label>
				<label for="flex flex-col gap-2">
					<span class="text-xs font-semibold">Категория</span>
					<select bind:value={form.category} onchange={selectCategory} required>
						<option value="">Выберите категорию</option>
						{#each categories.filter((el) => el.isActive) as item (item._id)}
							<option value={item.slug}>{item.name}</option>
						{/each}
					</select>
				</label>
				<label for="col-span-2 flex flex-col gap-2 max-sm:col-span-1">
					<span class="text-xs font-semibold">Серийный номер</span>
					<input
						bind:value={form.serialNumber}
						minlength="8"
						maxlength="32"
						placeholder="SN-12345678"
						required
					/>
				</label>
				<label for="col-span-2 flex flex-col gap-2 max-sm:col-span-1">
					<span class="text-xs font-semibold">Описание</span>
					<textarea
						bind:value={form.description}
						maxlength="2000"
						rows="4"
						placeholder="Состояние, колмлектация, особенности..."
						required></textarea>
				</label>

				<label for="col-span-2 flex flex-col gap-2 max-sm:col-span-1">
					<span class="text-xs font-semibold">Цена за час</span>
					<input bind:value={form.defaultPricePerHour} type="number" min="1" max="3000" required />
				</label>

				<label for="col-span-2 flex flex-col gap-2 max-sm:col-span-1">
					<span class="text-xs font-semibold">Цена за день</span>
					<input bind:value={form.defaultPricePerDay} type="number" min="1" max="30000" />
				</label>

				<label for="col-span-2 flex flex-col gap-2 max-sm:col-span-1">
					<span class="text-xs font-semibold">Залог</span>
					<input bind:value={form.deposit} type="number" min="0" max="500000" />
				</label>

				<label for="col-span-2 flex flex-col gap-2 max-sm:col-span-1">
					<span class="text-xs font-semibold">Пробег, км</span>
					<input bind:value={form.mileage} type="number" min="0" max="500000" required />
				</label>
			</div>

			{#if loadingCategory}
				<div class="p-9 text-center">Загрузка характеристик...</div>
			{:else if category?.attributes?.length}
				<div class="mt-10 border-t border-gray-100 pt-8">
					{#each category.attributes as item (item.attribute._id)}
						{@const attr = item.attribute}
						<label
							class={`flex gap-2 ${attr.type === 'boolean' ? 'min-h-10 flex-row items-center' : 'flex-col'}`}
						>
							{#if attr.type === 'boolean'}
								<input
									class="size-[18px]! w-[18px]! accent-gray"
									type="checkbox"
									bind:checked={details[attr.key]}
								/>
								<span class="text-xs font-semibold">{attr.label}</span>
							{:else}
								<span class="text-xs font-semibold">
									{attr.label}{item.required ? ' *' : ''}{attr.unit ? `, ${attr.unit}` : ''}
								</span>

								{#if attr.type === 'enum'}
									<select bind:value={details[attr.key]} required={item.required}>
										<option value="">Не выбрано</option>
										{#each attr.options || [] as option}
											<option value={option}>{option}</option>
										{/each}
									</select>
								{:else if attr.type === 'multi_enum'}
									<select multiple bind:value={details[attr.key]} required={item.required}>
										{#each attr.options || [] as option}
											<option value={option}>{option}</option>
										{/each}
									</select>
								{:else}
									<input
										bind:value={details[attr.key]}
										type={attr.type === 'number' ? 'number' : 'text'}
										min={item.min ?? attr.min ?? undefined}
										max={item.max ?? attr.max ?? undefined}
										required={item.required}
									/>
								{/if}
							{/if}
						</label>
					{/each}
				</div>
			{/if}

            <!-- Фотки  -->

            <label class="mt-8 flex min-h-36 cursor-pointer flex-col items-center justify-center gap-2">
                <input type="file" multiple accept="image/png,image/webp,image/jpeg" onchange={updateFiles}>
                <strong>{files.length ? `Выбрано фото: ${files.length}` : "Добавьте фотографии"}</strong>
                <small>JPEG, PNG или WEBP / до 5 файлов / не более 3 МБ каждый</small>
            </label>

            <!-- Отправка или ошибка  -->

            {#if error}
                <div class="my-5 rounded-xl border border-red-500 bg-red-500 text-white"></div>
            {/if}

            <div class="mt-7 flex justify-end gap-2.5">
                <button 
                    class="inline-flex min-h-10 items-center rounded-xl border border-gray-100 bg-white px-5 font-bold text-gray-900"
                    onclick={onCancel}
                    type="button"
                >
                    Отмена
                </button>

                <button 
                    class="inline-flex min-h-10 items-center rounded-xl bg-gray-800 text-white px-5 font-bold disabled:cursor-not-allowed disabled:opacity-55"
                    type="submit"
                    disabled={submitting || !category}
                >
                    {submitting ? "Создаем..." : "Опубликовать объявление"}
                </button>
            </div>
		</form>
	</div>
</div>
