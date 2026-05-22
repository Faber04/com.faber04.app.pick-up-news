# <img src="public/pickupnews-mark.svg" width="36" height="36" align="absmiddle" /> PickUpNews

**A web application to read RSS feeds in a single elegant and intuitive interface.**

🌐 **Live Demo**: [www.faber04.com/app/pick-up-news](https://www.faber04.com/app/pick-up-news/)

PickUpNews allows you to easily aggregate and read all your favorite RSS feeds. Manually add your RSS feeds, view news in chronological order or grouped by site, and read full articles with a simple and clean interface.

## ✨ Key Features

- **📡 Smart feed management**: Add/edit/reorder feeds with auto-detection (JSON Feed, RSS, Atom), validation, and duplicate protection.
- **📰 Clean reading experience**: Chronological news list, Home search (title/source/description), pull-down Home refresh, saved articles, full article modal, and a compact sharing submenu.
- **🔔 Notifications**: In-app notification center plus browser push notifications (when supported).
- **📱 PWA-ready**: Installable app with offline support, cache cleanup/update handling, and mobile-first UX.
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
The app has two top-level sections accessible from the header:
- **🏠 Home** — the list of news from your feeds
- **⚙️ Settings** — app info, credits, and access to feed management

On smartphone/tablet, a sticky bottom icon menu is also available:
- **🏠 Home** icon
- **🔀 Sort** icon (toggles Chronological / By Site)
- **⚙️ Settings** icon

### Adding an RSS Feed
1. Open **Settings** from the header
2. Click **"Gestisci Feed"**
3. Click on **"+ Add RSS Feed"**
4. Enter the feed name (e.g., "The Guardian")
5. Enter a website URL or feed URL (e.g., `theguardian.com` or `https://www.theguardian.com/uk/rss`)
6. Click **"Add Feed"**
7. PickUpNews tries automatic detection (JSON Feed first, then RSS/Atom)
8. If no valid feed is detected, the panel stays open and an inline error appears under the URL field
9. Correct the URL and retry without reopening the add panel

### Viewing News
From the **Home** section, you can choose two viewing modes:
- **Chronological**: all news from all feeds sorted by the most recent
- **By Site**: news grouped by source/site

In **By Site** mode:
- Accordions start collapsed by default
- Use **Espandi tutti** / **Comprimi tutti** to quickly control all groups
- Use the `X aperti su Y` counter to keep track of navigation state

### Reading Articles
- Click on any news item to open the full detail
- In the modal, source/date/author metadata stays readable on smaller screens
- Use the **"Read full article"** button to open the original site
- Use **Condividi / Share** to open the share submenu, then pick device share, copy link, Facebook, or X

### Settings and Credits
1. Open **Settings** from the header
2. Use **Gestisci Feed** to access feed add/reorder/edit/remove
3. Use the GitHub link to reach the Faber04 profile
4. Use the sticky breadcrumb to move quickly between **Home**, **Settings**, and nested Settings subpages

### Refreshing Home
1. Open **Home**
2. Pull down on the news list to refresh the latest articles

### Theme Switch
1. On desktop, use the highlighted theme action in the main header menu
2. On mobile, open the hamburger drawer and use the dedicated theme action

### Removing a Feed
1. Open **Settings** from the header
2. Click **"Gestisci Feed"**
3. Click on the 🗑️ icon next to the feed to remove

### Reordering Feeds
1. Open **Settings** from the header
2. Click **"Gestisci Feed"**
3. Use **↑** or **↓** next to a feed to move it up or down
4. Or drag a feed using the **⋮⋮** handle and drop it in the desired position
5. The new order is saved automatically

### Feed Order in Home (By Site)
1. Reorder feeds in **Settings > Gestisci Feed**
2. Go back to **Home** and switch to **By Site**
3. Feed groups will follow the same order configured in Feeds

### Editing a Feed
1. Open **Settings** from the header
2. Click **"Gestisci Feed"**
3. Click the **✏️** icon next to the feed
4. Update name and/or URL
5. Verify the URL status in real time
6. Click **Salva** and confirm
7. The feed is reloaded automatically and "Last updated" is refreshed

### Exporting Feeds
1. Open **Settings** from the header
2. Click **"Gestisci Feed"**
3. Click **"💾 Esporta"**
4. PickUpNews downloads a `.json` file with all configured feeds

### Importing Feeds
1. Open **Settings** from the header
2. Click **"Gestisci Feed"**
3. Import using one of these methods:
4. Click **"📂 Carica"** and select a `.json` file
5. Drag and drop a `.json` file into the import area
6. Imported feeds are appended to the end of the current list
7. Duplicate or invalid entries are skipped automatically

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
