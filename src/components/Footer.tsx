import Link from 'next/link';

export function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link href="/" className="logo" style={{ fontSize: '1.3rem' }}>NovelHive</Link>
            <p className="footer-desc">Your premium destination for translated novels. Immerse yourself in thousands of stories with a beautiful reading experience.</p>
          </div>
          <div className="footer-links-group">
            <h4>Explore</h4>
            <Link href="/novels">Browse Novels</Link>
            <Link href="/search">Search</Link>
            <Link href="/library">My Library</Link>
          </div>
          <div className="footer-links-group">
            <h4>Genres</h4>
            <Link href="/novels?genre=Fantasy">Fantasy</Link>
            <Link href="/novels?genre=Action">Action</Link>
            <Link href="/novels?genre=Romance">Romance</Link>
            <Link href="/novels?genre=Isekai">Isekai</Link>
          </div>
          <div className="footer-links-group">
            <h4>Platform</h4>
            <Link href="/admin">Admin Panel</Link>
            <span>API Docs</span>
            <span>Terms of Service</span>
            <span>Privacy Policy</span>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2024 NovelHive. Built with Go, Rust, and Next.js</span>
        </div>
      </div>
    </footer>
  );
}
