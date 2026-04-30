import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { login } from "@/server-fns/auth.functions";
import { useAuth } from "@/lib/auth-context";
import { toast } from "@/lib/toast";
import { Loader2, LogIn, Sparkles } from "lucide-react";
import logoImg from "@/assets/logo.ico";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — NovelHive" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { refresh } = useAuth();
  const doLogin = useServerFn(login);
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await doLogin({ data: { email, password: pw } });
      await refresh();
      toast.success("Welcome back");
      navigate({ to: "/" });
    } catch (err: any) {
      toast.error(err?.message || "Invalid email or password");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="mx-auto grid min-h-[80vh] w-full max-w-md place-items-center px-4 py-10">
      <div className="w-full rounded-3xl border border-white/10 bg-card/70 p-7 shadow-elevated backdrop-blur">
        <div className="mb-6 text-center">
          <img src={logoImg} alt="NovelHive Logo" className="mx-auto h-12 w-12" />
          <h1 className="mt-4 font-display text-2xl font-extrabold">Welcome back</h1>
          <p className="mt-1 text-sm text-muted-foreground">Sign in to continue your story</p>
        </div>

        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Email</label>
            <input
              required type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm focus:border-brand/60 focus:outline-none focus:ring-2 focus:ring-brand/30"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Password</label>
            <input
              required type="password" value={pw} onChange={(e) => setPw(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm focus:border-brand/60 focus:outline-none focus:ring-2 focus:ring-brand/30"
            />
          </div>
          <button
            disabled={busy}
            className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl gradient-brand py-2.5 text-sm font-bold text-white shadow-glow disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          New here? <Link to="/register" className="font-bold gradient-text">Create an account</Link>
        </p>
      </div>
    </main>
  );
}
