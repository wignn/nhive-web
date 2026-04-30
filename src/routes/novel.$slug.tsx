import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getNovel, listChapters, getLibrary, addToLibrary, removeFromLibrary } from "@/server-fns/novels.functions";
import { buildCoverUrl, classNames, formatCount } from "@/lib/novel-utils";
import { useAuth } from "@/lib/auth-context";
import { toast } from "@/lib/toast";
import { BookmarkCheck, BookmarkPlus, BookOpen, Eye, Loader2, PlayCircle } from "lucide-react";

export const Route = createFileRoute("/novel/$slug")({
  component: NovelDetailPage,
});

const normalize = (id?: string) => (id || "").replace(/-/g, "").toLowerCase();

function NovelDetailPage() {
  const { slug } = Route.useParams();
  const { user } = useAuth();
  const fetchNovel = useServerFn(getNovel);
  const fetchChapters = useServerFn(listChapters);
  const fetchLibrary = useServerFn(getLibrary);
  const addLib = useServerFn(addToLibrary);
  const removeLib = useServerFn(removeFromLibrary);

  const [novel, setNovel] = useState<any>(null);
  const [coverBase, setCoverBase] = useState<string | undefined>();
  const [chapters, setChapters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [libEntry, setLibEntry] = useState<any>(null);
  const [libBusy, setLibBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    const tasks: Promise<any>[] = [
      fetchNovel({ data: { slug } }),
      fetchChapters({ data: { slug } }),
    ];
    if (user) tasks.push(fetchLibrary());

    Promise.all(tasks)
      .then(([n, c, lib]: any) => {
        if (!alive) return;
        const novelData = n.novel || n;
        setNovel(novelData);
        if (n.cover_base_url) setCoverBase(n.cover_base_url);
        setChapters(c.chapters || []);
        if (lib && novelData?.id) {
          const list: any[] = Array.isArray(lib) ? lib : lib?.entries ?? [];
          setLibEntry(list.find((e) => normalize(e.novel_id) === normalize(novelData.id)) ?? null);
        }
      })
      .catch(() => toast.error("Failed to load novel"))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [slug, user, fetchNovel, fetchChapters, fetchLibrary]);

  const cover = useMemo(() => buildCoverUrl(novel?.cover_url, coverBase), [novel, coverBase]);
  const inLibrary = !!libEntry;

  const toggleLibrary = async () => {
    if (!user) { toast.info("Sign in to manage your library"); return; }
    if (!novel?.id) return;
    setLibBusy(true);
    try {
      if (inLibrary) {
        await removeLib({ data: { novelId: libEntry.novel_id } });
        setLibEntry(null);
        toast.success("Removed from library");
      } else {
        await addLib({ data: { novelId: novel.id } });
        const lib: any = await fetchLibrary();
        const list: any[] = Array.isArray(lib) ? lib : lib?.entries ?? [];
        setLibEntry(list.find((e) => normalize(e.novel_id) === normalize(novel.id)) ?? null);
        toast.success("Added to library");
      }
    } catch (e: any) {
      toast.error(e?.message || "Library update failed");
    } finally {
      setLibBusy(false);
    }
  };

  if (loading) {
    return (
      <main className="mx-auto w-full max-w-6xl px-4 py-10 md:px-6">
        <div className="grid gap-6 md:grid-cols-[260px_1fr]">
          <div className="cover-frame animate-pulse rounded-2xl bg-white/5" />
          <div className="space-y-4">
            <div className="h-10 w-2/3 animate-pulse rounded bg-white/5" />
            <div className="h-5 w-40 animate-pulse rounded bg-white/5" />
            <div className="h-32 w-full animate-pulse rounded bg-white/5" />
          </div>
        </div>
      </main>
    );
  }
  if (!novel) {
    return <main className="mx-auto max-w-3xl p-10 text-center">Novel not found.</main>;
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 md:px-6">
      {/* Backdrop */}
      <div className="relative mb-8 overflow-hidden rounded-3xl border border-white/5">
        <div
          className="absolute inset-0 -z-10 scale-110 opacity-40 blur-2xl"
          style={{
            backgroundImage: cover ? `url(${cover})` : undefined,
            backgroundSize: "cover", backgroundPosition: "center",
          }}
          aria-hidden
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-background via-background/85 to-background/40" aria-hidden />

        <div className="grid gap-6 p-5 md:grid-cols-[260px_1fr] md:gap-8 md:p-8">
          {/* Cover */}
          <div className="mx-auto w-44 md:mx-0 md:w-full">
            <div className="cover-frame rounded-2xl shadow-elevated ring-1 ring-white/10">
              {cover ? (
                <img src={cover} alt={novel.title} className="absolute inset-0 h-full w-full object-cover" />
              ) : (
                <div className="absolute inset-0 grid place-items-center text-muted-foreground/40">
                  <BookOpen className="h-14 w-14" />
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {novel.status && (
                <span className={classNames(
                  "rounded-md px-2 py-0.5 font-bold uppercase tracking-wider",
                  novel.status === "completed" ? "bg-success/20 text-success" :
                  novel.status === "hiatus" ? "bg-warning/20 text-warning" :
                  "bg-brand/20 text-brand",
                )}>
                  {novel.status}
                </span>
              )}
              {novel.genres?.map((g: any) => (
                <span key={g.id} className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 font-semibold text-muted-foreground">
                  {g.name}
                </span>
              ))}
            </div>

            <h1 className="mt-3 font-display text-3xl font-extrabold leading-tight md:text-5xl">
              {novel.title}
            </h1>
            <div className="mt-1 text-sm text-muted-foreground">
              by <span className="font-semibold text-foreground">{novel.author}</span>
            </div>

            <p className="mt-4 max-w-2xl text-sm text-muted-foreground md:text-base">{novel.synopsis}</p>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              {chapters.length > 0 && (
                <Link
                  to="/novel/$slug/$number"
                  params={{ slug, number: String(libEntry?.progress > 0 ? libEntry.progress : chapters[0].number) }}
                  className="inline-flex items-center gap-2 rounded-xl gradient-brand px-5 py-2.5 text-sm font-bold text-white shadow-glow hover:opacity-90"
                >
                  <PlayCircle className="h-4 w-4" />
                  {libEntry?.progress > 0 ? `Continue ch. ${libEntry.progress}` : "Start reading"}
                </Link>
              )}
              <button
                onClick={toggleLibrary}
                disabled={libBusy}
                className={classNames(
                  "inline-flex items-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-semibold transition",
                  inLibrary ? "border-success/50 bg-success/10 text-success" : "border-white/10 bg-white/5 hover:bg-white/10",
                )}
              >
                {libBusy ? <Loader2 className="h-4 w-4 animate-spin" /> :
                  inLibrary ? <BookmarkCheck className="h-4 w-4" /> : <BookmarkPlus className="h-4 w-4" />}
                {inLibrary ? "In library" : "Add to library"}
              </button>
            </div>

            <div className="mt-6 grid max-w-md grid-cols-3 gap-3">
              <Stat label="Chapters" value={novel.total_chapters} />
              <Stat label="Views" value={typeof novel.view_count === "number" ? formatCount(novel.view_count) : "—"} />
              <Stat label="Status" value={novel.status} capitalize />
            </div>
          </div>
        </div>
      </div>

      {/* Chapters */}
      <section>
        <div className="mb-4 flex items-end justify-between">
          <h2 className="font-display text-2xl font-extrabold">Chapters</h2>
          <span className="text-xs text-muted-foreground">{chapters.length} total</span>
        </div>
        {chapters.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] py-12 text-center text-muted-foreground">
            No chapters published yet.
          </div>
        ) : (
          <ul className="overflow-hidden rounded-2xl border border-white/5 bg-card/60">
            {chapters.map((c: any, i: number) => (
              <li key={c.id}>
                <Link
                  to="/novel/$slug/$number"
                  params={{ slug, number: String(c.number) }}
                  className={classNames(
                    "flex items-center gap-4 px-4 py-3 transition hover:bg-white/5 md:px-6",
                    i !== chapters.length - 1 && "border-b border-white/5",
                  )}
                >
                  <span className="grid h-9 w-12 shrink-0 place-items-center rounded-md bg-white/5 text-xs font-bold text-muted-foreground">
                    {c.number}
                  </span>
                  <span className="flex-1 truncate text-sm font-semibold">{c.title}</span>
                  <span className="hidden text-xs text-muted-foreground md:inline">{c.word_count} words</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

function Stat({ label, value, capitalize }: { label: string; value: any; capitalize?: boolean }) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3">
      <div className={classNames("font-display text-lg font-extrabold", capitalize && "capitalize")}>
        {value ?? "—"}
      </div>
      <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</div>
    </div>
  );
}
