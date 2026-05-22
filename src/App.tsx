import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useAppState } from './hooks/useAppState';
import { usePWAInstall } from './hooks/usePWAInstall';
import { getNavigationLabel } from './i18n';
import { useI18n } from './i18n/useI18n';
import {
  Header,
  NewsList,
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
import type { PrimaryPage } from './types/component-props';
import { Toast } from './components/ui';

const APP_VERSION = '3.1.4';
const BOOT_READY_EVENT = 'pickupnews:boot-ready';

function App() {
  const { messages, supportedLanguages, language, setLanguage } = useI18n();
  const {
    state,
    filterOptions,
    setFilterOptions,
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
    exportFeeds,
    importFeeds,
    isInitialNewsLoadComplete,
    notifications,
    notificationsEnabled,
    markAllNotificationsRead,
    clearAllNotifications,
    markNewsAsRead,
    toggleNotifications,
    savedNews,
    isNewsSaved,
    toggleSaveNews,
  } = useAppState(messages.errors);

  const { canInstall, install } = usePWAInstall();
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const previousFeedIdsRef = useRef<string[]>([]);
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
  const [copyToastVisible, setCopyToastVisible] = useState(false);

  const currentPageNode = navigation.trail[navigation.trail.length - 1];
  const headerPage: PrimaryPage = currentPageNode.id === 'saved'
    ? 'saved'
    : currentPageNode.id === 'home'
      ? 'home'
      : 'settings';

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

  // Refresh automatically only when feeds are added, not when they are removed or reordered.
  useEffect(() => {
    const currentFeedIds = state.feeds.map((feed) => feed.id);
    const hasNewFeed = currentFeedIds.some((feedId) => !previousFeedIdsRef.current.includes(feedId));

    if (currentFeedIds.length > 0 && (previousFeedIdsRef.current.length === 0 || hasNewFeed)) {
      refreshNews();
    }

    previousFeedIdsRef.current = currentFeedIds;
  }, [state.feeds, refreshNews]);

  // Clear feed-related errors when leaving the Feeds page
  useEffect(() => {
    if (currentPageNode.id !== 'feeds' && state.error) {
      clearError();
    }
  }, [currentPageNode.id, state.error, clearError]);

  // Clear search when navigating away from Home
  useEffect(() => {
    if (currentPageNode.id !== 'home') {
      setFilterOptions((prev) => ({ ...prev, searchTerm: undefined }));
    }
  }, [currentPageNode.id, setFilterOptions]);

  useEffect(() => {
    if (!isInitialNewsLoadComplete) return;
    window.dispatchEvent(new Event(BOOT_READY_EVENT));
  }, [isInitialNewsLoadComplete]);

  const handleNewsClick = (newsItem: NewsItem) => {
    markNewsAsRead(newsItem);
    setSelectedNews(newsItem);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedNews(null);
  };

  const handleCopyLink = () => {
    setCopyToastVisible(true);
    window.setTimeout(() => {
      setCopyToastVisible(false);
    }, 2500);
  };

  const filteredNews = getFilteredNews();
  const unreadNotificationKeys = useMemo(() => {
    const keys = new Set<string>();
    notifications.forEach((notification) => {
      if (notification.read) return;
      const identifier = (notification.articleLink?.trim() || notification.articleTitle.trim()).toLowerCase();
      if (!identifier) return;
      keys.add(`${notification.feedId}::${identifier}`);
    });
    return keys;
  }, [notifications]);

  const isLatestNews = useCallback((newsItem: NewsItem) => {
    const identifier = (newsItem.link?.trim() || newsItem.title?.trim() || '').toLowerCase();
    if (!identifier) return false;
    return unreadNotificationKeys.has(`${newsItem.feedId}::${identifier}`);
  }, [unreadNotificationKeys]);

  const handleNavigate = (page: PrimaryPage) => {
    if (page === 'home') {
      navigationActions.reset();
      return;
    }

    if (page === 'saved') {
      navigationActions.reset();
      navigationActions.push(createNode('saved'));
      return;
    }

    navigationActions.reset();
    navigationActions.push(createNode('settings'));
  };

  return (
    <div className="app-shell pb-28 lg:pb-6">
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
              <NewsList
                news={filteredNews}
                loading={state.loading}
                onNewsClick={handleNewsClick}
                onToggleSave={toggleSaveNews}
                isNewsSaved={isNewsSaved}
                isLatestNews={isLatestNews}
                activeFeedId={filterOptions.feedId}
                onFeedFilterChange={(feedId) => {
                  setFilterOptions((prev) => ({
                    ...prev,
                    feedId,
                  }));
                }}
                searchQuery={filterOptions.searchTerm ?? ''}
                onSearchChange={(query) => {
                  setFilterOptions((prev) => ({
                    ...prev,
                    searchTerm: query || undefined,
                  }));
                }}
              />
            </>
          )}
        </div>
      ) : currentPageNode.id === 'saved' ? (
        <div className="app-container py-8 stagger-in">
          {savedNews.length === 0 ? (
            <Card>
              <CardHeader className="items-center text-center py-10">
                <CardTitle className="max-w-lg text-3xl">{messages.saved.emptyTitle}</CardTitle>
                <p className="max-w-md text-sm text-secondary">{messages.saved.emptyDescription}</p>
              </CardHeader>
            </Card>
          ) : (
            <NewsList
              news={savedNews}
              loading={false}
              onNewsClick={handleNewsClick}
              onToggleSave={toggleSaveNews}
              isNewsSaved={isNewsSaved}
              isLatestNews={isLatestNews}
            />
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
            onExportFeeds={exportFeeds}
            onImportFeeds={importFeeds}
            onClearError={clearError}
            onRemoveFeed={removeFeed}
            onMoveFeed={moveFeed}
            onMoveFeedToIndex={moveFeedToIndex}
            onEditFeed={updateFeed}
            onRefresh={() => refreshNews('manual')}
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
        isSaved={selectedNews ? isNewsSaved(selectedNews) : false}
        onToggleSave={toggleSaveNews}
        onCopyLink={handleCopyLink}
      />

      <Toast open={copyToastVisible} message={messages.article.linkCopied} />

      {/* Notification Panel */}
      <NotificationPanel
        notifications={notifications}
        isOpen={isNotificationPanelOpen}
        onClose={() => {
          setIsNotificationPanelOpen(false);
        }}
        onMarkAllRead={markAllNotificationsRead}
        onClearAll={clearAllNotifications}
      />

      <MobileBottomNav
        currentPage={headerPage}
        onNavigate={handleNavigate}
      />
    </div>
  );
}

export default App;
