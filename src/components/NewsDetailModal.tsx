import { NewsItem } from '../types';

interface NewsDetailModalProps {
  newsItem: NewsItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const NewsDetailModal = ({ newsItem, isOpen, onClose }: NewsDetailModalProps) => {
  if (!isOpen || !newsItem) return null;

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString('it-IT', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '';
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-xl">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 line-clamp-2">
            {newsItem.title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ✕
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              {newsItem.feedTitle}
            </span>
            <span>
              {formatDate(newsItem.isoDate || newsItem.pubDate)}
            </span>
            {newsItem.creator && (
              <span>di {newsItem.creator}</span>
            )}
          </div>

          {newsItem.content ? (
            <div
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: newsItem.content }}
            />
          ) : newsItem.contentSnippet ? (
            <div
              className="prose prose-sm max-w-none text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: newsItem.contentSnippet }}
            />
          ) : newsItem.summary ? (
            <div
              className="prose prose-sm max-w-none text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: newsItem.summary }}
            />
          ) : (
            <p className="text-gray-500 italic">Nessun contenuto disponibile</p>
          )}

          {newsItem.link && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <a
                href={newsItem.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Leggi l'articolo completo →
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};