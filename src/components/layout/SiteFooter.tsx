import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import logoImg from "@/assets/logo.ico";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-white/5 bg-background/60">
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-6">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2 font-display text-lg font-extrabold">
              <img src={logoImg} alt="NovelHive Logo" className="h-8 w-8" />
              <span className="gradient-text">NovelHive</span>
            </Link>
            <p className="mt-3 max-w-sm text-sm text-muted-foreground">
              Premium destination for translated web novels and original fiction. Read beautifully, anywhere.
            </p>
          </div>
          <div>
            <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Explore</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/novels" className="hover:text-foreground text-muted-foreground">Browse</Link></li>
              <li><Link to="/search" className="hover:text-foreground text-muted-foreground">Search</Link></li>
              <li><Link to="/library" className="hover:text-foreground text-muted-foreground">My Library</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Genres</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/novels" search={{ genre: "Fantasy" } as any} className="hover:text-foreground text-muted-foreground">Fantasy</Link></li>
              <li><Link to="/novels" search={{ genre: "Romance" } as any} className="hover:text-foreground text-muted-foreground">Romance</Link></li>
              <li><Link to="/novels" search={{ genre: "Isekai" } as any} className="hover:text-foreground text-muted-foreground">Isekai</Link></li>
              <li><Link to="/novels" search={{ genre: "Action" } as any} className="hover:text-foreground text-muted-foreground">Action</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-2 border-t border-white/5 pt-6 text-xs text-muted-foreground md:flex-row">
          <span>© {new Date().getFullYear()} NovelHive. Crafted for readers.</span>
          <span>Built with TanStack Start.</span>
        </div>
      </div>
    </footer>
  );
}
