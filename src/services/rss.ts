import { RSSFeed, RSSItem, NewsItem } from '../types';

export class RSSService {
  private static readonly RSS2JSON_API = 'https://api.rss2json.com/v1/api.json';

  static async fetchFeed(url: string): Promise<RSSItem[]> {
    try {
      // Use rss2json service to bypass CORS
      const apiUrl = `${this.RSS2JSON_API}?rss_url=${encodeURIComponent(url)}`;
      const response = await fetch(apiUrl);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status !== 'ok') {
        throw new Error(`RSS API error: ${data.message || 'Unknown error'}`);
      }

      return this.parseRSS2JSONFeed(data);
    } catch (error) {
      console.error('Error fetching RSS feed:', error);
      throw new Error(`Failed to fetch RSS feed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static parseRSS2JSONFeed(data: any): RSSItem[] {
    if (!data.items || !Array.isArray(data.items)) {
      return [];
    }

    return data.items.map((item: any) => ({
      title: item.title || '',
      link: item.link || '',
      contentSnippet: item.description || '',
      summary: item.description || '',
      pubDate: item.pubDate || '',
      isoDate: item.pubDate || '',
      guid: item.guid || item.link || '',
      creator: item.author || '',
      categories: item.categories || [],
    }));
  }

  static async fetchAllFeeds(feeds: RSSFeed[]): Promise<NewsItem[]> {
    const allNews: NewsItem[] = [];

    for (const feed of feeds) {
      try {
        const items = await this.fetchFeed(feed.url);
        const newsItems: NewsItem[] = items.map(item => ({
          ...item,
          feedId: feed.id,
          feedTitle: feed.title,
          truncatedDescription: this.truncateDescription(item.contentSnippet || item.summary || '', 120)
        }));
        allNews.push(...newsItems);
      } catch (error) {
        console.error(`Error fetching feed ${feed.title}:`, error);
        // Continue with other feeds
      }
    }

    // Sort by date (newest first)
    return allNews.sort((a, b) => {
      const dateA = new Date(a.isoDate || a.pubDate || 0);
      const dateB = new Date(b.isoDate || b.pubDate || 0);
      return dateB.getTime() - dateA.getTime();
    });
  }

  static truncateDescription(htmlText: string, maxLength: number): string {
    // Remove HTML tags to get plain text
    const plainText = htmlText.replace(/<[^>]*>/g, '');
    if (plainText.length <= maxLength) return htmlText;

    // Truncate plain text
    const truncated = plainText.substring(0, maxLength).trim();

    // Find the corresponding position in HTML text
    let htmlPos = 0;
    let textPos = 0;
    const result = [];

    while (htmlPos < htmlText.length && textPos < truncated.length) {
      if (htmlText[htmlPos] === '<') {
        // Copy the entire tag
        const tagEnd = htmlText.indexOf('>', htmlPos);
        if (tagEnd === -1) break;
        result.push(htmlText.substring(htmlPos, tagEnd + 1));
        htmlPos = tagEnd + 1;
      } else {
        result.push(htmlText[htmlPos]);
        htmlPos++;
        textPos++;
      }
    }

    // Close any unclosed tags (simple approach)
    const openTags = [];
    const tagRegex = /<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/g;
    let match;

    while ((match = tagRegex.exec(result.join(''))) !== null) {
      const tag = match[0];
      const tagName = match[1];

      if (tag.startsWith('</')) {
        // Closing tag
        if (openTags.length > 0 && openTags[openTags.length - 1] === tagName) {
          openTags.pop();
        }
      } else if (!tag.endsWith('/>') && !['br', 'img', 'input', 'meta', 'link'].includes(tagName.toLowerCase())) {
        // Opening tag (not self-closing)
        openTags.push(tagName);
      }
    }

    // Add closing tags for any remaining open tags
    while (openTags.length > 0) {
      const tagName = openTags.pop();
      result.push(`</${tagName}>`);
    }

    return result.join('') + '...';
  }

  static validateFeedUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}