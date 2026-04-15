# Agent Instructions for PickUpNews Project

## Project Overview
PickUpNews is a React webapp built with Vite and TypeScript for reading RSS feeds. Users can manually add RSS feeds through a dedicated panel. The home page allows viewing feeds by site or all together chronologically. On the home page, display essential news data: title, description (max 120 characters), date, and feed source. Clicking/tapping on a news item shows the complete news with all available data.

## Workflow per Session
At the end of each development session, the AI must perform the following steps:
1. Build the project (`npm run build`) and test the modified, introduced, or corrected functionalities.
2. Commit changes to GitHub repository `com.faber04.app.pick-up-news`.
3. Publish the built application online via FTP.

## Coding Standards
- Use TypeScript for all components and logic.
- Follow React best practices, including hooks and functional components.
- Maintain clean, readable, and well-documented code.
- Use consistent naming conventions (camelCase for variables, PascalCase for components).
- Implement proper error handling and loading states.
- Ensure responsive design for mobile and desktop.

## Project Structure
- `src/components/`: Reusable UI components.
- `src/pages/`: Page components (e.g., Home, NewsDetail).
- `src/services/`: API and RSS parsing services.
- `src/types/`: TypeScript type definitions.
- `src/utils/`: Utility functions.
- `pick-up-news-docs/`: Documentation files.

## Dependencies
- React
- Vite
- TypeScript
- RSS parser library (e.g., rss-parser)
- Any additional libraries as needed for UI, routing, etc.

## Session Management
- Update DEVELOPMENT_LOG.md with session summary.
- Log any errors in ERROR_LOG.md with solutions and prevention measures.
- Update PROJECT_STATE.md with current progress and next objectives.