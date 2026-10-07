<script>
	import { goto } from '$app/navigation';
	import { auth } from '$lib/stores/auth';
	import { apiJson } from '$lib/api/http';

	const cats = ['e-bike', 'e-scooter', 'euc'];

	let errorMessage = '';
	let isSubmitting = false;

	let name = '';
	let category = '';
	
	let file = null;
	let previewUrl = '';

	const MAX_SIZE = 3 * 1024 * 1024;
	const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

	function handleFileChange(e) {
		const selected = e.target.files?.[0];

		errorMessage = '';
		file = null;
		previewUrl = '';

		if(!selected) return;

		if(!ALLOWED_TYPES.includes(selected.type)) {
			errorMessage = 'Допустимые форматы: jpef, png, webp';
			e.target.value = '';
			return;
		}

		if(selected.size > MAX_SIZE) {
			errorMessage = 'Файл слишком большой. Максимум 3 МБ';
			e.target.value = '';
			return;
		}

		file = selected;
		previewUrl = URL.createObjectURL(selected)
	}

	$: isFormValid = name.trim() !== '' && category !== '' && file !== null;

	async function handleSubmit() {
		if(!isFormValid) return;

		errorMessage = '';
		isSubmitting = true;

		try {
			const formData = new FormData();

			formData.append('name', name);
			formData.append('category', category);
			formData.append('userId', $auth.user._id);
			formData.append('file', file);

			const data = await apiJson('/api/pmv', {
				method: 'POST',
				body: formData
			})

			goto('/');

		} catch (e) {
			console.log(e);
			errorMessage = 'Ошибка сети, попробуйте еще раз';
		} finally {
			isSubmitting = false;
		}
	}
</script>

<svelte:head>
	<title>AddPmv</title>
</svelte:head>

<div class="flex items-center justify-center min-h-screen w-full">
	<form
		on:submit|preventDefault={handleSubmit}
		class="w-sm mx-auto mx p-4 bg-white border border-gray-100 rounded-xl shadow-sm"
	>
		<h1 class="text-xl font-semibold text-gray-900 mb-6 text-center">Add new PMV</h1>

		<div class="mb-4">
			<label for="block mb-4">
				<span class="block text-sm text-gray-500 mb-1">Name</span>
				<input
					type="text"
					bind:value={name}
					required
					class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
				/>
			</label>
		</div>

		<div class="mb-4">
			<label class="block mb-4">
				<span class="block text-sm text-gray-500 mb-1">Category</span>
				<!-- <input
					type="text"
					bind:value={category}
					required
					class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
				/> -->

				<select
					bind:value={category}
					class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
				>
					<option value="" disabled selected>Choose a category</option>
					{#each cats as cat}
						<option value={cat}>{cat}</option>
					{/each}
				</select>
			</label>
		</div>

		<div class="mb-4">
			<label class="block mb-4" for="select_image">
				<span class="block text-sm text-gray-500 mb-1">Choose cover image</span>

				{#if previewUrl}
					<img src={previewUrl} alt="preview" class="w-full h-40 object-cover rounded-md mb-2">
				{/if}
				
				<input
					type="file"
					accept="image/jpeg,image/png,image/webp"
					on:change={handleFileChange}
					required
					id="select_image"
					class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
				/>
			</label>
		</div>




		{#if errorMessage}
			<p class="text-sm text-red-500 mb-4">{errorMessage}</p>
		{/if}

		<button type="submit" disabled={!isFormValid || isSubmitting} class="w-full mt-12 rounded-md bg-blue-500 text-white font-medium py-2.5 hover:bg-blue-500/75 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-blue-500 transtions-colors cursor-pointer">
			{isSubmitting ? 'loading...' : 'Submit'}
		</button>
	</form>
</div>
