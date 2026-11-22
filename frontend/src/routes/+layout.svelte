<script>
	import { onMount } from 'svelte';
	import { restoreSession } from '$lib/auth/auth';
	import { page } from '$app/stores';
	import { derived } from 'svelte/store';
	import { goto } from '$app/navigation';
	import { auth } from '$lib/stores/auth';

	import './layout.css';
	
	let { children } = $props();

	const isAdminPage = $derived(
		$page.url.pathname === "/admin" || $page.url.pathname.startsWith("/admin/")
	)

	const isAuthPage = $derived(
		$page.url.pathname === "/signin" || $page.url.pathname === "/signup"
	)

	onMount(() => {
		restoreSession();
	})

	$effect(() => {
		if ($auth.isInitializing) return;

		if (isAdminPage) {
			if(!$auth.isAuthenticated) {
				goto('/signin', { replaceState: true })
			} else if ($auth.user?.role !== "admin") {
				goto("/", { replaceState: true })
			}
		} else if (isAuthPage && $auth.isAuthenticated) {
			goto("/", { replaceState: true })
		}
	})
</script>

{#if $auth.isInitializing}
	<p class="text-center p-6">Загрузка сессии...</p>
{:else if isAdminPage && (!$auth.isAuthenticated || $auth.user?.role !== "admin")}
	<p class="text-center p-6">Проверка доступа...</p>
{:else if isAuthPage && $auth.isAuthenticated}
	<p class="text-center p-6">Проверка доступа...</p>
{:else}
	{@render children()}
{/if}

<!-- // visitor
// guest
// user
  -- editor
  -- moderator
  -- verifier
// admin  -->

<!-- / +page.svelte
/account +page.svelte
/admin +layout
	--- +page.svelte
    --- /collections/create +page.svelte

+page.svelte -> children()


+layout -> children() -> +layout(admin) -> children() -> +page.svelte (admin) -->


<!-- layout.js <- +page.js (obj)

{
	"access": str (role)
}


edit/1/ load() {
	return {
		"access": "editor"
	}
} -->