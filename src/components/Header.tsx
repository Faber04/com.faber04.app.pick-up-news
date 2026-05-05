import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import type { HeaderProps } from '../types/component-props';
import { useI18n } from '../i18n/useI18n';
import { Button } from './ui';

export const Header = ({ currentPage, themeMode, onToggleTheme, onNavigate, unreadNotificationsCount, onOpenNotifications }: HeaderProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { messages } = useI18n();

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';

    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const handleNavigate = (page: 'home' | 'settings') => {
    onNavigate(page);
    setMenuOpen(false);
  };

  const navItems: { page: 'home' | 'settings'; label: string }[] = [
    { page: 'home', label: messages.common.home },
    { page: 'settings', label: messages.common.settings },
  ];

  const mobileDrawer = menuOpen ? createPortal(
    <div className="sm:hidden fixed inset-0 z-[60]">
      <button
        type="button"
        aria-label={messages.common.closeMenu}
        className="absolute inset-0 bg-slate-950/45"
        onClick={() => setMenuOpen(false)}
      />
      <aside className="mobile-drawer fixed inset-y-0 right-0 z-10 h-dvh w-[min(82vw,22rem)] overflow-y-auto border-l border-[color:var(--border)] bg-[color:var(--surface-strong)] px-5 py-5 shadow-2xl">
        <div className="flex items-center justify-between border-b border-[color:var(--border)] pb-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">{messages.common.navigation}</p>
            <p className="mt-1 text-lg font-bold text-primary">PickUpNews</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-xl"
            onClick={() => setMenuOpen(false)}
            aria-label={messages.common.closeMenu}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>

        <nav className="mt-5 space-y-2">
          {navItems.map(({ page, label }) => (
            <Button
              key={page}
              type="button"
              onClick={() => handleNavigate(page)}
              variant={currentPage === page ? 'brand' : 'ghost'}
              className={`w-full justify-start rounded-2xl px-4 py-3 text-left ${
                currentPage === page
                  ? 'shadow-[0_18px_34px_-28px_rgba(2,8,23,0.9)]'
                  : ''
              }`}
            >
              {label}
            </Button>
          ))}
          <Button
            type="button"
            onClick={onToggleTheme}
            variant="secondary"
            className="w-full rounded-2xl py-3 text-base"
            aria-label={messages.common.changeTheme}
          >
            <span aria-hidden="true">{themeMode === 'dark' ? '☀️' : '🌙'}</span>
          </Button>
        </nav>

      </aside>
    </div>,
    document.body,
  ) : null;

  return (
    <>
      <header className="sticky top-0 z-50 border-b backdrop-blur border-[color:var(--border)] bg-[color:var(--surface)]/95">
        <div className="app-container h-16 flex items-center justify-between">
        {/* Logo + Title */}
        <button
          onClick={() => handleNavigate('home')}
          className="flex items-center gap-3 rounded-2xl px-1 py-1 text-left transition-opacity hover:opacity-85"
        >
          <span className="inline-flex rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-1.5 shadow-[0_14px_30px_-24px_rgba(2,8,23,0.8)]">
            <img
              src={`${import.meta.env.BASE_URL}pickupnews-mark.svg`}
              alt="PN"
              className="w-8 h-8 rounded-xl"
            />
          </span>
          <span>
            <span className="block text-xl font-bold text-primary">PickUpNews</span>
            <span className="hidden text-[11px] font-semibold uppercase tracking-[0.18em] text-muted sm:block">Feed briefings, cleaner reading</span>
          </span>
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden sm:flex items-center gap-2">
          {navItems.map(({ page, label }) => (
            <Button
              key={page}
              type="button"
              onClick={() => handleNavigate(page)}
              variant={currentPage === page ? 'brand' : 'ghost'}
              size="sm"
              className={currentPage === page ? '' : 'rounded-full'}
            >
              {label}
            </Button>
          ))}
          <Button
            type="button"
            onClick={onToggleTheme}
            variant="secondary"
            size="icon"
            aria-label={messages.common.changeTheme}
          >
            <span aria-hidden="true">{themeMode === 'dark' ? '☀️' : '🌙'}</span>
          </Button>
          {/* Bell — desktop */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onOpenNotifications}
            aria-label={messages.notifications.bell}
            className="relative rounded-xl"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {unreadNotificationsCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[color:var(--brand)] text-[10px] font-bold text-white">
                {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
              </span>
            )}
          </Button>
        </nav>

        {/* Mobile controls */}
        <div className="sm:hidden flex items-center gap-1">
          {/* Bell — mobile */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onOpenNotifications}
            aria-label={messages.notifications.bell}
            className="relative rounded-xl"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {unreadNotificationsCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[color:var(--brand)] text-[10px] font-bold text-white">
                {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
              </span>
            )}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="rounded-xl"
            onClick={() => setMenuOpen(prev => !prev)}
            aria-label={menuOpen ? messages.common.closeMenu : messages.common.toggleMenu}
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
          </Button>
        </div>
        </div>
      </header>
      {mobileDrawer}
    </>
  );
};
