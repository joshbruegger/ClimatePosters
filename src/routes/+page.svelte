<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import PosterGrid from '$lib/components/gallery/PosterGrid.svelte';
	import PosterModal from '$lib/components/gallery/PosterModal.svelte';
	import UploadZone from '$lib/components/upload/UploadZone.svelte';
	import type { PosterListItem } from '$lib/types/poster.js';

	let search = $state('');
	let sort = $state('-created');
	let tagDraft = $state('');
	let modalOpen = $state(false);
	let activeId = $state<string | null>(null);
	let idList = $state<string[]>([]);
	let modalInitial = $state<PosterListItem | null>(null);

	const selectedTags = $derived(
		tagDraft
			.split(',')
			.map((t) => t.trim().toLowerCase())
			.filter(Boolean)
	);

	function syncFromUrl() {
		const u = $page.url;
		search = u.searchParams.get('search') ?? '';
		sort = u.searchParams.get('sort') ?? '-created';
		const tags = u.searchParams.get('tags');
		tagDraft = tags ? tags.split(',').join(', ') : '';
		const poster = u.searchParams.get('poster');
		if (poster) {
			activeId = poster;
			modalOpen = true;
		} else {
			activeId = null;
			modalOpen = false;
		}
	}

	$effect(() => {
		void $page.url;
		syncFromUrl();
	});

	function pushUrl(next: URL) {
		goto(`${next.pathname}${next.search}`, {
			replaceState: true,
			noScroll: true,
			keepFocus: true
		});
	}

	function applyFilters() {
		const u = new URL($page.url);
		if (search.trim()) u.searchParams.set('search', search.trim());
		else u.searchParams.delete('search');
		if (selectedTags.length) u.searchParams.set('tags', selectedTags.join(','));
		else u.searchParams.delete('tags');
		u.searchParams.set('sort', sort);
		u.searchParams.delete('poster');
		pushUrl(u);
	}

	function openPoster(id: string, initial?: PosterListItem | null) {
		activeId = id;
		modalInitial = initial ?? null;
		modalOpen = true;
		const u = new URL($page.url);
		u.searchParams.set('poster', id);
		pushUrl(u);
	}

	function onModalNavigate(id: string) {
		activeId = id;
		modalInitial = null;
		const u = new URL($page.url);
		u.searchParams.set('poster', id);
		pushUrl(u);
	}

	function onModalClose() {
		modalOpen = false;
		activeId = null;
		modalInitial = null;
		const u = new URL($page.url);
		u.searchParams.delete('poster');
		pushUrl(u);
	}
</script>

<svelte:head>
	<title>ClimatePosters — Climate crisis posters gallery</title>
	<meta
		name="description"
		content="Browse and share climate crisis awareness posters. Community submissions with moderation-first publishing."
	/>
</svelte:head>

<div class="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-slate-50 text-emerald-950 dark:from-emerald-950 dark:via-emerald-950 dark:to-slate-950 dark:text-emerald-50">
	<header class="border-b border-emerald-900/10 bg-white/70 backdrop-blur dark:border-emerald-100/10 dark:bg-emerald-950/70">
		<div class="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 sm:px-6">
			<p class="text-xs font-semibold uppercase tracking-widest text-emerald-700 dark:text-emerald-300">Climate crisis · Visual activism</p>
			<h1 class="text-3xl font-bold tracking-tight sm:text-4xl">ClimatePosters</h1>
			<p class="max-w-2xl text-base text-emerald-900/85 dark:text-emerald-100/85">
				A living gallery of posters for climate justice and awareness. Uploads are reviewed before they appear publicly.
			</p>
			<nav class="pt-2" aria-label="Site">
				<a
					class="text-sm font-medium text-emerald-800 underline-offset-4 hover:underline dark:text-emerald-200"
					href="/admin/moderation"
				>
					Moderation (admin)
				</a>
			</nav>
		</div>
	</header>

	<main class="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6">
		<UploadZone />

		<section class="space-y-4" aria-labelledby="discover-heading">
			<div class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
				<h2 id="discover-heading" class="text-xl font-semibold">Discover</h2>
			</div>

			<div class="grid gap-3 rounded-2xl border border-emerald-900/10 bg-white/80 p-4 shadow-sm dark:border-emerald-100/10 dark:bg-emerald-950/40 sm:grid-cols-2 lg:grid-cols-4">
				<label class="block text-sm font-medium lg:col-span-2">
					Search title & description
					<input
						class="mt-1 w-full rounded-lg border border-emerald-900/15 bg-white px-3 py-2 text-emerald-950 shadow-sm focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 dark:border-emerald-100/15 dark:bg-emerald-950 dark:text-emerald-50"
						type="search"
						bind:value={search}
						onchange={applyFilters}
						autocomplete="off"
					/>
				</label>
				<label class="block text-sm font-medium">
					Tags (comma-separated)
					<input
						class="mt-1 w-full rounded-lg border border-emerald-900/15 bg-white px-3 py-2 text-emerald-950 shadow-sm focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 dark:border-emerald-100/15 dark:bg-emerald-950 dark:text-emerald-50"
						bind:value={tagDraft}
						onchange={applyFilters}
						placeholder="ocean, strike, youth"
					/>
				</label>
				<label class="block text-sm font-medium">
					Sort
					<select
						class="mt-1 w-full rounded-lg border border-emerald-900/15 bg-white px-3 py-2 text-emerald-950 shadow-sm focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 dark:border-emerald-100/15 dark:bg-emerald-950 dark:text-emerald-50"
						bind:value={sort}
						onchange={applyFilters}
					>
						<option value="-created">Newest</option>
						<option value="created">Oldest</option>
						<option value="-download_count">Most downloaded</option>
					</select>
				</label>
			</div>

			<PosterGrid
				search={$page.url.searchParams.get('search') ?? ''}
				tags={($page.url.searchParams.get('tags') ?? '')
					.split(',')
					.map((t) => t.trim().toLowerCase())
					.filter(Boolean)}
				sort={$page.url.searchParams.get('sort') ?? '-created'}
				onopen={(id, initial) => openPoster(id, initial)}
				onids={(ids) => (idList = ids)}
			/>
		</section>
	</main>

	<footer class="border-t border-emerald-900/10 py-8 text-center text-xs text-emerald-800/70 dark:border-emerald-100/10 dark:text-emerald-200/70">
		Built for climate awareness. Images are community-contributed; moderators can remove inappropriate posts.
	</footer>
</div>

<PosterModal
	bind:open={modalOpen}
	posterId={activeId}
	{idList}
	initial={modalInitial}
	onNavigate={onModalNavigate}
	onclose={onModalClose}
/>
