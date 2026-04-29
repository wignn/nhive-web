'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useState, useRef, useEffect } from 'react';
import { Home, Library, Search, BookOpen, Settings, LogOut, ChevronDown, Menu, X, User } from 'lucide-react';

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [searchQ, setSearchQ] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  if (pathname?.match(/\/novel\/[^/]+\/\d+/)) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQ.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQ)}`);
      setMobileMenu(false);
    }
  };

  const isAdmin = session?.user?.role === 'admin';
  const navLinks = [
    { href: '/', label: 'Home', icon: <Home size={18} /> },
    { href: '/novels', label: 'Browse', icon: <Library size={18} /> },
  ];

  return (
    <header className="header">
      <div className="header-inner">
        
        <div className="header-left">
          <Link href="/" className="logo">NovelHive</Link>
          <nav className="nav-links desktop-only">
            {navLinks.map(link => (
              <Link key={link.href} href={link.href} className={`nav-link ${pathname === link.href ? 'active' : ''}`}>
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <form className="header-search desktop-only" onSubmit={handleSearch}>
          <input type="text" placeholder="Search novels..." value={searchQ} onChange={e => setSearchQ(e.target.value)} />
          <button type="submit"><Search size={16} /></button>
        </form>

        <div className="header-right desktop-only">
          {session ? (
            <div className="user-menu" ref={dropdownRef}>
              <button className="user-avatar-btn" onClick={() => setShowDropdown(!showDropdown)}>
                <span className="user-avatar-circle">{session.user.username?.[0]?.toUpperCase() || '?'}</span>
                <span className="user-name-text">{session.user.username}</span>
                <ChevronDown size={14} />
              </button>
              {showDropdown && (
                <div className="dropdown-menu animate-in">
                  <div className="dropdown-header">
                    <strong>{session.user.username}</strong>
                    <span className="dropdown-role">{session.user.role}</span>
                  </div>
                  <Link href="/library" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                    <BookOpen size={16} /> My Library
                  </Link>
                  {isAdmin && (
                    <Link href="/admin" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                      <Settings size={16} /> Admin Panel
                    </Link>
                  )}
                  <div className="dropdown-divider" />
                  <button className="dropdown-item dropdown-logout" onClick={() => signOut({ callbackUrl: '/' })}>
                    <LogOut size={16} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-buttons">
              <Link href="/login" className="btn btn-ghost btn-sm">Sign In</Link>
              <Link href="/register" className="btn btn-primary btn-sm">Sign Up</Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button className="mobile-menu-btn" onClick={() => setMobileMenu(!mobileMenu)}>
          {mobileMenu ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Drawer */}
      <div className={`mobile-drawer ${mobileMenu ? 'open' : ''}`}>
        <div className="mobile-drawer-content">
          <form className="mobile-search" onSubmit={handleSearch}>
            <input type="text" placeholder="Search novels..." value={searchQ} onChange={e => setSearchQ(e.target.value)} />
            <button type="submit"><Search size={16} /></button>
          </form>

          <div className="mobile-nav-group">
            {navLinks.map(link => (
              <Link key={link.href} href={link.href} className="mobile-menu-item" onClick={() => setMobileMenu(false)}>
                {link.icon} <span>{link.label}</span>
              </Link>
            ))}
          </div>

          <div className="mobile-nav-group">
            {session ? (
              <>
                <Link href="/library" className="mobile-menu-item" onClick={() => setMobileMenu(false)}>
                  <BookOpen size={18} /> <span>My Library</span>
                </Link>
                {isAdmin && (
                  <Link href="/admin" className="mobile-menu-item" onClick={() => setMobileMenu(false)}>
                    <Settings size={18} /> <span>Admin Panel</span>
                  </Link>
                )}
                <button className="mobile-menu-item text-danger" onClick={() => { signOut({ callbackUrl: '/' }); setMobileMenu(false); }}>
                  <LogOut size={18} /> <span>Sign Out</span>
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="mobile-menu-item" onClick={() => setMobileMenu(false)}>
                  <User size={18} /> <span>Sign In</span>
                </Link>
                <Link href="/register" className="mobile-menu-item" onClick={() => setMobileMenu(false)}>
                  <span className="text-accent" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><LogOut size={18} /> Sign Up</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
      {mobileMenu && <div className="mobile-overlay" onClick={() => setMobileMenu(false)} />}
    </header>
  );
}
