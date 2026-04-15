import { useState, useEffect } from 'react';
import { useAppState } from './hooks/useAppState';
import {
  Header,
  NewsList,
  ViewControls,
  NewsDetailModal
} from './components';
import { FeedsPage } from './pages/FeedsPage';
import { NewsItem } from './types';

type Page = 'home' | 'feeds';

function App() {
  const {
    state,
    viewMode,
    setViewMode,
    addFeed,
    removeFeed,
    refreshNews,
    getFilteredNews,
    clearError
  } = useAppState();

  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Auto-refresh news when feeds change
  useEffect(() => {
    if (state.feeds.length > 0) {
      refreshNews();
    }
  }, [state.feeds.length]);

  const handleNewsClick = (newsItem: NewsItem) => {
    setSelectedNews(newsItem);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedNews(null);
  };

  const filteredNews = getFilteredNews();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentPage={currentPage} onNavigate={setCurrentPage} />

      {/* Error Message */}
      {state.error && (
        <div className="max-w-6xl mx-auto px-4 pt-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex justify-between items-center">
            <span>{state.error}</span>
            <button
              onClick={clearError}
              className="text-red-700 hover:text-red-900 font-bold"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {currentPage === 'feeds' ? (
        <FeedsPage
          feeds={state.feeds}
          loading={state.loading}
          onAddFeed={addFeed}
          onRemoveFeed={removeFeed}
          onRefresh={refreshNews}
        />
      ) : (
        <div className="max-w-6xl mx-auto px-4 py-8">
          {state.feeds.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <img
                src={`${import.meta.env.BASE_URL}vite.svg`}
                alt="PN"
                className="w-16 h-16 mx-auto mb-4 opacity-40"
              />
              <p className="text-lg font-medium mb-2">Nessun feed RSS aggiunto</p>
              <p className="text-sm mb-4">Vai nella sezione Feeds per aggiungere le tue fonti preferite.</p>
              <button
                onClick={() => setCurrentPage('feeds')}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                📡 Gestisci Feed
              </button>
            </div>
          ) : (
            <>
              <ViewControls
                viewMode={viewMode}
                onViewModeChange={setViewMode}
              />
              <NewsList
                news={filteredNews}
                viewMode={viewMode}
                loading={state.loading}
                onNewsClick={handleNewsClick}
              />
            </>
          )}
        </div>
      )}

      {/* News Detail Modal */}
      <NewsDetailModal
        newsItem={selectedNews}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}

export default App;
