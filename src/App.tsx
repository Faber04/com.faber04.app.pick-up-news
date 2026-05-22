import { useState, useEffect, useRef } from 'react';
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

const APP_VERSION = '3.1.3';

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
    notifications,
    notificationsEnabled,
    markAllNotificationsRead,
    clearAllNotifications,
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
  const [homePullState, setHomePullState] = useState<'idle' | 'pulling' | 'ready' | 'refreshing'>('idle');
  const pullStartYRef = useRef<number | null>(null);
  const pullRefreshRequestedRef = useRef(false);

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

  const handleNewsClick = (newsItem: NewsItem) => {
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

  const resetHomePull = () => {
    pullStartYRef.current = null;
    pullRefreshRequestedRef.current = false;
    setHomePullState('idle');
  };

  const handleHomeTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    if (currentPageNode.id !== 'home' || state.loading) return;
    if (window.scrollY > 0) return;

    pullStartYRef.current = event.touches[0]?.clientY ?? null;
    pullRefreshRequestedRef.current = false;
    setHomePullState('pulling');
  };

  const handleHomeTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    if (currentPageNode.id !== 'home' || state.loading || pullStartYRef.current === null) return;

    const currentY = event.touches[0]?.clientY ?? pullStartYRef.current;
    const delta = currentY - pullStartYRef.current;

    if (delta <= 0) {
      setHomePullState('idle');
      return;
    }

    if (delta > 72) {
      setHomePullState('ready');
      return;
    }

    setHomePullState('pulling');
  };

  const handleHomeTouchEnd = () => {
    if (currentPageNode.id !== 'home' || state.loading || pullStartYRef.current === null) {
      resetHomePull();
      return;
    }

    const shouldRefresh = homePullState === 'ready' && !pullRefreshRequestedRef.current;
    resetHomePull();

    if (shouldRefresh) {
      pullRefreshRequestedRef.current = true;
      setHomePullState('refreshing');
      void (async () => {
        try {
          await refreshNews('manual');
        } finally {
          setHomePullState('idle');
          pullRefreshRequestedRef.current = false;
        }
      })();
    }
  };

  const handleHomeTouchCancel = () => {
    resetHomePull();
  };

  const filteredNews = getFilteredNews();

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
        <div
          className="app-container py-8 stagger-in"
          onTouchStart={handleHomeTouchStart}
          onTouchMove={handleHomeTouchMove}
          onTouchEnd={handleHomeTouchEnd}
          onTouchCancel={handleHomeTouchCancel}
        >
          {(homePullState !== 'idle' || state.loading) && (
            <div className="sticky top-2 z-10 mb-4">
              <div className="rounded-2xl border border-[color:color-mix(in_srgb,var(--brand)_18%,var(--border)_82%)] bg-[color:color-mix(in_srgb,var(--brand)_10%,var(--surface)_90%)] px-4 py-3 shadow-[0_18px_36px_-26px_rgba(2,8,23,0.55)]">
                <div className="flex items-center justify-center gap-2 text-center text-[14px] font-semibold text-[color:var(--brand-strong)]">
                  {homePullState === 'refreshing' || state.loading ? (
                    <>
                      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-[color:var(--brand-strong)] border-t-transparent" />
                      <span>{messages.home.refreshing}</span>
                    </>
                  ) : homePullState === 'ready' ? (
                    <span>{messages.home.releaseToRefresh}</span>
                  ) : (
                    <span>{messages.home.pullToRefresh}</span>
                  )}
                </div>
              </div>
            </div>
          )}
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
          if (unreadCount > 0) markAllNotificationsRead();
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
