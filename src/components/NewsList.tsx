import { NewsItem, ViewMode } from '../types';

interface NewsListProps {
  news: NewsItem[];
  viewMode: ViewMode;
  loading: boolean;
  onNewsClick: (newsItem: NewsItem) => void;
}

export const NewsList = ({ news, viewMode, loading, onNewsClick }: NewsListProps) => {
  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <p className="mt-2 text-gray-600">Caricamento news...</p>
      </div>
    );
  }

  if (news.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Nessuna news disponibile.</p>
        <p className="text-sm mt-2">Aggiungi dei feed RSS e aggiorna per vedere le news.</p>
      </div>
    );
  }

  const groupedNews = viewMode === 'by-feed'
    ? news.reduce((acc, item) => {
        const feedTitle = item.feedTitle;
        if (!acc[feedTitle]) acc[feedTitle] = [];
        acc[feedTitle].push(item);
        return acc;
      }, {} as Record<string, NewsItem[]>)
    : null;

  return (
    <div className="space-y-6">
      {viewMode === 'chronological' ? (
        <div className="space-y-4">
          {news.map((item, index) => (
            <NewsCard key={`${item.feedId}-${index}`} newsItem={item} onClick={onNewsClick} />
          ))}
        </div>
      ) : (
        Object.entries(groupedNews!).map(([feedTitle, feedNews]) => (
          <div key={feedTitle}>
            <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b border-gray-200 pb-2">
              {feedTitle}
            </h3>
            <div className="space-y-3">
              {feedNews.map((item, index) => (
                <NewsCard key={`${item.feedId}-${index}`} newsItem={item} onClick={onNewsClick} />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

interface NewsCardProps {
  newsItem: NewsItem;
  onClick: (newsItem: NewsItem) => void;
}

const NewsCard = ({ newsItem, onClick }: NewsCardProps) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString('it-IT', {
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
    <div
      className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onClick(newsItem)}
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-medium text-gray-800 line-clamp-2 flex-1 mr-4">
          {newsItem.title}
        </h4>
        <span className="text-xs text-gray-500 whitespace-nowrap">
          {formatDate(newsItem.isoDate || newsItem.pubDate)}
        </span>
      </div>

      <div
        className="text-sm text-gray-600 mb-2 line-clamp-2"
        dangerouslySetInnerHTML={{ __html: newsItem.truncatedDescription }}
      />

      <div className="flex justify-between items-center">
        <span className="text-xs text-blue-600 font-medium">
          {newsItem.feedTitle}
        </span>
        <span className="text-xs text-gray-400">
          →
        </span>
      </div>
    </div>
  );
};