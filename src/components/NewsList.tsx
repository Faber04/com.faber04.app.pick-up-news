import type { NewsCardProps, NewsListProps } from '../types/component-props';
import { useI18n } from '../i18n/useI18n';
import { formatMessage } from '../i18n';
import { Button } from './ui';

export const NewsList = ({
  news,
  loading,
  onNewsClick,
  onToggleSave,
  isNewsSaved,
  activeFeedId,
  onFeedFilterChange,
  searchQuery = '',
  onSearchChange,
}: NewsListProps) => {
  const { messages, locale } = useI18n();
  const selectedFeedTitle = activeFeedId
    ? news.find((item) => item.feedId === activeFeedId)?.feedTitle ?? ''
    : '';

  if (loading) {
    return (
      <div className="ios-list-group">
        <div className="flex flex-col items-center justify-center gap-3 py-10 text-center" aria-live="polite">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-b-2 border-[color:var(--brand)]" />
          <p className="text-sm font-medium text-secondary">{messages.home.loadingNews}</p>
        </div>
      </div>
    );
  }

  const hasSearch = searchQuery.trim().length > 0;

  const noNewsContent = (
    <div className="ios-list-group py-10 text-center text-muted">
      <p className="text-base font-semibold text-primary">
        {hasSearch
          ? formatMessage(messages.home.searchNoResults, { query: searchQuery.trim() })
          : messages.home.noNewsTitle}
      </p>
      <p className="mt-2 text-sm">
        {hasSearch ? messages.home.searchNoResultsHint : messages.home.noNewsDescription}
      </p>
      {hasSearch && onSearchChange && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="mt-4 rounded-xl"
          onClick={() => onSearchChange('')}
        >
          {messages.home.clearSearch}
        </Button>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* iOS search bar */}
      {onSearchChange && (
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 select-none text-muted">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
          </span>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={messages.home.searchPlaceholder}
            aria-label={messages.home.searchPlaceholder}
            className="w-full rounded-[10px] border-0 bg-[color:var(--surface-muted)] py-2 pl-8 pr-9 text-[15px] text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-[color:var(--ring)]"
          />
          {hasSearch && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              aria-label={messages.home.clearSearch}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full bg-[color:var(--text-muted)] text-[color:var(--surface)] text-xs"
            >
              ✕
            </button>
          )}
        </div>
      )}

      {/* Active feed badge */}
      {activeFeedId && onFeedFilterChange && selectedFeedTitle && (
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-[color:var(--brand)] px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white">
            {selectedFeedTitle}
          </span>
          <button
            type="button"
            className="text-[13px] font-medium text-[color:var(--brand)] transition-opacity active:opacity-50"
            onClick={() => onFeedFilterChange(undefined)}
          >
            {messages.common.clear}
          </button>
        </div>
      )}

      {/* List */}
      {news.length === 0 ? noNewsContent : (
        <div className="ios-list-group">
          {news.map((item, index) => (
            <NewsCard
              key={`${item.feedId}-${index}`}
              newsItem={item}
              onClick={onNewsClick}
              onToggleSave={onToggleSave}
              isSaved={isNewsSaved(item)}
              locale={locale}
              onFeedFilterChange={onFeedFilterChange}
              isLast={index === news.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const NewsCard = ({
  newsItem,
  onClick,
  onToggleSave,
  isSaved,
  locale,
  onFeedFilterChange,
  isLast,
}: NewsCardProps & { onFeedFilterChange?: (feedId?: string) => void; isLast: boolean }) => {
  const { messages } = useI18n();

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString(locale, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={() => onClick(newsItem)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onClick(newsItem);
          }
        }}
        className="ios-list-row group w-full cursor-pointer px-4 py-3.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring)] focus-visible:ring-inset"
        aria-label={newsItem.title || newsItem.feedTitle}
      >
        <div className="flex items-stretch gap-3">

          {/* Left: all text content */}
          <div className="min-w-0 flex-1">

            {/* Source + date */}
            <div className="mb-1 flex items-center gap-1.5">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onFeedFilterChange?.(newsItem.feedId); }}
                className="text-[11px] font-semibold uppercase tracking-wider transition-opacity active:opacity-50"
                style={{ color: 'var(--brand)' }}
              >
                {newsItem.feedTitle}
              </button>
              <span className="text-[10px] text-muted">·</span>
              <span className="text-[11px] text-muted">
                {formatDate(newsItem.isoDate || newsItem.pubDate)}
              </span>
            </div>

            {/* Headline */}
            <h4 className="line-clamp-2 text-[15px] font-semibold leading-snug text-primary">
              {newsItem.title}
            </h4>

            {/* Excerpt */}
            <div
              className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-secondary"
              dangerouslySetInnerHTML={{ __html: newsItem.truncatedDescription }}
            />
          </div>

          {/* Right: save + chevron stacked */}
          <div className="flex shrink-0 flex-col items-center justify-between py-0.5">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onToggleSave(newsItem); }}
              aria-label={isSaved ? messages.article.removeSaved : messages.article.save}
              className="flex h-7 w-7 items-center justify-center rounded-full text-[16px] leading-none transition-opacity active:opacity-50"
              style={{ color: isSaved ? 'var(--brand)' : 'var(--text-muted)' }}
            >
              {isSaved ? '★' : '☆'}
            </button>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </div>

        </div>
      </div>
      {!isLast && <div className="ios-list-separator ml-4" />}
    </>
  );
};

