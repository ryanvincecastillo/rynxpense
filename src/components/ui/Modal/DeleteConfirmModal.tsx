import React from 'react';
import { ConfirmModal, ConfirmModalProps } from './ConfirmModal';

interface DeleteConfirmModalProps extends Omit<ConfirmModalProps, 'variant' | 'confirmText' | 'message'> {
  itemName: string;
  itemType?: string;
  message?: string;
  warningText?: string;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  itemName,
  itemType = 'item',
  message,
  warningText,
  description,
  ...props
}) => {
  const defaultMessage = message || `Delete ${itemType}`;
  const defaultDescription = description || 
    `Are you sure you want to delete "${itemName}"? This action cannot be undone.`;
  
  const fullDescription = warningText 
    ? `${defaultDescription}\n\n⚠️ ${warningText}`
    : defaultDescription;

  return (
    <ConfirmModal
      {...props}
      variant="danger"
      message={defaultMessage}
      description={fullDescription}
      confirmText="Delete"
      cancelText="Cancel"
    />
  );
};