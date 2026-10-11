<script>
    import { onMount } from "svelte";
    import { api, json, formatMoney, statusLabels, mediaUrl } from '$lib/api';

    let items = [];
    let total = 0;
    let loading = true;
    let error = "";
    let search = "";

    let editing = null;
    let saving = false;

    async function load(limit = 100) {
        loading = true;

        try {
            const data = await api(`http://localhost:3000/api/pmvs?limit=${limit}`);
            items = data.items
            total = data.pagination.total;
        } catch (e) {
            error = e.message;             
        } finally {
            loading = false;
        }
    }

    async function save() {
        saving = true;
        error = "";

        try {
            const body = {
                name: editing.name,
                description: editing.description,
                defaultPricePerHour: Number(editing.defaultPricePerHour),
                defaultPricePerDay: editing.defaultPricePerDay 
                    ? Number(editing.defaultPricePerDay)
                    : undefined,
                deposit: 
                    editing.deposit === "" 
                    ? undefined:
                    Number(editing.deposit),
                isActive: editing.isActive,
                mileage: Number(editing.mileage)
            };

            Object.keys(body).forEach(
                (key) => {
                    if(body[key] === undefined) {
                        delete body[key]
                    }
                }
            )

            await api(`/api/pmvs/${editing._id}`, json("PATCH", body));
            editing = null;
            await load();
        } catch (e) {
            error = e.message; 
        } finally {
            saving = false;
        }
    }

    async function remove(item) {
        if(!confirm(`Удалить объявление "${item.name}"?`)) return;

        try {
            await api(`/api/pmvs/${item._id}`, { method: "DELETE" });
            await load();
        } catch (e) {
            error = e.message;
        }
    }
    

    onMount(load);
</script>


<section>
    <!-- Заголовок -->
    <div>

    </div>

    <!-- Объявление -->
    <div>
        
    </div>
</section>