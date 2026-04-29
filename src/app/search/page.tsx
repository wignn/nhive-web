'use client';
import Link from 'next/link';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Book, SearchX } from 'lucide-react';

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQ = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQ);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(!!initialQ);
  const [suggestions, setSuggestions] = useState<any[]>([]);

  useEffect(() => {
    if (initialQ) doSearch(initialQ);
  }, [initialQ]);

  const doSearch = async (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const data = await api.search(q);
      setResults(data.hits || []);
    } catch { setResults([]); }
    setLoading(false);
    setSuggestions([]);
  };

  const onInput = async (val: string) => {
    setQuery(val);
    if (val.length >= 2) {
      try {
        const data = await api.autocomplete(val);
        setSuggestions(data.suggestions || []);
      } catch { setSuggestions([]); }
    } else { setSuggestions([]); }
  };

  return (
    <main className="page">
      <div className="container" style={{ maxWidth: 800 }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 24 }}>Search Novels</h1>
        <div style={{ position: 'relative' }}>
          <form className="search-bar" onSubmit={e => { e.preventDefault(); doSearch(query); }}>
            <input type="text" placeholder="Search by title, author, or keyword..."
              value={query} onChange={e => onInput(e.target.value)} />
            <button type="submit">Search</button>
          </form>
          {suggestions.length > 0 && (
            <div className="autocomplete-dropdown">
              {suggestions.map((s: any, i: number) => (
                <Link key={i} href={`/novel/${s.slug}`} className="autocomplete-item" onClick={() => setSuggestions([])}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}><Book size={14} /> {s.title}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {loading && <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Searching...</div>}
        
        {!loading && searched && results.length === 0 && (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'center' }}><SearchX size={48} /></div>
            <p>No results found for &ldquo;{query}&rdquo;</p>
          </div>
        )}

        {!loading && results.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <p style={{ color: 'var(--text-muted)', marginBottom: 16, fontSize: '0.9rem' }}>
              Found {results.length} result{results.length > 1 ? 's' : ''}
            </p>
            {results.map((novel: any) => (
              <Link key={novel.id} href={`/novel/${novel.slug}`} className="search-result-card card">
                <div>
                  <h3 style={{ fontWeight: 700, marginBottom: 4 }}>{novel.title}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 8 }}>by {novel.author}</p>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{novel.synopsis?.slice(0, 150)}...</p>
                  <div className="genre-tags" style={{ marginTop: 8 }}>
                    {(novel.genres || []).map((g: any) => <span key={g.id} className="genre-tag">{g.name}</span>)}
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

export default function SearchPage() {
  return <Suspense fallback={<div className="page container"><p>Loading...</p></div>}><SearchContent /></Suspense>;
}
