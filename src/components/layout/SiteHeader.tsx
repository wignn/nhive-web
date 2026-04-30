import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useAuth } from "@/lib/auth-context";
import { autocompleteNovels } from "@/server/novels.functions";
import { Search, BookOpen, Library, Shield, LogOut, Menu, X, Sparkles, ChevronDown } from "lucide-react";
import { classNames } from "@/lib/novel-utils";
import logoImg from "@/assets/logo.ico";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/novels", label: "Browse" },
  { to: "/search", label: "Search" },
];

export function SiteHeader() {
  const { user, logout } = useAuth();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSugg, setShowSugg] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);
  const [openMobile, setOpenMobile] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const ac = useServerFn(autocompleteNovels);

  const isReader = /\/novel\/[^/]+\/\d+/.test(path);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpenMenu(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    if (q.length < 2) {
      setSuggestions([]);
      return;
    }
    const t = setTimeout(async () => {
      try {
        const d: any = await ac({ data: { q } });
        setSuggestions(d?.suggestions || []);
        setShowSugg(true);
      } catch {
        setSuggestions([]);
      }
    }, 180);
    return () => clearTimeout(t);
  }, [q, ac]);

  if (isReader) return null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!q.trim()) return;
    navigate({ to: "/search", search: { q } as any });
    setShowSugg(false);
    setOpenMobile(false);
  };

  return (
    <header className="sticky top-0 z-50 glass-strong">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-4 px-4 md:px-6">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-extrabold tracking-tight">
          <img src={logoImg} alt="NovelHive Logo" className="h-8 w-8" />
          <span className="gradient-text">NovelHive</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((n) => {
            const active = path === n.to || (n.to !== "/" && path.startsWith(n.to));
            return (
              <Link
                key={n.to}
                to={n.to}
                className={classNames(
                  "rounded-lg px-3 py-1.5 text-sm font-medium transition",
                  active ? "text-foreground bg-white/5" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>

        {/* Search */}
        <form onSubmit={submit} className="relative ml-auto hidden flex-1 max-w-sm md:block">
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 focus-within:border-brand/60 focus-within:ring-2 focus-within:ring-brand/30 transition">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onFocus={() => suggestions.length && setShowSugg(true)}
              placeholder="Search novels, authors…"
              className="w-full bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none"
            />
            {q && (
              <button type="button" onClick={() => setQ("")} className="text-muted-foreground hover:text-foreground">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          {showSugg && suggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-2 overflow-hidden rounded-xl border border-white/10 bg-popover/95 shadow-elevated backdrop-blur">
              {suggestions.slice(0, 6).map((s: any, i: number) => (
                <Link
                  key={i}
                  to="/novel/$slug"
                  params={{ slug: s.slug }}
                  onClick={() => {
                    setShowSugg(false);
                    setQ("");
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-white/5"
                >
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <span className="line-clamp-1">{s.title}</span>
                </Link>
              ))}
            </div>
          )}
        </form>

        {/* User area */}
        <div className="relative ml-auto flex items-center gap-2 md:ml-0" ref={ref}>
          {user ? (
            <>
              <button
                onClick={() => setOpenMenu((s) => !s)}
                className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2 py-1 pr-3 text-sm hover:bg-white/10 md:flex"
              >
                <span className="grid h-7 w-7 place-items-center rounded-full gradient-brand text-xs font-bold text-white">
                  {user.username[0]?.toUpperCase()}
                </span>
                <span className="font-semibold">{user.username}</span>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
              {openMenu && (
                <div className="absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-xl border border-white/10 bg-popover/95 shadow-elevated backdrop-blur">
                  <div className="border-b border-white/5 px-3 py-2.5">
                    <div className="text-sm font-semibold">{user.username}</div>
                    <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{user.role}</div>
                  </div>
                  <Link
                    to="/library"
                    onClick={() => setOpenMenu(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-white/5"
                  >
                    <Library className="h-4 w-4" /> My Library
                  </Link>
                  {user.role === "admin" && (
                    <Link
                      to="/admin"
                      onClick={() => setOpenMenu(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-white/5"
                    >
                      <Shield className="h-4 w-4" /> Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={async () => {
                      await logout();
                      setOpenMenu(false);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10"
                  >
                    <LogOut className="h-4 w-4" /> Sign out
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <Link to="/login" className="rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
                Sign in
              </Link>
              <Link
                to="/register"
                className="rounded-lg gradient-brand px-3 py-1.5 text-sm font-bold text-white shadow-glow transition hover:opacity-90"
              >
                Sign up
              </Link>
            </div>
          )}
          <button onClick={() => setOpenMobile((s) => !s)} className="md:hidden rounded-lg p-2 text-foreground hover:bg-white/5">
            {openMobile ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {openMobile && (
        <div className="border-t border-white/5 bg-background/95 px-4 py-4 backdrop-blur md:hidden">
          <form onSubmit={submit} className="mb-3 flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search…"
              className="w-full bg-transparent text-sm focus:outline-none"
            />
          </form>
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              onClick={() => setOpenMobile(false)}
              className="block rounded-lg px-3 py-2 text-sm font-semibold text-muted-foreground hover:bg-white/5 hover:text-foreground"
            >
              {n.label}
            </Link>
          ))}
          <div className="my-2 h-px bg-white/5" />
          {user ? (
            <>
              <Link to="/library" onClick={() => setOpenMobile(false)} className="block rounded-lg px-3 py-2 text-sm font-semibold hover:bg-white/5">
                My Library
              </Link>
              {user.role === "admin" && (
                <Link to="/admin" onClick={() => setOpenMobile(false)} className="block rounded-lg px-3 py-2 text-sm font-semibold hover:bg-white/5">
                  Admin Panel
                </Link>
              )}
              <button
                onClick={async () => {
                  await logout();
                  setOpenMobile(false);
                }}
                className="block w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-destructive hover:bg-destructive/10"
              >
                Sign out
              </button>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Link to="/login" onClick={() => setOpenMobile(false)} className="rounded-lg border border-white/10 px-3 py-2 text-center text-sm font-semibold">
                Sign in
              </Link>
              <Link to="/register" onClick={() => setOpenMobile(false)} className="rounded-lg gradient-brand px-3 py-2 text-center text-sm font-bold text-white">
                Sign up
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
