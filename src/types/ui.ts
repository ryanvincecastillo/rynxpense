export interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showCloseButton?: boolean;
  className?: string;
}

export interface ModalProps extends BaseModalProps {
  children: React.ReactNode;
}