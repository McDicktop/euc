<script>
	export let enumFilters = [];
	export let openEnumKey = null;

	export let handleFilter = () => {};
	export let toggleEnumDropdown = () => {};
</script>

<div>
	{#if enumFilters.length > 0}
		<div class="flex flex-wrap gap-6">
			{#each enumFilters as filter (filter.key)}
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<!-- svelte-ignore a11y-no-static-element-interactions -->
				<div class="relative flex flex-col gap-1.5" on:click|stopPropagation>
					<span class="text-xs font-semibold text-gray-700">
						{filter.label}
					</span>

					<button
						type="button"
						class="flex min-w-44 items-center justify-between gap-3 rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 transition-colors hover:border-gray-400"
						on:click={() => toggleEnumDropdown(filter.key)}
					>
						<span class="truncate">
							{#if filter.selected.length === 0}
								Все
							{:else if filter.selected.length === 1}
								{filter.selected[0]}
							{:else}
								Выбрано: {filter.selected.length}
							{/if}
						</span>
						<span class="text-xs text-gray-500">
							{openEnumKey === filter.key ? '▲' : '▼'}
						</span>
					</button>

					{#if openEnumKey === filter.key}
						<div
							class="absolute top-full left-0 z-20 mt-1 flex max-h-60 min-w-full flex-col gap-1 overflow-y-auto rounded-xl border border-gray-200 bg-white p-2 shadow-lg"
						>
							{#each filter.options as option}
								<label
									class="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
								>
									<input
										type="checkbox"
										value={option}
										bind:group={filter.selected}
										class="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
										on:change={() => handleFilter(filter)}
									/>
									<span class="whitespace-nowrap">{option}</span>
								</label>
							{/each}
						</div>
					{/if}
				</div>
			{/each}
		</div>
	{/if}
</div>
