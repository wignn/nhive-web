import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { register } from "@/server/auth.functions";
import { useAuth } from "@/lib/auth-context";
import { toast } from "@/lib/toast";
import { Loader2, UserPlus } from "lucide-react";
import { classNames } from "@/lib/novel-utils";
import logoImg from "@/assets/logo.ico";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Create account — NovelHive" }] }),
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const { refresh } = useAuth();
  const doReg = useServerFn(register);
  const [f, setF] = useState({ username: "", email: "", password: "", confirm: "" });
  const [busy, setBusy] = useState(false);

  const strength = useMemo(() => {
    const p = f.password;
    if (!p) return 0;
    if (p.length < 6) return 1;
    if (p.length < 10) return 2;
    return /[A-Z]/.test(p) && /\d/.test(p) ? 4 : 3;
  }, [f.password]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (f.password !== f.confirm) return toast.error("Passwords don't match");
    if (f.password.length < 6) return toast.error("Password must be ≥ 6 characters");
    if (f.username.length < 3) return toast.error("Username must be ≥ 3 characters");
    setBusy(true);
    try {
      await doReg({ data: { username: f.username, email: f.email, password: f.password } });
      await refresh();
      toast.success("Welcome to NovelHive");
      navigate({ to: "/" });
    } catch (err: any) {
      toast.error(err?.message || "Registration failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="mx-auto grid min-h-[80vh] w-full max-w-md place-items-center px-4 py-10">
      <div className="w-full rounded-3xl border border-white/10 bg-card/70 p-7 shadow-elevated backdrop-blur">
        <div className="mb-6 text-center">
          <img src={logoImg} alt="NovelHive Logo" className="mx-auto h-12 w-12" />
          <h1 className="mt-4 font-display text-2xl font-extrabold">Join NovelHive</h1>
          <p className="mt-1 text-sm text-muted-foreground">Track stories, sync progress, drop comments.</p>
        </div>

        <form onSubmit={submit} className="space-y-3">
          <Field label="Username" value={f.username} onChange={(v) => setF({ ...f, username: v })} placeholder="coolreader42" />
          <Field type="email" label="Email" value={f.email} onChange={(v) => setF({ ...f, email: v })} placeholder="you@example.com" />
          <Field type="password" label="Password" value={f.password} onChange={(v) => setF({ ...f, password: v })} placeholder="••••••••" />
          {f.password && (
            <div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                <div
                  className={classNames(
                    "h-full transition-all",
                    strength <= 1 ? "bg-destructive" :
                    strength === 2 ? "bg-warning" :
                    strength === 3 ? "bg-success" : "gradient-brand",
                  )}
                  style={{ width: `${strength * 25}%` }}
                />
              </div>
              <div className="mt-1 text-[11px] text-muted-foreground">
                {strength <= 1 ? "Weak" : strength === 2 ? "Fair" : strength === 3 ? "Good" : "Strong"} password
              </div>
            </div>
          )}
          <Field type="password" label="Confirm password" value={f.confirm} onChange={(v) => setF({ ...f, confirm: v })} placeholder="••••••••" />
          <button
            disabled={busy}
            className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl gradient-brand py-2.5 text-sm font-bold text-white shadow-glow disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
            {busy ? "Creating…" : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account? <Link to="/login" className="font-bold gradient-text">Sign in</Link>
        </p>
      </div>
    </main>
  );
}

function Field({
  label, value, onChange, type = "text", placeholder,
}: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</label>
      <input
        required
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm focus:border-brand/60 focus:outline-none focus:ring-2 focus:ring-brand/30"
      />
    </div>
  );
}
