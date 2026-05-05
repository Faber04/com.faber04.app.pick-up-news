import type { ReactNode } from 'react';
import type { NewsItem, RSSFeed, ViewMode, ThemeMode } from './index';
import type { BreadcrumbNode, NavigationActions } from './navigation';

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
  onClearError: () => void;
  onRemoveFeed: (feedId: string) => void;
  onMoveFeed: (feedId: string, direction: 'up' | 'down') => void;
  onMoveFeedToIndex: (feedId: string, targetIndex: number) => void;
  onEditFeed: (feedId: string, updates: { title: string; url: string }) => Promise<boolean>;
  onRefresh: () => Promise<void>;
}

export interface HeaderProps {
  currentPage: 'home' | 'settings';
  themeMode: ThemeMode;
  onToggleTheme: () => void;
  onNavigate: (page: 'home' | 'settings') => void;
  unreadNotificationsCount: number;
  onOpenNotifications: () => void;
}

export interface MobileBottomNavProps {
  currentPage: 'home' | 'settings';
  viewMode: ViewMode;
  onNavigate: (page: 'home' | 'settings') => void;
  onToggleViewMode: () => void;
}

export interface NewsDetailModalProps {
  newsItem: NewsItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export interface NewsListProps {
  news: NewsItem[];
  viewMode: ViewMode;
  feedOrder: string[];
  loading: boolean;
  onNewsClick: (newsItem: NewsItem) => void;
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
  showFeedTitle?: boolean;
  locale: string;
  compact?: boolean;
}

export interface SubpageContainerProps {
  title: string;
  children: ReactNode;
  onBack: () => void;
}

export interface ViewControlsProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}
