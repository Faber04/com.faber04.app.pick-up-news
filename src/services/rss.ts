import { RSSFeed, RSSItem, NewsItem } from '../types';

export class RSSService {
  private static readonly RSS2JSON_API = 'https://api.rss2json.com/v1/api.json';
  private static readonly ALLORIGINS_API = 'https://api.allorigins.win/get';

  // Normalize date strings to ISO format for cross-browser compatibility
  private static normalizeDate(dateStr: string): string {
    if (!dateStr) return '';
    // Convert "YYYY-MM-DD HH:MM:SS" (space) to ISO "YYYY-MM-DDTHH:MM:SS"
    return dateStr.replace(/^(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}:\d{2})/, '$1T$2');
  }

  private static parseDate(dateStr: string): Date {
    if (!dateStr) return new Date(0);
    const normalized = this.normalizeDate(dateStr);
    const d = new Date(normalized);
    return isNaN(d.getTime()) ? new Date(0) : d;
  }

  // Parse RSS/Atom XML directly using DOMParser
  static parseXML(xml: string): RSSItem[] {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, 'application/xml');

    // Check for parse errors
    if (doc.querySelector('parsererror')) {
      throw new Error('Invalid XML');
    }

    const items: RSSItem[] = [];

    // RSS 2.0
    const rssItems = doc.querySelectorAll('item');
    if (rssItems.length > 0) {
      rssItems.forEach(item => {
        const getText = (tag: string) => item.querySelector(tag)?.textContent?.trim() || '';
        const pubDate = getText('pubDate');
        items.push({
          title: getText('title'),
          link: getText('link') || item.querySelector('link')?.getAttribute('href') || '',
          contentSnippet: getText('description'),
          summary: getText('description'),
          pubDate,
          isoDate: pubDate,
          guid: getText('guid') || getText('link'),
          creator: getText('dc\\:creator') || getText('author') || '',
          categories: Array.from(item.querySelectorAll('category')).map(c => c.textContent?.trim() || ''),
        });
      });
      return items;
    }

    // Atom feed
    const atomEntries = doc.querySelectorAll('entry');
    atomEntries.forEach(entry => {
      const getText = (tag: string) => entry.querySelector(tag)?.textContent?.trim() || '';
      const pubDate = getText('updated') || getText('published');
      const link = entry.querySelector('link[rel="alternate"]')?.getAttribute('href')
        || entry.querySelector('link')?.getAttribute('href')
        || '';
      items.push({
        title: getText('title'),
        link,
        contentSnippet: getText('summary') || getText('content'),
        summary: getText('summary') || getText('content'),
        pubDate,
        isoDate: pubDate,
        guid: getText('id') || link,
        creator: getText('author name') || getText('name') || '',
        categories: [],
      });
    });

    return items;
  }

  // Fetch via allorigins (returns full XML, no item limit)
  static async fetchViaProxy(url: string): Promise<RSSItem[]> {
    const apiUrl = `${this.ALLORIGINS_API}?url=${encodeURIComponent(url)}&charset=UTF-8`;
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error(`Proxy HTTP error: ${response.status}`);
    const data = await response.json();
    if (!data.contents) throw new Error('Empty response from proxy');
    return this.parseXML(data.contents);
  }

  // Fallback: fetch via rss2json (max 10 items, but reliable)
  static async fetchViaRss2json(url: string): Promise<RSSItem[]> {
    const apiUrl = `${this.RSS2JSON_API}?rss_url=${encodeURIComponent(url)}`;
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error(`rss2json HTTP error: ${response.status}`);
    const data = await response.json();
    if (data.status !== 'ok') throw new Error(`rss2json error: ${data.message || 'Unknown error'}`);
    return this.parseRSS2JSONFeed(data);
  }

  static async fetchFeed(url: string): Promise<RSSItem[]> {
    try {
      return await this.fetchViaProxy(url);
    } catch (proxyError) {
      console.warn('allorigins proxy failed, falling back to rss2json:', proxyError);
      try {
        return await this.fetchViaRss2json(url);
      } catch (error) {
        console.error('Error fetching RSS feed:', error);
        throw new Error(`Failed to fetch RSS feed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
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
      }
    }

    // Sort by date, newest first — using normalized date parsing
    return allNews.sort((a, b) => {
      const dateA = this.parseDate(a.isoDate || a.pubDate || '');
      const dateB = this.parseDate(b.isoDate || b.pubDate || '');
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