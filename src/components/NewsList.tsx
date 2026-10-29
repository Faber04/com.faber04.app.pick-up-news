import { useState } from 'react';
import type { NewsCardProps, NewsListProps } from '../types/component-props';
import type { NewsItem, RSSFeed } from '../types';
import { useI18n } from '../i18n/useI18n';
import { formatMessage } from '../i18n';
import { Button } from './ui';
import { ViewControls } from './ViewControls';

const groupNewsByCategory = (news: NewsItem[], feeds: RSSFeed[], uncategorizedLabel: string) => {
  const feedCategoryById = new Map(
    feeds.map((feed) => [feed.id, feed.category?.trim() || uncategorizedLabel])
  );

  const groups = new Map<string, NewsItem[]>();
  news.forEach((item) => {
    const category = feedCategoryById.get(item.feedId) ?? uncategorizedLabel;
    const group = groups.get(category);
    if (group) {
      group.push(item);
    } else {
      groups.set(category, [item]);
    }
  });

  return Array.from(groups.entries()).map(([category, items]) => ({ category, items }));
};

const groupNewsByFeed = (news: NewsItem[]) => {
  const groups = new Map<string, NewsItem[]>();
  news.forEach((item) => {
    const group = groups.get(item.feedId);
    if (group) {
      group.push(item);
    } else {
      groups.set(item.feedId, [item]);
    }
  });
  return Array.from(groups.entries());
};

export const NewsList = ({
  news,
  loading,
  onNewsClick,
  onToggleSave,
  isNewsSaved,
  isLatestNews,
  activeFeedId,
  onFeedFilterChange,
  searchQuery = '',
  onSearchChange,
  onRefresh,
  viewMode,
  setViewMode,
  feeds,
}: NewsListProps & { setViewMode?: (mode: import('../types').ViewMode) => void }) => {
  const { messages, locale } = useI18n();
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [expandedFeeds, setExpandedFeeds] = useState<Set<string>>(new Set());

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

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  const toggleFeed = (feedId: string) => {
    setExpandedFeeds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(feedId)) {
        newSet.delete(feedId);
      } else {
        newSet.add(feedId);
      }
      return newSet;
    });
  };

  const getFeedTitle = (feedId: string) => {
    return feeds?.find((f) => f.id === feedId)?.title ?? feedId;
  };

  const renderByCategory = () => (
    <div className="space-y-2">
      {groupNewsByCategory(news, feeds || [], messages.feeds?.uncategorizedCategory ?? 'Uncategorized').map((group) => {
        const isExpanded = expandedCategories.has(group.category);
        return (
          <div key={group.category ?? 'uncategorized'} className="mb-2">
            <button
              type="button"
              onClick={() => toggleCategory(group.category ?? 'uncategorized')}
              className="w-full flex items-center justify-between px-1 py-2 rounded-lg hover:bg-[color:var(--surface-muted)] transition"
              aria-expanded={isExpanded}
              aria-controls={`category-${group.category}`}
            >
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
                  {group.category ?? 'Uncategorized'}
                </h3>
                <span className="rounded-full bg-[color:var(--surface-muted)] px-2 py-0.5 text-[11px] font-medium text-secondary">
                  {group.items.length}
                </span>
              </div>
              <span className="text-sm text-[color:var(--text-muted)]" aria-hidden="true">
                {isExpanded ? '−' : '+'}
              </span>
            </button>
            {isExpanded && (
              <div id={`category-${group.category}`} className="ios-list-group mt-1">
                {group.items.map((item) => (
                  <NewsCard
                    key={`${item.feedId}-${item.guid || item.link || item.title}`}
                    newsItem={item}
                    onClick={onNewsClick}
                    onToggleSave={onToggleSave}
                    isSaved={isNewsSaved(item)}
                    isLatestLoaded={isLatestNews?.(item) ?? false}
                    locale={locale}
                    onFeedFilterChange={onFeedFilterChange}
                    isLast={false}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  const renderByFeed = () => (
    <div className="space-y-2">
      {groupNewsByFeed(news).map(([feedId, items]) => {
        const isExpanded = expandedFeeds.has(feedId);
        const feedTitle = getFeedTitle(feedId);
        return (
          <div key={feedId} className="mb-2">
            <button
              type="button"
              onClick={() => toggleFeed(feedId)}
              className="w-full flex items-center justify-between px-1 py-2 rounded-lg hover:bg-[color:var(--surface-muted)] transition"
              aria-expanded={isExpanded}
              aria-controls={`feed-${feedId}`}
            >
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
                  {feedTitle}
                </h3>
                <span className="rounded-full bg-[color:var(--surface-muted)] px-2 py-0.5 text-[11px] font-medium text-secondary">
                  {items.length}
                </span>
              </div>
              <span className="text-sm text-[color:var(--text-muted)]" aria-hidden="true">
                {isExpanded ? '−' : '+'}
              </span>
            </button>
            {isExpanded && (
              <div id={`feed-${feedId}`} className="ios-list-group mt-1">
                {items.map((item, index) => (
                  <NewsCard
                    key={`${item.feedId}-${index}`}
                    newsItem={item}
                    onClick={onNewsClick}
                    onToggleSave={onToggleSave}
                    isSaved={isNewsSaved(item)}
                    isLatestLoaded={isLatestNews?.(item) ?? false}
                    locale={locale}
                    onFeedFilterChange={onFeedFilterChange}
                    isLast={index === items.length - 1}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  const renderNormal = () => (
    <div className="ios-list-group">
      {news.map((item, index) => (
        <NewsCard
          key={`${item.feedId}-${index}`}
          newsItem={item}
          onClick={onNewsClick}
          onToggleSave={onToggleSave}
          isSaved={isNewsSaved(item)}
          isLatestLoaded={isLatestNews?.(item) ?? false}
          locale={locale}
          onFeedFilterChange={onFeedFilterChange}
          isLast={index === news.length - 1}
        />
      ))}
    </div>
  );

  const renderContent = () => {
    if (news.length === 0) return noNewsContent;
    
    const safeViewMode = viewMode ?? 'chronological';
    
    switch (safeViewMode) {
      case 'by-category':
        return renderByCategory();
      case 'by-feed':
        return renderByFeed();
      default:
        return renderNormal();
    }
  };

  return (
    <div className="space-y-4">
      {/* iOS search bar + refresh */}
      {onSearchChange && (
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
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
              className="w-full rounded-[10px] border-0 bg-[color:var(--surface-muted)] py-2 pl-8 pr-9 text-base text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-[color:var(--ring)]"
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
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={loading}
              aria-label={loading ? messages.home.refreshing : messages.home.refresh}
              title={loading ? messages.home.refreshing : messages.home.refresh}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[color:color-mix(in_srgb,var(--brand)_18%,var(--border)_82%)] bg-[color:color-mix(in_srgb,var(--brand)_8%,var(--surface)_92%)] text-[color:var(--brand-strong)] shadow-none transition hover:bg-[color:color-mix(in_srgb,var(--brand)_12%,var(--surface)_88%)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12a7.5 7.5 0 0 1 12.75-5.34L19 9.41M19.5 12a7.5 7.5 0 0 1-12.75 5.34L5 14.59" />
              </svg>
            </button>
          )}
        </div>
      )}

      {/* View Controls - moved below search */}
      {setViewMode && viewMode && <ViewControls viewMode={viewMode} onViewModeChange={setViewMode} />}

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
      {renderContent()}
    </div>
  );
};

const NewsCard = ({
  newsItem,
  onClick,
  onToggleSave,
  isSaved,
  isLatestLoaded,
  locale,
  onFeedFilterChange,
  isLast,
}: NewsCardProps & { isLatestLoaded: boolean; onFeedFilterChange?: (feedId?: string) => void; isLast: boolean }) => {
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
        className={`ios-list-row group w-full cursor-pointer px-4 py-3.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring)] focus-visible:ring-inset ${
          isLatestLoaded
            ? 'border-l-2 border-[color:var(--brand)] bg-[color:color-mix(in_srgb,var(--brand)_10%,var(--surface)_90%)]'
            : ''
        }`}
        aria-label={newsItem.title || newsItem.feedTitle}
      >
        <div className="flex w-full min-w-0 items-stretch gap-3">
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
              {isLatestLoaded && (
                <span className="rounded-full border border-[color:color-mix(in_srgb,var(--brand)_40%,var(--border)_60%)] bg-[color:color-mix(in_srgb,var(--brand)_14%,var(--surface)_86%)] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[color:var(--brand-strong)]">
                  {messages.notifications.newBadge}
                </span>
              )}
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
