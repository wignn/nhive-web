import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { readChapter, listChapterComments, postComment } from "@/server/novels.functions";
import { useAuth } from "@/lib/auth-context";
import { toast } from "@/lib/toast";
import { ArrowLeft, ArrowRight, Heart, List, MessageSquare, Settings, Type, X } from "lucide-react";
import { classNames } from "@/lib/novel-utils";

export const Route = createFileRoute("/novel/$slug/$number")({
  component: ReaderPage,
});

type Theme = "dark" | "light" | "sepia";

function ReaderPage() {
  const { slug, number } = Route.useParams();
  const num = parseInt(number);
  const { user } = useAuth();
  const fetchChapter = useServerFn(readChapter);
  const fetchComments = useServerFn(listChapterComments);
  const sendComment = useServerFn(postComment);

  const [chapter, setChapter] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<Theme>("dark");
  const [fontSize, setFontSize] = useState(18);
  const [openSettings, setOpenSettings] = useState(false);
  const [progress, setProgress] = useState(0);
  const [comments, setComments] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchChapter({ data: { slug, number: num } })
      .then((d: any) => {
        setChapter(d);
        return fetchComments({ data: { chapterId: d.id } });
      })
      .then((c: any) => setComments(c?.comments || []))
      .catch(() => toast.error("Failed to load chapter"))
      .finally(() => setLoading(false));
  }, [slug, num, fetchChapter, fetchComments]);

  useEffect(() => {
    function onScroll() {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(h > 0 ? Math.min(100, (window.scrollY / h) * 100) : 0);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const submit = async () => {
    if (!user) { toast.info("Sign in to comment"); return; }
    if (!text.trim() || !chapter) return;
    setPosting(true);
    try {
      const c: any = await sendComment({ data: { chapterId: chapter.id, content: text.trim() } });
      setComments((prev) => [...prev, c]);
      setText("");
      toast.success("Comment posted");
    } catch (e: any) {
      toast.error(e?.message || "Failed to post comment");
    } finally {
      setPosting(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 pt-24">
        <div className="h-6 w-1/2 animate-pulse rounded bg-white/5" />
        <div className="mt-3 h-10 w-3/4 animate-pulse rounded bg-white/5" />
        <div className="mt-10 space-y-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="h-4 animate-pulse rounded bg-white/5" style={{ width: `${70 + Math.random() * 30}%` }} />
          ))}
        </div>
      </div>
    );
  }
  if (!chapter) return <div className="mx-auto max-w-3xl px-4 py-20 text-center">Chapter not found.</div>;

  const themeClass = theme === "light" ? "reader-theme-light" : theme === "sepia" ? "reader-theme-sepia" : "";

  return (
    <div className={classNames("min-h-screen", themeClass)}>
      {/* Reader top mini-bar (replaces site header) */}
      <div className="sticky top-0 z-40 glass-strong">
        <div className="mx-auto flex h-14 w-full max-w-4xl items-center gap-3 px-4">
          <Link to="/novel/$slug" params={{ slug }} className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <div className="mx-auto truncate text-sm font-semibold text-muted-foreground">
            <span className="text-brand">Ch. {chapter.number}</span> · {chapter.novel_title}
          </div>
          <Link to="/novel/$slug" params={{ slug }} className="rounded-lg p-2 hover:bg-white/5">
            <List className="h-4 w-4" />
          </Link>
          <button onClick={() => setOpenSettings((s) => !s)} className="rounded-lg p-2 hover:bg-white/5">
            {openSettings ? <X className="h-4 w-4" /> : <Settings className="h-4 w-4" />}
          </button>
        </div>
        <div className="h-0.5 w-full bg-white/5">
          <div className="h-full gradient-brand transition-[width]" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <article className="mx-auto max-w-3xl px-4 pb-24 pt-10">
        <div className="text-center">
          <div className="text-xs font-bold uppercase tracking-widest text-brand">Chapter {chapter.number}</div>
          <h1 className="mt-2 font-display text-3xl font-extrabold md:text-4xl">{chapter.title}</h1>
          <div className="mt-2 text-xs text-muted-foreground">{chapter.word_count} words</div>
          <div className="mx-auto mt-6 h-px w-32 bg-gradient-to-r from-transparent via-brand/60 to-transparent" />
        </div>

        <div
          className="reader-prose mt-10 leading-relaxed text-foreground"
          style={{ fontSize, fontFamily: "var(--font-serif)" }}
        >
          {String(chapter.content || "")
            .split(/\n\n+/)
            .map((p, i) => <p key={i}>{p}</p>)}
        </div>

        {/* nav */}
        <div className="mt-12 flex items-center justify-between gap-3 border-t border-white/5 pt-6">
          {chapter.has_prev ? (
            <Link
              to="/novel/$slug/$number"
              params={{ slug, number: String(chapter.prev_number) }}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4" /> Previous
            </Link>
          ) : <span />}
          <Link to="/novel/$slug" params={{ slug }} className="text-sm font-semibold text-muted-foreground hover:text-foreground">
            All chapters
          </Link>
          {chapter.has_next ? (
            <Link
              to="/novel/$slug/$number"
              params={{ slug, number: String(chapter.next_number) }}
              className="inline-flex items-center gap-2 rounded-xl gradient-brand px-4 py-2 text-sm font-bold text-white shadow-glow hover:opacity-90"
            >
              Next <ArrowRight className="h-4 w-4" />
            </Link>
          ) : <span />}
        </div>

        {/* comments */}
        <section className="mt-16">
          <h2 className="mb-4 inline-flex items-center gap-2 font-display text-xl font-extrabold">
            <MessageSquare className="h-5 w-5 text-brand" /> Comments ({comments.length})
          </h2>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <textarea
              disabled={!user}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={user ? "Share your thoughts on this chapter…" : "Sign in to comment"}
              className="min-h-20 w-full resize-y rounded-lg border border-white/10 bg-background/40 p-3 text-sm focus:border-brand/60 focus:outline-none focus:ring-2 focus:ring-brand/30"
            />
            <div className="mt-2 flex justify-end">
              <button
                disabled={!user || posting || !text.trim()}
                onClick={submit}
                className="rounded-lg gradient-brand px-4 py-2 text-sm font-bold text-white shadow-glow disabled:opacity-50"
              >
                {posting ? "Posting…" : "Post"}
              </button>
            </div>
          </div>

          <div className="mt-4 divide-y divide-white/5">
            {comments.map((c: any) => (
              <div key={c.id} className="flex gap-3 py-4">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full gradient-brand text-sm font-bold text-white">
                  {c.username?.[0]?.toUpperCase() || "?"}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-bold">{c.username}</div>
                  <p className="mt-1 text-sm text-muted-foreground">{c.content}</p>
                  <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                    <button className="inline-flex items-center gap-1 hover:text-foreground">
                      <Heart className="h-3.5 w-3.5" /> {c.likes || 0}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </article>

      {/* Floating settings */}
      {openSettings && (
        <div className="fixed bottom-6 right-6 z-50 w-72 rounded-2xl border border-white/10 bg-popover/95 p-4 shadow-elevated backdrop-blur fade-up">
          <div className="mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">Theme</div>
          <div className="mb-4 grid grid-cols-3 gap-2">
            {(["dark", "sepia", "light"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={classNames(
                  "rounded-lg border px-3 py-2 text-xs font-bold capitalize",
                  theme === t ? "border-brand bg-brand/15 text-brand" : "border-white/10 bg-white/5",
                )}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="mb-2 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-muted-foreground">
            <Type className="h-3 w-3" /> Font size
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 p-1">
            <button onClick={() => setFontSize((s) => Math.max(14, s - 2))} className="flex-1 rounded-md py-1 text-sm font-bold hover:bg-white/10">A−</button>
            <span className="w-12 text-center text-sm font-semibold">{fontSize}px</span>
            <button onClick={() => setFontSize((s) => Math.min(28, s + 2))} className="flex-1 rounded-md py-1 text-sm font-bold hover:bg-white/10">A+</button>
          </div>
        </div>
      )}
    </div>
  );
}
