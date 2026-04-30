import { Outlet, Link, createRootRoute, HeadContent, Scripts, useRouterState } from "@tanstack/react-router";
import appCss from "../styles.css?url";
import { AuthProvider } from "@/lib/auth-context";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="grid min-h-[70vh] place-items-center px-4">
      <div className="text-center">
        <div className="mb-4 text-7xl font-extrabold gradient-text">404</div>
        <h2 className="font-display text-2xl font-semibold">Lost between chapters</h2>
        <p className="mt-2 text-sm text-muted-foreground">The page you're looking for doesn't exist.</p>
        <Link to="/" className="mt-6 inline-flex rounded-lg gradient-brand px-4 py-2 text-sm font-bold text-white shadow-glow">
          Back to home
        </Link>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "NovelHive — Read premium web novels" },
      { name: "description", content: "Discover and read translated web novels and original fiction with a beautiful reading experience on NovelHive." },
      { name: "theme-color", content: "#0c0a14" },
      { property: "og:title", content: "NovelHive — Read premium web novels" },
      { property: "og:description", content: "Discover and read translated web novels and original fiction." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Sora:wght@500;600;700;800&family=Source+Serif+4:wght@400;600&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const isAdmin = path.startsWith("/admin");
  return (
    <AuthProvider>
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <div className="flex-1">
          <Outlet />
        </div>
        {!isAdmin && <SiteFooter />}
      </div>
      <Toaster richColors position="top-center" theme="dark" />
    </AuthProvider>
  );
}
