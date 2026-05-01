<script lang="ts">
  import { adminStore } from "$lib/state/admin.svelte";
  import { cn } from "$lib/utils";
  import { Loader2, X } from "lucide-svelte";
</script>

<div class="mb-4 flex items-center justify-between">
  <h2 class="font-display text-xl font-extrabold capitalize">genres</h2>
</div>

<div class="mb-4">
  <div class="flex gap-2">
    <input
      bind:value={adminStore.fGenreName}
      placeholder="New genre name..."
      class="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-sm focus:border-brand/60 focus:outline-none focus:ring-2 focus:ring-brand/30"
      onkeydown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          adminStore.createGenre();
        }
      }}
    />
    <button
      type="button"
      disabled={!adminStore.fGenreName.trim() || adminStore.creatingGenre}
      onclick={() => adminStore.createGenre()}
      class={cn(
        "whitespace-nowrap rounded-xl px-4 py-2 text-sm font-bold text-white shadow-glow transition",
        !adminStore.fGenreName.trim() || adminStore.creatingGenre
          ? "cursor-not-allowed bg-muted opacity-50"
          : "cursor-pointer gradient-brand",
      )}
    >
      {#if adminStore.creatingGenre}
        <Loader2 class="mr-1 inline h-4 w-4 animate-spin" />
      {/if}
      Create Genre
    </button>
  </div>
</div>

<div class="flex flex-wrap gap-2 rounded-2xl border border-white/5 bg-card/60 p-4">
  {#if adminStore.genres.length === 0}
    <p class="text-sm text-muted-foreground">No genres yet. Create one above.</p>
  {:else}
    {#each adminStore.genres as g}
      <span
        class="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/5 py-1 pl-3 pr-1 text-xs font-semibold"
      >
        {g.name}
        <button
          type="button"
          onclick={() => adminStore.deleteGenre(g.id, g.name)}
          class="rounded px-1.5 py-1 text-muted-foreground hover:bg-destructive/20 hover:text-destructive"
          ><X class="h-3.5 w-3.5" /></button
        >
      </span>
    {/each}
  {/if}
</div>
