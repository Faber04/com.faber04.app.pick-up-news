# Error Log

This file documents all errors encountered during development, their solutions, and how to prevent them in the future.

## Error Format
- Date: [Date]
- Error Description: [What happened]
- Cause: [Why it happened]
- Solution: [How it was fixed]
- Prevention: [How to avoid in the future]

---

## Error: Blank page after FTP deploy — empty JS bundle on server
- Date: 15 April 2026
- Error Description: App shows blank white page in production with no console errors. The JS bundle `index-*.js` served by the FTP server had 0 bytes despite the local `dist/assets/` file being correct (161 KB).
- Cause: `lftp mirror -R` timed out mid-transfer during the first deploy attempt, leaving an empty/truncated JS file on the server. The FTP timeout was too short for large files on a slow connection.
- Solution: Re-ran build (`npm run build`), then re-uploaded all files using `lftp put` with `set net:timeout 60` and `set net:max-retries 3`. Also cleaned the remote folder before uploading to remove stale assets.
- Prevention: Always verify the remote file size after FTP deploy with `curl -s <url> | wc -c`. Use `lftp put` instead of `mirror` for individual large files to avoid silent partial uploads.

---

## Error: TypeError: this.removeAllListeners is not a function (FINAL RESOLUTION)
- Date: 15 April 2026
- Error Description: Application crashed with TypeError when trying to parse RSS feeds. Error occurred in compiled JavaScript at assets-index-*.js files
- Cause: rss-parser is a Node.js library that uses server-side modules (http, https, events, streams) which are not available in browsers
- Solution: Replaced rss-parser with a custom browser-compatible RSS parser using native fetch() and DOMParser APIs
- Prevention: Always use browser-compatible libraries for client-side applications. Test RSS parsing functionality thoroughly before deployment

---

## Error: CORS Policy Block
- Date: 15 April 2026
- Error Description: Browser blocked RSS feed requests due to CORS policy when trying to fetch feeds from external domains like theguardian.com
- Cause: Direct fetch requests from browser to external RSS feeds blocked by same-origin policy
- Solution: Implemented rss2json.com service as CORS proxy - converts RSS feeds to JSON and handles CORS automatically
- Prevention: Always use CORS-compatible services or proxies for external API calls in browser applications

---

## Error: Network Connection Lost on RSS Proxy Fetch
- Date: 15 April 2026
- Error Description: "[Error] Failed to load resource: The network connection was lost. (get, line 0)" — browser could not reach the allorigins.win CORS proxy, causing feed loading to silently fail
- Cause: api.allorigins.win is an external free proxy that can be intermittently unreliable, slow, or temporarily unreachable. No timeout was set, so requests could hang indefinitely before the browser dropped them.
- Solution: Added `fetchWithTimeout()` (10s AbortController timeout) to all outbound fetch calls; added `corsproxy.io` as a second proxy in the fallback chain (allorigins → corsproxy.io → rss2json)
- Prevention: Always wrap external proxy calls with a timeout. Use a multi-proxy fallback chain so a single unreliable service does not break the entire feature.

---
- Date: 15 April 2026
- Error Description: News descriptions displayed raw HTML tags instead of formatted text in both news list and detail modal
- Cause: RSS feeds contain HTML content but app was rendering descriptions as plain text
- Solution: Implemented dangerouslySetInnerHTML for description rendering and improved HTML truncation logic to handle tags safely
- Prevention: Always check content type when displaying user-generated content and use appropriate rendering methods

---