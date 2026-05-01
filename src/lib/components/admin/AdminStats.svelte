<script lang="ts">
  import { adminStore } from "$lib/state/admin.svelte";
  import { BookOpen, FileText, Tags, Users } from "lucide-svelte";

  const stats = $derived([
    { label: "Novels", value: adminStore.novels.length, icon: BookOpen },
    { label: "Chapters", value: adminStore.chapters.length, icon: FileText },
    { label: "Genres", value: adminStore.genres.length, icon: Tags },
    { label: "Users", value: adminStore.users.length, icon: Users },
  ]);
</script>

<div class="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
  {#each stats as s}
    <div class="rounded-2xl border border-white/5 bg-card/60 p-4">
      <div class="flex items-center justify-between">
        <div>
          <div class="font-display text-2xl font-extrabold">{s.value}</div>
          <div class="text-xs text-muted-foreground">{s.label}</div>
        </div>
        <div class="grid h-9 w-9 place-items-center rounded-lg gradient-brand/30 bg-brand/10 text-brand">
          <svelte:component this={s.icon} class="h-4 w-4" />
        </div>
      </div>
    </div>
  {/each}
</div>
