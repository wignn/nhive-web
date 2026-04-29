'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { SkeletonLine } from '@/components/Skeleton';
import { BookOpen, CheckCircle, ClipboardList, XCircle, LibraryBig } from 'lucide-react';

const TABS = ['reading', 'completed', 'plan_to_read', 'dropped'];
const TAB_ICONS: Record<string, React.ReactNode> = {
  reading: <BookOpen size={16} />,
  completed: <CheckCircle size={16} />,
  plan_to_read: <ClipboardList size={16} />,
  dropped: <XCircle size={16} />
};
const TAB_LABELS: Record<string, string> = {
  reading: 'Reading',
  completed: 'Completed',
  plan_to_read: 'Plan to Read',
  dropped: 'Dropped'
};

export default function LibraryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tab, setTab] = useState('reading');
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login?callbackUrl=/library');
  }, [status]);

  useEffect(() => {
    if (!session) return;
    setLoading(true);
    api.getLibrary(session.accessToken)
      .then(d => {
        const raw: any[] = Array.isArray(d) ? d : (d?.entries ?? []);

        // ✅ FIX: Normalisasi entry — kalau tidak ada status, default ke 'reading'
        const normalized = raw.map((e: any) => ({
          ...e,
          status: e.status ?? 'reading',
        }));

        setEntries(normalized);

        // Enrich dengan data novel (title, slug, total chapters)
        const needsEnrich = normalized.length > 0 && normalized.some((e: any) => !e.novel_title || !e.novel_slug);
        if (needsEnrich) {
          api.listNovels('page=1&page_size=100&sort=updated')
            .then((novRes: any) => {
              const map = new Map<string, any>();
              (novRes.novels || []).forEach((n: any) => map.set(n.id, n));
              const enriched = normalized.map((e: any) => {
                const n = map.get(e.novel_id);
                if (n) return { ...e, novel_title: n.title, novel_slug: n.slug, total: n.total_chapters };
                return e;
              });
              setEntries(enriched);
            })
            .catch(() => {});
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [session]);

  if (status === 'loading') return <main className="page"><div className="container"><p>Loading...</p></div></main>;
  if (!session) return null;

  const filtered = entries.filter(e => e.status === tab);

  return (
    <main className="page">
      <div className="container" style={{ maxWidth: 900 }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 24 }}>My Library</h1>

        <div className="tab-bar">
          {TABS.map(t => (
            <button key={t} className={`tab-item ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {TAB_ICONS[t]} {TAB_LABELS[t]}
              </span>
              <span className="tab-count">{entries.filter(e => e.status === t).length}</span>
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ marginTop: 24 }}>
            {Array.from({ length: 3 }).map((_, i) => <SkeletonLine key={i} width="100%" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'center' }}><LibraryBig size={48} /></div>
            <p>No novels in this list yet.</p>
            <Link href="/novels" className="btn btn-primary" style={{ marginTop: 16 }}>Browse Novels</Link>
          </div>
        ) : (
          <div className="library-list">
            {filtered.map((entry: any) => {
              const title = entry.novel_title || entry.title || 'Unknown Title';
              const slug = entry.novel_slug || entry.slug || null;
              const progress = entry.progress ?? 0;
              const total = entry.total ?? null;
              const percent = total ? `${(progress / total) * 100}%` : '0%';
              const Content = (
                <div className="library-item card">
                  <div className="library-item-info">
                    <h3 style={{ fontWeight: 700 }}>{title}</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      Progress: {progress} / {total ?? '?'} chapters
                    </p>
                  </div>
                  <div className="library-progress-bar">
                    <div className="library-progress-fill" style={{ width: percent }} />
                  </div>
                </div>
              );
              return slug ? (
                <Link key={entry.novel_id || entry.id} href={`/novel/${slug}`} className="library-item-link" style={{ textDecoration: 'none' }}>
                  {Content}
                </Link>
              ) : (
                <div key={entry.novel_id || entry.id}>{Content}</div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}