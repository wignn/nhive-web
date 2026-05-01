import { rpc } from "./admin.svelte";
import { toast } from "svelte-sonner";
import { goto } from "$app/navigation";

export class ChapterEditorState {
  novels = $state<any[]>([]);
  loading = $state(true);
  saving = $state(false);
  editing = $state<any>(null);

  fNovelId = $state("");
  fNumber = $state(1);
  fTitle = $state("");
  fContent = $state("");

  wordCount = $derived(
    this.fContent
      .trim()
      .split(/\s+/)
      .filter((w) => w.length > 0).length,
  );

  async init(editId: string, presetNovelId: string, novelSlug: string | null, chapterNumber: string | null) {
    this.loading = true;
    try {
      const d = await rpc("listNovels");
      this.novels = d.novels || [];

      if (novelSlug && chapterNumber) {
        try {
          const ch = await rpc("getChapter", { novel_slug: novelSlug, number: chapterNumber });
          this.editing = ch;
          this.fNovelId = ch.novel_id || "";
          this.fNumber = ch.number || 1;
          this.fTitle = ch.title || "";
          this.fContent = ch.content || "";
        } catch (err) {
          toast.error("Failed to load full chapter content");
        }
      } else if (editId) {
        const chaptersData = await rpc("listChapters");
        const chapters = (chaptersData.chapters || []).map((c: any) => {
          const chap = c.chapter || c.Chapter || c;
          return {
            ...chap,
            novel_title: c.novel_title || c.NovelTitle || chap.novel_title,
          };
        });
        const ch = chapters.find((c: any) => c.id === editId);
        if (ch) {
          this.editing = ch;
          this.fNovelId = ch.novel_id || "";
          this.fNumber = ch.number || 1;
          this.fTitle = ch.title || "";
          this.fContent = ch.content || "";
        } else {
          toast.error("Chapter not found");
        }
      } else {
        this.fNovelId = presetNovelId || this.novels[0]?.id || "";
        this.fNumber = 1;
        this.fTitle = "";
        this.fContent = "";
      }
    } catch (e: any) {
      toast.error(e?.message || "Failed to load");
    } finally {
      this.loading = false;
    }
  }

  async save() {
    if (!this.fNovelId) {
      toast.error("Please select a novel");
      return;
    }
    if (!this.fTitle.trim()) {
      toast.error("Please enter a chapter title");
      return;
    }
    if (!this.fContent.trim()) {
      toast.error("Please write some content");
      return;
    }
    this.saving = true;
    try {
      if (this.editing) {
        await rpc("updateChapter", {
          id: this.editing.id,
          title: this.fTitle,
          content: this.fContent,
        });
        toast.success("Chapter updated");
      } else {
        await rpc("createChapter", {
          novel_id: this.fNovelId,
          number: this.fNumber,
          title: this.fTitle,
          content: this.fContent,
        });
        toast.success("Chapter created");
      }
      goto("/admin");
    } catch (e: any) {
      toast.error(e?.message || "Failed to save");
    } finally {
      this.saving = false;
    }
  }
}

export const chapterEditorStore = new ChapterEditorState();
