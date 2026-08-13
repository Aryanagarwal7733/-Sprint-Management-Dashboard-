import { useToastStore } from '../store/toastStore';
import type { ToastMessage } from '../store/toastStore';

export const useToast = () => {
  const addToast = useToastStore((state) => state.addToast);
  const dismissToast = useToastStore((state) => state.dismissToast);
  const toasts = useToastStore((state) => state.toasts);

  const toast = (message: Omit<ToastMessage, 'id'>) => {
    return addToast(message);
  };

  return {
    toast,
    dismiss: dismissToast,
    toasts,
  };
};
