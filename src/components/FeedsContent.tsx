import { type ChangeEvent, type DragEvent, useRef, useState } from 'react';
import { AddFeedForm, FeedList } from './index';
import type { FeedsContentProps } from '../types/component-props';
import { useI18n } from '../i18n/useI18n';
import { Alert, AlertDescription, Button } from './ui';

export const FeedsContent = ({
  feeds,
  loading,
  addFeedError,
  onAddFeed,
  onExportFeeds,
  onImportFeeds,
  onClearError,
  onRemoveFeed,
  onMoveFeed,
  onMoveFeedToIndex,
  onEditFeed,
  onRefresh,
}: FeedsContentProps) => {
  const [showForm, setShowForm] = useState(false);
  const [isImportDragActive, setIsImportDragActive] = useState(false);
  const [importFeedback, setImportFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { messages, formatMessage } = useI18n();
  const topActionButtonClass = 'w-full sm:min-w-[9rem] sm:justify-center';
  const importExportButtonClass = `${topActionButtonClass} border-[color:color-mix(in_srgb,var(--brand)_34%,var(--border)_66%)] bg-[color:color-mix(in_srgb,var(--brand)_10%,var(--surface)_90%)] text-[color:var(--brand-strong)] hover:bg-[color:color-mix(in_srgb,var(--brand)_16%,var(--surface)_84%)]`;

  const handleImport = async (file: File) => {
    try {
      const result = await onImportFeeds(file);

      if (result.added === 0) {
        setImportFeedback({
          type: 'error',
          message: messages.feeds.importNoNewFeeds,
        });
        return;
      }

      setImportFeedback({
        type: 'success',
        message: formatMessage(messages.feeds.importSuccess, {
          added: result.added,
          skipped: result.skipped,
        }),
      });
    } catch (error) {
      setImportFeedback({
        type: 'error',
        message: error instanceof Error ? error.message : messages.errors.invalidImportFile,
      });
    }
  };

  const handleImportButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportInputChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) {
      return;
    }

    await handleImport(selectedFile);
    event.target.value = '';
  };

  const handleImportDrop = async (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsImportDragActive(false);

    const droppedFile = event.dataTransfer.files?.[0];
    if (!droppedFile) {
      return;
    }

    await handleImport(droppedFile);
  };

  const handleExport = () => {
    const exported = onExportFeeds();
    if (!exported) {
      setImportFeedback({
        type: 'error',
        message: messages.feeds.exportNoFeeds,
      });
      return;
    }

    setImportFeedback({
      type: 'success',
      message: formatMessage(messages.feeds.exportSuccess, { count: feeds.length }),
    });
  };

  return (
    <div>
      {/* Buttons header - aligned horizontally */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <Button
          type="button"
          onClick={() => setShowForm(!showForm)}
          variant="brand"
          size="xl"
          className={topActionButtonClass}
        >
          {messages.feeds.addFeedToggle}
        </Button>
        <Button
          type="button"
          onClick={onRefresh}
          disabled={loading || feeds.length === 0}
          variant="secondary"
          size="xl"
          className={topActionButtonClass}
        >
          {loading ? messages.feeds.refreshing : messages.feeds.refresh}
        </Button>
        <Button
          type="button"
          onClick={handleImportButtonClick}
          variant="secondary"
          size="xl"
          className={importExportButtonClass}
        >
          {messages.feeds.importButton}
        </Button>
        <Button
          type="button"
          onClick={handleExport}
          variant="secondary"
          size="xl"
          className={importExportButtonClass}
        >
          {messages.feeds.exportButton}
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".pickupnews,application/json"
        className="hidden"
        onChange={handleImportInputChange}
      />

      <div
        className={`mb-4 hidden rounded-2xl border border-dashed px-4 py-4 text-sm transition sm:block ${
          isImportDragActive
            ? 'border-[color:var(--ring)] bg-[color:var(--surface-strong)]'
            : 'border-[color:var(--border)] bg-[color:var(--surface)]'
        }`}
        onDragOver={(event) => {
          event.preventDefault();
          setIsImportDragActive(true);
        }}
        onDragLeave={() => setIsImportDragActive(false)}
        onDrop={handleImportDrop}
      >
        <p className="font-medium text-primary">{messages.feeds.importDropTitle}</p>
        <p className="mt-1 text-secondary">{messages.feeds.importDropHint}</p>
      </div>

      {importFeedback && (
        <Alert variant={importFeedback.type === 'error' ? 'destructive' : 'default'} className="mb-4">
          <AlertDescription>{importFeedback.message}</AlertDescription>
        </Alert>
      )}

      {/* Conditional form */}
      {showForm && (
        <AddFeedForm
          onAddFeed={onAddFeed}
          loading={loading}
          error={addFeedError}
          onClearError={onClearError}
          onClose={() => setShowForm(false)}
        />
      )}

      {/* Feed list */}
      <FeedList
        feeds={feeds}
        onRemoveFeed={onRemoveFeed}
        onMoveFeed={onMoveFeed}
        onMoveFeedToIndex={onMoveFeedToIndex}
        onEditFeed={onEditFeed}
      />
    </div>
  );
};
