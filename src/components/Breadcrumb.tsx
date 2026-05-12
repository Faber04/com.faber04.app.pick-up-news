import type { BreadcrumbProps } from '../types/component-props';
import { Button } from './ui';

export const Breadcrumb = ({ trail, onNavigate }: BreadcrumbProps) => {
  if (trail.length <= 1) {
    return null; // no breadcrumb at root level
  }

  return (
    <div className="sticky top-20 z-40 border-b border-[color:var(--border)] bg-[color:var(--surface)]/95 backdrop-blur">
      <div className="app-container flex h-auto items-center gap-1 overflow-x-auto py-2">
        {trail.map((node, index) => (
          <div key={node.id} className="flex items-center gap-1 min-w-fit">
            <Button
              type="button"
              onClick={() => onNavigate.goToIndex(index)}
              variant={index === trail.length - 1 ? 'secondary' : 'ghost'}
              size="sm"
              disabled={index === trail.length - 1}
              className={`h-8 rounded-lg px-2.5 ${
                index === trail.length - 1
                  ? 'cursor-default'
                  : ''
              }`}
            >
              {node.label}
            </Button>

            {index < trail.length - 1 && (
              <span className="text-muted text-xs">/</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
