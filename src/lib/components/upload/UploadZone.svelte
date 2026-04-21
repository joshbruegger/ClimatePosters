<script lang="ts">
	import { Collapsible } from 'bits-ui';
	import { onMount } from 'svelte';

	let {
		onUploaded
	}: {
		onUploaded?: () => void;
	} = $props();

	let open = $state(false);
	let dragging = $state(false);
	let fileInput: HTMLInputElement | null = $state(null);
	let title = $state('');
	let description = $state('');
	let authorName = $state('');
	let tagsInput = $state('');
	let submitting = $state(false);
	let errorMsg = $state<string | null>(null);
	let successMsg = $state<string | null>(null);
	let announce = $state('');

	const tagList = $derived(
		tagsInput
			.split(',')
			.map((t) => t.trim().toLowerCase())
			.filter(Boolean)
	);

	function setAnnounce(msg: string) {
		announce = msg;
	}

	onMount(() => {
		const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
		if (mq.matches) document.documentElement.classList.add('motion-reduce');
	});

	function pickFiles(files: FileList | null) {
		if (!files?.length) return;
		const f = files[0];
		if (fileInput) {
			const dt = new DataTransfer();
			dt.items.add(f);
			fileInput.files = dt.files;
		}
	}

	function onDrop(e: DragEvent) {
		e.preventDefault();
		dragging = false;
		pickFiles(e.dataTransfer?.files ?? null);
	}

	async function submit(e: Event) {
		e.preventDefault();
		errorMsg = null;
		successMsg = null;
		const fi = fileInput?.files?.[0];
		if (!fi) {
			errorMsg = 'Choose an image file.';
			setAnnounce(errorMsg);
			return;
		}
		submitting = true;
		setAnnounce('Uploading poster, please wait.');
		const fd = new FormData();
		fd.append('image', fi);
		fd.append('title', title);
		fd.append('description', description);
		fd.append('author_name', authorName);
		fd.append('tags', JSON.stringify(tagList));

		try {
			const res = await fetch('/api/posters', { method: 'POST', body: fd });
			const data = await res.json().catch(() => ({}));
			if (!res.ok) {
				const msg = typeof data.message === 'string' ? data.message : 'Upload failed.';
				errorMsg = msg;
				setAnnounce(msg);
				return;
			}
			successMsg = 'Thanks! Your poster is now in the gallery.';
			setAnnounce(successMsg);
			title = '';
			description = '';
			authorName = '';
			tagsInput = '';
			if (fileInput) fileInput.value = '';
			onUploaded?.();
		} catch {
			errorMsg = 'Network error. Try again.';
			setAnnounce(errorMsg);
		} finally {
			submitting = false;
		}
	}
</script>

<div
	class="rounded-2xl border border-emerald-900/20 bg-white/80 shadow-sm backdrop-blur dark:border-emerald-100/10 dark:bg-emerald-950/40"
>
	<Collapsible.Root bind:open>
		<div class="flex items-center justify-between gap-3 px-4 py-3 sm:px-5">
			<h2 class="text-lg font-semibold tracking-tight text-emerald-950 dark:text-emerald-50">
				Contribute a poster
			</h2>
			<Collapsible.Trigger
				class="inline-flex items-center gap-2 rounded-lg border border-emerald-800/20 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-900 hover:bg-emerald-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 dark:border-emerald-100/20 dark:bg-emerald-900/50 dark:text-emerald-50 dark:hover:bg-emerald-800/60"
				aria-expanded={open}
			>
				{open ? 'Hide upload' : 'Show upload'}
				<span aria-hidden="true" class="text-xs">{open ? '▾' : '▸'}</span>
			</Collapsible.Trigger>
		</div>
		<Collapsible.Content
			class="overflow-hidden border-t border-emerald-900/10 dark:border-emerald-100/10"
		>
			<form class="space-y-4 px-4 py-4 sm:px-5" onsubmit={submit}>
				<p class="text-sm text-emerald-900/80 dark:text-emerald-100/80">
					PNG, JPG, JPEG, or WebP up to 20MB. Posters go live in the gallery right away; moderators
					may remove content that violates guidelines.
				</p>

				<div
					class="flex min-h-[140px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-6 text-center transition-colors {dragging
						? 'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-900/30'
						: 'border-emerald-800/25 hover:border-emerald-600/50 dark:border-emerald-200/20'}"
					ondragenter={(e) => {
						e.preventDefault();
						dragging = true;
					}}
					ondragleave={() => (dragging = false)}
					ondragover={(e) => e.preventDefault()}
					ondrop={onDrop}
					onclick={() => fileInput?.click()}
					onkeydown={(e) => {
						if (e.key === 'Enter' || e.key === ' ') {
							e.preventDefault();
							fileInput?.click();
						}
					}}
					role="button"
					tabindex="0"
					aria-label="Drop image here or press Enter to choose a file"
				>
					<span class="text-sm font-medium text-emerald-900 dark:text-emerald-50"
						>Drop an image here</span
					>
					<span class="mt-1 text-xs text-emerald-800/70 dark:text-emerald-100/70"
						>or click to browse</span
					>
					<input
						bind:this={fileInput}
						class="sr-only"
						type="file"
						accept="image/png,image/jpeg,image/jpg,image/webp"
						aria-label="Poster image file"
					/>
				</div>

				<div class="grid gap-3 sm:grid-cols-2">
					<label class="block text-sm font-medium text-emerald-950 dark:text-emerald-50">
						Title <span class="text-red-600">*</span>
						<input
							class="mt-1 w-full rounded-lg border border-emerald-900/15 bg-white px-3 py-2 text-emerald-950 shadow-sm focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 dark:border-emerald-100/15 dark:bg-emerald-950 dark:text-emerald-50"
							name="title"
							required
							maxlength="255"
							bind:value={title}
						/>
					</label>
					<label class="block text-sm font-medium text-emerald-950 dark:text-emerald-50">
						Author (optional)
						<input
							class="mt-1 w-full rounded-lg border border-emerald-900/15 bg-white px-3 py-2 text-emerald-950 shadow-sm focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 dark:border-emerald-100/15 dark:bg-emerald-950 dark:text-emerald-50"
							name="author_name"
							maxlength="100"
							bind:value={authorName}
						/>
					</label>
				</div>

				<label class="block text-sm font-medium text-emerald-950 dark:text-emerald-50">
					Description (optional)
					<textarea
						class="mt-1 min-h-[80px] w-full rounded-lg border border-emerald-900/15 bg-white px-3 py-2 text-emerald-950 shadow-sm focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 dark:border-emerald-100/15 dark:bg-emerald-950 dark:text-emerald-50"
						name="description"
						rows="3"
						bind:value={description}
					></textarea>
				</label>

				<label class="block text-sm font-medium text-emerald-950 dark:text-emerald-50">
					Tags (comma-separated)
					<input
						class="mt-1 w-full rounded-lg border border-emerald-900/15 bg-white px-3 py-2 text-emerald-950 shadow-sm focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 dark:border-emerald-100/15 dark:bg-emerald-950 dark:text-emerald-50"
						name="tags"
						placeholder="climate, ocean, justice"
						bind:value={tagsInput}
					/>
				</label>

				{#if errorMsg}
					<p class="text-sm text-red-700 dark:text-red-300" role="alert">{errorMsg}</p>
				{/if}
				{#if successMsg}
					<p class="text-sm text-emerald-800 dark:text-emerald-200" role="status">{successMsg}</p>
				{/if}

				<button
					type="submit"
					disabled={submitting}
					class="inline-flex w-full items-center justify-center rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-emerald-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
				>
					{submitting ? 'Uploading…' : 'Submit poster'}
				</button>
			</form>
		</Collapsible.Content>
	</Collapsible.Root>
</div>

<div class="sr-only" aria-live="polite" aria-atomic="true">{announce}</div>
