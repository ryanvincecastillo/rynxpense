// components/BudgetTabs.tsx
import React from 'react';
import { ActiveTab } from '../hooks/useBudgetState';
import { BudgetSummary } from '../types';
import { Badge } from './ui';

interface BudgetTabsProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  summary: BudgetSummary | undefined;
}

const BudgetTabs: React.FC<BudgetTabsProps> = ({
  activeTab,
  onTabChange,
  summary,
}) => {
  const tabs = [
    { 
      id: 'overview' as ActiveTab, 
      label: 'Overview', 
      count: null 
    },
    { 
      id: 'budget-planning' as ActiveTab, 
      label: 'Budget Planning', 
      count: null
    },
    { 
      id: 'transactions' as ActiveTab, 
      label: 'Transactions', 
      count: summary?.transactionCount 
    },
  ];

  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex space-x-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center space-x-2 transition-colors ${
              activeTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== null && tab.count !== undefined && (
              <Badge variant="secondary" size="sm">
                {tab.count}
              </Badge>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default BudgetTabs;