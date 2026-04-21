<script lang="ts">
	import { resolve } from '$app/paths';
	import { SvelteURLSearchParams } from 'svelte/reactivity';

	type PosterRow = {
		id: string;
		title: string;
		status: string;
		created: string;
	};

	let password = $state('');
	let loggedIn = $state(false);
	let checking = $state(false);
	let statusFilter = $state<'approved' | 'removed' | 'all'>('approved');
	let posters = $state<PosterRow[]>([]);
	let pageNum = $state(1);
	let hasMore = $state(true);
	let loading = $state(false);
	let err = $state<string | null>(null);

	async function login(e: Event) {
		e.preventDefault();
		err = null;
		checking = true;
		try {
			const res = await fetch('/api/admin/session', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ password })
			});
			if (!res.ok) {
				const d = await res.json().catch(() => ({}));
				throw new Error(d.message ?? 'Login failed');
			}
			loggedIn = true;
			password = '';
			await load(true);
		} catch (e) {
			err = e instanceof Error ? e.message : 'Login failed';
		} finally {
			checking = false;
		}
	}

	async function logout() {
		await fetch('/api/admin/session', { method: 'DELETE' });
		loggedIn = false;
		posters = [];
	}

	async function load(reset: boolean) {
		if (!loggedIn) return;
		loading = true;
		err = null;
		const p = reset ? 1 : pageNum;
		if (reset) pageNum = 1;
		try {
			const u = new SvelteURLSearchParams();
			u.set('status', statusFilter);
			u.set('page', String(p));
			u.set('limit', '20');
			const res = await fetch(`/api/admin/posters?${u.toString()}`, { credentials: 'include' });
			const data = await res.json();
			if (!res.ok) throw new Error(data.message ?? 'Failed to load');
			const batch = (data.posters ?? []) as PosterRow[];
			posters = reset ? batch : [...posters, ...batch];
			hasMore = !!data.hasMore;
			if (batch.length) pageNum = p + 1;
		} catch (e) {
			err = e instanceof Error ? e.message : 'Failed';
			if (err === 'Unauthorized.') loggedIn = false;
		} finally {
			loading = false;
		}
	}

	async function deletePoster(id: string, title: string) {
		if (!confirm(`Delete “${title}” from the gallery? This cannot be undone.`)) return;
		err = null;
		try {
			const u = new SvelteURLSearchParams();
			u.set('id', id);
			const res = await fetch(`/api/admin/posters?${u.toString()}`, {
				method: 'DELETE',
				credentials: 'include'
			});
			const data = await res.json().catch(() => ({}));
			if (!res.ok) throw new Error(data.message ?? 'Failed');
			await load(true);
		} catch (e) {
			err = e instanceof Error ? e.message : 'Failed';
		}
	}
</script>

<svelte:head>
	<title>Moderation · ClimatePosters</title>
</svelte:head>

<div class="min-h-screen bg-slate-50 px-4 py-8 dark:bg-slate-950">
	<div class="mx-auto max-w-4xl space-y-6">
		<header class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
			<div>
				<h1 class="text-2xl font-bold text-slate-900 dark:text-slate-50">Poster moderation</h1>
				<p class="text-sm text-slate-600 dark:text-slate-400">
					New uploads appear in the gallery immediately. Remove posters here if they violate
					guidelines.
				</p>
			</div>
			<a
				class="text-sm font-medium text-emerald-800 underline dark:text-emerald-300"
				href={resolve('/')}>← Gallery</a
			>
		</header>

		{#if !loggedIn}
			<form
				class="max-w-md space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900"
				onsubmit={login}
			>
				<label class="block text-sm font-medium">
					Admin password
					<input
						class="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800"
						type="password"
						autocomplete="current-password"
						bind:value={password}
						required
					/>
				</label>
				{#if err}
					<p class="text-sm text-red-600" role="alert">{err}</p>
				{/if}
				<button
					type="submit"
					disabled={checking}
					class="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"
				>
					{checking ? 'Signing in…' : 'Sign in'}
				</button>
			</form>
		{:else}
			<div class="flex flex-wrap items-center gap-3">
				<label class="text-sm font-medium">
					Show
					<select
						class="ml-2 rounded border border-slate-300 px-2 py-1 dark:border-slate-600 dark:bg-slate-800"
						bind:value={statusFilter}
						onchange={() => load(true)}
					>
						<option value="approved">Live in gallery</option>
						<option value="removed">Previously removed</option>
						<option value="all">All records</option>
					</select>
				</label>
				<button
					type="button"
					class="ml-auto text-sm text-slate-600 underline dark:text-slate-400"
					onclick={logout}>Sign out</button
				>
			</div>

			{#if err}
				<p class="text-sm text-red-600" role="alert">{err}</p>
			{/if}

			<ul
				class="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white dark:divide-slate-700 dark:border-slate-700 dark:bg-slate-900"
			>
				{#each posters as p (p.id)}
					<li class="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
						<div>
							<p class="font-medium text-slate-900 dark:text-slate-100">{p.title}</p>
							<p class="text-xs text-slate-500">
								{p.status} · {new Date(p.created).toLocaleString()}
							</p>
						</div>
						<div class="flex flex-wrap gap-2">
							{#if p.status === 'approved'}
								<button
									type="button"
									class="rounded bg-red-700 px-3 py-1 text-xs font-semibold text-white hover:bg-red-800"
									onclick={() => deletePoster(p.id, p.title)}
								>
									Delete from gallery
								</button>
							{/if}
						</div>
					</li>
				{/each}
			</ul>

			{#if loading}
				<p class="text-sm text-slate-600">Loading…</p>
			{/if}

			{#if hasMore && posters.length > 0}
				<button
					type="button"
					class="w-full rounded-lg border border-slate-300 py-2 text-sm dark:border-slate-600"
					onclick={() => load(false)}
					disabled={loading}
				>
					Load more
				</button>
			{/if}
		{/if}
	</div>
</div>
