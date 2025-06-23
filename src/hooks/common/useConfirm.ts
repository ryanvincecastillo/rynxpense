// hooks/common/useConfirm.ts
import { useCallback } from 'react';

export interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

export const useConfirm = () => {
  const confirm = useCallback((options: ConfirmOptions | string): Promise<boolean> => {
    return new Promise((resolve) => {
      const message = typeof options === 'string' ? options : options.message;
      const title = typeof options === 'object' ? options.title : undefined;
      
      // Create a more user-friendly confirmation dialog
      const fullMessage = title ? `${title}\n\n${message}` : message;
      const confirmed = window.confirm(fullMessage);
      resolve(confirmed);
    });
  }, []);

  return { confirm };
};