import React from 'react';
import { useToastStore } from '../../store/toastStore';
import type { ToastMessage } from '../../store/toastStore';
import { X, CheckCircle2, AlertTriangle, AlertCircle, Info } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3 w-full max-w-sm pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={dismissToast} />
      ))}
    </div>
  );
};

interface ToastItemProps {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onDismiss }) => {
  const { id, title, description, variant = 'default' } = toast;

  const variantStyles = {
    default: 'border-slate-300 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 text-slate-900 dark:text-slate-100',
    success: 'border-emerald-500 bg-emerald-50/95 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-300',
    destructive: 'border-rose-500 bg-rose-50/95 dark:bg-rose-950/20 text-rose-900 dark:text-rose-300',
    warning: 'border-amber-500 bg-amber-50/95 dark:bg-amber-950/20 text-amber-900 dark:text-amber-300',
    info: 'border-violet-500 bg-violet-50/95 dark:bg-violet-950/20 text-violet-900 dark:text-violet-300',
  };

  const Icon = {
    default: Info,
    success: CheckCircle2,
    destructive: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  }[variant];

  return (
    <div
      role="alert"
      className={`pointer-events-auto flex w-full items-start gap-3 rounded-lg border-l-4 p-4 shadow-lg backdrop-blur-sm transition-all duration-300 animate-slide-in ${variantStyles[variant]}`}
    >
      <Icon className="h-5 w-5 shrink-0 mt-0.5" />
      <div className="flex-1">
        {title && <h3 className="font-semibold text-sm leading-none">{title}</h3>}
        {description && <p className="mt-1 text-xs opacity-90 leading-normal">{description}</p>}
      </div>
      <button
        onClick={() => onDismiss(id)}
        className="shrink-0 rounded-md p-1 opacity-70 hover:opacity-100 focus:outline-none focus:ring-1 focus:ring-slate-400 transition-opacity"
        aria-label="Close notification"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};
