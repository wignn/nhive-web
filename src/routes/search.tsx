import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { searchNovels, autocompleteNovels } from "@/server/novels.functions";
import { Search, SearchX } from "lucide-react";
import { z } from "zod";
import { LineSkeleton } from "@/components/ui-bits/Skeletons";

export const Route = createFileRoute("/search")({
  validateSearch: z.object({ q: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "Search — NovelHive" },
      { name: "description", content: "Search NovelHive's catalog by title, author, or keyword." },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const sp = useSearch({ from: "/search" });
  const initial = sp.q || "";
  const [q, setQ] = useState(initial);
  const [results, setResults] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(!!initial);
  const search = useServerFn(searchNovels);
  const ac = useServerFn(autocompleteNovels);

  useEffect(() => {
    if (initial) doSearch(initial);

  }, [initial]);

  const doSearch = async (val: string) => {
    if (!val.trim()) return;
    setLoading(true);
    setSearched(true);
    setSuggestions([]);
    try {
      const d: any = await search({ data: { q: val } });
      setResults(d?.hits || d?.novels || []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const onInput = async (val: string) => {
    setQ(val);
    if (val.length >= 2) {
      try {
        const d: any = await ac({ data: { q: val } });
        setSuggestions(d?.suggestions || []);
      } catch {
        setSuggestions([]);
      }
    } else {
      setSuggestions([]);
    }
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 md:px-6">
      <div className="mb-2 text-xs font-bold uppercase tracking-widest text-brand">Find</div>
      <h1 className="mb-6 font-display text-3xl font-extrabold md:text-4xl">Search the library</h1>

      <form
        onSubmit={(e) => { e.preventDefault(); doSearch(q); }}
        className="relative"
      >
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 focus-within:border-brand/60 focus-within:ring-2 focus-within:ring-brand/30">
          <Search className="h-5 w-5 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => onInput(e.target.value)}
            placeholder="Title, author, or keyword…"
            className="w-full bg-transparent text-base placeholder:text-muted-foreground focus:outline-none"
            autoFocus
          />
          <button type="submit" className="rounded-lg gradient-brand px-4 py-2 text-sm font-bold text-white shadow-glow">
            Search
          </button>
        </div>
        {suggestions.length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-2 overflow-hidden rounded-xl border border-white/10 bg-popover/95 shadow-elevated backdrop-blur">
            {suggestions.slice(0, 6).map((s: any, i: number) => (
              <Link
                key={i}
                to="/novel/$slug"
                params={{ slug: s.slug }}
                className="block px-4 py-2 text-sm hover:bg-white/5"
                onClick={() => setSuggestions([])}
              >
                {s.title}
              </Link>
            ))}
          </div>
        )}
      </form>

      <div className="mt-8">
        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => <LineSkeleton key={i} width={`${70 + i * 5}%`} />)}
          </div>
        )}

        {!loading && searched && results.length === 0 && (
          <div className="grid place-items-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02] py-20 text-center text-muted-foreground">
            <SearchX className="mb-3 h-10 w-10 opacity-60" />
            <p>No results for &ldquo;{q}&rdquo;</p>
          </div>
        )}

        {!loading && results.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">{results.length} result{results.length > 1 ? "s" : ""}</p>
            {results.map((n: any) => (
              <Link
                key={n.id}
                to="/novel/$slug"
                params={{ slug: n.slug }}
                className="group block rounded-2xl border border-white/5 bg-card/60 p-4 transition hover:border-brand/40 hover:bg-card"
              >
                <div className="font-display text-lg font-bold group-hover:gradient-text">{n.title}</div>
                <div className="mt-1 text-xs text-muted-foreground">by {n.author}</div>
                {n.synopsis && (
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{n.synopsis}</p>
                )}
                {n.genres?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {n.genres.map((g: any) => (
                      <span key={g.id} className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {g.name}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
