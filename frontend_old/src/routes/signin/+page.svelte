<script>
	import { goto } from '$app/navigation';
	import { signIn } from '$lib/api/auth';

	let email = '';
	let password = '';
	let isSubmitting = false;
	let errorMessage = '';

	async function handleSubmit() {
		errorMessage = '';
		isSubmitting = true;

		try {
			await signIn(email, password);
			goto('/');
		} catch (e) {
			errorMessage = e.message || 'Не удалось войти';
		} finally {
			isSubmitting = false;
		}
	}
</script>

<svelte:head>
	<title>Вход</title>
</svelte:head>

<div class="flex items-center justify-center min-h-screen w-full">
	<form
		on:submit|preventDefault={handleSubmit}
		class="w-sm mx-auto mx p-4 bg-white border border-gray-100 rounded-xl shadow-sm"
	>
		<h1 class="text-xl font-semibold text-gray-900 mb-6 text-center">Вход</h1>

		<div class="mb-4">
			<label for="block mb-4">
				<span class="block text-sm text-gray-500 mb-1">Email</span>
				<input
					type="email"
					bind:value={email}
					required
					autocomplete="email"
					class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
				/>
			</label>
		</div>

		<div class="mb-4">
			<label for="block">
				<span class="block text-sm text-gray-500 mb-1">Пароль</span>
				<input
					type="password"
					bind:value={password}
					required
					minlength="6"
					autocomplete="current-password"
					class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
				/>
			</label>
		</div>

		{#if errorMessage}
			<p class="text-sm text-red-500 mb-4">{errorMessage}</p>
		{/if}

		<button
			type="submit"
			disabled={isSubmitting}
			class="w-full mt-12 rounded-md bg-blue-500 text-white font-medium py-2.5 hover:bg-blue-500/75 disabled:opacity-60 disabled:cursor-default transition-colors"
		>
			{isSubmitting ? 'Входим...' : 'Войти'}
		</button>

		<p class="text-sm text-gray-600 text-center mt-6">
			Нет аккаунта? <a href="/signup" class="text-blue-500 hover:underline">Создать</a>
		</p>
	</form>
</div>
<!-- <script>
	import axios from 'axios';
	import { goto } from '$app/navigation';
	import IconYandex from '~icons/gravity-ui/logo-yandex';
	import { Eye, EyeOff, Mail, LockKeyhole } from '@lucide/svelte';

	let email = '';
	let password = '';
	let errorMessage = '';
	let isLoading = false;
	let isPassHidden = true;

	async function handleSubmit() {
		errorMessage = '';
		isLoading = true;

		try {
			const response = await axios.post(
				'/api/auth/signin',
				{ email, password },
				{
					headers: {
						'Content-Type': 'application/json'
					}
				}
			);

			if (response.data) {
				console.log(response.data);
			}
		} catch (e) {
			errorMessage = e?.response?.data?.message || "Internal server error";
		} finally {
			isLoading = false;
		}
	}

	function isFormFilled() {
		return password && email;
	}
</script>

<div class="min-h-screen bg-gray-950 flex items-center justify-center">
	<div
		class="relative border-3 border-purple-800 rounded-4xl
               w-full max-w-[360px] p-8"
	>
		<h1 class="mb-8 text-center font-semibold text-2xl text-gray-200 tracking-wide">Sign in</h1>

		<form
			on:submit|preventDefault={handleSubmit}
			class=" flex flex-col justify-center items-center"
		>
			<div class="flex flex-col gap-4 w-full">
				<div class="relative">
					<Mail class="absolute size-5 left-4 top-2.5 text-purple-300" />
					<input
						id="email"
						type="text"
						bind:value={email}
						class="rounded-3xl
                    	text-gray-300 text-sm
                        pl-11 pr-3 py-2 outline-none w-full
                        border-2 border-purple-800
                        placeholder-gray-500 duration-200"
						placeholder="Email"
						disabled={isLoading ? true : false}
					/>
				</div>

				<div class="relative">
					<div class="w-full">
						<LockKeyhole class="absolute size-5 left-4 top-2.5 text-purple-300" />
						<input
							id="password"
							type={isPassHidden ? 'password' : 'text'}
							bind:value={password}
							class="rounded-3xl
                    	text-gray-300 text-sm
                        pl-11 pr-9 py-2 outline-none w-full
                        border-2 border-purple-800
                        placeholder-gray-500 duration-200"
							placeholder="Password"
							disabled={isLoading ? true : false}
						/>

						<button
							type="button"
							class="cursor-pointer text-purple-300"
							on:click={() => (isPassHidden = !isPassHidden)}
						>
							{#if isPassHidden}
								<EyeOff class="absolute right-3 top-2.5 size-5" />
							{:else}
								<Eye class="absolute right-3 top-2.5 size-5" />
							{/if}
						</button>
					</div>
				</div>
			</div>

			<button
				type="submit"
				disabled={!isFormFilled() || isLoading}
				class={`py-1.5 w-[12rem] mt-8 mb-4
                       ${isLoading || !isFormFilled() ? 'bg-purple-800 opacity-50 cursor-not-allowed' : 'bg-purple-700 cursor-pointer'}  hover:bg-purple-800 
                       text-gray-200 font-semibold text-lg tracking-wide
                       rounded-3xl
                       flex items-center justify-center gap-3
                       duration-200`}
			>
				{#if isLoading}
					<div
						class="size-4 border-t-3 border-t-gray-200 border-3 border-purple-500 rounded-full animate-spin"
					></div>
					Signin in...
				{:else}
					Sign in
				{/if}
			</button>

			<span class="flex items-center gap-1 text-gray-300 mb-4">
				<p class="w-12 border-t border-gray-300/50"></p>
				<p class="pb-1 font-medium">or</p>
				<p class="w-12 border-t border-gray-300/50"></p>
			</span>

			<button
				class="w-[12rem] flex items-center justify-center gap-2 py-2 border-2 border-purple-700 rounded-3xl hover:bg-purple-700 transition-colors duration-200 cursor-pointer"
				type="button"
			>
				<IconYandex class="size-6" style="color: #fc3f1d;" />
				<span class="text-sm font-medium text-gray-300">Sign in with Yandex</span>
			</button>

			<p
				class="rounded-3xl text-red-800 text-sm px-3 py-2 my-8 w-full border-2"
				class:border-red-800={errorMessage}
				class:border-transparent={!errorMessage}
				class:visible={errorMessage}
				class:invisible={!errorMessage}
			>
				{errorMessage || 'Error Message'}
			</p>

			<span class="text-purple-300 text-xs font-medium flex gap-2 mb-3">
				<p class="">Forgot password ?</p>
				<button
					class="underline cursor-pointer text-purple-500 hover:text-purple-600 font-medium duration-200"
					on:click={() => (errorMessage = 'Internal server error')}>Recover</button
				>
			</span>

			<span class="text-purple-300 text-xs font-medium flex gap-2">
				<p class="">Don't have an account ?</p>
				<button
					class="underline cursor-pointer text-purple-500 hover:text-purple-600 font-medium duration-200"
					on:click={() => goto('/signup')}>Create now</button
				>
			</span>
		</form>
	</div>
</div> -->
