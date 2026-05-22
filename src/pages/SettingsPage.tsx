import { useState } from 'react';
import type { SettingsPageProps } from '../types/page-props';
import { useI18n } from '../i18n/useI18n';

const currentYear = new Date().getFullYear();

export const SettingsPage = ({
  version,
  onOpenFeeds,
  onOpenLanguage,
  onOpenPrivacy,
  onOpenCookies,
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
    <div className="app-container py-6 stagger-in space-y-8">

      {/* Preferences section */}
      <section>
        <p className="mb-2 px-4 text-[13px] font-semibold uppercase tracking-wider text-muted">
          Preferences
        </p>
        <div className="ios-list-group">
          {/* Language */}
          <button
            type="button"
            onClick={onOpenLanguage}
            className="ios-list-row flex w-full items-center justify-between px-4 py-3 transition-opacity active:opacity-60"
          >
            <span className="text-[15px] text-primary">{messages.settings.languageAction}</span>
            <span className="text-secondary">›</span>
          </button>

          <div className="ios-list-separator ml-4" />

          {/* Manage Feeds */}
          <button
            type="button"
            onClick={onOpenFeeds}
            className="ios-list-row flex w-full items-center justify-between px-4 py-3 transition-opacity active:opacity-60"
          >
            <span className="text-[15px] text-primary">{messages.settings.manageFeedsAction}</span>
            <span className="text-secondary">›</span>
          </button>

          <div className="ios-list-separator ml-4" />

          <button
            type="button"
            onClick={onOpenPrivacy}
            className="ios-list-row flex w-full items-center justify-between px-4 py-3 transition-opacity active:opacity-60"
          >
            <span className="text-[15px] text-primary">{messages.settings.privacyAction}</span>
            <span className="text-secondary">›</span>
          </button>

          <div className="ios-list-separator ml-4" />

          <button
            type="button"
            onClick={onOpenCookies}
            className="ios-list-row flex w-full items-center justify-between px-4 py-3 transition-opacity active:opacity-60"
          >
            <span className="text-[15px] text-primary">{messages.settings.cookiesAction}</span>
            <span className="text-secondary">›</span>
          </button>

          {/* Notifications toggle */}
          {notificationsSupported && (
            <>
              <div className="ios-list-separator ml-4" />
              <div className="ios-list-row flex items-center justify-between px-4 py-3">
                <div className="min-w-0 flex-1 pr-4">
                  <p className="text-[15px] text-primary">{messages.notifications.enableTitle}</p>
                  <p className="text-[13px] text-secondary">{messages.notifications.enableDescription}</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={notificationsEnabled}
                  disabled={notifPending}
                  onClick={handleToggleNotifications}
                  aria-label={notificationsEnabled ? messages.notifications.disable : messages.notifications.enable}
                  className={`relative inline-flex h-[31px] w-[51px] shrink-0 cursor-pointer rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring)] ${notifPending ? 'opacity-50' : ''}`}
                  style={{ background: notificationsEnabled ? 'var(--brand)' : 'var(--border)' }}
                >
                  <span
                    className="pointer-events-none absolute top-[2px] left-[2px] h-[27px] w-[27px] rounded-full bg-white shadow-[0_2px_6px_rgba(0,0,0,0.25)] transition-transform duration-200"
                    style={{ transform: notificationsEnabled ? 'translateX(20px)' : 'translateX(0)' }}
                  />
                </button>
              </div>
            </>
          )}

          {notifError && (
            <p className="px-4 pb-3 text-[13px] text-[color:var(--danger)]">{notifError}</p>
          )}

          {/* PWA install */}
          {canInstallPWA && (
            <>
              <div className="ios-list-separator ml-4" />
              <div className="ios-list-row flex items-center justify-between px-4 py-3">
                <div className="min-w-0 flex-1 pr-4">
                  <p className="text-[15px] text-primary">{messages.pwa.installTitle}</p>
                  <p className="text-[13px] text-secondary">{messages.pwa.installDescription}</p>
                </div>
                <button
                  type="button"
                  onClick={onInstallPWA}
                  className="shrink-0 rounded-full px-4 py-1.5 text-[14px] font-semibold text-white transition-opacity active:opacity-70"
                  style={{ background: 'var(--brand)' }}
                >
                  {messages.pwa.installButton}
                </button>
              </div>
            </>
          )}
        </div>
      </section>

      {/* About section */}
      <section>
        <p className="mb-2 px-4 text-[13px] font-semibold uppercase tracking-wider text-muted">
          {messages.settings.appInfo}
        </p>
        <div className="ios-list-group">
          <div className="ios-list-row flex items-center justify-between px-4 py-3">
            <span className="text-[15px] text-primary">{messages.settings.copyright}</span>
            <span className="text-[15px] text-secondary">© {currentYear}</span>
          </div>
          <div className="ios-list-separator ml-4" />
          <div className="ios-list-row flex items-center justify-between px-4 py-3">
            <span className="text-[15px] text-primary">{messages.settings.repository}</span>
            <a
              href="https://github.com/Faber04"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[15px] font-medium"
              style={{ color: 'var(--brand)' }}
            >
              github.com/Faber04
            </a>
          </div>
          <div className="ios-list-separator ml-4" />
          <div className="ios-list-row flex items-center justify-between px-4 py-3">
            <span className="text-[15px] text-primary">{messages.settings.version}</span>
            <span className="text-[15px] text-secondary">v{version}</span>
          </div>
        </div>
      </section>

    </div>
  );
};
