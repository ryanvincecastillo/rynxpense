// components/CategoriesTab.tsx
import React, { useMemo, useState } from 'react';
import {
  Plus,
  Search,
  TrendingUp,
  TrendingDown,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  Target,
  DollarSign,
} from 'lucide-react';

// Types
import { BudgetCategoriesResponse, BudgetCategory } from '../types';

// UI Components
import {
  Button,
  Card,
  EmptyState,
  Input,
  Select,
  Badge,
  ProgressBar,
} from './ui';

// Interfaces
interface CategoryFilters {
  type: 'INCOME' | 'EXPENSE' | '';
  showInactive: boolean;
  search: string;
}

interface CategoriesTabProps {
  categoriesData: BudgetCategoriesResponse | undefined;
  filters: CategoryFilters;
  onFiltersChange: (filters: CategoryFilters) => void;
  onCategoryAction: (action: string, category?: BudgetCategory, data?: any) => void;
  formatCurrency: (amount: number) => string;
  isLoading: boolean;
}

// Category Performance Calculation
const getCategoryPerformance = (category: BudgetCategory): number => {
  if (category.plannedAmount === 0) return 0;
  return (category.actualAmount / category.plannedAmount) * 100;
};

// Performance Color Helper
const getPerformanceColor = (performance: number, isIncome: boolean): string => {
  if (isIncome) {
    // For income, higher is better
    if (performance >= 100) return 'text-green-600 bg-green-100';
    if (performance >= 80) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  } else {
    // For expenses, staying under budget is better
    if (performance <= 80) return 'text-green-600 bg-green-100';
    if (performance <= 100) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  }
};

// Category Card Component
const CategoryCard: React.FC<{
  category: BudgetCategory;
  onAction: (action: string, category: BudgetCategory) => void;
  formatCurrency: (amount: number) => string;
}> = ({ category, onAction, formatCurrency }) => {
  const performance = getCategoryPerformance(category);
  const isIncome = category.type === 'INCOME';
  const performanceColor = getPerformanceColor(performance, isIncome);
  
  const variance = category.actualAmount - category.plannedAmount;
  const isOverBudget = variance > 0 && !isIncome;
  const isUnderBudget = variance < 0 && !isIncome;

  return (
    <Card className="hover:shadow-lg transition-all duration-200 group">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div
              className="w-4 h-4 rounded-full ring-2 ring-white shadow-sm"
              style={{ backgroundColor: category.color }}
            />
            <div>
              <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                {category.name}
              </h4>
              <Badge 
                variant={isIncome ? 'success' : 'error'} 
                size="sm"
                className="mt-1"
              >
                {category.type}
              </Badge>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onAction('toggleActive', category)}
              className={`p-1.5 rounded-md transition-colors ${
                category.isActive
                  ? 'text-gray-400 hover:text-yellow-600 hover:bg-yellow-50'
                  : 'text-yellow-600 hover:text-gray-600 hover:bg-gray-50'
              }`}
              title={category.isActive ? 'Deactivate category' : 'Activate category'}
            >
              {category.isActive ? (
                <Eye className="h-4 w-4" />
              ) : (
                <EyeOff className="h-4 w-4" />
              )}
            </button>
            <button
              onClick={() => onAction('edit', category)}
              className="p-1.5 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
              title="Edit category"
            >
              <Edit3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => onAction('delete', category)}
              className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Delete category"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Description */}
        {category.description && (
          <p className="text-sm text-gray-600 line-clamp-2">
            {category.description}
          </p>
        )}

        {/* Amounts */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500">Planned:</span>
            <span className="font-medium text-gray-900">
              {formatCurrency(category.plannedAmount)}
            </span>
          </div>
          
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500">Actual:</span>
            <span className={`font-medium ${
              isIncome 
                ? 'text-green-600' 
                : category.actualAmount > category.plannedAmount 
                  ? 'text-red-600' 
                  : 'text-green-600'
            }`}>
              {formatCurrency(category.actualAmount)}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1">
            <ProgressBar
              value={Math.min(performance, 150)}
              max={150}
              variant={
                performance > 100 && !isIncome
                  ? 'danger'
                  : performance > 80
                    ? isIncome ? 'success' : 'warning'
                    : isIncome ? 'warning' : 'success'
              }
              size="sm"
              showPercentage={false}
            />
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-500">Progress</span>
              <Badge 
                variant="secondary" 
                size="sm"
                className={performanceColor}
              >
                {performance.toFixed(0)}%
              </Badge>
            </div>
          </div>

          {/* Variance */}
          {Math.abs(variance) > 0.01 && (
            <div className={`text-xs px-2 py-1 rounded-md ${
              variance > 0
                ? isIncome
                  ? 'bg-green-50 text-green-700'
                  : 'bg-red-50 text-red-700'
                : isIncome
                  ? 'bg-red-50 text-red-700'
                  : 'bg-green-50 text-green-700'
            }`}>
              {variance > 0 ? '+' : ''}{formatCurrency(variance)} vs planned
              {isOverBudget && ' (Over budget)'}
              {isUnderBudget && ' (Under budget)'}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{category._count?.transactions || 0} transactions</span>
            <span className={`font-medium ${
              category.isActive ? 'text-green-600' : 'text-gray-400'
            }`}>
              {category.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};

// Main Component
const CategoriesTab: React.FC<CategoriesTabProps> = ({
  categoriesData,
  filters,
  onFiltersChange,
  onCategoryAction,
  formatCurrency,
  isLoading,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Filter and process categories
  const filteredCategories = useMemo(() => {
    if (!categoriesData) return { income: [], expense: [] };

    const filterCategory = (categories: BudgetCategory[]) => {
      return categories.filter(cat => {
        // Active/Inactive filter
        if (!filters.showInactive && !cat.isActive) return false;
        
        // Type filter
        if (filters.type && cat.type !== filters.type) return false;
        
        // Search filter
        if (filters.search) {
          const searchTerm = filters.search.toLowerCase();
          return (
            cat.name.toLowerCase().includes(searchTerm) ||
            cat.description?.toLowerCase().includes(searchTerm)
          );
        }
        
        return true;
      });
    };

    return {
      income: filterCategory(categoriesData.income || []),
      expense: filterCategory(categoriesData.expense || []),
    };
  }, [categoriesData, filters]);

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    if (!categoriesData) return null;

    const allCategories = [...(categoriesData.income || []), ...(categoriesData.expense || [])];
    const activeCategories = allCategories.filter(cat => cat.isActive);
    const totalPlanned = allCategories.reduce((sum, cat) => sum + cat.plannedAmount, 0);
    const totalActual = allCategories.reduce((sum, cat) => sum + cat.actualAmount, 0);

    return {
      total: allCategories.length,
      active: activeCategories.length,
      totalPlanned,
      totalActual,
      variance: totalActual - totalPlanned,
    };
  }, [categoriesData]);

  // Handle filter changes
  const handleFilterChange = (key: keyof CategoryFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-40 bg-gray-200 rounded"></div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Categories Management</h2>
          <p className="text-sm text-gray-600 mt-1">
            Organize and track your budget categories
          </p>
        </div>
        
        <Button onClick={() => onCategoryAction('create')} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Search categories..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            leftIcon={Search}
            className="w-full"
          />
        </div>
        
        <Select
          value={filters.type}
          onChange={(e) => handleFilterChange('type', e.target.value as any)}
          options={[
            { value: '', label: 'All Types' },
            { value: 'INCOME', label: 'Income Only' },
            { value: 'EXPENSE', label: 'Expense Only' },
          ]}
          className="w-full sm:w-40"
        />
        
        <label className="flex items-center space-x-2 text-sm text-gray-600 whitespace-nowrap">
          <input
            type="checkbox"
            checked={filters.showInactive}
            onChange={(e) => handleFilterChange('showInactive', e.target.checked)}
            className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
          />
          <span>Show inactive</span>
        </label>
      </div>

      {/* Categories Content */}
      {filteredCategories.income.length === 0 && filteredCategories.expense.length === 0 ? (
        <Card>
          <EmptyState
            icon={filters.search ? Search : Plus}
            title={filters.search ? "No categories found" : "No categories yet"}
            description={
              filters.search
                ? "Try adjusting your search or filters to find categories."
                : "Create income and expense categories to organize your budget."
            }
            action={
              !filters.search ? (
                <Button onClick={() => onCategoryAction('create')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Category
                </Button>
              ) : undefined
            }
          />
        </Card>
      ) : (
        <div className="space-y-8">
          {/* Income Categories */}
          {filteredCategories.income.length > 0 && (
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Income Categories ({filteredCategories.income.length})
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCategories.income.map((category) => (
                  <CategoryCard
                    key={category.id}
                    category={category}
                    onAction={onCategoryAction}
                    formatCurrency={formatCurrency}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Expense Categories */}
          {filteredCategories.expense.length > 0 && (
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <TrendingDown className="h-5 w-5 text-red-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Expense Categories ({filteredCategories.expense.length})
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCategories.expense.map((category) => (
                  <CategoryCard
                    key={category.id}
                    category={category}
                    onAction={onCategoryAction}
                    formatCurrency={formatCurrency}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CategoriesTab;