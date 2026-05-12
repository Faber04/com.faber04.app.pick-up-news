import { useEffect, useId } from 'react';
import type { NewsDetailModalProps } from '../types/component-props';
import { useI18n } from '../i18n/useI18n';
import { Badge, Button, Card } from './ui';

export const NewsDetailModal = ({ newsItem, isOpen, onClose, isSaved, onToggleSave }: NewsDetailModalProps) => {
  const { messages, locale, formatMessage } = useI18n();
  const titleId = useId();
  const descriptionId = useId();

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      return new Intl.DateTimeFormat(locale, {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }).format(new Date(dateString));
    } catch {
      return '';
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen || !newsItem) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-3 backdrop-blur-[1px] sm:p-4"
      onClick={handleBackdropClick}
    >
      <Card
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden bg-[color:var(--surface-strong)] shadow-[var(--shadow-float)]"
      >
        <div className="flex items-start justify-between gap-4 border-b border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-4 sm:items-center sm:px-6 sm:py-5">
          <h2 id={titleId} className="line-clamp-3 text-xl font-bold text-primary sm:text-2xl">
            {newsItem.title}
          </h2>
          <Button
            type="button"
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-xl leading-none"
            aria-label={messages.common.close}
          >
            ✕
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6">
          <div id={descriptionId} className="mb-5 flex flex-wrap items-center gap-2.5 text-sm text-secondary sm:gap-3">
            <Badge variant="brand" className="rounded-full px-3 py-1 text-[11px] uppercase tracking-wide">
              {newsItem.feedTitle}
            </Badge>
            <span className="rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-1 text-[11px] font-medium tracking-wide text-secondary">
              {formatDate(newsItem.isoDate || newsItem.pubDate)}
            </span>
            {newsItem.creator && (
              <span className="min-w-0 rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-1 text-[11px] font-medium tracking-wide text-secondary">
                {formatMessage(messages.article.authorBy, { author: newsItem.creator })}
              </span>
            )}
          </div>

          {newsItem.content ? (
            <div
              className="prose prose-sm max-w-none leading-relaxed text-primary prose-headings:text-primary prose-a:text-[color:var(--brand-strong)] prose-strong:text-primary"
              dangerouslySetInnerHTML={{ __html: newsItem.content }}
            />
          ) : newsItem.contentSnippet ? (
            <div
              className="prose prose-sm max-w-none leading-relaxed text-secondary prose-headings:text-primary prose-a:text-[color:var(--brand-strong)]"
              dangerouslySetInnerHTML={{ __html: newsItem.contentSnippet }}
            />
          ) : newsItem.summary ? (
            <div
              className="prose prose-sm max-w-none leading-relaxed text-secondary prose-headings:text-primary prose-a:text-[color:var(--brand-strong)]"
              dangerouslySetInnerHTML={{ __html: newsItem.summary }}
            />
          ) : (
            <p className="text-muted italic">{messages.article.noContent}</p>
          )}
        </div>

        <div className="border-t border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-4 sm:px-6">
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              variant={isSaved ? 'secondary' : 'ghost'}
              onClick={() => onToggleSave(newsItem)}
              className="w-full sm:w-auto"
            >
              {isSaved ? `★ ${messages.article.saved}` : `☆ ${messages.article.save}`}
            </Button>
            {newsItem.link && (
              <Button asChild variant="brand" className="w-full justify-center sm:w-auto">
                <a
                  href={newsItem.link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {messages.article.readFullArticle}
                </a>
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};
