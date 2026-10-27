import { useState } from 'react';
import type { AddFeedFormProps } from '../types/component-props';
import { useI18n } from '../i18n/useI18n';
import { Alert, AlertDescription, Button, Card, CardContent, CardHeader, CardTitle, Input } from './ui';

export const AddFeedForm = ({ onAddFeed, loading, error, categories, onClearError, onClose }: AddFeedFormProps) => {
  const { messages } = useI18n();
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !title.trim() || loading || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const added = await onAddFeed(url.trim(), title.trim(), category.trim() || undefined);
      if (added) {
        setUrl('');
        setTitle('');
        setCategory('');
        onClose?.();
      }
    } catch (error) {
      // Error is handled in the parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="mb-6 overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between gap-4 pb-4">
        <CardTitle className="text-lg">{messages.feeds.addFeedTitle}</CardTitle>
        {onClose && (
          <Button
            type="button"
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="h-8 w-8"
          >
            ✕
          </Button>
        )}
      </CardHeader>

      <CardContent>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="feed-title" className="block text-sm font-medium text-secondary mb-1">
            {messages.feeds.feedName}
          </label>
          <Input
            id="feed-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={messages.feeds.feedNamePlaceholder}
            required
          />
        </div>

        <div>
          <label htmlFor="feed-url" className="block text-sm font-medium text-secondary mb-1">
            {messages.feeds.feedUrl}
          </label>
          <Input
            id="feed-url"
            type="text"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              if (error) {
                onClearError?.();
              }
            }}
            placeholder={messages.feeds.feedUrlPlaceholder}
            className={error ? 'border-[color:var(--danger)] focus-visible:ring-[color:var(--danger)]' : ''}
            required
          />
          {error && (
            <Alert variant="destructive" className="mt-2 py-2">
              <AlertDescription className="text-[color:var(--danger)]">{error}</AlertDescription>
            </Alert>
          )}
          <p className="text-xs text-muted mt-1">
            {messages.feeds.detectionHint}
          </p>
        </div>

        <div>
          <label htmlFor="feed-category" className="block text-sm font-medium text-secondary mb-1">
            {messages.feeds.feedCategory}
          </label>
          <Input
            id="feed-category"
            type="text"
            list="feed-category-options"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder={messages.feeds.feedCategoryPlaceholder}
          />
          <datalist id="feed-category-options">
            {(categories ?? []).map((existingCategory) => (
              <option key={existingCategory} value={existingCategory} />
            ))}
          </datalist>
          <p className="text-xs text-muted mt-1">
            {messages.feeds.feedCategoryHint}
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            type="submit"
            disabled={loading || isSubmitting}
            variant="brand"
          >
            {loading || isSubmitting ? messages.feeds.addFeedSubmitting : messages.feeds.addFeedButton}
          </Button>
          {onClose && (
            <Button
              type="button"
              onClick={onClose}
              variant="secondary"
            >
              {messages.feeds.cancel}
            </Button>
          )}
        </div>
      </form>
      </CardContent>
    </Card>
  );
};