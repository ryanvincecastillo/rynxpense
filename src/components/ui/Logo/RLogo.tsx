import React from 'react';

interface RLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
  variant?: 'default' | 'white' | 'dark';
}

export const RLogo: React.FC<RLogoProps> = ({ 
  size = 32, 
  className = '', 
  showText = false,
  variant = 'default' 
}) => {
  const getStyles = () => {
    switch (variant) {
      case 'white':
        return {
          background: 'bg-white',
          text: 'text-blue-600',
          border: 'border-gray-200'
        };
      case 'dark':
        return {
          background: 'bg-gray-800',
          text: 'text-white',
          border: 'border-gray-600'
        };
      default:
        return {
          background: 'bg-gradient-to-br from-blue-600 to-purple-600',
          text: 'text-white',
          border: 'border-transparent'
        };
    }
  };

  const styles = getStyles();

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div 
        className={`${styles.background} rounded-lg flex items-center justify-center shadow-sm ${styles.border} border`}
        style={{ width: `${size}px`, height: `${size}px` }}
      >
        <span 
          className={`${styles.text} font-bold`}
          style={{ fontSize: `${size * 0.5}px` }}
        >
          R
        </span>
      </div>
      
      {showText && (
        <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          RYNXPENSE
        </span>
      )}
    </div>
  );
};

export default RLogo;