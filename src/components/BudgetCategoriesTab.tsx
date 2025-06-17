import React, { useMemo } from 'react';
import { Plus, TrendingUp, TrendingDown, Edit3, Trash2, Eye, EyeOff } from 'lucide-react';
import { BudgetCategoriesResponse, BudgetCategory } from '../types';
import { Badge, Button, Card, EmptyState, ProgressBar, Select } from './ui';

interface CategoryFilters {
  type: 'INCOME' | 'EXPENSE' | '';
  showInactive: boolean;
}

interface BudgetCategoriesTabProps {
  categoriesData: BudgetCategoriesResponse | undefined;
  filters: CategoryFilters;
  onFiltersChange: (filters: CategoryFilters) => void;
  onCategoryAction: (action: string, category?: BudgetCategory, data?: any) => void;
  formatCurrency: (amount: number) => string;
  isLoading: boolean;
}

const BudgetCategoriesTab: React.FC<BudgetCategoriesTabProps> = ({
  categoriesData,
  filters,
  onFiltersChange,
  onCategoryAction,
  formatCurrency,
  isLoading,
}) => {
  // Calculate category performance
  const getCategoryPerformance = (category: BudgetCategory) => {
    if (category.plannedAmount === 0) return 0;
    return (category.actualAmount / category.plannedAmount) * 100;
  };

  // Filter categories
  const filteredCategories = useMemo(() => {
    if (!categoriesData) return { income: [], expense: [] };
    
    const filterCategory = (categories: BudgetCategory[]) => {
      return categories.filter(cat => {
        if (!filters.showInactive && !cat.isActive) return false;
        if (filters.type && cat.type !== filters.type) return false;
        return true;
      });
    };

    return {
      income: filterCategory(categoriesData.income || []),
      expense: filterCategory(categoriesData.expense || []),
    };
  }, [categoriesData, filters]);

  // Category Card Component
  const CategoryCard: React.FC<{ category: BudgetCategory; type: 'INCOME' | 'EXPENSE' }> = ({ 
    category, 
    type 
  }) => {
    const performance = getCategoryPerformance(category);
    const isIncome = type === 'INCOME';

    return (
      <Card className="hover:shadow-lg transition-shadow duration-200">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: category.color }}
            />
            <div>
              <h4 className="font-semibold text-gray-900">{category.name}</h4>
              <Badge variant={isIncome ? 'success' : 'error'} size="sm">
                {category.type}
              </Badge>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => onCategoryAction('toggleActive', category)}
              className={`p-1 transition-colors ${
                category.isActive 
                  ? 'text-gray-400 hover:text-yellow-600' 
                  : 'text-yellow-600 hover:text-gray-600'
              }`}
              title={category.isActive ? "Deactivate category" : "Activate category"}
            >
              {category.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </button>
            <button
              onClick={() => onCategoryAction('edit', category)}
              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
              title="Edit category"
            >
              <Edit3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => onCategoryAction('delete', category)}
              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
              title="Delete category"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Actual</span>
            <span className={`font-semibold ${isIncome ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(category.actualAmount)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Planned</span>
            <span className="font-medium text-gray-900">
              {formatCurrency(category.plannedAmount)}
            </span>
          </div>
          
          {category.plannedAmount > 0 && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-500">
                  {isIncome ? 'Progress' : 'Usage'}
                </span>
                <span className="text-xs text-gray-600">{performance.toFixed(1)}%</span>
              </div>
              <ProgressBar
                value={category.actualAmount}
                max={category.plannedAmount}
                color={
                  isIncome 
                    ? "green" 
                    : performance > 100 
                      ? "red" 
                      : performance > 80 
                        ? "yellow" 
                        : "blue"
                }
                size="sm"
              />
            </div>
          )}

          <div className="pt-3 border-t border-gray-200">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{category._count?.transactions || 0} transactions</span>
              <span className={`font-medium ${category.isActive ? 'text-green-600' : 'text-gray-400'}`}>
                {category.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-32 bg-gray-200 rounded"></div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Filters */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Categories Management</h2>
        <div className="flex items-center space-x-3">
          <Select
            value={filters.type}
            onChange={(e) => onFiltersChange({ ...filters, type: e.target.value as any })}
            options={[
              { value: '', label: 'All Types' },
              { value: 'INCOME', label: 'Income Categories' },
              { value: 'EXPENSE', label: 'Expense Categories' },
            ]}
            className="w-40"
          />
          <label className="flex items-center space-x-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={filters.showInactive}
              onChange={(e) => onFiltersChange({ ...filters, showInactive: e.target.checked })}
              className="h-4 w-4 text-blue-600 rounded border-gray-300"
            />
            <span>Show inactive</span>
          </label>
          <Button onClick={() => onCategoryAction('create')}>
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </div>
      </div>

      {/* Categories Grid */}
      {filteredCategories.income.length === 0 && filteredCategories.expense.length === 0 ? (
        <Card>
          <EmptyState
            icon={Plus}
            title="No Categories Found"
            description="Create income and expense categories to organize your budget."
            action={
              <Button onClick={() => onCategoryAction('create')}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Category
              </Button>
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
                  <CategoryCard key={category.id} category={category} type="INCOME" />
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
                  <CategoryCard key={category.id} category={category} type="EXPENSE" />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BudgetCategoriesTab;