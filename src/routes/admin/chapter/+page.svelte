<script lang="ts">
  import { cn } from "$lib/utils";
  import { ArrowLeft, BookOpen, Loader2, Save, Send } from "lucide-svelte";
  import ChapterEditor from "$lib/components/ChapterEditor.svelte";
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import { chapterEditorStore } from "$lib/state/chapterEditor.svelte";
  import { onMount } from "svelte";

  let user = $derived($page.data.user);
  let params = $derived(new URL($page.url).searchParams);
  let editId = $derived(params.get("id") || "");
  let presetNovelId = $derived(params.get("novel_id") || "");
  let novelSlug = $derived(params.get("novel_slug"));
  let chapterNumber = $derived(params.get("number"));

  onMount(() => {
    if (!user || user.role !== "admin") {
      goto("/");
      return;
    }
    chapterEditorStore.init(editId, presetNovelId, novelSlug, chapterNumber);
  });
</script>

<svelte:head>
  <title>{chapterEditorStore.editing ? "Edit" : "New"} Chapter - Admin</title>
</svelte:head>

<div class="min-h-screen bg-background pb-20">
  <header class="sticky top-0 z-40 border-b border-white/5 bg-background/80 py-4 backdrop-blur-xl">
    <div class="container mx-auto px-4 flex items-center justify-between">
      <div class="flex items-center gap-4">
        <a href="/admin" class="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-card hover:bg-white/5">
          <ArrowLeft class="h-4 w-4" />
        </a>
        <div>
          <h1 class="font-display text-lg font-extrabold">{chapterEditorStore.editing ? "Edit Chapter" : "New Chapter"}</h1>
          <p class="text-xs text-muted-foreground">{chapterEditorStore.wordCount} words</p>
        </div>
      </div>
      <button
        onclick={() => chapterEditorStore.save()}
        disabled={chapterEditorStore.saving}
        class="inline-flex items-center gap-2 rounded-xl gradient-brand px-5 py-2.5 text-sm font-bold text-white shadow-glow transition disabled:opacity-50"
      >
        {#if chapterEditorStore.saving}
          <Loader2 class="h-4 w-4 animate-spin" />
        {:else if chapterEditorStore.editing}
          <Save class="h-4 w-4" />
        {:else}
          <Send class="h-4 w-4" />
        {/if}
        {chapterEditorStore.editing ? "Save Changes" : "Publish"}
      </button>
    </div>
  </header>

  {#if chapterEditorStore.loading}
    <div class="grid h-[50vh] place-items-center">
      <Loader2 class="h-8 w-8 animate-spin text-brand" />
    </div>
  {:else}
    <main class="container mx-auto mt-8 max-w-4xl px-4">
      <div class="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div class="space-y-2 lg:col-span-2">
          <label class="text-xs font-bold uppercase tracking-widest text-muted-foreground">Select Novel</label>
          <div class="relative">
            <BookOpen class="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <select
              bind:value={chapterEditorStore.fNovelId}
              class="w-full appearance-none rounded-xl border border-white/10 bg-card py-3 pl-10 pr-4 text-sm focus:border-brand/60 focus:outline-none focus:ring-2 focus:ring-brand/30"
              disabled={!!chapterEditorStore.editing}
            >
              {#if !chapterEditorStore.fNovelId}<option value="">-- Choose a novel --</option>{/if}
              {#each chapterEditorStore.novels as n}
                <option value={n.id}>{n.title}</option>
              {/each}
            </select>
          </div>
        </div>

        <div class="space-y-2">
          <label class="text-xs font-bold uppercase tracking-widest text-muted-foreground">Chapter No.</label>
          <input
            type="number"
            bind:value={chapterEditorStore.fNumber}
            min="1"
            class="w-full rounded-xl border border-white/10 bg-card px-4 py-3 text-sm focus:border-brand/60 focus:outline-none focus:ring-2 focus:ring-brand/30"
            disabled={!!chapterEditorStore.editing}
          />
        </div>
      </div>

      <div class="space-y-6">
        <div>
          <label class="mb-2 block text-xs font-bold uppercase tracking-widest text-muted-foreground">Chapter Title</label>
          <input
            bind:value={chapterEditorStore.fTitle}
            placeholder="e.g. The Beginning of the End"
            class="w-full rounded-2xl border border-white/10 bg-card px-5 py-4 text-lg font-bold focus:border-brand/60 focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
        </div>
        
        <div>
          <label class="mb-2 block text-xs font-bold uppercase tracking-widest text-muted-foreground">Content</label>
          <div class="overflow-hidden rounded-2xl border border-white/10 bg-card transition-all focus-within:border-brand/60 focus-within:ring-2 focus-within:ring-brand/30">
            <ChapterEditor bind:content={chapterEditorStore.fContent} />
          </div>
        </div>
      </div>
    </main>
  {/if}
</div>
