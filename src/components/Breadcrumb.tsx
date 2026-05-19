import type { BreadcrumbProps } from '../types/component-props';

export const Breadcrumb = ({ trail, onNavigate }: BreadcrumbProps) => {
  if (trail.length <= 1) {
    return null;
  }

  const previous = trail[trail.length - 2];
  const current = trail[trail.length - 1];

  return (
    <div
      className="sticky top-14 z-40 border-b border-[color:var(--border)]"
      style={{
        background: 'var(--surface)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      }}
    >
      <div className="app-container relative flex h-11 items-center">
        {/* Back button — left */}
        <button
          type="button"
          onClick={() => onNavigate.goToIndex(trail.length - 2)}
          className="flex items-center gap-0.5 py-1 pr-3 text-[15px] font-medium transition-opacity active:opacity-50"
          style={{ color: 'var(--brand)' }}
          aria-label={`Back to ${previous.label}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          <span className="max-w-[120px] truncate">{previous.label}</span>
        </button>

        {/* Current page title — centered */}
        <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 max-w-[50%] truncate text-[15px] font-semibold text-primary">
          {current.label}
        </span>
      </div>
    </div>
  );
};
