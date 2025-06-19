// components/BudgetTabs.tsx
import React from 'react';
import { 
  BarChart3, 
  Target, 
  DollarSign, 
  TrendingUp, 
  Users,
  FileText 
} from 'lucide-react';
import { BudgetSummary } from '../types';
import { Badge } from './ui';


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
      icon: BarChart3,
      description: 'Budget summary and insights',
      color: 'blue',
    },
    {
      id: 'categories',
      label: 'Categories',
      icon: Target,
      description: 'Manage income and expense categories',
      count: categoriesCount,
      color: 'purple',
    },
    {
      id: 'transactions',
      label: 'Transactions',
      icon: DollarSign,
      description: 'View and manage all transactions',
      count: transactionsCount,
      color: 'green',
    },
  ];

  const getTabColorClasses = (tab: TabConfig, isActive: boolean) => {
    const colorMap = {
      blue: {
        active: 'border-blue-500 text-blue-600 bg-blue-50',
        inactive: 'border-transparent text-gray-500 hover:text-blue-600 hover:border-blue-300',
        icon: isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-500',
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
                className={`group relative min-w-0 flex-1 sm:flex-none py-4 px-6 border-b-2 font-medium text-sm whitespace-nowrap transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
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

                {/* Active indicator */}
                {isActive && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-0.5 bg-gradient-to-r from-transparent via-current to-transparent opacity-75"></div>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Summary Bar for Active Tab */}
      {summary && (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
          <div className="flex items-center justify-between text-sm">
            {activeTab === 'overview' && (
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-gray-600">Net Income:</span>
                  <span className={`font-semibold ${
                    summary.netActual >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    ₱{summary.netActual.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4 text-blue-600" />
                  <span className="text-gray-600">Budget Utilization:</span>
                  <span className="font-semibold text-blue-600">
                    {summary.totalPlannedExpenses > 0 
                      ? Math.round((summary.totalActualExpenses / summary.totalPlannedExpenses) * 100)
                      : 0
                    }%
                  </span>
                </div>
              </div>
            )}
            
            {activeTab === 'categories' && (
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-purple-600" />
                  <span className="text-gray-600">Active Categories:</span>
                  <span className="font-semibold text-purple-600">{categoriesCount}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Target className="h-4 w-4 text-green-600" />
                  <span className="text-gray-600">Total Planned:</span>
                  <span className="font-semibold text-green-600">
                    ₱{(summary.totalPlannedIncome + summary.totalPlannedExpenses).toLocaleString()}
                  </span>
                </div>
              </div>
            )}
            
            {activeTab === 'transactions' && (
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-green-600" />
                  <span className="text-gray-600">Total Transactions:</span>
                  <span className="font-semibold text-green-600">{transactionsCount}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-blue-600" />
                  <span className="text-gray-600">Total Amount:</span>
                  <span className="font-semibold text-blue-600">
                    ₱{(summary.totalActualIncome + summary.totalActualExpenses).toLocaleString()}
                  </span>
                </div>
              </div>
            )}
            
            <div className="text-xs text-gray-400">
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetTabs;