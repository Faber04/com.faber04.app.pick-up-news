import type { MobileBottomNavProps } from '../types/component-props';
import { useI18n } from '../i18n/useI18n';

export const MobileBottomNav = ({
  currentPage,
  onNavigate,
}: MobileBottomNavProps) => {
  const { messages } = useI18n();

  const tabs: {
    page: 'home' | 'saved' | 'settings';
    label: string;
    icon: (active: boolean) => React.ReactNode;
  }[] = [
    {
      page: 'home',
      label: messages.common.home,
      icon: (active) => (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-[26px] w-[26px]" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? 0 : 1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 10.5 12 3l9 7.5" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 9.75V21h13.5V9.75" />
        </svg>
      ),
    },
    {
      page: 'saved',
      label: messages.common.saved,
      icon: (active) => (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-[26px] w-[26px]" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? 0 : 1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 4h12a1 1 0 0 1 1 1v15l-7-4-7 4V5a1 1 0 0 1 1-1z" />
        </svg>
      ),
    },
    {
      page: 'settings',
      label: messages.common.settings,
      icon: (active) => (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-[26px] w-[26px]" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? 0 : 1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.25 4.5h3.5l.65 2.03a6.89 6.89 0 0 1 1.52.88l2-.8 1.75 3.03-1.53 1.5c.07.42.11.85.11 1.28 0 .43-.04.86-.11 1.28l1.53 1.5-1.75 3.03-2-.8a6.89 6.89 0 0 1-1.52.88l-.65 2.03h-3.5l-.65-2.03a6.89 6.89 0 0 1-1.52-.88l-2 .8-1.75-3.03 1.53-1.5A7.41 7.41 0 0 1 5 12c0-.43.04-.86.11-1.28l-1.53-1.5L5.33 6.2l2 .8c.46-.36.97-.66 1.52-.88z" />
          <circle cx="12" cy="12" r="2.8" />
        </svg>
      ),
    },
  ];

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[color:var(--border)] lg:hidden"
      style={{
        background: 'var(--surface)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        paddingBottom: 'max(env(safe-area-inset-bottom), 8px)',
      }}
      aria-label={messages.common.navigation}
    >
      <div className="flex">
        {tabs.map(({ page, label, icon }) => {
          const active = currentPage === page;
          return (
            <button
              key={page}
              type="button"
              onClick={() => onNavigate(page)}
              aria-current={active ? 'page' : undefined}
              aria-label={label}
              className="flex flex-1 flex-col items-center gap-[3px] pt-2 pb-1 transition-opacity active:opacity-50"
              style={{ color: active ? 'var(--brand)' : 'var(--text-muted)' }}
            >
              {icon(active)}
              <span className="text-[10px] font-medium tracking-tight">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

