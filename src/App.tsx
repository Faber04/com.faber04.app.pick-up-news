import { useState, useEffect } from 'react';
import { useAppState } from './hooks/useAppState';
import { usePWAInstall } from './hooks/usePWAInstall';
import { getNavigationLabel } from './i18n';
import { useI18n } from './i18n/useI18n';
import {
  Header,
  NewsList,
  ViewControls,
  NewsDetailModal,
  Breadcrumb,
  SubpageContainer,
  FeedsContent,
  MobileBottomNav,
  NotificationPanel,
} from './components';
import { Alert, AlertDescription, Badge, Button, Card, CardContent, CardHeader, CardTitle } from './components/ui';
import { SettingsPage } from './pages/SettingsPage';
import { NewsItem } from './types';
import type { NavigationState, BreadcrumbNode, NavigationActions } from './types/navigation';

const APP_VERSION = '2.0.0';

function App() {
  const { messages, supportedLanguages, language, setLanguage } = useI18n();
  const {
    state,
    viewMode,
    setViewMode,
    themeMode,
    toggleTheme,
    addFeed,
    removeFeed,
    moveFeed,
    moveFeedToIndex,
    updateFeed,
    refreshNews,
    getFilteredNews,
    clearError,
    notifications,
    notificationsEnabled,
    markAllNotificationsRead,
    clearAllNotifications,
    toggleNotifications,
  } = useAppState(messages.errors);

  const { canInstall, install } = usePWAInstall();
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  const createNode = (id: string, params?: Record<string, unknown>): BreadcrumbNode => ({
    id,
    label: getNavigationLabel(id, messages),
    params,
  });

  const [navigation, setNavigation] = useState<NavigationState>({
    trail: [createNode('home')],
  });

  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const currentPageNode = navigation.trail[navigation.trail.length - 1];
  const headerPage: 'home' | 'settings' = currentPageNode.id === 'home' ? 'home' : 'settings';

  const navigationActions: NavigationActions = {
    push: (node: BreadcrumbNode) => {
      setNavigation((prev) => ({
        trail: [...prev.trail, node],
      }));
    },
    pop: () => {
      setNavigation((prev) => ({
        trail: prev.trail.length > 1 ? prev.trail.slice(0, -1) : prev.trail,
      }));
    },
    goToIndex: (index: number) => {
      setNavigation((prev) => ({
        trail: prev.trail.slice(0, index + 1),
      }));
    },
    reset: () => {
      setNavigation({
        trail: [createNode('home')],
      });
    },
  };

  useEffect(() => {
    setNavigation((prev) => ({
      trail: prev.trail.map((node) => ({
        ...node,
        label: getNavigationLabel(node.id, messages),
      })),
    }));
  }, [messages]);

  // Auto-refresh news when feeds change
  useEffect(() => {
    if (state.feeds.length > 0) {
      refreshNews();
    }
  }, [state.feeds.length, refreshNews]);

  // Clear feed-related errors when leaving the Feeds page
  useEffect(() => {
    if (currentPageNode.id !== 'feeds' && state.error) {
      clearError();
    }
  }, [currentPageNode.id, state.error, clearError]);

  const handleNewsClick = (newsItem: NewsItem) => {
    setSelectedNews(newsItem);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedNews(null);
  };

  const filteredNews = getFilteredNews();

  const handleNavigate = (page: 'home' | 'settings') => {
    if (page === 'home') {
      navigationActions.reset();
      return;
    }

    navigationActions.reset();
    navigationActions.push(createNode('settings'));
  };

  const handleToggleViewMode = () => {
    if (currentPageNode.id !== 'home') {
      navigationActions.reset();
    }

    setViewMode((prev) => (prev === 'chronological' ? 'by-feed' : 'chronological'));
  };

  return (
    <div className="app-shell pb-24 lg:pb-0">
      <Header
        currentPage={headerPage}
        themeMode={themeMode}
        onToggleTheme={toggleTheme}
        onNavigate={handleNavigate}
        unreadNotificationsCount={unreadCount}
        onOpenNotifications={() => setIsNotificationPanelOpen(true)}
      />

      {/* Breadcrumb Navigation */}
      <Breadcrumb trail={navigation.trail} onNavigate={navigationActions} />

      {/* Error Message */}
      {state.error && currentPageNode.id !== 'feeds' && (
        <div className="app-container pt-4">
          <Alert variant="destructive" className="flex items-start justify-between gap-4">
            <AlertDescription className="text-[color:var(--danger)]">
              {state.error}
            </AlertDescription>
            <Button
              type="button"
              onClick={clearError}
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 text-[color:var(--danger)] hover:bg-transparent hover:opacity-80"
            >
              ✕
            </Button>
          </Alert>
        </div>
      )}

      {/* Page Routing */}
      {currentPageNode.id === 'home' ? (
        <div className="app-container py-8 stagger-in">
          {state.feeds.length === 0 ? (
            <Card className="overflow-hidden">
              <CardHeader className="items-center text-center py-10">
                <div className="mb-4 inline-flex rounded-[1.75rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-3 shadow-[0_20px_40px_-30px_rgba(2,8,23,0.8)]">
                  <img
                    src={`${import.meta.env.BASE_URL}pickupnews-mark.svg`}
                    alt="PN"
                    className="h-14 w-14 opacity-90"
                  />
                </div>
                <CardTitle className="max-w-lg text-3xl">{messages.home.emptyTitle}</CardTitle>
                <p className="max-w-md text-sm text-secondary">{messages.home.emptyDescription}</p>
              </CardHeader>
              <CardContent className="pb-10 text-center">
                <Button
                  variant="brand"
                  size="lg"
                  onClick={() => {
                    navigationActions.reset();
                    navigationActions.push(createNode('settings'));
                    navigationActions.push(createNode('feeds'));
                  }}
                >
                  {messages.home.emptyAction}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <ViewControls
                viewMode={viewMode}
                onViewModeChange={setViewMode}
              />
              <NewsList
                news={filteredNews}
                viewMode={viewMode}
                feedOrder={state.feeds.map((feed) => feed.id)}
                loading={state.loading}
                onNewsClick={handleNewsClick}
              />
            </>
          )}
        </div>
      ) : currentPageNode.id === 'settings' ? (
        <SettingsPage
          version={APP_VERSION}
          onOpenLanguage={() => {
            navigationActions.push(createNode('language'));
          }}
          onOpenFeeds={() => {
            navigationActions.push(createNode('feeds'));
          }}
          notificationsEnabled={notificationsEnabled}
          onToggleNotifications={toggleNotifications}
          canInstallPWA={canInstall}
          onInstallPWA={install}
        />
      ) : currentPageNode.id === 'language' ? (
        <SubpageContainer
          title={messages.common.language}
          onBack={() => navigationActions.pop()}
        >
          <div className="space-y-3">
            <p className="text-sm text-secondary">{messages.settings.languageDescription}</p>
            <div className="space-y-3 pt-2">
              {supportedLanguages.map((option) => {
                const isActive = option.code === language;

                return (
                  <Button
                    key={option.code}
                    type="button"
                    onClick={() => setLanguage(option.code)}
                    variant={isActive ? 'secondary' : 'outline'}
                    size="lg"
                    className={`h-auto w-full justify-between rounded-2xl px-4 py-3 text-left ${
                      isActive
                        ? 'ring-2 ring-[color:var(--ring)]'
                        : ''
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-base font-medium text-primary">
                        {option.flag} {option.label}
                      </span>
                      {isActive && <Badge variant="brand" className="text-xs">{messages.settings.currentLanguage}</Badge>}
                    </div>
                  </Button>
                );
              })}
            </div>
          </div>
        </SubpageContainer>
      ) : currentPageNode.id === 'feeds' ? (
        <SubpageContainer
          title={messages.common.manageFeeds}
          onBack={() => navigationActions.pop()}
        >
          <FeedsContent
            feeds={state.feeds}
            loading={state.loading}
            addFeedError={state.error}
            onAddFeed={addFeed}
            onClearError={clearError}
            onRemoveFeed={removeFeed}
            onMoveFeed={moveFeed}
            onMoveFeedToIndex={moveFeedToIndex}
            onEditFeed={updateFeed}
            onRefresh={refreshNews}
          />
        </SubpageContainer>
      ) : (
        <div className="app-container py-8 stagger-in">
          <Card>
            <CardContent className="py-8 text-center text-muted">
              <p>{messages.common.pageNotFound}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* News Detail Modal */}
      <NewsDetailModal
        newsItem={selectedNews}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />

      {/* Notification Panel */}
      <NotificationPanel
        notifications={notifications}
        isOpen={isNotificationPanelOpen}
        onClose={() => {
          setIsNotificationPanelOpen(false);
          if (unreadCount > 0) markAllNotificationsRead();
        }}
        onMarkAllRead={markAllNotificationsRead}
        onClearAll={clearAllNotifications}
      />

      <MobileBottomNav
        currentPage={headerPage}
        viewMode={viewMode}
        onNavigate={handleNavigate}
        onToggleViewMode={handleToggleViewMode}
      />
    </div>
  );
}

export default App;
