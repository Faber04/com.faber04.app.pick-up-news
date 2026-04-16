import { useState } from 'react';
import type { ThemeMode } from '../hooks/useAppState';

interface HeaderProps {
  currentPage: 'home' | 'feeds';
  onNavigate: (page: 'home' | 'feeds') => void;
  themeMode: ThemeMode;
  onToggleTheme: () => void;
}

export const Header = ({ currentPage, onNavigate, themeMode, onToggleTheme }: HeaderProps) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleNavigate = (page: 'home' | 'feeds') => {
    onNavigate(page);
    setMenuOpen(false);
  };

  const navItems: { page: 'home' | 'feeds'; label: string }[] = [
    { page: 'home', label: 'Home' },
    { page: 'feeds', label: 'Feeds' },
  ];

  return (
    <header className="sticky top-0 z-50 border-b backdrop-blur border-[color:var(--border)] bg-[color:var(--surface)]/95">
      <div className="app-container h-16 flex items-center justify-between">
        {/* Logo + Title */}
        <button
          onClick={() => handleNavigate('home')}
          className="flex items-center gap-3 hover:opacity-85 transition-opacity"
        >
          <img
            src={`${import.meta.env.BASE_URL}pickupnews-mark.svg`}
            alt="PN"
            className="w-9 h-9 rounded-xl"
          />
          <span className="text-xl font-bold text-primary">PickUpNews</span>
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden sm:flex items-center gap-2">
          {navItems.map(({ page, label }) => (
            <button
              key={page}
              onClick={() => handleNavigate(page)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors border ${
                currentPage === page
                  ? 'badge-brand'
                  : 'text-secondary border-transparent hover:border-[color:var(--border)] hover:bg-[color:var(--surface-muted)]'
              }`}
            >
              {label}
            </button>
          ))}
        </nav>

        <div className="hidden sm:flex items-center gap-3">
          <button
            className="btn-neutral px-3 py-2 rounded-lg text-sm font-medium transition"
            onClick={onToggleTheme}
            aria-label="Cambia tema"
            title="Cambia tema"
          >
            {themeMode === 'dark' ? '☀️ Light' : '🌙 Dark'}
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="sm:hidden flex items-center gap-2">
          <button
            className="btn-neutral px-2.5 py-2 rounded-lg text-xs font-semibold"
            onClick={onToggleTheme}
            aria-label="Cambia tema"
            title="Cambia tema"
          >
            {themeMode === 'dark' ? '☀️' : '🌙'}
          </button>
          <button
            className="p-2 rounded-lg text-secondary hover:bg-[color:var(--surface-muted)] transition-colors"
            onClick={() => setMenuOpen(prev => !prev)}
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div className="sm:hidden border-t border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-2 stagger-in">
          {navItems.map(({ page, label }) => (
            <button
              key={page}
              onClick={() => handleNavigate(page)}
              className={`w-full text-left px-4 py-3 rounded-lg font-medium text-sm transition-colors border ${
                currentPage === page
                  ? 'badge-brand'
                  : 'text-secondary border-transparent hover:border-[color:var(--border)] hover:bg-[color:var(--surface-muted)]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
};
