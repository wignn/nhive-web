'use client';
import Link from 'next/link';
import { useState, useEffect, use } from 'react';
import { api } from '@/lib/api';
import { useSession } from 'next-auth/react';
import { useToast } from '@/components/Toast';
import { Heart, MessageSquare, Settings } from 'lucide-react';

export default function ReaderPage({ params }: { params: Promise<{ slug: string; number: string }> }) {
  const { slug, number } = use(params);
  const num = parseInt(number);
  const { data: session } = useSession();
  const { toast } = useToast();

  const [chapter, setChapter] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState('dark');
  const [fontSize, setFontSize] = useState(18);
  const [showSettings, setShowSettings] = useState(false);
  const [progress, setProgress] = useState(0);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  useEffect(() => {
    setLoading(true);
    api.readChapter(slug, num)
      .then(d => { setChapter(d); return d; })
      .then(d => api.listComments(d.id).then(c => setComments(c.comments || [])).catch(() => {}))
      .catch(() => toast('error', 'Failed to load chapter'))
      .finally(() => setLoading(false));
 
  }, [slug, num]);
  


  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme === 'dark' ? '' : theme);
    return () => document.documentElement.removeAttribute('data-theme');
  }, [theme]);

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(h > 0 ? (window.scrollY / h) * 100 : 0);
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const submitComment = async () => {
    if (!session) { toast('info', 'Please sign in to comment'); return; }
    if (!newComment.trim() || !chapter) return;
    try {
      const c = await api.createComment(chapter.id, newComment, session.accessToken);
      setComments(prev => [...prev, c]);
      setNewComment('');
      toast('success', 'Comment posted!');
    } catch { toast('error', 'Failed to post comment'); }
  };

  if (loading) return (
    <div className="reader-container" style={{ paddingTop: 80 }}>
      <div className="skeleton skeleton-text" style={{ width: '40%', margin: '0 auto 16px' }} />
      <div className="skeleton skeleton-text" style={{ width: '60%', margin: '0 auto 40px' }} />
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="skeleton skeleton-text" style={{ width: `${70 + Math.random() * 30}%`, marginBottom: 12 }} />
      ))}
    </div>
  );
  if (!chapter) return <div className="reader-container"><h1>Chapter not found</h1></div>;

  return (
    <>
      <div className="reader-progress" style={{ width: `${progress}%` }} />
      <div className="reader-container">
        <div className="reader-header">
          <Link href={`/novel/${slug}`} className="reader-novel-title">{chapter.novel_title}</Link>
          <h1 className="reader-chapter-title">Chapter {chapter.number}: {chapter.title}</h1>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{chapter.word_count} words</span>
        </div>

        <div className="reader-content" style={{ fontSize }}>
          {chapter.content.split('\n\n').map((p: string, i: number) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        <div className="reader-nav">
          {chapter.has_prev ? (
            <Link href={`/novel/${slug}/${chapter.prev_number}`} className="btn btn-secondary">← Previous</Link>
          ) : <div />}
          <Link href={`/novel/${slug}`} className="btn btn-ghost">Chapter List</Link>
          {chapter.has_next ? (
            <Link href={`/novel/${slug}/${chapter.next_number}`} className="btn btn-secondary">Next →</Link>
          ) : <div />}
        </div>

        <div className="comment-section">
          <h3 className="section-title">Comments ({comments.length})</h3>
          <div className="comment-box">
            <textarea className="form-textarea" placeholder={session ? 'Share your thoughts...' : 'Sign in to comment'}
              value={newComment} onChange={e => setNewComment(e.target.value)}
              style={{ minHeight: 80 }} disabled={!session} />
            <button className="btn btn-primary" onClick={submitComment} disabled={!session}>Post</button>
          </div>
          {comments.map((c: any) => (
            <div key={c.id} className="comment-item">
              <div className="comment-avatar">{c.username?.[0]?.toUpperCase()}</div>
              <div className="comment-body">
                <span className="comment-username">{c.username}</span>
                <p className="comment-text">{c.content}</p>
                <div className="comment-actions-row">
                  <button className="comment-action-btn"><Heart size={14} /> {c.likes || 0}</button>
                  <button className="comment-action-btn"><MessageSquare size={14} /> Reply</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Settings FAB */}
      <div className="reader-settings">
        <button className="settings-toggle" onClick={() => setShowSettings(!showSettings)}>
          <Settings size={24} />
        </button>
        {showSettings && (
          <div className="settings-panel animate-in">
            <div className="settings-group">
              <div className="settings-label">Theme</div>
              <div className="settings-row">
                {['dark', 'light', 'sepia'].map(t => (
                  <button key={t} className={`theme-btn ${theme === t ? 'active' : ''}`} onClick={() => setTheme(t)}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="settings-group">
              <div className="settings-label">Font Size</div>
              <div className="font-size-control">
                <button onClick={() => setFontSize(s => Math.max(14, s - 2))}>A-</button>
                <span>{fontSize}px</span>
                <button onClick={() => setFontSize(s => Math.min(28, s + 2))}>A+</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
