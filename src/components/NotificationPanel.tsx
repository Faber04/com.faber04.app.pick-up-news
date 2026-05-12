import { createPortal } from 'react-dom';
import type { AppNotification } from '../types';
import { useI18n } from '../i18n/useI18n';
import { Button } from './ui';

interface NotificationPanelProps {
  notifications: AppNotification[];
  isOpen: boolean;
  onClose: () => void;
  onMarkAllRead: () => void;
  onClearAll: () => void;
}

const formatNotifDate = (isoDate: string, locale: string): string => {
  try {
    return new Intl.DateTimeFormat(locale, {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(isoDate));
  } catch {
    return isoDate;
  }
};

export const NotificationPanel = ({
  notifications,
  isOpen,
  onClose,
  onMarkAllRead,
  onClearAll,
}: NotificationPanelProps) => {
  const { messages, locale } = useI18n();
  const unreadCount = notifications.filter(n => !n.read).length;
  const panelTitleId = 'notifications-panel-title';

  if (!isOpen) return null;

  const panel = (
    <div className="fixed inset-0 z-[60]">
      {/* Overlay */}
      <button
        type="button"
        aria-label={messages.common.closeMenu}
        className="absolute inset-0 bg-slate-950/45"
        onClick={onClose}
      />

      {/* Panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby={panelTitleId}
        className="fixed inset-y-0 right-0 z-10 flex h-dvh w-[min(92vw,24rem)] flex-col border-l border-[color:var(--border)] bg-[color:var(--surface-strong)] shadow-2xl"
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-[color:var(--border)] px-5 py-4">
          <div>
            <p id={panelTitleId} className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
              {messages.notifications.bell}
            </p>
            {unreadCount > 0 && (
              <p className="mt-0.5 text-sm font-medium text-primary">
                {messages.notifications.unreadCount.replace('{count}', String(unreadCount))}
              </p>
            )}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-xl"
            onClick={onClose}
            aria-label={messages.common.closeMenu}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>

        {/* Actions bar */}
        {notifications.length > 0 && (
          <div className="flex shrink-0 items-center gap-2 border-b border-[color:var(--border)] px-5 py-2">
            {unreadCount > 0 && (
              <Button type="button" variant="ghost" size="sm" onClick={onMarkAllRead} className="text-xs">
                {messages.notifications.markAllRead}
              </Button>
            )}
            <Button type="button" variant="ghost" size="sm" onClick={onClearAll} className="ml-auto text-xs text-muted">
              ✕ {messages.notifications.clearAll}
            </Button>
          </div>
        )}

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
              <span className="text-3xl" aria-hidden="true">🔔</span>
              <p className="font-semibold text-primary">{messages.notifications.noNotifications}</p>
              <p className="text-sm text-secondary">{messages.notifications.noNotificationsHint}</p>
            </div>
          ) : (
            <ul className="divide-y divide-[color:var(--border)]">
              {notifications.map(notif => (
                <li
                  key={notif.id}
                  className={`px-5 py-4 transition-colors ${notif.read ? 'opacity-60' : 'bg-[color:var(--surface)]'}`}
                >
                  <div className="flex items-start gap-2">
                    {!notif.read && (
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[color:var(--brand)]" aria-hidden="true" />
                    )}
                    <div className={`min-w-0 ${notif.read ? 'pl-4' : ''}`}>
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
                        {notif.feedTitle}
                      </p>
                      {notif.articleLink ? (
                        <a
                          href={notif.articleLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-0.5 block text-sm font-medium leading-snug text-primary hover:underline"
                        >
                          {notif.articleTitle}
                        </a>
                      ) : (
                        <p className="mt-0.5 text-sm font-medium leading-snug text-primary">
                          {notif.articleTitle}
                        </p>
                      )}
                      <p className="mt-1 text-[11px] text-muted">
                        {formatNotifDate(notif.timestamp, locale)}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </div>
  );

  return createPortal(panel, document.body);
};
