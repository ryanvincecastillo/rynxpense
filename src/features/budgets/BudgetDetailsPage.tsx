import React, { useState, useCallback, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

// API Hooks
import { 
  useBudget, 
  useBudgetSummary, 
  useBudgetCategories, 
  useTransactions,
  useCreateTransaction,
  useUpdateTransaction,
  useDeleteTransaction,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from '../../hooks/useApi';

// Context & Hooks
import { useAuth } from '../../contexts/AuthContext';
import { useFormatCurrency, useToast } from '../../hooks/common';

// UI Components
import { Button, Alert, LoadingSpinner } from '../../components/ui';

// Feature Components
import BudgetHeader from '../../components/BudgetHeader';
import BudgetActionsMenu from '../../components/BudgetActionsMenu';
import BudgetTabs from '../../components/BudgetTabs';
import BudgetOverviewTab from '../../components/BudgetOverviewTab';
import CategoriesTab from '../../components/CategoriesTab';
import TransactionsTab from '../../components/TransactionsTab';
import BudgetModals from '../../components/BudgetModals';

// Types
import { 
  Transaction, 
  BudgetCategory, 
  CreateTransactionForm, 
  CreateCategoryForm,
  TransactionQueryParams 
} from '../../types';

// Constants
const TABS = {
  OVERVIEW: 'overview',
  CATEGORIES: 'categories', 
  TRANSACTIONS: 'transactions'
} as const;

type ActiveTab = typeof TABS[keyof typeof TABS];

interface BudgetDetailsState {
  activeTab: ActiveTab;
  modalState: {
    showCreateCategoryModal: boolean;
    showEditCategoryModal: boolean;
    showCreateTransactionModal: boolean;
    showEditTransactionModal: boolean;
    showDeleteConfirmModal: boolean;
    showActionsMenu: boolean;
    showEditBudgetModal: boolean; // Added missing property
  };
  editingItem: Transaction | BudgetCategory | null;
  deleteConfirmation: {
    isOpen: boolean;
    type: 'transaction' | 'category' | null;
    item: Transaction | BudgetCategory | null;
    onConfirm: (() => void) | null;
  };
  filters: {
    categories: {
      type: 'INCOME' | 'EXPENSE' | '';
      showInactive: boolean;
      search: string;
    };
    transactions: {
      isPosted?: boolean;
      isRecurring?: boolean;
      categoryId?: string;
      search: string;
      dateRange?: {
        start: Date;
        end: Date;
      };
    };
  };
}

const BudgetDetailsPage: React.FC = () => {
  const { budgetId } = useParams<{ budgetId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { formatCurrency } = useFormatCurrency();
  const { showSuccess, showError } = useToast();

  // State Management
  const [state, setState] = useState<BudgetDetailsState>({
    activeTab: TABS.OVERVIEW,
    modalState: {
      showCreateCategoryModal: false,
      showEditCategoryModal: false,
      showCreateTransactionModal: false,
      showEditTransactionModal: false,
      showDeleteConfirmModal: false,
      showActionsMenu: false,
      showEditBudgetModal: false, // Added missing property
    },
    editingItem: null,
    deleteConfirmation: {
      isOpen: false,
      type: null,
      item: null,
      onConfirm: null,
    },
    filters: {
      categories: {
        type: '',
        showInactive: false,
        search: '',
      },
      transactions: {
        search: '',
      },
    },
  });

  // API Queries
  const { data: budget, isLoading: budgetLoading, error: budgetError } = useBudget(budgetId!);
  const { data: summary, isLoading: summaryLoading } = useBudgetSummary(budgetId!);
  const { data: categoriesData, isLoading: categoriesLoading } = useBudgetCategories(budgetId!);
  
  // Build transaction query params
  const transactionQueryParams: TransactionQueryParams = useMemo(() => ({
    budgetId: budgetId!,
    limit: 50,
    sortBy: 'date',
    sortOrder: 'desc',
    ...state.filters.transactions,
    search: state.filters.transactions.search || undefined,
  }), [budgetId, state.filters.transactions]);

  const { data: transactionsResponse, isLoading: transactionsLoading } = useTransactions(transactionQueryParams);

  // API Mutations
  const createTransactionMutation = useCreateTransaction();
  const updateTransactionMutation = useUpdateTransaction();
  const deleteTransactionMutation = useDeleteTransaction();
  const createCategoryMutation = useCreateCategory();
  const updateCategoryMutation = useUpdateCategory();
  const deleteCategoryMutation = useDeleteCategory();

  // State Update Helpers
  const updateState = useCallback((updates: Partial<BudgetDetailsState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const updateModalState = useCallback((updates: Partial<BudgetDetailsState['modalState']>) => {
    setState(prev => ({ 
      ...prev, 
      modalState: { ...prev.modalState, ...updates } 
    }));
  }, []);

  const updateFilters = useCallback((filterType: 'categories' | 'transactions', updates: any) => {
    setState(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        [filterType]: { ...prev.filters[filterType], ...updates }
      }
    }));
  }, []);

  // Category Actions
  const handleCategoryAction = useCallback(async (action: string, category?: BudgetCategory, data?: any) => {
    try {
      switch (action) {
        case 'create':
          updateModalState({ showCreateCategoryModal: true });
          break;
          
        case 'edit':
          if (category) {
            updateState({ editingItem: category });
            updateModalState({ showEditCategoryModal: true });
          }
          break;
          
        case 'delete':
          if (category) {
            setState(prev => ({
              ...prev,
              deleteConfirmation: {
                isOpen: true,
                type: 'category',
                item: category,
                onConfirm: () => handleDeleteCategory(category.id),
              }
            }));
          }
          break;
          
        case 'toggleActive':
          if (category) {
            await updateCategoryMutation.mutateAsync({
              id: category.id, // Fixed: use 'id' instead of 'categoryId'
              data: { isActive: !category.isActive }
            });
            showSuccess(`Category ${category.isActive ? 'deactivated' : 'activated'} successfully`);
          }
          break;
          
        case 'submit':
          await handleCategorySubmit(data);
          break;
      }
    } catch (error: any) {
      showError(error.message || 'An error occurred');
    }
  }, [updateCategoryMutation, showSuccess, showError]);

  // Transaction Actions
  const handleTransactionAction = useCallback(async (action: string, transaction?: Transaction, data?: any) => {
    try {
      switch (action) {
        case 'create':
          updateModalState({ showCreateTransactionModal: true });
          break;
          
        case 'edit':
          if (transaction) {
            updateState({ editingItem: transaction });
            updateModalState({ showEditTransactionModal: true });
          }
          break;
          
        case 'delete':
          if (transaction) {
            setState(prev => ({
              ...prev,
              deleteConfirmation: {
                isOpen: true,
                type: 'transaction',
                item: transaction,
                onConfirm: () => handleDeleteTransaction(transaction.id),
              }
            }));
          }
          break;
          
        case 'togglePosted':
          if (transaction) {
            await updateTransactionMutation.mutateAsync({
              id: transaction.id, // Fixed: use 'id' instead of 'transactionId'
              data: { isPosted: !transaction.isPosted }
            });
            showSuccess(`Transaction ${transaction.isPosted ? 'unposted' : 'posted'} successfully`);
          }
          break;
          
        case 'submit':
          await handleTransactionSubmit(data);
          break;
      }
    } catch (error: any) {
      showError(error.message || 'An error occurred');
    }
  }, [updateTransactionMutation, showSuccess, showError]);

  // Submit Handlers
  const handleCategorySubmit = async (formData: CreateCategoryForm) => {
    try {
      if (state.editingItem && 'plannedAmount' in state.editingItem) {
        // Update existing category
        await updateCategoryMutation.mutateAsync({
          id: state.editingItem.id, // Fixed: use 'id' instead of 'categoryId'
          data: formData
        });
        showSuccess('Category updated successfully');
      } else {
        // Create new category
        await createCategoryMutation.mutateAsync({
          ...formData,
          budgetId: budgetId!
        });
        showSuccess('Category created successfully');
      }
      handleCloseModal();
    } catch (error: any) {
      showError(error.message || 'Failed to save category');
    }
  };

  const handleTransactionSubmit = async (formData: CreateTransactionForm) => {
    try {
      if (state.editingItem && 'amount' in state.editingItem) {
        // Update existing transaction
        await updateTransactionMutation.mutateAsync({
          id: state.editingItem.id, // Fixed: use 'id' instead of 'transactionId'
          data: formData
        });
        showSuccess('Transaction updated successfully');
      } else {
        // Create new transaction
        await createTransactionMutation.mutateAsync({
          ...formData,
          budgetId: budgetId!
        });
        showSuccess('Transaction created successfully');
      }
      handleCloseModal();
    } catch (error: any) {
      showError(error.message || 'Failed to save transaction');
    }
  };

  // Delete Handlers
  const handleDeleteCategory = async (categoryId: string) => {
    try {
      await deleteCategoryMutation.mutateAsync(categoryId);
      showSuccess('Category deleted successfully');
      handleCloseDeleteConfirmation();
    } catch (error: any) {
      showError(error.message || 'Failed to delete category');
    }
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    try {
      await deleteTransactionMutation.mutateAsync(transactionId);
      showSuccess('Transaction deleted successfully');
      handleCloseDeleteConfirmation();
    } catch (error: any) {
      showError(error.message || 'Failed to delete transaction');
    }
  };

  // Modal Handlers
  const handleCloseModal = useCallback(() => {
    updateModalState({
      showCreateCategoryModal: false,
      showEditCategoryModal: false,
      showCreateTransactionModal: false,
      showEditTransactionModal: false,
    });
    updateState({ editingItem: null });
  }, []);

  const handleCloseDeleteConfirmation = useCallback(() => {
    setState(prev => ({
      ...prev,
      deleteConfirmation: {
        isOpen: false,
        type: null,
        item: null,
        onConfirm: null,
      }
    }));
  }, []);

  // Quick Actions for Overview Tab
  const handleQuickAction = useCallback((action: string, type?: string) => {
    switch (action) {
      case 'addIncome':
        updateState({ editingItem: null });
        updateModalState({ showCreateCategoryModal: true });
        // You could pre-fill the form with type: 'INCOME'
        break;
      case 'addExpense':
        updateState({ editingItem: null });
        updateModalState({ showCreateCategoryModal: true });
        // You could pre-fill the form with type: 'EXPENSE'
        break;
      case 'addTransaction':
        updateState({ editingItem: null });
        updateModalState({ showCreateTransactionModal: true });
        break;
    }
  }, []);

  // Menu Actions
  const handleMenuAction = useCallback((action: string) => {
    switch (action) {
      case 'edit':
        updateModalState({ showEditBudgetModal: true });
        break;
      case 'duplicate':
        // Handle budget duplication
        break;
      case 'archive':
        // Handle budget archiving
        break;
      case 'delete':
        // Handle budget deletion
        break;
    }
    updateModalState({ showActionsMenu: false });
  }, []);

  // Loading States
  if (budgetLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Error States
  if (budgetError || !budget) {
    return (
      <div className="space-y-4">
        <Alert 
          type="error" 
          title="Budget Not Found"
          description="The budget you're looking for doesn't exist or you don't have access to it."
          children={null}
        />
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
      <BudgetHeader
        budget={budget}
        onEdit={() => updateModalState({ showEditBudgetModal: true })}
        onQuickAction={handleQuickAction}
        formatCurrency={formatCurrency}
      >
        <BudgetActionsMenu
          budget={budget}
          isOpen={state.modalState.showActionsMenu}
          onToggle={() => updateModalState({ 
            showActionsMenu: !state.modalState.showActionsMenu 
          })}
          onAction={handleMenuAction}
        />
      </BudgetHeader>

      {/* Tabs */}
      <BudgetTabs
        activeTab={state.activeTab}
        onTabChange={(tab) => updateState({ activeTab: tab as ActiveTab })}
        summary={summary}
        categoriesCount={(categoriesData?.income?.length || 0) + (categoriesData?.expense?.length || 0)}
        transactionsCount={transactionsResponse?.pagination?.total || 0}
      />

      {/* Tab Content */}
      {state.activeTab === TABS.OVERVIEW && (
        <BudgetOverviewTab
          categoriesData={categoriesData}
          formatCurrency={formatCurrency}
          onQuickAction={handleQuickAction}
        />
      )}

      {state.activeTab === TABS.CATEGORIES && (
        <CategoriesTab
          categoriesData={categoriesData}
          filters={state.filters.categories}
          onFiltersChange={(filters) => updateFilters('categories', filters)}
          onCategoryAction={handleCategoryAction}
          formatCurrency={formatCurrency}
          isLoading={categoriesLoading}
        />
      )}

      {state.activeTab === TABS.TRANSACTIONS && (
        <TransactionsTab
          transactions={transactionsResponse?.data || []}
          categoriesData={categoriesData}
          filters={state.filters.transactions}
          onFiltersChange={(filters) => updateFilters('transactions', filters)}
          onTransactionAction={handleTransactionAction}
          formatCurrency={formatCurrency}
          isLoading={transactionsLoading}
          pagination={
            transactionsResponse?.pagination
              ? {
                  ...transactionsResponse.pagination,
                  hasNext:
                    typeof transactionsResponse.pagination.page === 'number' &&
                    typeof transactionsResponse.pagination.totalPages === 'number'
                      ? transactionsResponse.pagination.page < transactionsResponse.pagination.totalPages
                      : false,
                  hasPrev:
                    typeof transactionsResponse.pagination.page === 'number'
                      ? transactionsResponse.pagination.page > 1
                      : false,
                }
              : undefined
          }
        />
      )}

      {/* All Modals */}
      <BudgetModals
        budget={budget}
        categoriesData={categoriesData}
        modalState={state.modalState}
        editingItem={state.editingItem}
        onClose={handleCloseModal}
        onSubmit={async (type: string, data: any) => {
          if (type === 'category') {
            await handleCategorySubmit(data);
          } else if (type === 'transaction') {
            await handleTransactionSubmit(data);
          }
        }}
        formatCurrency={formatCurrency}
      />

      {/* Delete Confirmation Modal */}
      {state.deleteConfirmation.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Confirm Deletion
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this {state.deleteConfirmation.type}? 
              This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <Button 
                variant="secondary" 
                onClick={handleCloseDeleteConfirmation}
              >
                Cancel
              </Button>
              <Button 
                variant="danger" 
                onClick={() => state.deleteConfirmation.onConfirm?.()}
                disabled={deleteTransactionMutation.isPending || deleteCategoryMutation.isPending}
              >
                {(deleteTransactionMutation.isPending || deleteCategoryMutation.isPending) 
                  ? 'Deleting...' 
                  : 'Delete'
                }
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetDetailsPage;