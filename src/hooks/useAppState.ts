import { useState, useEffect, useCallback } from 'react';
import { RSSFeed, AppState, ViewMode, FilterOptions } from '../types';
import { RSSService } from '../services';

const STORAGE_KEYS = {
  FEEDS: 'pickUpNews_feeds',
  VIEW_MODE: 'pickUpNews_viewMode',
  THEME: 'pickUpNews_theme'
};

export type ThemeMode = 'light' | 'dark';

export const useAppState = () => {
  const [state, setState] = useState<AppState>({
    feeds: [],
    news: [],
    loading: false,
    error: null
  });

  const [viewMode, setViewMode] = useState<ViewMode>('chronological');
  const [themeMode, setThemeMode] = useState<ThemeMode>('light');
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({});

  // Load data from localStorage on mount
  useEffect(() => {
    const savedFeeds = localStorage.getItem(STORAGE_KEYS.FEEDS);
    const savedViewMode = localStorage.getItem(STORAGE_KEYS.VIEW_MODE);
    const savedThemeMode = localStorage.getItem(STORAGE_KEYS.THEME) as ThemeMode | null;

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
      return;
    }

    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    setThemeMode(prefersDark ? 'dark' : 'light');
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

  const addFeed = useCallback(async (url: string, title: string) => {
    if (!RSSService.validateFeedUrl(url)) {
      setState(prev => ({ ...prev, error: 'Invalid RSS feed URL' }));
      return;
    }

    const normalizedUrl = RSSService.normalizeUrl(url);

    const newFeed: RSSFeed = {
      id: Date.now().toString(),
      url: normalizedUrl,
      title,
      lastFetched: new Date()
    };

    setState(prev => ({
      ...prev,
      feeds: [...prev.feeds, newFeed],
      error: null
    }));

    // Refresh news after adding feed
    await refreshNews();
  }, []);

  const removeFeed = useCallback((feedId: string) => {
    setState(prev => ({
      ...prev,
      feeds: prev.feeds.filter(feed => feed.id !== feedId),
      news: prev.news.filter(news => news.feedId !== feedId)
    }));
  }, []);

  const refreshNews = useCallback(async () => {
    if (state.feeds.length === 0) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const news = await RSSService.fetchAllFeeds(state.feeds);
      setState(prev => ({ ...prev, news, loading: false }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch news'
      }));
    }
  }, [state.feeds]);

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
    refreshNews,
    getFilteredNews,
    clearError
  };
};