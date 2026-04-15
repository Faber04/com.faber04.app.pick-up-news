import { ViewMode } from '../types';

interface ViewControlsProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export const ViewControls = ({ viewMode, onViewModeChange }: ViewControlsProps) => {
  return (
    <div className="flex justify-end mb-6">
      <div className="flex bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => onViewModeChange('chronological')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            viewMode === 'chronological'
              ? 'bg-white text-gray-800 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Cronologico
        </button>
        <button
          onClick={() => onViewModeChange('by-feed')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            viewMode === 'by-feed'
              ? 'bg-white text-gray-800 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Per Sito
        </button>
      </div>
    </div>
  );
};