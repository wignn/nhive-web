import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useAuth } from "@/lib/auth-context";
import { getLibrary, listNovels } from "@/server-fns/novels.functions";
import { BookOpen, CheckCircle2, ClipboardList, Library, XCircle } from "lucide-react";
import { classNames } from "@/lib/novel-utils";

const TABS = [
  { key: "reading", label: "Reading", icon: BookOpen },
  { key: "completed", label: "Completed", icon: CheckCircle2 },
  { key: "plan_to_read", label: "Plan to read", icon: ClipboardList },
  { key: "dropped", label: "Dropped", icon: XCircle },
] as const;

export const Route = createFileRoute("/library")({
  head: () => ({ meta: [{ title: "My Library — NovelHive" }] }),
  component: LibraryPage,
});

function LibraryPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const fetchLib = useServerFn(getLibrary);
  const fetchNovels = useServerFn(listNovels);

  const [tab, setTab] = useState<typeof TABS[number]["key"]>("reading");
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) navigate({ to: "/login" });
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetchLib()
      .then(async (d: any) => {
        const raw: any[] = Array.isArray(d) ? d : d?.entries ?? [];
        const normalized = raw.map((e) => ({ ...e, status: e.status ?? "reading" }));
        // enrich with novel meta
        const needs = normalized.some((e) => !e.novel_title || !e.novel_slug);
        if (needs) {
          try {
            const r: any = await fetchNovels({ data: { query: "page=1&page_size=200&sort=updated" } });
            const map = new Map<string, any>();
            (r.novels || []).forEach((n: any) => map.set(n.id, n));
            setEntries(
              normalized.map((e) => {
                const n = map.get(e.novel_id);
                return n ? { ...e, novel_title: n.title, novel_slug: n.slug, total: n.total_chapters } : e;
              }),
            );
          } catch {
            setEntries(normalized);
          }
        } else {
          setEntries(normalized);
        }
      })
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, [user, fetchLib, fetchNovels]);

  if (!user) return null;

  const filtered = entries.filter((e) => e.status === tab);

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10 md:px-6">
      <div className="mb-6">
        <div className="text-xs font-bold uppercase tracking-widest text-brand">Personal</div>
        <h1 className="mt-1 font-display text-3xl font-extrabold md:text-4xl">My library</h1>
        <p className="mt-2 text-sm text-muted-foreground">Track everything you're reading, completed, or planning to start.</p>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-1.5 sm:grid-cols-4">
        {TABS.map((t) => {
          const Icon = t.icon;
          const count = entries.filter((e) => e.status === t.key).length;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={classNames(
                "flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-bold transition sm:text-sm",
                tab === t.key ? "gradient-brand text-white shadow-glow" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4" /> {t.label}
              <span className={classNames(
                "rounded-md px-1.5 py-0.5 text-[10px]",
                tab === t.key ? "bg-white/20" : "bg-white/5",
              )}>{count}</span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-white/5" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="grid place-items-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02] py-16 text-center">
          <Library className="mb-3 h-10 w-10 text-muted-foreground/60" />
          <p className="text-sm text-muted-foreground">Nothing here yet.</p>
          <Link to="/novels" className="mt-4 rounded-xl gradient-brand px-4 py-2 text-sm font-bold text-white shadow-glow">Browse novels</Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {filtered.map((e) => {
            const progress = e.progress ?? 0;
            const total = e.total ?? null;
            const pct = total ? Math.min(100, (progress / total) * 100) : 0;
            const inner = (
              <div className="rounded-2xl border border-white/5 bg-card/60 p-4 transition hover:border-brand/40 hover:bg-card">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="font-display text-base font-extrabold">{e.novel_title || "Unknown title"}</div>
                    <div className="text-xs text-muted-foreground">
                      Chapter {progress} {total ? `of ${total}` : ""}
                    </div>
                  </div>
                  {total ? <div className="text-xs font-bold text-brand">{Math.round(pct)}%</div> : null}
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/5">
                  <div className="h-full gradient-brand" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
            return e.novel_slug ? (
              <li key={e.novel_id || e.id}>
                <Link to="/novel/$slug" params={{ slug: e.novel_slug }}>{inner}</Link>
              </li>
            ) : <li key={e.novel_id || e.id}>{inner}</li>;
          })}
        </ul>
      )}
    </main>
  );
}
