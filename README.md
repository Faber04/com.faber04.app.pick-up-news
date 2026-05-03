# <img src="public/pickupnews-mark.svg" width="36" height="36" align="absmiddle" /> PickUpNews

**A web application to read RSS feeds in a single elegant and intuitive interface.**

🌐 **Live Demo**: [www.faber04.com/app/pick-up-news](https://www.faber04.com/app/pick-up-news/)

PickUpNews allows you to easily aggregate and read all your favorite RSS feeds. Manually add your RSS feeds, view news in chronological order or grouped by site, and read full articles with a simple and clean interface.

## ✨ Key Features

- **📡 RSS Feed Management**: Easily add and remove RSS feeds manually
- **🌍 Bilingual UI Foundation**: Interface available in Italian and English with persistent language preference
- **🏳️ Language Settings**: Dedicated Settings subpage for language selection with flag + native label
- **🧱 UI Refresh Foundation**: New reusable UI primitives for buttons, cards, and alerts now drive the first v1.4.9 refreshed surfaces
- **↕️ Feed Ordering**: Reorder feeds in the Feeds page and keep order persisted in localStorage
- **🖱️ Drag & Drop Ordering**: Reorder feeds by dragging directly in the Feeds page
- **📲 Touch Drag & Drop**: Feed drag & drop sorting also works on mobile touch devices
- **✏️ Feed Editing**: Edit feed name and URL with real-time URL validation and save confirmation
- **🔄 Instant Feed Reload on Edit**: Saving feed edits reloads the feed and updates "Last updated"
- **🧠 Auto Feed Detection**: Enter a website URL and PickUpNews auto-detects JSON Feed first, then RSS/Atom
- **🧯 Inline Add Feed Errors**: If detection fails, the add panel stays open and shows an inline URL error (no modal alerts)
- **🛑 Duplicate Protection**: Duplicate feed URLs are blocked with immediate inline feedback
- **🧩 Multi-Format Support**: Native support for JSON Feed, RSS 2.0, and Atom feeds
- **⚙️ Settings Hub**: Menu first, mobile-first settings page with top actions for theme and feed management
- **🧭 Breadcrumb Navigation**: Sticky breadcrumb for fast movement between pages and nested subpages
- **📅 Chronological View**: See all news sorted by date (most recent first)
- **🏷️ Site View**: Group news by source/site
- **🗂️ Collapsed By-Site Start**: In "By Site" view, all accordions start collapsed to improve navigation with many feeds
- **🧰 By-Site Controls**: "Espandi tutti" / "Comprimi tutti" quick actions and open/total counter
- **💾 Accordion State Persistence**: Open/closed state per feed is remembered in localStorage
- **🧭 Consistent Source Order**: In "By Site" mode, Home follows the same order configured in Feeds
- **🧱 Mobile Navigation Drawer**: On mobile, navigation opens as a right-side drawer with overlay
- **🗓️ Compact Article Metadata**: Article modal uses compact `DD/MM/YY (HH:MM)` date format and wraps metadata cleanly on mobile
- **📱 Responsive Design**: Perfect on desktop, tablet, and mobile
- **💾 Local Persistence**: Your feeds are automatically saved in the browser
- **🔍 Smart Preview**: Descriptions truncated to 120 characters for quick reading
- **📖 Full Reading**: Modal with full article and original link
- **⚡ Parallel Feed Detection**: Candidate probes run concurrently — detection worst case is O(timeout) regardless of candidate count
- **⚡ Performance**: Fast loading thanks to Vite and React optimizations

## 🛠️ Technologies Used

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite 4 (fast development and optimized build)
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

### v1.0.0 ✅
- ✅ Removed 1st level CORS management (`api.allorigins.win`)
  - Reduces external dependencies and simplifies the fallback chain
  - Chain: corsproxy.io → rss2json.com

### v1.1.1 ✅
- ✅ URL parsing without protocol (e.g., `example.com` → `https://example.com`)
- ✅ UI improvements in the Feeds section
  - Removed "Feed RSS (n)" title
  - Aligned "+Add" and "Refresh" buttons
- ✅ Robust XML parsing and HTML error detection

### v1.2.0 ✅
- ✅ Icon alignment and branding consistency
  - ✅ Icon alignment in header and README
  - ✅ Visual consistency with PN branding
- ✅ Dark mode / light mode layout
- ✅ Restyling based on logo color scale
  - ✅ Color palette derived from the PickUpNews logo
  - ✅ Consistent application throughout the UI

### v1.2.1 ✅
- ✅ Feed sorting in the Feeds section
  - Reorder feeds via up/down arrow buttons
  - Automatic order saving in localStorage
- ✅ RSS feed editing
  - Edit mode for each feed's name and URL
  - Real-time URL validation
  - Save changes with confirmation

### v1.2.2 ✅
- ✅ Feed sorting via drag & drop in the Feeds section
- ✅ "By Site" order in Home aligned with the feed order configured in Feeds

### v1.2.3 ✅
- ✅ Mobile Feeds layout fix: action controls moved under metadata/"Last updated"
- ✅ Touch drag & drop support for feed ordering on mobile
- ✅ Feed edit save now triggers feed reload and updates "Last updated"

### v1.3.0 ✅
- ✅ Auto-detect feeds from website URLs
  - ✅ Priority to JSON Feed detection
  - ✅ Fallback to RSS/Atom when JSON is unavailable
  - ✅ Manual URL fallback if auto-detection does not find a feed
  - ✅ Multi-format detection support (JSON Feed, RSS, Atom)

### v1.3.1 ✅
- ✅ Feed add flow hardening
  - ✅ Prevent duplicate feed insertions — instant inline feedback
  - ✅ Add panel stays open on failure with inline error under URL field (no modal alerts)
  - ✅ HTML candidate discovery + path-segment probing for broader site coverage
  - ✅ Parallel candidate probing via `firstSuccess()` — detection worst case drops from O(n × timeout) to O(timeout)

### v1.4.0 ✅
- ✅ Settings page creation
- ✅ Credits in the settings page
  - ✅ App created by Faber04 with link to the GitHub profile
  - ✅ Version number
  - ✅ Copyright and year
- ✅ Mobile layout adjustment
  - ✅ In the selected article modal, metadata wraps onto multiple lines
  - ✅ Compact date format: `DD/MM/YY (HH:MM)`
- ✅ Mobile navigation drawer
  - ✅ On mobile, nav menu slides in from the right instead of dropping down from the top

### v1.4.1 ✅
- 🗑️ Removed "Tema" (dark/light toggle) from the mobile lateral drawer
- 🧹 Removed "Versione" and "Autore" fields from the "Informazioni app e crediti" panel in Settings
- 🔀 Merged the two Settings boxes into a single "Informazioni app e crediti" panel
- 📂 Moved the main "Feed" menu item into the Settings page (no longer a top-level nav entry)
- 🌙 Moved dark/light theme toggle to Settings; removed all other occurrences from the UI

### v1.4.2 ✅
- ✅ Home empty-state CTA updated from "Vai a Settings" to "Aggiungi un feed RSS" (direct access to Settings > Gestisci Feed)
- ✅ Settings layout flattened: removed nested PickUpNews card and removed logo/title/subtitle block
- ✅ Settings top actions are now full-width menu actions: theme toggle + "Gestisci Feed"
- ✅ "Gestione Feed" converted into a nested Settings subpage
- ✅ Introduced scalable stack-based breadcrumb navigation for nested pages/subpages
- ✅ Added sticky top breadcrumb for mobile-first navigation between sections and sub-sections

### v1.4.3 ✅
- ✅ Removed dark/light toggle from Settings page
- ✅ Added dark/light toggle to main header navigation and mobile hamburger drawer
- ✅ Styled theme action as a distinct menu control to visually separate it from regular navigation items

### v1.4.4 ✅
- ✅ In **By Site** view, feed accordions now start collapsed by default
- ✅ Added global controls: **Espandi tutti** and **Comprimi tutti**
- ✅ Added live counter: `X aperti su Y`
- ✅ Persisted accordion open/closed state by feed via localStorage

### v1.4.5 ✅
- ✅ Fixed production crash (`Minified React error #310`) caused by hook-order mismatch in `NewsList`
- ✅ Kept by-site accordion UX behavior unchanged after fix

### v1.4.6 ✅
- ✅ Fixed the `orderedGroups` dependency warning in `NewsList`
- ✅ Memoized by-site derived collections to keep dependencies stable across renders
- ✅ Kept existing by-site behavior unchanged while reducing internal React noise

### v1.4.7 ✅
- ✅ Centralized component and page prop interfaces into dedicated `src/types/*` modules
- ✅ Moved shared `ThemeMode` typing into the common type layer
- ✅ Tightened navigation param typing from `any` to `unknown`
- ✅ Kept runtime behavior unchanged; structural TypeScript refactor only

### v1.4.8 ✅
- ✅ Added app localization foundation for Italian and English with persistent language selection
- ✅ Added a Settings > Language nested subpage using the existing breadcrumb stack
- ✅ Introduced centralized JSON locale dictionaries for visible UI labels
- ✅ Added language picker with flag + native language label, ready for future variants such as `English (UK)` and `English (US)`

### v1.4.9 ✅
- 🎨 UI refresh using a shadcn/ui-style foundation
  - ✅ Added reusable Button, Card, and Alert primitives
  - ✅ Added reusable Input primitive and completed migration of the replaceable legacy UI components
  - ✅ Refreshed Header, Settings, Home empty state, feed management, breadcrumbs, language selection, news cards, and article modal with the new component layer
  - ✅ Replaced custom by-site accordion with Radix/shadcn accordion primitive
  - ✅ Improved grouped news readability with optimized spacing/padding

### v1.4.10 ✅
- ✅ Enhanced visual emphasis on article hover/tap in Home page
  - `scale` + `hover:-translate-y-1` transforms and increased shadow intensity on hover
  - `active:scale-95` for immediate tap feedback on mobile
- ✅ Fixed news modal layout for long articles
  - Modal refactored with scrollable content area + fixed footer button
  - "Read full article" button is always visible regardless of article length
- ✅ Aligned mobile navigation button colors with desktop and other views

### v2.1.0
- 📥 Export feeds to JSON file
  - Download all feeds with title and URL as a JSON file
  - Export format now uses a custom extension: `.pickupnews`
- 📤 Import feeds from JSON file
  - Load previously exported feeds
  - Feeds added to the end of existing feeds list
  - Duplicate detection by feed URL
  - Feeds with duplicate URL are skipped
- 🔁 File sharing across devices (including AirDrop)
  - The exported `.pickupnews` file can be shared across devices, including via AirDrop on iOS
  - On iOS, the received file can be saved in Files or shared using system options
  - The file can then be imported in the PickUp News PWA through the in-app import function (drag and drop or file picker)
  - Note: as a PWA, direct automatic file opening/import via AirDrop is not supported on iOS; users must select the `.pickupnews` file manually from the PWA

### v2.0.0
- 📲 Installable PWA
  - `manifest.json` with app name, icons, theme color, and `standalone` display mode
  - Service Worker for offline caching of shell assets
  - Install prompt surfaced on supported browsers (Android Chrome, desktop Chromium)
- 🔔 Push alert subscription
  - Settings toggle to enable/disable browser push notifications
  - Web Push API with VAPID keys to subscribe the user's browser
  - Push notification triggered when a feed refresh detects new articles since the last visit
- 🗃️ In-app notification center
  - Bell icon in the header with unread badge count
  - Notification panel (side panel or dropdown) listing recent alerts
  - Each entry shows: feed name, article title, and timestamp
  - Notifications persisted in localStorage and cleared when read
  - "Mark all as read" action in the notification panel

### v3.0.0
- 🔧 Replace `corsproxy.io` with a self-hosted Cloudflare Worker
  - `corsproxy.io` free tier is limited to localhost; production requests may be blocked
  - Cloudflare Worker proxies RSS/HTML fetch requests with CORS headers
  - `rss2json.com` remains as secondary fallback
  - Worker script in `workers/` folder, deployed on Cloudflare free plan (100k req/day)

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

## 📖 How to Use PickUpNews

### Navigation
The app has two top-level sections accessible from the header:
- **🏠 Home** — the list of news from your feeds
- **⚙️ Settings** — app info, credits, and access to feed management

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

### Settings and Credits
1. Open **Settings** from the header
2. Use **Gestisci Feed** to access feed add/reorder/edit/remove
3. Use the GitHub link to reach the Faber04 profile
4. Use the sticky breadcrumb to move quickly between **Home**, **Settings**, and nested Settings subpages

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