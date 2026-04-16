## Release History

### v1.3.0 - 2026-04-16
- Added JSON Feed Auto-Detection feature.

## Next Steps (Roadmap)
- Implement detailed tracking for JSON feed detection.
- Create fallback chains for unsupported feeds.
- Add manual URL input support to enhance user experience for entering feeds directly.

### Implementation Notes
- JSON Feed Detection: The system will automatically identify supported JSON feeds based on common patterns and validate their structure. If a feed is detected, it will be used for content aggregation.
- Fallback Chains: In cases where automatic detection fails, the application will attempt predefined fallback methods to locate a valid feed.
- Manual URL Input: Users will have the option to manually input their feed URL, offering a simple text box in the UI for this feature. This allows users to bypass detection issues by providing the feed directly.