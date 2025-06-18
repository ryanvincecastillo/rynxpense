import React, { useMemo, useState } from 'react';
import { 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  Search
} from 'lucide-react';
import { BudgetCategoriesResponse, BudgetCategory } from '../types';
import { Button } from './ui';

interface CategoryFilters {
  type: 'INCOME' | 'EXPENSE' | '';
  showInactive: boolean;
  searchTerm: string;
}

interface BudgetPlanningTabProps {
  categoriesData: BudgetCategoriesResponse | undefined;
  filters: CategoryFilters;
  onFiltersChange: (filters: CategoryFilters) => void;
  onCategoryAction: (action: string, category?: BudgetCategory, data?: any) => void;
  formatCurrency: (amount: number) => string;
  isLoading: boolean;
}

const BudgetPlanningTab: React.FC<BudgetPlanningTabProps> = ({
  categoriesData,
  filters,
  onFiltersChange,
  onCategoryAction,
  formatCurrency,
  isLoading,
}) => {
  // Filter categories based on filters
  const filteredCategories = useMemo(() => {
    if (!categoriesData) return { income: [], expense: [] };
    
    const filterCategory = (categories: BudgetCategory[]) => {
      return categories.filter(cat => {
        if (!filters.showInactive && !cat.isActive) return false;
        if (filters.searchTerm && !cat.name.toLowerCase().includes(filters.searchTerm.toLowerCase())) return false;
        return true;
      });
    };

    return {
      income: filterCategory(categoriesData.income || []),
      expense: filterCategory(categoriesData.expense || []),
    };
  }, [categoriesData, filters]);

  // Calculate performance percentage
  const getPerformance = (planned: number, actual: number) => {
    if (planned === 0) return 0;
    return (actual / planned) * 100;
  };

  // Compact Category Item Component
  const CategoryItem: React.FC<{ category: BudgetCategory; type: 'INCOME' | 'EXPENSE' }> = ({ 
    category, 
    type 
  }) => {
    const performance = getPerformance(category.plannedAmount, category.actualAmount);
    const isOverBudget = type === 'EXPENSE' && performance > 100;
    const isUnderIncome = type === 'INCOME' && performance < 100;
    
    return (
      <div 
        onClick={() => onCategoryAction('edit', category)}
        className={`flex items-start justify-between p-3 bg-white border rounded-lg hover:shadow-sm transition-all cursor-pointer ${
          !category.isActive ? 'opacity-60' : ''
        }`}>
        {/* Left: Category Info */}
        <div className="flex items-start space-x-3 flex-1 min-w-0">
          <div 
            className="w-3 h-3 rounded-full flex-shrink-0 mt-1"
            style={{ backgroundColor: category.color }}
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-sm font-medium text-gray-900 truncate">{category.name}</h4>
              <div className={`text-xs font-medium ml-2 ${
                isOverBudget || isUnderIncome ? 'text-red-600' : 'text-green-600'
              }`}>
                {performance.toFixed(0)}%
              </div>
            </div>
            <div className="text-xs text-gray-500 space-y-0.5">
              <div>Planned: <span className="font-medium text-gray-700">{formatCurrency(category.plannedAmount)}</span></div>
              <div>Actual: <span className="font-medium text-gray-700">{formatCurrency(category.actualAmount)}</span></div>
            </div>
            {!category.isActive && (
              <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 mt-1 inline-block">Inactive</span>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Empty State Component
  const EmptyState: React.FC<{ type: 'INCOME' | 'EXPENSE'; onAdd: () => void }> = ({ 
    type, 
    onAdd 
  }) => (
    <div className="text-center p-6 border-2 border-dashed border-gray-200 rounded-lg">
      <div className={`w-8 h-8 mx-auto mb-3 rounded-lg flex items-center justify-center ${
        type === 'INCOME' ? 'bg-green-100' : 'bg-red-100'
      }`}>
        {type === 'INCOME' ? 
          <TrendingUp className="h-4 w-4 text-green-600" /> : 
          <TrendingDown className="h-4 w-4 text-red-600" />
        }
      </div>
      <p className="text-sm text-gray-600 mb-3">
        No {type.toLowerCase()} categories yet
      </p>
      <button 
        onClick={onAdd}
        className={`text-xs px-3 py-1.5 rounded-lg font-medium ${
          type === 'INCOME' 
            ? 'bg-green-600 hover:bg-green-700 text-white' 
            : 'bg-red-600 hover:bg-red-700 text-white'
        }`}
      >
        <Plus className="h-3 w-3 mr-1 inline" />
        Add {type === 'INCOME' ? 'Income' : 'Expense'}
      </button>
    </div>
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Compact Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Budget Planning</h3>
          <p className="text-sm text-gray-600">Plan and track your income and expense categories</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={filters.searchTerm}
              onChange={(e) => onFiltersChange({ ...filters, searchTerm: e.target.value })}
              className="w-full sm:w-40 pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Show Inactive */}
          <label className="flex items-center space-x-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={filters.showInactive}
              onChange={(e) => onFiltersChange({ ...filters, showInactive: e.target.checked })}
              className="h-4 w-4 text-blue-600 rounded border-gray-300"
            />
            <span>Inactive</span>
          </label>

          {/* Add Button */}
          <Button 
            onClick={() => onCategoryAction('create', undefined, { preselectedType: undefined })}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center space-x-1"
          >
            <Plus className="h-4 w-4" />
            <span>Add</span>
          </Button>
        </div>
      </div>

      {/* Side by Side Categories - Always 2 columns on all screens */}
      <div className="grid grid-cols-2 gap-4">
        {/* Income Column */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <div>
                <h4 className="text-sm font-semibold text-gray-900">Income Categories</h4>
                <p className="text-xs text-gray-500">{filteredCategories.income.length} categories • Track your income sources</p>
              </div>
            </div>
            <button 
              onClick={() => onCategoryAction('create', undefined, { type: 'INCOME', preselectedType: 'INCOME' })}
              className="text-green-600 hover:text-green-700 p-1"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-2">
            {filteredCategories.income.length === 0 ? (
              <EmptyState 
                type="INCOME" 
                onAdd={() => onCategoryAction('create', undefined, { type: 'INCOME' })} 
              />
            ) : (
              filteredCategories.income.map((category) => (
                <CategoryItem key={category.id} category={category} type="INCOME" />
              ))
            )}
          </div>
        </div>

        {/* Expense Column */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendingDown className="h-4 w-4 text-red-600" />
              <div>
                <h4 className="text-sm font-semibold text-gray-900">Expense Categories</h4>
                <p className="text-xs text-gray-500">{filteredCategories.expense.length} categories • Control your spending</p>
              </div>
            </div>
            <button 
              onClick={() => onCategoryAction('create', undefined, { type: 'EXPENSE', preselectedType: 'EXPENSE' })}
              className="text-red-600 hover:text-red-700 p-1"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-2">
            {filteredCategories.expense.length === 0 ? (
              <EmptyState 
                type="EXPENSE" 
                onAdd={() => onCategoryAction('create', undefined, { type: 'EXPENSE' })} 
              />
            ) : (
              filteredCategories.expense.map((category) => (
                <CategoryItem key={category.id} category={category} type="EXPENSE" />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetPlanningTab;