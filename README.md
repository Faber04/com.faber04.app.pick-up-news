# <img src="public/pickupnews-mark.svg" width="36" height="36" align="absmiddle" /> PickUpNews

**A web application to read RSS feeds in a single elegant and intuitive interface.**

🌐 **Live Demo**: [www.faber04.com/app/pick-up-news](https://www.faber04.com/app/pick-up-news/)

PickUpNews allows you to easily aggregate and read all your favorite RSS feeds. Manually add your RSS feeds, view news in chronological order or grouped by site, and read full articles with a simple click.

## ✨ Key Features

- **📡 RSS Feed Management**: Easily add and remove RSS feeds manually
- **📅 Chronological View**: See all news sorted by date (most recent first)
- **🏷️ Site View**: Group news by source/site
- **📱 Responsive Design**: Perfect on desktop, tablet, and mobile
- **💾 Local Persistence**: Your feeds are automatically saved in the browser
- **🔍 Smart Preview**: Descriptions truncated to 120 characters for quick reading
- **📖 Full Reading**: Modal with full article and original link
- **⚡ Performance**: Fast loading thanks to Vite and React optimizations

## 🛠️ Technologies Used

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite 4 (fast development and optimized build)
- **Styling**: Tailwind CSS 3 (utility-first CSS framework)
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

Each call is protected by a **10-second timeout** using `AbortController`: if a proxy does not respond within the limit, it automatically switches to the next one. Items are always sorted by descending date (most recent first) with cross-browser normalization of the date format.

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

### v1.2.0
- 🎯 Icon alignment and branding consistency
  - Icon alignment in header and README
  - Visual consistency with PN branding
- 🎨 Dark mode / light mode layout
- 🌈 Restyling based on logo color scale
  - Color palette derived from the PickUpNews logo
  - Consistent application throughout the UI

### v1.2.1
- 📋 Feed sorting in the Feeds section
  - Ability to reorder feeds via drag & drop or arrow buttons
  - Automatic order saving in localStorage
- ✏️ Edit RSS feeds
  - Edit mode for each feed's name and URL
  - Real-time URL validation
  - Save changes with confirmation

### v1.3.0
- 🔍 Auto-detect JSON feeds from websites
  - 🔄 Fallback to RSS/Atom if JSON unavailable
  - ✏️ Manual feed URL input if auto-detection fails
  - 📋 Support for multiple feed format detection

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

### 3. Build for Production
```bash
npm run build
```

Optimized files will be in the `dist/` folder

### 4. Online Deployment
The application will be available at: `https://www.faber04.com/app/pick-up-news/`

## 📖 How to Use PickUpNews

### Navigation
The app has two sections accessible from the header:
- **🏠 Home** — the list of news from your feeds
- **📡 Feeds** — RSS feed management (add and remove)

### Adding an RSS Feed
1. Go to the **Feeds** section (header at the top right)
2. Click on **"+ Add RSS Feed"**
3. Enter the feed name (e.g., "The Guardian")
4. Enter the RSS feed URL (e.g., `https://www.theguardian.com/uk/rss`)
5. Click **"Add Feed"** — the news will automatically appear in Home

### Viewing News
From the **Home** section, you can choose two viewing modes:
- **Chronological**: all news from all feeds sorted by the most recent
- **By Site**: news grouped by source/site

### Reading Articles
- Click on any news item to open the full detail
- Use the **"Read full article"** button to open the original site

### Removing a Feed
1. Go to the **Feeds** section
2. Click on the 🗑️ icon next to the feed to remove

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

## 🤝 Contributions

This project is developed by @Faber04. Feel free to open issues to report bugs or suggest improvements!

## 📄 License

This project is distributed under the MIT license.

---

**Developed by @Faber04**
