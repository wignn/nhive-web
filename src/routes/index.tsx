import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { listNovels } from "@/server/novels.functions";
import { NovelCard, type Novel } from "@/components/novel/NovelCard";
import { CardGridSkeleton } from "@/components/ui-bits/Skeletons";
import { buildCoverUrl, formatCount } from "@/lib/novel-utils";
import { ArrowRight, BookOpen, Eye, Flame, Sparkles, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NovelHive — Discover your next obsession" },
      { name: "description", content: "Browse trending web novels, original fiction and translated stories — beautifully readable on any device." },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const fetchNovels = useServerFn(listNovels);
  const [novels, setNovels] = useState<Novel[]>([]);
  const [trending, setTrending] = useState<Novel[]>([]);
  const [coverBase, setCoverBase] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    Promise.all([
      fetchNovels({ data: { query: "page=1&page_size=18&sort=updated" } }),
      fetchNovels({ data: { query: "page=1&page_size=10&sort=views" } }),
    ])
      .then(([recent, top]: any) => {
        if (!alive) return;
        setNovels(recent.novels || []);
        setTrending((top.novels || []).slice(0, 8));
        setCoverBase(recent.cover_base_url || top.cover_base_url);
      })
      .catch(() => {})
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [fetchNovels]);

  const hero = trending[0] || novels[0];
  const heroCover = hero ? buildCoverUrl(hero.cover_url, coverBase) : null;

  return (
    <main className="mx-auto w-full max-w-7xl px-4 md:px-6">
      {/* HERO */}
      <section className="relative isolate overflow-hidden rounded-3xl border border-white/5 bg-surface/40 p-6 md:p-10 mt-6">
        <div className="absolute -top-32 right-0 h-96 w-96 shimmer-bg opacity-80" aria-hidden />
        <div className="absolute -bottom-32 -left-20 h-80 w-80 shimmer-bg opacity-60" aria-hidden />

        <div className="relative grid gap-8 md:grid-cols-[1.1fr_.9fr] md:items-center">
          <div className="fade-up">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-brand pulse-dot" /> Welcome back to NovelHive
            </div>
            <h1 className="mt-4 font-display text-4xl font-extrabold leading-tight text-balance md:text-6xl">
              Worlds within <span className="gradient-text">words</span>.<br />
              Find your next favorite chapter.
            </h1>
            <p className="mt-4 max-w-lg text-base text-muted-foreground md:text-lg">
              Hand-picked translations, original fiction and trending hits — wrapped in a reader you'll actually love using.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link to="/novels" className="inline-flex items-center gap-2 rounded-xl gradient-brand px-5 py-3 text-sm font-bold text-white shadow-glow transition hover:opacity-90">
                Start reading <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/search" className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-foreground hover:bg-white/10">
                <Sparkles className="h-4 w-4 text-brand" /> Discover
              </Link>
            </div>
          </div>

          {/* Featured floating cover */}
          {hero && (
            <Link
              to="/novel/$slug"
              params={{ slug: hero.slug }}
              className="relative mx-auto w-full max-w-md fade-up"
              style={{ animationDelay: "120ms" }}
            >
              <div className="absolute inset-0 -z-10 translate-x-6 translate-y-6 rounded-2xl gradient-brand opacity-40 blur-2xl" aria-hidden />
              <div className="grid grid-cols-[140px_1fr] gap-4 overflow-hidden rounded-2xl border border-white/10 bg-card/70 p-3 backdrop-blur md:grid-cols-[180px_1fr]">
                <div className="cover-frame rounded-xl ring-1 ring-white/10">
                  {heroCover ? (
                    <img src={heroCover} alt={hero.title} className="absolute inset-0 h-full w-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 grid place-items-center text-muted-foreground/40"><BookOpen className="h-8 w-8" /></div>
                  )}
                </div>
                <div className="flex flex-col justify-between p-1">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-brand">Editor's pick</div>
                    <div className="mt-1 line-clamp-2 font-display text-xl font-extrabold leading-tight md:text-2xl">{hero.title}</div>
                    <div className="mt-1 text-xs text-muted-foreground">by {hero.author || "Unknown"}</div>
                    <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{hero.synopsis || "A story waiting to be told."}</p>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    {hero.genres?.[0] && (
                      <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5">{hero.genres[0].name}</span>
                    )}
                    {typeof hero.total_chapters === "number" && (
                      <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" />{hero.total_chapters} ch</span>
                    )}
                    {typeof hero.view_count === "number" && (
                      <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{formatCount(hero.view_count)}</span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          )}
        </div>
      </section>

      {/* TRENDING marquee strip */}
      {trending.length > 0 && (
        <section className="mt-10">
          <SectionHeader icon={<Flame className="h-4 w-4" />} title="Trending now" subtitle="Most read this week" link="/novels" />
          <div className="-mx-4 mt-3 overflow-hidden md:-mx-6">
            <div className="scrollbar-none flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 md:gap-5 md:px-6">
              {trending.map((n, i) => (
                <div key={n.id} className="snap-start shrink-0 w-[140px] sm:w-[160px] md:w-[180px]">
                  <NovelCard novel={n} coverBase={coverBase} index={i} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* RECENT GRID */}
      <section className="mt-12">
        <SectionHeader icon={<TrendingUp className="h-4 w-4" />} title="Recently updated" subtitle="Fresh chapters from authors you love" link="/novels" />
        {loading ? (
          <div className="mt-3"><CardGridSkeleton count={12} /></div>
        ) : (
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-5 lg:grid-cols-5 xl:grid-cols-6">
            {novels.map((n, i) => (
              <NovelCard key={n.id} novel={n} coverBase={coverBase} index={i} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function SectionHeader({
  icon,
  title,
  subtitle,
  link,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  link?: string;
}) {
  return (
    <div className="flex items-end justify-between gap-3">
      <div>
        <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand">
          {icon} {title}
        </div>
        {subtitle && <div className="mt-1 font-display text-xl font-extrabold md:text-2xl">{subtitle}</div>}
      </div>
      {link && (
        <Link to={link as any} className="group inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground">
          View all <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}
