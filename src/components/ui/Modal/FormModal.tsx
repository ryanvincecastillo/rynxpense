import React from 'react';
import Modal, { ModalProps } from './Modal';

export interface FormModalProps extends Omit<ModalProps, 'children'> {
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  submitText?: string;
  cancelText?: string;
  isLoading?: boolean;
  isSubmitDisabled?: boolean;
  showActions?: boolean;
}

export const FormModal: React.FC<FormModalProps> = ({
  children,
  onSubmit,
  onClose,
  submitText = 'Save',
  cancelText = 'Cancel',
  isLoading = false,
  isSubmitDisabled = false,
  showActions = true,
  title,
  isOpen,
  size,
  showCloseButton,
  className,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(e);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size={size}
      showCloseButton={showCloseButton}
      className={className}
    >
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          {children}
        </div>
        
        {showActions && (
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 transition-colors"
            >
              {cancelText}
            </button>
            <button
              type="submit"
              disabled={isSubmitDisabled || isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
            >
              {isLoading ? 'Loading...' : submitText}
            </button>
          </div>
        )}
      </form>
    </Modal>
  );
};