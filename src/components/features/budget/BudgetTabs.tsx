// src/components/features/budget/BudgetTabs.tsx
import React from 'react';
import { 
  BarChart2, 
  Target, 
  ReceiptText
} from 'lucide-react';
import { BudgetSummary } from '../../../types';
import { Badge } from '../../ui';

type ActiveTab = 'overview' | 'categories' | 'transactions';

interface BudgetTabsProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  summary: BudgetSummary | undefined;
  categoriesCount?: number;
  transactionsCount?: number;
}

interface TabConfig {
  id: ActiveTab;
  label: string;
  mobileLabel?: string; // Shorter label for mobile
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  count?: number;
}

export const BudgetTabs: React.FC<BudgetTabsProps> = ({
  activeTab,
  onTabChange,
  summary,
  categoriesCount = 0,
  transactionsCount = 0,
}) => {
  const tabs: TabConfig[] = [
    {
      id: 'overview',
      label: 'Overview',
      mobileLabel: 'Overview',
      icon: BarChart2,
      description: 'Budget summary and insights',
    },
    {
      id: 'categories',
      label: 'Budget Planning',
      mobileLabel: 'Planning',
      icon: Target,
      description: 'Manage income and expense categories',
      count: categoriesCount,
    },
    {
      id: 'transactions',
      label: 'Transactions',
      mobileLabel: 'Transactions',
      icon: ReceiptText,
      description: 'View and manage all transactions',
      count: transactionsCount,
    },
  ];

  const getTabClasses = (isActive: boolean) => {
    const baseClasses = "group relative flex-1 transition-all duration-200 select-none";
    
    if (isActive) {
      return `${baseClasses} text-blue-600`;
    }
    
    return `${baseClasses} text-gray-500 hover:text-gray-700`;
  };

  const getIconClasses = (isActive: boolean) => {
    return `transition-colors duration-200 ${
      isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'
    }`;
  };

  const getBadgeClasses = (isActive: boolean) => {
    return isActive 
      ? 'bg-blue-100 text-blue-700 border-blue-200' 
      : 'bg-gray-100 text-gray-600 border-gray-200 group-hover:bg-gray-200';
  };

  const getIndicatorClasses = (isActive: boolean) => {
    return `absolute bottom-0 left-0 right-0 h-0.5 transition-all duration-200 ${
      isActive 
        ? 'bg-blue-600 scale-x-100' 
        : 'bg-transparent scale-x-0 group-hover:bg-gray-300 group-hover:scale-x-100'
    }`;
  };

  return (
    <div className="bg-white border-b border-gray-200 sticky top-16 z-[5]">
      <div className="max-w-7xl mx-auto">
        {/* Mobile Layout - Horizontal scrollable tabs */}
        <div className="block lg:hidden">
          <div className="flex border-b border-gray-200 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`${getTabClasses(isActive)} 
                    flex-shrink-0 px-4 py-3 flex items-center justify-center space-x-2 min-w-0
                    border-b-2 ${isActive ? 'border-blue-600' : 'border-transparent'}
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset`}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`${tab.id}-panel`}
                >
                  <Icon className={`${getIconClasses(isActive)} h-4 w-4 flex-shrink-0 hidden sm:block`} />
                  <span className="font-medium text-sm whitespace-nowrap">
                    {tab.mobileLabel || tab.label}
                  </span>
                  {tab.count !== undefined && tab.count > 0 && (
                    <Badge 
                      variant="secondary" 
                      size="sm"
                      className={`${getBadgeClasses(isActive)} h-5 min-w-[1.25rem] text-xs flex-shrink-0 hidden sm:inline-flex`}
                    >
                      {tab.count > 99 ? '99+' : tab.count}
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Desktop Layout - Full width with descriptions */}
        <div className="hidden lg:block">
          <nav className="flex">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`${getTabClasses(isActive)} 
                    px-6 py-4 flex flex-col items-center space-y-2
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset
                    hover:bg-gray-50 ${isActive ? 'bg-blue-50' : ''}`}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`${tab.id}-panel`}
                >
                  {/* Icon */}
                  <Icon className={`${getIconClasses(isActive)} h-5 w-5`} />
                  
                  {/* Label and Count */}
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-sm">{tab.label}</span>
                    {tab.count !== undefined && tab.count > 0 && (
                      <Badge 
                        variant="secondary" 
                        size="sm"
                        className={getBadgeClasses(isActive)}
                      >
                        {tab.count > 999 ? '999+' : tab.count}
                      </Badge>
                    )}
                  </div>
                  
                  {/* Description */}
                  <span className={`text-xs transition-colors duration-200 ${
                    isActive 
                      ? 'text-blue-500' 
                      : 'text-gray-400 group-hover:text-gray-500'
                  }`}>
                    {tab.description}
                  </span>

                  {/* Active Indicator */}
                  <div className={getIndicatorClasses(isActive)} />
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
};