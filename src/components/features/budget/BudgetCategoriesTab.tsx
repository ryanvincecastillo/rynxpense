import React, { useMemo, useState } from 'react';
import { 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  Search,
  MoreVertical,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Filter,
  X,
} from 'lucide-react';
import { BudgetCategoriesResponse, BudgetCategory } from '../../../types';
import { Button } from '../../ui';

interface CategoryFilters {
  type: 'INCOME' | 'EXPENSE' | '';
  showInactive: boolean;
  search: string;
}

interface BudgetCategoriesTabProps {
  categoriesData: BudgetCategoriesResponse | undefined;
  filters: CategoryFilters;
  onFiltersChange: (filters: CategoryFilters) => void;
  onCategoryAction: (action: string, category?: BudgetCategory, data?: any) => void;
  formatCurrency: (amount: number) => string;
  isLoading: boolean;
}

export const BudgetCategoriesTab: React.FC<BudgetCategoriesTabProps> = ({
  categoriesData,
  filters,
  onFiltersChange,
  onCategoryAction,
  formatCurrency,
  isLoading,
}) => {
  const [showFilters, setShowFilters] = useState(false);

  // Filter categories based on filters
  const filteredCategories = useMemo(() => {
    if (!categoriesData) return { income: [], expense: [] };
    
    const filterCategory = (categories: BudgetCategory[]) => {
      return categories.filter(cat => {
        if (!filters.showInactive && !cat.isActive) return false;
        if (filters.search && !cat.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
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
    if (planned === 0) return actual > 0 ? 100 : 0;
    return (actual / planned) * 100;
  };

  // Check if any filters are active
  const hasActiveFilters = !!(filters.search || filters.showInactive);

  // Compact Category Item Component
  const CategoryItem: React.FC<{ category: BudgetCategory; type: 'INCOME' | 'EXPENSE' }> = ({ 
    category, 
    type 
  }) => {
    const [showActions, setShowActions] = useState(false);
    const performance = getPerformance(category.plannedAmount, category.actualAmount);
    const isOverBudget = type === 'EXPENSE' && performance > 100;
    const isUnderIncome = type === 'INCOME' && performance < 100;
    const hasVariance = Math.abs(category.actualAmount - category.plannedAmount) > 0;
    
    return (
      <div 
        onClick={() => onCategoryAction('edit', category)}
        className={`relative group flex items-start justify-between p-2 sm:p-3 border rounded-lg hover:shadow-sm transition-all cursor-pointer ${
          !category.isActive ? 'opacity-60' : ''
        }`}
        style={{ 
          backgroundColor: `${category.color}08`,
          borderColor: `${category.color}30`
        }}
      >
        <div className="flex items-start flex-1 min-w-0">
          {/* Category Color Indicator */}
          <div 
            className="w-2 h-2 sm:w-3 sm:h-3 rounded-full mt-1 mr-2 sm:mr-3 flex-shrink-0 hidden sm:block"
            style={{ backgroundColor: category.color }}
          />
          
          <div className="min-w-0 flex-1">
            {/* Header Row */}
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-xs sm:text-sm font-medium text-gray-900 truncate pr-1">
                {category.name}
              </h4>
              <div className={`text-xs font-medium ${
                isOverBudget || isUnderIncome ? 'text-red-600' : 'text-green-600'
              }`}>
                {performance.toFixed(0)}%
              </div>
            </div>

            {/* Amount Information */}
            <div className="text-xs text-gray-500 space-y-0.5">
              <div className="flex items-center justify-between">
                <span>Actual:</span>
                <span className="font-medium text-gray-700">
                  {formatCurrency(category.actualAmount)}
                </span>
              </div>
              
              {category.plannedAmount > 0 && (
                <div className="flex items-center justify-between">
                  <span>Planned:</span>
                  <span className="font-medium text-gray-700">
                    {formatCurrency(category.plannedAmount)}
                  </span>
                </div>
              )}

              {hasVariance && (
                <div className="flex items-center justify-between">
                  <span>Variance:</span>
                  <span className={`font-medium ${
                    isOverBudget || isUnderIncome ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {category.actualAmount >= category.plannedAmount ? '+' : ''}
                    {formatCurrency(category.actualAmount - category.plannedAmount)}
                  </span>
                </div>
              )}
            </div>

            {/* Progress Bar */}
            {category.plannedAmount > 0 && (
              <div className="mt-1 sm:mt-2">
                <div className="w-full bg-gray-200 rounded-full h-1 sm:h-1.5">
                  <div 
                    className={`h-1 sm:h-1.5 rounded-full transition-all ${
                      isOverBudget ? 'bg-red-500' :
                      isUnderIncome ? 'bg-orange-500' :
                      'bg-green-500'
                    }`}
                    style={{ 
                      width: `${Math.min(performance, 100)}%`
                    }}
                  />
                </div>
              </div>
            )}

            {/* Footer Information */}
            <div className="flex items-center justify-between text-xs text-gray-500 mt-1 sm:mt-2 pt-1 border-t border-gray-100">
              <span>{category._count?.transactions || 0} transaction(s)</span>
              <span className={`font-medium ${
                category.isActive ? 'text-green-600' : 'text-gray-400'
              }`}>
                {category.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>

        {/* Action Menu */}
        <div className="relative ml-1 sm:ml-2 hidden sm:block">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowActions(!showActions);
            }}
            className="p-0.5 sm:p-1 rounded hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreVertical className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
          </button>

          {showActions && (
            <div className="absolute right-0 top-full mt-1 w-28 sm:w-32 bg-white border border-gray-200 rounded-md shadow-lg z-10">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCategoryAction('edit', category);
                  setShowActions(false);
                }}
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-left text-xs text-gray-700 hover:bg-gray-50 flex items-center"
              >
                <Edit2 className="h-3 w-3 mr-1 sm:mr-2" />
                Edit
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCategoryAction('toggleActive', category);
                  setShowActions(false);
                }}
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-left text-xs text-gray-700 hover:bg-gray-50 flex items-center"
              >
                {category.isActive ? <EyeOff className="h-3 w-3 mr-1 sm:mr-2" /> : <Eye className="h-3 w-3 mr-1 sm:mr-2" />}
                {category.isActive ? 'Deactivate' : 'Activate'}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCategoryAction('delete', category);
                  setShowActions(false);
                }}
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-left text-xs text-red-600 hover:bg-red-50 flex items-center"
              >
                <Trash2 className="h-3 w-3 mr-1 sm:mr-2" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Empty State Component
  const EmptyState: React.FC<{ 
    type: 'INCOME' | 'EXPENSE'; 
    onAdd: () => void; 
  }> = ({ type, onAdd }) => {
    const isIncome = type === 'INCOME';
    const IconComponent = isIncome ? TrendingUp : TrendingDown;
    
    return (
      <div className="text-center py-8 px-4">
        <div className={`w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center ${
          isIncome ? 'bg-green-100' : 'bg-red-100'
        }`}>
          <IconComponent className={`h-6 w-6 ${isIncome ? 'text-green-600' : 'text-red-600'}`} />
        </div>
        <h3 className="text-sm font-medium text-gray-900 mb-2">
          No {isIncome ? 'Income' : 'Expense'} Categories
        </h3>
        <p className="text-xs text-gray-600 mb-4">
          Create categories to organize your {isIncome ? 'income sources' : 'expenses'}
        </p>
        <Button
          size="sm"
          onClick={onAdd}
          className={`text-white ${
            isIncome ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
          }`}
        >
          <Plus className="h-3 w-3 mr-1" />
          Add {isIncome ? 'Income' : 'Expense'} Category
        </Button>
      </div>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="h-6 sm:h-8 bg-gray-200 rounded w-48 sm:w-64 animate-pulse" />
          <div className="flex items-center space-x-3">
            <div className="h-10 bg-gray-200 rounded w-48 animate-pulse" />
            <div className="h-10 bg-gray-200 rounded w-20 animate-pulse" />
            <div className="h-10 bg-gray-200 rounded w-32 animate-pulse" />
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="grid grid-cols-2 gap-3 sm:gap-6">
          {[1, 2].map((col) => (
            <div key={col} className="space-y-3">
              <div className="h-4 sm:h-6 bg-gray-200 rounded w-32 sm:w-48 animate-pulse" />
              <div className="space-y-2">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="h-16 sm:h-20 bg-gray-200 rounded animate-pulse" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const hasCategories = categoriesData && (categoriesData.income?.length > 0 || categoriesData.expense?.length > 0);
  const hasNoCategories = filteredCategories.income.length === 0 && filteredCategories.expense.length === 0;

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Categories Management</h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            {(categoriesData?.income?.length || 0) + (categoriesData?.expense?.length || 0)} total • {filteredCategories.income.length} income • {filteredCategories.expense.length} expense
          </p>
        </div>

        {/* Minimalist Controls */}
        <div className="flex items-center space-x-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search categories..."
              value={filters.search}
              onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500 w-48"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium border transition-colors ${
              showFilters || hasActiveFilters
                ? 'bg-blue-50 border-blue-200 text-blue-700'
                : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
            {hasActiveFilters && (
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
            )}
          </button>

          {/* Add Category */}
          <Button onClick={() => onCategoryAction('create')}>
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </div>
      </div>

      {/* Collapsible Filters */}
      {showFilters && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-900">Filter Options</h3>
            {hasActiveFilters && (
              <button
                onClick={() => {
                  onFiltersChange({
                    type: '',
                    showInactive: false,
                    search: '',
                  });
                }}
                className="flex items-center space-x-1 text-xs text-gray-500 hover:text-gray-700"
              >
                <X className="h-3 w-3" />
                <span>Clear all</span>
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="flex items-center space-x-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={filters.showInactive}
                onChange={(e) => onFiltersChange({ ...filters, showInactive: e.target.checked })}
                className="h-4 w-4 text-blue-600 rounded border-gray-300"
              />
              <span>Show inactive categories</span>
            </label>
          </div>
        </div>
      )}

      {/* Main Content */}
      {!hasCategories ? (
        <div className="bg-white border border-gray-200 rounded-lg p-8">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <Plus className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Categories Yet</h3>
            <p className="text-gray-600 mb-6">
              Create income and expense categories to organize your budget.
            </p>
            <Button onClick={() => onCategoryAction('create')}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Category
            </Button>
          </div>
        </div>
      ) : hasNoCategories ? (
        <div className="bg-white border border-gray-200 rounded-lg p-8">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <Search className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Categories Found</h3>
            <p className="text-gray-600">
              Try adjusting your search or filters to find categories.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-6">
          {/* Income Column */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                <div>
                  <h4 className="text-xs sm:text-sm font-semibold text-gray-900">Income Categories</h4>
                  <p className="text-xs text-gray-500">
                    {filteredCategories.income.length} categories
                  </p>
                </div>
              </div>
              <button 
                onClick={() => onCategoryAction('create', undefined, { 
                  type: 'INCOME', 
                  preselectedType: 'INCOME' 
                })}
                className="text-green-600 hover:text-green-700 p-0.5 sm:p-1 rounded hover:bg-green-50 transition-colors"
                title="Add Income Category"
              >
                <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
              </button>
            </div>

            <div className="space-y-1 sm:space-y-2 max-h-80 sm:max-h-96 overflow-y-auto">
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
                <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-red-600" />
                <div>
                  <h4 className="text-xs sm:text-sm font-semibold text-gray-900">Expense Categories</h4>
                  <p className="text-xs text-gray-500">
                    {filteredCategories.expense.length} categories
                  </p>
                </div>
              </div>
              <button 
                onClick={() => onCategoryAction('create', undefined, { 
                  type: 'EXPENSE', 
                  preselectedType: 'EXPENSE' 
                })}
                className="text-red-600 hover:text-red-700 p-0.5 sm:p-1 rounded hover:bg-red-50 transition-colors"
                title="Add Expense Category"
              >
                <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
              </button>
            </div>

            <div className="space-y-1 sm:space-y-2 max-h-80 sm:max-h-96 overflow-y-auto">
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
      )}
    </div>
  );
};