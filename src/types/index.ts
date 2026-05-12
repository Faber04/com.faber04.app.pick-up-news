// RSS Feed types
export interface RSSFeed {
  id: string;
  url: string;
  title: string;
  description?: string;
  lastFetched?: Date;
  error?: string;
}

// RSS Item types (from rss-parser)
export interface RSSItem {
  title?: string;
  link?: string;
  pubDate?: string;
  creator?: string;
  summary?: string;
  content?: string;
  contentSnippet?: string;
  guid?: string;
  isoDate?: string;
  categories?: string[];
  enclosure?: {
    url: string;
    length?: number;
    type?: string;
  };
}

// Extended RSS Item with feed info
export interface NewsItem extends RSSItem {
  feedId: string;
  feedTitle: string;
  truncatedDescription: string; // max 120 chars
}

export interface SavedNewsItem extends NewsItem {
  savedAt: string; // ISO date string
}

// App state types
export interface AppState {
  feeds: RSSFeed[];
  news: NewsItem[];
  loading: boolean;
  error: string | null;
}

// View modes
export type ViewMode = 'chronological' | 'by-feed';

// Theme mode
export type ThemeMode = 'light' | 'dark';

// UI language
export type LanguageCode = 'it' | 'en';

// Filter options
export interface FilterOptions {
  feedId?: string;
  searchTerm?: string;
}

// Feed detection type
export type FeedFormat = 'json' | 'rss' | 'atom';

export interface FeedDetectionResult {
  feedUrl: string;
  format: FeedFormat;
}

// In-app notification
export interface AppNotification {
  id: string;
  feedId: string;
  feedTitle: string;
  articleTitle: string;
  articleLink?: string;
  timestamp: string; // ISO date string
  read: boolean;
}

// Navigation types
export type { BreadcrumbNode, NavigationState, NavigationActions } from './navigation';

// JSON Feed Format (https://jsonfeed.org/version/1.1)
export interface JSONFeedAuthor {
  name?: string;
  url?: string;
  avatar?: string;
}

export interface JSONFeedItem {
  id: string;
  content_html?: string;
  content_text?: string;
  summary?: string;
  title?: string;
  url?: string;
  external_url?: string;
  date_published?: string;
  date_modified?: string;
  author?: JSONFeedAuthor;
  tags?: string[];
}

export interface JSONFeedData {
  version?: string;
  title?: string;
  items?: JSONFeedItem[];
}

// RSS2JSON API Response (https://rss2json.com/api-spec)
export interface RSS2JSONItem {
  title?: string;
  description?: string;
  link?: string;
  author?: string;
  pubDate?: string;
  guid?: string;
  categories?: string[];
}

export interface RSS2JSONResponse {
  status: string;
  feed?: {
    url?: string;
  };
  feed_url?: string;
  message?: string;
  items?: RSS2JSONItem[];
}
