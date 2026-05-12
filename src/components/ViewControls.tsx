import type { ViewControlsProps } from '../types/component-props';
import { useI18n } from '../i18n/useI18n';
import { Button } from './ui';

export const ViewControls = ({ viewMode, onViewModeChange }: ViewControlsProps) => {
  const { messages } = useI18n();

  return (
    <div className="mb-6 hidden justify-end min-[1025px]:flex">
      <div
        className="flex rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-muted)] p-1 shadow-[var(--shadow-soft)]"
        role="group"
        aria-label={messages.common.navigation}
      >
        <Button
          type="button"
          onClick={() => onViewModeChange('chronological')}
          variant={viewMode === 'chronological' ? 'outline' : 'ghost'}
          size="sm"
          className={viewMode === 'chronological' ? 'shadow-sm' : ''}
        >
          {messages.viewModes.chronological}
        </Button>
        <Button
          type="button"
          onClick={() => onViewModeChange('by-feed')}
          variant={viewMode === 'by-feed' ? 'outline' : 'ghost'}
          size="sm"
          className={viewMode === 'by-feed' ? 'shadow-sm' : ''}
        >
          {messages.viewModes.byFeed}
        </Button>
      </div>
    </div>
  );
};
