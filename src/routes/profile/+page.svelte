<script lang="ts">
	import { Camera, Upload } from 'lucide-svelte';

	let { data, form } = $props();
	let selectedName = $state('');

	let user = $derived(form?.user ?? data.user);

	function onFileChange(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		selectedName = input.files?.[0]?.name ?? '';
	}
</script>

<svelte:head>
	<title>Profile - NovelHive</title>
</svelte:head>

<main class="mx-auto w-full max-w-3xl px-4 py-10 md:px-6">
	<section class="rounded-xl border border-white/10 bg-surface/70 p-6 shadow-card">
		<div class="flex flex-col gap-6 sm:flex-row sm:items-center">
			<div class="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
				{#if user.avatar_url}
					<img src={user.avatar_url} alt="" class="h-full w-full object-cover" />
				{:else}
					<div class="grid h-full w-full place-items-center gradient-brand text-4xl font-bold text-white">
						{user.username[0]?.toUpperCase()}
					</div>
				{/if}
				<div class="absolute bottom-2 right-2 grid h-8 w-8 place-items-center rounded-full bg-background/90 text-brand">
					<Camera class="h-4 w-4" />
				</div>
			</div>

			<div class="min-w-0 flex-1">
				<h1 class="text-2xl font-bold">{user.username}</h1>
				<p class="mt-1 text-sm text-muted-foreground">{user.email}</p>
				<p class="mt-3 inline-flex rounded-full border border-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand">
					{user.role}
				</p>
			</div>
		</div>

		<form method="POST" enctype="multipart/form-data" class="mt-8 grid gap-4">
			<label class="grid gap-2">
				<span class="text-sm font-semibold">Profile photo</span>
				<input
					name="image"
					type="file"
					accept="image/jpeg,image/png,image/webp,image/gif"
					onchange={onFileChange}
					class="block w-full cursor-pointer rounded-lg border border-white/10 bg-white/5 text-sm text-muted-foreground file:mr-4 file:border-0 file:bg-brand file:px-4 file:py-2.5 file:text-sm file:font-bold file:text-white hover:bg-white/10"
				/>
			</label>

			<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<p class="min-h-5 text-sm text-muted-foreground">{selectedName}</p>
				<button
					type="submit"
					class="inline-flex items-center justify-center gap-2 rounded-lg gradient-brand px-4 py-2.5 text-sm font-bold text-white shadow-glow transition hover:opacity-90"
				>
					<Upload class="h-4 w-4" />
					Save Photo
				</button>
			</div>

			{#if form?.error}
				<p class="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{form.error}</p>
			{/if}
			{#if form?.success}
				<p class="rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-sm text-success">Profile photo updated.</p>
			{/if}
		</form>
	</section>
</main>
