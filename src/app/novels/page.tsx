'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { SkeletonGrid } from '@/components/Skeleton';
import { Suspense } from 'react';
import { Book, FileText, SearchX } from 'lucide-react';

function BrowseContent() {
  const searchParams = useSearchParams();
  const [novels, setNovels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [genre, setGenre] = useState(searchParams.get('genre') || '');
  const [sortBy, setSortBy] = useState('updated');
  const [total, setTotal] = useState(0);
  const [coverBase, setCoverBase] = useState('');
  const genres = ['Fantasy','Action','Romance','Adventure','Sci-Fi','Mystery','Horror','Comedy','Drama','Slice of Life','Martial Arts','Isekai','Wuxia','Xianxia'];

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (genre) params.set('genre', genre);
    params.set('sort', sortBy);
    params.set('page_size', '20');
    api.listNovels(params.toString().toLowerCase())
      .then(d => { 
        setNovels(d.novels || []); 
        setTotal(d.total || 0); 
        if (d.cover_base_url) setCoverBase(d.cover_base_url);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [genre, sortBy]);

  return (
    <main className="page">
      <div className="container">
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 24 }}>Browse Novels</h1>
        
        <div className="filter-bar">
          <div className="filter-group">
            <label className="filter-label">Genre</label>
            <div className="filter-chips">
              <button className={`filter-chip ${genre === '' ? 'active' : ''}`} onClick={() => setGenre('')}>All</button>
              {genres.map(g => (
                <button key={g} className={`filter-chip ${genre === g ? 'active' : ''}`} onClick={() => setGenre(g)}>{g}</button>
              ))}
            </div>
          </div>
          <div className="filter-group" style={{ marginTop: 12 }}>
            <label className="filter-label">Sort by</label>
            <select className="form-select" style={{ width: 200 }} value={sortBy} onChange={e => setSortBy(e.target.value)}>
              <option value="updated">Recently Updated</option>
              <option value="title">Title A-Z</option>
              <option value="chapters">Most Chapters</option>
            </select>
          </div>
        </div>

        <p style={{ color: 'var(--text-muted)', marginBottom: 16, fontSize: '0.9rem' }}>
          Showing {novels.length} of {total} novels{genre ? ` in ${genre}` : ''}
        </p>

        {loading ? <SkeletonGrid count={8} /> : novels.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'center' }}><SearchX size={48} /></div>
            <p>No novels found{genre ? ` in "${genre}"` : ''}. Try a different filter.</p>
          </div>
        ) : (
          <div className="novel-grid stagger">
            {novels.map((novel: any) => (
              <Link href={`/novel/${novel.slug}`} key={novel.id} className="novel-card animate-in">
                <div className="novel-cover">
                  {novel.cover_url ? (
                    <img src={novel.cover_url.startsWith('http') ? novel.cover_url : `${coverBase}/${novel.cover_url}`} alt={novel.title} />
                  ) : (
                    <span className="novel-cover-placeholder" style={{ display: 'flex', color: 'var(--text-muted)' }}><Book size={32} /></span>
                  )}
                  
                  {novel.genres && novel.genres.length > 0 && (
                    <span className="badge-glass badge-tl">
                      {novel.genres[0].name}
                    </span>
                  )}
                  <span className={`badge-glass badge-bl ${novel.status === 'completed' ? 'badge-solid-green' : 'badge-solid-red'}`}>
                    {novel.status}
                  </span>
                </div>
                
                <div className="novel-info">
                  <div className="novel-title">{novel.title}</div>
                  <div className="novel-author">{novel.author}</div>
                  <div className="novel-synopsis">{novel.synopsis || "No synopsis available for this novel."}</div>
                  
                  <div className="novel-meta-row">
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><FileText size={12} /> {novel.total_chapters} ch</span>
                  </div>
                </div>
                
                <div className="novel-card-actions">
                  <div className="btn btn-glass" style={{ justifyContent: 'center' }}>
                    Read Now
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default function NovelsPage() {
  return <Suspense fallback={<div className="page container"><SkeletonGrid /></div>}><BrowseContent /></Suspense>;
}
