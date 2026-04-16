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
    themeMode,
    toggleTheme,
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
    <div className="app-shell">
      <Header
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        themeMode={themeMode}
        onToggleTheme={toggleTheme}
      />

      {/* Error Message */}
      {state.error && (
        <div className="app-container pt-4">
          <div className="surface rounded-lg px-4 py-3 flex justify-between items-center text-secondary">
            <span className="text-[var(--danger)]">{state.error}</span>
            <button
              onClick={clearError}
              className="text-[var(--danger)] hover:opacity-80 font-bold"
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
        <div className="app-container py-8 stagger-in">
          {state.feeds.length === 0 ? (
            <div className="text-center py-16 text-muted surface rounded-2xl">
              <img
                src={`${import.meta.env.BASE_URL}pickupnews-mark.svg`}
                alt="PN"
                className="w-16 h-16 mx-auto mb-4 opacity-80"
              />
              <p className="text-lg font-semibold mb-2 text-primary">Nessun feed RSS aggiunto</p>
              <p className="text-sm mb-4">Vai nella sezione Feeds per aggiungere le tue fonti preferite.</p>
              <button
                onClick={() => setCurrentPage('feeds')}
                className="btn-brand px-6 py-2 rounded-lg font-medium transition"
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
