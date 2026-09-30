<script>
	import { onMount } from 'svelte';
	import { api } from '$lib/api';
	import { page } from '$app/stores';
	import { mediaUrl } from '$lib/api';

	const id = $page.params.id;

	console.log(id);

	let pmv = {};
	let error = '';
	let imageFailed = false;
	let activeImg = null;

	onMount(async () => {
		try {
			pmv = await api(`http://localhost:3000/api/pmvs/${id}`);
			activeImg = pmv?.images?.coverKey || pmv?.images?.gallery[0] || null;
			console.log(pmv);
		} catch (e) {
			error = e.message;
		}

		// await load();
	});
</script>

<main>
	<h3 class="my-2 font-medium text-lg">
		{pmv.name}
	</h3>

<article class="grid grid-cols-[80px_458px_458px] w-[1046px] gap-6 mx-auto justify-start"> 
  <!-- 1 Фракция: Галерея миниатюр (самая узкая) -->
  {#if pmv.images?.gallery?.length} 
    <div class="flex flex-col gap-3"> 
      {#each [pmv.images.coverKey, ...pmv.images.gallery] as thumb, ind} 
        <button 
          onclick={() => (activeImg = thumb)} 
          class={`cursor-pointer border rounded-lg duration-200 ${activeImg === thumb ? 'border-gray-800' : 'border-gray-200 hover:opacity-80'}`} 
        > 
          <img class="size-20 object-contain" src={mediaUrl(thumb)} alt={`img_${ind}`} onerror={() => (imageFailed = true)} /> 
        </button> 
      {/each} 
    </div> 
  {:else} 
    <div class="w-20 h-full bg-gray-100 flex items-center justify-center text-xs text-gray-400 rounded-lg">Фото нет</div> 
  {/if} 

  <!-- 2 Фракция: Основное изображение -->
  {#if pmv.images?.coverKey && !imageFailed} 
    <img class="w-full object-contain aspect-square border border-gray-200 rounded-xl" src={mediaUrl(activeImg)} alt={'image'} onerror={() => (imageFailed = true)} /> 
  {:else} 
    <div class="w-full aspect-video bg-gray-100 flex items-center justify-center text-gray-400 border border-gray-200 rounded-xl">Фото нет</div> 
  {/if} 

  <!-- 3 Фракция: Описание и детали -->
  <div class="flex flex-col gap-4"> 
    <div> 
      <div class="text-sm text-gray-500 uppercase tracking-wider"> 
        {pmv.category?.name || 'Транспорт'} 
      </div> 
      <h3 class="text-2xl font-bold text-gray-900 mt-1"> 
        {pmv.name} 
      </h3> 
    </div>

    <p class="text-gray-600 leading-relaxed"> 
      {pmv.description || 'Описание пока не добавлено'} 
    </p> 

    <div class="flex flex-wrap gap-2 pt-2"> 
      <!-- details --> 
      {#if pmv.details?.brand} 
        <span class="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"> 
          {pmv.details?.brand} 
        </span> 
      {/if} 
      {#if pmv.details?.maxSpeed} 
        <span class="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"> 
          {pmv.details?.maxSpeed} км/ч 
        </span> 
      {/if} 
      {#if pmv.mileage !== null} 
        <span class="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"> 
          Пробег - {pmv.mileage} км 
        </span> 
      {/if} 
	  <button
	   class="w-full py-2 rounded-xl border border-gray-300"
		onclick={()=>{}}
	  >
	АРЕНДОВАТЬ
	  </button>
    </div> 
  </div> 
</article>



</main>
