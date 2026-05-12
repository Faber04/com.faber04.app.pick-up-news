import type { NewsCardProps, NewsListProps } from '../types/component-props';
import { useI18n } from '../i18n/useI18n';
import { Badge, Button, Card, CardContent } from './ui';

export const NewsList = ({
  news,
  loading,
  onNewsClick,
  onToggleSave,
  isNewsSaved,
  activeFeedId,
  onFeedFilterChange,
}: NewsListProps) => {
  const { messages, locale } = useI18n();
  const selectedFeedTitle = activeFeedId
    ? news.find((item) => item.feedId === activeFeedId)?.feedTitle ?? ''
    : '';

  if (loading) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center gap-3 py-10 text-center" aria-live="polite">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-b-2 border-[color:var(--brand)]" />
          <p className="text-sm font-medium text-secondary">{messages.home.loadingNews}</p>
        </CardContent>
      </Card>
    );
  }

  if (news.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted">
          <p className="text-base font-semibold text-primary">{messages.home.noNewsTitle}</p>
          <p className="mt-2 text-sm">{messages.home.noNewsDescription}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {activeFeedId && onFeedFilterChange && (
        <div className="flex items-center gap-2">
          {selectedFeedTitle && (
            <Badge className="rounded-full border border-[color:var(--border)] px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[color:var(--brand-strong)]">
              {selectedFeedTitle}
            </Badge>
          )}
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-8 rounded-xl px-2.5 text-xs font-medium"
            onClick={() => onFeedFilterChange(undefined)}
          >
            {messages.common.clear}
          </Button>
        </div>
      )}
      <div className="space-y-3 sm:space-y-4">
        {news.map((item, index) => (
          <NewsCard
            key={`${item.feedId}-${index}`}
            newsItem={item}
            onClick={onNewsClick}
            onToggleSave={onToggleSave}
            isSaved={isNewsSaved(item)}
            locale={locale}
            onFeedFilterChange={onFeedFilterChange}
            activeFeedId={activeFeedId}
          />
        ))}
      </div>
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
  activeFeedId,
}: NewsCardProps & { onFeedFilterChange?: (feedId?: string) => void; activeFeedId?: string }) => {
  const { messages } = useI18n();

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString(locale, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '';
    }
  };

  return (
    <Card className="overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)]">
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
        className="w-full cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
        aria-label={newsItem.title || newsItem.feedTitle}
      >
        <CardContent className="p-4 sm:p-5">
          <div className="mb-2 flex items-center justify-between gap-2 sm:mb-2.5">
            {onFeedFilterChange ? (
              <Button
                type="button"
                size="sm"
                variant={activeFeedId === newsItem.feedId ? 'brand' : 'secondary'}
                className={`h-7 rounded-lg px-2 text-[11px] font-semibold uppercase tracking-wide ${
                  activeFeedId === newsItem.feedId ? '' : 'text-[color:var(--brand-strong)]'
                }`}
                onClick={(event) => {
                  event.stopPropagation();
                  onFeedFilterChange(newsItem.feedId);
                }}
              >
                {newsItem.feedTitle}
              </Button>
            ) : (
              <Badge className="rounded-full border border-[color:var(--border)] px-2.5 py-0.5 text-[11px] uppercase tracking-wide text-secondary">
                {newsItem.feedTitle}
              </Badge>
            )}
            <div className="flex items-center gap-1.5">
              <span className="whitespace-nowrap text-xs text-muted">
                {formatDate(newsItem.isoDate || newsItem.pubDate)}
              </span>
              <Button
                type="button"
                variant={isSaved ? 'brand' : 'ghost'}
                size="sm"
                className="h-7 rounded-lg px-2 text-xs"
                onClick={(event) => {
                  event.stopPropagation();
                  onToggleSave(newsItem);
                }}
                aria-label={isSaved ? messages.article.removeSaved : messages.article.save}
                title={isSaved ? messages.article.removeSaved : messages.article.save}
              >
                {isSaved ? '★' : '☆'}
              </Button>
            </div>
          </div>

          <h4 className="line-clamp-2 text-[1.02rem] font-semibold leading-snug text-primary">
            {newsItem.title}
          </h4>

          <div
            className="mt-2 line-clamp-3 text-sm leading-relaxed text-secondary"
            dangerouslySetInnerHTML={{ __html: newsItem.truncatedDescription }}
          />

          <div className="mt-3 flex justify-end">
            <span className="text-xs font-medium text-[color:var(--brand-strong)]">→</span>
          </div>
        </CardContent>
      </div>
    </Card>
  );
};
