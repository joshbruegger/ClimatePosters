<script lang="ts">
	import { onMount } from 'svelte';
	import type { PosterListItem } from '$lib/types/poster.js';
	import PosterCard from './PosterCard.svelte';

	let {
		search,
		tags,
		sort,
		onopen,
		onids
	}: {
		search: string;
		tags: string[];
		sort: string;
		onopen: (id: string, initial?: PosterListItem) => void;
		onids?: (ids: string[]) => void;
	} = $props();

	let posters = $state<PosterListItem[]>([]);
	let nextPage = $state(1);
	let loading = $state(false);
	let hasMore = $state(true);
	let errorMsg = $state<string | null>(null);
	let loadMoreEl: HTMLDivElement | null = $state(null);
	let announce = $state('');

	function buildQuery(page: number) {
		const u = new URLSearchParams();
		u.set('page', String(page));
		u.set('limit', '20');
		u.set('sort', sort);
		if (search.trim()) u.set('search', search.trim());
		if (tags.length) u.set('tags', tags.join(','));
		return u.toString();
	}

	async function load(reset: boolean) {
		if (loading) return;
		loading = true;
		errorMsg = null;
		const pageToFetch = reset ? 1 : nextPage;
		if (reset) {
			posters = [];
			nextPage = 1;
			hasMore = true;
		}
		try {
			const res = await fetch(`/api/posters?${buildQuery(reset ? 1 : pageToFetch)}`);
			const data = await res.json();
			if (!res.ok) throw new Error(data.message ?? 'Failed to load');
			const batch = (data.posters ?? []) as PosterListItem[];
			posters = reset ? batch : [...posters, ...batch];
			hasMore = !!data.hasMore;
			if (batch.length) {
				nextPage = (reset ? 1 : pageToFetch) + 1;
			}
			onids?.(posters.map((x) => x.id));
			announce = reset
				? `Loaded ${batch.length} posters.`
				: `Loaded ${batch.length} more posters.`;
		} catch (e) {
			errorMsg = e instanceof Error ? e.message : 'Failed to load';
			announce = errorMsg;
		} finally {
			loading = false;
		}
	}

	$effect(() => {
		void search;
		void tags;
		void sort;
		load(true);
	});

	function loadMore() {
		if (!hasMore || loading) return;
		load(false);
	}

	onMount(() => {
		if (!loadMoreEl) return;
		const obs = new IntersectionObserver(
			(entries) => {
				for (const e of entries) {
					if (e.isIntersecting && posters.length > 0) loadMore();
				}
			},
			{ rootMargin: '240px' }
		);
		obs.observe(loadMoreEl);
		return () => obs.disconnect();
	});
</script>

<div class="space-y-4">
	{#if errorMsg}
		<p class="text-sm text-red-700 dark:text-red-300" role="alert">{errorMsg}</p>
	{/if}

	<div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
		{#each posters as poster (poster.id)}
			<PosterCard {poster} {onopen} />
		{/each}
	</div>

	{#if loading && posters.length === 0}
		<p class="text-center text-sm text-emerald-800/80 dark:text-emerald-200/80">Loading posters…</p>
	{/if}

	{#if !loading && posters.length === 0}
		<p class="text-center text-sm text-emerald-800/80 dark:text-emerald-200/80">No posters match your filters yet.</p>
	{/if}

	<div bind:this={loadMoreEl} class="h-1 w-full" aria-hidden="true"></div>

	<div class="flex justify-center pb-8">
		<button
			type="button"
			class="rounded-xl border border-emerald-800/20 bg-white px-4 py-2 text-sm font-medium text-emerald-900 shadow-sm hover:bg-emerald-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-emerald-100/20 dark:bg-emerald-950 dark:text-emerald-50 dark:hover:bg-emerald-900"
			onclick={loadMore}
			disabled={!hasMore || loading}
		>
			{#if loading && posters.length > 0}
				Loading…
			{:else if hasMore}
				Load more
			{:else}
				No more posters
			{/if}
		</button>
	</div>
</div>

<div class="sr-only" aria-live="polite">{announce}</div>
