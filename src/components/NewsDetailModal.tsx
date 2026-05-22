import { useEffect, useId, useRef, useState } from 'react';
import type { NewsDetailModalProps } from '../types/component-props';
import { useI18n } from '../i18n/useI18n';
import { Button } from './ui';

export const NewsDetailModal = ({
  newsItem,
  isOpen,
  onClose,
  isSaved,
  onToggleSave,
  onCopyLink,
}: NewsDetailModalProps) => {
  const { messages, locale, formatMessage } = useI18n();
  const titleId = useId();
  const descriptionId = useId();
  const shareMenuId = useId();
  const shareDropdownRef = useRef<HTMLDivElement | null>(null);
  const shareUrl = newsItem?.link?.trim() ?? '';
  const shareText = newsItem?.title?.trim() || newsItem?.feedTitle || '';
  const canShare = shareUrl.length > 0;
  const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);

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

  const handleDeviceShare = async () => {
    if (!canShare) return;

    const shareData = {
      title: shareText,
      text: shareText,
      url: shareUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        return;
      }

      window.open(shareUrl, '_blank', 'noopener,noreferrer');
    } catch {
      window.open(shareUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleCopyLink = () => {
    if (!canShare) return;

    // Try modern Clipboard API
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(shareUrl).then(() => {
        onCopyLink();
      }).catch(() => {
        fallbackCopy();
      });
      return;
    }

    // Fallback immediately if no Clipboard API
    fallbackCopy();
  };

  const fallbackCopy = () => {
    const textarea = document.createElement('textarea');
    textarea.value = shareUrl;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    try {
      textarea.select();
      if (document.execCommand('copy')) {
        onCopyLink();
      }
    } finally {
      document.body.removeChild(textarea);
    }
  };

  const facebookShareUrl = canShare
    ? `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
    : '';

  const xShareUrl = canShare
    ? `https://x.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`
    : '';

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsShareMenuOpen(false);
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

  useEffect(() => {
    setIsShareMenuOpen(false);
  }, [newsItem?.link, newsItem?.title]);

  useEffect(() => {
    if (!isShareMenuOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!shareDropdownRef.current?.contains(event.target as Node)) {
        setIsShareMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
    };
  }, [isShareMenuOpen]);

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
        className="ios-sheet-enter flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-3xl border border-[color:var(--border)] bg-[color:var(--surface)] shadow-[0_-4px_40px_rgba(0,0,0,0.18)] sm:max-w-4xl sm:rounded-2xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-[color:var(--border)] px-4 pt-6 pb-3 sm:items-center sm:px-6 sm:py-4">
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
        <div className="border-t border-[color:var(--border)] px-4 py-3 sm:px-6 overflow-visible" style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 12px)' }}>
          <div className="flex gap-2 sm:grid sm:grid-cols-3">
            <button
              type="button"
              onClick={() => onToggleSave(newsItem)}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[color:var(--surface-muted)] py-3 text-[15px] font-medium text-primary transition-opacity active:opacity-60 sm:gap-1.5"
            >
              <span>{isSaved ? '★' : '☆'}</span>
              <span className="hidden sm:inline">{isSaved ? messages.article.saved : messages.article.save}</span>
            </button>
            {newsItem.link && (
              <a
                href={newsItem.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[color:var(--surface-muted)] py-3 text-[15px] font-medium text-primary transition-opacity active:opacity-60 sm:gap-1.5"
              >
                <span>→</span>
                <span className="hidden sm:inline">{messages.article.readFullArticle}</span>
              </a>
            )}
            <div ref={shareDropdownRef} className="relative flex-1">
              <Button
              type="button"
              onClick={() => setIsShareMenuOpen((prev) => !prev)}
              disabled={!canShare}
              variant="secondary"
              size="lg"
              className="w-full border-[color:color-mix(in_srgb,var(--brand)_20%,var(--border)_80%)] bg-[color:color-mix(in_srgb,var(--brand)_10%,var(--surface)_90%)] text-[color:var(--brand-strong)] hover:bg-[color:color-mix(in_srgb,var(--brand)_14%,var(--surface)_86%)] sm:gap-1.5"
              aria-expanded={isShareMenuOpen}
              aria-haspopup="menu"
              aria-controls={shareMenuId}
              >
              <span className="hidden sm:inline">{messages.article.share}</span>
              <span aria-hidden="true" className="text-lg leading-none sm:block">⤴</span>
              </Button>
              {canShare && isShareMenuOpen && (
              <div
                id={shareMenuId}
                role="menu"
                className="absolute bottom-full right-0 mb-3 w-screen sm:w-full rounded-2xl overflow-hidden shadow-lg max-w-xs sm:max-w-none"
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.05)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(0, 0, 0, 0.1)',
                  marginLeft: 'calc((100vw - 100%) / -2)',
                }}
              >
                {/* Primary actions */}
                <div className="divide-y divide-[rgba(0,0,0,0.08)]">
                  <Button
                    type="button"
                    role="menuitem"
                    variant="ghost"
                    className="w-full rounded-none py-4 text-[15px] font-medium text-[color:var(--brand)]"
                    onClick={() => {
                      void handleDeviceShare();
                      setIsShareMenuOpen(false);
                    }}
                  >
                    {messages.article.shareDevice}
                  </Button>
                  <Button
                    type="button"
                    role="menuitem"
                    variant="ghost"
                    className="w-full rounded-none py-4 text-[15px] font-medium text-[color:var(--brand)]"
                    onClick={() => {
                      void handleCopyLink();
                      setIsShareMenuOpen(false);
                    }}
                  >
                    {messages.article.shareCopyLink}
                  </Button>
                </div>

                {/* Social divider */}
                <div className="h-2 bg-[rgba(0,0,0,0.04)]" />

                {/* Social actions */}
                <div className="divide-y divide-[rgba(0,0,0,0.08)]">
                  <Button asChild variant="ghost" className="w-full rounded-none py-4 text-[15px] font-medium text-[color:var(--text-primary)]">
                    <a href={facebookShareUrl} target="_blank" rel="noopener noreferrer" role="menuitem" onClick={() => setIsShareMenuOpen(false)}>
                      {messages.article.shareFacebook}
                    </a>
                  </Button>
                  <Button asChild variant="ghost" className="w-full rounded-none py-4 text-[15px] font-medium text-[color:var(--text-primary)]">
                    <a href={xShareUrl} target="_blank" rel="noopener noreferrer" role="menuitem" onClick={() => setIsShareMenuOpen(false)}>
                      {messages.article.shareX}
                    </a>
                  </Button>
                </div>
              </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
