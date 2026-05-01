<script lang="ts">
  import { adminStore } from "$lib/state/admin.svelte";
  import { Pencil, Plus, Trash2 } from "lucide-svelte";
</script>

<div class="mb-4 flex items-center justify-between">
  <h2 class="font-display text-xl font-extrabold capitalize">chapters</h2>
  <a
    href="/admin/chapter"
    class="inline-flex items-center gap-2 rounded-xl gradient-brand px-4 py-2 text-sm font-bold text-white shadow-glow"
  >
    <Plus class="h-4 w-4" /> New chapter
  </a>
</div>

<div class="overflow-hidden rounded-2xl border border-white/5 bg-card/60">
  <table class="w-full text-left">
    <thead>
      <tr class="bg-white/[0.02]">
        {#each ["Novel", "#", "Title", "Words", ""] as h}
          <th class="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{h}</th>
        {/each}
      </tr>
    </thead>
    <tbody>
      {#each adminStore.chapters as c}
        <tr class="border-t border-white/5">
          <td class="p-3 text-sm text-muted-foreground">{c.novel_title}</td>
          <td class="p-3 font-mono text-sm">{c.number}</td>
          <td class="p-3 font-semibold">{c.title}</td>
          <td class="p-3 text-sm">{c.word_count}</td>
          <td class="p-3 text-right">
            <div class="inline-flex items-center gap-2">
              <a
                href="/admin/chapter?id={c.id}&novel_slug={c.novel_slug}&number={c.number}"
                class="rounded-lg border border-white/10 bg-white/5 p-1.5 hover:bg-white/10"
                title="Edit"><Pencil class="h-3.5 w-3.5" /></a
              >
              <button
                onclick={() => adminStore.deleteChapter(c.id, c.number)}
                class="rounded-lg border border-destructive/30 bg-destructive/10 p-1.5 text-destructive hover:bg-destructive/20"
                title="Delete"><Trash2 class="h-3.5 w-3.5" /></button
              >
            </div>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>
