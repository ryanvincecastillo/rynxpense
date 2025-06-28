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
  Minus,
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

    // Get all categories first, then filter by type
    const allFiltered = {
      income: filterCategory(categoriesData.income || []),
      expense: filterCategory(categoriesData.expense || []),
    };

    // Apply type filter
    if (filters.type === 'INCOME') {
      return { income: allFiltered.income, expense: [] };
    } else if (filters.type === 'EXPENSE') {
      return { income: [], expense: allFiltered.expense };
    } else {
      return allFiltered;
    }
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
          !category.isActive ? 'opacity-60 bg-gray-50' : 'bg-white hover:bg-gray-50'
        }`}
        style={{ 
          backgroundColor: !category.isActive ? undefined : `${category.color || '#6B7280'}08`,
          borderColor: `${category.color || '#6B7280'}30`
        }}
      >
        <div className="flex-1 min-w-0">
          {/* Category Header */}
          <div className="flex items-start justify-between mb-1 sm:mb-2">
            <div className="flex items-center space-x-2 min-w-0 flex-1">
              <div 
                className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full flex-shrink-0" 
                style={{ backgroundColor: category.color || '#6B7280' }}
              />
              <h4 className="text-xs sm:text-sm font-medium text-gray-900 truncate">{category.name}</h4>
            </div>
          </div>

          {/* Amounts */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="text-gray-500">Planned:</span>
              <span className="font-medium text-gray-900">{formatCurrency(category.plannedAmount)}</span>
            </div>
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="text-gray-500">Actual:</span>
              <span className={`font-medium ${
                type === 'INCOME' ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatCurrency(category.actualAmount)}
              </span>
            </div>

            {/* Variance */}
            {hasVariance && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Variance:</span>
                <span className={`font-medium ${
                  isOverBudget ? 'text-red-600' :
                  isUnderIncome ? 'text-orange-600' :
                  'text-green-600'
                }`}>
                  {category.actualAmount > category.plannedAmount ? '+' : ''}
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

        {/* Action Menu */}
        <div className="relative ml-1 sm:ml-2">
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
            <div className="absolute right-0 top-full mt-1 w-32 sm:w-36 bg-white border border-gray-200 rounded-md shadow-lg z-10">
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
              <div className="border-t border-gray-100"></div>
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

  // Empty State Component - Match TransactionList design
  const EmptyState: React.FC<{ 
    type: 'INCOME' | 'EXPENSE'; 
    onAdd: () => void;
  }> = ({ type, onAdd }) => {
    const isIncome = type === 'INCOME';
    const IconComponent = isIncome ? TrendingUp : TrendingDown;
    
    return (
      <div className="text-center py-8 text-gray-500">
        <div className="mb-3">
          <IconComponent className={`h-8 w-8 mx-auto ${isIncome ? 'text-green-400' : 'text-red-400'}`} />
        </div>
        <p className="text-sm mb-3">No {isIncome ? 'income' : 'expense'} categories yet</p>
        <Button 
          variant="ghost"
          size="sm"
          onClick={onAdd}
          className={type === 'INCOME' ? 'border-green-200 text-green-600 hover:bg-green-50' : 'border-red-200 text-red-600 hover:bg-red-50'}
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
    <div className="space-y-4">
      {/* Modern Header with Search and Filters - Consistent with Transactions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search categories..."
              value={filters.search}
              onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
              className="w-full sm:w-64 pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
            />
          </div>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto justify-between">
          {/* Category Type Filter Pills - Only visible on mobile, similar to Transactions */}
          <div className="flex sm:hidden items-center">
            <div className="inline-flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => onFiltersChange({ ...filters, type: '' })}
                className={`inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  filters.type === ''
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                All
              </button>
              <button
                onClick={() => onFiltersChange({ ...filters, type: 'INCOME' })}
                className={`inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  filters.type === 'INCOME'
                    ? 'bg-white text-emerald-700 shadow-sm'
                    : 'text-gray-600 hover:text-emerald-700'
                }`}
              >
                <TrendingUp className="h-3 w-3 mr-1" />
                Income
              </button>
              <button
                onClick={() => onFiltersChange({ ...filters, type: 'EXPENSE' })}
                className={`inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  filters.type === 'EXPENSE'
                    ? 'bg-white text-red-700 shadow-sm'
                    : 'text-gray-600 hover:text-red-700'
                }`}
              >
                <TrendingDown className="h-3 w-3 mr-1" />
                Expense
              </button>
            </div>
          </div>

          {/* Filter Button - Now on the right */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center px-3 py-2 border rounded-lg text-sm font-medium transition-all ${
                hasActiveFilters
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {hasActiveFilters && (
                <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {Object.values(filters).filter(v => v !== undefined && v !== '' && v !== false).length}
                </span>
              )}
            </button>

            {/* Add Category */}
            <button 
              onClick={() => onCategoryAction('create')} 
              className="hidden sm:inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </button>
          </div>
        </div>
      </div>

      {/* Modern Filter Panel */}
      {showFilters && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Filter Categories</h3>
            {hasActiveFilters && (
              <button
                onClick={() => {
                  onFiltersChange({
                    type: '',
                    showInactive: false,
                    search: '',
                  });
                }}
                className="inline-flex items-center px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <X className="h-4 w-4 mr-1.5" />
                Clear all
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-3">Category Type</label>
              <div className="space-y-2">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="type"
                    checked={filters.type === ''}
                    onChange={() => onFiltersChange({ ...filters, type: '' })}
                    className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="ml-3 text-sm text-gray-700">All categories</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="type"
                    checked={filters.type === 'INCOME'}
                    onChange={() => onFiltersChange({ ...filters, type: 'INCOME' })}
                    className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="ml-3 text-sm text-gray-700 flex items-center">
                    <TrendingUp className="h-4 w-4 mr-2 text-green-600" />
                    Income only
                  </span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="type"
                    checked={filters.type === 'EXPENSE'}
                    onChange={() => onFiltersChange({ ...filters, type: 'EXPENSE' })}
                    className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="ml-3 text-sm text-gray-700 flex items-center">
                    <TrendingDown className="h-4 w-4 mr-2 text-red-600" />
                    Expense only
                  </span>
                </label>
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-3">Status</label>
              <div className="space-y-2">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.showInactive}
                    onChange={(e) => onFiltersChange({ ...filters, showInactive: e.target.checked })}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-3 text-sm text-gray-700 flex items-center">
                    <EyeOff className="h-4 w-4 mr-2 text-gray-500" />
                    Show inactive categories
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">Active filters:</span>
                <div className="flex flex-wrap gap-2">
                  {filters.type && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {filters.type === 'INCOME' ? 'Income' : 'Expense'} only
                      <button
                        onClick={() => onFiltersChange({ ...filters, type: '' })}
                        className="ml-1.5 h-3 w-3 text-blue-600 hover:text-blue-800"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {filters.showInactive && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      Including inactive
                      <button
                        onClick={() => onFiltersChange({ ...filters, showInactive: false })}
                        className="ml-1.5 h-3 w-3 text-gray-600 hover:text-gray-800"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
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
            <button 
              onClick={() => onCategoryAction('create')}
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create First Category
            </button>
          </div>
        </div>
      ) : hasNoCategories ? (
        <div className="bg-white border border-gray-200 rounded-lg p-8">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <Filter className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Categories Match Your Filters</h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search or filter criteria.
            </p>
            <button
              onClick={() => {
                onFiltersChange({
                  type: '',
                  showInactive: false,
                  search: '',
                });
              }}
              className="inline-flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-6">
          {/* Income Categories Column */}
          <div className="space-y-3 min-w-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 bg-green-100 rounded-md flex items-center justify-center">
                    <Plus className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                </div>
                {/* <Plus className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" /> */}
                <div>
                  <h4 className="text-xs sm:text-sm font-semibold text-gray-900">Income Categories</h4>
                  <p className="text-xs text-gray-500">
                    {filteredCategories.income.length} categories
                  </p>
                </div>
              </div>
              <button 
                onClick={() => onCategoryAction('create', undefined, { type: 'INCOME' })}
                className="text-green-600 hover:text-green-700 p-0.5 sm:p-1 rounded hover:bg-green-50 transition-colors"
                title="Add Income Category"
              >
                <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
              </button>
            </div>

            <div className="space-y-2 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 420px)' }}>
              {filteredCategories.income.length > 0 ? (
                filteredCategories.income.map((category) => (
                  <CategoryItem
                    key={category.id}
                    category={category}
                    type="INCOME"
                  />
                ))
              ) : (
                <EmptyState 
                  type="INCOME" 
                  onAdd={() => onCategoryAction('create', undefined, { type: 'INCOME' })} 
                />
              )}
            </div>
          </div>

          {/* Expense Categories Column */}
          <div className="space-y-3 min-w-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 bg-red-100 rounded-md flex items-center justify-center">
                  <Minus className="h-3 w-3 sm:h-4 sm:w-4 text-red-600" />
                </div>
                {/* <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-red-600" /> */}
                <div>
                  <h4 className="text-xs sm:text-sm font-semibold text-gray-900">Expense Categories</h4>
                  <p className="text-xs text-gray-500">
                    {filteredCategories.expense.length} categories
                  </p>
                </div>
              </div>
              <button 
                onClick={() => onCategoryAction('create', undefined, { type: 'EXPENSE' })}
                className="text-red-600 hover:text-red-700 p-0.5 sm:p-1 rounded hover:bg-red-50 transition-colors"
                title="Add Expense Category"
              >
                <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
              </button>
            </div>

            <div className="space-y-2 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 420px)' }}>
              {filteredCategories.expense.length > 0 ? (
                filteredCategories.expense.map((category) => (
                  <CategoryItem
                    key={category.id}
                    category={category}
                    type="EXPENSE"
                  />
                ))
              ) : (
                <EmptyState 
                  type="EXPENSE" 
                  onAdd={() => onCategoryAction('create', undefined, { type: 'EXPENSE' })} 
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Add Button */}
      <div className="sm:hidden fixed bottom-6 right-6">
        <button 
          onClick={() => onCategoryAction('create')}
          className="w-14 h-14 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center"
        >
          <Plus className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
};