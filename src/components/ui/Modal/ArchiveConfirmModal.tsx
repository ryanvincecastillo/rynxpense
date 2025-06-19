import React from 'react';
import { ConfirmModal, ConfirmModalProps } from './ConfirmModal';

interface ArchiveConfirmModalProps extends Omit<ConfirmModalProps, 'variant' | 'confirmText' | 'message'> {
  itemName: string;
  itemType?: string;
  isArchived: boolean;
  message?: string;
}

export const ArchiveConfirmModal: React.FC<ArchiveConfirmModalProps> = ({
  itemName,
  itemType = 'item',
  isArchived,
  message,
  description,
  onConfirm,
  ...props
}) => {
  const action = isArchived ? 'unarchive' : 'archive';
  const defaultMessage = message || `${action.charAt(0).toUpperCase() + action.slice(1)} ${itemType}`;
  
  const defaultDescription = description || 
    `Are you sure you want to ${action} "${itemName}"?`;

  return (
    <ConfirmModal
      {...props}
      onConfirm={onConfirm}
      variant="warning"
      message={defaultMessage}
      description={defaultDescription}
      confirmText={action.charAt(0).toUpperCase() + action.slice(1)}
      cancelText="Cancel"
    />
  );
};