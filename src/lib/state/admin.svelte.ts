import { toast } from "svelte-sonner";
import { confirmStore } from "./confirm.svelte";

export interface Novel {
  id: string;
  title: string;
  author: string;
  synopsis: string;
  status: string;
  cover_url?: string;
  total_chapters?: number;
  genres: any[];
}

export interface Chapter {
  id: string;
  number: number;
  title: string;
  word_count: number;
  novel_title?: string;
  novel_slug?: string;
  novel_id?: string;
}

export interface Genre {
  id: number;
  name: string;
  slug: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
}

export async function rpc(action: string, payload: any = {}) {
  const res = await fetch("/api/admin/rpc", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, payload }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Action failed");
  return data;
}

export class AdminState {
  novels = $state<Novel[]>([]);
  chapters = $state<Chapter[]>([]);
  genres = $state<Genre[]>([]);
  users = $state<User[]>([]);
  coverBase = $state<string | undefined>();
  busy = $state(false);

  // Form states for Novel Modal
  showNovelModal = $state(false);
  editingNovel = $state<Novel | null>(null);
  fTitle = $state("");
  fAuthor = $state("");
  fSynopsis = $state("");
  fStatus = $state("ongoing");
  fCoverUrl = $state("");
  fCoverPreview = $state("");
  fGenres = $state<string[]>([]);
  uploading = $state(false);

  // Genre form
  fGenreName = $state("");
  creatingGenre = $state(false);

  async loadNovels() {
    this.busy = true;
    try {
      const d = await rpc("listNovels");
      this.novels = d.novels || [];
      if (d.cover_base_url) this.coverBase = d.cover_base_url;
    } catch (e: any) {
      toast.error(e?.message || "Failed to load novels");
    } finally {
      this.busy = false;
    }
  }

  async loadChapters() {
    this.busy = true;
    try {
      const d = await rpc("listChapters");
      this.chapters = (d.chapters || []).map((c: any) => {
        const chap = c.chapter || c.Chapter || c;
        return {
          ...chap,
          novel_title: c.novel_title || c.NovelTitle || chap.novel_title,
          novel_slug: c.novel_slug || c.NovelSlug || chap.novel_slug,
          novel_id: c.novel_id || c.NovelId || chap.novel_id,
        };
      });
    } catch (e: any) {
      toast.error(e?.message || "Failed to load chapters");
    } finally {
      this.busy = false;
    }
  }

  async loadGenres() {
    this.busy = true;
    try {
      const d = await rpc("listGenres");
      this.genres = d.genres || [];
    } catch (e: any) {
      toast.error(e?.message || "Failed to load genres");
    } finally {
      this.busy = false;
    }
  }

  async loadUsers() {
    this.busy = true;
    try {
      const d = await rpc("listUsers");
      this.users = d.users || [];
    } catch (e: any) {
      toast.error(e?.message || "Failed to load users");
    } finally {
      this.busy = false;
    }
  }

  openNovelForm(n?: Novel) {
    this.editingNovel = n || null;
    const initialPreview = n && n.cover_url && this.coverBase ? `${this.coverBase}/${n.cover_url}` : "";
    this.fTitle = n?.title || "";
    this.fAuthor = n?.author || "";
    this.fSynopsis = n?.synopsis || "";
    this.fStatus = n?.status || "ongoing";
    this.fCoverUrl = n?.cover_url || "";
    this.fCoverPreview = initialPreview;
    this.fGenres = (n?.genres || []).map((g: any) => (typeof g === "string" ? g : g.name));
    this.showNovelModal = true;
  }

  async saveNovel() {
    const data = {
      title: this.fTitle,
      author: this.fAuthor,
      synopsis: this.fSynopsis,
      status: this.fStatus,
      cover_url: this.fCoverUrl,
      genres: this.fGenres,
    };
    try {
      if (this.editingNovel) {
        await rpc("updateNovel", { id: this.editingNovel.id, data });
      } else {
        await rpc("createNovel", data);
      }
      toast.success(this.editingNovel ? "Updated" : "Created");
      this.showNovelModal = false;
      this.loadNovels();
    } catch (e: any) {
      toast.error(e?.message);
    }
  }

  async deleteNovel(id: string, title?: string) {
    const ok = await confirmStore.prompt({
      title: "Delete Novel?",
      message: `Are you sure you want to delete ${title ? `<b>${title}</b>` : 'this novel'} and all of its chapters? This action cannot be undone.`,
      confirmText: "Delete",
      type: "danger"
    });
    if (!ok) return;

    confirmStore.setLoading(true);
    try {
      await rpc("deleteNovel", { id });
      toast.success("Deleted");
      await this.loadNovels();
    } catch (e: any) {
      toast.error(e?.message);
    } finally {
      confirmStore.close();
    }
  }

  async deleteChapter(id: string, number?: number) {
    const ok = await confirmStore.prompt({
      title: "Delete Chapter?",
      message: `Are you sure you want to delete ${number ? `chapter <b>${number}</b>` : 'this chapter'}?`,
      confirmText: "Delete",
      type: "danger"
    });
    if (!ok) return;

    confirmStore.setLoading(true);
    try {
      await rpc("deleteChapter", { id });
      toast.success("Deleted");
      await this.loadChapters();
    } catch (e: any) {
      toast.error(e?.message);
    } finally {
      confirmStore.close();
    }
  }

  async createGenre() {
    if (!this.fGenreName.trim() || this.creatingGenre) return;
    this.creatingGenre = true;
    try {
      await rpc("createGenre", { name: this.fGenreName.trim() });
      this.fGenreName = "";
      toast.success("Genre created");
      this.loadGenres();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      this.creatingGenre = false;
    }
  }

  async deleteGenre(id: number, name: string) {
    const ok = await confirmStore.prompt({
      title: "Delete Genre?",
      message: `Are you sure you want to delete the genre <b>${name}</b>?`,
      confirmText: "Delete",
      type: "danger"
    });
    if (!ok) return;

    confirmStore.setLoading(true);
    try {
      await rpc("deleteGenre", { id });
      toast.success("Deleted");
      await this.loadGenres();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      confirmStore.close();
    }
  }

  async setUserRole(id: string, currentRole: string) {
    const newRole = currentRole === "admin" ? "reader" : "admin";
    try {
      await rpc("setUserRole", { id, role: newRole });
      toast.success(`Role: ${newRole}`);
      this.loadUsers();
    } catch (e: any) {
      toast.error(e?.message);
    }
  }
}

export const adminStore = new AdminState();
