# <img src="public/pickupnews-mark.svg" width="36" height="36" align="absmiddle" /> PickUpNews

**A web application to read RSS feeds in a single elegant and intuitive interface.**

🌐 **Live Demo**: [www.faber04.com/app/pick-up-news](https://www.faber04.com/app/pick-up-news/)

PickUpNews allows you to easily aggregate and read all your favorite RSS feeds. Manually add your RSS feeds, view news in chronological order or grouped by site, and read full articles with a simple and clean interface.

## ✨ Key Features

- **📡 Smart feed management**: Add/edit/reorder feeds with auto-detection (JSON Feed, RSS, Atom), validation, and duplicate protection.
- **📰 Clean reading experience**: Chronological news list, Home search (title/source/description), saved articles, full article modal, and a compact sharing submenu.
- **🔔 Notifications**: In-app notification center plus browser push notifications (when supported).
- **📱 PWA-ready**: Installable app with offline support, cache cleanup/update handling, and iOS foreground update checks.
- **💾 Import/Export**: Transfer feeds and saved articles using `.json` files.
- **🌍 Localized UI**: Italian and English interface with persistent settings.

## 🛠️ Technologies Used

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite 4 (fast development and optimized build)
- **PWA Support**: `vite-plugin-pwa` v0.14.7 with Workbox 6 (offline caching, manifest, service worker)
- **Styling**: Tailwind CSS 3 (utility-first CSS framework)
- **UI Primitives**: shadcn/ui-style component foundation with `class-variance-authority`, `clsx`, `tailwind-merge`, and Radix Slot
- **RSS Parsing**: Custom XML parser via the browser's native `DOMParser` (supports RSS 2.0 and Atom)
- **Routing**: React Router DOM (for future expansions)
- **State Management**: React Hooks + localStorage
- **Type Checking**: TypeScript 5 (full type safety)

## 🌐 RSS Architecture and CORS Management

RSS feeds are read directly from the browser using a 2-level proxy/fallback chain to maximize availability:

| Level | Service | Method | Item Limit |
|-------|---------|--------|------------|
| 1st (primary) | [corsproxy.io](https://corsproxy.io) | Returns raw XML → parsed with `DOMParser` | All feed items |
| 2nd (final fallback) | [rss2json.com](https://rss2json.com) | Returns pre-parsed JSON | Max 10 items (free tier) |

Each call is protected by a **10-second timeout** using `AbortController`: if a proxy does not respond within the limit, it automatically switches to the next one. Items are always sorted by descending date.

## 🗓️ Roadmap

1. **v1.x — Core RSS reader foundations** ✅  
   Feed CRUD, ordering/editing, auto-detection, resilient parsing, localization base, and UI architecture cleanup.

2. **v2.0 — PWA + notifications** ✅  
   Installable app, offline caching, notification center, and browser notification support.

3. **v2.1 — Data portability** ✅  
   Feed import/export via `.json` and improved management UX.

4. **v2.2 — Product UX maturation** ✅  
   Modern UI refresh, saved articles, and Home search.

5. **v3.0 — Infrastructure hardening** ✅  
   Migration from public CORS proxy to self-hosted Cloudflare Worker.

6. **v3.1 — iOS-native polish** ✅  
   iOS-style visual and interaction refinements across key mobile surfaces.

7. **v3.1.3 — sharing, refresh, and cache updates** ✅  
   Article sharing actions, Home refresh shortcut, and improved PWA update handling.

## Prerequisites

- **Node.js**: Version 18.0.0 or higher
- **npm**: Version 8.0.0 or higher (comes with Node.js)

## 🚀 Installation and Startup

### 1. Clone the Repository
```bash
git clone https://github.com/Faber04/com.faber04.app.pick-up-news.git
cd com.faber04.app.pick-up-news
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start the Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:5173/`

### 4. Build for Production
```bash
npm run build
```

Optimized files will be in the `dist/` folder

### 5. Online Deployment
The application will be available at: `https://www.faber04.com/app/pick-up-news/`

### 6. Autonomous FTP Publish Setup (One Time)
To allow repeatable FTP deployment with a single command:

1. Copy `ftp.env.example` to `INTERNAL/.ftp.env`
2. Fill `FTP_USER`, `FTP_PASS`, `FTP_HOST`, `FTP_BASE`
3. Run:

```bash
npm run deploy
```

Notes:
- `INTERNAL/` is ignored by git, so local credentials are not committed.
- `npm run deploy` performs build + FTP publish.
- FTP publish removes stale files on server (`--delete`), including outdated hashed JS/CSS assets.

## 📖 How to Use PickUpNews

### Navigation
PickUpNews currently has three primary sections:
- **🏠 Home** — latest articles from your feeds
- **⭐ Saved** — articles you bookmarked
- **⚙️ Settings** — preferences, feed management, app info

On desktop, these sections are in the header. On mobile/tablet, the same three sections are available in the sticky bottom bar.

### Add your first feed
1. Open **Settings**
2. Tap **Manage Feeds**
3. Tap the **＋** action
4. Enter feed name and URL (website URL or direct RSS/Atom/JSON Feed URL)
5. Confirm add

PickUpNews tries auto-detection and validates the URL before saving.

### Home: browse and filter news
- Use the search bar to filter by **title**, **source**, or **description**
- Tap a source badge on an article to filter Home by that feed
- Use **Clear** to remove the active feed filter
- Tap **☆ / ★** on a card to save or unsave an article

### Read and share articles
1. Open an article from **Home** or **Saved**
2. In the detail modal, use:
   - **☆ / ★** to save or remove from saved
   - **Read full article** to open the original page
   - **Share** to use device share, copy link, Facebook, or X

### Saved section
- Open **Saved** from header or bottom nav
- All bookmarked items are listed with most recently saved first
- Remove saved status at any time from list cards or article modal

### Notifications
1. Open **Settings**
2. Enable **Browser notifications** (if supported)
3. Use the bell icon in the header to open the notification panel
4. From the panel you can mark all as read or clear all

### Settings and feed management
Inside **Settings** you can:
- Change language (Italian/English)
- Manage feeds (add, refresh, import, export, edit, reorder, remove)
- Install the PWA when available
- Open app info, repository link, and app version

### Import / Export
- **Export** creates a `.json` transfer file
- **Import** accepts a PickUpNews `.json` file via picker or drag & drop
- Duplicate or invalid feed entries are skipped automatically
- Saved articles included in the transfer file are imported too

### Theme
Use the theme toggle (☀️/🌙) in the header to switch between light and dark mode.

## 📁 Project Structure

```
com.faber04.app.pick-up-news/
├── public/                 # Static files
├── src/
│   ├── components/         # Reusable React components
│   │   ├── AddFeedForm.tsx # Form to add feeds
│   │   ├── FeedList.tsx    # List of configured feeds
│   │   ├── NewsList.tsx    # List of news
│   │   ├── ViewControls.tsx # View controls (chronological/by site)
│   │   └── NewsDetailModal.tsx # News detail modal
│   ├── hooks/              # Custom React hooks
│   │   └── useAppState.ts  # App state management hook
│   ├── services/           # Services and APIs
│   │   └── rss.ts          # RSS parsing service
│   ├── types/              # TypeScript definitions
│   │   └── index.ts        # Types for RSS and app state
│   └── utils/              # Helper utilities
├── pick-up-news-docs/      # Project documentation
│   ├── AGENT_INSTRUCTIONS.md
│   ├── DEVELOPMENT_LOG.md
│   ├── ERROR_LOG.md
│   ├── PROJECT_STATE.md
│   └── SESSION_TEMPLATE.md
└── README.md
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint for code checks
- `npm run publish:ftp` - Publish current `dist/` to FTP (requires `INTERNAL/.ftp.env`)
- `npm run deploy` - Build and publish to FTP

## 🤝 Contributions

This project is developed by @Faber04. Feel free to open issues to report bugs or suggest improvements!

## 📄 License

This project is distributed under the MIT license.

---

**Developed by @Faber04**
