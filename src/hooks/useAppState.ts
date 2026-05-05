import { useState, useEffect, useCallback, useRef } from 'react';
import { RSSFeed, AppState, ViewMode, FilterOptions, ThemeMode, AppNotification, NewsItem } from '../types';
import { RSSService } from '../services';
import type { LocaleDictionary } from '../i18n';

const STORAGE_KEYS = {
  FEEDS: 'pickUpNews_feeds',
  VIEW_MODE: 'pickUpNews_viewMode',
  THEME: 'pickUpNews_theme',
  NOTIFICATIONS: 'pickUpNews_notifications',
  SEEN_GUIDS: 'pickUpNews_seenGuids',
  NOTIFICATIONS_ENABLED: 'pickUpNews_notificationsEnabled',
};

const MAX_NOTIFICATIONS = 50;

const getArticleGuid = (item: NewsItem): string =>
  item.guid || item.link || item.title || '';

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

  // Load data from localStorage on mount
  useEffect(() => {
    const savedFeeds = localStorage.getItem(STORAGE_KEYS.FEEDS);
    const savedViewMode = localStorage.getItem(STORAGE_KEYS.VIEW_MODE);
    const savedThemeMode = localStorage.getItem(STORAGE_KEYS.THEME) as ThemeMode | null;
    const savedNotifications = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    const savedNotificationsEnabled = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS_ENABLED);
    const savedSeenGuids = localStorage.getItem(STORAGE_KEYS.SEEN_GUIDS);

    if (savedFeeds) {
      try {
        const feeds = JSON.parse(savedFeeds);
        setState(prev => ({ ...prev, feeds }));
      } catch (error) {
        console.error('Error loading feeds from localStorage:', error);
      }
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

      return true;
    } finally {
      pendingAddUrlsRef.current.delete(normalizedKey);
      pendingAddUrlsRef.current.delete(finalKey);
    }
  }, [messages, state.feeds]);

  const removeFeed = useCallback((feedId: string) => {
    setState(prev => ({
      ...prev,
      feeds: prev.feeds.filter(feed => feed.id !== feedId),
      news: prev.news.filter(news => news.feedId !== feedId)
    }));
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

  const refreshNews = useCallback(async () => {
    if (state.feeds.length === 0) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

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
            const body = newArticles
              .slice(0, 3)
              .map(a => a.title)
              .filter(Boolean)
              .join('\n');
            new Notification(`PickUpNews — ${newArticles.length} nuov${newArticles.length === 1 ? 'o articolo' : 'i articoli'}`, {
              body,
              icon: '/app/pick-up-news/pickupnews-mark.svg',
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
    }
  }, [messages.fetchNewsFailed, state.feeds, notificationsEnabled]);

  // ── Notification actions ──
  const markAllNotificationsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
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
      filtered = filtered.filter(news =>
        news.title?.toLowerCase().includes(term) ||
        news.truncatedDescription.toLowerCase().includes(term)
      );
    }

    return filtered;
  }, [state.news, filterOptions]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeMode(prev => (prev === 'light' ? 'dark' : 'light'));
  }, []);

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
    notifications,
    notificationsEnabled,
    markAllNotificationsRead,
    clearAllNotifications,
    toggleNotifications,
  };
};