import { useState } from 'react';
import { AddFeedForm, FeedList } from '../components';
import { RSSFeed } from '../types';

interface FeedsPageProps {
  feeds: RSSFeed[];
  loading: boolean;
  onAddFeed: (url: string, title: string) => Promise<void>;
  onRemoveFeed: (feedId: string) => void;
  onRefresh: () => Promise<void>;
}

export const FeedsPage = ({
  feeds,
  loading,
  onAddFeed,
  onRemoveFeed,
  onRefresh,
}: FeedsPageProps) => {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="app-container py-8 stagger-in">
      <h2 className="text-2xl font-bold text-primary mb-6">Gestione Feed RSS</h2>
      
      {/* Buttons header - aligned horizontally */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-brand px-4 py-2 rounded-lg font-medium transition"
        >
          + Aggiungi Feed RSS
        </button>
        {feeds.length > 0 && (
          <button
            onClick={onRefresh}
            disabled={loading}
            className="btn-success disabled:opacity-60 text-white px-4 py-2 rounded-lg font-medium transition"
          >
            {loading ? 'Aggiornando...' : '🔄 Aggiorna'}
          </button>
        )}
      </div>
      
      {/* Conditional form */}
      {showForm && (
        <AddFeedForm 
          onAddFeed={onAddFeed} 
          loading={loading}
          onClose={() => setShowForm(false)}
        />
      )}
      
      {/* Feed list */}
      <FeedList
        feeds={feeds}
        onRemoveFeed={onRemoveFeed}
      />
    </div>
  );
};
