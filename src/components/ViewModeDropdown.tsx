import { useState, useRef, useEffect } from 'react';
import type { ViewMode } from '../types';
import { useI18n } from '../i18n/useI18n';

export interface ViewModeDropdownProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

const viewModeIcons: Record<ViewMode, string> = {
  chronological: '\u23F1', // orologio
  'by-feed': '\u1F4CD', // computer/documento
  'by-category': '\u1F4C1', // cartella
};

const viewModeLabels: Record<ViewMode, string> = {
  chronological: 'Cronologico',
  'by-feed': 'Per Sito',
  'by-category': 'Per Categoria',
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

  const currentLabel = messages.viewModes[viewMode as keyof typeof messages.viewModes] || viewModeLabels[viewMode];

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={handleToggle}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label={messages.common.changeViewMode || 'Cambia modalità visualizzazione'}
        title={currentLabel}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[color:color-mix(in_srgb,var(--brand)_18%,var(--border)_82%)] bg-[color:color-mix(in_srgb,var(--brand)_8%,var(--surface)_92%)] text-[color:var(--brand-strong)] shadow-none transition hover:bg-[color:color-mix(in_srgb,var(--brand)_12%,var(--surface)_88%)] disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className="text-[16px]" aria-hidden="true">
          {viewModeIcons[viewMode] || '\u2630'}
        </span>
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-label={messages.common.changeViewMode || 'Cambia modalità visualizzazione'}
          className="absolute right-0 z-50 mt-1 min-w-[160px] origin-top-right rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] p-1 shadow-[var(--shadow-soft)]"
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
            <span aria-hidden="true">\u23F1</span>
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
            <span aria-hidden="true">\u1F4CD</span>
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
            <span aria-hidden="true">\u1F4C1</span>
            <span className="text-primary">{messages.viewModes.byCategory}</span>
          </button>
        </div>
      )}
    </div>
  );
};
