<script lang="ts">
  import { BookOpen, CheckCircle2, ClipboardList, Library, XCircle, Trash2, Loader2 } from "lucide-svelte";
  import { cn } from "$lib/utils";
  import { toast } from "svelte-sonner";
  import type { PageData, ActionData } from './$types';
  import NovelCard from "$lib/components/novel/NovelCard.svelte";
  import { enhance } from "$app/forms";
  import { confirmStore } from "$lib/state/confirm.svelte";

  let { data, form } = $props<{ data: PageData, form: ActionData }>();
  let entries = $derived(data.entries);
  let coverBase = $derived(data.coverBase);

  const TABS = [
    { key: "reading", label: "Reading", icon: BookOpen },
    { key: "completed", label: "Completed", icon: CheckCircle2 },
    { key: "plan_to_read", label: "Plan to read", icon: ClipboardList },
    { key: "dropped", label: "Dropped", icon: XCircle },
  ] as const;

  let tab = $state<typeof TABS[number]["key"]>("reading");
  let filtered = $derived(entries.filter((e) => e.status === tab));

  // Loading state for removing
  let removingId = $state<string | null>(null);

  $effect(() => {
    if (form?.success) {
      toast.success("Bookmark removed");
    } else if (form?.error) {
      toast.error(form.error);
    }
  });

  async function initiateDelete(id: string, title: string) {
    const ok = await confirmStore.prompt({
      title: "Remove Bookmark?",
      message: `Are you sure you want to remove <span class="font-semibold text-foreground">"${title}"</span> from your library? You will lose your reading progress tracking.`,
      confirmText: "Remove",
      type: "danger"
    });
    if (!ok) return;

    // Trigger the form submit programmatically
    const formEl = document.getElementById(`delete-form-${id}`) as HTMLFormElement;
    if (formEl) formEl.requestSubmit();
  }
</script>

<svelte:head>
  <title>My Library — NovelHive</title>
</svelte:head>

<main class="mx-auto w-full max-w-7xl px-4 py-10 md:px-6 2xl:px-8">
  <div class="mb-6">
    <div class="text-xs font-bold uppercase tracking-widest text-brand">Personal</div>
    <h1 class="mt-1 font-display text-3xl font-extrabold md:text-4xl">My library</h1>
    <p class="mt-2 text-sm text-muted-foreground">Track everything you're reading, completed, or planning to start.</p>
  </div>

  <div class="mb-6 grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-1.5 sm:grid-cols-4 max-w-3xl">
    {#each TABS as t}
      {@const count = entries.filter((e) => e.status === t.key).length}
      {@const Icon = t.icon}
      <button
        onclick={() => tab = t.key}
        class={cn(
          "flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-bold transition sm:text-sm",
          tab === t.key ? "gradient-brand text-white shadow-glow" : "text-muted-foreground hover:text-foreground hover:bg-white/5",
        )}
      >
        <Icon class="h-4 w-4" /> {t.label}
        <span class={cn(
          "rounded-md px-1.5 py-0.5 text-[10px]",
          tab === t.key ? "bg-white/20" : "bg-white/5",
        )}>{count}</span>
      </button>
    {/each}
  </div>

  {#if filtered.length === 0}
    <div class="grid place-items-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02] py-24 text-center max-w-3xl">
      <Library class="mb-3 h-12 w-12 text-muted-foreground/40" />
      <p class="text-sm font-semibold text-muted-foreground">Nothing here yet.</p>
      <a href="/novels" class="mt-6 rounded-xl gradient-brand px-5 py-2.5 text-sm font-bold text-white shadow-glow transition hover:opacity-90">Browse novels</a>
    </div>
  {:else}
    <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
      {#each filtered as e, i (e.novel_id)}
        <div class="relative group">
          <NovelCard 
            novel={{ 
              id: e.novel_id, 
              slug: e.novel_slug, 
              title: e.novel_title || "Unknown title", 
              cover_url: e.cover_url, 
              author: e.author, 
              total_chapters: e.total 
            }} 
            coverBase={coverBase} 
            index={i} 
          />
          
          <form 
            method="POST" 
            action="?/removeBookmark"
            id={`delete-form-${e.novel_id}`}
            use:enhance={() => {
              removingId = e.novel_id;
              confirmStore.setLoading(true);
              return async ({ result, update }) => {
                removingId = null;
                confirmStore.close();
                update({ reset: false });
                if (result.type === 'success') {
                  // Wait for the server to invalidate data
                }
              };
            }}
            class="absolute right-2 top-2 z-20 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
          >
            <input type="hidden" name="novelId" value={e.novel_id} />
            <button
              type="button"
              onclick={(ev) => {
                ev.preventDefault();
                initiateDelete(e.novel_id, e.novel_title || "Unknown title");
              }}
              disabled={removingId === e.novel_id}
              class="grid h-8 w-8 place-items-center rounded-lg border border-destructive/30 bg-black/60 text-destructive shadow-lg backdrop-blur hover:bg-destructive hover:text-white transition disabled:opacity-50"
              title="Remove Bookmark"
              aria-label="Remove Bookmark"
            >
              {#if removingId === e.novel_id}
                <Loader2 class="h-4 w-4 animate-spin" />
              {:else}
                <Trash2 class="h-4 w-4" />
              {/if}
            </button>
          </form>

          {#if e.total}
            {@const progress = e.progress ?? 0}
            {@const pct = Math.min(100, (progress / e.total) * 100)}
            <div class="absolute bottom-0 left-0 right-0 z-20 h-1.5 overflow-hidden rounded-b-xl bg-black/40 backdrop-blur">
              <div class="h-full gradient-brand" style="width: {pct}%"></div>
            </div>
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</main>
