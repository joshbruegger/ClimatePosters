<script lang="ts">
	import { Dialog } from 'bits-ui';
	import type { PosterListItem } from '$lib/types/poster.js';

	let {
		open = $bindable(false),
		posterId,
		idList,
		initial,
		onNavigate,
		onclose
	}: {
		open?: boolean;
		posterId: string | null;
		idList: string[];
		initial?: PosterListItem | null;
		onNavigate?: (id: string) => void;
		onclose?: () => void;
	} = $props();

	let poster = $state<PosterListItem | null>(null);
	let loading = $state(false);
	let reportReason = $state('');
	let reportDetails = $state('');
	let reportStatus = $state<string | null>(null);
	let reportError = $state<string | null>(null);
	let triggerRef: HTMLElement | null = $state(null);

	const idx = $derived(posterId ? idList.indexOf(posterId) : -1);
	const hasPrev = $derived(idx > 0);
	const hasNext = $derived(idx >= 0 && idx < idList.length - 1);

	async function loadPoster(id: string) {
		loading = true;
		reportStatus = null;
		reportError = null;
		try {
			const res = await fetch(`/api/posters/${id}`);
			const data = await res.json();
			if (!res.ok) throw new Error(data.message ?? 'Not found');
			poster = data.poster as PosterListItem;
		} catch {
			poster = null;
		} finally {
			loading = false;
		}
	}

	$effect(() => {
		if (!open || !posterId) return;
		if (initial && initial.id === posterId) {
			poster = initial;
			return;
		}
		loadPoster(posterId);
	});

	function go(delta: number) {
		if (!posterId || idx < 0) return;
		const n = idList[idx + delta];
		if (!n) return;
		onNavigate?.(n);
	}

	function onKeydown(e: KeyboardEvent) {
		if (!open) return;
		if (e.key === 'ArrowLeft' && hasPrev) {
			e.preventDefault();
			go(-1);
		}
		if (e.key === 'ArrowRight' && hasNext) {
			e.preventDefault();
			go(1);
		}
	}

	async function submitReport(e: Event) {
		e.preventDefault();
		if (!posterId) return;
		reportError = null;
		reportStatus = null;
		try {
			const res = await fetch(`/api/posters/${posterId}/report`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ reason: reportReason, details: reportDetails })
			});
			const data = await res.json().catch(() => ({}));
			if (!res.ok) throw new Error(data.message ?? 'Failed');
			reportStatus = 'Report submitted. Thank you.';
			reportReason = '';
			reportDetails = '';
		} catch (e) {
			reportError = e instanceof Error ? e.message : 'Failed';
		}
	}

	const webDl = $derived(poster ? `/api/posters/${poster.id}/download` : '#');
	const printDl = $derived(
		poster?.blob_url_print ? `/api/posters/${poster.id}/download?variant=print` : null
	);
</script>

<svelte:window onkeydown={onKeydown} />

<Dialog.Root
	bind:open
	onOpenChange={(v: boolean) => {
		if (!v) onclose?.();
	}}
>
	<Dialog.Portal>
		<Dialog.Overlay class="fixed inset-0 z-40 bg-emerald-950/60 backdrop-blur-sm" />
		<Dialog.Content
			class="fixed left-1/2 top-1/2 z-50 flex max-h-[min(92vh,900px)] w-[min(96vw,1100px)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border border-emerald-900/15 bg-white shadow-xl focus:outline-none dark:border-emerald-100/10 dark:bg-emerald-950"
			onOpenAutoFocus={(e) => e.preventDefault()}
			onCloseAutoFocus={() => triggerRef?.focus()}
		>
			<div
				class="flex items-start justify-between gap-3 border-b border-emerald-900/10 px-4 py-3 dark:border-emerald-100/10 sm:px-5"
			>
				<Dialog.Title class="text-lg font-semibold text-emerald-950 dark:text-emerald-50">
					{poster?.title ?? 'Poster'}
				</Dialog.Title>
				<Dialog.Close
					class="rounded-lg px-2 py-1 text-sm text-emerald-800 hover:bg-emerald-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600 dark:text-emerald-200 dark:hover:bg-emerald-900"
				>
					Close
				</Dialog.Close>
			</div>

			<div
				class="grid flex-1 gap-4 overflow-y-auto p-4 sm:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] sm:p-5"
			>
				<div
					class="relative flex min-h-[200px] items-center justify-center overflow-hidden rounded-xl bg-emerald-950/5"
				>
					{#if loading}
						<p class="text-sm text-emerald-800">Loading…</p>
					{:else if poster}
						<img
							class="max-h-[min(70vh,720px)] w-full object-contain"
							src={poster.blob_url}
							alt={poster.title}
							loading="eager"
							decoding="async"
						/>
					{:else}
						<p class="text-sm text-red-700">Could not load this poster.</p>
					{/if}
				</div>

				<div class="flex flex-col gap-4 text-sm text-emerald-900 dark:text-emerald-100">
					{#if poster?.description}
						<div>
							<h3 class="font-semibold text-emerald-950 dark:text-emerald-50">About</h3>
							<p class="mt-1 whitespace-pre-wrap text-emerald-900/90 dark:text-emerald-100/90">
								{poster.description}
							</p>
						</div>
					{/if}
					{#if poster?.author_name}
						<p>
							<span class="font-medium">Credit:</span>
							{poster.author_name}
						</p>
					{/if}
					{#if poster?.tags?.length}
						<p>
							<span class="font-medium">Tags:</span>
							{poster.tags.join(', ')}
						</p>
					{/if}

					<div class="flex flex-wrap gap-2">
						<a
							class="inline-flex items-center rounded-lg bg-emerald-700 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
							href={webDl}
							rel="external"
							data-sveltekit-reload
						>
							Download (web)
						</a>
						{#if printDl}
							<a
								class="inline-flex items-center rounded-lg border border-emerald-800/30 px-3 py-2 text-sm font-semibold text-emerald-900 hover:bg-emerald-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 dark:border-emerald-100/30 dark:text-emerald-50 dark:hover:bg-emerald-900"
								href={printDl}
								rel="external"
								data-sveltekit-reload
							>
								Download (print)
							</a>
						{/if}
					</div>

					<form
						class="space-y-2 rounded-xl border border-amber-900/15 bg-amber-50/50 p-3 dark:border-amber-100/10 dark:bg-amber-950/30"
						onsubmit={submitReport}
					>
						<h3 class="font-semibold text-amber-950 dark:text-amber-100">Report this poster</h3>
						<label class="block text-xs font-medium">
							Reason
							<input
								class="mt-1 w-full rounded border border-amber-900/20 bg-white px-2 py-1 text-amber-950 dark:border-amber-100/20 dark:bg-amber-950 dark:text-amber-50"
								bind:value={reportReason}
								required
								maxlength="500"
							/>
						</label>
						<label class="block text-xs font-medium">
							Details (optional)
							<textarea
								class="mt-1 min-h-[60px] w-full rounded border border-amber-900/20 bg-white px-2 py-1 text-amber-950 dark:border-amber-100/20 dark:bg-amber-950 dark:text-amber-50"
								bind:value={reportDetails}
								maxlength="2000"
							></textarea>
						</label>
						{#if reportError}
							<p class="text-xs text-red-700" role="alert">{reportError}</p>
						{/if}
						{#if reportStatus}
							<p class="text-xs text-emerald-800" role="status">{reportStatus}</p>
						{/if}
						<button
							type="submit"
							class="rounded-lg bg-amber-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-600"
						>
							Submit report
						</button>
					</form>
				</div>
			</div>

			<div
				class="flex items-center justify-between border-t border-emerald-900/10 px-4 py-3 dark:border-emerald-100/10 sm:px-5"
			>
				<button
					type="button"
					class="rounded-lg px-3 py-1.5 text-sm font-medium text-emerald-900 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-40 dark:text-emerald-100 dark:hover:bg-emerald-900"
					onclick={() => go(-1)}
					disabled={!hasPrev}
				>
					← Previous
				</button>
				<button
					type="button"
					class="rounded-lg px-3 py-1.5 text-sm font-medium text-emerald-900 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-40 dark:text-emerald-100 dark:hover:bg-emerald-900"
					onclick={() => go(1)}
					disabled={!hasNext}
				>
					Next →
				</button>
			</div>
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>

<!-- Hidden trigger for focus restore when opening from grid buttons -->
<span bind:this={triggerRef} tabindex="-1" class="sr-only" aria-hidden="true"></span>
