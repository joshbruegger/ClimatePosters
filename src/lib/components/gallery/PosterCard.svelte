<script lang="ts">
	import type { PosterListItem } from '$lib/types/poster.js';

	let {
		poster,
		onopen
	}: {
		poster: PosterListItem;
		onopen: (id: string, initial?: PosterListItem) => void;
	} = $props();

	const src = $derived(poster.thumbnail_url || poster.blob_url);
	const alt = $derived(`Poster: ${poster.title}`);
</script>

<button
	type="button"
	class="group flex w-full flex-col overflow-hidden rounded-xl border border-emerald-900/10 bg-white text-left shadow-sm transition hover:border-emerald-600/40 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 dark:border-emerald-100/10 dark:bg-emerald-950/50"
	onclick={() => onopen(poster.id, poster)}
>
	<div class="relative aspect-[3/4] w-full overflow-hidden bg-emerald-950/5">
		<img
			class="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02] motion-reduce:transition-none"
			{src}
			{alt}
			loading="lazy"
			decoding="async"
			sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
		/>
	</div>
	<div class="flex flex-1 flex-col gap-1 p-3">
		<h3 class="line-clamp-2 text-sm font-semibold text-emerald-950 dark:text-emerald-50">
			{poster.title}
		</h3>
		{#if poster.tags?.length}
			<p class="line-clamp-1 text-xs text-emerald-800/80 dark:text-emerald-200/80">
				{poster.tags.slice(0, 3).join(' · ')}
			</p>
		{/if}
	</div>
</button>
