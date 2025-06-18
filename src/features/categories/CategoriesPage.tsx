import React, { useState } from 'react';
import { 
  Plus, 
  TrendingUp,
  TrendingDown,
  Target,
  DollarSign,
  Search,
  BarChart3,
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
  Input, 
  Select,
  Alert,
} from '../../components/ui';
import { CategoryFormModal } from '../../components/modals';
import toast from 'react-hot-toast';
import { BudgetCategory, CategoryQueryParams, CreateCategoryForm } from '../../types';
import { CategoryCard } from '../../components/features/category';
import { DeleteConfirmModal, ConfirmModal } from '../../components/ui';

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

  // Confirmation modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showToggleModal, setShowToggleModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<BudgetCategory | null>(null);
  const [categoryToToggle, setCategoryToToggle] = useState<BudgetCategory | null>(null);

  // API hooks
  const { data: budgetsResponse } = useBudgets();
  const { data: categoriesResponse, isLoading, error } = useCategories(filters);
  const { data: budgetCategoriesResponse } = useBudgetCategories(selectedBudget);
  const createCategoryMutation = useCreateCategory();
  const updateCategoryMutation = useUpdateCategory();
  const deleteCategoryMutation = useDeleteCategory();

  const budgets = budgetsResponse?.data || [];
  const categories = categoriesResponse?.data || [];

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

  // Handle create/update category using our new modal
  const handleCategorySubmit = async (data: CreateCategoryForm) => {
    try {
      if (editingCategory) {
        // Update existing category
        await updateCategoryMutation.mutateAsync({
          id: editingCategory.id,
          data: {
            name: data.name,
            plannedAmount: data.plannedAmount,
            color: data.color,
          },
        });
        toast.success('Category updated successfully!');
      } else {
        // Create new category
        await createCategoryMutation.mutateAsync(data);
        toast.success('Category created successfully!');
      }
      setShowCreateModal(false);
      setEditingCategory(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Failed to ${editingCategory ? 'update' : 'create'} category`);
    }
  };

  // Handle edit category
  const handleEditCategory = (category: BudgetCategory) => {
    setEditingCategory(category);
    setShowCreateModal(true);
  };

  // Handle toggle category active status
  const handleShowToggleModal = (category: BudgetCategory) => {
    setCategoryToToggle(category);
    setShowToggleModal(true);
  };

  const handleToggleActive = async () => {
    if (!categoryToToggle) return;

    try {
      await updateCategoryMutation.mutateAsync({
        id: categoryToToggle.id,
        data: { isActive: !categoryToToggle.isActive },
      });
      toast.success(`Category ${categoryToToggle.isActive ? 'deactivated' : 'activated'} successfully!`);
      setShowToggleModal(false);
      setCategoryToToggle(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update category');
    }
  };

  // Handle delete category
  const handleShowDeleteModal = (category: BudgetCategory) => {
    setCategoryToDelete(category);
    setShowDeleteModal(true);
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;

    try {
      await deleteCategoryMutation.mutateAsync(categoryToDelete.id);
      toast.success('Category deleted successfully!');
      setShowDeleteModal(false);
      setCategoryToDelete(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete category');
    }
  };

  // Close modal
  const closeModal = () => {
    setShowCreateModal(false);
    setEditingCategory(null);
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
                {incomeCategories.map((category: BudgetCategory) => (
                  <CategoryCard
                    key={category.id}
                    category={category}
                    onEdit={handleEditCategory}
                    onDelete={handleShowDeleteModal}
                    onToggleActive={handleShowToggleModal}
                    formatCurrency={formatCurrency}
                  />
                ))}
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
                {expenseCategories.map((category: BudgetCategory) => (
                  <CategoryCard
                    key={category.id}
                    category={category}
                    onEdit={handleEditCategory}
                    onDelete={handleDeleteCategory}
                    onToggleActive={handleToggleActive}
                    formatCurrency={formatCurrency}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* NEW: Use our standardized CategoryFormModal */}
      <CategoryFormModal
        isOpen={showCreateModal}
        onClose={closeModal}
        onSubmit={handleCategorySubmit}
        editingCategory={editingCategory}
        isLoading={createCategoryMutation.isPending || updateCategoryMutation.isPending}
        budgetId={selectedBudget || (budgets[0]?.id || '')}
      />

      {/* Confirmation Modals */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setCategoryToDelete(null);
        }}
        onConfirm={handleDeleteCategory}
        itemName={categoryToDelete?.name || ''}
        itemType="category"
        isLoading={deleteCategoryMutation.isPending}
        warningText="All transactions in this category will also be deleted."
      />

      <ConfirmModal
        isOpen={showToggleModal}
        onClose={() => {
          setShowToggleModal(false);
          setCategoryToToggle(null);
        }}
        onConfirm={handleToggleActive}
        variant="warning"
        message={`${categoryToToggle?.isActive ? 'Deactivate' : 'Activate'} Category`}
        description={`Are you sure you want to ${categoryToToggle?.isActive ? 'deactivate' : 'activate'} "${categoryToToggle?.name}"?`}
        confirmText={categoryToToggle?.isActive ? 'Deactivate' : 'Activate'}
        isLoading={updateCategoryMutation.isPending}
      />
    </div>
  );
};

export default CategoriesPage;