<script>
	import { onMount } from 'svelte';
	import { page } from '$app/stores';

	import { goto } from '$app/navigation';
	import { browser } from '$app/env';

	import { auth } from '$lib/stores/auth';
	import { restoreSession, logout } from '$lib/api/auth';

	import './layout.css';

	onMount(() => {
		restoreSession();
	});

	async function handleLogout() {
		await logout();
	}

	const HIDDEN_NAV_ROUTES = ['/signin', '/signup'];

	$: hidenNav = HIDDEN_NAV_ROUTES.some((route) => $page.url.pathname.startsWith(route));

	$: if (
		browser && 
		$auth.user &&
		hidenNav
	) {
		goto('/', {resplaceState: true});
	}

	class Person{
		constructor(name) {
			this.name = name;
		}

		getInfo() {
			return this.name;
		}
	}

	const user = new Person('Petr');
	const user_prototype = Object.getPrototypeOf(user);

	console.log(user_prototype === Person.prototype)

	console.log(user.constructor === Person)

	// console.log(user instanceof Person)

</script>

{#if !hidenNav}
	<header
		class="flex items-center justify-between px-6 py-5 border-b border-slate-200 bg-slate-100"
	>
		<div class="flex max-w-3xl items-center justify-between w-full">
			<a href="/" class="font-semibold text-gray-900 text-xl" aria-label="home">NativeWheels</a>
		</div>

		<nav class="flex items-center gap-4 text-sm">
			{#if $auth.isInitializing}
				<span class="text-gray-400">...</span>
			{:else if $auth.isAuthenticated}
				<span class="text-gray-700">{$auth.user?.name ?? $auth.user?.email}</span>
				<button class="text-amber-500 hover:underline" on:click={handleLogout}>Выйти</button>
			{:else}
				<a href="/signin" class="text-amber-600 hover:underline">Войти</a>
				<a href="/signup" class="text-amber-600 hover:underline">Регистрация</a>
			{/if}
		</nav>
	</header>
{/if}

<main class="min-h-screen">
	{#if $auth.isInitializing}
		<p class="text-center mt-16 text-gray-400">Загрузка...</p>
	{:else}
		<slot />
	{/if}
</main>
