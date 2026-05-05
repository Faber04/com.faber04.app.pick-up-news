import type { RSSFeed } from './index';

export interface FeedsPageProps {
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

export interface SettingsPageProps {
  version: string;
  onOpenFeeds: () => void;
  onOpenLanguage: () => void;
  notificationsEnabled: boolean;
  onToggleNotifications: () => Promise<boolean>;
  canInstallPWA: boolean;
  onInstallPWA: () => Promise<boolean>;
}
