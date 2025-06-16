import React, { useState } from 'react';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  TrendingUp,
  TrendingDown,
  Target,
  DollarSign,
  Filter,
  Search,
  BarChart3,
  Eye,
  EyeOff
} from 'lucide-react';
import { 
  useCategories, 
  useCreateCategory, 
  useUpdateCategory, 
  useDeleteCategory,
  useBudgets,
  useBudgetCategories
} from '../../hooks/useApi';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Button, 
  Card, 
  EmptyState, 
  LoadingSpinner, 
  Modal, 
  Input, 
  Select,
  Badge,
  Alert,
  ProgressBar
} from '../../components/ui';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { BudgetCategory, CategoryQueryParams } from '../../types';

// Form validation schema
const categorySchema = z.object({
  budgetId: z.string().min(1, 'Budget is required'),
  name: z.string().min(1, 'Category name is required').max(100, 'Name too long'),
  type: z.enum(['INCOME', 'EXPENSE'], { required_error: 'Category type is required' }),
  plannedAmount: z.number().min(0, 'Planned amount must be positive').optional().default(0),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format').optional(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

// Color options for categories
const incomeColors = ['#22C55E', '#10B981', '#059669', '#047857', '#065F46'];
const expenseColors = ['#EF4444', '#DC2626', '#B91C1C', '#991B1B', '#7F1D1D'];

const CategoriesPage: React.FC = () => {
  const { user } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<BudgetCategory | null>(null);
  const [selectedBudget, setSelectedBudget] = useState<string>('');
  const [categoryType, setCategoryType] = useState<'INCOME' | 'EXPENSE' | ''>('');
  const [showInactive, setShowInactive] = useState(false);
  const [filters, setFilters] = useState<CategoryQueryParams>({
    page: 1,
    limit: 50,
    isActive: true,
  });

  // API hooks
  const { data: budgetsResponse } = useBudgets();
  const { data: categoriesResponse, isLoading, error } = useCategories(filters);
  const { data: budgetCategoriesResponse } = useBudgetCategories(selectedBudget);
  const createCategoryMutation = useCreateCategory();
  const updateCategoryMutation = useUpdateCategory();
  const deleteCategoryMutation = useDeleteCategory();

  const budgets = budgetsResponse?.data || [];
  const categories = categoriesResponse?.data || [];
  const budgetCategories = budgetCategoriesResponse || null;

  // Form handling
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      plannedAmount: 0,
    },
  });

  const watchedType = watch('type');
  const watchedColor = watch('color');

  // Update color options when type changes
  React.useEffect(() => {
    if (watchedType && !watchedColor) {
      const colors = watchedType === 'INCOME' ? incomeColors : expenseColors;
      setValue('color', colors[0]);
    }
  }, [watchedType, watchedColor, setValue]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: user?.currency || 'PHP',
    }).format(amount);
  };

  // Handle filter changes
  const updateFilters = (newFilters: Partial<CategoryQueryParams>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  };

  // Handle create category
  const handleCreateCategory = async (data: CategoryFormData) => {
    try {
      await createCategoryMutation.mutateAsync(data);
      toast.success('Category created successfully!');
      setShowCreateModal(false);
      reset();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create category');
    }
  };

  // Handle edit category
  const handleEditCategory = (category: BudgetCategory) => {
    setEditingCategory(category);
    reset({
      budgetId: category.budgetId,
      name: category.name,
      type: category.type,
      plannedAmount: category.plannedAmount,
      color: category.color,
    });
    setShowCreateModal(true);
  };

  // Handle update category
  const handleUpdateCategory = async (data: CategoryFormData) => {
    if (!editingCategory) return;

    try {
      await updateCategoryMutation.mutateAsync({
        id: editingCategory.id,
        data: {
          name: data.name,
          plannedAmount: data.plannedAmount,
          color: data.color,
        },
      });
      toast.success('Category updated successfully!');
      setShowCreateModal(false);
      setEditingCategory(null);
      reset();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update category');
    }
  };

  // Handle toggle category active status
  const handleToggleActive = async (category: BudgetCategory) => {
    try {
      await updateCategoryMutation.mutateAsync({
        id: category.id,
        data: { isActive: !category.isActive },
      });
      toast.success(`Category ${category.isActive ? 'deactivated' : 'activated'} successfully!`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update category');
    }
  };

  // Handle delete category
  const handleDeleteCategory = async (category: BudgetCategory) => {
    if (!window.confirm(`Are you sure you want to delete "${category.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteCategoryMutation.mutateAsync(category.id);
      toast.success('Category deleted successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete category');
    }
  };

  // Close modal and reset form
  const closeModal = () => {
    setShowCreateModal(false);
    setEditingCategory(null);
    reset();
  };

  // Get color options based on category type
  const getColorOptions = (type: 'INCOME' | 'EXPENSE') => {
    return type === 'INCOME' ? incomeColors : expenseColors;
  };

  // Calculate category performance
  const getCategoryPerformance = (category: BudgetCategory) => {
    if (category.plannedAmount === 0) return 0;
    return (category.actualAmount / category.plannedAmount) * 100;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert type="error" className="mb-6">
        Failed to load categories. Please try again.
      </Alert>
    );
  }

  // Filter categories by type and budget
  const filteredCategories = categories.filter((category: { budgetId: string; type: string; isActive: any; }) => {
    if (selectedBudget && category.budgetId !== selectedBudget) return false;
    if (categoryType && category.type !== categoryType) return false;
    if (!showInactive && !category.isActive) return false;
    return true;
  });

  const incomeCategories = filteredCategories.filter((c: { type: string; }) => c.type === 'INCOME');
  const expenseCategories = filteredCategories.filter((c: { type: string; }) => c.type === 'EXPENSE');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-600">
            Organize your income and expense categories • {filteredCategories.length} categories
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="secondary">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </Button>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {budgetCategoriesResponse && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Total Planned Income</p>
                <p className="text-2xl font-bold text-green-800">
                  {formatCurrency(budgetCategoriesResponse.summary.totalPlannedIncome)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-700">Total Planned Expenses</p>
                <p className="text-2xl font-bold text-red-800">
                  {formatCurrency(budgetCategoriesResponse.summary.totalPlannedExpenses)}
                </p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-600" />
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Net Planned</p>
                <p className={`text-2xl font-bold ${
                  budgetCategoriesResponse.summary.netPlanned >= 0 ? 'text-blue-800' : 'text-red-800'
                }`}>
                  {formatCurrency(budgetCategoriesResponse.summary.netPlanned)}
                </p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">Categories</p>
                <p className="text-2xl font-bold text-purple-800">
                  {incomeCategories.length + expenseCategories.length}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search categories..."
                className="pl-10"
                // Note: You can add search functionality here if needed
              />
            </div>
            
            <Select
              placeholder="All Budgets"
              value={selectedBudget}
              onChange={(e) => {
                setSelectedBudget(e.target.value);
                updateFilters({ budgetId: e.target.value || undefined });
              }}
              options={budgets.map((budget: { id: any; name: any; }) => ({ value: budget.id, label: budget.name }))}
            />

            <Select
              placeholder="All Types"
              value={categoryType}
              onChange={(e) => {
                setCategoryType(e.target.value as 'INCOME' | 'EXPENSE' | '');
                updateFilters({ type: e.target.value as 'INCOME' | 'EXPENSE' || undefined });
              }}
              options={[
                { value: 'INCOME', label: 'Income Categories' },
                { value: 'EXPENSE', label: 'Expense Categories' },
              ]}
            />

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="showInactive"
                checked={showInactive}
                onChange={(e) => {
                  setShowInactive(e.target.checked);
                  updateFilters({ isActive: e.target.checked ? undefined : true });
                }}
                className="h-4 w-4 text-blue-600 rounded border-gray-300"
              />
              <label htmlFor="showInactive" className="text-sm text-gray-700">
                Show inactive
              </label>
            </div>
          </div>
        </div>
      </Card>

      {/* Categories Grid */}
      {filteredCategories.length === 0 ? (
        <Card>
          <EmptyState
            icon={DollarSign}
            title="No Categories Found"
            description="Create income and expense categories to organize your budget."
            action={
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Category
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="space-y-8">
          {/* Income Categories */}
          {incomeCategories.length > 0 && (
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Income Categories ({incomeCategories.length})
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {incomeCategories.map((category: BudgetCategory) => {
                  const performance = getCategoryPerformance(category);
                  return (
                    <Card key={category.id} className="hover:shadow-lg transition-shadow duration-200">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: category.color }}
                          />
                          <div>
                            <h3 className="font-semibold text-gray-900">{category.name}</h3>
                            <Badge variant="success" size="sm">
                              {category.type}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handleToggleActive(category)}
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
                            onClick={() => handleEditCategory(category)}
                            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                            title="Edit category"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(category)}
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
                          <span className="font-semibold text-green-600">
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
                              <span className="text-xs text-gray-500">Progress</span>
                              <span className="text-xs text-gray-600">{performance.toFixed(1)}%</span>
                            </div>
                            <ProgressBar
                              value={category.actualAmount}
                              max={category.plannedAmount}
                              color="green"
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
                })}
              </div>
            </div>
          )}

          {/* Expense Categories */}
          {expenseCategories.length > 0 && (
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <TrendingDown className="h-5 w-5 text-red-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Expense Categories ({expenseCategories.length})
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {expenseCategories.map((category: BudgetCategory) => {
                  const performance = getCategoryPerformance(category);
                  return (
                    <Card key={category.id} className="hover:shadow-lg transition-shadow duration-200">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: category.color }}
                          />
                          <div>
                            <h3 className="font-semibold text-gray-900">{category.name}</h3>
                            <Badge variant="error" size="sm">
                              {category.type}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handleToggleActive(category)}
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
                            onClick={() => handleEditCategory(category)}
                            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                            title="Edit category"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(category)}
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
                          <span className="font-semibold text-red-600">
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
                              <span className="text-xs text-gray-500">Usage</span>
                              <span className="text-xs text-gray-600">{performance.toFixed(1)}%</span>
                            </div>
                            <ProgressBar
                              value={category.actualAmount}
                              max={category.plannedAmount}
                              color={performance > 100 ? "red" : performance > 80 ? "yellow" : "blue"}
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
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create/Edit Category Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={closeModal}
        title={editingCategory ? 'Edit Category' : 'Create New Category'}
        size="lg"
      >
        <form onSubmit={handleSubmit(editingCategory ? handleUpdateCategory : handleCreateCategory)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Budget *"
              placeholder="Select a budget"
              disabled={!!editingCategory} // Can't change budget when editing
              options={budgets.map((budget: { id: any; name: any; }) => ({ value: budget.id, label: budget.name }))}
              error={errors.budgetId?.message}
              {...register('budgetId')}
            />

            <Select
              label="Type *"
              placeholder="Select category type"
              disabled={!!editingCategory} // Can't change type when editing
              options={[
                { value: 'INCOME', label: 'Income' },
                { value: 'EXPENSE', label: 'Expense' },
              ]}
              error={errors.type?.message}
              {...register('type')}
            />
          </div>

          <Input
            label="Category Name *"
            placeholder="e.g., Salary, Groceries, Utilities"
            error={errors.name?.message}
            {...register('name')}
          />

          <Input
            label="Planned Amount"
            type="number"
            step="0.01"
            placeholder="0.00"
            error={errors.plannedAmount?.message}
            {...register('plannedAmount', { valueAsNumber: true })}
          />

          {watchedType && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color
              </label>
              <div className="grid grid-cols-5 gap-2">
                {getColorOptions(watchedType).map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setValue('color', color)}
                    className={`w-10 h-10 rounded-lg border-2 transition-all ${
                      watchedColor === color
                        ? 'border-gray-400 scale-110'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              {errors.color && (
                <p className="text-sm text-red-600 mt-1">{errors.color.message}</p>
              )}
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-6">
            <Button type="button" variant="secondary" onClick={closeModal}>
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isSubmitting || createCategoryMutation.isPending || updateCategoryMutation.isPending}
            >
              {editingCategory ? 'Update Category' : 'Create Category'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CategoriesPage;