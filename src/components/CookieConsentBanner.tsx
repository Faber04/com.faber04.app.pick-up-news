import { Button } from './ui';
import { useI18n } from '../i18n/useI18n';

interface CookieConsentBannerProps {
  isVisible: boolean;
  onAccept: () => void;
  onOpenPrivacy: () => void;
  onOpenCookies: () => void;
}

export const CookieConsentBanner = ({
  isVisible,
  onAccept,
  onOpenPrivacy,
  onOpenCookies,
}: CookieConsentBannerProps) => {
  const { messages } = useI18n();

  if (!isVisible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[80] border-t border-[color:var(--border)] bg-[color:var(--surface-strong)]/95 backdrop-blur p-4 shadow-[0_-20px_40px_-30px_rgba(2,8,23,0.8)]">
      <div className="app-container">
        <p className="text-sm font-semibold text-primary">{messages.consent.title}</p>
        <p className="mt-1 text-xs text-secondary">{messages.consent.description}</p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-2">
            <Button type="button" variant="outline" size="sm" className="w-full sm:w-auto" onClick={onOpenPrivacy}>
              {messages.consent.readPrivacy}
            </Button>
            <Button type="button" variant="outline" size="sm" className="w-full sm:w-auto" onClick={onOpenCookies}>
              {messages.consent.readCookies}
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:ml-auto sm:flex sm:gap-2">
            <Button type="button" variant="brand" size="sm" className="w-full sm:w-auto" onClick={onAccept}>
              {messages.consent.accept}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
