import { useCallback, useEffect, useId, useRef, useState } from 'react';
import type { NewsDetailModalProps } from '../types/component-props';
import { useI18n } from '../i18n/useI18n';

export const NewsDetailModal = ({ newsItem, isOpen, onClose, isSaved, onToggleSave }: NewsDetailModalProps) => {
  const { messages, locale, formatMessage } = useI18n();
  const titleId = useId();
  const descriptionId = useId();
  const dragStartYRef = useRef<number | null>(null);
  const [sheetOffsetY, setSheetOffsetY] = useState(0);
  const closeThreshold = 80;

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      return new Intl.DateTimeFormat(locale, {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(dateString));
    } catch {
      return '';
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleDragStart = (event: React.TouchEvent<HTMLDivElement>) => {
    dragStartYRef.current = event.touches[0]?.clientY ?? null;
    setSheetOffsetY(0);
  };

  const handleDragMove = (event: React.TouchEvent<HTMLDivElement>) => {
    if (dragStartYRef.current === null) {
      return;
    }

    const currentY = event.touches[0]?.clientY ?? dragStartYRef.current;
    const deltaY = Math.max(0, currentY - dragStartYRef.current);
    setSheetOffsetY(deltaY);
    if (deltaY > 0) {
      event.preventDefault();
    }
  };

  const resetDragState = useCallback(() => {
    dragStartYRef.current = null;
    setSheetOffsetY(0);
  }, []);

  const handleDragEnd = () => {
    if (dragStartYRef.current !== null && sheetOffsetY >= closeThreshold) {
      resetDragState();
      onClose();
      return;
    }

    resetDragState();
  };

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) {
      resetDragState();
    }
  }, [isOpen, resetDragState]);

  if (!isOpen || !newsItem) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-[2px] sm:items-center sm:p-4"
      onClick={handleBackdropClick}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="ios-sheet-enter flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-3xl border border-[color:var(--border)] bg-[color:var(--surface)] shadow-[0_-4px_40px_rgba(0,0,0,0.18)] transition-transform duration-200 ease-out sm:max-w-4xl sm:rounded-2xl"
        style={{ transform: `translateY(${sheetOffsetY}px)` }}
      >
        {/* Drag indicator (mobile) */}
        <div
          className="flex justify-center pt-3 pb-1 sm:hidden touch-none"
          onTouchStart={handleDragStart}
          onTouchMove={handleDragMove}
          onTouchEnd={handleDragEnd}
          onTouchCancel={handleDragEnd}
          aria-label={messages.common.close}
        >
          <div className="h-[5px] w-10 rounded-full bg-[color:var(--border)]" />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-[color:var(--border)] px-4 py-3 sm:items-center sm:px-6 sm:py-4">
          <h2 id={titleId} className="line-clamp-3 text-[17px] font-semibold text-primary sm:text-xl">
            {newsItem.title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={messages.common.close}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[color:var(--surface-muted)] text-[13px] font-semibold text-secondary transition-opacity active:opacity-50"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
          <div id={descriptionId} className="mb-4 flex flex-wrap items-center gap-2 text-[12px]">
            <span className="rounded-full bg-[color:var(--brand)] px-2.5 py-0.5 font-semibold uppercase tracking-wide text-white">
              {newsItem.feedTitle}
            </span>
            <span className="rounded-full border border-[color:var(--border)] bg-[color:var(--surface-muted)] px-2.5 py-0.5 font-medium text-secondary">
              {formatDate(newsItem.isoDate || newsItem.pubDate)}
            </span>
            {newsItem.creator && (
              <span className="rounded-full border border-[color:var(--border)] bg-[color:var(--surface-muted)] px-2.5 py-0.5 font-medium text-secondary">
                {formatMessage(messages.article.authorBy, { author: newsItem.creator })}
              </span>
            )}
          </div>

          {newsItem.content ? (
            <div
              className="prose prose-sm max-w-none leading-relaxed text-primary prose-headings:text-primary prose-a:text-[color:var(--brand)] prose-strong:text-primary"
              dangerouslySetInnerHTML={{ __html: newsItem.content }}
            />
          ) : newsItem.contentSnippet ? (
            <div
              className="prose prose-sm max-w-none leading-relaxed text-secondary prose-headings:text-primary prose-a:text-[color:var(--brand)]"
              dangerouslySetInnerHTML={{ __html: newsItem.contentSnippet }}
            />
          ) : newsItem.summary ? (
            <div
              className="prose prose-sm max-w-none leading-relaxed text-secondary prose-headings:text-primary prose-a:text-[color:var(--brand)]"
              dangerouslySetInnerHTML={{ __html: newsItem.summary }}
            />
          ) : (
            <p className="text-muted italic">{messages.article.noContent}</p>
          )}
        </div>

        {/* Footer actions */}
        <div className="border-t border-[color:var(--border)] px-4 py-3 sm:px-6" style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 12px)' }}>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => onToggleSave(newsItem)}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[color:var(--surface-muted)] py-3 text-[15px] font-medium text-primary transition-opacity active:opacity-60"
            >
              <span>{isSaved ? '★' : '☆'}</span>
              <span>{isSaved ? messages.article.saved : messages.article.save}</span>
            </button>
            {newsItem.link && (
              <a
                href={newsItem.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-3 text-[15px] font-semibold text-white transition-opacity active:opacity-70"
                style={{ background: 'var(--brand)' }}
              >
                {messages.article.readFullArticle}
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
