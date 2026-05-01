<script lang="ts">
  import { cn } from "$lib/utils";
  import { BookOpen, FileText, Globe, Tags, Users } from "lucide-svelte";

  let { tab = $bindable("novels") } = $props<{ tab: string }>();
</script>

<aside class="rounded-2xl border border-white/5 bg-card/60 p-4 md:sticky md:top-20 md:h-fit">
  <a href="/" class="mb-4 flex items-center gap-2">
    <img src="/logo.ico" alt="NovelHive Logo" class="h-8 w-8" />
    <div>
      <div class="font-display text-sm font-extrabold gradient-text">NovelHive</div>
      <div class="text-[10px] uppercase tracking-widest text-muted-foreground">Admin</div>
    </div>
  </a>
  <div class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Manage</div>
  <nav class="mt-2 space-y-1">
    {#each ["novels", "chapters", "genres", "users"] as t}
      <button
        onclick={() => (tab = t)}
        class={cn(
          "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold capitalize transition",
          tab === t ? "bg-brand/15 text-brand" : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
        )}
      >
        {#if t === "novels"}<BookOpen class="h-4 w-4" />{/if}
        {#if t === "chapters"}<FileText class="h-4 w-4" />{/if}
        {#if t === "genres"}<Tags class="h-4 w-4" />{/if}
        {#if t === "users"}<Users class="h-4 w-4" />{/if}
        {t}
      </button>
    {/each}
  </nav>
  <div class="mt-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Shortcuts</div>
  <a
    href="/"
    class="mt-2 flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-muted-foreground hover:bg-white/5 hover:text-foreground"
  >
    <Globe class="h-4 w-4" /> View site
  </a>
</aside>
