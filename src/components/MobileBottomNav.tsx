import type { MobileBottomNavProps } from '../types/component-props';
import { useI18n } from '../i18n/useI18n';
import { Button } from './ui';

export const MobileBottomNav = ({
  currentPage,
  onNavigate,
}: MobileBottomNavProps) => {
  const { messages } = useI18n();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 px-4 pb-[calc(env(safe-area-inset-bottom)+0.65rem)] pt-2 lg:hidden"
      aria-label={messages.common.navigation}
    >
      <div className="mx-auto grid w-full max-w-lg grid-cols-3 gap-2 rounded-3xl border border-[color:var(--border)] bg-[color:var(--surface)]/95 p-2 shadow-[var(--shadow-float)] backdrop-blur">
        <Button
          type="button"
          onClick={() => onNavigate('home')}
          variant={currentPage === 'home' ? 'brand' : 'ghost'}
          size="icon"
          aria-current={currentPage === 'home' ? 'page' : undefined}
          className="h-11 w-full rounded-2xl"
          aria-label={messages.common.home}
          title={messages.common.home}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 10.5 12 3l9 7.5" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 9.75V21h13.5V9.75" />
          </svg>
        </Button>

        <Button
          type="button"
          onClick={() => onNavigate('saved')}
          variant={currentPage === 'saved' ? 'brand' : 'ghost'}
          size="icon"
          aria-current={currentPage === 'saved' ? 'page' : undefined}
          className="h-11 w-full rounded-2xl"
          aria-label={messages.common.saved}
          title={messages.common.saved}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 4h12a1 1 0 0 1 1 1v15l-7-4-7 4V5a1 1 0 0 1 1-1z" />
          </svg>
        </Button>

        <Button
          type="button"
          onClick={() => onNavigate('settings')}
          variant={currentPage === 'settings' ? 'brand' : 'ghost'}
          size="icon"
          aria-current={currentPage === 'settings' ? 'page' : undefined}
          className="h-11 w-full rounded-2xl"
          aria-label={messages.common.settings}
          title={messages.common.settings}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.25 4.5h3.5l.65 2.03a6.89 6.89 0 0 1 1.52.88l2-.8 1.75 3.03-1.53 1.5c.07.42.11.85.11 1.28 0 .43-.04.86-.11 1.28l1.53 1.5-1.75 3.03-2-.8a6.89 6.89 0 0 1-1.52.88l-.65 2.03h-3.5l-.65-2.03a6.89 6.89 0 0 1-1.52-.88l-2 .8-1.75-3.03 1.53-1.5A7.41 7.41 0 0 1 5 12c0-.43.04-.86.11-1.28l-1.53-1.5L5.33 6.2l2 .8c.46-.36.97-.66 1.52-.88z" />
            <circle cx="12" cy="12" r="2.8" />
          </svg>
        </Button>
      </div>
    </nav>
  );
};
