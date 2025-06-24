// src/components/ui/Alert.tsx
import React from 'react';
import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';
import { cn } from '../../utils';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'info' | 'success' | 'warning' | 'error';
  children: React.ReactNode;
}

const alertVariants = {
  info: {
    container: 'bg-blue-50 border-blue-200 text-blue-800',
    icon: Info,
  },
  success: {
    container: 'bg-green-50 border-green-200 text-green-800',
    icon: CheckCircle,
  },
  warning: {
    container: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    icon: AlertTriangle,
  },
  error: {
    container: 'bg-red-50 border-red-200 text-red-800',
    icon: XCircle,
  },
};

export const Alert: React.FC<AlertProps> = ({ 
  variant = 'info', 
  className, 
  children, 
  ...props 
}) => {
  const { container, icon: Icon } = alertVariants[variant];

  return (
    <div
      className={cn(
        'flex items-start p-4 border rounded-lg',
        'sm:p-4 p-3', // Mobile responsive padding
        container,
        className
      )}
      {...props}
    >
      <Icon className="h-4 w-4 flex-shrink-0 mt-0.5" />
      <div className="ml-3 flex-1 min-w-0">
        {children}
      </div>
    </div>
  );
};