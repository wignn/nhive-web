'use client';
import Link from 'next/link';
import { useEffect, useState, use } from 'react';
import { api } from '@/lib/api';
import { useSession } from 'next-auth/react';
import { useToast } from '@/components/Toast';
import { SkeletonLine } from '@/components/Skeleton';
import { Book, BookmarkPlus, BookmarkCheck, Loader2 } from 'lucide-react';

const SKELETON_WIDTHS = ['72%', '88%', '65%', '91%', '78%', '83%'];
const normalizeId = (id: string) => id?.replace(/-/g, '').toLowerCase();

export default function NovelDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { data: session } = useSession();
  const { toast } = useToast();
  const [novel, setNovel] = useState<any>(null);
  const [chapters, setChapters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [coverBase, setCoverBase] = useState('');
  const [libraryEntry, setLibraryEntry] = useState<any>(null);
  const [libraryLoading, setLibraryLoading] = useState(false);

  // Load novel + chapters + library sekaligus
  useEffect(() => {
    const token = session?.accessToken;
    const fetches: Promise<any>[] = [api.getNovel(slug), api.listChapters(slug)];
    if (token) fetches.push(api.getLibrary(token));

    Promise.all(fetches)
      .then(([n, c, lib]) => {
        const novelData = n.novel || n;
        setNovel(novelData);
        if (n.cover_base_url) setCoverBase(n.cover_base_url);
        setChapters(c.chapters || []);

        if (lib && novelData?.id) {
          const list: any[] = Array.isArray(lib) ? lib : (lib?.entries ?? []);
          const entry = list.find((e: any) =>
            normalizeId(e.novel_id) === normalizeId(novelData.id)
          );
          setLibraryEntry(entry ?? null);
        }
      })
      .catch(() => toast('error', 'Failed to load novel'))
      .finally(() => setLoading(false));
  }, [slug, session?.accessToken]);

  const refreshLibraryEntry = async (novelId: string) => {
    if (!session?.accessToken) return;
    try {
      const d = await api.getLibrary(session.accessToken);
      const list: any[] = Array.isArray(d) ? d : (d?.entries ?? []);
      const entry = list.find((e: any) =>
        normalizeId(e.novel_id) === normalizeId(novelId)
      );
      setLibraryEntry(entry ?? null);
    } catch { /* silent */ }
  };

  const handleLibraryToggle = async () => {
    if (!session) { toast('info', 'Please sign in to manage library'); return; }
    if (!novel?.id) return;
    setLibraryLoading(true);
    try {
      if (libraryEntry) {
        await api.removeFromLibrary(libraryEntry.novel_id, session.accessToken);
        setLibraryEntry(null);
        toast('success', 'Removed from library');
      } else {
        await api.addToLibrary(novel.id, session.accessToken);
        await refreshLibraryEntry(novel.id);
        toast('success', 'Added to library!');
      }
    } catch (e: any) {
      toast('error', e.message || 'Failed to update library');
      await refreshLibraryEntry(novel.id);
    } finally {
      setLibraryLoading(false);
    }
  };

  if (loading) return (
    <main className="page"><div className="container">
      <div style={{ display: 'grid', gap: 16, maxWidth: 600 }}>
        {SKELETON_WIDTHS.map((w, i) => <SkeletonLine key={i} width={w} />)}
      </div>
    </div></main>
  );
  if (!novel) return <main className="page"><div className="container"><h1>Novel not found</h1></div></main>;

  const inLibrary = !!libraryEntry;

  return (
    <main className="page">
      <div className="container">
        <div className="novel-detail">
          <div className="novel-detail-header">
            <div className="novel-detail-cover">
              {novel.cover_url ? (
                <img
                  src={novel.cover_url.startsWith('http') ? novel.cover_url : `${coverBase}/${novel.cover_url}`}
                  alt={novel.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{ color: 'var(--text-muted)', opacity: 0.3 }}><Book size={64} /></div>
              )}
              <span className={`novel-status-badge ${novel.status}`}>{novel.status}</span>
            </div>
            <div className="novel-detail-info">
              <h1 className="novel-detail-title">{novel.title}</h1>
              <p className="novel-detail-author">by <strong>{novel.author}</strong></p>
              <div className="genre-tags" style={{ marginBottom: 24 }}>
                {(novel.genres || []).map((g: any) => (
                  <span key={g.id} className="genre-tag">{g.name}</span>
                ))}
              </div>
              <p className="novel-detail-synopsis">{novel.synopsis}</p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {chapters.length > 0 && (
                  <Link href={`/novel/${slug}/1`} className="btn btn-primary">Start Reading</Link>
                )}
                <button
                  className={`btn ${inLibrary ? 'btn-secondary' : 'btn-outline'}`}
                  onClick={handleLibraryToggle}
                  disabled={libraryLoading}
                  style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                >
                  {libraryLoading ? (
                    <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                  ) : inLibrary ? (
                    <BookmarkCheck size={18} />
                  ) : (
                    <BookmarkPlus size={18} />
                  )}
                  {libraryLoading ? 'Loading...' : inLibrary ? 'Remove Bookmark' : 'Add Bookmark'}
                </button>
              </div>
              <div className="novel-stats-row">
                <div className="novel-stat">
                  <span className="novel-stat-val">{novel.total_chapters}</span>
                  <span>Chapters</span>
                </div>
                <div className="novel-stat">
                  <span className="novel-stat-val">{novel.status}</span>
                  <span>Status</span>
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 48 }}>
            <h2 className="section-title">Chapters</h2>
            <div className="chapter-list">
              {chapters.map((ch: any) => (
                <Link href={`/novel/${slug}/${ch.number}`} key={ch.id} className="chapter-item">
                  <span className="chapter-number">Ch. {ch.number}</span>
                  <span className="chapter-name">{ch.title}</span>
                  <span className="chapter-meta-info">{ch.word_count} words</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}