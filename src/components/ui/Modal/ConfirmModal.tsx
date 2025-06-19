import React from 'react';
import { Button } from '../Navigation/Button';
import { AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react';
import Modal, { ModalProps } from './Modal';

export interface ConfirmModalProps extends Omit<ModalProps, 'children'> {
  message: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  variant?: 'danger' | 'warning' | 'info' | 'success';
  isLoading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  message,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onClose,
  variant = 'danger',
  isLoading = false,
  isOpen,
  title,
  size = 'sm',
  className,
}) => {
  const variantConfig = {
    danger: {
      icon: XCircle,
      iconColor: 'text-red-600',
      iconBg: 'bg-red-100',
      buttonClass: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
    },
    warning: {
      icon: AlertTriangle,
      iconColor: 'text-yellow-600',
      iconBg: 'bg-yellow-100',
      buttonClass: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
    },
    info: {
      icon: Info,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-100',
      buttonClass: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
    },
    success: {
      icon: CheckCircle,
      iconColor: 'text-green-600',
      iconBg: 'bg-green-100',
      buttonClass: 'bg-green-600 hover:bg-green-700 focus:ring-green-500',
    },
  };

  const config = variantConfig[variant];
  const Icon = config.icon;

  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size={size}
      showCloseButton={false}
      className={className}
    >
      <div className="text-center">
        <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full ${config.iconBg} mb-4`}>
          <Icon className={`h-6 w-6 ${config.iconColor}`} />
        </div>
        
        <h3 className="text-lg font-medium text-gray-900 mb-2">{message}</h3>
        
        {description && (
          <p className="text-sm text-gray-500 mb-6 whitespace-pre-line">{description}</p>
        )}
        
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-3 justify-center">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isLoading}
            className="order-2 sm:order-1"
          >
            {cancelText}
          </Button>
          <Button
            onClick={handleConfirm}
            isLoading={isLoading}
            disabled={isLoading}
            className={`order-1 sm:order-2 text-white border-transparent focus:outline-none focus:ring-2 transition-colors ${config.buttonClass}`}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};