# Project State

## Current Status
- Project initialized with Vite React TypeScript template. ✅ COMPLETED
- Basic project structure created with folders: components, pages, services, types, utils. ✅ COMPLETED
- Documentation folder and initial files set up. ✅ COMPLETED
- Dependencies installed: React, custom RSS parser (browser-compatible with rss2json.com CORS proxy), react-router-dom, Tailwind CSS v3. ✅ COMPLETED
- Tailwind configured and build tested successfully. ✅ COMPLETED
- Git repository initialized and commits made. ✅ COMPLETED
- Core RSS reader functionality implemented. ✅ COMPLETED
- UI components created and integrated. ✅ COMPLETED
- State management with localStorage persistence. ✅ COMPLETED
- Development server running and tested. ✅ COMPLETED
- FTP deployment credentials configured and secured. ✅ COMPLETED
- Application successfully deployed to production at https://www.faber04.com/app/pick-up-news/ ✅ COMPLETED
- Critical bug (removeAllListeners error) resolved with custom browser-compatible RSS parser ✅ COMPLETED
- CORS issues resolved with rss2json.com proxy service ✅ COMPLETED
- HTML rendering in news descriptions fixed ✅ COMPLETED
- Page title updated to "Pick-Up News" ✅ COMPLETED

## Objectives
- Implement RSS feed management (add, remove feeds). ✅ COMPLETED
- Create home page with news list (by site or chronological). ✅ COMPLETED
- Implement news detail view. ✅ COMPLETED
- Add responsive design. ✅ COMPLETED
- Integrate RSS parsing. ✅ COMPLETED
- Deploy application to production server. ✅ COMPLETED

## Release History

**v1.0.0** (Commit 70542e5) — Removed api.allorigins.win proxy, simplified CORS chain
**v1.1.1** (Commit 938358d) — URL parsing, UI alignment, XML robustness
**v1.2.0** (PLANNED) — Icon alignment, dark mode, color palette restyling

## Next Steps (Roadmap)

### v1.0.0 ✅ COMPLETED
1. ✅ Removed 1st level CORS proxy (`api.allorigins.win`) from RSS fetching chain
   - Simplified fallback chain to: corsproxy.io → rss2json.com
   - Updated documentation accordingly

### v1.1.1 ✅ COMPLETED
1. ✅ URL parsing without protocol (e.g., `example.com` → `https://example.com`)
   - Modified validateFeedUrl to accept and normalize URLs
   - Add protocol automatically if missing
2. ✅ UI improvements in Feeds section
   - Removed "Feed RSS (n)" title
   - Aligned "+Add Feed RSS" and "Refresh" buttons
3. ✅ Improved XML parsing robustness
   - Better handling of malformed XML
   - HTML error detection (404 fallback to rss2json)
   - BOM removal and whitespace normalization

### v1.2.0 (NEXT)
1. Icon alignment & branding consistency across app
   - Header icons alignment
   - README icon consistency
   - Coerenza branding PN
   - Convert the favicon into an Apple WebApp icon 
2. Implement dark mode / light mode toggle in settings or header
3. Restyling based on app logo color palette
   - Derive color scheme from PickUpNews logo
   - Apply consistently across UI components

### v1.2.1 (PLANNED)
1. Feed sorting capability in Feeds section
   - Drag & drop or arrow buttons for reordering feeds
   - Automatic order persistence in localStorage
2. Feed editing capability
   - Edit mode for feed name and URL
   - Real-time URL validation
   - Save changes with confirmation

### v1.3.0 JSON Feed Auto-Detection (PLANNED)
1.  Auto-detect JSON feeds from websites
  - Fallback to RSS/Atom if JSON unavailable
  - Manual feed URL input if auto-detection fails
  - Support for multiple feed format detection

## Completed Features
- Project scaffolding.
- Documentation structure.
- Dependency setup and configuration.
- Build validation.
- Initial Git commits.
- Core RSS functionality.
- Complete UI implementation.
- State management and persistence.
- Comprehensive README documentation.
- FTP deployment credentials setup.

## Known Issues
- None at this time.

## Dependencies
- React ^18.2.0
- Vite ^4.4.5
- TypeScript ^5.0.2
- rss-parser ^3.13.0
- react-router-dom ^7.14.1
- Tailwind CSS ^3.4.0