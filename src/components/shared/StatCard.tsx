import React from 'react';
import { Card } from '../ui';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  colorScheme?: 'green' | 'red' | 'blue' | 'purple';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  colorScheme = 'blue'
}) => {
  const colorClasses = {
    green: 'from-green-50 to-emerald-100 border-green-200',
    red: 'from-red-50 to-rose-100 border-red-200',
    blue: 'from-blue-50 to-cyan-100 border-blue-200',
    purple: 'from-purple-50 to-violet-100 border-purple-200'
  };

  const iconBgClasses = {
    green: 'bg-green-200',
    red: 'bg-red-200', 
    blue: 'bg-blue-200',
    purple: 'bg-purple-200'
  };

  return (
    <Card className={`bg-gradient-to-br ${colorClasses[colorScheme]} hover:shadow-lg transition-shadow`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm font-medium text-${colorScheme}-700`}>{title}</p>
          <p className={`text-2xl font-bold text-${colorScheme}-800`}>{value}</p>
          {subtitle && (
            <p className={`text-xs text-${colorScheme}-600 mt-1`}>{subtitle}</p>
          )}
        </div>
        {icon && (
          <div className={`w-12 h-12 ${iconBgClasses[colorScheme]} rounded-xl flex items-center justify-center`}>
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
};