<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import PosterModal from '$lib/components/gallery/PosterModal.svelte';
	import type { PosterListItem } from '$lib/types/poster.js';
	import { onMount } from 'svelte';

	let poster = $state<PosterListItem | null>(null);
	let loadError = $state<string | null>(null);
	let modalOpen = $state(true);

	const id = $derived($page.params.id ?? '');

	onMount(async () => {
		try {
			const res = await fetch(`/api/posters/${id}`);
			const data = await res.json();
			if (!res.ok) throw new Error(data.message ?? 'Not found');
			poster = data.poster as PosterListItem;
		} catch (e) {
			loadError = e instanceof Error ? e.message : 'Failed to load';
		}
	});

	function onModalClose() {
		modalOpen = false;
		if (history.length > 1) history.back();
		else goto('/');
	}
</script>

<svelte:head>
	<title>{poster?.title ? `${poster.title} · ClimatePosters` : 'Poster · ClimatePosters'}</title>
</svelte:head>

<div class="min-h-[50vh] px-4 py-10">
	{#if loadError}
		<p class="text-center text-red-700 dark:text-red-300" role="alert">{loadError}</p>
	{:else if !poster}
		<p class="text-center text-emerald-800 dark:text-emerald-200">Loading…</p>
	{:else}
		<div class="mx-auto max-w-3xl space-y-4 text-center">
			<h1 class="text-2xl font-bold text-emerald-950 dark:text-emerald-50">{poster.title}</h1>
			<p class="text-sm text-emerald-800/80 dark:text-emerald-200/80">Use the dialog for full details and downloads.</p>
		</div>
	{/if}
</div>

{#if !loadError && poster}
	<PosterModal bind:open={modalOpen} posterId={id} idList={[id]} initial={poster} onclose={onModalClose} />
{/if}
