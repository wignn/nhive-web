'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useToast } from '@/components/Toast';
import { Book, FileText, Tags, Users, Globe, Edit, Trash2, User, Shield } from 'lucide-react';

type Tab = 'novels' | 'chapters' | 'genres' | 'users';
const GENRES = ['Fantasy','Action','Romance','Adventure','Sci-Fi','Mystery','Horror','Comedy','Drama','Slice of Life','Martial Arts','Isekai','Wuxia','Xianxia'];

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab>('novels');
  const [novels, setNovels] = useState<any[]>([]);
  const [chapters, setChapters] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [coverBaseUrl, setCoverBaseUrl] = useState('');

  const [novelForm, setNovelForm] = useState({ title: '', author: '', synopsis: '', status: 'ongoing', cover_url: '', cover_preview: '', genres: [] as string[] });
  const [chapterForm, setChapterForm] = useState({ novel_id: '', number: 1, title: '', content: '' });

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login?callbackUrl=/admin');
    if (session && session.user.role !== 'admin') router.push('/');
  }, [status, session]);

  useEffect(() => {
    if (!session || session.user.role !== 'admin') return;
    loadData();
  }, [session, tab]);

  const loadData = async () => {
    if (!session) return;
    setLoading(true);
    try {
      if (tab === 'novels') {
        const d = await api.admin.listNovels(session.accessToken);
        setNovels(d.novels || []);
        if (d.cover_base_url) setCoverBaseUrl(d.cover_base_url);
      } else if (tab === 'chapters') {
        const d = await api.admin.listChapters(session.accessToken);
        setChapters((d.chapters || []).map((c: any) => ({ ...c.Chapter, novel_title: c.NovelTitle })));
      } else if (tab === 'users') {
        const d = await api.admin.listUsers(session.accessToken);
        setUsers(d.users || []);
      }
    } catch { toast('error', 'Failed to load data'); }
    setLoading(false);
  };

  const openCreate = () => {
    setEditItem(null);
    if (tab === 'novels') setNovelForm({ title: '', author: '', synopsis: '', status: 'ongoing', cover_url: '', cover_preview: '', genres: [] });
    if (tab === 'chapters') setChapterForm({ novel_id: novels[0]?.id || '', number: 1, title: '', content: '' });
    setShowModal(true);
  };

  const openEdit = (item: any) => {
    setEditItem(item);
    if (tab === 'novels') {
      const preview = item.cover_url ? (item.cover_url.startsWith('http') ? item.cover_url : `${coverBaseUrl}/${item.cover_url}`) : '';
      setNovelForm({ title: item.title, author: item.author, synopsis: item.synopsis || '', status: item.status, cover_url: item.cover_url || '', cover_preview: preview, genres: item.genres || [] });
    }
    if (tab === 'chapters') setChapterForm({ novel_id: item.novel_id, number: item.number, title: item.title, content: item.content || '' });
    setShowModal(true);
  };

  const uploadCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !session) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await api.admin.uploadImage(formData, session.accessToken);
      setNovelForm({ ...novelForm, cover_url: res.path, cover_preview: `${res.base_url}/${res.path}` });
      toast('success', 'Cover uploaded successfully');
    } catch (err: any) {
      toast('error', err.message || 'Failed to upload cover');
    }
    setIsUploading(false);
  };

  const saveNovel = async () => {
    if (!session) return;
    try {
      if (editItem) {
        await api.admin.updateNovel(editItem.id, novelForm, session.accessToken);
        toast('success', 'Novel updated!');
      } else {
        await api.admin.createNovel(novelForm, session.accessToken);
        toast('success', 'Novel created!');
      }
      setShowModal(false);
      loadData();
    } catch (e: any) { toast('error', e.message); }
  };

  const saveChapter = async () => {
    if (!session) return;
    try {
      if (editItem) {
        await api.admin.updateChapter(editItem.id, { title: chapterForm.title, content: chapterForm.content }, session.accessToken);
        toast('success', 'Chapter updated!');
      } else {
        await api.admin.createChapter(chapterForm, session.accessToken);
        toast('success', 'Chapter published!');
      }
      setShowModal(false);
      loadData();
    } catch (e: any) { toast('error', e.message); }
  };

  const deleteNovel = async (id: string) => {
    if (!session || !confirm('Delete this novel and all its chapters?')) return;
    try {
      await api.admin.deleteNovel(id, session.accessToken);
      toast('success', 'Novel deleted');
      loadData();
    } catch (e: any) { toast('error', e.message); }
  };

  const deleteChapter = async (id: string) => {
    if (!session || !confirm('Delete this chapter?')) return;
    try {
      await api.admin.deleteChapter(id, session.accessToken);
      toast('success', 'Chapter deleted');
      loadData();
    } catch (e: any) { toast('error', e.message); }
  };

  const toggleRole = async (userId: string, currentRole: string) => {
    if (!session) return;
    const newRole = currentRole === 'admin' ? 'reader' : 'admin';
    try {
      await api.admin.updateUserRole(userId, newRole, session.accessToken);
      toast('success', `Role changed to ${newRole}`);
      loadData();
    } catch (e: any) { toast('error', e.message); }
  };

  if (status === 'loading' || !session) return <main className="page"><div className="container"><p>Loading...</p></div></main>;
  if (session.user.role !== 'admin') return <main className="page"><div className="container"><h1>Access Denied</h1><p>You need admin privileges.</p></div></main>;

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div style={{ marginBottom: 24 }}>
          <Link href="/" className="logo" style={{ fontSize: '1.2rem' }}>NovelHive</Link>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: 4 }}>Admin Panel</p>
        </div>
        <div className="admin-sidebar-title">Management</div>
        {(['novels', 'chapters', 'genres', 'users'] as Tab[]).map(t => (
          <div key={t} className={`admin-nav-item ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {t === 'novels' && <Book size={16} />} 
            {t === 'chapters' && <FileText size={16} />} 
            {t === 'genres' && <Tags size={16} />} 
            {t === 'users' && <Users size={16} />}
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </div>
        ))}
        <div className="admin-sidebar-title" style={{ marginTop: 24 }}>Quick Links</div>
        <Link href="/" className="admin-nav-item" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Globe size={16} /> View Site
        </Link>
      </aside>

      <div className="admin-content">
        <div className="stats-grid">
          <div className="stat-card"><div className="stat-value">{novels.length}</div><div className="stat-label">Novels</div></div>
          <div className="stat-card"><div className="stat-value">{chapters.length}</div><div className="stat-label">Chapters</div></div>
          <div className="stat-card"><div className="stat-value">{GENRES.length}</div><div className="stat-label">Genres</div></div>
          <div className="stat-card"><div className="stat-value">{users.length}</div><div className="stat-label">Users</div></div>
        </div>

        <div className="admin-header">
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            {tab === 'novels' && <><Book size={24} /> Manage Novels</>}
            {tab === 'chapters' && <><FileText size={24} /> Manage Chapters</>}
            {tab === 'genres' && <><Tags size={24} /> Genres</>}
            {tab === 'users' && <><Users size={24} /> Users</>}
          </h2>
          {(tab === 'novels' || tab === 'chapters') && (
            <button className="btn btn-primary" onClick={openCreate}>+ Create {tab === 'novels' ? 'Novel' : 'Chapter'}</button>
          )}
        </div>

        {loading ? <p style={{ color: 'var(--text-muted)' }}>Loading...</p> : (
          <>
            {tab === 'novels' && (
              <table className="admin-table">
                <thead><tr><th>Title</th><th>Author</th><th>Status</th><th>Ch</th><th>Actions</th></tr></thead>
                <tbody>
                  {novels.map((n: any) => (
                    <tr key={n.id}>
                      <td><strong>{n.title}</strong></td>
                      <td style={{ color: 'var(--text-secondary)' }}>{n.author}</td>
                      <td><span className={`novel-status-badge ${n.status}`} style={{ position: 'static' }}>{n.status}</span></td>
                      <td>{n.total_chapters}</td>
                      <td><div className="admin-actions">
                        <button className="btn btn-secondary btn-sm" onClick={() => openEdit(n)} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Edit size={14} /> Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={(e) => { e.preventDefault(); e.stopPropagation(); deleteNovel(n.id); }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Trash2 size={14} /></button>
                      </div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {tab === 'chapters' && (
              <table className="admin-table">
                <thead><tr><th>Novel</th><th>#</th><th>Title</th><th>Words</th><th>Actions</th></tr></thead>
                <tbody>
                  {chapters.map((c: any) => (
                    <tr key={c.id}>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{c.novel_title}</td>
                      <td>{c.number}</td>
                      <td><strong>{c.title}</strong></td>
                      <td>{c.word_count}</td>
                      <td><div className="admin-actions">
                        <button className="btn btn-secondary btn-sm" onClick={() => openEdit(c)} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Edit size={14} /> Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={(e) => { e.preventDefault(); e.stopPropagation(); deleteChapter(c.id); }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Trash2 size={14} /></button>
                      </div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {tab === 'genres' && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                {GENRES.map(g => (
                  <div key={g} className="card" style={{ padding: '16px 24px' }}>
                    <span className="genre-tag" style={{ fontSize: '0.85rem' }}>{g}</span>
                  </div>
                ))}
              </div>
            )}

            {tab === 'users' && (
              <table className="admin-table">
                <thead><tr><th>Username</th><th>Email</th><th>Role</th><th>Actions</th></tr></thead>
                <tbody>
                  {users.map((u: any) => (
                    <tr key={u.id}>
                      <td><strong>{u.username}</strong></td>
                      <td style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                      <td><span className={`role-badge role-${u.role}`}>{u.role}</span></td>
                      <td>
                        <button className="btn btn-secondary btn-sm" onClick={() => toggleRole(u.id, u.role)} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {u.role === 'admin' ? <><User size={14} /> Make Reader</> : <><Shield size={14} /> Make Admin</>}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal animate-in" onClick={e => e.stopPropagation()}>
            {tab === 'novels' && (
              <>
                <h2 className="modal-title">{editItem ? '✏️ Edit Novel' : '📚 Create Novel'}</h2>
                <div className="form-group">
                  <label className="form-label">Title *</label>
                  <input className="form-input" value={novelForm.title} onChange={e => setNovelForm({ ...novelForm, title: e.target.value })} placeholder="Novel title" />
                </div>
                <div className="form-group">
                  <label className="form-label">Author *</label>
                  <input className="form-input" value={novelForm.author} onChange={e => setNovelForm({ ...novelForm, author: e.target.value })} placeholder="Author name" />
                </div>
                <div className="form-group">
                  <label className="form-label">Cover Image</label>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    {novelForm.cover_preview && <img src={novelForm.cover_preview} alt="Cover Preview" style={{ width: 60, height: 90, objectFit: 'cover', borderRadius: 4 }} />}
                    <input type="file" accept="image/*" onChange={uploadCover} disabled={isUploading} className="form-input" style={{ flex: 1 }} />
                  </div>
                  {isUploading && <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Uploading...</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Synopsis</label>
                  <textarea className="form-textarea" value={novelForm.synopsis} onChange={e => setNovelForm({ ...novelForm, synopsis: e.target.value })} placeholder="Novel synopsis..." />
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-select" value={novelForm.status} onChange={e => setNovelForm({ ...novelForm, status: e.target.value })}>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                    <option value="hiatus">Hiatus</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Genres</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {GENRES.map(g => (
                      <button key={g} type="button" className="genre-tag"
                        style={{ cursor: 'pointer', opacity: novelForm.genres.includes(g) ? 1 : 0.4, border: novelForm.genres.includes(g) ? '1px solid var(--accent)' : '1px solid transparent' }}
                        onClick={() => setNovelForm(f => ({ ...f, genres: f.genres.includes(g) ? f.genres.filter(x => x !== g) : [...f.genres, g] }))}>{g}</button>
                    ))}
                  </div>
                </div>
                <div className="modal-actions">
                  <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button className="btn btn-primary" onClick={saveNovel}>{editItem ? 'Save' : 'Create'}</button>
                </div>
              </>
            )}
            {tab === 'chapters' && (
              <>
                <h2 className="modal-title">{editItem ? '✏️ Edit Chapter' : '📄 Create Chapter'}</h2>
                {!editItem && (
                  <div className="form-group">
                    <label className="form-label">Novel *</label>
                    <select className="form-select" value={chapterForm.novel_id} onChange={e => setChapterForm({ ...chapterForm, novel_id: e.target.value })}>
                      <option value="">Select novel...</option>
                      {novels.map(n => <option key={n.id} value={n.id}>{n.title}</option>)}
                    </select>
                  </div>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Number</label>
                    <input className="form-input" type="number" value={chapterForm.number} onChange={e => setChapterForm({ ...chapterForm, number: parseInt(e.target.value) || 1 })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Title</label>
                    <input className="form-input" value={chapterForm.title} onChange={e => setChapterForm({ ...chapterForm, title: e.target.value })} placeholder="Chapter title" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Content *</label>
                  <textarea className="form-textarea" style={{ minHeight: 250 }} value={chapterForm.content} onChange={e => setChapterForm({ ...chapterForm, content: e.target.value })} placeholder="Paste chapter content..." />
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {chapterForm.content.split(/\s+/).filter(Boolean).length} words
                  </span>
                </div>
                <div className="modal-actions">
                  <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button className="btn btn-primary" onClick={saveChapter}>{editItem ? 'Save' : 'Publish'}</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
