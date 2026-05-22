/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/vanillajs" />

interface ImportMetaEnv {
  /** Self-hosted Cloudflare Worker CORS proxy base URL, e.g. https://pickupnews-cors-proxy.xyz.workers.dev/?url= */
  readonly VITE_CORS_PROXY_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
