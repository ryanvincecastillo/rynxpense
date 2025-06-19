import toast from 'react-hot-toast';
import { getErrorMessage } from '../../utils';

export const useToast = () => {
  const showError = (error: any, fallbackMessage?: string) => {
    const message = getErrorMessage(error) || fallbackMessage || 'An error occurred';
    toast.error(message);
  };

  const showSuccess = (message: string) => {
    toast.success(message);
  };

  const showLoading = (message: string = 'Loading...') => {
    return toast.loading(message);
  };

  const dismissToast = (toastId: string) => {
    toast.dismiss(toastId);
  };

  return {
    showError,
    showSuccess,
    showLoading,
    dismissToast,
    toast, // Export original toast for advanced usage
  };
};