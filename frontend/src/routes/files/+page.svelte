<script>
    import { goto } from "$app/navigation";
    import { auth } from "$lib/stores/auth";
    import { apiJson } from "$lib/api/http";

    let files = [];
    let isLoading = true;
    let errorMessage = "";
    let hasLoaded = false;

    $: if(!$auth.isInitializing && !hasLoaded) {
        hasLoaded = true;
        loadFiles();
    }

    async function loadFiles() {
        if(!$auth.isAuthenticated) {
            goto("/signin");
            return;
        }

        try {
            files = await apiJson("/api/media/files?prefix=cover/");
        } catch (e) {
            errorMessage = e.message || "Не удалось загрузить файлы";
        } finally {
            isLoading = false;
        }
    }
</script>