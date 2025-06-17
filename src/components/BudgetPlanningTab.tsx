import React, { useMemo, useState } from 'react';
import { 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  Edit3, 
  Trash2, 
  Eye, 
  EyeOff,
  Target,
  PieChart,
  DollarSign,
  Calendar,
  Filter,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';
import { BudgetCategoriesResponse, BudgetCategory } from '../types';
import { Badge, Button, Card, EmptyState, ProgressBar, Select, Input } from './ui';

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
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

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

  // Calculate progress for a category
  const getCategoryProgress = (category: BudgetCategory) => {
    if (category.plannedAmount === 0) return 0;
    return Math.min((category.actualAmount / category.plannedAmount) * 100, 100);
  };

  // Get status for a category
  const getCategoryStatus = (category: BudgetCategory) => {
    const progress = getCategoryProgress(category);
    const isIncome = category.type === 'INCOME';
    
    if (isIncome) {
      if (progress >= 100) return { status: 'excellent', color: 'green', icon: CheckCircle };
      if (progress >= 80) return { status: 'good', color: 'blue', icon: TrendingUp };
      if (progress >= 50) return { status: 'fair', color: 'yellow', icon: Clock };
      return { status: 'low', color: 'red', icon: AlertCircle };
    } else {
      if (progress > 100) return { status: 'over-budget', color: 'red', icon: AlertCircle };
      if (progress >= 90) return { status: 'near-limit', color: 'yellow', icon: AlertCircle };
      if (progress >= 70) return { status: 'on-track', color: 'blue', icon: TrendingUp };
      return { status: 'under-budget', color: 'green', icon: CheckCircle };
    }
  };

  // Enhanced Category Card Component
  const CategoryCard: React.FC<{ 
    category: BudgetCategory; 
    type: 'INCOME' | 'EXPENSE';
    isSelected: boolean;
    onClick: () => void;
  }> = ({ category, type, isSelected, onClick }) => {
    const progress = getCategoryProgress(category);
    const status = getCategoryStatus(category);
    const StatusIcon = status.icon;
    const isIncome = type === 'INCOME';

    return (
      <div 
        className={`group relative bg-white rounded-xl border-2 transition-all duration-200 cursor-pointer hover:shadow-lg ${
          isSelected 
            ? 'border-blue-500 shadow-lg ring-2 ring-blue-100' 
            : 'border-gray-200 hover:border-gray-300'
        } ${!category.isActive ? 'opacity-60' : ''}`}
        onClick={onClick}
      >
        {/* Selection indicator */}
        {isSelected && (
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
            <CheckCircle className="w-4 h-4 text-white" />
          </div>
        )}

        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <div
                className="w-4 h-4 rounded-full ring-2 ring-white shadow-sm flex-shrink-0"
                style={{ backgroundColor: category.color }}
              />
              <div className="min-w-0 flex-1">
                <h4 className="font-semibold text-gray-900 truncate">{category.name}</h4>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge 
                    variant={isIncome ? 'success' : 'error'} 
                    size="sm"
                  >
                    {category.type}
                  </Badge>
                  {!category.isActive && (
                    <Badge variant="secondary" size="sm">Inactive</Badge>
                  )}
                </div>
              </div>
            </div>
            
            {/* Action buttons */}
            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCategoryAction('toggleActive', category);
                }}
                className={`p-2 rounded-lg transition-colors ${
                  category.isActive 
                    ? 'text-gray-400 hover:text-yellow-600 hover:bg-yellow-50' 
                    : 'text-yellow-600 hover:text-gray-600 hover:bg-gray-50'
                }`}
                title={category.isActive ? "Deactivate category" : "Activate category"}
              >
                {category.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCategoryAction('edit', category);
                }}
                className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                title="Edit category"
              >
                <Edit3 className="h-4 w-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCategoryAction('delete', category);
                }}
                className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                title="Delete category"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Amount Information */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Current Amount</span>
              <span className={`font-bold text-lg ${isIncome ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(category.actualAmount)}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Planned Amount</span>
              <span className="font-medium text-gray-900">
                {formatCurrency(category.plannedAmount)}
              </span>
            </div>
            
            {/* Progress Bar and Status */}
            {category.plannedAmount > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <StatusIcon className={`h-4 w-4 text-${status.color}-600`} />
                    <span className="text-xs font-medium text-gray-600">
                      {progress.toFixed(1)}%
                    </span>
                  </div>
                  <span className={`text-xs font-medium text-${status.color}-600 capitalize`}>
                    {status.status.replace('-', ' ')}
                  </span>
                </div>
                <ProgressBar
                  value={category.actualAmount}
                  max={category.plannedAmount}
                  color={status.color as any}
                  size="sm"
                />
              </div>
            )}

            {/* Quick Stats */}
            <div className="pt-3 border-t border-gray-100">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <DollarSign className="h-3 w-3" />
                  <span>{category._count?.transactions || 0} transactions</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-3 w-3" />
                  <span>This month</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hover overlay for additional actions */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-blue-50 opacity-0 group-hover:opacity-20 rounded-xl transition-opacity pointer-events-none" />
      </div>
    );
  };



  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-32 bg-gray-200 rounded"></div>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-40 bg-gray-200 rounded"></div>
              </Card>
            ))}
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-40 bg-gray-200 rounded"></div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header with Enhanced Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <PieChart className="h-6 w-6 text-blue-600" />
            <span>Budget Planning</span>
          </h2>
          <p className="text-gray-600 mt-1">
            Plan and track your income and expense categories
          </p>
        </div>

        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative">
            <Input
              placeholder="Search categories..."
              value={filters.searchTerm}
              onChange={(e) => onFiltersChange({ ...filters, searchTerm: e.target.value })}
              className="w-64 pl-10"
            />
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>

          {/* Type Filter */}
          <Select
            value={filters.type}
            onChange={(e) => onFiltersChange({ ...filters, type: e.target.value as any })}
            options={[
              { value: '', label: 'All Types' },
              { value: 'INCOME', label: 'Income Only' },
              { value: 'EXPENSE', label: 'Expenses Only' },
            ]}
            className="w-40"
          />

          {/* Show Inactive Toggle */}
          <label className="flex items-center space-x-2 text-sm text-gray-600 whitespace-nowrap">
            <input
              type="checkbox"
              checked={filters.showInactive}
              onChange={(e) => onFiltersChange({ ...filters, showInactive: e.target.checked })}
              className="h-4 w-4 text-blue-600 rounded border-gray-300"
            />
            <span>Show inactive</span>
          </label>

          {/* Add Category Button */}
          <Button onClick={() => onCategoryAction('create')}>
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {/* Removed - Summary cards moved to main BudgetSummaryCards component */}

      {/* Main Content - Side by Side Lists */}
      {filteredCategories.income.length === 0 && filteredCategories.expense.length === 0 ? (
        <Card className="py-16">
          <EmptyState
            icon={PieChart}
            title="No Categories Found"
            description="Start planning your budget by creating income and expense categories."
            action={
              <div className="flex items-center space-x-3">
                <Button 
                  onClick={() => onCategoryAction('create')}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Add Income Category
                </Button>
                <Button 
                  onClick={() => onCategoryAction('create')}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <TrendingDown className="h-4 w-4 mr-2" />
                  Add Expense Category
                </Button>
              </div>
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Income Categories List */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Income Categories
                  </h3>
                  <p className="text-sm text-gray-500">
                    {filteredCategories.income.length} categories • Track your income sources
                  </p>
                </div>
              </div>
              <Button 
                size="sm" 
                onClick={() => onCategoryAction('create')}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Income
              </Button>
            </div>

            <div className="space-y-4">
              {filteredCategories.income.length === 0 ? (
                <Card className="py-12 border-2 border-dashed border-green-200 bg-green-50">
                  <div className="text-center">
                    <TrendingUp className="h-12 w-12 text-green-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-green-800 mb-2">
                      No Income Categories
                    </h4>
                    <p className="text-green-600 mb-4">
                      Add income categories like salary, freelance, or investments
                    </p>
                    <Button 
                      size="sm"
                      onClick={() => onCategoryAction('create')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Income Category
                    </Button>
                  </div>
                </Card>
              ) : (
                filteredCategories.income.map((category) => (
                  <CategoryCard
                    key={category.id}
                    category={category}
                    type="INCOME"
                    isSelected={selectedCategory === category.id}
                    onClick={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
                  />
                ))
              )}
            </div>
          </div>

          {/* Expense Categories List */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                  <TrendingDown className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Expense Categories
                  </h3>
                  <p className="text-sm text-gray-500">
                    {filteredCategories.expense.length} categories • Control your spending
                  </p>
                </div>
              </div>
              <Button 
                size="sm" 
                onClick={() => onCategoryAction('create')}
                className="bg-red-600 hover:bg-red-700"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Expense
              </Button>
            </div>

            <div className="space-y-4">
              {filteredCategories.expense.length === 0 ? (
                <Card className="py-12 border-2 border-dashed border-red-200 bg-red-50">
                  <div className="text-center">
                    <TrendingDown className="h-12 w-12 text-red-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-red-800 mb-2">
                      No Expense Categories
                    </h4>
                    <p className="text-red-600 mb-4">
                      Add expense categories like housing, food, or transportation
                    </p>
                    <Button 
                      size="sm"
                      onClick={() => onCategoryAction('create')}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Expense Category
                    </Button>
                  </div>
                </Card>
              ) : (
                filteredCategories.expense.map((category) => (
                  <CategoryCard
                    key={category.id}
                    category={category}
                    type="EXPENSE"
                    isSelected={selectedCategory === category.id}
                    onClick={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions Bar */}
      {(filteredCategories.income.length > 0 || filteredCategories.expense.length > 0) && (
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Budget Planning Tips</h4>
                <p className="text-sm text-gray-600">
                  Keep your budget balanced by ensuring income covers all planned expenses
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="secondary" size="sm">
                View Reports
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default BudgetPlanningTab;