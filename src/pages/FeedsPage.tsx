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
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Gestione Feed RSS</h2>
      <AddFeedForm onAddFeed={onAddFeed} loading={loading} />
      <FeedList
        feeds={feeds}
        onRemoveFeed={onRemoveFeed}
        onRefresh={onRefresh}
        loading={loading}
      />
    </div>
  );
};
