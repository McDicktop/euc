<script>
    import "./layout.css";
	import { onMount } from "svelte";

    let initialized = false;

    onMount(async () => {
        initialized = true;
    });
</script>



{#if initialized}
    <div class="min-h-screen flex flex-col bg-gray-100">
        <div class="flex-grow">
            <slot />
        </div>
    </div>
{:else}
    <div class="min-h-screen flex items-center justify-center">
        <div
            class="size-6 border-2 border-gray-600/20 border-t-gray-600/75 rounded-full animate-spin"
        ></div>
    </div>
{/if}