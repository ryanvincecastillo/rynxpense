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
      icon: BarChart2,
      description: 'Budget summary and insights',
    },
    {
      id: 'categories',
      label: 'Budget Planning', //Changed from "Categories" to "Budget Planning"
      icon: Target,
      description: 'Manage income and expense categories',
      count: categoriesCount,
    },
    {
      id: 'transactions',
      label: 'Transactions',
      icon: ReceiptText,
      description: 'View and manage all transactions',
      count: transactionsCount,
    },
  ];

  const getTabClasses = (isActive: boolean) => {
    const baseClasses = "group relative flex-1 py-3 px-4 font-medium text-sm transition-all duration-200 border-b-2 hover:bg-gray-50";
    
    if (isActive) {
      return `${baseClasses} border-blue-500 text-blue-600 bg-blue-50`;
    }
    
    return `${baseClasses} border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300`;
  };

  const getIconClasses = (isActive: boolean) => {
    return `h-5 w-5 transition-colors ${
      isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'
    }`;
  };

  const getBadgeClasses = (isActive: boolean) => {
    return isActive ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600';
  };

  return (
    <div className="border-b border-gray-200 bg-white">
      <nav className="flex w-full">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={getTabClasses(isActive)}
              role="tab"
              aria-selected={isActive}
              aria-controls={`${tab.id}-panel`}
            >
              {/* Mobile Layout: Icon left, title right, no description */}
              <div className="flex items-center justify-center space-x-2 md:hidden">
                {/* <Icon className={getIconClasses(isActive)} /> */}
                <span className="font-semibold">{tab.label}</span>
                {/* {tab.count !== undefined && tab.count > 0 && (
                  <Badge 
                    variant="secondary" 
                    size="sm"
                    className={getBadgeClasses(isActive)}
                  >
                    {tab.count}
                  </Badge>
                )} */}
              </div>

              {/* Desktop Layout: Icon top, title and description below */}
              <div className="hidden md:flex md:flex-col md:items-center md:space-y-1">
                <Icon className={getIconClasses(isActive)} />
                
                <div className="flex flex-col items-center">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold">{tab.label}</span>
                    {tab.count !== undefined && tab.count > 0 && (
                      <Badge 
                        variant="secondary" 
                        size="sm"
                        className={getBadgeClasses(isActive)}
                      >
                        {tab.count}
                      </Badge>
                    )}
                  </div>
                  <span className={`text-xs mt-0.5 ${
                    isActive 
                      ? 'text-blue-500' 
                      : 'text-gray-400 group-hover:text-gray-500'
                  }`}>
                    {tab.description}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
