import { useState } from 'react';
import type { SettingsPageProps } from '../types/page-props';
import { useI18n } from '../i18n/useI18n';
import { Button } from '../components/ui';

const currentYear = new Date().getFullYear();

export const SettingsPage = ({
  version,
  onOpenFeeds,
  onOpenLanguage,
  notificationsEnabled,
  onToggleNotifications,
  canInstallPWA,
  onInstallPWA,
}: SettingsPageProps) => {
  const { messages } = useI18n();
  const [notifPending, setNotifPending] = useState(false);
  const [notifError, setNotifError] = useState('');

  const notificationsSupported = 'Notification' in window;

  const handleToggleNotifications = async () => {
    setNotifPending(true);
    setNotifError('');
    const result = await onToggleNotifications();
    if (!result && !notificationsEnabled) {
      setNotifError(
        Notification.permission === 'denied'
          ? messages.notifications.permissionDenied
          : messages.notifications.notSupported,
      );
    }
    setNotifPending(false);
  };

  return (
    <div className="app-container py-8 stagger-in">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(19rem,0.85fr)] lg:items-start">
        <section className="space-y-3">
          <Button
            variant="secondary"
            size="lg"
            className="w-full justify-between rounded-2xl px-5"
            onClick={onOpenLanguage}
          >
            <span>{messages.settings.languageAction}</span>
            <span aria-hidden="true">→</span>
          </Button>
          <Button
            variant="secondary"
            size="lg"
            className="w-full justify-between rounded-2xl px-5"
            onClick={onOpenFeeds}
          >
            <span>{messages.settings.manageFeedsAction}</span>
            <span aria-hidden="true">→</span>
          </Button>

          {/* Browser notifications toggle */}
          {notificationsSupported && (
            <div className="flex flex-col gap-2 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-muted)] px-5 py-4">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-primary">🔔 {messages.notifications.enableTitle}</p>
                  <p className="mt-0.5 text-xs text-secondary">{messages.notifications.enableDescription}</p>
                </div>
                <Button
                  type="button"
                  variant={notificationsEnabled ? 'brand' : 'outline'}
                  size="sm"
                  disabled={notifPending}
                  onClick={handleToggleNotifications}
                  className="shrink-0"
                >
                  {notifPending ? '…' : notificationsEnabled ? messages.notifications.disable : messages.notifications.enable}
                </Button>
              </div>
              {notifError && <p className="text-xs text-[color:var(--danger)]">{notifError}</p>}
            </div>
          )}

          {/* PWA install prompt */}
          {canInstallPWA && (
            <div className="flex items-center justify-between gap-4 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-muted)] px-5 py-4">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-primary">📲 {messages.pwa.installTitle}</p>
                <p className="mt-0.5 text-xs text-secondary">{messages.pwa.installDescription}</p>
              </div>
              <Button
                type="button"
                variant="brand"
                size="sm"
                onClick={onInstallPWA}
                className="shrink-0"
              >
                {messages.pwa.installButton}
              </Button>
            </div>
          )}
        </section>

        <section className="space-y-5 pt-1">
          <dl className="space-y-4 text-sm text-secondary">
            <div className="flex items-start justify-between gap-4 border-b border-[color:var(--border)] pb-4">
              <dt className="text-muted">{messages.settings.copyright}</dt>
              <dd className="font-medium text-primary">© {currentYear}</dd>
            </div>
            <div className="flex items-start justify-between gap-4 border-b border-[color:var(--border)] pb-4">
              <dt className="text-muted">{messages.settings.repository}</dt>
              <dd className="font-medium text-primary">
                <a
                  href="https://github.com/Faber04"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex text-sm font-medium text-[var(--brand-strong)] hover:opacity-80"
                >
                  github.com/Faber04
                </a>
              </dd>
            </div>
            <div className="flex items-start justify-between gap-4">
              <dt className="text-muted">{messages.settings.version}</dt>
              <dd className="font-medium text-primary">v{version}</dd>
            </div>
          </dl>
        </section>
      </div>
    </div>
  );
};
