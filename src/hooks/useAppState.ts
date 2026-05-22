import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { RSSFeed, AppState, ViewMode, FilterOptions, ThemeMode, AppNotification, NewsItem, SavedNewsItem } from '../types';
import { RSSService } from '../services';
import type { LocaleDictionary } from '../i18n';

const STORAGE_KEYS = {
  FEEDS: 'pickUpNews_feeds',
  VIEW_MODE: 'pickUpNews_viewMode',
  THEME: 'pickUpNews_theme',
  NOTIFICATIONS: 'pickUpNews_notifications',
  SAVED_NEWS: 'pickUpNews_savedNews',
  SEEN_GUIDS: 'pickUpNews_seenGuids',
  NOTIFICATIONS_ENABLED: 'pickUpNews_notificationsEnabled',
  DEFAULT_FEEDS_VERSION: 'pickUpNews_defaultFeedsVersion',
  DEFAULT_FEEDS_OPT_OUT: 'pickUpNews_defaultFeedsOptOut',
  PENDING_NOTIFICATION_TARGET: 'pickUpNews_pendingNotificationTarget',
};

const MAX_NOTIFICATIONS = 50;
const TRANSFER_FILE_FORMAT = 'pickupnews-feeds';
const TRANSFER_FILE_VERSION = 2;
const CURRENT_DEFAULT_FEEDS_VERSION = 2;
const DEFAULT_FEEDS: Array<{ title: string; url: string }> = [
  { title: 'BBC World', url: 'https://feeds.bbci.co.uk/news/world/rss.xml' },
];

type FeedTransferFile = {
  format: typeof TRANSFER_FILE_FORMAT;
  version: 1 | 2;
  exportedAt: string;
  feeds: Array<{
    title: string;
    url: string;
  }>;
  savedNews?: SavedNewsItem[];
};

const isFeedTransferFile = (value: unknown): value is FeedTransferFile => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const parsed = value as Partial<FeedTransferFile>;

  if (parsed.format !== TRANSFER_FILE_FORMAT) {
    return false;
  }

  if (parsed.version !== 1 && parsed.version !== 2) {
    return false;
  }

  if (!Array.isArray(parsed.feeds)) {
    return false;
  }

  if (!parsed.feeds.every((feed) => (
    feed
    && typeof feed === 'object'
    && typeof feed.title === 'string'
    && typeof feed.url === 'string'
  ))) {
    return false;
  }

  if (parsed.savedNews !== undefined && !Array.isArray(parsed.savedNews)) {
    return false;
  }

  return true;
};

const createExportFileName = () => {
  const now = new Date();
  const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const timePart = `${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
  return `pickupnews-feeds-${datePart}-${timePart}.json`;
};

const getArticleGuid = (item: NewsItem): string =>
  item.guid || item.link || item.title || '';

const getNewsStorageId = (item: NewsItem): string => {
  const guid = getArticleGuid(item);
  if (guid) {
    return guid;
  }

  return [
    item.feedId,
    item.isoDate || item.pubDate || '',
    item.title || '',
  ].join('|');
};

const getNotificationArticleIdentifier = (articleLink?: string, articleTitle?: string): string =>
  (articleLink?.trim() || articleTitle?.trim() || '').toLowerCase();

export const useAppState = (messages: LocaleDictionary['errors']) => {
  const pendingAddUrlsRef = useRef<Set<string>>(new Set());
  const seenGuidsRef = useRef<Set<string>>(new Set());
  const isFirstLoadRef = useRef(true);

  const [state, setState] = useState<AppState>({
    feeds: [],
    news: [],
    loading: false,
    error: null
  });

  const [viewMode, setViewMode] = useState<ViewMode>('chronological');
  const [themeMode, setThemeMode] = useState<ThemeMode>('light');
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({});
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [savedNews, setSavedNews] = useState<SavedNewsItem[]>([]);
  const [isInitialNewsLoadComplete, setIsInitialNewsLoadComplete] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    let loadedFeedsCount = 0;
    const savedFeeds = localStorage.getItem(STORAGE_KEYS.FEEDS);
    const savedDefaultFeedsVersion = Number(localStorage.getItem(STORAGE_KEYS.DEFAULT_FEEDS_VERSION) || '0');
    const defaultFeedsOptOut = localStorage.getItem(STORAGE_KEYS.DEFAULT_FEEDS_OPT_OUT) === 'true';
    const savedViewMode = localStorage.getItem(STORAGE_KEYS.VIEW_MODE);
    const savedThemeMode = localStorage.getItem(STORAGE_KEYS.THEME) as ThemeMode | null;
    const savedNotifications = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    const savedSavedNews = localStorage.getItem(STORAGE_KEYS.SAVED_NEWS);
    const savedNotificationsEnabled = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS_ENABLED);
    const savedSeenGuids = localStorage.getItem(STORAGE_KEYS.SEEN_GUIDS);
    let shouldSeedDefaultFeeds = false;

    if (savedFeeds) {
      try {
        const feeds = JSON.parse(savedFeeds);
        if (Array.isArray(feeds)) {
          loadedFeedsCount = feeds.length;
          setState(prev => ({ ...prev, feeds }));
          shouldSeedDefaultFeeds = feeds.length === 0
            && (!defaultFeedsOptOut || savedDefaultFeedsVersion < CURRENT_DEFAULT_FEEDS_VERSION);
        }
      } catch (error) {
        console.error('Error loading feeds from localStorage:', error);
        shouldSeedDefaultFeeds = true;
      }
    } else {
      shouldSeedDefaultFeeds = true;
    }

    if (shouldSeedDefaultFeeds) {
      const seededFeeds: RSSFeed[] = DEFAULT_FEEDS.map((feed, index) => ({
        id: `${Date.now()}-${index}`,
        title: feed.title,
        url: RSSService.normalizeUrl(feed.url),
        lastFetched: new Date(),
      }));
      loadedFeedsCount = seededFeeds.length;
      setState(prev => ({ ...prev, feeds: seededFeeds }));
      localStorage.setItem(STORAGE_KEYS.DEFAULT_FEEDS_VERSION, String(CURRENT_DEFAULT_FEEDS_VERSION));
      localStorage.setItem(STORAGE_KEYS.DEFAULT_FEEDS_OPT_OUT, 'false');
    }

    if (savedViewMode) {
      setViewMode(savedViewMode as ViewMode);
    }

    if (savedThemeMode === 'light' || savedThemeMode === 'dark') {
      setThemeMode(savedThemeMode);
    } else {
      const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
      setThemeMode(prefersDark ? 'dark' : 'light');
    }

    if (savedNotifications) {
      try {
        setNotifications(JSON.parse(savedNotifications));
      } catch { /* keep default */ }
    }

    if (savedSavedNews) {
      try {
        const parsed = JSON.parse(savedSavedNews);
        if (Array.isArray(parsed)) {
          setSavedNews(parsed as SavedNewsItem[]);
        }
      } catch { /* keep default */ }
    }

    if (savedNotificationsEnabled === 'true') {
      setNotificationsEnabled(true);
    }

    if (savedSeenGuids) {
      try {
        const guidsArray = JSON.parse(savedSeenGuids) as string[];
        seenGuidsRef.current = new Set(guidsArray);
        if (guidsArray.length > 0) {
          isFirstLoadRef.current = false;
        }
      } catch { /* keep empty set */ }
    }

    setIsInitialNewsLoadComplete(loadedFeedsCount === 0);
  }, []);

  // Save feeds to localStorage when changed
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FEEDS, JSON.stringify(state.feeds));
  }, [state.feeds]);

  // Save view mode to localStorage when changed
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.VIEW_MODE, viewMode);
  }, [viewMode]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.THEME, themeMode);
    document.documentElement.setAttribute('data-theme', themeMode);
  }, [themeMode]);

  // Save notifications to localStorage when changed
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SAVED_NEWS, JSON.stringify(savedNews));
  }, [savedNews]);

  const addFeed = useCallback(async (url: string, title: string): Promise<boolean> => {
    if (!RSSService.validateFeedUrl(url)) {
      setState(prev => ({ ...prev, error: messages.invalidFeedUrl }));
      return false;
    }

    const normalizedUrl = RSSService.normalizeUrl(url);
    const normalizedKey = normalizedUrl.toLowerCase();

    if (pendingAddUrlsRef.current.has(normalizedKey)) {
      return false;
    }

    pendingAddUrlsRef.current.add(normalizedKey);
    setState(prev => ({ ...prev, loading: true, error: null }));

    let finalFeedUrl = normalizedUrl;
    let finalKey = normalizedKey;
    let detectedFeedUrl: string | null = null;

    try {
      // Try automatic detection first (JSON Feed -> RSS/Atom), then keep manual URL as fallback.
      try {
        const detected = await RSSService.detectFeedUrl(normalizedUrl);
        if (detected?.feedUrl) {
          finalFeedUrl = detected.feedUrl;
          finalKey = detected.feedUrl.toLowerCase();
          detectedFeedUrl = detected.feedUrl;
        }
      } catch {
        // Keep manual URL if detection fails.
      }

      // If detection fails, validate that the user-provided URL is actually a feed.
      if (!detectedFeedUrl) {
        try {
          await RSSService.fetchFeed(normalizedUrl);
        } catch {
          setState(prev => ({
            ...prev,
            loading: false,
            error: messages.autoDetectFailed
          }));
          return false;
        }
      }

      const newFeed: RSSFeed = {
        id: Date.now().toString(),
        url: finalFeedUrl,
        title,
        lastFetched: new Date()
      };

      const alreadyExists = state.feeds.some(feed => feed.url.toLowerCase() === finalKey);
      if (alreadyExists) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: messages.duplicateFeed
        }));
        return false;
      }

      setState(prev => {
        return {
          ...prev,
          feeds: [...prev.feeds, newFeed],
          loading: false,
          error: null
        };
      });
      localStorage.setItem(STORAGE_KEYS.DEFAULT_FEEDS_OPT_OUT, 'false');

      return true;
    } finally {
      pendingAddUrlsRef.current.delete(normalizedKey);
      pendingAddUrlsRef.current.delete(finalKey);
    }
  }, [messages, state.feeds]);

  const removeFeed = useCallback((feedId: string) => {
    setState(prev => {
      const updatedFeeds = prev.feeds.filter(feed => feed.id !== feedId);
      if (updatedFeeds.length === 0) {
        localStorage.setItem(STORAGE_KEYS.DEFAULT_FEEDS_OPT_OUT, 'true');
      }
      return {
        ...prev,
        feeds: updatedFeeds,
        news: prev.news.filter(news => news.feedId !== feedId)
      };
    });
    setFilterOptions(prev => (
      prev.feedId === feedId
        ? { ...prev, feedId: undefined }
        : prev
    ));
  }, []);

  const moveFeed = useCallback((feedId: string, direction: 'up' | 'down') => {
    setState(prev => {
      const currentIndex = prev.feeds.findIndex(feed => feed.id === feedId);
      if (currentIndex === -1) {
        return prev;
      }

      const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      if (targetIndex < 0 || targetIndex >= prev.feeds.length) {
        return prev;
      }

      const reorderedFeeds = [...prev.feeds];
      const [movedFeed] = reorderedFeeds.splice(currentIndex, 1);
      reorderedFeeds.splice(targetIndex, 0, movedFeed);

      return {
        ...prev,
        feeds: reorderedFeeds
      };
    });
  }, []);

  const moveFeedToIndex = useCallback((feedId: string, targetIndex: number) => {
    setState(prev => {
      const currentIndex = prev.feeds.findIndex(feed => feed.id === feedId);
      if (currentIndex === -1 || targetIndex < 0 || targetIndex >= prev.feeds.length || currentIndex === targetIndex) {
        return prev;
      }

      const reorderedFeeds = [...prev.feeds];
      const [movedFeed] = reorderedFeeds.splice(currentIndex, 1);
      reorderedFeeds.splice(targetIndex, 0, movedFeed);

      return {
        ...prev,
        feeds: reorderedFeeds
      };
    });
  }, []);

  const updateFeed = useCallback(async (feedId: string, updates: { title: string; url: string }) => {
    if (!RSSService.validateFeedUrl(updates.url)) {
      setState(prev => ({ ...prev, error: messages.invalidFeedUrl }));
      return false;
    }

    const updatedTitle = updates.title.trim();
    const normalizedUrl = RSSService.normalizeUrl(updates.url);
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const fetchedItems = await RSSService.fetchFeed(normalizedUrl);
      const now = new Date();

      const refreshedFeedNews = fetchedItems.map(item => ({
        ...item,
        feedId,
        feedTitle: updatedTitle,
        truncatedDescription: RSSService.truncateDescription(item.contentSnippet || item.summary || '', 120)
      }));

      setState(prev => {
        const newsWithoutCurrentFeed = prev.news.filter(news => news.feedId !== feedId);
        const mergedNews = [...newsWithoutCurrentFeed, ...refreshedFeedNews].sort((a, b) => {
          const dateA = new Date(a.isoDate || a.pubDate || '').getTime();
          const dateB = new Date(b.isoDate || b.pubDate || '').getTime();
          return dateB - dateA;
        });

        return {
          ...prev,
          feeds: prev.feeds.map(feed => {
            if (feed.id !== feedId) {
              return feed;
            }

            return {
              ...feed,
              title: updatedTitle,
              url: normalizedUrl,
              lastFetched: now,
              error: undefined
            };
          }),
          news: mergedNews,
          loading: false,
          error: null
        };
      });

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : messages.refreshFeedFailed;

      setState(prev => ({
        ...prev,
        feeds: prev.feeds.map(feed => {
          if (feed.id !== feedId) {
            return feed;
          }

          return {
            ...feed,
            title: updatedTitle,
            url: normalizedUrl,
            error: errorMessage
          };
        }),
        loading: false,
        error: errorMessage
      }));

      return false;
    }
  }, [messages.invalidFeedUrl, messages.refreshFeedFailed]);

  const refreshNews = useCallback(async (trigger: 'auto' | 'manual' = 'auto') => {
    if (state.feeds.length === 0) return;

    const requestedAt = new Date();
    setState(prev => ({
      ...prev,
      loading: true,
      error: null,
      feeds: trigger === 'manual'
        ? prev.feeds.map((feed) => ({
            ...feed,
            lastFetched: requestedAt,
          }))
        : prev.feeds,
    }));

    try {
      const news = await RSSService.fetchAllFeeds(state.feeds);

      // ── New-article detection for notification center ──
      const currentGuids = new Set(news.map(getArticleGuid).filter(Boolean));

      if (!isFirstLoadRef.current && seenGuidsRef.current.size > 0) {
        const newArticles = news.filter(item => {
          const guid = getArticleGuid(item);
          return guid !== '' && !seenGuidsRef.current.has(guid);
        });

        if (newArticles.length > 0) {
          const newNotifications: AppNotification[] = newArticles.slice(0, 20).map(item => ({
            id: `notif-${Date.now()}-${Math.random().toString(36).slice(2)}`,
            feedId: item.feedId,
            feedTitle: item.feedTitle,
            articleTitle: item.title ?? '—',
            articleLink: item.link,
            timestamp: new Date().toISOString(),
            read: false,
          }));

          setNotifications(prev => [...newNotifications, ...prev].slice(0, MAX_NOTIFICATIONS));

          // Browser notification (Notification API — no push server required)
          if (notificationsEnabled && 'Notification' in window && Notification.permission === 'granted') {
            newArticles.slice(0, 3).forEach((article) => {
              const articleTitle = article.title?.trim() || 'New article';
              const notification = new Notification(articleTitle, {
                body: article.feedTitle || 'PickUpNews',
                icon: '/app/pick-up-news/pickupnews-mark.svg',
              });

              notification.onclick = () => {
                const target = {
                  feedId: article.feedId,
                  articleLink: article.link,
                  articleTitle: article.title ?? '',
                };
                localStorage.setItem(STORAGE_KEYS.PENDING_NOTIFICATION_TARGET, JSON.stringify(target));
                const appUrl = `${window.location.origin}${import.meta.env.BASE_URL}`;
                if (window.location.pathname !== import.meta.env.BASE_URL) {
                  window.location.assign(appUrl);
                }
                window.focus();
                notification.close();
              };
            });
          }
        }
      }

      // Update seen GUIDs and first-load flag
      seenGuidsRef.current = currentGuids;
      isFirstLoadRef.current = false;
      localStorage.setItem(STORAGE_KEYS.SEEN_GUIDS, JSON.stringify([...currentGuids]));

      setState(prev => ({ ...prev, news, loading: false }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : messages.fetchNewsFailed
      }));
    } finally {
      setIsInitialNewsLoadComplete(true);
    }
  }, [messages.fetchNewsFailed, state.feeds, notificationsEnabled]);

  // ── Notification actions ──
  const markAllNotificationsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const markNewsAsRead = useCallback((newsItem: NewsItem) => {
    const targetIdentifier = getNotificationArticleIdentifier(newsItem.link, newsItem.title);
    if (!targetIdentifier) return;

    setNotifications((prev) => prev.map((notification) => {
      const notificationIdentifier = getNotificationArticleIdentifier(
        notification.articleLink,
        notification.articleTitle,
      );

      if (notification.read) return notification;

      if (
        notification.feedId === newsItem.feedId
        && notificationIdentifier === targetIdentifier
      ) {
        return { ...notification, read: true };
      }

      return notification;
    }));
  }, []);

  const isNewsSaved = useCallback((newsItem: NewsItem): boolean => {
    const id = getNewsStorageId(newsItem);
    return savedNews.some((savedItem) => getNewsStorageId(savedItem) === id);
  }, [savedNews]);

  const toggleSaveNews = useCallback((newsItem: NewsItem) => {
    const id = getNewsStorageId(newsItem);
    setSavedNews((prev) => {
      const alreadySaved = prev.some((savedItem) => getNewsStorageId(savedItem) === id);

      if (alreadySaved) {
        return prev.filter((savedItem) => getNewsStorageId(savedItem) !== id);
      }

      return [
        {
          ...newsItem,
          savedAt: new Date().toISOString(),
        },
        ...prev,
      ];
    });
  }, []);

  const toggleNotifications = useCallback(async (): Promise<boolean> => {
    if (!('Notification' in window)) return false;

    if (!notificationsEnabled) {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') return false;
      setNotificationsEnabled(true);
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS_ENABLED, 'true');
      return true;
    } else {
      setNotificationsEnabled(false);
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS_ENABLED, 'false');
      return false;
    }
  }, [notificationsEnabled]);

  const getFilteredNews = useCallback(() => {
    let filtered = state.news;

    if (filterOptions.feedId) {
      filtered = filtered.filter(news => news.feedId === filterOptions.feedId);
    }

    if (filterOptions.searchTerm) {
      const term = filterOptions.searchTerm.toLowerCase();
      filtered = filtered.filter(news => {
        const descriptionText = news.truncatedDescription.replace(/<[^>]+>/g, '');
        return (
          news.title?.toLowerCase().includes(term) ||
          news.feedTitle?.toLowerCase().includes(term) ||
          descriptionText.toLowerCase().includes(term)
        );
      });
    }

    return filtered;
  }, [state.news, filterOptions]);

  const orderedSavedNews = useMemo(() => {
    return [...savedNews].sort((a, b) => (
      new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
    ));
  }, [savedNews]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeMode(prev => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const exportFeeds = useCallback(() => {
    if (state.feeds.length === 0 && savedNews.length === 0) {
      return false;
    }

    const transferFile: FeedTransferFile = {
      format: TRANSFER_FILE_FORMAT,
      version: TRANSFER_FILE_VERSION,
      exportedAt: new Date().toISOString(),
      feeds: state.feeds.map(feed => ({
        title: feed.title,
        url: feed.url,
      })),
      savedNews: savedNews.length > 0 ? [...savedNews] : undefined,
    };

    const fileName = createExportFileName();
    const blob = new Blob([JSON.stringify(transferFile, null, 2)], { type: 'application/json' });
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(objectUrl);

    return true;
  }, [state.feeds, savedNews]);

  const importFeeds = useCallback(async (file: File): Promise<{ added: number; skipped: number; savedAdded: number }> => {
    const fileContent = await file.text();

    let parsed: unknown;
    try {
      parsed = JSON.parse(fileContent);
    } catch {
      throw new Error(messages.invalidImportFile);
    }

    if (!isFeedTransferFile(parsed)) {
      throw new Error(messages.invalidImportFile);
    }

    const importedFile = parsed as FeedTransferFile;
    const existingUrls = new Set(state.feeds.map((feed) => RSSService.normalizeUrl(feed.url).toLowerCase()));
    const importedUrls = new Set<string>();
    const newFeeds: RSSFeed[] = [];
    let skipped = 0;

    importedFile.feeds.forEach((entry, index) => {
      const normalizedUrl = RSSService.normalizeUrl(entry.url.trim());
      const normalizedTitle = entry.title.trim();
      const lookupUrl = normalizedUrl.toLowerCase();

      if (!normalizedTitle || !RSSService.validateFeedUrl(normalizedUrl)) {
        skipped += 1;
        return;
      }

      if (existingUrls.has(lookupUrl) || importedUrls.has(lookupUrl)) {
        skipped += 1;
        return;
      }

      importedUrls.add(lookupUrl);
      newFeeds.push({
        id: `${Date.now()}-${index}-${Math.random().toString(36).slice(2, 8)}`,
        title: normalizedTitle,
        url: normalizedUrl,
        lastFetched: new Date(),
      });
    });

    if (newFeeds.length > 0) {
      setState(prev => ({
        ...prev,
        feeds: [...prev.feeds, ...newFeeds],
        error: null,
      }));
      localStorage.setItem(STORAGE_KEYS.DEFAULT_FEEDS_OPT_OUT, 'false');
    }

    // Import saved news (skip duplicates by storage ID)
    let savedAdded = 0;
    const incomingSaved = importedFile.savedNews ?? [];

    if (incomingSaved.length > 0) {
      setSavedNews(prev => {
        const existingIds = new Set(prev.map(getNewsStorageId));
        const newItems = incomingSaved.filter(
          (item) => item && typeof item === 'object' && !existingIds.has(getNewsStorageId(item as SavedNewsItem))
        ) as SavedNewsItem[];
        savedAdded = newItems.length;
        return newItems.length > 0 ? [...prev, ...newItems] : prev;
      });
    }

    return {
      added: newFeeds.length,
      skipped,
      savedAdded,
    };
  }, [messages.invalidImportFile, state.feeds]);

  return {
    state,
    viewMode,
    setViewMode,
    themeMode,
    setThemeMode,
    toggleTheme,
    filterOptions,
    setFilterOptions,
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
    savedNews: orderedSavedNews,
    isNewsSaved,
    toggleSaveNews,
  };
};
