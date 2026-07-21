<script>
	import { goto } from '$app/navigation';
	import { signUp } from '$lib/api/auth';

	const PHONE_RE = /^\+?[1-9]\d{10,14}$/;
	const EMAIL_RE = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

	let name = '';
	let email = '';
	let password = '';
	let repeatedPassword = '';
	let phone = '';
	let address = {
		country: '',
		city: '',
		street: ''
	};

	let isSubmitting = false;
	let errorMessage = '';

	function isFormFilledValid() {
		return !(
			!name ||
			!email ||
			!EMAIL_RE.test(email) ||
			!address.country ||
			!address.city ||
			password.length < 6 ||
			!repeatedPassword ||
			password !== repeatedPassword ||
			(phone && !PHONE_RE.test(phone))
		);
        return true
	}

	async function handleSubmit() {
		errorMessage = '';
		isSubmitting = true;

		try {
			await signUp({
				name,
				email,
				...(phone ? { phone } : {}),
				password,
				address
			});
            goto('/');
		} catch (e) {
            console.log(e)
            errorMessage = e.details ? e.details[0] : e.message ? e.message : 'Failed to register';
		} finally {
			isSubmitting = false;
		}
	}
</script>

<svelte:head>
	<title>Sign up</title>
</svelte:head>

<div class="flex items-center justify-center min-h-screen w-full">
	<form
		on:submit|preventDefault={handleSubmit}
		class="w-sm mx-auto mx p-4 bg-white border border-gray-100 rounded-xl shadow-sm"
	>
		<h1 class="text-xl font-semibold text-gray-900 mb-6 text-center">Sign up</h1>

		<div class="mb-4">
			<label for="block mb-4">
				<span class="block text-sm text-gray-500 mb-1">Name (required)</span>
				<input
					type="text"
					bind:value={name}
					required
					class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
				/>
			</label>
		</div>
		<div class="mb-4">
			<label for="block mb-4">
				<span class="block text-sm text-gray-500 mb-1">E-mail (required)</span>
				<input
					type="email"
					bind:value={email}
					required
					class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
				/>
			</label>
		</div>
		<div class="mb-4">
			<label for="block mb-4">
				<span class="block text-sm text-gray-500 mb-1">Phone (optional)</span>
				<input
					type="text"
					bind:value={phone}
					class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
				/>
			</label>
		</div>
		<div class="mb-4">
			<label for="block mb-4">
				<span class="block text-sm text-gray-500 mb-1">Country (required)</span>
				<input
					type="text"
					bind:value={address.country}
					required
					class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
				/>
			</label>
		</div>
		<div class="mb-4">
			<label for="block mb-4">
				<span class="block text-sm text-gray-500 mb-1">City (required)</span>
				<input
					type="text"
					bind:value={address.city}
					required
					class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
				/>
			</label>
		</div>
		<div class="mb-4">
			<label for="block mb-4">
				<span class="block text-sm text-gray-500 mb-1">Street (optional)</span>
				<input
					type="text"
					bind:value={address.street}
					class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
				/>
			</label>
		</div>

		<div class="mb-4">
			<label for="block">
				<span class="block text-sm text-gray-500 mb-1">Password (required)</span>
				<input
					type="password"
					bind:value={password}
					required
					minlength="6"
					class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
				/>
			</label>
		</div>
		<div class="mb-4">
			<label for="block">
				<span class="block text-sm text-gray-500 mb-1">Repeat password (required)</span>
				<input
					type="password"
					bind:value={repeatedPassword}
					required
					minlength="6"
					class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
				/>
			</label>
		</div>

		{#if errorMessage}
			<p class="text-sm text-red-500 mb-4">{errorMessage}</p>
		{/if}

		<button
			type="submit"
			disabled={isSubmitting || !isFormFilledValid()}
			class={`w-full mt-12 rounded-md bg-blue-500 text-white font-medium py-2.5 hover:bg-blue-500/75 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-blue-500 transition-colors cursor-pointer`}
		>
			{isSubmitting ? 'Singin up...' : 'Sign up'}
		</button>

		<!-- <p class="text-sm text-gray-600 text-center mt-6">
			Нет аккаунта? <a href="/signup" class="text-blue-500 hover:underline">Создать</a>
		</p> -->
	</form>
</div>
