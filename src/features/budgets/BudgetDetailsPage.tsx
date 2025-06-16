import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  Edit3,
  Archive,
  Trash2,
  Plus,
  TrendingUp,
  TrendingDown,
  Target,
  DollarSign,
  Calendar,
  Users,
  MoreVertical,
  Download,
  Share,
  Settings
} from 'lucide-react';
import {
  PieChart,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  Area,
  AreaChart,
  Pie
} from 'recharts';
import {
  useBudget,
  useBudgetSummary,
  useBudgetCategories,
  useTransactions,
  useUpdateBudget,
  useDeleteBudget
} from '../../hooks/useApi';
import { useAuth } from '../../contexts/AuthContext';
import {
  Button,
  Card,
  LoadingSpinner,
  Badge,
  Alert,
  ProgressBar,
  Modal,
  Input,
  Textarea,
  EmptyState
} from '../../components/ui';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { format, startOfMonth, endOfMonth } from 'date-fns';

// Form validation schema
const budgetUpdateSchema = z.object({
  name: z.string().min(1, 'Budget name is required').max(100, 'Name too long'),
  description: z.string().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format').optional(),
});

type BudgetUpdateFormData = z.infer<typeof budgetUpdateSchema>;

const colorOptions = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
];

const BudgetDetailsPage: React.FC = () => {
  const { budgetId } = useParams<{ budgetId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // API hooks
  const { data: budget, isLoading: budgetLoading, error: budgetError } = useBudget(budgetId!);
  const { data: summary, isLoading: summaryLoading } = useBudgetSummary(budgetId!);
  const { data: categoriesData, isLoading: categoriesLoading } = useBudgetCategories(budgetId!);
  const { data: transactionsResponse } = useTransactions({
    budgetId: budgetId!,
    limit: 10,
    sortBy: 'date',
    sortOrder: 'desc'
  });

  const updateBudgetMutation = useUpdateBudget();
  const deleteBudgetMutation = useDeleteBudget();

  const recentTransactions = transactionsResponse?.data || [];

  // Form handling
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<BudgetUpdateFormData>({
    resolver: zodResolver(budgetUpdateSchema),
  });

  const selectedColor = watch('color');

  // Initialize form when budget loads
  React.useEffect(() => {
    if (budget) {
      reset({
        name: budget.name,
        description: budget.description || '',
        color: budget.color,
      });
    }
  }, [budget, reset]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: user?.currency || 'PHP',
    }).format(amount);
  };

  // Prepare chart data
  const categoryChartData = React.useMemo(() => {
    if (!categoriesData) return [];
    
    const allCategories = [...(categoriesData.income || []), ...(categoriesData.expense || [])];
    return allCategories
      .filter((cat: { actualAmount: number; }) => cat.actualAmount > 0)
      .map((cat: { name: any; actualAmount: any; color: any; type: any; }) => ({
        name: cat.name,
        value: cat.actualAmount,
        color: cat.color,
        type: cat.type,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [categoriesData]);

  // Budget performance data
  const performanceData = React.useMemo(() => {
    if (!categoriesData) return [];
    
    const incomeData = categoriesData.income?.map((cat: { name: string; plannedAmount: any; actualAmount: any; }) => ({
      name: cat.name.length > 10 ? cat.name.substring(0, 10) + '...' : cat.name,
      planned: cat.plannedAmount,
      actual: cat.actualAmount,
      type: 'income'
    })) || [];
    
    const expenseData = categoriesData.expense?.map((cat: { name: string; plannedAmount: any; actualAmount: any; }) => ({
      name: cat.name.length > 10 ? cat.name.substring(0, 10) + '...' : cat.name,
      planned: cat.plannedAmount,
      actual: cat.actualAmount,
      type: 'expense'
    })) || [];
    
    return [...incomeData, ...expenseData];
  }, [categoriesData]);

  // Handle update budget
  const handleUpdateBudget = async (data: BudgetUpdateFormData) => {
    try {
      await updateBudgetMutation.mutateAsync({
        id: budgetId!,
        data,
      });
      toast.success('Budget updated successfully!');
      setShowEditModal(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update budget');
    }
  };

  // Handle archive budget
  const handleArchiveBudget = async () => {
    if (!budget) return;
    
    try {
      await updateBudgetMutation.mutateAsync({
        id: budget.id,
        data: { isArchived: !budget.isArchived },
      });
      toast.success(`Budget ${budget.isArchived ? 'unarchived' : 'archived'} successfully!`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update budget');
    }
  };

  // Handle delete budget
  const handleDeleteBudget = async () => {
    if (!budget) return;

    try {
      await deleteBudgetMutation.mutateAsync(budget.id);
      toast.success('Budget deleted successfully!');
      navigate('/budgets');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete budget');
    }
  };

  if (budgetLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (budgetError || !budget) {
    return (
      <div className="space-y-6">
        <Alert type="error">
          Budget not found or you don't have permission to access it.
        </Alert>
        <Link to="/budgets">
          <Button variant="secondary">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Budgets
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/budgets">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Budgets
            </Button>
          </Link>
          <div className="flex items-center space-x-3">
            <div
              className="w-6 h-6 rounded-full"
              style={{ backgroundColor: budget.color }}
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{budget.name}</h1>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Calendar className="h-4 w-4" />
                <span>Created {format(new Date(budget.createdAt), 'MMM dd, yyyy')}</span>
                {budget.isArchived && (
                  <Badge variant="secondary" size="sm">Archived</Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Button variant="secondary" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="secondary" size="sm">
            <Share className="h-4 w-4 mr-2" />
            Share
          </Button>
          <div className="relative">
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
            {/* You can add a dropdown menu here */}
          </div>
          <Button onClick={() => setShowEditModal(true)}>
            <Edit3 className="h-4 w-4 mr-2" />
            Edit Budget
          </Button>
        </div>
      </div>

      {/* Description */}
      {budget.description && (
        <Card>
          <p className="text-gray-700">{budget.description}</p>
        </Card>
      )}

      {/* Summary Cards */}
      {summary ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Total Income</p>
                <p className="text-2xl font-bold text-green-800">
                  {formatCurrency(summary.totalActualIncome)}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  vs {formatCurrency(summary.totalPlannedIncome)} planned
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-rose-100 border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-700">Total Expenses</p>
                <p className="text-2xl font-bold text-red-800">
                  {formatCurrency(summary.totalActualExpenses)}
                </p>
                <p className="text-xs text-red-600 mt-1">
                  vs {formatCurrency(summary.totalPlannedExpenses)} planned
                </p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-600" />
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-cyan-100 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Net Amount</p>
                <p className={`text-2xl font-bold ${
                  summary.netActual >= 0 ? 'text-blue-800' : 'text-red-800'
                }`}>
                  {formatCurrency(summary.netActual)}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  vs {formatCurrency(summary.netPlanned)} planned
                </p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-violet-100 border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">Categories</p>
                <p className="text-2xl font-bold text-purple-800">{summary.categoryCount}</p>
                <p className="text-xs text-purple-600 mt-1">
                  {summary.transactionCount} transactions
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-24 bg-gray-200 rounded"></div>
            </Card>
          ))}
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category Distribution */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Category Distribution</h3>
            <Badge variant="secondary">{categoryChartData.length} categories</Badge>
          </div>
          
          {categoryChartData.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {categoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any) => [formatCurrency(value), 'Amount']}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState
              icon={DollarSign}
              title="No Category Data"
              description="Add transactions to see category distribution."
            />
          )}
        </Card>

        {/* Budget Performance */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Budget vs Actual</h3>
            <Link to={`/categories?budgetId=${budgetId}`}>
              <Button variant="ghost" size="sm">
                View All Categories
              </Button>
            </Link>
          </div>
          
          {performanceData.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceData.slice(0, 8)} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `₱${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    formatter={(value: any) => [formatCurrency(value), '']}
                  />
                  <Legend />
                  <Bar dataKey="planned" fill="#94a3b8" name="Planned" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="actual" fill="#3b82f6" name="Actual" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState
              icon={Target}
              title="No Budget Data"
              description="Create categories with planned amounts to see performance."
            />
          )}
        </Card>
      </div>

      {/* Categories and Recent Transactions Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Categories Summary */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Categories Overview</h3>
            <Link to={`/categories?budgetId=${budgetId}`}>
              <Button variant="ghost" size="sm">
                Manage Categories
              </Button>
            </Link>
          </div>

          {categoriesData ? (
            <div className="space-y-4">
              {/* Income Categories */}
              {categoriesData.income && categoriesData.income.length > 0 && (
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-gray-900">Income ({categoriesData.income.length})</span>
                  </div>
                  <div className="space-y-2">
                    {categoriesData.income.slice(0, 5).map((category: { id: React.Key | null | undefined; name: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; actualAmount: number; plannedAmount: number; }) => (
                      <div key={category.id} className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-900">{category.name}</span>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-green-600">
                            {formatCurrency(category.actualAmount)}
                          </p>
                          <p className="text-xs text-gray-500">
                            of {formatCurrency(category.plannedAmount)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Expense Categories */}
              {categoriesData.expense && categoriesData.expense.length > 0 && (
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <TrendingDown className="h-4 w-4 text-red-600" />
                    <span className="font-medium text-gray-900">Expenses ({categoriesData.expense.length})</span>
                  </div>
                  <div className="space-y-2">
                    {categoriesData.expense.slice(0, 5).map((category: { id: React.Key | null | undefined; name: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; actualAmount: number; plannedAmount: number; }) => (
                      <div key={category.id} className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-900">{category.name}</span>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-red-600">
                            {formatCurrency(category.actualAmount)}
                          </p>
                          <p className="text-xs text-gray-500">
                            of {formatCurrency(category.plannedAmount)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <EmptyState
              icon={Plus}
              title="No Categories"
              description="Create income and expense categories to organize your budget."
              action={
                <Link to={`/categories?budgetId=${budgetId}`}>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Categories
                  </Button>
                </Link>
              }
            />
          )}
        </Card>

        {/* Recent Transactions */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
            <Link to={`/transactions?budgetId=${budgetId}`}>
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </Link>
          </div>

          {recentTransactions.length === 0 ? (
            <EmptyState
              icon={DollarSign}
              title="No Transactions"
              description="Start tracking your finances by adding transactions."
              action={
                <Link to={`/transactions?budgetId=${budgetId}`}>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Transaction
                  </Button>
                </Link>
              }
            />
          ) : (
            <div className="space-y-3">
              {recentTransactions.map((transaction, idx) => (
                <div key={transaction.id ?? idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${transaction.isPosted ? 'bg-green-500' : 'bg-yellow-500'}`} />
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{transaction.description}</p>
                      <p className="text-xs text-gray-500">
                        {transaction.category?.name ?? 'Uncategorized'} • {format(new Date(transaction.date), 'MMM dd')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`font-semibold text-sm ${
                      transaction.category?.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.category?.type === 'INCOME' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </span>
                    <div className="text-xs text-gray-500">
                      {transaction.isPosted ? 'Posted' : 'Pending'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link 
            to={`/categories?budgetId=${budgetId}`}
            className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all group text-center"
          >
            <Plus className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="font-medium text-gray-900 text-sm">Add Category</p>
          </Link>

          <Link 
            to={`/transactions?budgetId=${budgetId}`}
            className="p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-all group text-center"
          >
            <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="font-medium text-gray-900 text-sm">Add Transaction</p>
          </Link>

          <button 
            onClick={handleArchiveBudget}
            className="p-4 border border-gray-200 rounded-lg hover:border-yellow-300 hover:bg-yellow-50 transition-all group text-center"
          >
            <Archive className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
            <p className="font-medium text-gray-900 text-sm">
              {budget.isArchived ? 'Unarchive' : 'Archive'}
            </p>
          </button>

          <button 
            onClick={() => setShowDeleteModal(true)}
            className="p-4 border border-gray-200 rounded-lg hover:border-red-300 hover:bg-red-50 transition-all group text-center"
          >
            <Trash2 className="h-8 w-8 text-red-600 mx-auto mb-2" />
            <p className="font-medium text-gray-900 text-sm">Delete Budget</p>
          </button>
        </div>
      </Card>

      {/* Edit Budget Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Budget"
      >
        <form onSubmit={handleSubmit(handleUpdateBudget)} className="space-y-4">
          <Input
            label="Budget Name"
            placeholder="e.g., Monthly Household Budget"
            error={errors.name?.message}
            {...register('name')}
          />

          <Textarea
            label="Description (Optional)"
            placeholder="Brief description of this budget"
            rows={3}
            error={errors.description?.message}
            {...register('description')}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color
            </label>
            <div className="grid grid-cols-5 gap-2">
              {colorOptions.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setValue('color', color)}
                  className={`w-10 h-10 rounded-lg border-2 transition-all ${
                    selectedColor === color
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

          <div className="flex justify-end space-x-3 pt-6">
            <Button type="button" variant="secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isSubmitting || updateBudgetMutation.isPending}
            >
              Update Budget
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Budget"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to delete "<strong>{budget.name}</strong>"? This action cannot be undone and will permanently delete all associated categories and transactions.
          </p>
          
          <div className="flex justify-end space-x-3">
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteBudget}
              isLoading={deleteBudgetMutation.isPending}
            >
              Delete Budget
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default BudgetDetailsPage;