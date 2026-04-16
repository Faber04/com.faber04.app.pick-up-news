import { RSSFeed } from '../types';

interface FeedListProps {
  feeds: RSSFeed[];
  onRemoveFeed: (feedId: string) => void;
}

export const FeedList = ({ feeds, onRemoveFeed }: FeedListProps) => {
  if (feeds.length === 0) {
    return (
      <div className="text-center py-8 text-muted">
        <p>Nessun feed RSS aggiunto ancora.</p>
        <p className="text-sm mt-2">Usa il pulsante "Aggiungi Feed RSS" per iniziare.</p>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <div className="space-y-2">
        {feeds.map((feed) => (
          <div
            key={feed.id}
            className="flex items-center justify-between surface rounded-lg p-4"
          >
            <div className="flex-1">
              <h3 className="font-medium text-primary">{feed.title}</h3>
              <p className="text-sm text-secondary truncate">{feed.url}</p>
              {feed.lastFetched && (
                <p className="text-xs text-muted">
                  Ultimo aggiornamento: {new Date(feed.lastFetched).toLocaleString('it-IT')}
                </p>
              )}
              {feed.error && (
                <p className="text-xs text-[var(--danger)]">Errore: {feed.error}</p>
              )}
            </div>
            <button
              onClick={() => onRemoveFeed(feed.id)}
              className="ml-4 text-[var(--danger)] hover:opacity-80 p-2 rounded-full hover:bg-[color:var(--surface-muted)] transition-colors"
              title="Rimuovi feed"
            >
              🗑️
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};