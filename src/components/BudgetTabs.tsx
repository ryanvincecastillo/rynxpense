// components/BudgetTabs.tsx
import React from 'react';
import { 
  BarChart3, 
  Target, 
  DollarSign, 
  TrendingUp, 
  Users,
  FileText, 
  CreditCard,
  Receipt,
  ReceiptText,
  BarChart2,
  BarChart,
  BarChart4
} from 'lucide-react';
import { BudgetSummary } from '../types';
import { Badge } from './ui';
import { Bar } from 'recharts';


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
  icon: React.ComponentType<any>;
  description: string;
  count?: number;
  color: string;
}

const BudgetTabs: React.FC<BudgetTabsProps> = ({
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
      color: 'blue',
    },
    {
      id: 'categories',
      label: 'Categories',
      icon: Target,
      description: 'Manage income and expense categories',
      color: 'blue',
    },
    {
      id: 'transactions',
      label: 'Transactions',
      icon: ReceiptText,
      description: 'View and manage all transactions',
      color: 'blue',
    },
  ];

  const getTabColorClasses = (tab: TabConfig, isActive: boolean) => {
    const colorMap = {
      blue: {
        active: 'text-blue-600 bg-blue-50',
        inactive: 'border-transparent text-gray-500',
        icon: isActive ? 'text-blue-600' : 'text-gray-400',
        badge: 'bg-blue-100 text-blue-700',
      },
      purple: {
        active: 'border-purple-500 text-purple-600 bg-purple-50',
        inactive: 'border-transparent text-gray-500 hover:text-purple-600 hover:border-purple-300',
        icon: isActive ? 'text-purple-600' : 'text-gray-400 group-hover:text-purple-500',
        badge: 'bg-purple-100 text-purple-700',
      },
      green: {
        active: 'border-green-500 text-green-600 bg-green-50',
        inactive: 'border-transparent text-gray-500 hover:text-green-600 hover:border-green-300',
        icon: isActive ? 'text-green-600' : 'text-gray-400 group-hover:text-green-500',
        badge: 'bg-green-100 text-green-700',
      },
    };

    return colorMap[tab.color as keyof typeof colorMap];
  };

  return (
    <div className="border-b border-gray-200 bg-white">
      <div className="flex overflow-x-auto">
        <nav className="-mb-px flex space-x-1 min-w-full px-4 sm:px-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const colors = getTabColorClasses(tab, isActive);

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`group relative min-w-0 flex-1 sm:flex-none py-4 px-6  font-medium text-sm whitespace-nowrap transition-all duration-200 ${
                  isActive ? colors.active : colors.inactive
                }`}
                role="tab"
                aria-selected={isActive}
                aria-controls={`${tab.id}-panel`}
              >
                <div className="flex items-center space-x-3">
                  {/* Tab Icon */}
                  <Icon className={`h-5 w-5 transition-colors ${colors.icon}`} />
                  
                  {/* Tab Content */}
                  <div className="flex flex-col items-start">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold">{tab.label}</span>
                      {tab.count !== undefined && tab.count > 0 && (
                        <Badge 
                          variant="secondary" 
                          size="sm"
                          className={isActive ? colors.badge : 'bg-gray-100 text-gray-600'}
                        >
                          {tab.count}
                        </Badge>
                      )}
                    </div>
                    <span className={`text-xs mt-0.5 ${
                      isActive 
                        ? 'text-gray-600' 
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
    </div>
  );
};

export default BudgetTabs;