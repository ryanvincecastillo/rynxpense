import React, { useState } from 'react';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Filter, 
  Download, 
  Search,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Check,
  Clock
} from 'lucide-react';
import { 
  useTransactions, 
  useCreateTransaction, 
  useUpdateTransaction, 
  useDeleteTransaction,
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
  Table
} from '../../components/ui';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Transaction, TransactionQueryParams } from '../../types';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';

// Form validation schema
const transactionSchema = z.object({
  budgetId: z.string().min(1, 'Budget is required'),
  categoryId: z.string().min(1, 'Category is required'),
  amount: z.number().positive('Amount must be positive'),
  description: z.string().min(1, 'Description is required').max(500, 'Description too long'),
  date: z.string().min(1, 'Date is required'),
  isPosted: z.boolean().optional().default(false),
  receiptUrl: z.string().url('Invalid receipt URL').optional().or(z.literal('')),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

const TransactionsPage: React.FC = () => {
  const { user } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [selectedBudget, setSelectedBudget] = useState<string>('');
  const [filters, setFilters] = useState<TransactionQueryParams>({
    page: 1,
    limit: 20,
    sortBy: 'date',
    sortOrder: 'desc',
  });

  // API hooks
  const { data: budgetsResponse } = useBudgets();
  const { data: transactionsResponse, isLoading, error } = useTransactions(filters);
  const { data: categoriesResponse } = useBudgetCategories(selectedBudget || filters.budgetId || '');
  const createTransactionMutation = useCreateTransaction();
  const updateTransactionMutation = useUpdateTransaction();
  const deleteTransactionMutation = useDeleteTransaction();

  const budgets = budgetsResponse?.data || [];
  const transactions = transactionsResponse?.data || [];
  const categories = categoriesResponse ? 
    [...(categoriesResponse.income || []), ...(categoriesResponse.expense || [])] : 
    [];
  const summary = transactionsResponse?.summary;

  // Form handling
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      date: format(new Date(), 'yyyy-MM-dd'),
      isPosted: false,
    },
  });

  const watchedBudgetId = watch('budgetId');

  // Update categories when budget changes
  React.useEffect(() => {
    if (watchedBudgetId && watchedBudgetId !== selectedBudget) {
      setSelectedBudget(watchedBudgetId);
      setValue('categoryId', ''); // Reset category when budget changes
    }
  }, [watchedBudgetId, selectedBudget, setValue]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: user?.currency || 'PHP',
    }).format(amount);
  };

  // Handle filter changes
  const updateFilters = (newFilters: Partial<TransactionQueryParams>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  };

  // Handle create transaction
  const handleCreateTransaction = async (data: TransactionFormData) => {
    try {
      await createTransactionMutation.mutateAsync({
        ...data,
        receiptUrl: data.receiptUrl || undefined,
      });
      toast.success('Transaction created successfully!');
      setShowCreateModal(false);
      reset();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create transaction');
    }
  };

  // Handle edit transaction
  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setSelectedBudget(transaction.budgetId);
    reset({
      budgetId: transaction.budgetId,
      categoryId: transaction.categoryId,
      amount: transaction.amount,
      description: transaction.description,
      date: format(new Date(transaction.date), 'yyyy-MM-dd'),
      isPosted: transaction.isPosted,
      receiptUrl: transaction.receiptUrl || '',
    });
    setShowCreateModal(true);
  };

  // Handle update transaction
  const handleUpdateTransaction = async (data: TransactionFormData) => {
    if (!editingTransaction) return;

    try {
      await updateTransactionMutation.mutateAsync({
        id: editingTransaction.id,
        data: {
          ...data,
          receiptUrl: data.receiptUrl || undefined,
        },
      });
      toast.success('Transaction updated successfully!');
      setShowCreateModal(false);
      setEditingTransaction(null);
      reset();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update transaction');
    }
  };

  // Handle delete transaction
  const handleDeleteTransaction = async (transaction: Transaction) => {
    if (!window.confirm(`Are you sure you want to delete this transaction?`)) {
      return;
    }

    try {
      await deleteTransactionMutation.mutateAsync(transaction.id);
      toast.success('Transaction deleted successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete transaction');
    }
  };

  // Close modal and reset form
  const closeModal = () => {
    setShowCreateModal(false);
    setEditingTransaction(null);
    setSelectedBudget('');
    reset();
  };

  // Table columns
  const columns = [
    {
      key: 'date' as keyof Transaction,
      label: 'Date',
      render: (date: string) => format(new Date(date), 'MMM dd, yyyy'),
    },
    {
      key: 'description' as keyof Transaction,
      label: 'Description',
      render: (description: string, transaction: Transaction) => (
        <div>
          <p className="font-medium text-gray-900">{description}</p>
          <p className="text-sm text-gray-500">{transaction.category?.name}</p>
        </div>
      ),
    },
    {
      key: 'amount' as keyof Transaction,
      label: 'Amount',
      render: (amount: number, transaction: Transaction) => (
        <div className="text-right">
          <p className={`font-semibold ${
            transaction.category?.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
          }`}>
            {transaction.category?.type === 'INCOME' ? '+' : '-'}{formatCurrency(amount)}
          </p>
        </div>
      ),
    },
    {
      key: 'isPosted' as keyof Transaction,
      label: 'Status',
      render: (isPosted: boolean) => (
        <Badge variant={isPosted ? 'success' : 'warning'} size="sm">
          {isPosted ? (
            <>
              <Check className="h-3 w-3 mr-1" />
              Posted
            </>
          ) : (
            <>
              <Clock className="h-3 w-3 mr-1" />
              Pending
            </>
          )}
        </Badge>
      ),
    },
    {
      key: 'actions' as keyof Transaction,
      label: 'Actions',
      render: (_: any, transaction: Transaction) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleEditTransaction(transaction)}
            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
            title="Edit transaction"
          >
            <Edit3 className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDeleteTransaction(transaction)}
            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
            title="Delete transaction"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

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
        Failed to load transactions. Please try again.
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
          <p className="text-gray-600">
            Track your income and expenses • {summary?.transactionCount || 0} transactions
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="secondary">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Transaction
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Total Posted</p>
                <p className="text-2xl font-bold text-green-800">
                  {formatCurrency(summary.postedAmount)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-700">Total Pending</p>
                <p className="text-2xl font-bold text-yellow-800">
                  {formatCurrency(summary.pendingAmount)}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Posted Count</p>
                <p className="text-2xl font-bold text-blue-800">{summary.postedCount}</p>
              </div>
              <Check className="h-8 w-8 text-blue-600" />
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">Pending Count</p>
                <p className="text-2xl font-bold text-purple-800">{summary.pendingCount}</p>
              </div>
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <div className="space-y-4">
          {/* Search and Budget Filter */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search transactions..."
                className="pl-10"
                value={filters.search || ''}
                onChange={(e) => updateFilters({ search: e.target.value })}
              />
            </div>
            <Select
              placeholder="All Budgets"
              value={filters.budgetId || ''}
              onChange={(e) => updateFilters({ budgetId: e.target.value })}
              options={budgets.map((budget: { id: any; name: any; }) => ({ value: budget.id, label: budget.name }))}
            />
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value=""
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === 'posted') updateFilters({ isPosted: true });
                  else if (value === 'pending') updateFilters({ isPosted: false });
                  else if (value === 'thisMonth') {
                    const now = new Date();
                    updateFilters({
                      startDate: format(startOfMonth(now), 'yyyy-MM-dd'),
                      endDate: format(endOfMonth(now), 'yyyy-MM-dd'),
                    });
                  }
                }}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">Quick Filters</option>
                <option value="thisMonth">This Month</option>
                <option value="posted">Posted Only</option>
                <option value="pending">Pending Only</option>
              </select>
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Start Date"
              type="date"
              value={filters.startDate || ''}
              onChange={(e) => updateFilters({ startDate: e.target.value })}
            />
            <Input
              label="End Date"
              type="date"
              value={filters.endDate || ''}
              onChange={(e) => updateFilters({ endDate: e.target.value })}
            />
          </div>

          {/* Clear Filters */}
          {(filters.search || filters.budgetId || filters.startDate || filters.endDate || filters.isPosted !== undefined) && (
            <div className="flex justify-end">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setFilters({ page: 1, limit: 20, sortBy: 'date', sortOrder: 'desc' })}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Transactions Table */}
      {transactions.length === 0 ? (
        <Card>
          <EmptyState
            icon={DollarSign}
            title="No Transactions Found"
            description="Start tracking your finances by adding your first transaction."
            action={
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Transaction
              </Button>
            }
          />
        </Card>
      ) : (
        <Table
          data={transactions}
          columns={columns}
          isLoading={isLoading}
          emptyMessage="No transactions found matching your filters."
        />
      )}

      {/* Create/Edit Transaction Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={closeModal}
        title={editingTransaction ? 'Edit Transaction' : 'Add New Transaction'}
        size="lg"
      >
        <form onSubmit={handleSubmit(editingTransaction ? handleUpdateTransaction : handleCreateTransaction)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Budget *"
              placeholder="Select a budget"
              options={budgets.map((budget: { id: any; name: any; }) => ({ value: budget.id, label: budget.name }))}
              error={errors.budgetId?.message}
              {...register('budgetId')}
            />

            <Select
              label="Category *"
              placeholder={selectedBudget ? "Select a category" : "Select budget first"}
              disabled={!selectedBudget}
              options={categories.map(category => ({ 
                value: category.id, 
                label: `${category.name} (${category.type})` 
              }))}
              error={errors.categoryId?.message}
              {...register('categoryId')}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Amount *"
              type="number"
              step="0.01"
              placeholder="0.00"
              error={errors.amount?.message}
              {...register('amount', { valueAsNumber: true })}
            />

            <Input
              label="Date *"
              type="date"
              error={errors.date?.message}
              {...register('date')}
            />
          </div>

          <Input
            label="Description *"
            placeholder="e.g., Grocery shopping at SM"
            error={errors.description?.message}
            {...register('description')}
          />

          <Input
            label="Receipt URL (Optional)"
            type="url"
            placeholder="https://example.com/receipt.jpg"
            error={errors.receiptUrl?.message}
            {...register('receiptUrl')}
          />

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isPosted"
              {...register('isPosted')}
              className="h-4 w-4 text-blue-600 rounded border-gray-300"
            />
            <label htmlFor="isPosted" className="text-sm text-gray-700">
              Mark as posted (transaction has been processed)
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-6">
            <Button type="button" variant="secondary" onClick={closeModal}>
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isSubmitting || createTransactionMutation.isPending || updateTransactionMutation.isPending}
            >
              {editingTransaction ? 'Update Transaction' : 'Add Transaction'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TransactionsPage;