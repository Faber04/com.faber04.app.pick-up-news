/**
 * PickUpNews CORS Proxy — Cloudflare Worker
 *
 * Proxies RSS/HTML fetch requests from the browser, adding CORS headers
 * so feeds can be read without restriction on any origin.
 *
 * Interface (same as corsproxy.io):
 *   GET https://<worker-url>/?url=<encodedTargetUrl>
 *
 * Deploy:
 *   npx wrangler deploy
 *
 * After deploying, set VITE_CORS_PROXY_URL in .env.local:
 *   VITE_CORS_PROXY_URL=https://pickupnews-cors-proxy.<your-subdomain>.workers.dev/?url=
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
  async fetch(request) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    if (request.method !== 'GET') {
      return new Response('Method not allowed', { status: 405, headers: CORS_HEADERS });
    }

    const { searchParams } = new URL(request.url);
    const targetUrl = searchParams.get('url');

    if (!targetUrl) {
      return new Response('Missing required query parameter: url', { status: 400, headers: CORS_HEADERS });
    }

    let parsedTarget;
    try {
      parsedTarget = new URL(targetUrl);
    } catch {
      return new Response('Invalid url parameter', { status: 400, headers: CORS_HEADERS });
    }

    if (!['http:', 'https:'].includes(parsedTarget.protocol)) {
      return new Response('Only http/https URLs are allowed', { status: 400, headers: CORS_HEADERS });
    }

    try {
      const upstream = await fetch(targetUrl, {
        headers: {
          'User-Agent': 'PickUpNews/3.0 RSS Reader (+https://www.faber04.com/app/pick-up-news/)',
          'Accept': 'application/rss+xml, application/atom+xml, application/feed+json, application/json, text/html, */*',
        },
        redirect: 'follow',
      });

      const contentType = upstream.headers.get('Content-Type') || 'text/plain; charset=utf-8';
      const body = await upstream.arrayBuffer();

      return new Response(body, {
        status: upstream.status,
        headers: {
          ...CORS_HEADERS,
          'Content-Type': contentType,
        },
      });
    } catch (err) {
      return new Response(`Proxy fetch error: ${err.message}`, { status: 502, headers: CORS_HEADERS });
    }
  },
};
