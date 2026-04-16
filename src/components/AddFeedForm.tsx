import { useState } from 'react';

interface AddFeedFormProps {
  onAddFeed: (url: string, title: string) => Promise<void>;
  loading: boolean;
  onClose?: () => void;
}

export const AddFeedForm = ({ onAddFeed, loading, onClose }: AddFeedFormProps) => {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !title.trim()) return;

    try {
      await onAddFeed(url.trim(), title.trim());
      setUrl('');
      setTitle('');
      onClose?.();
    } catch (error) {
      // Error is handled in the parent component
    }
  };

  return (
    <div className="surface rounded-lg p-4 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-primary">Aggiungi Feed RSS</h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-muted hover:text-primary"
          >
            ✕
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="feed-title" className="block text-sm font-medium text-secondary mb-1">
            Nome del Feed
          </label>
          <input
            id="feed-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="es. Corriere della Sera"
            className="input-field"
            required
          />
        </div>

        <div>
          <label htmlFor="feed-url" className="block text-sm font-medium text-secondary mb-1">
            URL del Feed RSS
          </label>
          <input
            id="feed-url"
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="es. example.com/rss o www.example.com/feed"
            className="input-field"
            required
          />
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="btn-brand disabled:opacity-60 px-4 py-2 rounded-md font-medium transition"
          >
            {loading ? 'Aggiungendo...' : 'Aggiungi Feed'}
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="btn-neutral px-4 py-2 rounded-md font-medium transition"
            >
              Annulla
            </button>
          )}
        </div>
      </form>
    </div>
  );
};