import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { listNovels } from "@/server-fns/novels.functions";
import { NovelCard, type Novel } from "@/components/novel/NovelCard";
import { CardGridSkeleton } from "@/components/ui-bits/Skeletons";
import { Filter, SearchX } from "lucide-react";
import { classNames } from "@/lib/novel-utils";
import { z } from "zod";

const GENRES = [
  "Fantasy","Action","Romance","Adventure","Sci-Fi","Mystery","Horror",
  "Comedy","Drama","Slice of Life","Martial Arts","Isekai","Wuxia","Xianxia",
];
const SORTS = [
  { value: "updated", label: "Recently updated" },
  { value: "views", label: "Most viewed" },
  { value: "title", label: "Title A–Z" },
  { value: "chapters", label: "Most chapters" },
];

export const Route = createFileRoute("/novels")({
  validateSearch: z.object({ genre: z.string().optional(), sort: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "Browse novels — NovelHive" },
      { name: "description", content: "Filter by genre and sort by trending, updated or title to find your next read." },
    ],
  }),
  component: BrowsePage,
});

function BrowsePage() {
  const sp = useSearch({ from: "/novels" });
  const fetchNovels = useServerFn(listNovels);

  const [genre, setGenre] = useState<string>(sp.genre || "");
  const [sort, setSort] = useState<string>(sp.sort || "updated");
  const [novels, setNovels] = useState<Novel[]>([]);
  const [coverBase, setCoverBase] = useState<string | undefined>();
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (genre) params.set("genre", genre);
    params.set("sort", sort);
    params.set("page_size", "30");
    fetchNovels({ data: { query: params.toString().toLowerCase() } })
      .then((d: any) => {
        setNovels(d.novels || []);
        setTotal(d.total || 0);
        setCoverBase(d.cover_base_url);
      })
      .catch(() => setNovels([]))
      .finally(() => setLoading(false));
  }, [genre, sort, fetchNovels]);

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-brand">Library</div>
          <h1 className="mt-1 font-display text-3xl font-extrabold md:text-4xl">Browse novels</h1>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="bg-transparent text-sm font-medium focus:outline-none"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value} className="bg-background">{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* genre chips */}
      <div className="mb-6 -mx-4 overflow-x-auto px-4 scrollbar-none md:mx-0 md:px-0">
        <div className="flex gap-2">
          <Chip active={!genre} onClick={() => setGenre("")}>All</Chip>
          {GENRES.map((g) => (
            <Chip key={g} active={genre === g} onClick={() => setGenre(g)}>{g}</Chip>
          ))}
        </div>
      </div>

      <p className="mb-4 text-xs text-muted-foreground">
        {loading ? "Loading…" : `Showing ${novels.length} of ${total} novels${genre ? ` in ${genre}` : ""}`}
      </p>

      {loading ? (
        <CardGridSkeleton count={12} />
      ) : novels.length === 0 ? (
        <EmptyState text={`No novels found${genre ? ` in "${genre}"` : ""}`} />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-5 lg:grid-cols-5 xl:grid-cols-6">
          {novels.map((n, i) => (
            <NovelCard key={n.id} novel={n} coverBase={coverBase} index={i} />
          ))}
        </div>
      )}
    </main>
  );
}

function Chip({
  active, onClick, children,
}: { active?: boolean; onClick?: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={classNames(
        "shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition",
        active
          ? "border-transparent gradient-brand text-white shadow-glow"
          : "border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="grid place-items-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02] py-20 text-center text-muted-foreground">
      <SearchX className="mb-3 h-10 w-10 opacity-60" />
      <p>{text}</p>
    </div>
  );
}
