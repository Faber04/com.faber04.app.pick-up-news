import { Alert, AlertDescription } from './alert';

type ToastProps = {
  open: boolean;
  message: string;
  variant?: 'default' | 'destructive';
};

export const Toast = ({ open, message, variant = 'default' }: ToastProps) => {
  if (!open) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[60] flex justify-center px-4 sm:top-auto sm:bottom-4">
      <Alert
        variant={variant}
        className="pointer-events-auto w-full max-w-md rounded-2xl border-[color:color-mix(in_srgb,var(--brand)_18%,var(--border)_82%)] bg-[color:color-mix(in_srgb,var(--brand)_8%,var(--surface)_92%)] px-4 py-3 shadow-[0_24px_48px_-28px_rgba(2,8,23,0.65)]"
      >
        <AlertDescription className="flex items-center justify-center gap-2 text-center text-[14px] font-semibold text-primary">
          <span aria-hidden="true">✓</span>
          <span>{message}</span>
        </AlertDescription>
      </Alert>
    </div>
  );
};
