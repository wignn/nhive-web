'use client';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { api } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const strength = form.password.length === 0 ? 0
    : form.password.length < 6 ? 1
    : form.password.length < 10 ? 2
    : /[A-Z]/.test(form.password) && /[0-9]/.test(form.password) ? 4 : 3;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) { setError('Passwords do not match'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (form.username.length < 3) { setError('Username must be at least 3 characters'); return; }
    setLoading(true);
    try {
      await api.register({ username: form.username, email: form.email, password: form.password });
      const result = await signIn('credentials', { email: form.email, password: form.password, redirect: false });
      if (result?.ok) { router.push('/'); router.refresh(); }
      else { setError('Registration succeeded but auto-login failed. Please sign in manually.'); }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    }
    setLoading(false);
  };

  return (
    <div className="container">
      <div className="auth-container card animate-in">
        <div className="auth-header">
          <Link href="/" className="logo" style={{ justifyContent: 'center', fontSize: '2rem', marginBottom: 16 }}>NovelHive</Link>
          <h1>Create Account</h1>
          <p>Join thousands of readers</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input className="form-input" value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })} placeholder="coolreader42" required />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })} placeholder="••••••••" required />
            {form.password && (
              <div className="password-strength">
                <div className="strength-bar">
                  <div className={`strength-fill strength-${strength}`} style={{ width: `${strength * 25}%` }} />
                </div>
                <span className="strength-text">
                  {strength <= 1 ? 'Weak' : strength === 2 ? 'Fair' : strength === 3 ? 'Good' : 'Strong'}
                </span>
              </div>
            )}
          </div>
          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input className="form-input" type="password" value={form.confirm}
              onChange={e => setForm({ ...form, confirm: e.target.value })} placeholder="••••••••" required />
          </div>
          <button className="btn btn-primary btn-lg" type="submit" disabled={loading}
            style={{ width: '100%', marginTop: 8 }}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 24, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
