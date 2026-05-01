<script lang="ts">
  import { cn } from "$lib/utils";
  import {
    ArrowLeft,
    BookOpen,
    Loader2,
    Save,
    Send,
  } from "lucide-svelte";
  import ChapterEditor from "$lib/components/ChapterEditor.svelte";
  import { toast } from "svelte-sonner";
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";

  let user = $derived($page.data.user);

  let params = $derived(new URL($page.url).searchParams);
  let editId = $derived(params.get("id") || "");
  let presetNovelId = $derived(params.get("novel_id") || "");

  let novels = $state<any[]>([]);
  let loading = $state(true);
  let saving = $state(false);
  let editing = $state<any>(null);

  let fNovelId = $state("");
  let fNumber = $state(1);
  let fTitle = $state("");
  let fContent = $state("");

  let wordCount = $derived(
    fContent
      .trim()
      .split(/\s+/)
      .filter((w) => w.length > 0).length
  );

  async function rpc(action: string, payload: any = {}) {
    const res = await fetch("/api/admin/rpc", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, payload }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Action failed");
    return data;
  }

  async function init() {
    if (!user || user.role !== "admin") {
      goto("/");
      return;
    }
    loading = true;
    try {
      const d = await rpc("listNovels");
      novels = d.novels || [];

      const novelSlug = params.get("novel_slug");
      const chapterNumber = params.get("number");

      if (novelSlug && chapterNumber) {
        try {
          const ch = await rpc("getChapter", { novel_slug: novelSlug, number: chapterNumber });
          editing = ch;
          fNovelId = ch.novel_id || "";
          fNumber = ch.number || 1;
          fTitle = ch.title || "";
          fContent = ch.content || "";
        } catch (err) {
          toast.error("Failed to load full chapter content");
        }
      } else if (editId) {
        const chaptersData = await rpc("listChapters");
        const chapters = (chaptersData.chapters || []).map((c: any) => ({
          ...(c.Chapter || c.chapter || c),
          novel_title: c.NovelTitle || c.novel_title,
        }));
        const ch = chapters.find((c: any) => c.id === editId);
        if (ch) {
          editing = ch;
          fNovelId = ch.novel_id || "";
          fNumber = ch.number || 1;
          fTitle = ch.title || "";
          fContent = ch.content || "";
        } else {
          toast.error("Chapter not found");
        }
      } else {
        fNovelId = presetNovelId || novels[0]?.id || "";
        fNumber = 1;
        fTitle = "";
        fContent = "";
      }
    } catch (e: any) {
      toast.error(e?.message || "Failed to load");
    } finally {
      loading = false;
    }
  }

  $effect(() => {
    if (user?.role === "admin") init();
  });

  async function save() {
    if (!fNovelId) {
      toast.error("Please select a novel");
      return;
    }
    if (!fTitle.trim()) {
      toast.error("Please enter a chapter title");
      return;
    }
    if (!fContent.trim()) {
      toast.error("Please write some content");
      return;
    }
    saving = true;
    try {
      if (editing) {
        await rpc("updateChapter", {
          id: editing.id,
          title: fTitle,
          content: fContent,
        });
        toast.success("Chapter updated!");
      } else {
        await rpc("createChapter", {
          novel_id: fNovelId,
          number: fNumber,
          title: fTitle,
          content: fContent,
        });
        toast.success("Chapter published!");
      }
      goto("/admin?tab=chapters");
    } catch (e: any) {
      toast.error(e?.message || "Failed to save");
    } finally {
      saving = false;
    }
  }

  let selectedNovel = $derived(novels.find((n) => n.id === fNovelId));
</script>

<svelte:head>
  <title>{editing ? "Edit Chapter" : "New Chapter"} — NovelHive Admin</title>
</svelte:head>

{#if loading}
  <main class="flex min-h-[70vh] items-center justify-center">
    <div class="text-center">
      <Loader2 class="mx-auto mb-3 h-8 w-8 animate-spin text-brand" />
      <p class="text-sm text-muted-foreground">Loading editor…</p>
    </div>
  </main>
{:else}
  <div class="mx-auto w-full max-w-[1200px] px-4 py-6 md:px-6">
    <!-- Top bar -->
    <div class="mb-6 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <a
          href="/admin?tab=chapters"
          class="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground transition"
        >
          <ArrowLeft class="h-4 w-4" />
        </a>
        <div>
          <h1 class="font-display text-xl font-extrabold md:text-2xl">
            {editing ? "Edit Chapter" : "New Chapter"}
          </h1>
          {#if selectedNovel}
            <p class="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
              <BookOpen class="h-3 w-3" />
              {selectedNovel.title}
            </p>
          {/if}
        </div>
      </div>

      <div class="flex items-center gap-2">
        <span class="hidden sm:inline text-xs text-muted-foreground tabular-nums">
          {wordCount} words
        </span>
        <button
          onclick={save}
          disabled={saving}
          class={cn(
            "inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-glow transition",
            saving ? "opacity-60 cursor-not-allowed bg-muted" : "gradient-brand hover:opacity-90"
          )}
        >
          {#if saving}
            <Loader2 class="h-4 w-4 animate-spin" />
          {:else if editing}
            <Save class="h-4 w-4" />
          {:else}
            <Send class="h-4 w-4" />
          {/if}
          {saving ? "Saving…" : editing ? "Save Changes" : "Publish"}
        </button>
      </div>
    </div>

    <!-- Meta fields -->
    <div class="mb-5 rounded-2xl border border-white/5 bg-card/60 p-5">
      <div class="grid gap-4 sm:grid-cols-[1fr_200px_100px]">
        <!-- Novel picker -->
        <div>
          <label class="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Novel
          </label>
          {#if editing}
            <div class="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-muted-foreground">
              <BookOpen class="h-4 w-4 shrink-0" />
              {selectedNovel?.title || "Unknown"}
            </div>
          {:else}
            <select
              bind:value={fNovelId}
              class="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm focus:border-brand/60 focus:outline-none focus:ring-2 focus:ring-brand/30"
            >
              {#each novels as n}
                <option value={n.id} class="bg-background">{n.title}</option>
              {/each}
            </select>
          {/if}
        </div>

        <!-- Title -->
        <div>
          <label class="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Chapter Title
          </label>
          <input
            bind:value={fTitle}
            placeholder="e.g. The Beginning"
            class="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm focus:border-brand/60 focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
        </div>

        <!-- Number -->
        <div>
          <label class="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Chapter #
          </label>
          <input
            type="number"
            bind:value={fNumber}
            min="1"
            class="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-center focus:border-brand/60 focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
        </div>
      </div>
    </div>

    <!-- Editor -->
    <div class="mb-6">
      <ChapterEditor
        content={fContent}
        onchange={(text) => (fContent = text)}
        placeholder="Start writing your chapter…"
      />
    </div>

    <!-- Bottom bar -->
    <div class="flex items-center justify-between rounded-2xl border border-white/5 bg-card/60 px-5 py-3">
      <span class="text-xs text-muted-foreground tabular-nums">
        {wordCount} words
      </span>
      <div class="flex items-center gap-2">
        <a
          href="/admin?tab=chapters"
          class="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-white/10 hover:text-foreground transition"
        >
          Cancel
        </a>
        <button
          onclick={save}
          disabled={saving}
          class={cn(
            "inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-glow transition",
            saving ? "opacity-60 cursor-not-allowed bg-muted" : "gradient-brand hover:opacity-90"
          )}
        >
          {#if saving}
            <Loader2 class="h-4 w-4 animate-spin" />
          {:else if editing}
            <Save class="h-4 w-4" />
          {:else}
            <Send class="h-4 w-4" />
          {/if}
          {saving ? "Saving…" : editing ? "Save Changes" : "Publish"}
        </button>
      </div>
    </div>
  </div>
{/if}
