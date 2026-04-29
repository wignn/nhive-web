'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { SkeletonGrid } from '@/components/Skeleton';
import { useRouter } from 'next/navigation';

import { Book, Eye, FileText } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [novels, setNovels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQ, setSearchQ] = useState('');

  const [coverBase, setCoverBase] = useState('');

  useEffect(() => {
    api.listNovels('page=1&page_size=10&sort=updated')
      .then(d => {
        setNovels(d.novels || []);
        if (d.cover_base_url) setCoverBase(d.cover_base_url);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const featured = novels.slice(0, 3);
  const regular = novels.slice(3);

  return (
    <main>
      <section style={{ 
          position: 'relative', 
          padding: '80px 20px', 
          textAlign: 'center',
          overflow: 'hidden',
          marginBottom: '40px',
          borderBottom: '1px solid var(--border)'
        }}>
        {/* Glow Effects */}
        <div style={{ position: 'absolute', top: '-50%', left: '50%', transform: 'translateX(-50%)', width: '600px', height: '600px', background: 'radial-gradient(circle, var(--accent) 0%, transparent 60%)', opacity: 0.1, zIndex: 0, pointerEvents: 'none' }} />
        
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <h1 className="animate-in" style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: 16, letterSpacing: '-1px', lineHeight: 1.1 }}>
            Dive Into <span style={{ background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Limitless Worlds</span>
          </h1>
          <p className="animate-in" style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: '1.15rem', maxWidth: '600px', margin: '0 auto 32px' }}>
            Discover and read premium web novels, original fiction, and epic adventures on NovelHive.
          </p>
          <form className="search-bar animate-in" style={{ margin: '0 auto', animationDelay: '0.1s', position: 'relative', boxShadow: 'var(--shadow-md)', borderRadius: '50px', background: 'var(--bg-card)' }}
            onSubmit={e => { e.preventDefault(); if (searchQ.trim()) router.push(`/search?q=${encodeURIComponent(searchQ)}`); }}>
            <input type="text" placeholder="Search by title, author, or keyword..."
              value={searchQ} onChange={e => setSearchQ(e.target.value)} style={{ background: 'transparent', border: 'none', padding: '16px 24px', fontSize: '1rem' }} />
            <button type="submit" className="btn-primary" style={{ margin: '6px', borderRadius: '40px', padding: '10px 24px' }}>Search</button>
          </form>
        </div>
      </section>

      <section className="container featured-hero">
        <div className="section-header">
          <h2 className="section-title">Editor's Picks</h2>
        </div>
        {loading ? <SkeletonGrid count={3} /> : (
          <div className="featured-grid">
            {featured.map((novel: any, i: number) => (
              <Link href={`/novel/${novel.slug}`} key={novel.id} className={`featured-card ${i === 0 ? 'large' : 'small'} animate-in`} style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="f-cover">
                  {novel.cover_url ? (
                    <img src={novel.cover_url.startsWith('http') ? novel.cover_url : `${coverBase}/${novel.cover_url}`} alt={novel.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-secondary)', color: 'var(--text-muted)', opacity: 0.3 }}>
                      <Book size={48} />
                    </div>
                  )}
                </div>
                <div className="f-info">
                  <div className="f-title">{novel.title}</div>
                  <div style={{ color: 'var(--accent)', fontSize: '0.85rem', fontWeight: 600, marginBottom: 8 }}>{novel.genres?.[0]?.name}</div>
                  <div className="f-desc">{novel.synopsis}</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="container">
        <div className="section-header">
          <h2 className="section-title">Recently Updated</h2>
          <Link href="/novels" className="btn btn-secondary btn-sm">View All</Link>
        </div>
        {loading ? <SkeletonGrid count={6} /> : (
          <div className="novel-grid stagger">
            {regular.map((novel: any) => (
            
              <Link href={`/novel/${novel.slug}`} key={novel.id} className="novel-card animate-in">
                <div className="novel-cover">
                  {novel.cover_url ? (
                    <img src={novel.cover_url.startsWith('http') ? novel.cover_url : `${coverBase}/${novel.cover_url}`} alt={novel.title} />
                  ) : (
                    <span className="novel-cover-placeholder" style={{ display: 'flex', color: 'var(--text-muted)' }}><Book size={32} /></span>
                  )}
                  
                  {/* Top-Left Glass Badge for Genre */}
                  {novel.genres && novel.genres.length > 0 && (
                    <span className="badge-glass badge-tl">
                      {novel.genres[0].name}
                    </span>
                  )}
                  
                  {/* Bottom-Left Solid Badge for Status */}
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
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Eye size={12} /> {(novel.view_count / 1000).toFixed(1)}k</span>
                  </div>
                </div>
                
                {/* Hover Action */}
                <div className="novel-card-actions">
                  <div className="btn btn-glass" style={{ justifyContent: 'center' }}>
                    Read Now
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
