import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useAuth } from "@/lib/auth-context";
import { toast } from "@/lib/toast";
import {
  adminListNovels, adminListChapters, adminListUsers,
  adminCreateNovel, adminUpdateNovel, adminDeleteNovel,
  adminCreateChapter, adminUpdateChapter, adminDeleteChapter,
  adminSetUserRole,
} from "@/server-fns/admin.functions";
import { buildCoverUrl, classNames } from "@/lib/novel-utils";
import {
  BookOpen, FileText, Globe, Loader2, Pencil, Plus, Shield,
  Sparkles, Tags, Trash2, Upload, User, Users, X,
} from "lucide-react";
import logoImg from "@/assets/logo.ico";

const GENRES = [
  "Fantasy","Action","Romance","Adventure","Sci-Fi","Mystery","Horror",
  "Comedy","Drama","Slice of Life","Martial Arts","Isekai","Wuxia","Xianxia",
];

type Tab = "novels" | "chapters" | "genres" | "users";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin Panel — NovelHive" }] }),
  component: AdminPage,
});

function AdminPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) navigate({ to: "/login" });
    else if (user.role !== "admin") navigate({ to: "/" });
  }, [loading, user, navigate]);

  const [tab, setTab] = useState<Tab>("novels");
  const [novels, setNovels] = useState<any[]>([]);
  const [chapters, setChapters] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [coverBase, setCoverBase] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  const lN = useServerFn(adminListNovels);
  const lC = useServerFn(adminListChapters);
  const lU = useServerFn(adminListUsers);
  const cN = useServerFn(adminCreateNovel);
  const uN = useServerFn(adminUpdateNovel);
  const dN = useServerFn(adminDeleteNovel);
  const cC = useServerFn(adminCreateChapter);
  const uC = useServerFn(adminUpdateChapter);
  const dC = useServerFn(adminDeleteChapter);
  const setRole = useServerFn(adminSetUserRole);

  const reload = async () => {
    if (!user || user.role !== "admin") return;
    setBusy(true);
    try {
      if (tab === "novels") {
        const d: any = await lN();
        setNovels(d.novels || []);
        if (d.cover_base_url) setCoverBase(d.cover_base_url);
      } else if (tab === "chapters") {
        const d: any = await lC();
        setChapters((d.chapters || []).map((c: any) => ({ ...(c.Chapter || c), novel_title: c.NovelTitle || c.novel_title })));
      } else if (tab === "users") {
        const d: any = await lU();
        setUsers(d.users || []);
      }
    } catch (e: any) {
      toast.error(e?.message || "Failed to load");
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (user?.role === "admin") reload();
    // eslint-disable-next-line
  }, [tab, user?.role]);

  // Always fetch novels list (used by chapter modal)
  useEffect(() => {
    if (user?.role === "admin" && novels.length === 0 && tab !== "novels") {
      lN().then((d: any) => {
        setNovels(d.novels || []);
        if (d.cover_base_url) setCoverBase(d.cover_base_url);
      }).catch(() => {});
    }
    // eslint-disable-next-line
  }, [tab, user?.role]);

  if (loading || !user || user.role !== "admin") {
    return <main className="p-10 text-center text-sm text-muted-foreground">Checking permissions…</main>;
  }

  const stats = [
    { label: "Novels", value: novels.length, icon: BookOpen },
    { label: "Chapters", value: chapters.length, icon: FileText },
    { label: "Genres", value: GENRES.length, icon: Tags },
    { label: "Users", value: users.length, icon: Users },
  ];

  return (
    <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 px-4 py-6 md:grid-cols-[240px_1fr] md:px-6">
      {/* Sidebar */}
      <aside className="rounded-2xl border border-white/5 bg-card/60 p-4 md:sticky md:top-20 md:h-fit">
        <Link to="/" className="mb-4 flex items-center gap-2">
          <img src={logoImg} alt="NovelHive Logo" className="h-8 w-8" />
          <div>
            <div className="font-display text-sm font-extrabold gradient-text">NovelHive</div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Admin</div>
          </div>
        </Link>
        <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Manage</div>
        <nav className="mt-2 space-y-1">
          {(["novels","chapters","genres","users"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={classNames(
                "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold capitalize transition",
                tab === t ? "bg-brand/15 text-brand" : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
              )}
            >
              {t === "novels" && <BookOpen className="h-4 w-4" />}
              {t === "chapters" && <FileText className="h-4 w-4" />}
              {t === "genres" && <Tags className="h-4 w-4" />}
              {t === "users" && <Users className="h-4 w-4" />}
              {t}
            </button>
          ))}
        </nav>
        <div className="mt-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Shortcuts</div>
        <Link to="/" className="mt-2 flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-muted-foreground hover:bg-white/5 hover:text-foreground">
          <Globe className="h-4 w-4" /> View site
        </Link>
      </aside>

      {/* Main */}
      <section>
        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="rounded-2xl border border-white/5 bg-card/60 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-display text-2xl font-extrabold">{s.value}</div>
                    <div className="text-xs text-muted-foreground">{s.label}</div>
                  </div>
                  <div className="grid h-9 w-9 place-items-center rounded-lg gradient-brand/30 bg-brand/10 text-brand">
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Toolbar */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-extrabold capitalize">{tab}</h2>
          {(tab === "novels" || tab === "chapters") && (
            <button
              onClick={() => { setEditing(null); setShowModal(true); }}
              className="inline-flex items-center gap-2 rounded-xl gradient-brand px-4 py-2 text-sm font-bold text-white shadow-glow"
            >
              <Plus className="h-4 w-4" /> New {tab === "novels" ? "novel" : "chapter"}
            </button>
          )}
        </div>

        {busy ? (
          <div className="rounded-2xl border border-white/5 bg-card/60 p-12 text-center text-sm text-muted-foreground">
            <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin" /> Loading…
          </div>
        ) : (
          <>
            {tab === "novels" && (
              <Table head={["Cover","Title","Author","Status","Ch.",""]}>
                {novels.map((n) => (
                  <tr key={n.id} className="border-t border-white/5">
                    <td className="p-3">
                      <div className="h-14 w-10 overflow-hidden rounded-md bg-white/5">
                        {n.cover_url ? (
                          <img src={buildCoverUrl(n.cover_url, coverBase) || ""} className="h-full w-full object-cover" />
                        ) : null}
                      </div>
                    </td>
                    <td className="p-3 font-semibold">{n.title}</td>
                    <td className="p-3 text-sm text-muted-foreground">{n.author}</td>
                    <td className="p-3">
                      <span className={classNames(
                        "rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                        n.status === "completed" ? "bg-success/20 text-success" :
                        n.status === "hiatus" ? "bg-warning/20 text-warning" :
                        "bg-brand/20 text-brand",
                      )}>{n.status}</span>
                    </td>
                    <td className="p-3 text-sm">{n.total_chapters ?? 0}</td>
                    <td className="p-3 text-right">
                      <RowActions
                        onEdit={() => { setEditing(n); setShowModal(true); }}
                        onDelete={async () => {
                          if (!confirm("Delete this novel and its chapters?")) return;
                          try { await dN({ data: { id: n.id } }); toast.success("Deleted"); reload(); }
                          catch (e: any) { toast.error(e?.message); }
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </Table>
            )}

            {tab === "chapters" && (
              <Table head={["Novel","#","Title","Words",""]}>
                {chapters.map((c) => (
                  <tr key={c.id} className="border-t border-white/5">
                    <td className="p-3 text-sm text-muted-foreground">{c.novel_title}</td>
                    <td className="p-3 font-mono text-sm">{c.number}</td>
                    <td className="p-3 font-semibold">{c.title}</td>
                    <td className="p-3 text-sm">{c.word_count}</td>
                    <td className="p-3 text-right">
                      <RowActions
                        onEdit={() => { setEditing(c); setShowModal(true); }}
                        onDelete={async () => {
                          if (!confirm("Delete this chapter?")) return;
                          try { await dC({ data: { id: c.id } }); toast.success("Deleted"); reload(); }
                          catch (e: any) { toast.error(e?.message); }
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </Table>
            )}

            {tab === "genres" && (
              <div className="flex flex-wrap gap-2 rounded-2xl border border-white/5 bg-card/60 p-4">
                {GENRES.map((g) => (
                  <span key={g} className="rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold">{g}</span>
                ))}
              </div>
            )}

            {tab === "users" && (
              <Table head={["Username","Email","Role",""]}>
                {users.map((u) => (
                  <tr key={u.id} className="border-t border-white/5">
                    <td className="p-3 font-semibold">{u.username}</td>
                    <td className="p-3 text-sm text-muted-foreground">{u.email}</td>
                    <td className="p-3">
                      <span className={classNames(
                        "rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                        u.role === "admin" ? "bg-brand/20 text-brand" : "bg-white/10 text-muted-foreground",
                      )}>{u.role}</span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={async () => {
                          const newRole = u.role === "admin" ? "reader" : "admin";
                          try { await setRole({ data: { id: u.id, role: newRole } }); toast.success(`Role: ${newRole}`); reload(); }
                          catch (e: any) { toast.error(e?.message); }
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold hover:bg-white/10"
                      >
                        {u.role === "admin" ? <><User className="h-3.5 w-3.5" /> Make reader</> : <><Shield className="h-3.5 w-3.5" /> Make admin</>}
                      </button>
                    </td>
                  </tr>
                ))}
              </Table>
            )}
          </>
        )}
      </section>

      {/* MODAL */}
      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          {tab === "novels" ? (
            <NovelForm
              initial={editing}
              novels={novels}
              coverBase={coverBase}
              onCancel={() => setShowModal(false)}
              onSave={async (data) => {
                try {
                  if (editing) await uN({ data: { id: editing.id, data } });
                  else await cN({ data });
                  toast.success(editing ? "Updated" : "Created");
                  setShowModal(false);
                  reload();
                } catch (e: any) { toast.error(e?.message); }
              }}
            />
          ) : (
            <ChapterForm
              initial={editing}
              novels={novels}
              onCancel={() => setShowModal(false)}
              onSave={async (data) => {
                try {
                  if (editing) await uC({ data: { id: editing.id, title: data.title, content: data.content } });
                  else await cC({ data });
                  toast.success(editing ? "Updated" : "Created");
                  setShowModal(false);
                  reload();
                } catch (e: any) { toast.error(e?.message); }
              }}
            />
          )}
        </Modal>
      )}
    </div>
  );
}

function Table({ head, children }: { head: string[]; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/5 bg-card/60">
      <table className="w-full text-left">
        <thead>
          <tr className="bg-white/[0.02]">
            {head.map((h) => (
              <th key={h} className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

function RowActions({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="inline-flex items-center gap-2">
      <button onClick={onEdit} className="rounded-lg border border-white/10 bg-white/5 p-1.5 hover:bg-white/10" title="Edit"><Pencil className="h-3.5 w-3.5" /></button>
      <button onClick={onDelete} className="rounded-lg border border-destructive/30 bg-destructive/10 p-1.5 text-destructive hover:bg-destructive/20" title="Delete"><Trash2 className="h-3.5 w-3.5" /></button>
    </div>
  );
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-2xl max-h-[90vh] overflow-auto rounded-3xl border border-white/10 bg-card p-6 shadow-elevated">
        <div className="mb-4 flex items-center justify-end">
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-white/5"><X className="h-4 w-4" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function NovelForm({
  initial, coverBase, onCancel, onSave,
}: { initial?: any; novels: any[]; coverBase?: string; onCancel: () => void; onSave: (d: any) => Promise<void> }) {
  const initialPreview = useMemo(() => buildCoverUrl(initial?.cover_url, coverBase) || "", [initial, coverBase]);
  const [f, setF] = useState({
    title: initial?.title || "",
    author: initial?.author || "",
    synopsis: initial?.synopsis || "",
    status: initial?.status || "ongoing",
    cover_url: initial?.cover_url || "",
    cover_preview: initialPreview,
    genres: (initial?.genres || []).map((g: any) => (typeof g === "string" ? g : g.name)),
  });
  const [uploading, setUploading] = useState(false);

  const upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error("Upload failed");
      const r = await res.json();
      setF((s) => ({ ...s, cover_url: r.path, cover_preview: `${r.base_url}/${r.path}` }));
      toast.success("Cover uploaded");
    } catch (e: any) {
      toast.error(e?.message || "Upload failed");
    } finally { setUploading(false); }
  };

  return (
    <>
      <h2 className="mb-4 font-display text-xl font-extrabold">{initial ? "Edit novel" : "Create novel"}</h2>
      <div className="grid gap-3 md:grid-cols-2">
        <Input label="Title" value={f.title} onChange={(v) => setF({ ...f, title: v })} />
        <Input label="Author" value={f.author} onChange={(v) => setF({ ...f, author: v })} />
      </div>
      <div className="mt-3">
        <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Cover image</label>
        <div className="flex items-center gap-3">
          <div className="h-24 w-16 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-white/5">
            {f.cover_preview && <img src={f.cover_preview} className="h-full w-full object-cover" />}
          </div>
          <label className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 bg-white/[0.02] px-3 py-4 text-xs font-semibold text-muted-foreground hover:bg-white/5">
            <Upload className="h-4 w-4" /> {uploading ? "Uploading…" : "Upload cover"}
            <input type="file" accept="image/*" disabled={uploading} onChange={upload} className="hidden" />
          </label>
        </div>
      </div>
      <div className="mt-3">
        <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Synopsis</label>
        <textarea
          value={f.synopsis} onChange={(e) => setF({ ...f, synopsis: e.target.value })}
          className="min-h-24 w-full resize-y rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm focus:border-brand/60 focus:outline-none focus:ring-2 focus:ring-brand/30"
        />
      </div>
      <div className="mt-3">
        <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</label>
        <select
          value={f.status}
          onChange={(e) => setF({ ...f, status: e.target.value })}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm focus:outline-none"
        >
          <option className="bg-background" value="ongoing">Ongoing</option>
          <option className="bg-background" value="completed">Completed</option>
          <option className="bg-background" value="hiatus">Hiatus</option>
        </select>
      </div>
      <div className="mt-3">
        <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Genres</label>
        <div className="flex flex-wrap gap-1.5">
          {GENRES.map((g) => {
            const on = f.genres.includes(g);
            return (
              <button
                key={g} type="button"
                onClick={() => setF((s) => ({ ...s, genres: on ? s.genres.filter((x: string) => x !== g) : [...s.genres, g] }))}
                className={classNames(
                  "rounded-md border px-2 py-1 text-[11px] font-semibold transition",
                  on ? "border-brand bg-brand/15 text-brand" : "border-white/10 bg-white/5 text-muted-foreground hover:text-foreground",
                )}
              >{g}</button>
            );
          })}
        </div>
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <button onClick={onCancel} className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold">Cancel</button>
        <button
          onClick={() => onSave({
            title: f.title, author: f.author, synopsis: f.synopsis, status: f.status,
            cover_url: f.cover_url, genres: f.genres,
          })}
          className="rounded-xl gradient-brand px-4 py-2 text-sm font-bold text-white shadow-glow"
        >{initial ? "Save changes" : "Create"}</button>
      </div>
    </>
  );
}

function ChapterForm({
  initial, novels, onCancel, onSave,
}: { initial?: any; novels: any[]; onCancel: () => void; onSave: (d: any) => Promise<void> }) {
  const [f, setF] = useState({
    novel_id: initial?.novel_id || novels[0]?.id || "",
    number: initial?.number || 1,
    title: initial?.title || "",
    content: initial?.content || "",
  });
  return (
    <>
      <h2 className="mb-4 font-display text-xl font-extrabold">{initial ? "Edit chapter" : "Create chapter"}</h2>
      {!initial && (
        <div className="mb-3">
          <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Novel</label>
          <select
            value={f.novel_id}
            onChange={(e) => setF({ ...f, novel_id: e.target.value })}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm focus:outline-none"
          >
            {novels.map((n) => <option key={n.id} value={n.id} className="bg-background">{n.title}</option>)}
          </select>
        </div>
      )}
      <div className="grid grid-cols-[100px_1fr] gap-3">
        <Input label="Number" type="number" value={String(f.number)} onChange={(v) => setF({ ...f, number: parseInt(v) || 1 })} />
        <Input label="Title" value={f.title} onChange={(v) => setF({ ...f, title: v })} />
      </div>
      <div className="mt-3">
        <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Content</label>
        <textarea
          value={f.content}
          onChange={(e) => setF({ ...f, content: e.target.value })}
          className="min-h-64 w-full resize-y rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm focus:border-brand/60 focus:outline-none focus:ring-2 focus:ring-brand/30 font-mono"
        />
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <button onClick={onCancel} className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold">Cancel</button>
        <button
          onClick={() => onSave(f)}
          className="rounded-xl gradient-brand px-4 py-2 text-sm font-bold text-white shadow-glow"
        >{initial ? "Save changes" : "Publish"}</button>
      </div>
    </>
  );
}

function Input({
  label, value, onChange, type = "text",
}: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm focus:border-brand/60 focus:outline-none focus:ring-2 focus:ring-brand/30"
      />
    </div>
  );
}
