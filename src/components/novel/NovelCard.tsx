import { Link } from "@tanstack/react-router";
import { buildCoverUrl, formatCount } from "@/lib/novel-utils";
import { BookOpen, Eye } from "lucide-react";

export type Novel = {
  id: string;
  slug: string;
  title: string;
  author?: string;
  synopsis?: string;
  cover_url?: string;
  status?: string;
  total_chapters?: number;
  view_count?: number;
  genres?: { id: string; name: string }[];
};

export function NovelCard({
  novel,
  coverBase,
  index = 0,
}: {
  novel: Novel;
  coverBase?: string;
  index?: number;
}) {
  const cover = buildCoverUrl(novel.cover_url, coverBase);
  return (
    <Link
      to="/novel/$slug"
      params={{ slug: novel.slug }}
      className="group relative flex flex-col fade-up"
      style={{ animationDelay: `${Math.min(index * 40, 400)}ms` }}
    >
      <div className="cover-frame rounded-xl ring-1 ring-white/5 hover-lift">
        {cover ? (
          <img
            src={cover}
            alt={novel.title}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/40">
            <BookOpen className="h-10 w-10" />
          </div>
        )}

        {/* Status pill */}
        {novel.status && (
          <span
            className={
              "absolute left-2 top-2 z-10 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider backdrop-blur " +
              (novel.status === "completed"
                ? "bg-success/85 text-background"
                : novel.status === "hiatus"
                  ? "bg-warning/85 text-background"
                  : "bg-brand/85 text-white")
            }
          >
            {novel.status}
          </span>
        )}

        {/* Genre pill */}
        {novel.genres?.[0] && (
          <span className="absolute right-2 top-2 z-10 rounded-md bg-black/55 px-2 py-0.5 text-[10px] font-semibold text-white/90 backdrop-blur">
            {novel.genres[0].name}
          </span>
        )}

        {/* Bottom info on cover */}
        <div className="absolute bottom-0 left-0 right-0 z-10 p-3">
          <div className="line-clamp-2 text-sm font-bold leading-tight text-white drop-shadow">
            {novel.title}
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-white/70">
            <span className="line-clamp-1">{novel.author || "Unknown"}</span>
            <span className="flex items-center gap-2">
              {typeof novel.total_chapters === "number" && (
                <span className="flex items-center gap-1">
                  <BookOpen className="h-3 w-3" /> {novel.total_chapters}
                </span>
              )}
              {typeof novel.view_count === "number" && (
                <span className="flex items-center gap-1">
                  <Eye className="h-3 w-3" /> {formatCount(novel.view_count)}
                </span>
              )}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
