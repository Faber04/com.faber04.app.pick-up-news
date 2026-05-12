import { useEffect, useMemo, useState } from 'react';
import { NewsItem } from '../types';
import type { NewsCardProps, NewsListProps } from '../types/component-props';
import { useI18n } from '../i18n/useI18n';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, Badge, Button, Card, CardContent } from './ui';

const ACCORDION_STORAGE_KEY = 'pickUpNews_byFeed_openAccordions';

export const NewsList = ({ news, viewMode, feedOrder, loading, onNewsClick }: NewsListProps) => {
  const { messages, locale, formatMessage } = useI18n();
  const [openFeedIds, setOpenFeedIds] = useState<Set<string>>(() => {
    try {
      const rawValue = localStorage.getItem(ACCORDION_STORAGE_KEY);
      if (!rawValue) {
        return new Set<string>();
      }

      const parsed = JSON.parse(rawValue);
      if (!Array.isArray(parsed)) {
        return new Set<string>();
      }

      return new Set<string>(parsed.filter((value) => typeof value === 'string'));
    } catch {
      return new Set<string>();
    }
  });

  const groupedNews = useMemo(() => {
    if (viewMode !== 'by-feed') {
      return null;
    }

    return news.reduce((acc, item) => {
      if (!acc[item.feedId]) {
        acc[item.feedId] = {
          feedTitle: item.feedTitle,
          items: []
        };
      }

      acc[item.feedId].items.push(item);
      return acc;
    }, {} as Record<string, { feedTitle: string; items: NewsItem[] }>);
  }, [news, viewMode]);

  const orderedGroups = useMemo(() => {
    if (!groupedNews) {
      return [] as [string, { feedTitle: string; items: NewsItem[] }][];
    }

    return Object.entries(groupedNews).sort(([feedIdA], [feedIdB]) => {
      const indexA = feedOrder.indexOf(feedIdA);
      const indexB = feedOrder.indexOf(feedIdB);
      const safeIndexA = indexA === -1 ? Number.MAX_SAFE_INTEGER : indexA;
      const safeIndexB = indexB === -1 ? Number.MAX_SAFE_INTEGER : indexB;
      return safeIndexA - safeIndexB;
    });
  }, [feedOrder, groupedNews]);

  useEffect(() => {
    try {
      localStorage.setItem(ACCORDION_STORAGE_KEY, JSON.stringify(Array.from(openFeedIds)));
    } catch {
      // Ignore persistence errors to avoid impacting rendering.
    }
  }, [openFeedIds]);

  useEffect(() => {
    if (orderedGroups.length === 0) {
      return;
    }

    const validFeedIds = new Set(orderedGroups.map(([feedId]) => feedId));

    setOpenFeedIds((prev) => {
      const filtered = new Set(Array.from(prev).filter((feedId) => validFeedIds.has(feedId)));

      if (filtered.size === prev.size) {
        return prev;
      }

      return filtered;
    });
  }, [orderedGroups]);

  const handleExpandAll = () => {
    setOpenFeedIds(new Set(orderedGroups.map(([feedId]) => feedId)));
  };

  const handleCollapseAll = () => {
    setOpenFeedIds(new Set<string>());
  };

  const openCount = orderedGroups.reduce((count, [feedId]) => {
    return openFeedIds.has(feedId) ? count + 1 : count;
  }, 0);
  const totalCount = orderedGroups.length;

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
      {viewMode === 'chronological' ? (
        <div className="space-y-3 sm:space-y-4">
          {news.map((item, index) => (
            <NewsCard key={`${item.feedId}-${index}`} newsItem={item} onClick={onNewsClick} locale={locale} />
          ))}
        </div>
      ) : (
        <div className="space-y-3.5">
          <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-2">
            <Button
              type="button"
              onClick={handleExpandAll}
              variant="outline"
              size="sm"
            >
              {messages.home.expandAll}
            </Button>
            <Button
              type="button"
              onClick={handleCollapseAll}
              variant="outline"
              size="sm"
            >
              {messages.home.collapseAll}
            </Button>
            <span className="ml-auto text-xs font-medium text-muted">
              {formatMessage(messages.home.openCount, { openCount, totalCount })}
            </span>
          </div>

          <Accordion
            type="multiple"
            value={Array.from(openFeedIds)}
            onValueChange={(values) => setOpenFeedIds(new Set(values))}
            className="space-y-3"
          >
            {orderedGroups.map(([feedId, group]) => (
              <AccordionItem key={feedId} value={feedId}>
                <AccordionTrigger>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-primary">{group.feedTitle}</span>
                    <Badge variant="brand" className="text-xs">
                      {group.items.length}
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2.5">
                    {group.items.map((item, index) => (
                      <NewsCard
                        key={`${item.feedId}-${index}`}
                        newsItem={item}
                        onClick={onNewsClick}
                        showFeedTitle={false}
                        locale={locale}
                        compact
                      />
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      )}
    </div>
  );
};
const NewsCard = ({ newsItem, onClick, showFeedTitle = true, locale, compact = false }: NewsCardProps) => {
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
    <Card className={`overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)] ${compact ? 'rounded-2xl' : ''}`}>
      <button
        type="button"
        onClick={() => onClick(newsItem)}
        className="w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
        aria-label={newsItem.title || newsItem.feedTitle}
      >
        <CardContent className={compact ? 'p-3 pt-2.5' : 'p-4 sm:p-5'}>
          <div className={`mb-2 flex items-center justify-between gap-2 ${compact ? '' : 'sm:mb-2.5'}`}>
            {showFeedTitle ? (
              <Badge className="rounded-full border border-[color:var(--border)] px-2.5 py-0.5 text-[11px] uppercase tracking-wide text-secondary">
                {newsItem.feedTitle}
              </Badge>
            ) : (
              <span className="text-[11px] font-semibold uppercase tracking-wide text-muted">{newsItem.feedTitle}</span>
            )}
            <span className="whitespace-nowrap text-xs text-muted">
              {formatDate(newsItem.isoDate || newsItem.pubDate)}
            </span>
          </div>

          <h4 className={`line-clamp-2 text-primary ${compact ? 'text-[0.95rem] font-semibold leading-snug' : 'text-[1.02rem] font-semibold leading-snug'}`}>
            {newsItem.title}
          </h4>

          <div
            className={`mt-2 line-clamp-3 text-secondary ${compact ? 'text-[0.84rem] leading-snug' : 'text-sm leading-relaxed'}`}
            dangerouslySetInnerHTML={{ __html: newsItem.truncatedDescription }}
          />

          <div className="mt-3 flex justify-end">
            <span className="text-xs font-medium text-[color:var(--brand-strong)]">→</span>
          </div>
        </CardContent>
      </button>
    </Card>
  );
};
