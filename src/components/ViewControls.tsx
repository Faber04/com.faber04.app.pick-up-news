import { ViewMode } from '../types';

interface ViewControlsProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export const ViewControls = ({ viewMode, onViewModeChange }: ViewControlsProps) => {
  return (
    <div className="flex justify-end mb-6">
      <div className="flex surface-muted rounded-lg p-1">
        <button
          onClick={() => onViewModeChange('chronological')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors border ${
            viewMode === 'chronological'
              ? 'surface-strong text-primary border-[color:var(--border)] shadow-sm'
              : 'text-secondary border-transparent hover:text-primary'
          }`}
        >
          Cronologico
        </button>
        <button
          onClick={() => onViewModeChange('by-feed')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors border ${
            viewMode === 'by-feed'
              ? 'surface-strong text-primary border-[color:var(--border)] shadow-sm'
              : 'text-secondary border-transparent hover:text-primary'
          }`}
        >
          Per Sito
        </button>
      </div>
    </div>
  );
};