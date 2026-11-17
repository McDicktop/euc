<script>
	export let booleanFilters = [];
	export let handleFilter = () => {};
</script>

<div>
	{#if booleanFilters.length > 0}
		<div class="flex flex-wrap gap-6">
			{#each booleanFilters as filter (filter.key)}
				<div class="flex flex-col items-center gap-2 rounded-xl border border-gray-300 px-3 py-2">
					<span class="text-sm font-semibold text-gray-700">
						{filter.label}
					</span>
					<div class="flex items-center gap-3">
						{#each [{ label: 'Все', val: null }, { label: 'Да', val: true }, { label: 'Нет', val: false }] as opt}
							<label
								class="flex cursor-pointer items-center gap-1.5 text-xs font-medium text-gray-700"
							>
								<input
									type="radio"
									name={`bool-${filter.key}`}
									value={opt.val}
									bind:group={filter.value}
									class="h-3.5 w-3.5 cursor-pointer border-gray-300 text-blue-500 focus:ring-blue-500"
									on:change={() => {
										filters = filters;
										handleFilter(filter);
									}}
								/>
								<span>{opt.label}</span>
							</label>
						{/each}
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
