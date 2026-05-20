import { type ChangeEvent, type DragEvent, useRef, useState } from 'react';
import { AddFeedForm, FeedList } from './index';
import type { FeedsContentProps } from '../types/component-props';
import { useI18n } from '../i18n/useI18n';
import { Alert, AlertDescription, Button } from './ui';
import { cn } from '../lib/utils';

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
  const handleImport = async (file: File) => {
    try {
      const result = await onImportFeeds(file);

      const messageParts: string[] = [];

      if (result.added > 0 || result.skipped > 0) {
        messageParts.push(formatMessage(messages.feeds.importSuccess, {
          added: result.added,
          skipped: result.skipped,
        }));
      }

      if (result.savedAdded > 0) {
        messageParts.push(formatMessage(messages.feeds.importSavedAdded, {
          count: result.savedAdded,
        }));
      }

      if (messageParts.length === 0) {
        setImportFeedback({
          type: 'error',
          message: messages.feeds.importNoNewFeeds,
        });
        return;
      }

      setImportFeedback({
        type: 'success',
        message: messageParts.join(' '),
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
      {/* Compact action toolbar */}
      <div className="mb-6 inline-flex max-w-full flex-wrap items-center gap-2 rounded-2xl border border-[color:var(--border)] bg-[color:color-mix(in_srgb,var(--surface)_88%,transparent_12%)] p-2 shadow-[0_18px_40px_-30px_rgba(2,8,23,0.4)] backdrop-blur">
        <Button
          type="button"
          onClick={() => setShowForm(!showForm)}
          variant="brand"
          size="sm"
          className="h-9 w-9 rounded-full px-0 text-[13px] font-semibold shadow-none hover:-translate-y-0 sm:w-auto sm:px-4"
          aria-label={messages.feeds.addFeedButton}
          title={messages.feeds.addFeedButton}
        >
          <span className="text-[14px]" aria-hidden="true">＋</span>
          <span className="hidden sm:inline">{messages.feeds.addFeedButton}</span>
        </Button>
        <Button
          type="button"
          onClick={onRefresh}
          disabled={loading || feeds.length === 0}
          variant="secondary"
          size="sm"
          className="h-9 w-9 rounded-full border-[color:color-mix(in_srgb,var(--brand)_18%,var(--border)_82%)] bg-[color:color-mix(in_srgb,var(--brand)_8%,var(--surface)_92%)] px-0 text-[13px] font-semibold text-[color:var(--brand-strong)] shadow-none hover:bg-[color:color-mix(in_srgb,var(--brand)_12%,var(--surface)_88%)] sm:w-auto sm:px-4"
          aria-label={loading ? messages.feeds.refreshing : messages.feeds.refresh}
          title={loading ? messages.feeds.refreshing : messages.feeds.refresh}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12a7.5 7.5 0 0 1 12.75-5.34L19 9.41M19.5 12a7.5 7.5 0 0 1-12.75 5.34L5 14.59" />
          </svg>
          <span className="hidden sm:inline">{loading ? messages.feeds.refreshing : messages.feeds.refresh}</span>
        </Button>
        <div className="inline-flex overflow-hidden rounded-full border border-[color:var(--border)] bg-[color:var(--surface-muted)]">
          <Button
            type="button"
            onClick={handleImportButtonClick}
            variant="ghost"
            size="sm"
            className={cn(
              'h-9 w-9 rounded-none border-0 px-0 text-[13px] font-medium text-secondary hover:bg-[color:var(--surface)] hover:text-[color:var(--text-primary)] sm:w-auto sm:px-3',
              'border-r border-[color:var(--border)]'
            )}
            aria-label={messages.feeds.importButton}
            title={messages.feeds.importButton}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v10m0 0 4-4m-4 4-4-4M5 16.5a2.5 2.5 0 0 0 2.5 2.5h9a2.5 2.5 0 0 0 2.5-2.5" />
            </svg>
            <span className="hidden sm:inline">{messages.feeds.importButton}</span>
          </Button>
          <Button
            type="button"
            onClick={handleExport}
            variant="ghost"
            size="sm"
            className="h-9 w-9 rounded-none border-0 px-0 text-[13px] font-medium text-secondary hover:bg-[color:var(--surface)] hover:text-[color:var(--text-primary)] sm:w-auto sm:px-3"
            aria-label={messages.feeds.exportButton}
            title={messages.feeds.exportButton}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21V11m0 0 4 4m-4-4-4 4M5 7.5A2.5 2.5 0 0 1 7.5 5h9A2.5 2.5 0 0 1 19 7.5" />
            </svg>
            <span className="hidden sm:inline">{messages.feeds.exportButton}</span>
          </Button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json,text/plain,application/octet-stream"
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
