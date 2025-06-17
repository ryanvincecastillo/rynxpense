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
  Clock,
  Repeat,
  Calendar,
  Info
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

const transactionSchema = z.object({
  budgetId: z.string().min(1, 'Budget is required'),
  categoryId: z.string().min(1, 'Category is required'),
  amount: z.number().positive('Amount must be positive'),
  description: z.string().min(1, 'Description is required').max(500, 'Description too long'),
  date: z.string().min(1, 'Date is required'),
  isPosted: z.boolean().optional().default(false),
  receiptUrl: z.string().url('Invalid receipt URL').optional().or(z.literal('')),
  isRecurring: z.boolean().optional().default(false),
  dayOfMonth: z.number().min(1).max(31).optional(),
  frequency: z.enum(['WEEKLY', 'MONTHLY', 'YEARLY']).optional().default('MONTHLY'),
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
      isRecurring: false,
      frequency: 'MONTHLY',
    },
  });

  const watchedBudgetId = watch('budgetId');
  const watchedIsRecurring = watch('isRecurring');
  const watchedFrequency = watch('frequency');

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
      console.log('Form data before processing:', data); // DEBUG LOG
      
      const payload = {
        budgetId: data.budgetId,
        categoryId: data.categoryId,
        amount: data.amount,
        description: data.description,
        date: data.date,
        isPosted: data.isPosted || false,
        receiptUrl: data.receiptUrl || undefined,
          ...(data.isRecurring && {
          isRecurring: data.isRecurring,
          frequency: data.frequency,
        }),
        ...data.isRecurring && data.frequency === 'MONTHLY' && data.dayOfMonth ? { dayOfMonth: data.dayOfMonth } : {},
      };

      console.log('Payload being sent to API:', payload); // DEBUG LOG

      await createTransactionMutation.mutateAsync(payload);
      
      let successMessage = 'Transaction created successfully!';
      if (data.isRecurring) {
        successMessage += ` This ${data.frequency?.toLowerCase()} recurring transaction will appear in future budget duplicates.`;
      }
      
      toast.success(successMessage);
      setShowCreateModal(false);
      reset();
    } catch (error: any) {
      console.error('Transaction creation error:', error); // DEBUG LOG
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
      // NEW: Recurring fields
      isRecurring: transaction.isRecurring || false,
      dayOfMonth: transaction.dayOfMonth || undefined,
      frequency: transaction.frequency || 'MONTHLY',
    });
    setShowCreateModal(true);
  };

  // Handle update transaction
  const handleUpdateTransaction = async (data: TransactionFormData) => {
  if (!editingTransaction) return;

  try {
    // Prepare payload - EXCLUDE budgetId as it cannot be changed during update
    const { budgetId, ...updatePayload } = data;
    
    const payload = {
      ...updatePayload,
      receiptUrl: updatePayload.receiptUrl || undefined,
      // Only include recurring fields if isRecurring is true
      ...(updatePayload.isRecurring && {
        isRecurring: updatePayload.isRecurring,
        dayOfMonth: updatePayload.dayOfMonth,
        frequency: updatePayload.frequency,
      })
    };

    await updateTransactionMutation.mutateAsync({
      id: editingTransaction.id,
      data: payload, // Now excludes budgetId
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

  // Enhanced table columns with recurring indicator
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
          <div className="flex items-center space-x-2">
            <p className="font-medium text-gray-900">{description}</p>
            {/* NEW: Recurring indicator */}
            {transaction.isRecurring && (
              <span title="Recurring transaction">
                <Repeat className="h-4 w-4 text-blue-500" />
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span>{transaction.category?.name}</span>
            {/* NEW: Show recurring info */}
            {transaction.isRecurring && (
              <Badge variant="secondary" size="sm">
                {transaction.frequency?.toLowerCase()} 
                {transaction.dayOfMonth && ` (${transaction.dayOfMonth}${getOrdinalSuffix(transaction.dayOfMonth)})`}
              </Badge>
            )}
          </div>
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

  // Helper function for ordinal suffix
  const getOrdinalSuffix = (day: number) => {
    if (day >= 11 && day <= 13) return 'th';
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
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
                  else if (value === 'recurring') updateFilters({ isRecurring: true });
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
                <option value="recurring">Recurring Only</option>
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
          {(filters.search || filters.budgetId || filters.startDate || filters.endDate || filters.isPosted !== undefined || filters.isRecurring !== undefined) && (
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

      {/* Enhanced Create/Edit Transaction Modal */}
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

          {/* NEW: Recurring Transaction Section */}
          <div className="border-t pt-4">
            <div className="flex items-center space-x-2 mb-4">
              <input
                type="checkbox"
                id="isRecurring"
                {...register('isRecurring')}
                className="h-4 w-4 text-blue-600 rounded border-gray-300"
              />
              <label htmlFor="isRecurring" className="text-sm font-medium text-gray-700 flex items-center">
                <Repeat className="h-4 w-4 mr-1" />
                This is a recurring transaction
              </label>
            </div>
            
            {watchedIsRecurring && (
              <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center space-x-2 text-sm text-blue-700 mb-3">
                  <Info className="h-4 w-4" />
                  <span>Recurring transactions will automatically appear in duplicated budgets</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Frequency *
                    </label>
                    <select
                      {...register('frequency')}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value="MONTHLY">Monthly</option>
                      <option value="WEEKLY">Weekly</option>
                      <option value="YEARLY">Yearly</option>
                    </select>
                  </div>
                  
                  {watchedFrequency === 'MONTHLY' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Day of Month
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="31"
                        {...register('dayOfMonth', { valueAsNumber: true })}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="25"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        e.g., 25 for rent due on the 25th of each month
                      </p>
                      {errors.dayOfMonth && (
                        <p className="text-sm text-red-600 mt-1">{errors.dayOfMonth.message}</p>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Examples based on frequency */}
                <div className="text-xs text-blue-600 bg-blue-100 p-3 rounded">
                  <strong>Common Examples:</strong>
                  <div className="mt-1 space-y-1">
                    {watchedFrequency === 'MONTHLY' && (
                      <>
                        <div>• Salary (30th of each month)</div>
                        <div>• Rent (1st of each month)</div>
                        <div>• Utilities (15th of each month)</div>
                      </>
                    )}
                    {watchedFrequency === 'WEEKLY' && (
                      <>
                        <div>• Grocery allowance</div>
                        <div>• Transportation budget</div>
                      </>
                    )}
                    {watchedFrequency === 'YEARLY' && (
                      <>
                        <div>• Insurance premiums</div>
                        <div>• Annual subscriptions</div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
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