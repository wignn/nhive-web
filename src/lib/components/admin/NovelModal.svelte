<script lang="ts">
  import { adminStore } from "$lib/state/admin.svelte";
  import { cn } from "$lib/utils";
  import { Loader2, Upload, X } from "lucide-svelte";
  import { toast } from "svelte-sonner";

  async function handleCoverUpload(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be < 2MB");
      return;
    }
    adminStore.uploading = true;
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
     });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      adminStore.fCoverUrl = data.path;
      adminStore.fCoverPreview = data.url;
    } catch (e: any) {
      toast.error(e?.message || "Upload failed");
    } finally {
      adminStore.uploading = false;
    }
  }

  function toggleGenre(name: string) {
    if (adminStore.fGenres.includes(name)) {
      adminStore.fGenres = adminStore.fGenres.filter((g) => g !== name);
    } else {
      adminStore.fGenres = [...adminStore.fGenres, name];
    }
  }
</script>

{#if adminStore.showNovelModal}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="absolute inset-0 bg-background/80 backdrop-blur-sm" onclick={() => (adminStore.showNovelModal = false)}></div>
    <div class="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 bg-card p-6 shadow-2xl">
      <div class="mb-6 flex items-center justify-between">
        <h2 class="font-display text-2xl font-extrabold">{adminStore.editingNovel ? "Edit" : "New"} Novel</h2>
        <button
          onclick={() => (adminStore.showNovelModal = false)}
          class="rounded-full p-2 text-muted-foreground hover:bg-white/5 hover:text-foreground"
        >
          <X class="h-5 w-5" />
        </button>
      </div>

      <div class="space-y-4">
        <!-- Cover Upload -->
        <div>
          <label class="mb-2 block text-sm font-bold uppercase tracking-widest text-muted-foreground">Cover</label>
          <div class="flex items-start gap-4">
            <div class="relative h-32 w-24 flex-shrink-0 overflow-hidden rounded-xl border border-white/10 bg-white/5">
              {#if adminStore.fCoverPreview}
                <img src={adminStore.fCoverPreview} alt="Preview" class="h-full w-full object-cover" />
              {:else}
                <div class="grid h-full w-full place-items-center text-muted-foreground"><Upload class="h-6 w-6" /></div>
              {/if}
              {#if adminStore.uploading}
                <div class="absolute inset-0 grid place-items-center bg-background/80 backdrop-blur-sm">
                  <Loader2 class="h-6 w-6 animate-spin text-brand" />
                </div>
              {/if}
            </div>
            <div class="flex-1">
              <input type="file" accept="image/*" onchange={handleCoverUpload} class="w-full text-sm file:mr-4 file:rounded-full file:border-0 file:bg-brand/10 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand hover:file:bg-brand/20" />
              <p class="mt-2 text-xs text-muted-foreground">JPG/PNG/WEBP, max 2MB. Recommended ratio 2:3.</p>
            </div>
          </div>
        </div>

        <div class="grid gap-4 md:grid-cols-2">
          <div>
            <label class="mb-2 block text-sm font-bold uppercase tracking-widest text-muted-foreground">Title</label>
            <input bind:value={adminStore.fTitle} class="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 focus:border-brand/60 focus:outline-none focus:ring-2 focus:ring-brand/30" />
          </div>
          <div>
            <label class="mb-2 block text-sm font-bold uppercase tracking-widest text-muted-foreground">Author</label>
            <input bind:value={adminStore.fAuthor} class="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 focus:border-brand/60 focus:outline-none focus:ring-2 focus:ring-brand/30" />
          </div>
        </div>

        <div>
          <label class="mb-2 block text-sm font-bold uppercase tracking-widest text-muted-foreground">Synopsis</label>
          <textarea bind:value={adminStore.fSynopsis} rows="4" class="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 focus:border-brand/60 focus:outline-none focus:ring-2 focus:ring-brand/30"></textarea>
        </div>

        <div>
          <label class="mb-2 block text-sm font-bold uppercase tracking-widest text-muted-foreground">Status</label>
          <select bind:value={adminStore.fStatus} class="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 focus:border-brand/60 focus:outline-none focus:ring-2 focus:ring-brand/30">
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
            <option value="hiatus">Hiatus</option>
          </select>
        </div>

        <div>
          <label class="mb-2 block text-sm font-bold uppercase tracking-widest text-muted-foreground">Genres</label>
          <div class="flex flex-wrap gap-2">
            {#each adminStore.genres as g}
              <button
                type="button"
                onclick={() => toggleGenre(g.name)}
                class={cn("rounded-md border px-3 py-1 text-xs font-semibold transition", adminStore.fGenres.includes(g.name) ? "border-brand bg-brand/20 text-brand" : "border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10")}
              >
                {g.name}
              </button>
            {/each}
          </div>
        </div>

        <div class="pt-4 text-right">
          <button onclick={() => (adminStore.showNovelModal = false)} class="mr-2 rounded-xl px-4 py-2 text-sm font-bold text-muted-foreground hover:text-foreground transition">Cancel</button>
          <button onclick={() => adminStore.saveNovel()} class="rounded-xl gradient-brand px-6 py-2 text-sm font-bold text-white shadow-glow transition">Save Novel</button>
        </div>
      </div>
    </div>
  </div>
{/if}
