import { cn } from '../lib/utils';
import type { HeaderProps } from '../types/component-props';
import { useI18n } from '../i18n/useI18n';

export const Header = ({ currentPage, themeMode, onToggleTheme, onNavigate, unreadNotificationsCount, onOpenNotifications }: HeaderProps) => {
  const { messages } = useI18n();

  const navItems: { page: 'home' | 'saved' | 'settings'; label: string }[] = [
    { page: 'home', label: messages.common.home },
    { page: 'saved', label: messages.common.saved },
    { page: 'settings', label: messages.common.settings },
  ];

  return (
    <header
      className="sticky top-0 z-50 border-b border-[color:var(--border)]"
      style={{ background: 'rgba(var(--surface-rgb, 255,255,255), 0.85)', backdropFilter: 'blur(20px) saturate(180%)', WebkitBackdropFilter: 'blur(20px) saturate(180%)' }}
    >
      {/* Use inline bg since CSS var can't be used inside rgba() directly */}
      <div className="absolute inset-0 bg-[color:var(--surface)] opacity-85 -z-10" />
      <div className="app-container">
        <div className="flex h-14 items-center justify-between">

          {/* Logo + App name */}
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 rounded-xl px-1 py-1 transition-opacity active:opacity-60"
          >
            <img
              src={`${import.meta.env.BASE_URL}pickupnews-mark.svg`}
              alt="PN"
              className="h-8 w-8 rounded-xl"
            />
            <span className="text-[17px] font-semibold tracking-tight text-primary">PickUpNews</span>
          </button>

          {/* Right side */}
          <div className="flex items-center gap-1">

            {/* Desktop segmented nav */}
            <nav className="mr-2 hidden lg:flex items-center gap-0 rounded-lg bg-[color:var(--surface-muted)] p-1">
              {navItems.map(({ page, label }) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => onNavigate(page)}
                  aria-current={currentPage === page ? 'page' : undefined}
                  className={cn(
                    'rounded-md px-3 py-1 text-[13px] font-medium transition-all',
                    currentPage === page
                      ? 'bg-[color:var(--surface)] text-[color:var(--brand)] shadow-[0_1px_3px_rgba(0,0,0,0.1)]'
                      : 'text-secondary hover:text-primary'
                  )}
                >
                  {label}
                </button>
              ))}
            </nav>

            {/* Notifications bell */}
            <button
              type="button"
              onClick={onOpenNotifications}
              aria-label={messages.notifications.bell}
              className="relative flex h-9 w-9 items-center justify-center rounded-full text-secondary transition-opacity hover:text-primary active:opacity-60"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-[22px] w-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadNotificationsCount > 0 && (
                <span className="absolute right-0.5 top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[color:var(--brand)] px-1 text-[10px] font-bold text-white">
                  {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                </span>
              )}
            </button>

            {/* Theme toggle — always visible */}
            <button
              type="button"
              onClick={onToggleTheme}
              aria-label={messages.common.changeTheme}
              className="flex h-9 w-9 items-center justify-center rounded-full text-[18px] text-secondary transition-opacity hover:text-primary active:opacity-60"
            >
              {themeMode === 'dark' ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

