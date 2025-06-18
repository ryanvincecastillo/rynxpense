import React, { useState } from 'react';
import { 
  Plus, 
  Filter, 
  Download, 
  Search,
  DollarSign,
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
  Input, 
  Select,
  Alert,
} from '../../components/ui';
import { TransactionFormModal } from '../../components/modals';
import toast from 'react-hot-toast';
import { Transaction, TransactionQueryParams, CreateTransactionForm } from '../../types';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { TransactionTable } from '../../components/features/transaction';
import { DeleteConfirmModal } from '../../components/ui';

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

  // Confirmation modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);

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

  // Handle create/update transaction using our new modal
  const handleTransactionSubmit = async (data: CreateTransactionForm) => {
    try {
      console.log('Form data before processing:', data); // DEBUG LOG
      
      if (editingTransaction) {
        // Update existing transaction - exclude budgetId as it cannot be changed
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
          data: payload,
        });
        
        toast.success('Transaction updated successfully!');
      } else {
        // Create new transaction
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
      }
      
      setShowCreateModal(false);
      setEditingTransaction(null);
      setSelectedBudget('');
    } catch (error: any) {
      console.error('Transaction operation error:', error); // DEBUG LOG
      toast.error(error.response?.data?.message || `Failed to ${editingTransaction ? 'update' : 'create'} transaction`);
    }
  };

  // Handle edit transaction
  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setSelectedBudget(transaction.budgetId);
    setShowCreateModal(true);
  };

  // Handle delete transaction
  const handleShowDeleteModal = (transaction: Transaction) => {
    setTransactionToDelete(transaction);
    setShowDeleteModal(true);
  };

  const handleDeleteTransaction = async () => {
    if (!transactionToDelete) return;

    try {
      await deleteTransactionMutation.mutateAsync(transactionToDelete.id);
      toast.success('Transaction deleted successfully!');
      setShowDeleteModal(false);
      setTransactionToDelete(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete transaction');
    }
  };

  // Close modal and reset form
  const closeModal = () => {
    setShowCreateModal(false);
    setEditingTransaction(null);
    setSelectedBudget('');
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
        <TransactionTable
          transactions={transactions}
          isLoading={isLoading}
          onEdit={handleEditTransaction}
          onDelete={handleShowDeleteModal}
          formatCurrency={formatCurrency}
        />
      )}

      {/* NEW: Use our standardized TransactionFormModal */}
      <TransactionFormModal
        isOpen={showCreateModal}
        onClose={closeModal}
        onSubmit={handleTransactionSubmit}
        editingTransaction={editingTransaction}
        isLoading={createTransactionMutation.isPending || updateTransactionMutation.isPending}
        budgetId={selectedBudget || (budgets[0]?.id || '')}
        categories={categories}
      />

      {/* Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setTransactionToDelete(null);
        }}
        onConfirm={handleDeleteTransaction}
        itemName={transactionToDelete?.description || ''}
        itemType="transaction"
        isLoading={deleteTransactionMutation.isPending}
        description={`Are you sure you want to delete this transaction? ${
          transactionToDelete?.isRecurring 
            ? 'This will also remove the recurring schedule.' 
            : 'This action cannot be undone.'
        }`}
      />
    </div>
  );
};

export default TransactionsPage;