import { useState, useRef, useEffect } from 'react';
import type { ViewMode } from '../types';
import { useI18n } from '../i18n/useI18n';

export interface ViewModeDropdownProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

const ViewModeIcon = ({ mode, className = 'h-4 w-4' }: { mode: ViewMode; className?: string }) => {
  switch (mode) {
    case 'chronological':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case 'by-feed':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      );
    case 'by-category':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
        </svg>
      );
    default:
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      );
  }
};

export const ViewModeDropdown = ({ viewMode, onViewModeChange }: ViewModeDropdownProps) => {
  const { messages } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  const handleSelect = (mode: ViewMode) => {
    onViewModeChange(mode);
    setIsOpen(false);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const currentLabel = messages.viewModes[viewMode as keyof typeof messages.viewModes] || viewMode;

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={handleToggle}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label={messages.common.changeViewMode || 'Cambia modalita visualizzazione'}
        title={currentLabel}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[color:color-mix(in_srgb,var(--brand)_18%,var(--border)_82%)] bg-[color:color-mix(in_srgb,var(--brand)_8%,var(--surface)_92%)] text-[color:var(--brand-strong)] shadow-none transition hover:bg-[color:color-mix(in_srgb,var(--brand)_12%,var(--surface)_88%)] disabled:cursor-not-allowed disabled:opacity-50"
      >
        <ViewModeIcon mode={viewMode} className="h-4 w-4" />
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-label={messages.common.changeViewMode || 'Cambia modalita visualizzazione'}
          className="absolute right-0 z-50 mt-1 min-w-[180px] origin-top-right rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] p-1 shadow-[var(--shadow-soft)]"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => handleSelect('chronological')}
            aria-label={messages.viewModes.chronological}
            className={`w-full flex items-center gap-2 rounded-lg px-3 py-2 text-[13px] font-medium transition hover:bg-[color:var(--surface-muted)] ${
              viewMode === 'chronological' ? 'bg-[color:var(--surface-muted)]' : ''
            }`}
          >
            <ViewModeIcon mode="chronological" className="h-4 w-4" />
            <span className="text-primary">{messages.viewModes.chronological}</span>
          </button>

          <button
            type="button"
            role="menuitem"
            onClick={() => handleSelect('by-feed')}
            aria-label={messages.viewModes.byFeed}
            className={`w-full flex items-center gap-2 rounded-lg px-3 py-2 text-[13px] font-medium transition hover:bg-[color:var(--surface-muted)] ${
              viewMode === 'by-feed' ? 'bg-[color:var(--surface-muted)]' : ''
            }`}
          >
            <ViewModeIcon mode="by-feed" className="h-4 w-4" />
            <span className="text-primary">{messages.viewModes.byFeed}</span>
          </button>

          <button
            type="button"
            role="menuitem"
            onClick={() => handleSelect('by-category')}
            aria-label={messages.viewModes.byCategory}
            className={`w-full flex items-center gap-2 rounded-lg px-3 py-2 text-[13px] font-medium transition hover:bg-[color:var(--surface-muted)] ${
              viewMode === 'by-category' ? 'bg-[color:var(--surface-muted)]' : ''
            }`}
          >
            <ViewModeIcon mode="by-category" className="h-4 w-4" />
            <span className="text-primary">{messages.viewModes.byCategory}</span>
          </button>
        </div>
      )}
    </div>
  );
};
