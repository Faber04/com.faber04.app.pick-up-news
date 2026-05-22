import type { ReactNode } from 'react';
import type { NewsItem, RSSFeed, ViewMode, ThemeMode } from './index';
import type { BreadcrumbNode, NavigationActions } from './navigation';

export type PrimaryPage = 'home' | 'saved' | 'settings';

export interface AddFeedFormProps {
  onAddFeed: (url: string, title: string) => Promise<boolean>;
  loading: boolean;
  error?: string | null;
  onClearError?: () => void;
  onClose?: () => void;
}

export interface BreadcrumbProps {
  trail: BreadcrumbNode[];
  onNavigate: NavigationActions;
}

export interface FeedListProps {
  feeds: RSSFeed[];
  onRemoveFeed: (feedId: string) => void;
  onMoveFeed: (feedId: string, direction: 'up' | 'down') => void;
  onMoveFeedToIndex: (feedId: string, targetIndex: number) => void;
  onEditFeed: (feedId: string, updates: { title: string; url: string }) => Promise<boolean>;
}

export interface FeedsContentProps {
  feeds: RSSFeed[];
  loading: boolean;
  addFeedError: string | null;
  onAddFeed: (url: string, title: string) => Promise<boolean>;
  onExportFeeds: () => boolean;
  onImportFeeds: (file: File) => Promise<{ added: number; skipped: number; savedAdded: number }>;
  onClearError: () => void;
  onRemoveFeed: (feedId: string) => void;
  onMoveFeed: (feedId: string, direction: 'up' | 'down') => void;
  onMoveFeedToIndex: (feedId: string, targetIndex: number) => void;
  onEditFeed: (feedId: string, updates: { title: string; url: string }) => Promise<boolean>;
  onRefresh: () => Promise<void>;
}

export interface HeaderProps {
  currentPage: PrimaryPage;
  themeMode: ThemeMode;
  onToggleTheme: () => void;
  onNavigate: (page: PrimaryPage) => void;
  unreadNotificationsCount: number;
  onOpenNotifications: () => void;
}

export interface MobileBottomNavProps {
  currentPage: PrimaryPage;
  onNavigate: (page: PrimaryPage) => void;
}

export interface NewsDetailModalProps {
  newsItem: NewsItem | null;
  isOpen: boolean;
  onClose: () => void;
  isSaved: boolean;
  onToggleSave: (newsItem: NewsItem) => void;
  onCopyLink: () => void;
}

export interface NewsListProps {
  news: NewsItem[];
  loading: boolean;
  onNewsClick: (newsItem: NewsItem) => void;
  onToggleSave: (newsItem: NewsItem) => void;
  isNewsSaved: (newsItem: NewsItem) => boolean;
  isLatestNews?: (newsItem: NewsItem) => boolean;
  activeFeedId?: string;
  onFeedFilterChange?: (feedId?: string) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export interface FeedAccordionProps {
  feedId: string;
  feedTitle: string;
  feedNews: NewsItem[];
  isOpen: boolean;
  onToggle: (feedId: string) => void;
  onNewsClick: (newsItem: NewsItem) => void;
  locale: string;
}

export interface NewsCardProps {
  newsItem: NewsItem;
  onClick: (newsItem: NewsItem) => void;
  onToggleSave: (newsItem: NewsItem) => void;
  isSaved: boolean;
  showFeedTitle?: boolean;
  locale: string;
  compact?: boolean;
}

export interface SubpageContainerProps {
  title: string;
  children: ReactNode;
  onBack?: () => void;
}

export interface ViewControlsProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}
