import React, { useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

// API Hooks
import { 
  useBudget, 
  useBudgetSummary, 
  useBudgetCategories, 
  useTransactions,
  useUpdateBudget,
  useDuplicateBudget, 
  useDeleteBudget,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  // ADDED: Transaction API hooks
  useCreateTransaction,
  useUpdateTransaction,
  useDeleteTransaction,
} from '../../hooks/useApi';

// Context & Hooks
import { useAuth } from '../../contexts/AuthContext';
import { useFormatCurrency, useToast } from '../../hooks/common';

// UI Components
import { Button, Alert, LoadingSpinner, Badge, DeleteConfirmModal, ArchiveConfirmModal } from '../../components/ui';

// Modal Components
import { 
  BudgetFormModal, 
  CategoryFormModal,
  TransactionFormModal  // ADDED: Import TransactionFormModal
} from '../../components/modals';
import { DuplicateBudgetModal } from '../../components/modals/DuplicateBudgetModal';

// Feature Components
import { BudgetActionsMenu, BudgetOverviewTab, BudgetTabs, BudgetTransactionsTab, BudgetDetailsHeader } from '../../components/features/budget';
import { BudgetCategoriesTab } from '../../components/features/budget/BudgetCategoriesTab';

// Types
import { 
  Transaction, 
  BudgetCategory, 
  Budget,
  CreateBudgetForm,
  CreateCategoryForm,
  CreateTransactionForm,  // ADDED: Import CreateTransactionForm
  DuplicateBudgetOptions,
} from '../../types';

// Constants - defined to match BudgetTabs ActiveTab type
const TABS = {
  OVERVIEW: 'overview' as const,
  CATEGORIES: 'categories' as const, 
  TRANSACTIONS: 'transactions' as const
} as const;

type ActiveTab = 'overview' | 'categories' | 'transactions';

interface BudgetDetailsState {
  activeTab: ActiveTab;
  currentPage: number;
  modalState: {
    showCreateCategoryModal: boolean;
    showEditCategoryModal: boolean;
    showCreateTransactionModal: boolean;
    showEditTransactionModal: boolean;
    showDeleteConfirmModal: boolean;
    showActionsMenu: boolean;
    showEditBudgetModal: boolean;
    showDuplicateModal: boolean;
    showArchiveModal: boolean;
    showDeleteModal: boolean;
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

  // State management
  const [state, setState] = useState<BudgetDetailsState>({
    activeTab: 'overview',
    currentPage: 1,
    modalState: {
      showCreateCategoryModal: false,
      showEditCategoryModal: false,
      showCreateTransactionModal: false,
      showEditTransactionModal: false,
      showDeleteConfirmModal: false,
      showActionsMenu: false,
      showEditBudgetModal: false,
      showDuplicateModal: false,
      showArchiveModal: false,
      showDeleteModal: false,
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

  // ADDED: Track preselected type for transaction modals
  const [preselectedType, setPreselectedType] = useState<'INCOME' | 'EXPENSE' | undefined>(undefined);

  // API queries (MOVED TO TOP - BEFORE ALL CALLBACKS)
  const { data: budget, isLoading: budgetLoading, error: budgetError } = useBudget(budgetId!);
  const { data: summary, isLoading: summaryLoading } = useBudgetSummary(budgetId!);
  const { data: categoriesData, isLoading: categoriesLoading } = useBudgetCategories(budgetId!);
  
  const transactionsParams = useMemo(() => ({
    budgetId: budgetId!,
    page: state.currentPage,
    limit: 1000,
    ...state.filters.transactions,
  }), [budgetId, state.currentPage, state.filters.transactions]);
  
  const { data: transactionsResponse, isLoading: transactionsLoading } = useTransactions(transactionsParams);

  // API mutations (MOVED TO TOP - BEFORE ALL CALLBACKS)
  const updateBudgetMutation = useUpdateBudget();
  const duplicateBudgetMutation = useDuplicateBudget();
  const deleteBudgetMutation = useDeleteBudget();
  const createCategoryMutation = useCreateCategory();
  const updateCategoryMutation = useUpdateCategory();
  const deleteCategoryMutation = useDeleteCategory();
  const createTransactionMutation = useCreateTransaction();
  const updateTransactionMutation = useUpdateTransaction();
  const deleteTransactionMutation = useDeleteTransaction();

  // Get all categories for modals
  const allCategories = useMemo(() => {
    if (!categoriesData) return [];
    return [...(categoriesData.income || []), ...(categoriesData.expense || [])];
  }, [categoriesData]);

  // Helper functions for state updates
  const updateState = useCallback((updates: Partial<BudgetDetailsState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const updateModalState = useCallback((updates: Partial<BudgetDetailsState['modalState']>) => {
    setState(prev => ({ 
      ...prev, 
      modalState: { ...prev.modalState, ...updates } 
    }));
  }, []);

  const updateFilters = useCallback((filterType: keyof BudgetDetailsState['filters'], updates: any) => {
    setState(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        [filterType]: { ...prev.filters[filterType], ...updates }
      }
    }));
  }, []);

  const setEditingItem = useCallback((item: Transaction | BudgetCategory | null) => {
    setState(prev => ({ ...prev, editingItem: item }));
  }, []);

  // Share Budget Handler
  const handleShareBudget = useCallback(async () => {
    try {
      if (navigator.share && budget) {
        await navigator.share({
          title: `Budget: ${budget.name}`,
          text: budget.description || `Check out my ${budget.name} budget`,
          url: window.location.href,
        });
        showSuccess('Budget shared successfully');
      } else {
        // Fallback to clipboard
        navigator.clipboard.writeText(window.location.href);
        showSuccess('Budget link copied to clipboard');
      }
    } catch (error) {
      console.error('Share error:', error);
      showError('Failed to share budget');
    }
  }, [budget, showSuccess, showError]);

  // Export Budget Handler
  const handleExportBudget = useCallback(async () => {
    try {
      // Create budget data export
      const exportData = {
        budget,
        summary,
        categories: allCategories,
        transactions: transactionsResponse?.data || [],
        exportedAt: new Date().toISOString(),
      };
      
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const url = window.URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `budget-${budget?.name.toLowerCase().replace(/\s+/g, '-')}-${format(new Date(), 'yyyy-MM-dd')}.json`;
      link.click();
      
      window.URL.revokeObjectURL(url);
      showSuccess('Budget exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      showError('Failed to export budget');
    }
  }, [budget, summary, allCategories, transactionsResponse, showSuccess, showError]);

  // Menu Actions Handler (ADDED SHARE AND EXPORT HANDLING)
  const handleMenuAction = useCallback((action: string) => {
    switch (action) {
      case 'edit':
        updateModalState({ showEditBudgetModal: true });
        break;
      case 'duplicate':
        updateModalState({ showDuplicateModal: true });
        break;
      case 'archive':
        updateModalState({ showArchiveModal: true });
        break;
      case 'delete':
        updateModalState({ showDeleteModal: true });
        break;
      case 'export':
        handleExportBudget();
        break;
      case 'share':
        handleShareBudget();
        break;
      default:
        console.warn('Unknown menu action:', action);
    }
    updateModalState({ showActionsMenu: false });
  }, [updateModalState, handleExportBudget, handleShareBudget]);

  // Quick Action Handler
  const handleQuickAction = useCallback((action: string, type?: string) => {
    switch (action) {
      case 'addIncome':
        setEditingItem(null);
        setPreselectedType('INCOME');
        updateModalState({ showCreateCategoryModal: true });
        break;
      case 'addExpense':
        setEditingItem(null);
        setPreselectedType('EXPENSE');
        updateModalState({ showCreateCategoryModal: true });
        break;
      case 'addTransaction':
        setEditingItem(null);
        setPreselectedType(undefined);
        updateModalState({ showCreateTransactionModal: true });
        break;
      default:
        console.warn('Unknown quick action:', action);
    }
  }, [setEditingItem, setPreselectedType, updateModalState]);

  // Category Actions Handler
  const handleCategoryAction = useCallback((action: string, category?: BudgetCategory, data?: any) => {
    switch (action) {
      case 'create':
        setEditingItem(null);
        setPreselectedType(data?.type || data?.preselectedType);
        updateModalState({ showCreateCategoryModal: true });
        break;
      case 'edit':
        if (category) {
          setEditingItem(category);
          setPreselectedType(undefined);
          updateModalState({ showEditCategoryModal: true });
        }
        break;
      case 'delete':
        if (category) {
          setEditingItem(category);
          updateModalState({ showDeleteConfirmModal: true });
        }
        break;
      default:
        console.warn('Unknown category action:', action);
    }
  }, [setEditingItem, setPreselectedType, updateModalState]);

  // ADDED: Transaction Delete Handler (MOVED BEFORE handleTransactionAction)
  const handleTransactionDelete = useCallback(async (transactionId: string) => {
    try {
      await deleteTransactionMutation.mutateAsync(transactionId);
      showSuccess('Transaction deleted successfully');
      setState(prev => ({
        ...prev,
        deleteConfirmation: {
          isOpen: false,
          type: null,
          item: null,
          onConfirm: null,
        }
      }));
    } catch (error) {
      showError('Failed to delete transaction');
    }
  }, [deleteTransactionMutation, showSuccess, showError]);

  // ADDED: Transaction Actions Handler
  const handleTransactionAction = useCallback((action: string, transaction?: Transaction, data?: any) => {
    switch (action) {
      case 'create':
        setEditingItem(null);
        setPreselectedType(data?.type);
        updateModalState({ showCreateTransactionModal: true });
        break;
      case 'edit':
        if (transaction) {
          setEditingItem(transaction);
          setPreselectedType(undefined);
          updateModalState({ showEditTransactionModal: true });
        }
        break;
      case 'delete':
        if (transaction) {
          setEditingItem(transaction);
          setState(prev => ({
            ...prev,
            deleteConfirmation: {
              isOpen: true,
              type: 'transaction',
              item: transaction,
              onConfirm: () => handleTransactionDelete(transaction.id),
            }
          }));
        }
        break;
      default:
        console.warn('Unknown transaction action:', action);
    }
  }, [setEditingItem, setPreselectedType, updateModalState, handleTransactionDelete]);

  // Category Form Submit Handler
  const handleCategorySubmit = useCallback(async (formData: CreateCategoryForm) => {
    try {
      if (state.editingItem && 'id' in state.editingItem) {
        // Update existing category
        await updateCategoryMutation.mutateAsync({
          id: state.editingItem.id,
          data: formData
        });
        showSuccess('Category updated successfully');
      } else {
        // Create new category
        await createCategoryMutation.mutateAsync(formData);
        showSuccess('Category created successfully');
      }
      
      updateModalState({ 
        showCreateCategoryModal: false, 
        showEditCategoryModal: false 
      });
      setEditingItem(null);
      setPreselectedType(undefined);
    } catch (error) {
      const action = state.editingItem ? 'update' : 'create';
      showError(`Failed to ${action} category`);
    }
  }, [
    state.editingItem, 
    createCategoryMutation, 
    updateCategoryMutation, 
    showSuccess, 
    showError, 
    updateModalState, 
    setEditingItem,
    setPreselectedType
  ]);

  // ADDED: Transaction Form Submit Handler
  const handleTransactionSubmit = useCallback(async (formData: CreateTransactionForm) => {
    try {
      if (state.editingItem && 'id' in state.editingItem) {
        // Update existing transaction
        await updateTransactionMutation.mutateAsync({
          id: state.editingItem.id,
          data: formData
        });
        showSuccess('Transaction updated successfully');
      } else {
        // Create new transaction
        await createTransactionMutation.mutateAsync(formData);
        showSuccess('Transaction created successfully');
      }
      
      updateModalState({ 
        showCreateTransactionModal: false, 
        showEditTransactionModal: false 
      });
      setEditingItem(null);
      setPreselectedType(undefined);
    } catch (error) {
      const action = state.editingItem ? 'update' : 'create';
      showError(`Failed to ${action} transaction`);
    }
  }, [
    state.editingItem, 
    createTransactionMutation, 
    updateTransactionMutation, 
    showSuccess, 
    showError, 
    updateModalState, 
    setEditingItem,
    setPreselectedType
  ]);

  // Category Delete Handler
  const handleCategoryDelete = useCallback(async () => {
    if (state.editingItem && 'id' in state.editingItem) {
      try {
        await deleteCategoryMutation.mutateAsync(state.editingItem.id);
        showSuccess('Category deleted successfully');
        updateModalState({ showDeleteConfirmModal: false });
        setEditingItem(null);
      } catch (error) {
        showError('Failed to delete category');
      }
    }
  }, [state.editingItem, deleteCategoryMutation, showSuccess, showError, updateModalState, setEditingItem]);

  // Budget Form Submit Handler
  const handleBudgetSubmit = useCallback(async (data: CreateBudgetForm) => {
    try {
      await updateBudgetMutation.mutateAsync({
        id: budgetId!,
        data
      });
      showSuccess('Budget updated successfully');
      updateModalState({ showEditBudgetModal: false });
    } catch (error) {
      showError('Failed to update budget');
    }
  }, [updateBudgetMutation, budgetId, showSuccess, showError, updateModalState]);

  // Close Modal Handler
  const handleCloseModal = useCallback(() => {
    updateModalState({ 
      showEditBudgetModal: false,
      showDuplicateModal: false,
      showArchiveModal: false,
      showDeleteModal: false,
      showCreateCategoryModal: false,
      showEditCategoryModal: false,
      showDeleteConfirmModal: false,
      showCreateTransactionModal: false,
      showEditTransactionModal: false,
    });
    setEditingItem(null);
    setPreselectedType(undefined);
    setState(prev => ({
      ...prev,
      deleteConfirmation: {
        isOpen: false,
        type: null,
        item: null,
        onConfirm: null,
      }
    }));
  }, [updateModalState, setEditingItem, setPreselectedType]);

  // Duplicate Budget Handler
  const handleDuplicateBudget = useCallback(async (options: DuplicateBudgetOptions) => {
    try {
      await duplicateBudgetMutation.mutateAsync({
        budgetId: budgetId!,
        options,
      });
      showSuccess('Budget duplicated successfully');
      updateModalState({ showDuplicateModal: false });
    } catch (error) {
      showError('Failed to duplicate budget');
    }
  }, [duplicateBudgetMutation, budgetId, showSuccess, showError, updateModalState]);

  // Archive Budget Handler
  const handleArchiveBudget = useCallback(async () => {
    if (!budget) return;
    
    try {
      const action = budget.isArchived ? 'unarchive' : 'archive';
      await updateBudgetMutation.mutateAsync({
        id: budgetId!,
        data: { isArchived: !budget.isArchived },
      });
      showSuccess(`Budget ${action}d successfully`);
      updateModalState({ showArchiveModal: false });
    } catch (error) {
      const action = budget?.isArchived ? 'unarchive' : 'archive';
      showError(`Failed to ${action} budget`);
    }
  }, [budget, updateBudgetMutation, budgetId, showSuccess, showError, updateModalState]);

  // Delete Budget Handler
  const handleDeleteBudget = useCallback(async () => {
    try {
      await deleteBudgetMutation.mutateAsync(budgetId!);
      showSuccess('Budget deleted successfully');
      navigate('/budgets');
    } catch (error) {
      showError('Failed to delete budget');
      updateModalState({ showDeleteModal: false });
    }
  }, [deleteBudgetMutation, budgetId, showSuccess, showError, navigate, updateModalState]);

  // Error handling (AFTER ALL HOOKS)
  if (budgetError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Alert type="error" title="Error Loading Budget">
          {budgetError.message || 'Failed to load budget details'}
        </Alert>
      </div>
    );
  }

  // Loading state (AFTER ALL HOOKS)
  if (budgetLoading || !budget) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <BudgetDetailsHeader
        budget={budget}
        onEdit={() => updateModalState({ showEditBudgetModal: true })}
        onQuickAction={handleQuickAction}
        formatCurrency={formatCurrency}
      >
        <BudgetActionsMenu
          budget={budget}
          onAction={handleMenuAction}
          isOpen={state.modalState.showActionsMenu}
          onToggle={() => updateModalState({ 
            showActionsMenu: !state.modalState.showActionsMenu 
          })}
        />
      </BudgetDetailsHeader>

      {/* Main Content */}
      <div className="pb-16">
        {/* Content with same container structure as header */}
        <div className="max-w-7xl mx-auto">
          <div className="space-y-6">
            {/* Tabs */}
            <BudgetTabs
              activeTab={state.activeTab}
              onTabChange={(tab) => updateState({ activeTab: tab })}
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
              <BudgetCategoriesTab
                categoriesData={categoriesData}
                filters={state.filters.categories}
                onFiltersChange={(filters) => updateFilters('categories', filters)}
                onCategoryAction={handleCategoryAction}
                formatCurrency={formatCurrency}
                isLoading={categoriesLoading}
              />
            )}

            {state.activeTab === TABS.TRANSACTIONS && (
              <BudgetTransactionsTab
                transactions={transactionsResponse?.data || []}
                categoriesData={categoriesData}
                filters={state.filters.transactions}
                onFiltersChange={(filters) => updateFilters('transactions', filters)}
                onTransactionAction={handleTransactionAction}
                formatCurrency={formatCurrency}
                isLoading={transactionsLoading}
              />
            )}
          </div>
        </div>
      </div>

      {/* ALL MODALS */}
      
      {/* Budget Edit Modal */}
      <BudgetFormModal
        isOpen={state.modalState.showEditBudgetModal}
        onClose={handleCloseModal}
        onSubmit={handleBudgetSubmit}
        editingBudget={budget}
        isLoading={updateBudgetMutation.isPending}
      />

      {/* Category Create Modal */}
      <CategoryFormModal
        isOpen={state.modalState.showCreateCategoryModal}
        onClose={handleCloseModal}
        onSubmit={handleCategorySubmit}
        budgetId={budgetId!}
        preselectedType={preselectedType}
        isLoading={createCategoryMutation.isPending}
      />

      {/* Category Edit Modal */}
      <CategoryFormModal
        isOpen={state.modalState.showEditCategoryModal}
        onClose={handleCloseModal}
        onSubmit={handleCategorySubmit}
        editingCategory={state.editingItem as BudgetCategory}
        budgetId={budgetId!}
        isLoading={updateCategoryMutation.isPending}
      />

      {/* Category Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={state.modalState.showDeleteConfirmModal}
        onClose={handleCloseModal}
        onConfirm={handleCategoryDelete}
        itemName={(state.editingItem as BudgetCategory)?.name || ''}
        itemType="category"
        isLoading={deleteCategoryMutation.isPending}
        warningText="All transactions in this category will be moved to 'Uncategorized'."
      />

      {/* ADDED: Transaction Create Modal */}
      <TransactionFormModal
        isOpen={state.modalState.showCreateTransactionModal}
        onClose={handleCloseModal}
        onSubmit={handleTransactionSubmit}
        budgetId={budgetId!}
        categories={allCategories}
        preselectedType={preselectedType}
        isLoading={createTransactionMutation.isPending}
      />

      {/* ADDED: Transaction Edit Modal */}
      <TransactionFormModal
        isOpen={state.modalState.showEditTransactionModal}
        onClose={handleCloseModal}
        onSubmit={handleTransactionSubmit}
        editingTransaction={state.editingItem as Transaction}
        budgetId={budgetId!}
        categories={allCategories}
        isLoading={updateTransactionMutation.isPending}
      />

      {/* ADDED: Transaction Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={state.deleteConfirmation.isOpen && state.deleteConfirmation.type === 'transaction'}
        onClose={handleCloseModal}
        onConfirm={state.deleteConfirmation.onConfirm || (() => {})}
        itemName={(state.deleteConfirmation.item as Transaction)?.description || ''}
        itemType="transaction"
        isLoading={deleteTransactionMutation.isPending}
      />

      {/* Duplicate Budget Modal */}
      <DuplicateBudgetModal
        isOpen={state.modalState.showDuplicateModal}
        onClose={handleCloseModal}
        budget={budget}
        onDuplicate={handleDuplicateBudget}
        isLoading={duplicateBudgetMutation.isPending}
      />

      {/* Archive Budget Modal */}
      <ArchiveConfirmModal
        isOpen={state.modalState.showArchiveModal}
        onClose={handleCloseModal}
        onConfirm={handleArchiveBudget}
        itemName={budget?.name || ''}
        itemType="budget"
        isArchived={budget?.isArchived || false}
        isLoading={updateBudgetMutation.isPending}
      />

      {/* Delete Budget Modal */}
      <DeleteConfirmModal
        isOpen={state.modalState.showDeleteModal}
        onClose={handleCloseModal}
        onConfirm={handleDeleteBudget}
        itemName={budget?.name || ''}
        itemType="budget"
        isLoading={deleteBudgetMutation.isPending}
        warningText="All categories and transactions in this budget will also be deleted."
      />
    </div>
  );
};

export default BudgetDetailsPage;