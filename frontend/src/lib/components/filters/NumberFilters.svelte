<script>
	export let numberFilters = [];
	export let handleFilter = () => {};
</script>

<div>
	{#if numberFilters.length > 0}
		<div class="flex flex-wrap gap-6">
			{#each numberFilters as filter (filter.key)}
				<div class="flex flex-col items-center gap-2 rounded-xl border border-gray-300 px-3 py-2">
					<span class="text-sm font-semibold text-gray-700">
						{filter.label}
						{#if filter.unit}({filter.unit}){/if}
					</span>
					<div class="flex items-center gap-2">
						<label class="flex items-center gap-1.5 text-xs text-gray-500">
							<span>min</span>
							<input
								type="number"
								bind:value={filter.min}
								min={filter.baseMin}
								max={filter.baseMax}
								placeholder="Мин"
								class="w-20 rounded-lg border border-gray-300 px-1 py-1 text-sm text-gray-900 outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
								on:change={() => handleFilter(filter)}
							/>
						</label>
						<label class="flex items-center gap-1.5 text-xs text-gray-500">
							<span>max</span>
							<input
								type="number"
								bind:value={filter.max}
								min={filter.baseMin}
								max={filter.baseMax}
								placeholder="Макс"
								class="w-20 rounded-lg border border-gray-300 px-1 py-1 text-sm text-gray-900 outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
								on:change={() => handleFilter(filter)}
							/>
						</label>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
