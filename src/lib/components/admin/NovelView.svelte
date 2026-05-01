<script lang="ts">
  import { adminStore } from "$lib/state/admin.svelte";
  import { buildCoverUrl, cn } from "$lib/utils";
  import { Pencil, Plus, Trash2 } from "lucide-svelte";
</script>

<div class="mb-4 flex items-center justify-between">
  <h2 class="font-display text-xl font-extrabold capitalize">novels</h2>
  <button
    onclick={() => adminStore.openNovelForm()}
    class="inline-flex items-center gap-2 rounded-xl gradient-brand px-4 py-2 text-sm font-bold text-white shadow-glow"
  >
    <Plus class="h-4 w-4" /> New novel
  </button>
</div>

<div class="overflow-hidden rounded-2xl border border-white/5 bg-card/60">
  <table class="w-full text-left">
    <thead>
      <tr class="bg-white/[0.02]">
        {#each ["Cover", "Title", "Author", "Status", "Ch.", ""] as h}
          <th class="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{h}</th>
        {/each}
      </tr>
    </thead>
    <tbody>
      {#each adminStore.novels as n}
        <tr class="border-t border-white/5">
          <td class="p-3">
            <div class="h-14 w-10 overflow-hidden rounded-md bg-white/5">
              {#if n.cover_url}
                <img src={buildCoverUrl(n.cover_url, adminStore.coverBase) || ""} class="h-full w-full object-cover" alt="Cover" />
              {/if}
            </div>
          </td>
          <td class="p-3 font-semibold">{n.title}</td>
          <td class="p-3 text-sm text-muted-foreground">{n.author}</td>
          <td class="p-3">
            <span
              class={cn(
                "rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                n.status === "completed"
                  ? "bg-success/20 text-success"
                  : n.status === "hiatus"
                    ? "bg-warning/20 text-warning"
                    : "bg-brand/20 text-brand",
              )}>{n.status}</span
            >
          </td>
          <td class="p-3 text-sm">{n.total_chapters ?? 0}</td>
          <td class="p-3 text-right">
            <div class="inline-flex items-center gap-2">
              <button
                onclick={() => adminStore.openNovelForm(n)}
                class="rounded-lg border border-white/10 bg-white/5 p-1.5 hover:bg-white/10"
                title="Edit"><Pencil class="h-3.5 w-3.5" /></button>
              <button
                onclick={() => adminStore.deleteNovel(n.id, n.title)}
                class="rounded-lg border border-destructive/30 bg-destructive/10 p-1.5 text-destructive hover:bg-destructive/20"
                title="Delete"><Trash2 class="h-3.5 w-3.5" /></button>
            </div>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>
